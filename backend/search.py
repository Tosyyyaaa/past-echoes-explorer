from __future__ import annotations

import json
from dataclasses import dataclass
from typing import List, Optional

import httpx

from .article import fetch_article_from_url
from .openai_client import call_openai_json
from .perplexity_client import call_perplexity_json
from .schemas import Article
from .utils import parse_json_payload, strip_code_fence


@dataclass
class ArticleSelection:
    url: str
    title: Optional[str]
    reason: Optional[str]
    alternatives: List[str]


async def discover_article_from_query(
    query: str,
    *,
    client: httpx.AsyncClient,
    openai_model: str = "gpt-4.1-mini",
    perplexity_model: str = "sonar",
) -> tuple[Article, ArticleSelection]:
    candidates = await _fetch_candidates(query, client=client, model=perplexity_model)
    if not candidates:
        raise ValueError("No articles found for the provided query.")

    selection = await _rank_candidates_with_openai(
        query, candidates, client=client, model=openai_model
    )

    urls_to_try = _build_candidate_url_list(selection, candidates)

    last_error: Optional[Exception] = None
    for url in urls_to_try:
        try:
            article = await fetch_article_from_url(url, client=client)
            if selection.title and not article.title:
                article.title = selection.title
            if url != selection.url:
                selection = ArticleSelection(
                    url=url,
                    title=article.title or selection.title,
                    reason=selection.reason,
                    alternatives=[candidate for candidate in urls_to_try if candidate != url],
                )
            return article, selection
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            continue
    raise ValueError(f"Unable to fetch article suggested by search. {last_error}")


async def _fetch_candidates(
    query: str, *, client: httpx.AsyncClient, model: str
) -> List[dict]:
    system_prompt = (
        "You are a live news discovery engine. "
        "Given a user's query, return JSON with key 'articles', an array (max 5) of news articles. "
        "Each article must contain: title, url, summary, published_at (ISO if known). "
        "Choose reputable sources from the last 5 years whenever possible. "
        "Respond strictly with JSON."
    )
    user_prompt = f"Find the most relevant journalism covering: {query}"

    response_text = await call_perplexity_json(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        client=client,
        model=model,
        temperature=0,
    )
    cleaned_response = strip_code_fence(response_text)
    try:
        parsed = parse_json_payload(cleaned_response, "Perplexity article discovery response")
    except RuntimeError as exc:
        response_text_clean = cleaned_response.strip()
        if response_text_clean.startswith("[") and response_text_clean.endswith("]"):
            try:
                parsed = {"articles": json.loads(response_text_clean)}
            except Exception as inner_exc:  # noqa: BLE001
                raise ValueError("Failed to parse article candidates from search.") from inner_exc
        else:
            block = _extract_json_block(response_text_clean)
            if block:
                try:
                    parsed = parse_json_payload(block, "Perplexity article discovery response (fallback)")
                except RuntimeError as inner_exc:  # noqa: BLE001
                    raise ValueError("Failed to parse article candidates from search.") from inner_exc
            else:
                raise ValueError("Failed to parse article candidates from search.") from exc

    articles = parsed.get("articles", [])
    return [article for article in articles if isinstance(article, dict) and article.get("url")]


async def _rank_candidates_with_openai(
    query: str,
    candidates: List[dict],
    *,
    client: httpx.AsyncClient,
    model: str,
) -> ArticleSelection:
    prompt = (
        "You are ChatGPT helping PastPort pick a single article to analyze.\n"
        f"User query: {query}\n"
        "Here is a JSON array of candidate articles from live search:\n"
        f"{json.dumps(candidates, ensure_ascii=False)}\n\n"
        "Choose the single most relevant article. Respond ONLY with JSON containing:\n"
        "{\n"
        '  "articleUrl": string,\n'
        '  "title": string,\n'
        '  "reason": string,\n'
        '  "fallbackUrls": [string, ...] // optional additional candidates in priority order\n'
        "}\n"
        "You must select one of the provided URLs. If none are suitable, set articleUrl to null."
    )

    response_text = await call_openai_json(
        prompt=prompt,
        client=client,
        model=model,
        temperature=0,
        system_message=(
            "You are ChatGPT helping PastPort select a single article. Respond ONLY with JSON matching the schema."
        ),
        max_tokens=800,
    )
    data = parse_json_payload(response_text, "OpenAI article selection response")

    article_url = data.get("articleUrl")
    if not article_url:
        raise ValueError("ChatGPT could not identify a suitable article from candidates.")

    title = data.get("title")
    reason = data.get("reason")
    fallback_urls = [
        value for value in data.get("fallbackUrls", []) if isinstance(value, str) and value
    ]

    return ArticleSelection(
        url=article_url,
        title=title,
        reason=reason,
        alternatives=fallback_urls,
    )


def _build_candidate_url_list(selection: ArticleSelection, candidates: List[dict]) -> List[str]:
    seen: set[str] = set()
    ordered_urls: List[str] = []

    def append(url: Optional[str]) -> None:
        if not url:
            return
        normalized = url.strip()
        if not normalized or normalized in seen:
            return
        seen.add(normalized)
        ordered_urls.append(normalized)

    append(selection.url)
    for url in selection.alternatives:
        append(url)
    for candidate in candidates:
        append(candidate.get("url"))

    return ordered_urls


def _extract_json_block(text: str) -> Optional[str]:
    """Attempt to recover first JSON object from free-form text."""
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    candidate = text[start : end + 1]
    return candidate.strip()

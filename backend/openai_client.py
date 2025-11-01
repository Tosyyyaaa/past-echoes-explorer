from __future__ import annotations

import os
from typing import List

import httpx

from .prompts import build_narrative_prompt
from .schemas import NarrativeAnalysis, NarrativeFacet, Article
from .utils import parse_json_payload


async def _call_openai(prompt: str, *, client: httpx.AsyncClient, model: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY environment variable is missing.")

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a meticulous narrative analyst. Respond ONLY with valid JSON matching the requested schema."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "max_tokens": 1800,
    }

    response = await client.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=60,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"OpenAI API error {response.status_code}: {response.text}")

    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("OpenAI response missing choices.")

    content = choices[0]["message"]["content"]
    if not isinstance(content, str):
        raise RuntimeError("OpenAI response content is not a string.")
    return content.strip()


def _parse_narrative_facets(data: List[dict]) -> List[NarrativeFacet]:
    facets: List[NarrativeFacet] = []
    for entry in data or []:
        facets.append(
            NarrativeFacet(
                label=entry.get("label", "Untitled Facet"),
                description=entry.get("description", ""),
                supporting_quotes=entry.get("supportingQuotes") or [],
                confidence=entry.get("confidence", "medium"),
            )
        )
    return facets


async def request_narrative_analysis(
    *,
    article: Article,
    client: httpx.AsyncClient,
    model: str = "gpt-4.1-mini",
    prompt: str | None = None,
) -> NarrativeAnalysis:
    prompt_text = prompt or build_narrative_prompt(article, article.content)
    raw = await _call_openai(prompt_text, client=client, model=model)
    parsed = parse_json_payload(raw, "OpenAI narrative response")

    facets = _parse_narrative_facets(parsed.get("narrativeFacets", []))
    return NarrativeAnalysis(
        article_summary=parsed.get("articleSummary", ""),
        tone=parsed.get("tone", ""),
        emotional_cues=parsed.get("emotionalCues", []) or [],
        bias_frame=parsed.get("biasFrame", ""),
        narrative_facets=facets,
    )

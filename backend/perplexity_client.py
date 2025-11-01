from __future__ import annotations

import json
import os
from typing import List

import httpx

from .prompts import build_perplexity_prompt
from .schemas import Article, HistoricalEcho, NarrativeFacet
from .utils import parse_json_payload, strip_code_fence


async def call_perplexity_json(
    *,
    system_prompt: str,
    user_prompt: str,
    client: httpx.AsyncClient,
    model: str = "sonar",
    temperature: float = 0,
) -> str:
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        raise RuntimeError("PERPLEXITY_API_KEY environment variable is missing.")

    payload = {
        "model": model,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    response = await client.post(
        "https://api.perplexity.ai/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=60,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"Perplexity API error {response.status_code}: {response.text}")

    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("Perplexity response missing choices.")

    content = choices[0]["message"].get("content")
    if isinstance(content, list):
        text = "".join(part.get("text", "") for part in content if isinstance(part, dict))
    else:
        text = content
    if not isinstance(text, str):
        raise RuntimeError("Perplexity response content is not a string.")
    return text.strip()


def _looks_like_nested_json(item: dict) -> bool:
    for key in ("historical_event", "source_excerpt", "parallel_reasoning", "consequences_short"):
        value = item.get(key)
        if isinstance(value, str) and value.lstrip().startswith(("[", "\n")):
            return True
    return False


def _sort_and_limit(entries: List[dict], limit: int = 6) -> List[dict]:
    def resonance(entry: dict) -> float:
        try:
            return float(entry.get("resonance_score", 0.0))
        except (TypeError, ValueError):
            return 0.0

    sorted_entries = sorted(entries, key=resonance, reverse=True)
    return sorted_entries[:limit]


async def request_historical_echoes(
    *,
    article: Article,
    facet: NarrativeFacet,
    client: httpx.AsyncClient,
    model: str = "sonar",
) -> List[HistoricalEcho]:
    prompt = build_perplexity_prompt(facet, article)
    content = await call_perplexity_json(
        system_prompt=(
            "You surface historical echoes of modern narratives for PastPort. "
            "Respond as compact JSON only."
        ),
        user_prompt=prompt,
        client=client,
        model=model,
        temperature=0,
    )

    cleaned = strip_code_fence(content)
    echoes_raw = _sort_and_limit(_safe_parse_echoes(cleaned))
    return [
        HistoricalEcho(
            historical_event=item.get("historical_event", "Unknown event"),
            year=str(item.get("year", "")),
            region=item.get("region"),
            source_url=item.get("source_url", ""),
            source_excerpt=item.get("source_excerpt", ""),
            parallel_reasoning=item.get("parallel_reasoning", ""),
            consequences_short=item.get("consequences_short", ""),
            consequences_mid=item.get("consequences_mid"),
            consequences_long=item.get("consequences_long"),
            resonance_score=float(item.get("resonance_score", 0.5)),
            tags=item.get("tags") or [],
        )
        for item in echoes_raw
    ]


def _safe_parse_echoes(payload: str) -> List[dict]:
    try:
        parsed = parse_json_payload(payload, "Perplexity echoes response")
        if isinstance(parsed, list):
            return [item for item in parsed if not _looks_like_nested_json(item)]
        if isinstance(parsed, dict) and "echoes" in parsed:
            echoes = parsed["echoes"]
            if isinstance(echoes, list):
                return [item for item in echoes if not _looks_like_nested_json(item)]
        return []
    except RuntimeError:
        # Attempt to recover simple list formats separated by newlines
        stripped = payload.strip()
        if stripped.startswith("[") and stripped.endswith("]"):
            try:
                parsed_list = json.loads(stripped)
                if isinstance(parsed_list, list):
                    return [item for item in parsed_list if not _looks_like_nested_json(item)]
            except Exception:
                pass
        # fallback: heuristically wrap plain text
        return [
            {
                "historical_event": payload[:120],
                "year": "",
                "region": None,
                "source_url": "",
                "source_excerpt": payload,
                "parallel_reasoning": "",
                "consequences_short": payload,
                "consequences_mid": None,
                "consequences_long": None,
                "resonance_score": 0.3,
                "tags": [],
            }
        ]

from __future__ import annotations

import json
import os
from typing import List

import httpx

from .prompts import build_perplexity_prompt
from .schemas import Article, HistoricalEcho, NarrativeFacet
from .utils import parse_json_payload


async def request_historical_echoes(
    *,
    article: Article,
    facet: NarrativeFacet,
    client: httpx.AsyncClient,
    model: str = "sonar",
) -> List[HistoricalEcho]:
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        raise RuntimeError("PERPLEXITY_API_KEY environment variable is missing.")

    prompt = build_perplexity_prompt(facet, article)
    payload = {
        "model": model,
        "temperature": 0,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You surface historical echoes of modern narratives for PastPort. "
                    "Respond as compact JSON only."
                ),
            },
            {"role": "user", "content": prompt},
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

    content = choices[0]["message"]["content"]
    if not isinstance(content, str):
        raise RuntimeError("Perplexity response content is not a string.")

    echoes_raw = _safe_parse_echoes(content)
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
            return parsed
        if isinstance(parsed, dict) and "echoes" in parsed:
            echoes = parsed["echoes"]
            return echoes if isinstance(echoes, list) else []
        return []
    except RuntimeError:
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


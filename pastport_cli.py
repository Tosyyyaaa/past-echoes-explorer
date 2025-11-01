#!/usr/bin/env python3
"""
PastPort proof-of-concept CLI.

Given a news article URL (or raw text), the script:
1. Fetches and cleans the article body.
2. Asks OpenAI (ChatGPT) for a narrative analysis (tone, cues, facets).
3. Queries Perplexity for historical echoes tied to the extracted facets.
4. Prints a structured JSON report to the terminal.

Requirements:
  pip install httpx trafilatura python-dotenv (optional)

Environment variables:
  OPENAI_API_KEY        -> OpenAI key with access to GPT-4.1 (or compatible)
  PERPLEXITY_API_KEY    -> Perplexity API key

Usage:
  python pastport_cli.py --url "https://example.com/article"
  python pastport_cli.py --text "Paste article text here..."
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Dict, List, Optional

import httpx

try:
    import trafilatura
except ModuleNotFoundError:  # pragma: no cover - import guard
    trafilatura = None


# ----------------------------- Data Models ----------------------------- #


@dataclass
class Article:
    title: Optional[str]
    author: Optional[str]
    url: Optional[str]
    published_at: Optional[str]
    content: str


@dataclass
class NarrativeFacet:
    label: str
    description: str
    supporting_quotes: List[str] = field(default_factory=list)
    confidence: str = "medium"


@dataclass
class NarrativeAnalysis:
    article_summary: str
    tone: str
    emotional_cues: List[str]
    bias_frame: str
    narrative_facets: List[NarrativeFacet] = field(default_factory=list)


@dataclass
class HistoricalEcho:
    historical_event: str
    year: str
    region: Optional[str]
    source_url: str
    source_excerpt: str
    parallel_reasoning: str
    consequences_short: str
    consequences_mid: Optional[str]
    consequences_long: Optional[str]
    resonance_score: float
    tags: List[str] = field(default_factory=list)


@dataclass
class PastPortReport:
    generated_at: str
    article: Article
    narrative_analysis: NarrativeAnalysis
    echoes: List[HistoricalEcho] = field(default_factory=list)
    raw_prompts: Dict[str, str] = field(default_factory=dict)


# ----------------------------- Helpers ----------------------------- #


def status(message: str) -> None:
    """Emit a progress update without breaking JSON output."""
    print(f"[pastport] {message}", file=sys.stderr)


def load_env() -> None:
    """Load .env automatically when python-dotenv is available."""
    try:
        from dotenv import load_dotenv  # type: ignore

        load_dotenv()
    except ModuleNotFoundError:  # pragma: no cover - optional dependency
        pass


def ensure_dependencies() -> None:
    if trafilatura is None:
        raise RuntimeError(
            "trafilatura is required. Install dependencies with "
            "'pip install httpx trafilatura python-dotenv'."
        )


async def fetch_article(url: str, *, client: httpx.AsyncClient) -> Article:
    """Fetch article HTML and extract main content."""
    resp = await client.get(url, timeout=30)
    resp.raise_for_status()
    downloaded = trafilatura.fetch_url(url, no_ssl=True) if trafilatura else None
    if not downloaded:
        downloaded = resp.text

    metadata = trafilatura.extract_metadata(downloaded) if trafilatura else None
    extracted = trafilatura.extract(downloaded, include_formatting=False) if trafilatura else None

    if not extracted or extracted.strip() == "":
        raise ValueError("Failed to extract article text. Try providing --text manually.")

    return Article(
        title=(metadata.title if metadata else None),
        author=(metadata.author if metadata else None),
        url=url,
        published_at=(metadata.date if metadata else None),
        content=extracted.strip(),
    )


async def openai_chat(prompt: str, *, client: httpx.AsyncClient, model: str = "gpt-4.1-mini") -> str:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise RuntimeError("OPENAI_API_KEY environment variable is missing.")

    payload: Dict[str, object] = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a meticulous narrative analyst that always replies with strict JSON. "
                    "Never include extra commentary outside the JSON object."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "max_tokens": 1800,
    }

    resp = await client.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json=payload,
        timeout=60,
    )
    if resp.status_code >= 400:
        raise RuntimeError(f"OpenAI API error {resp.status_code}: {resp.text}")
    data = resp.json()
    choices = data.get("choices", [])
    if not choices:
        raise RuntimeError("OpenAI response missing choices.")
    content = choices[0]["message"]["content"]
    if not isinstance(content, str):
        raise RuntimeError("OpenAI response content is not a string.")
    return content.strip()


async def perplexity_chat(prompt: str, *, client: httpx.AsyncClient) -> str:
    key = os.getenv("PERPLEXITY_API_KEY")
    if not key:
        raise RuntimeError("PERPLEXITY_API_KEY environment variable is missing.")

    payload = {
        "model": "sonar",
        "temperature": 0,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are PastPort, an analyst who surfaces historical echoes of modern narratives. "
                    "Return concise JSON highlighting the best precedents with outcomes. Avoid speculation."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    }

    resp = await client.post(
        "https://api.perplexity.ai/chat/completions",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=60,
    )
    if resp.status_code >= 400:
        raise RuntimeError(
            f"Perplexity API error {resp.status_code} for model 'sonar': {resp.text}"
        )

    data = resp.json()
    choices = data.get("choices", [])
    if not choices:
        raise RuntimeError("Perplexity response missing choices.")
    content = choices[0]["message"]["content"]
    if not isinstance(content, str):
        raise RuntimeError("Perplexity response content is not a string.")
    return content.strip()


def build_narrative_prompt(article: Article | None, article_text: str) -> str:
    heading = article.title or "Untitled Article"
    return (
        "You are a narrative analyst for PastPort. "
        "Identify the rhetoric without inferring partisan leanings. "
        "Return JSON with keys: articleSummary, tone, emotionalCues (array), "
        "biasFrame, narrativeFacets (array objects with label, description, supportingQuotes, confidence).\n"
        f"Article Title: {heading}\n"
        f"Author: {article.author or 'Unknown'}\n"
        "Article Body:\n"
        f"{article_text.strip()}\n"
        "Respond ONLY with JSON."
    )


def build_perplexity_prompt(facet: NarrativeFacet, article: Article | None) -> str:
    title = article.title or "the current article"
    return (
        f"Current article titled '{title}' presents the facet '{facet.label}'. "
        f"Facet summary: {facet.description}. Supporting quotes: {', '.join(facet.supporting_quotes)}.\n"
        "Find up to 3 well-documented historical precedents where similar rhetoric, tactics, or framing occurred. "
        "Return JSON array with fields: historical_event, year, region, source_url, source_excerpt, "
        "parallel_reasoning, consequences_short, consequences_mid, consequences_long, resonance_score (0-1), "
        "tags (array of short descriptors).\n"
        "Only include examples with cited primary or reputable secondary sources. Avoid duplicates."
    )


def parse_json_payload(payload: str, context: str) -> Dict:
    try:
        return json.loads(payload)
    except json.JSONDecodeError as exc:  # pragma: no cover - defensive
        raise RuntimeError(f"Failed to parse JSON from {context}: {exc}\nPayload: {payload[:4000]}")


def parse_narrative_response(raw: Dict) -> NarrativeAnalysis:
    facets_raw = raw.get("narrativeFacets", [])
    facets: List[NarrativeFacet] = []
    for facet in facets_raw:
        facets.append(
            NarrativeFacet(
                label=facet.get("label", "Untitled Facet"),
                description=facet.get("description", ""),
                supporting_quotes=facet.get("supportingQuotes", []) or [],
                confidence=facet.get("confidence", "medium"),
            )
        )
    return NarrativeAnalysis(
        article_summary=raw.get("articleSummary", ""),
        tone=raw.get("tone", ""),
        emotional_cues=raw.get("emotionalCues", []) or [],
        bias_frame=raw.get("biasFrame", ""),
        narrative_facets=facets,
    )


def parse_echoes_response(raw: object) -> List[HistoricalEcho]:
    echoes: List[HistoricalEcho] = []
    if isinstance(raw, list):
        candidates = raw
    elif isinstance(raw, dict) and "echoes" in raw:
        candidates = raw["echoes"]
    else:
        return echoes

    for item in candidates:
        try:
            echoes.append(
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
            )
        except Exception:  # pragma: no cover - tolerate malformed entries
            continue
    return echoes


def render_report(report: PastPortReport) -> None:
    print(json.dumps(asdict(report), indent=2, ensure_ascii=False))


# ----------------------------- Main Pipeline ----------------------------- #


async def generate_report(url: Optional[str], text: Optional[str]) -> PastPortReport:
    ensure_dependencies()
    load_env()

    async with httpx.AsyncClient() as client:
        article: Optional[Article] = None
        article_text = (text or "").strip()

        if url:
            status(f"Fetching article from {url} ...")
            article = await fetch_article(url, client=client)
            status("Article fetched and cleaned.")
            article_text = article.content
        elif not article_text:
            raise ValueError("Provide either --url or --text.")
        else:
            status("Using provided article text.")

        status("Requesting narrative analysis from OpenAI ...")
        narrative_prompt = build_narrative_prompt(article, article_text)
        narrative_raw = await openai_chat(narrative_prompt, client=client)
        narrative_data = parse_json_payload(narrative_raw, "OpenAI narrative response")
        narrative = parse_narrative_response(narrative_data)
        status(
            f"Received narrative analysis with {len(narrative.narrative_facets)} facet(s)."
        )

        echoes: List[HistoricalEcho] = []
        for facet in narrative.narrative_facets:
            status(f"Querying Perplexity (sonar) for echoes of '{facet.label}' ...")
            prompt = build_perplexity_prompt(facet, article)
            raw = await perplexity_chat(prompt, client=client)
            try:
                parsed = parse_json_payload(raw, "Perplexity echoes response")
            except RuntimeError:
                # If Perplexity returns plain text, wrap it in a single entry.
                parsed = [{"historical_event": raw[:120], "year": "", "region": None, "source_url": "", "source_excerpt": raw, "parallel_reasoning": "", "consequences_short": raw, "consequences_mid": None, "consequences_long": None, "resonance_score": 0.3, "tags": []}]
            echoes.extend(parse_echoes_response(parsed))

        status(f"Collected {len(echoes)} historical echo(es).")

        report = PastPortReport(
            generated_at=datetime.utcnow().isoformat() + "Z",
            article=article
            if article
            else Article(title=None, author=None, url=None, published_at=None, content=article_text),
            narrative_analysis=narrative,
            echoes=echoes,
            raw_prompts={
                "narrative_prompt": narrative_prompt,
                "facet_count": str(len(narrative.narrative_facets)),
            },
        )
        return report


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="PastPort CLI proof-of-concept.")
    parser.add_argument("--url", help="News article URL to analyze.")
    parser.add_argument("--text", help="Raw article text (fallback when URL extraction fails).")
    return parser.parse_args(argv)


def main(argv: List[str]) -> None:
    args = parse_args(argv)
    try:
        report = asyncio.run(generate_report(args.url, args.text))
    except Exception as exc:  # pragma: no cover - CLI guard
        print(f"[error] {exc}", file=sys.stderr)
        sys.exit(1)
    render_report(report)


if __name__ == "__main__":
    main(sys.argv[1:])

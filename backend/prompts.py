from __future__ import annotations

from typing import Optional

from .schemas import Article, NarrativeFacet


def build_narrative_prompt(article: Optional[Article], article_text: str) -> str:
    heading = article.title if article and article.title else "Untitled Article"
    author = article.author if article and article.author else "Unknown"
    return (
        "You are a narrative analyst for PastPort. "
        "Keep answers extremely concise (max two sentences per field). "
        "Avoid flowery language. "
        "Return JSON with keys: "
        "articleSummary (<=160 chars), tone (<=3 words), emotionalCues (max 4 entries), "
        "biasFrame (<=160 chars), narrativeFacets (array up to 3 items, each with label <=4 words, "
        "description <=140 chars, supportingQuotes max 1 short quote, confidence).\n"
        f"Article Title: {heading}\n"
        f"Author: {author}\n"
        "Article Body:\n"
        f"{article_text.strip()}\n"
        "Respond with JSON only."
    )


def build_perplexity_prompt(facet: NarrativeFacet, article: Optional[Article]) -> str:
    title = article.title if article and article.title else "the current article"
    quotes = ", ".join(facet.supporting_quotes) if facet.supporting_quotes else "N/A"
    return (
        f"In '{title}', the narrative facet '{facet.label}' is described as: {facet.description}. "
        f"Supporting quotes: {quotes}.\n"
        "Find up to three historically documented events where similar rhetoric/tactics appeared. "
        "Return JSON array with entries containing: historical_event, year, region, source_url, "
        "source_excerpt, parallel_reasoning, consequences_short, consequences_mid, consequences_long, "
        "resonance_score (0-1), tags (array). "
        "Only include well-sourced examples with citations."
    )

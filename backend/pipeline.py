from __future__ import annotations

from datetime import datetime
from typing import Callable, Optional

import httpx

from .article import resolve_article
from .openai_client import request_narrative_analysis
from .perplexity_client import request_historical_echoes
from .prompts import build_narrative_prompt
from .schemas import AnalysisMeta, AnalysisResult, HistoricalEcho


async def run_analysis(
    *,
    article_url: Optional[str] = None,
    article_text: Optional[str] = None,
    openai_model: str = "gpt-4.1-mini",
    perplexity_model: str = "sonar",
    progress_callback: Optional[Callable[[str], None]] = None,
) -> AnalysisResult:
    def notify(message: str) -> None:
        if progress_callback:
            progress_callback(message)

    async with httpx.AsyncClient() as client:
        article = await resolve_article(
            client=client, article_url=article_url, article_text=article_text
        )
        notify("Article loaded and prepared.")

        narrative_prompt = build_narrative_prompt(article, article.content)
        notify("Requesting narrative analysis from OpenAI ...")
        narrative = await request_narrative_analysis(
            article=article,
            client=client,
            model=openai_model,
            prompt=narrative_prompt,
        )
        notify(
            f"Received narrative analysis with {len(narrative.narrative_facets)} facet(s)."
        )

        echoes: list[HistoricalEcho] = []
        for facet in narrative.narrative_facets:
            notify(f"Fetching historical echoes for facet '{facet.label}' via Perplexity ...")
            awaitable = request_historical_echoes(
                article=article,
                facet=facet,
                client=client,
                model=perplexity_model,
            )
            facet_echoes = await awaitable
            echoes.extend(facet_echoes)
        notify(f"Collected {len(echoes)} historical echo(es).")

        meta = AnalysisMeta(
            generated_at=datetime.utcnow(),
            openai_model=openai_model,
            perplexity_model=perplexity_model,
        )

        raw_prompts = {
            "narrative_prompt": narrative_prompt,
            "facet_count": str(len(narrative.narrative_facets)),
        }

        return AnalysisResult(
            article=article,
            narrative_analysis=narrative,
            echoes=echoes,
            meta=meta,
            raw_prompts=raw_prompts,
        )

#!/usr/bin/env python3
"""
PastPort CLI proof-of-concept.

Fetches a news article (or uses supplied text), runs the PastPort analysis
pipeline (OpenAI for narrative analysis + Perplexity for historical echoes),
and prints a structured JSON report to stdout.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from typing import Optional

from backend.pipeline import run_analysis
from backend.storage import save_analysis_result


def status(message: str) -> None:
    """Emit a progress update without corrupting stdout JSON."""
    print(f"[pastport] {message}", file=sys.stderr)


def load_env() -> None:
    """Load environment variables from .env when python-dotenv is available."""
    try:
        from dotenv import load_dotenv  # type: ignore

        load_dotenv()
    except ModuleNotFoundError:
        pass


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="PastPort CLI proof-of-concept.")
    parser.add_argument("--url", help="Article URL to analyze.")
    parser.add_argument("--text", help="Raw article text (fallback when URL extraction fails).")
    parser.add_argument("--search", help="Search query to locate a relevant article.")
    return parser.parse_args(argv)


async def generate_report(article_url: Optional[str], article_text: Optional[str], search_query: Optional[str]):
    result = await run_analysis(
        article_url=article_url,
        article_text=article_text,
        search_query=search_query,
        progress_callback=status,
    )
    return result


def main(argv: list[str]) -> None:
    args = parse_args(argv)
    if not args.url and not args.text and not args.search:
        print("Provide --url, --text, or --search.", file=sys.stderr)
        sys.exit(1)

    load_env()

    output_file: str | None = None
    try:
        analysis = asyncio.run(generate_report(args.url, args.text, args.search))
        output_file = save_analysis_result(analysis)
        analysis.meta.output_file = output_file
    except Exception as exc:  # pragma: no cover - CLI guardrail
        print(f"[error] {exc}", file=sys.stderr)
        sys.exit(1)

    print(json.dumps(analysis.model_dump(mode="json"), indent=2, ensure_ascii=False))
    if output_file:
        print(f"[pastport] Saved analysis to {output_file}", file=sys.stderr)


if __name__ == "__main__":
    main(sys.argv[1:])

from __future__ import annotations

from datetime import datetime
from typing import Optional

import httpx

try:
    import trafilatura
except ModuleNotFoundError:  # pragma: no cover - handled upstream
    trafilatura = None  # type: ignore

from .schemas import Article


def _parse_date(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S%z"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(value)
    except Exception:  # pragma: no cover - best effort
        return None


async def fetch_article_from_url(url: str, *, client: httpx.AsyncClient) -> Article:
    if trafilatura is None:
        raise RuntimeError("trafilatura is required to fetch articles.")

    response = await client.get(url, timeout=30)
    response.raise_for_status()

    downloaded = trafilatura.fetch_url(url, no_ssl=True)
    if not downloaded:
        downloaded = response.text

    metadata = trafilatura.extract_metadata(downloaded)
    extracted = trafilatura.extract(downloaded, include_formatting=False)
    if not extracted or not extracted.strip():
        raise ValueError("Unable to extract article text from the provided URL.")

    return Article(
        title=getattr(metadata, "title", None),
        author=getattr(metadata, "author", None),
        url=url,  # type: ignore[arg-type]
        published_at=_parse_date(getattr(metadata, "date", None)),
        content=extracted.strip(),
    )


async def resolve_article(
    *,
    client: httpx.AsyncClient,
    article_url: Optional[str] = None,
    article_text: Optional[str] = None,
) -> Article:
    if article_url:
        return await fetch_article_from_url(article_url, client=client)
    if article_text and article_text.strip():
        return Article(content=article_text.strip())
    raise ValueError("Provide either article_url or article_text.")


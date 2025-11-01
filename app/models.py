from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class AnalysisRequest(BaseModel):
    articleUrl: Optional[HttpUrl] = Field(default=None, description="URL of the article to analyze")
    articleText: Optional[str] = Field(default=None, description="Raw article text when URL can't be fetched")

    def input_kwargs(self) -> dict[str, str | None]:
        return {
            "article_url": str(self.articleUrl) if self.articleUrl else None,
            "article_text": self.articleText,
        }


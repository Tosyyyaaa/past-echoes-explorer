from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, HttpUrl


class Article(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    url: Optional[HttpUrl] = None
    published_at: Optional[datetime] = None
    content: str


class NarrativeFacet(BaseModel):
    label: str
    description: str
    supporting_quotes: List[str] = Field(default_factory=list)
    confidence: str = "medium"


class NarrativeAnalysis(BaseModel):
    article_summary: str
    tone: str
    emotional_cues: List[str] = Field(default_factory=list)
    bias_frame: str
    narrative_facets: List[NarrativeFacet] = Field(default_factory=list)


class HistoricalEcho(BaseModel):
    historical_event: str
    year: str
    region: Optional[str] = None
    source_url: str
    source_excerpt: str
    parallel_reasoning: str
    consequences_short: str
    consequences_mid: Optional[str] = None
    consequences_long: Optional[str] = None
    resonance_score: float = 0.5
    tags: List[str] = Field(default_factory=list)


class AnalysisMeta(BaseModel):
    generated_at: datetime
    openai_model: str
    perplexity_model: str
    output_file: Optional[str] = None
    search_query: Optional[str] = None
    selected_article_url: Optional[str] = None
    selected_article_title: Optional[str] = None
    selection_reason: Optional[str] = None


class AnalysisResult(BaseModel):
    article: Article
    narrative_analysis: NarrativeAnalysis
    echoes: List[HistoricalEcho] = Field(default_factory=list)
    meta: AnalysisMeta
    raw_prompts: Dict[str, str] = Field(default_factory=dict)

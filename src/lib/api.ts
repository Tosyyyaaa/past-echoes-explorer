export interface ArticleSummary {
  title: string | null;
  author: string | null;
  url: string | null;
  published_at: string | null;
  content: string;
}

export interface NarrativeFacet {
  label: string;
  description: string;
  supporting_quotes: string[];
  confidence: string;
}

export interface NarrativeAnalysis {
  article_summary: string;
  tone: string;
  emotional_cues: string[];
  bias_frame: string;
  narrative_facets: NarrativeFacet[];
}

export interface HistoricalEcho {
  historical_event: string;
  year: string;
  region: string | null;
  source_url: string;
  source_excerpt: string;
  parallel_reasoning: string;
  consequences_short: string;
  consequences_mid: string | null;
  consequences_long: string | null;
  resonance_score: number;
  tags: string[];
}

export interface AnalysisMeta {
  generated_at: string;
  openai_model: string;
  perplexity_model: string;
}

export interface AnalysisResult {
  article: ArticleSummary;
  narrative_analysis: NarrativeAnalysis;
  echoes: HistoricalEcho[];
  meta: AnalysisMeta;
}

interface AnalyzeInput {
  articleUrl?: string;
  articleText?: string;
}

export async function analyzeArticle(
  payload: AnalyzeInput,
  baseUrl = "http://localhost:8000",
): Promise<AnalysisResult> {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API error ${res.status}: ${detail || res.statusText}`);
  }

  return res.json() as Promise<AnalysisResult>;
}

export async function clearOutput(baseUrl = "http://localhost:8000"): Promise<void> {
  await fetch(`${baseUrl}/api/output/clear`, {
    method: "POST",
    keepalive: true,
  }).catch(() => {
    // Swallow network errors during unload
  });
}

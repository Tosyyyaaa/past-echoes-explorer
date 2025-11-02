import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Link as LinkIcon,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
// removed quick search widget; reflowed layout
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StartPayload } from "@/components/IntroSection";
import HistorianAgent from "@/components/HistorianAgent";
import type { AnalysisResult, NarrativeFacet, HistoricalEcho } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AnalysisViewProps {
  source?: StartPayload;
  analysis: AnalysisResult | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const trimText = (value?: string | null, limit = 220) => {
  if (!value) return "";
  if (value.length <= limit) return value;
  const trimmed = value.slice(0, limit).trimEnd();
  return trimmed.replace(/[.,;:]+$/, "") + "…";
};

const renderFacet = (facet: NarrativeFacet) => (
  <li key={facet.label} className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
    <div>
      <p className="text-card-foreground font-sans font-semibold">{facet.label}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{trimText(facet.description, 160)}</p>
      {facet.supporting_quotes?.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm italic text-muted-foreground">
          {facet.supporting_quotes.map((quote, idx) => (
            <li key={idx}>
              <span className="quote-highlight">“{quote}”</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </li>
);

const renderEchoCard = (
  echo: HistoricalEcho,
  onSelect: (echo: HistoricalEcho) => void,
) => {
  const resonancePercent = Math.round((echo.resonance_score ?? 0) * 100);
  return (
    <button
      type="button"
      onClick={() => onSelect(echo)}
      className="bg-background/60 border-2 border-border rounded p-6 border-l-4 border-l-primary h-full flex flex-col w-full text-left transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <h4 className="font-bold text-xl mb-3 text-primary font-display">
        {echo.historical_event}
      </h4>
      <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
        <span>{echo.year || "Year unknown"}</span>
        <span className="font-semibold text-primary">| {resonancePercent}% resonance</span>
      </div>
    </button>
  );
};


export const AnalysisView = ({
  source,
  analysis,
  isLoading,
  error,
  onRetry,
}: AnalysisViewProps) => {
  const [showAllEchoes, setShowAllEchoes] = useState(false);
  const [activeEcho, setActiveEcho] = useState<HistoricalEcho | null>(null);
  const emotionalCues = analysis?.narrative_analysis.emotional_cues ?? [];
  const facets = analysis?.narrative_analysis.narrative_facets ?? [];
  const echoes = analysis?.echoes ?? [];
  const primaryEcho = echoes[0];
  const visibleEchoes = showAllEchoes ? echoes : echoes.slice(0, 3);
  const cuesToShow = emotionalCues.slice(0, 3);
  const primaryFacet = facets[0];
  const facetDescription = primaryFacet ? trimText(primaryFacet.description, 120) : "";
  const articleSummary = trimText(analysis?.narrative_analysis.article_summary, 160);
  const selectionNote = trimText(analysis?.meta?.selection_reason ?? "", 140);
  const biasSnippet = trimText(analysis?.narrative_analysis.bias_frame, 140);

  useEffect(() => {
    setShowAllEchoes(false);
  }, [analysis?.meta?.generated_at]);

  return (
    <>
      {analysis && !isLoading && !error && (
        <HistorianAgent context={{ title: analysis.article.title ?? (source?.value || ""), summary: articleSummary }} />
      )}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10 animate-page-turn">
        {isLoading && (
          <Card className="border-2 border-border bg-card shadow-xl p-4 text-sm text-muted-foreground">
            Running analysis… this may take a few moments while we ask the models.
          </Card>
        )}
        {error && (
          <Card className="border-2 border-destructive bg-destructive/10 text-destructive shadow-xl p-4 flex items-center justify-between gap-4">
            <span>{error}</span>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Try again
              </Button>
            )}
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] items-start">
          <Card className="border-2 border-border bg-card paper-surface shadow-xl p-5 h-full overflow-auto pr-2">
            <div className="flex items-start gap-2 mb-4">
              {source ? (
                <Badge variant="secondary" className="font-sans text-xs uppercase tracking-wider font-medium flex items-center gap-2">
                  {source.mode === "link" ? <LinkIcon className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
                  {source.mode === "link" ? "Article" : "Search"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="font-sans text-xs uppercase tracking-wider font-medium">
                  Search
                </Badge>
              )}
            </div>

            <h2 data-voice-title className="text-3xl font-bold font-display mb-4 text-primary leading-tight headline-ink">
              {analysis?.article.title ??
                (source?.mode === "search" && source?.value
                  ? source.value
                  : source?.mode === "link"
                  ? "Analyzing submitted article"
                  : "Awaiting article")}
            </h2>
            <div data-voice-overview className="space-y-4 text-card-foreground font-sans text-sm leading-relaxed">
              {analysis ? (
                <>
                  <p className="voice-underline-target">
                    {articleSummary || "The narrative summary will appear here once analysis completes."}
                  </p>
                  {analysis.article.url && (
                    <a
                      href={analysis.article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary underline underline-offset-4"
                    >
                      View original article
                    </a>
                  )}
                  {selectionNote && (
                    <p className="text-xs text-muted-foreground">
                      Selected article because: {selectionNote}
                    </p>
                  )}
                  {primaryFacet && (
                    <div className="pl-3 border-l-4 border-accent/70 my-3 py-1">
                      <p className="text-xs text-muted-foreground font-semibold flex items-center gap-2 uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {primaryFacet.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{facetDescription}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="italic text-muted-foreground">
                  Submit an article or search term to generate a past echo.
                </p>
              )}
            </div>
          </Card>

          <Card className="border-2 border-border bg-card paper-surface shadow-xl p-6 flex-1 h-full">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" strokeWidth={2} />
              <h3 className="text-2xl font-bold font-display text-primary">Narrative Analysis</h3>
            </div>
            <div className="space-y-5 text-sm">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tone</p>
                <p className="text-card-foreground font-sans text-base">
                  {analysis?.narrative_analysis.tone ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Emotional Cues</p>
                <div className="flex flex-wrap gap-2">
                  {cuesToShow.length > 0 ? (
                    cuesToShow.map((cue) => (
                      <Badge key={cue} variant="outline" className="bg-highlight/40 border-border font-sans">
                        {cue}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bias Perspective</p>
                <p className="text-card-foreground font-sans text-sm">{biasSnippet || "—"}</p>
              </div>
              <div className="pt-6 border-t-2 border-border">
                <p className="text-sm text-muted-foreground font-sans flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {primaryEcho
                    ? `${primaryEcho.historical_event}${primaryEcho.year ? ` (${primaryEcho.year})` : ""}`
                    : "Historical echo will appear here"}
                </p>
              </div>
              {facets.length > 0 && (
                <div className="pt-6 border-t border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Narrative Facets
                  </p>
                  <ul className="space-y-3">
                    {facets.slice(0, 3).map(renderFacet)}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="border-2 border-border bg-card paper-surface shadow-xl p-8 md:p-10 clipping">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-7 h-7 text-primary" strokeWidth={2} />
            <h3 className="text-3xl font-bold font-display text-primary">Echo from the Past</h3>
          </div>
          <div className="space-y-4" data-voice-echo>
            {echoes.length > 0 ? (
              <>
                <div className="pb-4">
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {visibleEchoes.map((echo, idx) => (
                      <div
                        key={`${echo.historical_event}-${echo.year}`}
                        className="h-full fade-in-soft"
                        style={{ animationDelay: `${idx * 90}ms` }}
                      >
                        {renderEchoCard(echo, setActiveEcho)}
                      </div>
                    ))}
                  </div>
                </div>
              {!showAllEchoes && echoes.length > 3 && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAllEchoes(true)}
                    className="flex items-center gap-2"
                  >
                      Show more echoes
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-background/60 border-2 border-border rounded p-8 border-l-4 border-l-primary">
                <p className="text-muted-foreground italic">
                  Historical echoes will populate here after analysis completes.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={!!activeEcho} onOpenChange={(open) => !open && setActiveEcho(null)}>
        <DialogContent className="max-w-5xl w-[90vw] md:w-[72vw] p-6 md:p-8">
          <DialogHeader>
            <DialogTitle>{activeEcho?.historical_event}</DialogTitle>
            <DialogDescription className="space-y-2 text-sm md:text-base text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{activeEcho?.year}</span>
                <span className="font-semibold text-primary">
                  {activeEcho ? ` | ${Math.round((activeEcho.resonance_score ?? 0) * 100)}% resonance` : ""}
                </span>
              </div>
              {activeEcho?.parallel_reasoning && <p>{activeEcho.parallel_reasoning}</p>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 md:space-y-7 text-base md:text-[1.05rem] leading-8">
            {activeEcho?.source_excerpt && <p>{activeEcho.source_excerpt}</p>}
            <div className="space-y-3 mt-2 pt-4 border-t border-dashed border-border/60">
              <h4 className="text-xl font-bold font-display uppercase tracking-wide text-primary">Historical Outcome</h4>
              <p>{activeEcho?.consequences_short}</p>
              {activeEcho?.consequences_mid && <p>{activeEcho.consequences_mid}</p>}
              {activeEcho?.consequences_long && <p>{activeEcho.consequences_long}</p>}
            </div>
            {activeEcho?.source_url && (
              <a
                href={activeEcho.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline underline-offset-4 hover:text-foreground transition-colors"
              >
                View source
              </a>
            )}
            {activeEcho?.tags?.length ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {activeEcho.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full bg-highlight/25 text-foreground/90 border-dashed border-border/70 shadow-[inset_0_0_0_1px_hsl(var(--border)/0.6),0_2px_6px_hsl(var(--ink)/0.25)] px-3 py-1 transition-all hover:shadow-[inset_0_0_0_1px_hsl(var(--border)/0.8),0_4px_10px_hsl(var(--ink)/0.32)]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

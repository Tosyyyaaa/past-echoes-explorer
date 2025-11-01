import {
  AlertCircle,
  Calendar,
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
import VoiceAgent from "@/components/VoiceAgent";
import type { AnalysisResult, NarrativeFacet, HistoricalEcho } from "@/lib/api";

interface AnalysisViewProps {
  source?: StartPayload;
  analysis: AnalysisResult | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const renderFacet = (facet: NarrativeFacet) => (
  <li key={facet.label} className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
    <div>
      <p className="text-card-foreground font-sans font-semibold">{facet.label}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{facet.description}</p>
      {facet.supporting_quotes?.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm italic text-muted-foreground">
          {facet.supporting_quotes.map((quote, idx) => (
            <li key={idx}>"{quote}"</li>
          ))}
        </ul>
      )}
    </div>
  </li>
);

const renderEcho = (echo: HistoricalEcho) => {
  const resonancePercent = Math.round((echo.resonance_score ?? 0) * 100);
  return (
  <div className="bg-background/60 border-2 border-border rounded p-8 border-l-4 border-l-primary h-full flex flex-col min-w-[300px]">
    <h4 className="font-bold text-2xl mb-4 text-primary font-display">
      {echo.historical_event} {echo.year ? `(${echo.year})` : ""}
    </h4>
    <p className="text-card-foreground font-sans text-base leading-relaxed mb-6 voice-underline-target">
      {echo.parallel_reasoning || echo.source_excerpt}
    </p>
    <div className="pt-6 border-t-2 border-border space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="uppercase tracking-wider font-semibold text-xs">Resonance</span>
        <span className="font-semibold text-primary">{resonancePercent}%</span>
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Historical Outcome
        </p>
        <p className="text-card-foreground font-sans text-base leading-relaxed">
          {echo.consequences_short}
        </p>
        {echo.consequences_mid && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{echo.consequences_mid}</p>
        )}
        {echo.consequences_long && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">{echo.consequences_long}</p>
        )}
      </div>
    </div>
    {echo.source_url && (
      <a
        href={echo.source_url}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-primary underline underline-offset-4 mt-auto"
      >
        View source
      </a>
    )}
  </div>
  );
};

export const AnalysisView = ({
  source,
  analysis,
  isLoading,
  error,
  onRetry,
}: AnalysisViewProps) => {
  const emotionalCues = analysis?.narrative_analysis.emotional_cues ?? [];
  const facets = analysis?.narrative_analysis.narrative_facets ?? [];
  const echoes = analysis?.echoes ?? [];
  const primaryEcho = echoes[0];

  return (
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
      {/* Top row: long narrow article widget on the left, analysis cards on the right */}
      <div className="grid gap-8 md:grid-cols-[560px_1fr] items-stretch">
        {/* Article widget (narrow, scrollable if long) */}
        <Card className="border-2 border-border bg-card paper-surface shadow-xl p-6 h-full overflow-auto pr-2">
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

          <h2 data-voice-title className="text-3xl font-bold font-display mb-4 text-primary leading-tight">
            {analysis?.article.title ??
              (source?.mode === "search" && source?.value
                ? source.value
                : source?.mode === "link"
                ? "Analyzing submitted article"
                : "Awaiting article")}
          </h2>

          <div data-voice-overview className="space-y-6 text-card-foreground font-sans text-base leading-relaxed">
            {analysis ? (
              <>
                <p className="voice-underline-target">
                  {analysis.narrative_analysis.article_summary ||
                    "The narrative summary will appear here once analysis completes."}
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
                {analysis.meta.selection_reason && (
                  <p className="text-sm text-muted-foreground">
                    Selected article because: {analysis.meta.selection_reason}
                  </p>
                )}
                {facets.slice(0, 1).map((facet) => (
                  <div className="pl-4 border-l-4 border-accent my-4 py-1" key={facet.label}>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {facet.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{facet.description}</p>
                  </div>
                ))}
              </>
            ) : (
              <p className="italic text-muted-foreground">
                Submit an article or search term to generate a past echo.
              </p>
            )}
          </div>
        </Card>

        <div className="h-full flex flex-col gap-8">
          <Card className="border-2 border-border bg-card paper-surface shadow-xl p-6 shrink-0 h-[280px] flex items-center justify-center">
            <VoiceAgent variant="panel" />
          </Card>
          <Card className="border-2 border-border bg-card paper-surface shadow-xl p-8 flex-1 h-0">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" strokeWidth={2} />
              <h3 className="text-2xl font-bold font-display text-primary">Narrative Analysis</h3>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tone</p>
                <p className="text-card-foreground font-sans text-base">
                  {analysis?.narrative_analysis.tone ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Emotional Cues</p>
                <div className="flex flex-wrap gap-2">
                  {emotionalCues.length > 0 ? (
                    emotionalCues.map((cue) => (
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
                <p className="text-card-foreground font-sans text-base">
                  {analysis?.narrative_analysis.bias_frame ?? "—"}
                </p>
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
      </div>
      {/* Article widget now sits in the left column above */}

      {/* Historical Echo */}
      <Card className="border-2 border-border bg-card paper-surface shadow-xl p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-7 h-7 text-primary" strokeWidth={2} />
          <h3 className="text-3xl font-bold font-display text-primary">Echo from the Past</h3>
        </div>
        <div className="space-y-4" data-voice-echo>
          {echoes.length > 0 ? (
            <div className="overflow-x-auto pb-2">
              <div className="grid gap-6 grid-cols-[repeat(3,minmax(300px,1fr))] min-w-[960px]">
                {echoes.map((echo) => (
                  <div key={`${echo.historical_event}-${echo.year}`} className="h-full">
                    {renderEcho(echo)}
                  </div>
                ))}
              </div>
            </div>
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
  );
};

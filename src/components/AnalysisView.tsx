import { ArrowRight, TrendingUp, AlertCircle, Sparkles, Calendar, Link as LinkIcon, Search } from "lucide-react";
// removed quick search widget; reflowed layout
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StartPayload } from "@/components/IntroSection";
import VoiceAgent from "@/components/VoiceAgent";

interface AnalysisViewProps {
  source?: StartPayload;
  isVoicePlaying?: boolean;
}

export const AnalysisView = ({ source }: AnalysisViewProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10 animate-page-turn">
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
            {source?.mode === "search" && source?.value
              ? source.value
              : source?.mode === "link" && source?.value
              ? "Analysing submitted article"
              : "Rising Tensions in Global Trade Negotiations"}
          </h2>

          <div data-voice-overview className="space-y-6 text-card-foreground font-sans text-base leading-relaxed">
            <p className="voice-underline-target">
              Global markets faced significant turbulence today as trade negotiations 
              <span className="bg-highlight/60 px-2 py-0.5 mx-1 font-medium border-b-2 border-primary/40">
                reached a critical impasse
              </span>
              between major economic powers. Analysts warn of
              <span className="bg-highlight/60 px-2 py-0.5 mx-1 font-medium border-b-2 border-primary/40">
                potential cascading effects
              </span>
              on consumer prices and employment.
            </p>
            <div className="pl-4 border-l-4 border-accent my-4 py-1">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Fear appeal detected
              </p>
            </div>
            <p className="voice-underline-target">
              Industry leaders expressed concern over the breakdown in diplomatic channels, 
              with some calling it
              <span className="bg-highlight/60 px-2 py-0.5 mx-1 font-semibold border-b-2 border-primary/50">
                "a crisis of unprecedented proportions"
              </span>
              that could reshape international commerce for decades.
            </p>
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
                <p className="text-card-foreground font-sans text-base">Alarmist, urgency-driven</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Emotional Cues</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-highlight/40 border-border font-sans">Fear</Badge>
                  <Badge variant="outline" className="bg-highlight/40 border-border font-sans">Uncertainty</Badge>
                  <Badge variant="outline" className="bg-highlight/40 border-border font-sans">Crisis</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bias Perspective</p>
                <p className="text-card-foreground font-sans text-base">Economic catastrophization</p>
              </div>
              <div className="pt-6 border-t-2 border-border">
                <p className="text-sm text-muted-foreground font-sans flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Similar to 2008 financial crisis framing
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* Article widget now sits in the left column above */}

      {/* Historical Echo */}
      <Card className="border-2 border-border bg-card paper-surface shadow-xl p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-7 h-7 text-primary" strokeWidth={2} />
          <h3 className="text-3xl font-bold font-display text-primary">Echo from the Past</h3>
        </div>
        
        <div className="space-y-8" data-voice-echo>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary" />
            <div className="h-0.5 flex-1 bg-gradient-to-r from-primary to-transparent" />
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">1930</span>
          </div>
          
          <div className="bg-background/60 border-2 border-border rounded p-8 border-l-4 border-l-primary">
            <h4 className="font-bold text-2xl mb-4 text-primary font-display">The Smoot-Hawley Tariff Act (1930)</h4>
            <p className="text-card-foreground font-sans text-base leading-relaxed mb-6 voice-underline-target">
              During the Great Depression, newspapers used similarly alarmist language to describe 
              trade disputes. The rhetoric of "unprecedented crisis" and "cascading effects" 
              dominated coverage, much like today's narrative.
            </p>
            <div className="pt-6 border-t-2 border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Historical Outcome:</p>
              <p className="text-card-foreground font-sans text-base leading-relaxed voice-underline-target">
                The tariff act contributed to a 66% decline in global trade and deepened the Depression. 
                However, fear-driven reporting often oversimplified complex economic factors, 
                missing nuance that could have fostered more measured policy responses.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-primary" />
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Present Day</span>
            <div className="w-2 h-2 bg-primary" />
          </div>
        </div>
      </Card>
    </div>
  );
};

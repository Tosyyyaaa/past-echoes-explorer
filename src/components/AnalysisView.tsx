import { ArrowRight, TrendingUp, AlertCircle, Sparkles, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const AnalysisView = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10 animate-page-turn">
      {/* Article Section */}
      <Card className="border-2 border-border bg-card shadow-xl">
        <div className="p-8 md:p-10">
          <div className="flex items-start gap-2 mb-6">
            <Badge variant="secondary" className="font-sans text-xs uppercase tracking-wider font-medium">
              Sample Article
            </Badge>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 text-primary leading-tight">
            Rising Tensions in Global Trade Negotiations
          </h2>
          
          <div className="space-y-6 text-foreground font-sans text-lg leading-relaxed">
            <p>
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
            
            <div className="pl-6 border-l-4 border-accent my-6 py-2">
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Fear appeal detected
              </p>
            </div>
            
            <p>
              Industry leaders expressed concern over the breakdown in diplomatic channels, 
              with some calling it
              <span className="bg-highlight/60 px-2 py-0.5 mx-1 font-semibold border-b-2 border-primary/50">
                "a crisis of unprecedented proportions"
              </span>
              that could reshape international commerce for decades.
            </p>
          </div>
        </div>
      </Card>

      {/* Analysis Panel */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-2 border-border bg-card shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" strokeWidth={2} />
            <h3 className="text-2xl font-bold font-display text-primary">Narrative Analysis</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tone</p>
              <p className="text-foreground font-sans text-base">Alarmist, urgency-driven</p>
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
              <p className="text-foreground font-sans text-base">Economic catastrophization</p>
            </div>
            
            <div className="pt-6 border-t-2 border-border">
              <p className="text-sm text-muted-foreground font-sans flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Similar to 2008 financial crisis framing
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-border bg-card shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-primary" strokeWidth={2} />
            <h3 className="text-2xl font-bold font-display text-primary">Key Findings</h3>
          </div>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
              <p className="text-foreground font-sans">Hyperbolic language amplifies perceived danger</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
              <p className="text-foreground font-sans">Lack of balanced counter-perspectives</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
              <p className="text-foreground font-sans">Appeals to authority without context</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-primary mt-2 flex-shrink-0" />
              <p className="text-foreground font-sans">Historical precedent used to justify alarm</p>
            </li>
          </ul>
        </Card>
      </div>

      {/* Historical Echo */}
      <Card className="border-2 border-border bg-card shadow-xl p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-7 h-7 text-primary" strokeWidth={2} />
          <h3 className="text-3xl font-bold font-display text-primary">Echo from the Past</h3>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary" />
            <div className="h-0.5 flex-1 bg-gradient-to-r from-primary to-transparent" />
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">1930</span>
          </div>
          
          <div className="bg-background/60 border-2 border-border rounded p-8 border-l-4 border-l-primary">
            <h4 className="font-bold text-2xl mb-4 text-primary font-display">The Smoot-Hawley Tariff Act (1930)</h4>
            <p className="text-foreground font-sans text-base leading-relaxed mb-6">
              During the Great Depression, newspapers used similarly alarmist language to describe 
              trade disputes. The rhetoric of "unprecedented crisis" and "cascading effects" 
              dominated coverage, much like today's narrative.
            </p>
            <div className="pt-6 border-t-2 border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Historical Outcome:</p>
              <p className="text-foreground font-sans text-base leading-relaxed">
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

import { ArrowRight, TrendingUp, AlertCircle, Sparkles, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const AnalysisView = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-page-turn">
      {/* Article Section */}
      <Card className="border-2 border-primary/20 bg-card shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16" />
        <div className="p-6 md:p-8 relative">
          <div className="flex items-start gap-2 mb-4">
            <Badge variant="secondary" className="font-handwriting text-sm">
              Sample Article
            </Badge>
          </div>
          
          <h2 className="text-3xl font-bold font-serif mb-4 text-primary">
            Rising Tensions in Global Trade Negotiations
          </h2>
          
          <div className="prose prose-lg max-w-none space-y-4 text-foreground">
            <p className="leading-relaxed">
              Global markets faced significant turbulence today as trade negotiations 
              <span className="bg-highlight/50 px-1 mx-1 relative">
                reached a critical impasse
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary/60" 
                      style={{ transform: "skewY(-1deg)" }} />
              </span>
              between major economic powers. Analysts warn of
              <span className="bg-highlight/50 px-1 mx-1 relative">
                potential cascading effects
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary/60" 
                      style={{ transform: "skewY(1deg)" }} />
              </span>
              on consumer prices and employment.
            </p>
            
            <div className="relative pl-4 border-l-4 border-accent my-6">
              <p className="text-sm font-handwriting text-muted-foreground italic">
                <AlertCircle className="inline w-4 h-4 mr-1" />
                fear appeal detected here →
              </p>
            </div>
            
            <p className="leading-relaxed">
              Industry leaders expressed concern over the breakdown in diplomatic channels, 
              with some calling it
              <span className="bg-highlight/50 px-1 mx-1 relative font-semibold">
                "a crisis of unprecedented proportions"
                <ArrowRight className="inline w-4 h-4 ml-1 text-accent animate-sketch-bounce" />
              </span>
              that could reshape international commerce for decades.
            </p>
          </div>
        </div>
      </Card>

      {/* Analysis Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-accent/30 bg-card shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-xl font-bold font-serif text-primary">Narrative Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Tone</p>
              <p className="text-foreground">Alarmist, urgency-driven</p>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Emotional Cues</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-highlight/30">Fear</Badge>
                <Badge variant="outline" className="bg-highlight/30">Uncertainty</Badge>
                <Badge variant="outline" className="bg-highlight/30">Crisis</Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Bias Perspective</p>
              <p className="text-foreground">Economic catastrophization</p>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-handwriting text-muted-foreground italic flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Similar to 2008 financial crisis framing
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-accent/30 bg-card shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-accent" />
            <h3 className="text-xl font-bold font-serif text-primary">Key Findings</h3>
          </div>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
              <p className="text-foreground">Hyperbolic language amplifies perceived danger</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
              <p className="text-foreground">Lack of balanced counter-perspectives</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
              <p className="text-foreground">Appeals to authority without context</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
              <p className="text-foreground">Historical precedent used to justify alarm</p>
            </li>
          </ul>
        </Card>
      </div>

      {/* Historical Echo */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-accent/5 shadow-xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold font-serif text-primary">Echo from the Past</h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            <span className="text-sm font-handwriting text-muted-foreground">1930</span>
          </div>
          
          <div className="bg-background/50 rounded-lg p-6 border-l-4 border-primary">
            <h4 className="font-bold text-lg mb-3 text-primary">The Smoot-Hawley Tariff Act (1930)</h4>
            <p className="text-foreground leading-relaxed mb-4">
              During the Great Depression, newspapers used similarly alarmist language to describe 
              trade disputes. The rhetoric of "unprecedented crisis" and "cascading effects" 
              dominated coverage, much like today's narrative.
            </p>
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Historical Outcome:</p>
              <p className="text-foreground">
                The tariff act contributed to a 66% decline in global trade and deepened the Depression. 
                However, fear-driven reporting often oversimplified complex economic factors, 
                missing nuance that could have fostered more measured policy responses.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
            <span className="text-sm font-handwriting text-muted-foreground">Present Day</span>
            <div className="w-3 h-3 rounded-full bg-accent" />
          </div>
        </div>
      </Card>
    </div>
  );
};

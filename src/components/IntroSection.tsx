import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface IntroSectionProps {
  onStart: () => void;
}

export const IntroSection = ({ onStart }: IntroSectionProps) => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 animate-ink-draw">
      <div className="relative bg-card border-2 border-border rounded-lg p-8 shadow-lg">
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-primary" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-primary" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-primary" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-primary" />
        
        <p className="text-lg leading-relaxed text-foreground font-serif">
          Explore how narratives repeat across time. Drop a link or search an event to trace its historical echoes.
        </p>
        
        <div className="mt-6 pt-6 border-t-2 border-dashed border-border">
          <p className="text-sm text-muted-foreground italic">
            "Those who cannot remember the past are condemned to repeat it."
          </p>
          <p className="text-xs text-muted-foreground mt-1">— George Santayana</p>
        </div>
      </div>

      <Button
        onClick={onStart}
        size="lg"
        className="w-full text-lg py-6 font-handwriting text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        Start the Journey
        <ArrowRight className="ml-2 w-5 h-5 animate-sketch-bounce" />
      </Button>

      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>Analyze</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>Compare</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>Discover</span>
        </div>
      </div>
    </div>
  );
};

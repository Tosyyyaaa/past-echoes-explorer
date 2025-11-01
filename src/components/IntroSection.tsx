import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface IntroSectionProps {
  onStart: () => void;
}

export const IntroSection = ({ onStart }: IntroSectionProps) => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-10 animate-ink-draw">
      <div className="bg-card border-2 border-border rounded p-10 shadow-xl">
        <p className="text-xl leading-relaxed text-foreground font-sans mb-8">
          Explore how narratives repeat across time. Drop a link or search an event to trace its historical echoes.
        </p>
        
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground italic font-display">
            "Those who cannot remember the past are condemned to repeat it."
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">— George Santayana</p>
        </div>
      </div>

      <Button
        onClick={onStart}
        size="lg"
        className="w-full font-sans uppercase tracking-wider"
      >
        Start the Journey
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      <div className="flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary" />
          <span>Analyze</span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary" />
          <span>Compare</span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary" />
          <span>Discover</span>
        </div>
      </div>
    </div>
  );
};

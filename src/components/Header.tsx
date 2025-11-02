import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  onBack?: () => void;
}

export const Header = ({ onBack }: HeaderProps) => {
  return (
    <header className="py-6 md:py-8 px-4 animate-ink-draw border-b-2 border-border paper-surface">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back" className="shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight text-foreground headline-ink">
              PastPort
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-serifbody italic mt-1">
              See today's news through yesterday's echoes.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

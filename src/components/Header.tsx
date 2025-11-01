import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  onBack?: () => void;
}

export const Header = ({ onBack }: HeaderProps) => {
  return (
    <header className="py-6 md:py-8 px-4 animate-ink-draw border-b-2 border-border">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight text-foreground mb-2">
            PastPort
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-sans font-medium">
            See today's news through yesterday's echoes.
          </p>
        </div>
        {/* spacer to balance layout when back button is visible */}
        {onBack && <div className="w-10" />}
      </div>
    </header>
  );
};

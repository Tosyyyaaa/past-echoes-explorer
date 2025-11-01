import { Clock } from "lucide-react";

export const Header = () => {
  return (
    <header className="text-center py-10 px-4 animate-ink-draw border-b-2 border-border">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Clock className="w-9 h-9 text-primary" strokeWidth={2} />
        <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight text-primary">
          PastPort
        </h1>
      </div>
      <p className="text-base md:text-lg text-muted-foreground font-sans font-medium">
        See today's news through yesterday's echoes.
      </p>
    </header>
  );
};

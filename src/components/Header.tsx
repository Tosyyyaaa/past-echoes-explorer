import { Clock } from "lucide-react";

export const Header = () => {
  return (
    <header className="text-center py-8 px-4 animate-ink-draw">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-8 h-8 text-primary" strokeWidth={2.5} />
        <h1 className="text-5xl font-bold font-serif tracking-tight text-primary">
          PastPort
        </h1>
      </div>
      <p className="text-lg text-muted-foreground font-handwriting">
        See today's news through yesterday's echoes.
      </p>
    </header>
  );
};

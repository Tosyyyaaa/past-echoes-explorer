import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Link as LinkIcon, Search } from "lucide-react";

export type StartMode = "search" | "link";
export interface StartPayload {
  mode: StartMode;
  value: string;
}

interface IntroSectionProps {
  onStart: (payload: StartPayload) => void;
}

export const IntroSection = ({ onStart }: IntroSectionProps) => {
  const [mode, setMode] = useState<StartMode>("search");
  const [value, setValue] = useState("");
  // Typewriter for the tagline
  const taglineText = useMemo(() => (
    "Explore how narratives repeat across time.\nDrop a link or search an event to trace its historical echoes."
  ), []);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const speedMs = 18; // typing speed
    const timer = setInterval(() => {
      i += 1;
      setTyped(taglineText.slice(0, i));
      if (i >= taglineText.length) clearInterval(timer);
    }, speedMs);
    return () => clearInterval(timer);
  }, [taglineText]);

  const canSubmit = () => value.trim().length > 0;

  const submit = () => {
    if (!canSubmit()) return;
    onStart({ mode, value: value.trim() });
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-10 pb-20 space-y-8 animate-ink-draw">
      {/* Tagline above highlights */}
      <p
        className="text-2xl md:text-3xl leading-relaxed text-primary font-serifbody text-center fade-in-soft typewriter"
        style={{animationDelay: "120ms"}}
        aria-live="polite"
      >
        {typed.split("\n").map((line, idx) => (
          <span key={idx}>
            {line}
            {idx === 0 ? <br /> : null}
          </span>
        ))}
        <span className="type-caret" aria-hidden>|</span>
      </p>

      {/* Highlights above the widget */}
      <div className="flex items-center justify-center gap-5 text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-[0.25em]">
        <span>ANALYZE</span>
        <div className="h-3 w-px bg-border" />
        <span>COMPARE</span>
        <div className="h-3 w-px bg-border" />
        <span>DISCOVER</span>
      </div>

      <div className="bg-card paper-surface border-2 border-border rounded p-12 md:p-14 shadow-xl w-full">
        
        {/* Input widget inside the card */}
        <div>
          <Tabs defaultValue="search" onValueChange={(v) => { setMode(v as StartMode); setValue(""); }}>
            <TabsList className="w-full">
              <TabsTrigger value="search" className="flex-1 text-base md:text-lg py-3">
                <Search className="w-4 h-4 mr-2" /> Search event
              </TabsTrigger>
              <TabsTrigger value="link" className="flex-1 text-base md:text-lg py-3">
                <LinkIcon className="w-4 h-4 mr-2" /> Paste article link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <div className="mt-6">
                <Input
                  className="focus-glow h-14 text-lg"
                  placeholder="Search a historical event…  Try: French Revolution, Cuban Missile Crisis, Arab Spring…"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
            </TabsContent>

            <TabsContent value="link">
              <div className="mt-6">
                <Input
                  className="focus-glow h-14 text-lg"
                  type="url"
                  placeholder="Paste article URL"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-10 flex justify-center">
          <Button onClick={submit} disabled={!canSubmit()} size="lg" className="font-sans uppercase tracking-wider btn-embossed text-lg px-10 py-6">
            Analyse
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

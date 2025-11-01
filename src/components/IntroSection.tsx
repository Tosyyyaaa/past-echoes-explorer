import { useState } from "react";
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
    <div className="max-w-3xl mx-auto px-6 pt-6 pb-16 space-y-6 animate-ink-draw">
      {/* Tagline above highlights */}
      <p className="text-xl leading-relaxed text-primary font-montserrat text-center fade-in-soft" style={{animationDelay: "120ms"}}>
        Explore how narratives repeat across time. Drop a link or search an event to trace its historical echoes.
      </p>

      {/* Highlights above the widget */}
      <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
        <span>ANALYZE</span>
        <div className="h-3 w-px bg-border" />
        <span>COMPARE</span>
        <div className="h-3 w-px bg-border" />
        <span>DISCOVER</span>
      </div>

      <div className="bg-card paper-surface border-2 border-border rounded p-10 shadow-xl w-full">
        
        {/* Input widget inside the card */}
        <div>
          <Tabs defaultValue="search" onValueChange={(v) => { setMode(v as StartMode); setValue(""); }}>
            <TabsList className="w-full">
              <TabsTrigger value="search" className="flex-1">
                <Search className="w-4 h-4 mr-2" /> Search event
              </TabsTrigger>
              <TabsTrigger value="link" className="flex-1">
                <LinkIcon className="w-4 h-4 mr-2" /> Paste article link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <div className="mt-4">
                <Input
                  className="focus-glow"
                  placeholder="Search a historical event…  Try: French Revolution, Cuban Missile Crisis, Arab Spring…"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
            </TabsContent>

            <TabsContent value="link">
              <div className="mt-4">
                <Input
                  className="focus-glow"
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

        <div className="mt-8 flex justify-center">
          <Button onClick={submit} disabled={!canSubmit()} size="lg" className="font-sans uppercase tracking-wider btn-embossed">
            Analyse
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

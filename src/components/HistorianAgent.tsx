import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface HistorianAgentProps {
  context: { title: string; year?: string; summary?: string };
}

export default function HistorianAgent({ context }: HistorianAgentProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const eventContext = `${context.title}${context.year ? ` (${context.year})` : ""}\n${context.summary || ""}`;

  const ask = async () => {
    const q = question.trim();
    if (!q) return;
    try {
      setIsLoading(true);
      const resp = await fetch('/api/historian-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventContext,
          userQuestion: q,
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          history,
        }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      setAnswer(data.text || "");
      setHistory((h) => [...h, { role: 'user', content: q }, { role: 'assistant', content: data.text || "" }]);
      setQuestion("");
      if (data.audioUrl) {
        let audio = audioRef.current;
        if (!audio) {
          audio = new Audio();
          audioRef.current = audio;
        }
        audio.src = data.audioUrl;
        audio.play().catch(() => {});
      }
    } catch (e: any) {
      toast({ title: 'Historian error', description: String(e?.message || e) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 60 }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className="btn-embossed"
            style={{ padding: '6px 10px', borderRadius: 10, fontWeight: 700, background: '#CBBE91', color: '#2C1E1E', border: '1px solid rgba(44,30,30,0.25)' }}
            title="Ask the Historian"
          >
            🎧 Ask the Historian
          </button>
        </DialogTrigger>
        <DialogContent className="paper-surface border-2 border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Ask about: {context.title}{context.year ? ` · ${context.year}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Calm, educational responses tailored to the event. Answers will also be spoken.
            </div>
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this event…"
                className="focus-glow"
                onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
              />
              <Button onClick={ask} disabled={!question.trim() || isLoading} className="btn-embossed">
                {isLoading ? 'Thinking…' : 'Ask'}
              </Button>
            </div>
            {answer && (
              <div className="mt-3 text-sm text-card-foreground voice-underline-target">
                {answer}
              </div>
            )}
            <audio ref={audioRef} style={{ display: 'none' }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



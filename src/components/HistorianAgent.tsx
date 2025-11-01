import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AgnosHistorian } from "@/lib/agnos";

interface HistorianAgentProps {
  context: { title: string; year?: string; summary?: string };
}

export default function HistorianAgent({ context }: HistorianAgentProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const orchestrator = useMemo(() => new AgnosHistorian(), []);
  // keep orchestrator context in sync
  orchestrator.setContext(context);

  const ask = async () => {
    const q = question.trim();
    if (!q) return;
    try {
      setIsLoading(true);
      const data = await orchestrator.ask(q);
      setAnswer(data.text || "");
      setMessages((prev) => [...prev, { role: 'user', content: q }, { role: 'assistant', content: data.text || '' }]);
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

  // Basic microphone capture via Web Speech API (webkitSpeechRecognition)
  useEffect(() => {
    if (!isListening) return;
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      toast({ title: 'Microphone not supported', description: 'Your browser does not support Speech Recognition.' });
      setIsListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript || '';
      setQuestion(transcript);
      // auto-ask with captured question
      setTimeout(() => ask(), 0);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    try { rec.start(); } catch { setIsListening(false); }
    return () => {
      try { rec.stop(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
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
            <div className="max-h-[40vh] overflow-auto space-y-2 pr-1">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={(m.role === 'user' ? 'bg-black/40' : 'bg-background/60') + ' inline-block w-fit max-w-md border border-border rounded-lg px-3 py-2 text-sm voice-underline-target'}>
                    {m.content}
                  </div>
                </div>
              ))}
              {answer && (
                <div className="text-left">
                  <div className="bg-background/60 inline-block w-fit max-w-md border border-border rounded-lg px-3 py-2 text-sm voice-underline-target">
                    {answer}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={isListening ? 'Listening…' : 'Ask a question about this event…'}
                className="focus-glow"
                onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
              />
              <Button onClick={ask} disabled={!question.trim() || isLoading} className="btn-embossed">
                {isLoading ? 'Thinking…' : 'Ask'}
              </Button>
              <Button onClick={() => setIsListening((s) => !s)} variant="secondary" title="Use microphone">
                {isListening ? '🛑' : '🎤'}
              </Button>
            </div>
            <audio ref={audioRef} style={{ display: 'none' }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



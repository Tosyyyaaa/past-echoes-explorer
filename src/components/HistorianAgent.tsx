import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { AgnosHistorian } from "@/lib/agnos";

interface HistorianAgentProps {
  context: { title: string; year?: string; summary?: string };
}

export default function HistorianAgent({ context }: HistorianAgentProps) {
  const [isListening, setIsListening] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const orchestrator = useMemo(() => new AgnosHistorian(), []);
  orchestrator.setContext(context);

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text) return;
    try {
      // Interrupt current speech if any
      try { audioRef.current?.pause(); } catch {}
      setIsSpeaking(false);
      setIsThinking(true);
      setMessages((prev) => [...prev, { role: 'user', content: text }]);
      const data = await orchestrator.ask(text);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.text || '' }]);
      if (data.audioUrl) {
        let audio = audioRef.current;
        if (!audio) {
          audio = new Audio();
          audioRef.current = audio;
        }
        audio.onended = () => setIsSpeaking(false);
        audio.src = data.audioUrl;
        setIsSpeaking(true);
        await audio.play().catch(() => setIsSpeaking(false));
      } else if (data.text) {
        // Fallback to Web Speech API when ElevenLabs audio is unavailable
        const synth: SpeechSynthesis | undefined = (typeof window !== 'undefined') ? window.speechSynthesis : undefined;
        if (synth) {
          try {
            const utter = new SpeechSynthesisUtterance(data.text);
            utter.rate = 1.0;
            utter.pitch = 1.0;
            utter.onend = () => setIsSpeaking(false);
            setIsSpeaking(true);
            synth.speak(utter);
          } catch {
            // ignore
          }
        } else {
          toast({ title: 'Speech unavailable', description: 'Enable TTS or set ELEVENLABS_API_KEY to hear narration.' });
        }
      }
    } catch (e: any) {
      toast({ title: 'Historian error', description: String(e?.message || e) });
    } finally {
      setIsThinking(false);
    }
  };

  // Basic microphone capture via Web Speech API (webkitSpeechRecognition)
  useEffect(() => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const res = e.results[e.results.length - 1];
      const transcript = res?.[0]?.transcript || '';
      if (transcript) ask(transcript);
    };
    rec.onend = () => {
      recognitionRef.current = null;
      if (isListening) {
        try { rec.start(); recognitionRef.current = rec; } catch {}
      }
    };
    recognitionRef.current = rec;
    if (isListening) {
      try { rec.start(); } catch {}
    }
    return () => { try { rec.stop(); } catch {} };
  }, [isListening]);

  // UI: compact transcript + animated agent circle; click circle to toggle listen
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      {/* Transcript */}
      <div className="paper-surface border-2 border-border rounded-xl p-3 mb-3" style={{ width: 340, maxHeight: 240, overflowY: 'auto' }}>
        <div className="text-xs text-muted-foreground mb-2">
          Calm, educational responses tailored to the event. Answers are spoken.
        </div>
        <div className="space-y-2">
          {messages.slice(-6).map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={(m.role === 'user' ? 'bg-black/40' : 'bg-background/60') + ' inline-block w-fit max-w-[300px] border border-border rounded-lg px-3 py-2 text-xs voice-underline-target'}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Circle */}
      <button
        aria-label="Historian agent"
        onClick={() => setIsListening((s) => !s)}
        title={isListening ? 'Listening — click to pause' : 'Paused — click to listen'}
        style={{
          width: 72,
          height: 72,
          borderRadius: 9999,
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35), rgba(203,190,145,0.6)), linear-gradient(180deg, #D9CBA1, #CBBE91)',
          boxShadow: isSpeaking
            ? 'inset 0 3px 8px rgba(0,0,0,0.18), 0 0 0 12px rgba(203,190,145,0.15), 0 10px 20px rgba(0,0,0,0.35)'
            : 'inset 0 2px 6px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.25)',
          border: '1px solid rgba(44,30,30,0.25)',
          position: 'relative' as const,
          overflow: 'hidden',
          transition: 'box-shadow 250ms ease, transform 150ms ease',
        }}
      >
        {/* Vibrating gradient ring */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: 9999,
            background: 'conic-gradient(from 0deg, rgba(217,181,111,0.0), rgba(217,181,111,0.45), rgba(217,181,111,0.0))',
            filter: 'blur(12px)',
            animation: (isListening || isSpeaking || isThinking) ? 'vibe 1400ms ease-in-out infinite' : 'none',
          }}
        />
        <span style={{ position: 'relative', zIndex: 2, fontSize: 22 }}>🎧</span>
        <style>{
          `@keyframes vibe { 0%, 100% { transform: rotate(0deg) scale(1) } 50% { transform: rotate(180deg) scale(1.06) } }`
        }</style>
      </button>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}



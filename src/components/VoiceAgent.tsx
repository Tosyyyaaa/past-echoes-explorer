import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface VoiceAgentProps {
  onPlayStateChange?: (isPlaying: boolean) => void;
  variant?: "floating" | "inline";
}

export const VoiceAgent = ({ onPlayStateChange, variant = "floating" }: VoiceAgentProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const lastHighlightedRef = useRef<HTMLElement | null>(null);
  const currentIndexRef = useRef<number>(0);
  const nodesRef = useRef<HTMLElement[]>([]);
  const voiceUsedRef = useRef<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<"historian" | "storyteller" | "analyst">("historian");
  // Chat UI removed — keeping only voice narration controls

  const VOICES: Record<string, { id: string; label: string } > = {
    historian: { id: "21m00Tcm4TlvDq8ikWAM", label: "Historian" }, // calm, authoritative
    storyteller: { id: "AZnzlk1XvdvUeBnXmlld", label: "Storyteller" }, // warm, expressive
    analyst: { id: "EXAVITQu4vr4xnSDxMaL", label: "Analyst" }, // neutral, concise
  };

  const getNarrationNodes = useCallback(() => {
    const nodes = [
      ...(Array.from(document.querySelectorAll('[data-voice-overview] p')) as HTMLElement[]),
      ...(Array.from(document.querySelectorAll('[data-voice-echo] p')) as HTMLElement[]),
    ];
    return nodes.filter((n) => n.innerText.trim().length > 0);
  }, []);

  const clearAllHighlights = () => {
    document.querySelectorAll('.voice-highlight').forEach((el) => el.classList.remove('voice-highlight', 'shimmer'));
    lastHighlightedRef.current = null;
  };

  const highlightNode = (node: HTMLElement | null) => {
    if (!node) return;
    if (lastHighlightedRef.current && lastHighlightedRef.current !== node) {
      lastHighlightedRef.current.classList.remove('voice-highlight', 'shimmer');
    }
    node.classList.add('voice-highlight', 'shimmer');
    lastHighlightedRef.current = node;
  };

  // Highlighting is handled per-paragraph during playback only

  const stopAll = useCallback(() => {
    try {
      const audio = audioRef.current;
      if (audio) {
        audio.onended = null;
        audio.onpause = null;
        audio.ontimeupdate = null;
        audio.pause();
        audio.currentTime = 0;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    } catch {
      // noop
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    onPlayStateChange?.(false);
    clearAllHighlights();
  }, [onPlayStateChange]);

  const fetchTtsBlob = async (text: string, voiceId: string) => {
    const resp = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_id: voiceId }),
    });
    if (!resp.ok) {
      const msg = await resp.text().catch(() => 'TTS failed');
      throw new Error(msg || 'TTS failed');
    }
    const blob = await resp.blob();
    return blob;
  };

  const playParagraphAt = useCallback(async (index: number) => {
    const nodes = nodesRef.current;
    if (!nodes.length || index < 0 || index >= nodes.length) {
      stopAll();
      return;
    }
    currentIndexRef.current = index;
    const node = nodes[index];
    const text = node?.innerText?.trim() || '';
    if (!text) {
      // skip empty
      playParagraphAt(index + 1);
      return;
    }
    try {
      setIsLoading(true);
      highlightNode(node);
      const voiceId = VOICES[selectedVoice].id;
      voiceUsedRef.current = voiceId;
      const blob = await fetchTtsBlob(text, voiceId);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audioRef.current = audio;
      }
      audio.src = url;
      audio.onended = () => {
        // move to next paragraph
        playParagraphAt(currentIndexRef.current + 1);
      };
      audio.onpause = () => {
        setIsPaused(true);
        setIsPlaying(false);
        onPlayStateChange?.(false);
        clearAllHighlights();
      };
      audio.ontimeupdate = () => {
        // reserved for future per-phrase sync
      };
      await audio.play();
      setIsPlaying(true);
      setIsPaused(false);
      onPlayStateChange?.(true);
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Narration failed';
      if (message.includes('Missing ELEVENLABS_API_KEY')) {
        toast({ title: 'API key missing', description: 'Set ELEVENLABS_API_KEY in your environment and restart the dev server.' });
      } else {
        toast({ title: 'Narration failed', description: message });
      }
      stopAll();
    } finally {
      setIsLoading(false);
    }
  }, [VOICES, clearAllHighlights, onPlayStateChange, selectedVoice, stopAll]);

  // No chat/mic actions

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying && !isPaused && audio) {
      audio.pause();
      return;
    }
    if (!isPlaying && isPaused && audio) {
      // resume or restart with new voice if changed
      const currentVoice = voiceUsedRef.current;
      const desiredVoice = VOICES[selectedVoice].id;
      if (currentVoice && desiredVoice !== currentVoice) {
        // restart from current paragraph using the newly selected voice
        try { audio.pause(); } catch {}
        playParagraphAt(currentIndexRef.current);
        return;
      }
      audio.play().then(() => {
        setIsPaused(false);
        setIsPlaying(true);
        onPlayStateChange?.(true);
      }).catch(() => stopAll());
      return;
    }
    // start fresh sequence
    clearAllHighlights();
    const nodes = getNarrationNodes();
    nodesRef.current = nodes;
    if (!nodes.length) {
      toast({ title: "Nothing to narrate", description: "No paragraphs found to read on this view." });
      return;
    }
    playParagraphAt(0);
  }, [getNarrationNodes, isPaused, isPlaying, onPlayStateChange, playParagraphAt, stopAll]);

  // If the user changes the voice while playing, restart the current paragraph with the new voice
  useEffect(() => {
    if (!(isPlaying || isPaused)) return;
    const currentVoice = voiceUsedRef.current;
    const desiredVoice = VOICES[selectedVoice].id;
    if (currentVoice && desiredVoice !== currentVoice) {
      const idx = currentIndexRef.current;
      try { audioRef.current?.pause(); } catch {}
      // restart quickly with the new voice at the same paragraph
      const nodes = getNarrationNodes();
      nodesRef.current = nodes;
      if (nodes.length) {
        playParagraphAt(Math.min(idx, nodes.length - 1));
      }
    }
  }, [VOICES, selectedVoice, isPlaying, isPaused, getNarrationNodes, playParagraphAt]);

  useEffect(() => () => stopAll(), [stopAll]);

  const Player = (
    <div
      className="paper-surface"
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "2px solid hsl(var(--border))",
        minWidth: 220,
        background: "hsl(var(--card))",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: 9999,
            background: "#CBBE91",
            color: "#2C1E1E",
            display: "grid",
            placeItems: "center",
            border: "1px solid rgba(44,30,30,0.25)",
          }}>
            🎙️
          </div>
          <span className="font-sans text-sm" style={{ color: "hsl(var(--ink))", fontWeight: 700 }}>
            PastPort Voice
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            aria-label="Select voice"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value as any)}
            className="font-sans text-xs"
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          >
            <option value="historian">Historian · calm</option>
            <option value="storyteller">Storyteller · warm</option>
            <option value="analyst">Analyst · neutral</option>
          </select>
          <button
            onClick={togglePlay}
            className="btn-embossed"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {isLoading ? "Loading" : isPlaying && !isPaused ? "Pause" : "Play"}
          </button>
          <button onClick={stopAll} style={{ fontSize: 12, opacity: 0.8 }}>Stop</button>
        </div>
      </div>

      {/* Tiny waveform */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, marginTop: 10, height: 14 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 3,
              height: 6 + ((i * 7) % 10),
              background: isPlaying && !isPaused ? "#CBBE91" : "hsl(var(--border))",
              display: "inline-block",
              borderRadius: 1,
              animation: isPlaying && !isPaused ? `wave 900ms ease-in-out ${(i * 50) % 300}ms infinite` : "none",
            }}
          />
        ))}
      </div>

      <style>{`@keyframes wave { 0%, 100% { transform: scaleY(0.6) } 50% { transform: scaleY(1.3) } }`}</style>
    </div>
  );

  if (variant === 'panel') {
    return (
      <div className="text-center">
        {/* Focus overlay while playing (slight dim) */}
        {isPlaying && !isPaused && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.05)', pointerEvents: 'none', zIndex: 40 }}
          />
        )}
        <div className={"voice-circle mx-auto " + (isPlaying && !isPaused ? "is-playing" : "")}></div>
        <div className="mt-4 flex justify-center gap-2">
          <select
            aria-label="Select voice"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value as any)}
            className="font-sans text-xs"
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          >
            <option value="historian">Historian · calm</option>
            <option value="storyteller">Storyteller · warm</option>
            <option value="analyst">Analyst · neutral</option>
          </select>
          <button
            onClick={togglePlay}
            className="btn-embossed"
            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}
          >
            {isLoading ? "Loading" : isPlaying && !isPaused ? "Pause" : "Play"}
          </button>
          <button onClick={stopAll} style={{ fontSize: 12, opacity: 0.8 }}>Stop</button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground font-sans">PastPort Voice</div>
      </div>
    );
  }

  return (
    <div style={variant === 'floating' ? { position: "fixed", top: 20, right: 20, zIndex: 50 } : {}}>
      {/* Focus overlay while playing (slight dim) */}
      {isPlaying && !isPaused && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.05)',
            pointerEvents: 'none', zIndex: 40,
          }}
        />
      )}

      {variant === 'floating' ? (
        <>
          <button
            aria-label="PastPort Voice"
            onClick={togglePlay}
            className={(isLoading ? 'btn-gold-shimmer ' : '') + (isPlaying && !isPaused ? 'btn-pulse' : '')}
            style={{
              width: 44,
              height: 44,
              borderRadius: "9999px",
              background: "#CBBE91",
              color: "#2C1E1E",
              border: "1px solid rgba(44,30,30,0.25)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              transition: "box-shadow 200ms ease, transform 120ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 0 6px rgba(203,190,145,0.25), 0 8px 18px rgba(0,0,0,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 6px 16px rgba(0,0,0,0.25)";
            }}
            title={isLoading ? 'Loading narration…' : (isPlaying && !isPaused ? 'Pause narration' : 'Play narration')}
          >
            <span style={{ fontSize: 18 }} role="img" aria-hidden>
              🎧
            </span>
          </button>
        </>
      ) : (
        Player
      )}
      {/* Hidden audio element to manage events in some browsers */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default VoiceAgent;



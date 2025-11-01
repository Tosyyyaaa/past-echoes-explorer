import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface VoiceAgentProps {
  onPlayStateChange?: (isPlaying: boolean) => void;
  variant?: "floating" | "inline";
}

export const VoiceAgent = ({ onPlayStateChange, variant = "floating" }: VoiceAgentProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastHighlightedRef = useRef<HTMLElement | null>(null);

  const getNarrationNodes = useCallback(() => {
    const nodes = [
      ...(Array.from(document.querySelectorAll('[data-voice-overview] p')) as HTMLElement[]),
      ...(Array.from(document.querySelectorAll('[data-voice-echo] p')) as HTMLElement[]),
    ];
    return nodes.filter((n) => n.innerText.trim().length > 0);
  }, []);

  const clearAllHighlights = () => {
    document.querySelectorAll('.voice-highlight').forEach((el) => el.classList.remove('voice-highlight'));
    lastHighlightedRef.current = null;
  };

  const stopAll = useCallback(() => {
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    onPlayStateChange?.(false);
    clearAllHighlights();
  }, [onPlayStateChange]);

  const play = useCallback(() => {
    try {
      clearAllHighlights();
      const nodes = getNarrationNodes();
      if (!nodes.length) return;

      nodes.forEach((node, index) => {
        const text = node.innerText.trim();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95;
        u.pitch = 1.0;
        u.onstart = () => {
          // transition highlight
          if (lastHighlightedRef.current && lastHighlightedRef.current !== node) {
            lastHighlightedRef.current.classList.remove('voice-highlight');
          }
          node.classList.add('voice-highlight');
          lastHighlightedRef.current = node;
        };
        u.onend = () => {
          // allow smooth fade out when moving to the next
          if (index === nodes.length - 1) {
            setIsPlaying(false);
            setIsPaused(false);
            onPlayStateChange?.(false);
            // remove all highlights at full stop
            clearAllHighlights();
          }
        };
        u.onerror = () => {
          setIsPlaying(false);
          setIsPaused(false);
          onPlayStateChange?.(false);
          clearAllHighlights();
        };
        speechSynthesis.speak(u);
      });
      setIsPlaying(true);
      setIsPaused(false);
      onPlayStateChange?.(true);
    } catch {
      // ignore
    }
  }, [getNarrationNodes, onPlayStateChange]);

  const togglePlay = useCallback(() => {
    if (isPlaying && !isPaused) {
      speechSynthesis.pause();
      setIsPaused(true);
      onPlayStateChange?.(false);
      return;
    }
    if (isPlaying && isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      onPlayStateChange?.(true);
      return;
    }
    play();
  }, [isPlaying, isPaused, onPlayStateChange, play]);

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
            {isPlaying && !isPaused ? "Pause" : "Play"}
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.03)', pointerEvents: 'none', zIndex: 40 }}
          />
        )}
        <div className={"voice-circle mx-auto " + (isPlaying && !isPaused ? "is-playing" : "")}></div>
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={togglePlay}
            className="btn-embossed"
            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}
          >
            {isPlaying && !isPaused ? "Pause" : "Play"}
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
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.03)',
            pointerEvents: 'none', zIndex: 40,
          }}
        />
      )}

      {variant === 'floating' ? (
        <>
          <button
            aria-label="PastPort Voice"
            onClick={() => setExpanded((v) => !v)}
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
          >
            <span style={{ fontSize: 18 }} role="img" aria-hidden>
              🎧
            </span>
          </button>
          {expanded && <div style={{ marginTop: 10 }}>{Player}</div>}
        </>
      ) : (
        Player
      )}
    </div>
  );
};

export default VoiceAgent;



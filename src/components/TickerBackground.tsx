import React, { useMemo } from "react";

const headlines = [
  "Breaking: Markets sway as trade tensions rise",
  "Opinion: Lessons from the 1929 crash",
  "Analysis: Echoes of 2008 ripple across sectors",
  "Dispatch: Elections reshape regional alliances",
  "Report: Climate accords face new hurdles",
  "Briefing: Currency shocks test central banks",
  "Archive: Voices from the industrial age",
  "Timeline: Revolutions that changed the world",
  "Notebook: Journalists on the front line",
  "Long read: The cost of prosperity",
];

const buildRowText = (minRepeat = 12) => {
  const parts: string[] = [];
  while (parts.length < minRepeat) {
    parts.push(headlines[parts.length % headlines.length]);
  }
  return "  •  " + parts.join("  •  ") + "  •  ";
};

const TickerBackground: React.FC = () => {
  const rows = 12;
  const repeated = useMemo(() => new Array(2).fill(buildRowText(16)).join(" "), []);
  const items = new Array(rows).fill(0).map((_, i) => {
    const top = `${((i + 0.5) / rows) * 100}%`;
    const dur = 30 + (i % 6) * 6; // vary speed
    const dir = i % 2 === 0 ? "normal" : "reverse";
    const delay = `-${(i % 5) * 2}s`;
    const rotate = i % 2 === 0 ? "rotate(-1.8deg)" : "rotate(-2.4deg)";
    return { top, dur, dir, delay, rotate };
  });

  return (
    <div className="ticker-layer" aria-hidden>
      {items.map((it, idx) => (
        <div
          key={idx}
          className="ticker-row"
          style={{ top: it.top, transform: it.rotate }}
        >
          <span className="ticker-track" style={{ ['--dur' as any]: `${it.dur}s`, ['--dir' as any]: it.dir, ['--delay' as any]: it.delay }}>
            {repeated}
          </span>
          <span className="ticker-track" style={{ ['--dur' as any]: `${it.dur}s`, ['--dir' as any]: it.dir, ['--delay' as any]: it.delay }}>
            {repeated}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TickerBackground;



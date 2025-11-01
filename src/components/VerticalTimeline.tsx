import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ERAS, type Era, type Theme } from "@/lib/eras";
import { motion, AnimatePresence, useInView } from "framer-motion";

interface FilterState {
  country: string;
  region: string;
  theme: Theme | "";
}

type TimelineItem = { era: Era };

export default function VerticalTimeline() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [filters, setFilters] = useState<FilterState>({ country: "", region: "", theme: "" });

  const regions = useMemo(() => Array.from(new Set(ERAS.flatMap((e) => e.events.map((ev) => ev.region).filter(Boolean)))) as string[], []);
  const countries = useMemo(() => Array.from(new Set(ERAS.flatMap((e) => e.events.map((ev) => ev.country).filter(Boolean)))) as string[], []);
  const themes = useMemo(() => Array.from(new Set(ERAS.flatMap((e) => e.events.flatMap((ev) => ev.themes)))) as Theme[], []);

  const items: TimelineItem[] = useMemo(() => {
    return ERAS.map((era) => ({ era }));
  }, []);

  const [expanded, setExpanded] = useState<string | null>(null);

  // Parallax: move the golden line slightly slower than scroll & update progress
  useEffect(() => {
    const el = containerRef.current;
    const line = lineRef.current;
    if (!el || !line) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = el.scrollTop * 0.2;
        line.style.transform = `translateY(${y}px)`;
        const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
        if (fillRef.current) {
          fillRef.current.style.height = `${Math.max(0, Math.min(1, progress)) * 100}%`;
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Scroll spy: highlight node nearest to container center and update current era label
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      const center = el.scrollTop + el.clientHeight / 2;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      nodeRefs.current.forEach((node, idx) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const top = rect.top + el.scrollTop - el.getBoundingClientRect().top; // position relative to container scroll
        const mid = top + rect.height / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = idx;
        }
      });
      setActiveIdx(best);
    };
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items.length]);

  const onClickOpenEra = (id: string) => navigate(`/era/${id}`);

  // Sub-component: animated card aware of the scrollable container
  const TimelineCard = ({
    era,
    isLeft,
    isActive,
    expanded,
    onToggle,
  }: {
    era: Era;
    isLeft: boolean;
    isActive: boolean;
    expanded: boolean;
    onToggle: () => void;
  }) => {
    const ref = useRef<HTMLButtonElement | null>(null);
    const inView = useInView(ref, { root: containerRef.current, amount: 0.5 });
    return (
      <motion.button
        ref={ref}
        initial={{ opacity: 0.25, y: 60, scale: 0.98 }}
        animate={{ opacity: inView ? 1 : 0.25, y: inView ? 0 : 60, scale: inView ? 1 : 0.98 }}
        whileHover={{ scale: 1.03, boxShadow: "0 14px 32px rgba(0,0,0,0.4)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onClick={onToggle}
        className="group"
        style={{
          width: 300,
          background: "#F2E8C6",
          color: "#2C1E1E",
          borderRadius: 12,
          padding: 14,
          boxShadow: "0 6px 18px rgba(0,0,0,0.28)",
          border: "1px solid rgba(44,30,30,0.25)",
          transform: isLeft ? "translateX(-24px)" : "translateX(24px)",
          willChange: 'transform, opacity',
        }}
      >
        <div className="font-display text-base font-bold">{era.range}</div>
        <div className="font-sans font-semibold mt-0.5">{era.name}</div>
        <div className="text-sm mt-1 font-sans" style={{ opacity: 0.9 }}>{era.summary}</div>
        <div className="mt-2 text-xs text-muted-foreground font-sans">Click to reveal key events</div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="expand"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3"
            >
              <div className="text-xs font-sans space-y-2">
                {era.events.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <div>{ev.title}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/event/${ev.id}`); }} className="btn-embossed" style={{ padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Open</button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={(e) => { e.stopPropagation(); onClickOpenEra(era.id); }} className="btn-embossed" style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Open Era</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ background: "#2C1E1E", color: "#F2E8C6", height: "calc(100vh - 120px)", borderRadius: 12, overflowY: "auto", scrollSnapType: "y mandatory" as any, WebkitOverflowScrolling: 'touch' as any }}
    >
      {/* Current Era label */}
      <div style={{ position: 'sticky', top: 0, zIndex: 12 }} className="pointer-events-none">
        <div className="flex justify-end max-w-5xl mx-auto px-4 pt-3">
          <div className="pointer-events-auto paper-surface" style={{ border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '6px 10px' }}>
            <span className="text-xs font-sans text-muted-foreground uppercase tracking-wider">Current Era</span>
            <span className="ml-2 font-display text-primary text-sm font-bold">{items[activeIdx]?.era.name}</span>
          </div>
        </div>
      </div>
      {/* Filters pinned */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b-2 border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center justify-center">
          <select
            value={filters.region}
            onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
            className="font-sans text-sm focus-glow"
            style={{ padding: "8px 10px", border: "1px solid hsl(var(--border))", borderRadius: 8, background: "hsl(var(--card))" }}
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r || ""}>{r}</option>
            ))}
          </select>
          <select
            value={filters.country}
            onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
            className="font-sans text-sm focus-glow"
            style={{ padding: "8px 10px", border: "1px solid hsl(var(--border))", borderRadius: 8, background: "hsl(var(--card))" }}
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c || ""}>{c}</option>
            ))}
          </select>
          <select
            value={filters.theme}
            onChange={(e) => setFilters((f) => ({ ...f, theme: e.target.value as Theme }))}
            className="font-sans text-sm focus-glow"
            style={{ padding: "8px 10px", border: "1px solid hsl(var(--border))", borderRadius: 8, background: "hsl(var(--card))" }}
          >
            <option value="">All Themes</option>
            {themes.map((t) => (
              <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Parallax golden line with progress fill */}
      <div ref={lineRef} className="pointer-events-none" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 3, height: "100%", background: "linear-gradient(to bottom, #D9B56F, #8C6B2B)", boxShadow: "0 0 12px rgba(217,181,111,0.45)" }} />
      <div ref={(el) => (fillRef.current = el)} className="pointer-events-none" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 3, height: 0, background: "#D9B56F", boxShadow: "0 0 12px rgba(217,181,111,0.6)", opacity: 0.9 }} />

      {/* Items */}
      <div className="max-w-5xl mx-auto py-10">
        <div className="space-y-8">
          {items.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            const isActive = idx === activeIdx;
            const key = item.era.id;
            const title = item.era.name;
            const subtitle = item.era.range;
            const desc = item.era.summary;
            return (
              <div key={key} className={`relative flex ${isLeft ? "justify-start" : "justify-end"}`} style={{ scrollSnapAlign: 'center', minHeight: '70vh' }}>
                <TimelineCard
                  era={item.era}
                  isLeft={isLeft}
                  isActive={isActive}
                  expanded={expanded === key}
                  onToggle={() => setExpanded((e) => (e === key ? null : key))}
                />

                {/* connector */}
                <div style={{ position: "absolute", left: "50%", top: 24, width: 1, height: 1, transform: "translateX(-50%)" }}>
                  <div style={{
                    position: "absolute",
                    left: isLeft ? "-150px" : "150px",
                    top: 12,
                    width: 150,
                    height: 2,
                    background: "linear-gradient(to right, rgba(217,181,111,0.5), transparent)",
                    transform: isLeft ? "scaleX(1)" : "scaleX(-1)",
                    opacity: 0.7,
                  }} />
                </div>

                {/* node */}
                <div
                  ref={(el) => (nodeRefs.current[idx] = el)}
                  className={(isActive ? "btn-pulse " : "") + ("btn-gold-shimmer")}
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translate(-50%, 0)",
                    width: isActive ? 16 : 12,
                    height: isActive ? 16 : 12,
                    borderRadius: 9999,
                    background: "#D9B56F",
                    border: "2px solid #8C6B2B",
                    boxShadow: isActive ? "0 0 0 6px rgba(217,181,111,0.18), 0 6px 14px rgba(0,0,0,0.35)" : "0 6px 14px rgba(0,0,0,0.25)",
                    transition: "transform 150ms ease, box-shadow 200ms ease, width 150ms ease, height 150ms ease",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



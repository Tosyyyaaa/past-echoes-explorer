import { ERAS, Era, Theme } from "@/lib/eras";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface FilterState {
  country: string;
  region: string;
  theme: Theme | "";
}

export const ErasTimeline = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({ country: "", region: "", theme: "" });

  const regions = useMemo(() => Array.from(new Set(ERAS.flatMap((e) => e.events.map((ev) => ev.region).filter(Boolean)))) as string[], []);
  const themes = useMemo(() => Array.from(new Set(ERAS.flatMap((e) => e.events.flatMap((ev) => ev.themes)))) as Theme[], []);

  const handleEraClick = (era: Era) => {
    const params = new URLSearchParams();
    if (filters.region) params.set("region", filters.region);
    if (filters.theme) params.set("theme", filters.theme);
    navigate(`/era/${era.id}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-center">
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

      {/* Timeline */}
      <div className="paper-surface border-2 border-border p-4 overflow-x-auto" style={{ borderRadius: 12 }}>
        <div className="flex gap-6 min-w-max">
          {ERAS.map((era) => (
            <button
              key={era.id}
              onClick={() => handleEraClick(era)}
              className="group"
              style={{
                minWidth: 220,
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                boxShadow: "var(--shadow-sm)",
                padding: 16,
                textAlign: "left",
              }}
              title={era.summary}
            >
              <div className="font-display text-lg text-primary">{era.name}</div>
              <div className="text-xs text-muted-foreground">{era.range}</div>
              <div className="mt-3 text-xs text-card-foreground">
                {era.events.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <div>{ev.title}</div>
                  </div>
                ))}
              </div>
              <div
                className="mt-3 h-0.5 bg-gradient-to-r from-primary/70 to-transparent group-hover:from-primary"
                style={{ transition: "filter 200ms ease", filter: "brightness(1.05)" }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ErasTimeline;



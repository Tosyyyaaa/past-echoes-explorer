import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getEraById, ERAS, Theme } from "@/lib/eras";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const EraView = () => {
  const { eraId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const era = getEraById(eraId || "");
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!era) navigate("/");
  }, [era, navigate]);

  const regionFilter = params.get("region") || "";
  const themeFilter = (params.get("theme") as Theme | "") || "";

  const filtered = useMemo(() => {
    if (!era) return [];
    return era.events.filter((ev) => {
      const regionOk = regionFilter ? ev.region === regionFilter : true;
      const themeOk = themeFilter ? ev.themes.includes(themeFilter) : true;
      return regionOk && themeOk;
    });
  }, [era, regionFilter, themeFilter]);

  const openEvent = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const speakEra = async () => {
    if (!era) return;
    try {
      setIsLoading(true);
      const context = `${era.name} (${era.range})\n${era.summary}\n\nKey events:\n${era.events.slice(0, 5).map((e) => `- ${e.title}: ${e.preview}`).join("\n")}`;
      const resp = await fetch('/api/historian-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventContext: context, userQuestion: 'Give a concise, engaging spoken overview of this era.', voiceId: '21m00Tcm4TlvDq8ikWAM' })
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      if (data.audioUrl) {
        const audio = audioRef.current || new Audio();
        audioRef.current = audio;
        audio.src = data.audioUrl;
        audio.play();
      } else {
        toast({ title: 'Overview ready', description: data.text || 'No audio generated' });
      }
    } catch (e: any) {
      toast({ title: 'Historian error', description: String(e?.message || e) });
    } finally {
      setIsLoading(false);
    }
  };

  if (!era) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-primary">{era.name}</h1>
          <p className="text-sm text-muted-foreground">{era.range}</p>
        </div>
        <button onClick={speakEra} className="btn-embossed" style={{ padding: '8px 12px', borderRadius: 10, fontWeight: 700 }}>
          {isLoading ? 'Preparing…' : '🗣️ Chat about this era'}
        </button>
      </div>

      <Card className="border-2 border-border bg-card paper-surface shadow-xl p-6">
        <p className="font-sans text-base text-card-foreground leading-relaxed">{era.summary}</p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ev) => (
          <Card key={ev.id} className="border-2 border-border bg-card paper-surface shadow-xl p-5 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-primary">{ev.title}</h3>
              <span className="text-xs text-muted-foreground">{ev.year}</span>
            </div>
            <p className="mt-2 text-sm text-card-foreground">{ev.preview}</p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => openEvent(ev.id)} className="btn-embossed" style={{ padding: '6px 10px', borderRadius: 8, fontWeight: 700 }}>Open Analysis</button>
            </div>
          </Card>
        ))}
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default EraView;



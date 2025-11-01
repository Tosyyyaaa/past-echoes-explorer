import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { AnalysisView } from "@/components/AnalysisView";
import type { StartPayload } from "@/components/IntroSection";

function useQuery(): URLSearchParams {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AnalysisPage() {
  const q = useQuery();
  const modeParam = q.get("mode");
  const valueParam = q.get("value") || "";

  const source: StartPayload | undefined = modeParam === "search" || modeParam === "link"
    ? { mode: modeParam as StartPayload["mode"], value: valueParam }
    : undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <AnalysisView source={source} />
      </main>
    </div>
  );
}



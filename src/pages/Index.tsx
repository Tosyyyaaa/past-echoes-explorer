import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { IntroSection, type StartPayload } from "@/components/IntroSection";
import { AnalysisView } from "@/components/AnalysisView";
import { analyzeArticle, clearOutput, type AnalysisResult } from "@/lib/api";

const Index = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [source, setSource] = useState<StartPayload | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: analyzeArticle,
    onSuccess: (data) => {
      setAnalysis(data);
    },
  });

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearOutput();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearOutput();
    };
  }, []);

  const handleStart = (payload: StartPayload) => {
    setSource(payload);
    setShowAnalysis(true);
    setAnalysis(null);
    const input =
      payload.mode === "link"
        ? { articleUrl: payload.value }
        : { articleText: payload.value };
    analyzeMutation.mutate(input);
  };

  const handleBack = () => {
    setShowAnalysis(false);
    setSource(null);
    setAnalysis(null);
    analyzeMutation.reset();
    clearOutput();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onBack={showAnalysis ? handleBack : undefined} />
      
      <main className="container mx-auto pb-12 relative">
        {/* Watermark behind content */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src="/compass-watermark.svg"
            alt=""
            className="opacity-5 select-none max-w-[70%] md:max-w-[45%]"
          />
        </div>
        {!showAnalysis ? (
          <IntroSection onStart={handleStart} />
        ) : (
          <AnalysisView
            source={source || undefined}
            analysis={analysis}
            isLoading={analyzeMutation.isLoading}
            error={
              analyzeMutation.error instanceof Error
                ? analyzeMutation.error.message
                : null
            }
            onRetry={() => {
              if (!source) return;
              handleStart(source);
            }}
          />
        )}
      </main>

      <footer className="text-center py-10 text-sm text-muted-foreground border-t-2 border-border">
        <div className="fade-up-slow">
          <p className="font-display italic text-sm">
            "Those who cannot remember the past are condemned to repeat it."
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">— George Santayana</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

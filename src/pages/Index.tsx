import { useState } from "react";
import { Header } from "@/components/Header";
import { IntroSection, type StartPayload } from "@/components/IntroSection";
import { AnalysisView } from "@/components/AnalysisView";

const Index = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [source, setSource] = useState<StartPayload | null>(null);

  const handleStart = (payload: StartPayload) => {
    setSource(payload);
    setShowAnalysis(true);
  };

  const handleBack = () => {
    setShowAnalysis(false);
    setSource(null);
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
          <AnalysisView source={source || undefined} />
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

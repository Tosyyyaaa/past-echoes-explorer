import { useState } from "react";
import { Header } from "@/components/Header";
import { IntroSection } from "@/components/IntroSection";
import { AnalysisView } from "@/components/AnalysisView";

const Index = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleStart = () => {
    setShowAnalysis(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto pb-12">
        {!showAnalysis ? (
          <IntroSection onStart={handleStart} />
        ) : (
          <AnalysisView />
        )}
      </main>

      <footer className="text-center py-8 text-sm text-muted-foreground border-t border-border/50">
        <p className="font-handwriting">
          Uncover patterns, challenge narratives, understand history.
        </p>
      </footer>
    </div>
  );
};

export default Index;

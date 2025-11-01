import { Header } from "@/components/Header";
import VerticalTimeline from "@/components/VerticalTimeline";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto pb-12 relative">
        {/* Watermark behind content */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <img
            src="/compass-watermark.svg"
            alt=""
            className="opacity-5 select-none max-w-[70%] md:max-w-[45%]"
          />
        </div>
        <div className="max-w-6xl mx-auto pt-6 space-y-8">
          <div className="text-center">
            <p className="text-xl leading-relaxed text-primary font-montserrat fade-in-soft" style={{animationDelay: "120ms"}}>
              Walk the corridor of time — scroll down the spine to explore eras and events.
            </p>
          </div>
          <VerticalTimeline />
        </div>
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

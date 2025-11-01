import Interactive3DTimeline from "@/components/interactive-3d-timeline/Interactive3DTimeline";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Interactive3DTimeline />
      </main>
    </div>
  );
};

export default Index;

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Search as SearchIcon } from "lucide-react";

interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  year: number;
  side: "left" | "right";
  period: "ancient" | "renaissance" | "industrial" | "modern";
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 1, title: "Egyptian Pyramids", description: "Construction of the Great Pyramids of Giza begins", year: 2560, side: "left", period: "ancient" },
  { id: 2, title: "Roman Empire", description: "Rise of the Roman civilization and influence across Europe", year: 27, side: "right", period: "ancient" },
  { id: 3, title: "Fall of Rome", description: "End of the Western Roman Empire", year: 476, side: "left", period: "ancient" },
  { id: 31, title: "Great Wall of China", description: "Construction of the Great Wall begins to protect borders", year: 1644, side: "right", period: "ancient" },
  { id: 32, title: "Golden Age of Greece", description: "Classical Greece flourishes with philosophy, art, and democracy", year: 450, side: "left", period: "ancient" },
  { id: 33, title: "Silk Road Trade", description: "Establishment of the Silk Road connecting East and West", year: 130, side: "right", period: "ancient" },
  { id: 4, title: "Gutenberg Press", description: "Invention of the printing press revolutionizes communication", year: 1440, side: "right", period: "renaissance" },
  { id: 5, title: "Leonardo da Vinci", description: "Renaissance master creates revolutionary artistic and scientific works", year: 1490, side: "left", period: "renaissance" },
  { id: 6, title: "Age of Exploration", description: "European explorers discover new continents and trade routes", year: 1492, side: "right", period: "renaissance" },
  { id: 34, title: "Michelangelo's Sistine Chapel", description: "Completion of one of history's greatest artistic masterpieces", year: 1512, side: "left", period: "renaissance" },
  { id: 35, title: "Copernican Revolution", description: "Nicolaus Copernicus challenges geocentric view of the universe", year: 1543, side: "right", period: "renaissance" },
  { id: 36, title: "Shakespeare's Works", description: "William Shakespeare transforms literature and theater forever", year: 1590, side: "left", period: "renaissance" },
  { id: 7, title: "Steam Engine", description: "James Watt perfects the steam engine, powering the Industrial Revolution", year: 1769, side: "left", period: "industrial" },
  { id: 8, title: "Industrial Revolution", description: "Rapid industrialization transforms society and economy", year: 1820, side: "right", period: "industrial" },
  { id: 9, title: "Telegraph", description: "Samuel Morse invents the telegraph for long-distance communication", year: 1844, side: "left", period: "industrial" },
  { id: 37, title: "Railway Age", description: "Railways revolutionize transportation and connect continents", year: 1830, side: "left", period: "industrial" },
  { id: 38, title: "Electric Light", description: "Thomas Edison develops the practical incandescent light bulb", year: 1879, side: "right", period: "industrial" },
  { id: 39, title: "Automobile Revolution", description: "Karl Benz invents the first practical automobile", year: 1885, side: "left", period: "industrial" },
  { id: 40, title: "Aviation Breakthrough", description: "Wright brothers achieve the first powered flight", year: 1903, side: "right", period: "industrial" },
  { id: 10, title: "World War I", description: "The Great War reshapes global politics and society", year: 1914, side: "right", period: "modern" },
  { id: 11, title: "Digital Revolution", description: "Computers and the internet emerge, changing everything", year: 1985, side: "left", period: "modern" },
  { id: 12, title: "Today", description: "Artificial intelligence and global connectivity define our era", year: 2025, side: "right", period: "modern" },
  { id: 41, title: "Space Age", description: "Humans reach space and land on the moon", year: 1969, side: "left", period: "modern" },
  { id: 42, title: "Internet Revolution", description: "World Wide Web connects billions of people globally", year: 1991, side: "right", period: "modern" },
  { id: 43, title: "Smartphone Era", description: "Mobile technology transforms human communication and work", year: 2007, side: "left", period: "modern" },
  { id: 44, title: "AI Transformation", description: "Artificial intelligence begins reshaping industries and society", year: 2020, side: "right", period: "modern" },
];

export default function Timeline3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const autoScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [widgetMode, setWidgetMode] = useState<"search" | "link">("search");
  const [widgetValue, setWidgetValue] = useState("");

  const filteredEvents = TIMELINE_EVENTS; // show all events

  // Auto-scrolling: fast, stop at last event (no wrap)
  useEffect(() => {
    if (!scrollContainerRef.current || filteredEvents.length === 0) return;
    if (currentEventIndex >= filteredEvents.length - 1) {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
        autoScrollTimeoutRef.current = null;
      }
      return;
    }
    if (autoScrollTimeoutRef.current) clearTimeout(autoScrollTimeoutRef.current);
    autoScrollTimeoutRef.current = setTimeout(() => {
      setCurrentEventIndex((prev) => Math.min(prev + 1, filteredEvents.length - 1));
    }, 600);
    return () => {
      if (autoScrollTimeoutRef.current) clearTimeout(autoScrollTimeoutRef.current);
    };
  }, [currentEventIndex, filteredEvents.length]);

  useEffect(() => {
    const eventElements = scrollContainerRef.current?.querySelectorAll("[data-event-id]");
    if (eventElements && eventElements[currentEventIndex]) {
      const element = eventElements[currentEventIndex] as HTMLElement;
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentEventIndex]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gradient-to-b from-[#1f1813] via-[#2a2420] to-[#1f1813] overflow-hidden">
      <div className="h-full w-full flex">
        {/* Timeline */}
        <div className="relative flex-1 min-w-0 h-full">
          <div className="flex h-full items-center pt-48">
            <div
              ref={scrollContainerRef}
              className="flex-1 h-full overflow-y-auto overflow-x-hidden scroll-smooth"
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="relative px-8 py-12">
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d4af37] via-[#d4af37] to-[#a89968] transform -translate-x-1/2" />

                <div className="space-y-24">
                  {filteredEvents.map((event, index) => (
                    <div
                      key={event.id}
                      data-event-id={event.id}
                      className={`relative flex items-center transition-all duration-700 ${
                        index === currentEventIndex ? "opacity-100 scale-100" : "opacity-60 scale-95"
                      }`}
                    >
                      {event.side === "left" ? (
                        <>
                          <div className="flex-1 text-right pr-12">
                            <div className="inline-block w-fit max-w-md bg-black/40 backdrop-blur border border-[#d4af37]/30 rounded-lg p-6 hover:border-[#d4af37]/60 transition">
                              <p className="text-[#a89968] text-xs uppercase tracking-widest mb-2">Year {event.year}</p>
                              <h3 className="text-2xl font-serif font-light text-[#d4af37] mb-2">{event.title}</h3>
                              <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>
                            </div>
                          </div>
                          <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center pointer-events-none">
                            <div
                              className={`w-6 h-6 rounded-full border-2 border-[#d4af37] bg-[#1f1813] transition-all ${
                                index === currentEventIndex ? "scale-150 shadow-lg shadow-[#d4af37]" : "scale-100"
                              }`}
                            />
                          </div>
                          <div className="flex-1" />
                        </>
                      ) : (
                        <>
                          <div className="flex-1" />
                          <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center pointer-events-none">
                            <div
                              className={`w-6 h-6 rounded-full border-2 border-[#d4af37] bg-[#1f1813] transition-all ${
                                index === currentEventIndex ? "scale-150 shadow-lg shadow-[#d4af37]" : "scale-100"
                              }`}
                            />
                          </div>
                          <div className="flex-1 text-left pl-12">
                            <div className="inline-block w-fit max-w-md bg-black/40 backdrop-blur border border-[#d4af37]/30 rounded-lg p-6 hover:border-[#d4af37]/60 transition">
                              <p className="text-[#a89968] text-xs uppercase tracking-widest mb-2">Year {event.year}</p>
                              <h3 className="text-2xl font-serif font-light text-[#d4af37] mb-2">{event.title}</h3>
                              <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* No Prev/Next controls */}
        </div>
      </div>

      {/* Floating Analyse widget (top-right) */}
      <div className="pointer-events-none absolute top-6 right-6 z-30">
        <div className="pointer-events-auto paper-surface border-2 border-[#d4af37]/40 rounded-xl p-4 shadow-xl w-[360px]">
          <Tabs defaultValue="search" onValueChange={(v) => { setWidgetMode(v as any); setWidgetValue(""); }}>
            <TabsList className="w-full">
              <TabsTrigger value="search" className="flex-1"><SearchIcon className="w-4 h-4 mr-2" /> Search event</TabsTrigger>
              <TabsTrigger value="link" className="flex-1"><LinkIcon className="w-4 h-4 mr-2" /> Paste link</TabsTrigger>
            </TabsList>
            <TabsContent value="search">
              <div className="mt-3">
                <Input
                  value={widgetValue}
                  onChange={(e) => setWidgetValue(e.target.value)}
                  placeholder="Search an event..."
                  className="focus-glow"
                />
              </div>
            </TabsContent>
            <TabsContent value="link">
              <div className="mt-3">
                <Input
                  type="url"
                  value={widgetValue}
                  onChange={(e) => setWidgetValue(e.target.value)}
                  placeholder="Paste article URL"
                  className="focus-glow"
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                if (widgetMode === "search") {
                  const q = widgetValue.trim().toLowerCase();
                  if (!q) return;
                  const idx = TIMELINE_EVENTS.findIndex((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || String(e.year).includes(q));
                  if (idx >= 0) setCurrentEventIndex(idx);
                } else {
                  // placeholder for link analysis
                }
              }}
              className="btn-embossed"
            >
              Analyse
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}




export type Theme = "wars" | "culture" | "politics" | "science";

export interface EraEvent {
  id: string;
  title: string;
  year: string;
  preview: string;
  country?: string;
  region?: string;
  themes: Theme[];
}

export interface Era {
  id: string;
  name: string;
  range: string; // e.g., "c. 3000 BCE – 500 CE"
  summary: string;
  events: EraEvent[];
}

export const ERAS: Era[] = [
  {
    id: "ancient",
    name: "Ancient",
    range: "c. 3000 BCE – 500 CE",
    summary:
      "Early civilisations, empires, and foundational sciences, philosophy, and statecraft across the Mediterranean and Asia.",
    events: [
      {
        id: "athenian-democracy",
        title: "Athenian Democracy",
        year: "5th c. BCE",
        preview: "Direct democracy flourishes in Athens, shaping ideas of citizenship.",
        region: "Europe",
        themes: ["politics", "culture"],
      },
      {
        id: "roman-republic-to-empire",
        title: "Roman Republic to Empire",
        year: "27 BCE",
        preview: "Power consolidates under Augustus; institutions evolve for imperial rule.",
        region: "Europe",
        themes: ["politics", "wars"],
      },
      {
        id: "qin-unification",
        title: "Qin Unification of China",
        year: "221 BCE",
        preview: "First Chinese empire centralises power, standardises script and measures.",
        region: "Asia",
        themes: ["politics", "science"],
      },
    ],
  },
  {
    id: "renaissance",
    name: "Renaissance",
    range: "14th – 17th c.",
    summary:
      "Humanism and a revival of classical learning spark transformations in art, science, and politics across Europe.",
    events: [
      {
        id: "printing-press",
        title: "Gutenberg Printing Press",
        year: "c. 1450",
        preview: "Rapid spread of ideas reshapes religion, education, and power.",
        region: "Europe",
        themes: ["culture", "science"],
      },
      {
        id: "reformation",
        title: "The Reformation",
        year: "1517",
        preview: "Religious schisms trigger conflicts and new political orders.",
        region: "Europe",
        themes: ["politics", "wars", "culture"],
      },
      {
        id: "age-of-discovery",
        title: "Age of Discovery",
        year: "15th–17th c.",
        preview: "Maritime exploration connects continents and reshapes economies.",
        region: "Global",
        themes: ["science", "politics"],
      },
    ],
  },
  {
    id: "industrial",
    name: "Industrial",
    range: "18th – 19th c.",
    summary:
      "Mechanisation, steam power, and global trade accelerate social change and urban growth.",
    events: [
      {
        id: "steam-revolution",
        title: "Steam Revolution",
        year: "c. 1780–1830",
        preview: "Factories, railways, and new labour patterns transform production.",
        region: "Europe",
        themes: ["science", "politics"],
      },
      {
        id: "meiji-restoration",
        title: "Meiji Restoration",
        year: "1868",
        preview: "Japan’s rapid modernisation and state re-organisation.",
        region: "Asia",
        themes: ["politics", "culture", "science"],
      },
      {
        id: "american-civil-war",
        title: "American Civil War",
        year: "1861–1865",
        preview: "Union preserved; slavery abolished; federal power redefined.",
        region: "Americas",
        themes: ["wars", "politics"],
      },
    ],
  },
  {
    id: "modern",
    name: "Modern",
    range: "20th – 21st c.",
    summary:
      "Global conflicts, decolonisation, technological revolutions, and interconnected economies and media.",
    events: [
      {
        id: "ww1",
        title: "First World War",
        year: "1914–1918",
        preview: "Industrialised warfare reshapes borders and societies.",
        region: "Europe",
        themes: ["wars", "politics"],
      },
      {
        id: "decolonisation",
        title: "Decolonisation",
        year: "1945–1975",
        preview: "New nations emerge; Cold War dynamics influence alignments.",
        region: "Global",
        themes: ["politics", "culture"],
      },
      {
        id: "digital-revolution",
        title: "Digital Revolution",
        year: "late 20th – 21st c.",
        preview: "Computing, internet, and AI transform communication and work.",
        region: "Global",
        themes: ["science", "culture"],
      },
    ],
  },
];

export function getEraById(id: string): Era | undefined {
  return ERAS.find((e) => e.id === id);
}

export function getEventById(eventId: string): { era: Era; event: EraEvent } | undefined {
  for (const era of ERAS) {
    const event = era.events.find((ev) => ev.id === eventId);
    if (event) return { era, event };
  }
}


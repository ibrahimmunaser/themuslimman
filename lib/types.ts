// Legacy plan type kept only for existing content filters; plan-based gating
// is being phased out in favor of class-based release rules.
export type Plan = "essentials" | "complete";

export type AssetType =
  | "video"
  | "audio"
  | "briefing"
  | "statementOfFacts"
  | "studyGuide"
  | "report"
  | "mindmap"
  | "infographic"
  | "slides";

export interface QuizQuestion {
  id: string;
  question_number: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  tags: string[];
}

export interface Quiz {
  part: number;
  question_count: number;
  questions: QuizQuestion[];
}

export interface InfographicSet {
  concise?: string;
  standard?: string;
  bentoGrid?: string;
}

export interface SlideSet {
  presented: string[];
  detailed: string[];
  facts: string[];
}

export interface Flashcard {
  id: string;
  card_number: number;
  side1: string;
  side2: string;
  tags: string[];
}

export type FlashcardLevel = "easy" | "medium" | "full";

export interface FlashcardSet {
  part: number;
  counts: Record<FlashcardLevel, number>;
  easy: Flashcard[];
  medium: Flashcard[];
  full: Flashcard[];
}

export interface PartAssets {
  videoUrl?: string;
  audioUrl?: string;
  briefingText?: string;
  statementOfFactsText?: string;
  studyGuideText?: string;
  reportText?: string;
  mindmapUrl?: string;
  infographics?: InfographicSet;
  slides?: SlideSet;
  quiz?: Quiz;
  flashcards?: FlashcardSet;
}

export type Era =
  | "pre-islamic"
  | "birth-early-life"
  | "early-revelation"
  | "makkah-persecution"
  | "hijrah"
  | "madinah"
  | "campaigns"
  | "final-years";

export interface EraInfo {
  id: Era;
  label: string;
  description: string;
  color: string;
}

export interface Part {
  id: string;
  partNumber: number;
  title: string;
  subtitle?: string;
  era: Era;
  description: string;
  duration?: string;
  includedInEssentials: boolean;
  assets: PartAssets;
}

export const ERAS: EraInfo[] = [
  {
    id: "pre-islamic",
    label: "Pre-Islamic Arabia",
    description: "The world before the final revelation",
    color: "#8B6F45",
  },
  {
    id: "birth-early-life",
    label: "Birth & Early Life",
    description: "The coming of the Prophet ﷺ",
    color: "#7A6B9E",
  },
  {
    id: "early-revelation",
    label: "Beginning of Revelation",
    description: "The first light of Islam",
    color: "#4A8C6E",
  },
  {
    id: "makkah-persecution",
    label: "Makkah — Persecution",
    description: "Years of trial and steadfastness",
    color: "#8C4A4A",
  },
  {
    id: "hijrah",
    label: "The Hijrah",
    description: "The great migration that changed history",
    color: "#4A6E8C",
  },
  {
    id: "madinah",
    label: "Madinah Period",
    description: "Building the first Muslim society",
    color: "#6E8C4A",
  },
  {
    id: "campaigns",
    label: "Major Campaigns",
    description: "The trials and triumphs of the Ummah",
    color: "#8C6E4A",
  },
  {
    id: "final-years",
    label: "Final Years & Legacy",
    description: "The farewell and eternal impact",
    color: "#C8A96E",
  },
];

export const ERA_MAP = Object.fromEntries(ERAS.map((e) => [e.id, e])) as Record<Era, EraInfo>;

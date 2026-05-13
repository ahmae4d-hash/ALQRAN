export interface Surah {
  number: number;
  name: string;
  nameArabic: string;
  nameTranslation: string;
  revelation: "Meccan" | "Medinan";
  versesCount: number;
  pages: [number, number];
  juz: number[];
}

export interface Verse {
  number: number;
  surahNumber: number;
  text: string;
  textNormalized?: string;
  page: number;
  juz: number;
  hizb: number;
  sajda?: boolean;
}

export interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  style: string;
  narration: string;
  everyayahFolder: string;
  mp3quranId?: string;
  available: boolean;
}

export interface TafsirVerse {
  verseNumber: number;
  surahNumber: number;
  text: string;
  source: string;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  verseNumber: number;
  note?: string;
  createdAt: number;
  label?: string;
}

export interface MemorizationProgress {
  surahNumber: number;
  verseNumber: number;
  status: "not_started" | "learning" | "memorized" | "reviewing";
  lastReviewed?: number;
  reviewCount: number;
  confidence: number;
}

export interface QuizQuestion {
  type: "complete" | "identify_surah" | "multiple_choice" | "fill_blank";
  surahNumber: number;
  verseNumber: number;
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "auto";
  fontSize: number;
  fontFamily: "uthmanic" | "naskh" | "kufi" | "default";
  selectedReciterId: string;
  narration: string;
  tafsirSource: string;
  displayMode: "page" | "surah" | "continuous";
  wordByWord: boolean;
  autoAdvance: boolean;
  repeatVerse: boolean;
  repeatCount: number;
  playbackSpeed: number;
  language: "ar" | "en";
  showTajweedColors: boolean;
  lastRead?: { surahNumber: number; verseNumber: number };
}

export interface ReadingSession {
  surahNumber: number;
  verseNumber: number;
  timestamp: number;
  duration?: number;
}

export interface DailyGoal {
  type: "verses" | "pages" | "minutes";
  target: number;
  current: number;
  date: string;
}

export type NarrationId = "hafs" | "warsh" | "qalun" | "aldouri" | "shuaba";

export interface Narration {
  id: NarrationId;
  name: string;
  nameArabic: string;
  apiEdition: string;
}

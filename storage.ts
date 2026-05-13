import { openDB } from "idb";
import type { Bookmark, MemorizationProgress, UserSettings, ReadingSession, DailyGoal } from "./types";

const DB_NAME = "user-data-db";
const DB_VERSION = 1;

async function getUserDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("bookmarks")) {
        const bm = db.createObjectStore("bookmarks", { keyPath: "id" });
        bm.createIndex("surah", "surahNumber");
      }
      if (!db.objectStoreNames.contains("memorization")) {
        const mem = db.createObjectStore("memorization", { keyPath: "id" });
        mem.createIndex("surah", "surahNumber");
        mem.createIndex("status", "status");
      }
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
      }
    },
  });
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "auto",
  fontSize: 24,
  fontFamily: "uthmanic",
  selectedReciterId: "yasser_dosari",
  narration: "hafs",
  tafsirSource: "ar.muyassar",
  displayMode: "surah",
  wordByWord: false,
  autoAdvance: true,
  repeatVerse: false,
  repeatCount: 3,
  playbackSpeed: 1.0,
  language: "ar",
  showTajweedColors: false,
};

export async function getSettings(): Promise<UserSettings> {
  const db = await getUserDB();
  const saved = await db.get("settings", "main");
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  const db = await getUserDB();
  const current = await getSettings();
  await db.put("settings", { ...current, ...settings }, "main");
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const db = await getUserDB();
  return db.getAll("bookmarks");
}

export async function addBookmark(bookmark: Omit<Bookmark, "id" | "createdAt">): Promise<Bookmark> {
  const db = await getUserDB();
  const bm: Bookmark = {
    ...bookmark,
    id: `${bookmark.surahNumber}:${bookmark.verseNumber}:${Date.now()}`,
    createdAt: Date.now(),
  };
  await db.put("bookmarks", bm);
  return bm;
}

export async function removeBookmark(id: string): Promise<void> {
  const db = await getUserDB();
  await db.delete("bookmarks", id);
}

export async function isBookmarked(surahNumber: number, verseNumber: number): Promise<boolean> {
  const db = await getUserDB();
  const all = await db.getAllFromIndex("bookmarks", "surah", surahNumber);
  return all.some((b) => (b as Bookmark).verseNumber === verseNumber);
}

export async function getMemorizationProgress(surahNumber?: number): Promise<MemorizationProgress[]> {
  const db = await getUserDB();
  if (surahNumber !== undefined) {
    return db.getAllFromIndex("memorization", "surah", surahNumber) as Promise<MemorizationProgress[]>;
  }
  return db.getAll("memorization") as Promise<MemorizationProgress[]>;
}

export async function updateMemorizationProgress(
  surahNumber: number,
  verseNumber: number,
  update: Partial<MemorizationProgress>
): Promise<void> {
  const db = await getUserDB();
  const id = `${surahNumber}:${verseNumber}`;
  const existing = await db.get("memorization", id) as MemorizationProgress | undefined;
  const progress: MemorizationProgress = {
    surahNumber,
    verseNumber,
    status: "not_started",
    reviewCount: 0,
    confidence: 0,
    ...existing,
    ...update,
    lastReviewed: Date.now(),
  };
  await db.put("memorization", { ...progress, id });
}

export async function saveReadingSession(session: ReadingSession): Promise<void> {
  const db = await getUserDB();
  await db.add("sessions", session);
}

export async function getRecentSessions(limit = 10): Promise<ReadingSession[]> {
  const db = await getUserDB();
  const all = await db.getAll("sessions") as ReadingSession[];
  return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export async function getDailyGoal(): Promise<DailyGoal> {
  const db = await getUserDB();
  const today = new Date().toDateString();
  const stored = await db.get("settings", "daily_goal") as DailyGoal | undefined;
  if (stored?.date === today) return stored;
  const goal: DailyGoal = { type: "verses", target: 10, current: 0, date: today };
  await db.put("settings", goal, "daily_goal");
  return goal;
}

export async function incrementDailyProgress(verses = 1): Promise<DailyGoal> {
  const db = await getUserDB();
  const goal = await getDailyGoal();
  const updated = { ...goal, current: goal.current + verses };
  await db.put("settings", updated, "daily_goal");
  return updated;
}

export async function getOverallStats(): Promise<{
  totalMemorized: number;
  totalBookmarks: number;
  totalSessions: number;
  surahsStarted: number;
}> {
  const db = await getUserDB();
  const memorization = await db.getAll("memorization") as (MemorizationProgress & { id: string })[];
  const bookmarks = await db.getAll("bookmarks");
  const sessions = await db.getAll("sessions");
  const surahsStarted = new Set(memorization.map((m) => m.surahNumber)).size;
  return {
    totalMemorized: memorization.filter((m) => m.status === "memorized").length,
    totalBookmarks: bookmarks.length,
    totalSessions: sessions.length,
    surahsStarted,
  };
}

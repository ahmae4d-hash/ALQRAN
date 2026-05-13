import { openDB, type IDBPDatabase } from "idb";
import type { Verse } from "./types";

const DB_NAME = "quran-db";
const DB_VERSION = 2;
const STORE_VERSES = "verses";
const STORE_META = "meta";

let _db: IDBPDatabase | null = null;

async function getDB() {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_VERSES)) {
        const store = db.createObjectStore(STORE_VERSES, { keyPath: "id" });
        store.createIndex("surah", "surahNumber");
        store.createIndex("juz", "juz");
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }
    },
  });
  return _db;
}

export interface ApiVerse {
  number: number;
  text: string;
  surah: { number: number; name: string; englishName: string; numberOfAyahs: number };
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export async function fetchAndCacheSurah(surahNumber: number, edition = "quran-uthmani"): Promise<Verse[]> {
  const db = await getDB();
  const cached = await db.getAllFromIndex(STORE_VERSES, "surah", surahNumber);
  if (cached.length > 0) {
    return cached as Verse[];
  }

  const response = await fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/${edition}`
  );
  if (!response.ok) throw new Error(`Failed to fetch surah ${surahNumber}`);
  const data = await response.json();
  const ayahs: ApiVerse[] = data.data.ayahs;

  const verses: Verse[] = ayahs.map((a) => ({
    id: `${surahNumber}:${a.numberInSurah}`,
    number: a.numberInSurah,
    surahNumber,
    text: a.text,
    page: a.page,
    juz: a.juz,
    hizb: a.hizbQuarter,
    sajda: a.sajda !== false,
  }));

  const tx = db.transaction(STORE_VERSES, "readwrite");
  await Promise.all(verses.map((v) => tx.store.put(v)));
  await tx.done;

  return verses;
}

export async function getSurahVerses(surahNumber: number, edition = "quran-uthmani"): Promise<Verse[]> {
  return fetchAndCacheSurah(surahNumber, edition);
}

export async function getVerse(surahNumber: number, verseNumber: number, edition = "quran-uthmani"): Promise<Verse | undefined> {
  await fetchAndCacheSurah(surahNumber, edition);
  const db = await getDB();
  return db.get(STORE_VERSES, `${surahNumber}:${verseNumber}`);
}

export async function searchQuran(query: string): Promise<{ surahNumber: number; verseNumber: number; text: string }[]> {
  const response = await fetch(
    `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/ar`
  );
  if (!response.ok) return [];
  const data = await response.json();
  if (!data.data?.matches) return [];
  return data.data.matches.slice(0, 50).map((m: ApiVerse) => ({
    surahNumber: m.surah.number,
    verseNumber: m.numberInSurah,
    text: m.text,
  }));
}

export async function clearCache(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_VERSES);
  await db.clear(STORE_META);
}

export async function isSurahCached(surahNumber: number): Promise<boolean> {
  const db = await getDB();
  const count = await db.countFromIndex(STORE_VERSES, "surah", surahNumber);
  return count > 0;
}

export async function getCachedSurahCount(): Promise<number> {
  const db = await getDB();
  const allKeys = await db.getAllKeys(STORE_VERSES);
  const surahNums = new Set(allKeys.map((k) => Number(String(k).split(":")[0])));
  return surahNums.size;
}

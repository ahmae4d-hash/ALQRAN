import { openDB } from "idb";

const DB_NAME = "tafsir-db";
const DB_VERSION = 1;
const STORE_TAFSIR = "tafsir";

export interface TafsirEntry {
  id: string;
  surahNumber: number;
  verseNumber: number;
  text: string;
  source: string;
}

export const TAFSIR_EDITIONS = [
  { id: "ar.muyassar", name: "الميسر", nameArabic: "تفسير الميسر" },
  { id: "ar.jalalayn", name: "Jalalayn", nameArabic: "تفسير الجلالين" },
  { id: "ar.waseet", name: "Al-Waseet", nameArabic: "تفسير الوسيط" },
  { id: "ar.katheer", name: "Ibn Kathir", nameArabic: "تفسير ابن كثير" },
  { id: "ar.tabari", name: "Al-Tabari", nameArabic: "تفسير الطبري" },
  { id: "ar.qurtubi", name: "Al-Qurtubi", nameArabic: "تفسير القرطبي" },
];

async function getTafsirDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_TAFSIR)) {
        const store = db.createObjectStore(STORE_TAFSIR, { keyPath: "id" });
        store.createIndex("surah", "surahNumber");
      }
    },
  });
}

export async function getTafsirForVerse(
  surahNumber: number,
  verseNumber: number,
  edition = "ar.muyassar"
): Promise<TafsirEntry | null> {
  const db = await getTafsirDB();
  const id = `${edition}:${surahNumber}:${verseNumber}`;
  const cached = await db.get(STORE_TAFSIR, id);
  if (cached) return cached as TafsirEntry;

  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surahNumber}:${verseNumber}/${edition}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    const entry: TafsirEntry = {
      id,
      surahNumber,
      verseNumber,
      text: data.data.text,
      source: edition,
    };
    await db.put(STORE_TAFSIR, entry);
    return entry;
  } catch {
    return null;
  }
}

export async function getTafsirForSurah(
  surahNumber: number,
  edition = "ar.muyassar"
): Promise<TafsirEntry[]> {
  const db = await getTafsirDB();
  const cached = await db.getAllFromIndex(STORE_TAFSIR, "surah", surahNumber);
  const cachedEdition = cached.filter((c) => (c as TafsirEntry).source === edition);
  if (cachedEdition.length > 0) return cachedEdition as TafsirEntry[];

  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/${edition}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    const entries: TafsirEntry[] = data.data.ayahs.map((a: { numberInSurah: number; text: string }) => ({
      id: `${edition}:${surahNumber}:${a.numberInSurah}`,
      surahNumber,
      verseNumber: a.numberInSurah,
      text: a.text,
      source: edition,
    }));
    const tx = db.transaction(STORE_TAFSIR, "readwrite");
    await Promise.all(entries.map((e) => tx.store.put(e)));
    await tx.done;
    return entries;
  } catch {
    return [];
  }
}

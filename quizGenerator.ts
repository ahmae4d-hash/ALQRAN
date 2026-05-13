import type { Verse, QuizQuestion } from "./types";
import { SURAHS } from "./surahs";

/** Remove Arabic diacritics for loose comparison */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // Remove tashkeel
    .replace(/\u0622/g, "\u0627")           // آ -> ا
    .replace(/\u0623/g, "\u0627")           // أ -> ا
    .replace(/\u0625/g, "\u0627")           // إ -> ا
    .replace(/\u0629/g, "\u0647")           // ة -> ه
    .replace(/\u0649/g, "\u064A")           // ى -> ي
    .replace(/\s+/g, " ")
    .trim();
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeArabic(userAnswer) === normalizeArabic(correctAnswer);
}

export function generateFillBlankQuestion(verse: Verse, allVerses: Verse[]): QuizQuestion {
  const words = verse.text.split(/\s+/).filter(Boolean);
  if (words.length < 4) return generateIdentifySurahQuestion(verse);

  const blankIdx = Math.floor(words.length * 0.55);
  const answer = words[blankIdx];
  const question = [...words];
  question[blankIdx] = "＿＿＿";
  const surahName = SURAHS.find((s) => s.number === verse.surahNumber)?.nameArabic ?? "";

  return {
    type: "fill_blank",
    surahNumber: verse.surahNumber,
    verseNumber: verse.number,
    question: `أكمل الآية الكريمة من سورة ${surahName} (الآية ${verse.number}):\n\n${question.join(" ")}`,
    answer,
    hint: `الكلمة المحذوفة تبدأ بـ "${answer.charAt(0)}"`,
  };
}

export function generateMultipleChoiceQuestion(verse: Verse, allVerses: Verse[]): QuizQuestion {
  const surahName = SURAHS.find((s) => s.number === verse.surahNumber)?.nameArabic ?? "";
  const words = verse.text.split(/\s+/).filter(Boolean);
  const midPoint = Math.max(2, Math.floor(words.length * 0.4));
  const firstHalf = words.slice(0, midPoint).join(" ");
  const correctAnswer = words.slice(midPoint).join(" ");

  const pool = allVerses
    .filter((v) => !(v.surahNumber === verse.surahNumber && v.number === verse.number) && v.text.split(/\s+/).length > midPoint)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((v) => v.text.split(/\s+/).slice(midPoint).join(" "));

  const options = [...pool, correctAnswer].sort(() => Math.random() - 0.5);

  return {
    type: "multiple_choice",
    surahNumber: verse.surahNumber,
    verseNumber: verse.number,
    question: `من سورة ${surahName} — أكمل الآية:\n\n"${firstHalf} ..."`,
    answer: correctAnswer,
    options,
  };
}

export function generateIdentifySurahQuestion(verse: Verse): QuizQuestion {
  const correctSurah = SURAHS.find((s) => s.number === verse.surahNumber);
  const wrongSurahs = SURAHS
    .filter((s) => s.number !== verse.surahNumber)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((s) => s.nameArabic);

  const options = [...wrongSurahs, correctSurah?.nameArabic ?? ""].sort(() => Math.random() - 0.5);

  return {
    type: "identify_surah",
    surahNumber: verse.surahNumber,
    verseNumber: verse.number,
    question: `من أي سورة هذه الآية الكريمة؟\n\n﴿ ${verse.text} ﴾`,
    answer: correctSurah?.nameArabic ?? "",
    options,
  };
}

export function generateCompleteVerseQuestion(verse: Verse): QuizQuestion {
  const surahName = SURAHS.find((s) => s.number === verse.surahNumber)?.nameArabic ?? "";
  const words = verse.text.split(/\s+/).filter(Boolean);
  const cutPoint = Math.max(2, Math.floor(words.length * 0.4));
  const firstPart = words.slice(0, cutPoint).join(" ");
  const answer = words.slice(cutPoint).join(" ");

  return {
    type: "complete",
    surahNumber: verse.surahNumber,
    verseNumber: verse.number,
    question: `أكمل الآية الكريمة من سورة ${surahName}:\n\n﴿ ${firstPart} ... ﴾`,
    answer,
    hint: `الآية رقم ${verse.number} — ${surahName}`,
  };
}

export function generateQuiz(verses: Verse[], count = 10): QuizQuestion[] {
  if (verses.length === 0) return [];
  const shuffled = [...verses].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, verses.length));
  return selected.map((verse, i) => {
    const r = i % 4;
    if (r === 0) return generateFillBlankQuestion(verse, verses);
    if (r === 1) return generateMultipleChoiceQuestion(verse, verses);
    if (r === 2) return generateIdentifySurahQuestion(verse);
    return generateCompleteVerseQuestion(verse);
  });
}

import type { Reciter, Narration, NarrationId } from "./types";

export const NARRATIONS: Narration[] = [
  { id: "hafs", name: "Hafs", nameArabic: "حفص عن عاصم", apiEdition: "quran-uthmani" },
  { id: "warsh", name: "Warsh", nameArabic: "ورش عن نافع", apiEdition: "quran-warsh-assori" },
  { id: "qalun", name: "Qalun", nameArabic: "قالون عن نافع", apiEdition: "quran-qaloon" },
  { id: "aldouri", name: "Al-Douri", nameArabic: "الدوري عن أبي عمرو", apiEdition: "quran-dori" },
  { id: "shuaba", name: "Shu'ba", nameArabic: "شعبة عن عاصم", apiEdition: "quran-shuubah-asim" },
];

export const getNarration = (id: NarrationId): Narration =>
  NARRATIONS.find((n) => n.id === id) ?? NARRATIONS[0];

export const MAQAMAT = [
  { id: "bayati", nameArabic: "بياتي", description: "المقام الأكثر شيوعاً في التلاوة - نغمة دافئة عميقة" },
  { id: "rast", nameArabic: "راست", description: "مقام متوازن يُشيع الطمأنينة" },
  { id: "hijaz", nameArabic: "حجاز", description: "مقام خليجي يُعبّر عن الشوق والحنين" },
  { id: "saba", nameArabic: "صبا", description: "مقام حزين عاطفي مؤثر" },
  { id: "ajam", nameArabic: "عجم", description: "مقام تركي مبهج" },
  { id: "nahawand", nameArabic: "نهاوند", description: "مقام رقيق ذو طابع رومانسي" },
  { id: "jiharkah", nameArabic: "جهاركاه", description: "مقام مفرح مشرق" },
  { id: "sika", nameArabic: "سيكا", description: "مقام يُشيع السكينة والخشوع" },
];

export interface ReciterFull extends Reciter {
  maqamat: string[];
  country: string;
  bio: string;
}

export const RECITERS: ReciterFull[] = [
  {
    id: "yasser_dosari", name: "Yasser Al-Dosari", nameArabic: "ياسر الدوسري",
    style: "Murattal", narration: "hafs", everyayahFolder: "Yasser_Ad-Dussary_128kbps",
    available: true, maqamat: ["bayati", "rast", "saba"], country: "السعودية",
    bio: "إمام المسجد الكبير في الرياض، يتميز بصوته الخاشع الذي يؤثر في المستمعين",
  },
  {
    id: "mishary_alafasy", name: "Mishary Rashid Al-Afasy", nameArabic: "مشاري راشد العفاسي",
    style: "Murattal", narration: "hafs", everyayahFolder: "Mishari_Rashid_Alafasy_128kbps",
    available: true, maqamat: ["bayati", "hijaz", "rast"], country: "الكويت",
    bio: "أحد أبرز قراء القرآن في العالم، يجمع بين الأداء المجوّد والصوت العذب",
  },
  {
    id: "abdurrahman_alsudais", name: "Abdurrahman Al-Sudais", nameArabic: "عبد الرحمن السديس",
    style: "Murattal", narration: "hafs", everyayahFolder: "Abdul_Rahman_Al-Sudais_192kbps",
    available: true, maqamat: ["bayati", "nahawand", "rast"], country: "السعودية",
    bio: "إمام وخطيب المسجد الحرام في مكة المكرمة",
  },
  {
    id: "saad_alghamdi", name: "Saad Al-Ghamdi", nameArabic: "سعد الغامدي",
    style: "Murattal", narration: "hafs", everyayahFolder: "Saad_Al-Ghamdi_128kbps",
    available: true, maqamat: ["rast", "bayati"], country: "السعودية",
    bio: "قارئ سعودي متميز بصوته الهادئ وأدائه الرصين",
  },
  {
    id: "maher_almuaiqly", name: "Maher Al-Muaiqly", nameArabic: "ماهر المعيقلي",
    style: "Murattal", narration: "hafs", everyayahFolder: "Maher_Al_Muaiqly_128kbps",
    available: true, maqamat: ["bayati", "rast", "hijaz"], country: "السعودية",
    bio: "إمام المسجد الحرام، يتميز بالخشوع والتدبر في التلاوة",
  },
  {
    id: "nasser_alqatami", name: "Nasser Al-Qatami", nameArabic: "ناصر القطامي",
    style: "Murattal", narration: "hafs", everyayahFolder: "Nasser_Alqatami_128kbps",
    available: true, maqamat: ["bayati", "saba"], country: "السعودية",
    bio: "قارئ سعودي يتميز بصوت عاطفي مؤثر وخاشع",
  },
  {
    id: "muhammad_ayyub", name: "Muhammad Ayyub", nameArabic: "محمد أيوب",
    style: "Murattal", narration: "hafs", everyayahFolder: "Muhammad_Ayyoob_128kbps",
    available: true, maqamat: ["rast", "ajam"], country: "السعودية",
    bio: "إمام مسجد قباء في المدينة المنورة",
  },
  {
    id: "hussary", name: "Mahmoud Khalil Al-Hussary", nameArabic: "محمود خليل الحصري",
    style: "Murattal", narration: "hafs", everyayahFolder: "Husary_128kbps",
    available: true, maqamat: ["bayati", "rast", "nahawand", "hijaz"], country: "مصر",
    bio: "الشيخ الجليل إمام قراء مصر، أسس مدرسة التجويد الحديثة",
  },
  {
    id: "minshawi_hafs", name: "Mohamed Siddiq Al-Minshawi", nameArabic: "محمد صديق المنشاوي",
    style: "Murattal", narration: "hafs", everyayahFolder: "Minshawy_Murattal_128kbps",
    available: true, maqamat: ["bayati", "saba", "rast"], country: "مصر",
    bio: "من أعظم قراء القرآن في القرن العشرين، صوته يبكي القلوب",
  },
  {
    id: "abdulbasit_murattal", name: "Abdul Basit (Murattal)", nameArabic: "عبد الباسط عبد الصمد (مرتل)",
    style: "Murattal", narration: "hafs", everyayahFolder: "AbdulSamad_128kbps",
    available: true, maqamat: ["bayati", "hijaz", "rast", "saba", "nahawand"], country: "مصر",
    bio: "سلطان القراء، يُعدّ من أعظم قراء القرآن على مر العصور",
  },
  {
    id: "abdulbasit_mujawwad", name: "Abdul Basit (Mujawwad)", nameArabic: "عبد الباسط عبد الصمد (مجود)",
    style: "Mujawwad", narration: "hafs", everyayahFolder: "Abdul_Basit_Mujawwad_128kbps",
    available: true, maqamat: ["bayati", "hijaz", "rast", "saba", "nahawand", "sika"], country: "مصر",
    bio: "سلطان القراء بأسلوب التجويد المجوّد الكامل بكل المقامات",
  },
  {
    id: "hani_rifai", name: "Hani Ar-Rifai", nameArabic: "هاني الرفاعي",
    style: "Murattal", narration: "hafs", everyayahFolder: "Hani_Rifai_192kbps",
    available: true, maqamat: ["rast", "bayati"], country: "السعودية",
    bio: "قارئ سعودي بأداء هادئ رزين وصوت خاشع",
  },
  {
    id: "khalid_qahtani", name: "Khalid Al-Qahtani", nameArabic: "خالد القحطاني",
    style: "Murattal", narration: "hafs", everyayahFolder: "Khalid_Abdulqadir_64kbps",
    available: true, maqamat: ["rast", "ajam"], country: "السعودية",
    bio: "قارئ متميز بالوضوح والترتيل المتأني",
  },
  {
    id: "ahmad_ajmy", name: "Ahmad Al-Ajmy", nameArabic: "أحمد العجمي",
    style: "Murattal", narration: "hafs", everyayahFolder: "Ahmed_ibn_Ali_al-Ajamy_128kbps",
    available: true, maqamat: ["bayati", "saba"], country: "السعودية",
    bio: "قارئ كويتي متميز بالخشوع والتأثير العاطفي",
  },
  {
    id: "ali_huthaify", name: "Ali Al-Huthaify", nameArabic: "علي الحذيفي",
    style: "Murattal", narration: "hafs", everyayahFolder: "Ali_Hajjaj_AlSuesy_128kbps",
    available: true, maqamat: ["nahawand", "rast"], country: "السعودية",
    bio: "إمام المسجد النبوي الشريف في المدينة المنورة",
  },
  {
    id: "abdallah_basfar", name: "Abdullah Basfar", nameArabic: "عبدالله بصفر",
    style: "Murattal", narration: "hafs", everyayahFolder: "Abdullah_Basfar_192kbps",
    available: true, maqamat: ["rast", "bayati"], country: "السعودية",
    bio: "رئيس هيئة القرآن الكريم، يتميز بالتجويد الدقيق",
  },
  {
    id: "shuraim", name: "Saud Al-Shuraim", nameArabic: "سعود الشريم",
    style: "Murattal", narration: "hafs", everyayahFolder: "Saud_Al-Shuraim_128kbps",
    available: true, maqamat: ["bayati", "hijaz"], country: "السعودية",
    bio: "إمام المسجد الحرام، يتميز بقوة الصوت والأداء المتين",
  },
  {
    id: "ibrahim_akhdar", name: "Ibrahim Al-Akhdar", nameArabic: "إبراهيم الأخضر",
    style: "Murattal", narration: "hafs", everyayahFolder: "Ibrahim_Akhdar_32kbps",
    available: true, maqamat: ["saba", "bayati"], country: "السعودية",
    bio: "قارئ مدني رفيع المستوى من المدينة المنورة",
  },
  {
    id: "fares_abbad", name: "Fares Abbad", nameArabic: "فارس عباد",
    style: "Murattal", narration: "hafs", everyayahFolder: "Fares_Abbad_64kbps",
    available: true, maqamat: ["bayati", "rast"], country: "الجزائر",
    bio: "قارئ جزائري بارز يجمع بين التجويد والأداء المؤثر",
  },
  {
    id: "salah_albudair", name: "Salah Al-Budair", nameArabic: "صلاح البدير",
    style: "Murattal", narration: "hafs", everyayahFolder: "Salah_Al_Budair_128kbps",
    available: true, maqamat: ["nahawand", "bayati"], country: "السعودية",
    bio: "إمام المسجد النبوي الشريف، بصوت رفيع ومؤثر",
  },
  {
    id: "warsh_imam_malik", name: "Warsh Narration - Assori", nameArabic: "رواية ورش عن نافع",
    style: "Murattal", narration: "warsh", everyayahFolder: "Warsh_Imam_Malik_128kbps",
    available: true, maqamat: ["rast", "bayati"], country: "المغرب",
    bio: "رواية ورش عن نافع - الشائعة في شمال أفريقيا والمغرب العربي",
  },
  {
    id: "alafasy_warsh", name: "Alafasy - Warsh", nameArabic: "العفاسي رواية ورش",
    style: "Murattal", narration: "warsh", everyayahFolder: "Warsh_Alafasy_128kbps",
    available: true, maqamat: ["bayati", "hijaz"], country: "الكويت",
    bio: "مشاري العفاسي بقراءة ورش عن نافع",
  },
];

export const getAudioUrl = (reciter: ReciterFull, surah: number, verse: number): string => {
  const s = String(surah).padStart(3, "0");
  const v = String(verse).padStart(3, "0");
  return `https://everyayah.com/data/${reciter.everyayahFolder}/${s}${v}.mp3`;
};

export const getReciter = (id: string): ReciterFull =>
  RECITERS.find((r) => r.id === id) ?? RECITERS[0];

export const getRecitersByNarration = (narrationId: string): ReciterFull[] =>
  RECITERS.filter((r) => r.narration === narrationId);

export const getRecitersByMaqam = (maqamId: string): ReciterFull[] =>
  RECITERS.filter((r) => r.maqamat.includes(maqamId));

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { getSurahVerses } from "@/lib/quranApi";
import { SURAHS, getSurah } from "@/lib/surahs";
import { NARRATIONS } from "@/lib/reciters";
import { addBookmark, isBookmarked, removeBookmark, saveReadingSession, incrementDailyProgress } from "@/lib/storage";
import { useSettings } from "@/contexts/SettingsContext";
import { useAudio } from "@/contexts/AudioContext";
import type { Verse } from "@/lib/types";
import {
  Bookmark, BookmarkCheck, Play, Pause, ChevronRight, ChevronLeft,
  Settings2, Loader2, Copy, Share2, ChevronsLeft, ChevronsRight, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ReadPage() {
  const { surahNumber } = useParams<{ surahNumber?: string }>();
  const { settings, updateSettings } = useSettings();
  const audio = useAudio();
  const { toast } = useToast();
  const [surahNum, setSurahNum] = useState(Number(surahNumber) || settings.lastRead?.surahNumber || 1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());
  const [jumpInput, setJumpInput] = useState("");
  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const surah = getSurah(surahNum);

  const loadSurah = useCallback(async (num: number, narration = settings.narration) => {
    setLoading(true);
    try {
      const narObj = NARRATIONS.find((n) => n.id === narration);
      const edition = narObj?.apiEdition ?? "quran-uthmani";
      const data = await getSurahVerses(num, edition);
      setVerses(data);
      const bm = new Set<number>();
      for (const v of data) {
        if (await isBookmarked(num, v.number)) bm.add(v.number);
      }
      setBookmarkedVerses(bm);
      await saveReadingSession({ surahNumber: num, verseNumber: 1, timestamp: Date.now() });
      await updateSettings({ lastRead: { surahNumber: num, verseNumber: 1 } });
    } finally {
      setLoading(false);
    }
  }, [settings.narration, updateSettings]);

  useEffect(() => { loadSurah(surahNum); }, [surahNum]);

  const toggleBookmark = async (verseNumber: number) => {
    if (bookmarkedVerses.has(verseNumber)) {
      const allBm = await import("@/lib/storage").then(m => m.getBookmarks());
      const bm = allBm.find(b => b.surahNumber === surahNum && b.verseNumber === verseNumber);
      if (bm) await removeBookmark(bm.id);
      setBookmarkedVerses(prev => { const n = new Set(prev); n.delete(verseNumber); return n; });
    } else {
      await addBookmark({ surahNumber: surahNum, verseNumber });
      setBookmarkedVerses(prev => new Set(prev).add(verseNumber));
      await incrementDailyProgress(1);
      toast({ title: "تمت إضافة الإشارة", description: `${surah?.nameArabic} آية ${verseNumber}` });
    }
  };

  const copyVerse = (verse: Verse) => {
    const surahName = surah?.nameArabic ?? "";
    const text = `${verse.text}\n﴿ ${surahName}: ${verse.number} ﴾`;
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "تم النسخ", description: "تم نسخ الآية إلى الحافظة" });
    });
  };

  const playVerse = (verseNumber: number) => {
    audio.play(surahNum, verseNumber);
  };

  const jumpToVerse = () => {
    const n = parseInt(jumpInput);
    if (!n || n < 1 || n > (surah?.versesCount ?? 0)) return;
    const el = verseRefs.current.get(n);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setJumpInput("");
  };

  const fontSizeStyle = { fontSize: `${settings.fontSize}px`, lineHeight: "2.6" };

  return (
    <div className="min-h-full" dir="rtl">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => surahNum > 1 && setSurahNum(s => s - 1)} disabled={surahNum <= 1} data-testid="btn-prev-surah">
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <Select value={String(surahNum)} onValueChange={(v) => setSurahNum(Number(v))}>
            <SelectTrigger className="w-36 font-arabic h-8 text-xs" data-testid="select-surah">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-y-auto">
              {SURAHS.map((s) => (
                <SelectItem key={s.number} value={String(s.number)} className="font-arabic text-xs" data-testid={`option-surah-${s.number}`}>
                  {s.number}. {s.nameArabic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => surahNum < 114 && setSurahNum(s => s + 1)} disabled={surahNum >= 114} data-testid="btn-next-surah">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Select value={settings.narration} onValueChange={(v) => { updateSettings({ narration: v }); loadSurah(surahNum, v); }}>
            <SelectTrigger className="w-24 font-arabic h-8 text-xs" data-testid="select-narration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NARRATIONS.map((n) => (
                <SelectItem key={n.id} value={n.id} className="font-arabic text-xs" data-testid={`option-narration-${n.id}`}>
                  {n.nameArabic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Jump to verse */}
          <div className="flex items-center gap-1">
            <Input
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && jumpToVerse()}
              placeholder="آية..."
              className="h-8 w-16 text-xs text-center font-arabic"
              data-testid="input-jump-verse"
              type="number"
              min={1}
              max={surah?.versesCount}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={jumpToVerse} data-testid="btn-jump-verse">
              <Hash className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="btn-reading-settings">
                <Settings2 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="font-arabic" dir="rtl">
              <SheetHeader><SheetTitle className="font-arabic">إعدادات القراءة</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">حجم الخط: {settings.fontSize}px</label>
                  <Slider value={[settings.fontSize]} min={16} max={44} step={2}
                    onValueChange={([v]) => updateSettings({ fontSize: v })} data-testid="slider-font-size" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">نمط العرض</label>
                  <div className="flex gap-2">
                    {[["continuous", "متواصل"], ["surah", "سورة"]].map(([v, l]) => (
                      <Button key={v} variant={settings.displayMode === v ? "default" : "outline"} size="sm"
                        className="font-arabic text-xs flex-1"
                        onClick={() => updateSettings({ displayMode: v as "continuous" | "surah" | "page" })}>
                        {l}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        {surah && (
          <div className="text-center mb-8">
            <h1 className="font-quran-xl text-primary mb-1">{surah.nameArabic}</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge variant="outline" className="font-arabic text-xs">{surah.versesCount} آية</Badge>
              <Badge variant="outline" className={cn("font-arabic text-xs", surah.revelation === "Meccan" ? "border-amber-400/50 text-amber-600 dark:text-amber-400" : "border-blue-400/50 text-blue-600 dark:text-blue-400")}>
                {surah.revelation === "Meccan" ? "مكية" : "مدنية"}
              </Badge>
              <Badge variant="outline" className="font-arabic text-xs">الجزء {surah.juz[0]}</Badge>
            </div>
            {surahNum !== 1 && surahNum !== 9 && (
              <p className="font-quran text-2xl mt-4 text-accent">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3" data-testid="loading-verses">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground font-arabic text-sm">جاري تحميل السورة...</p>
          </div>
        ) : (
          <div className="space-y-0" data-testid="verses-container">
            {verses.map((verse) => {
              const isPlaying = audio.currentVerse === verse.number && audio.currentSurah === surahNum && audio.isPlaying;
              const isCurrent = audio.currentVerse === verse.number && audio.currentSurah === surahNum;
              const bmked = bookmarkedVerses.has(verse.number);
              return (
                <div
                  key={verse.number}
                  ref={(el) => { if (el) verseRefs.current.set(verse.number, el); }}
                  className={cn(
                    "group relative py-4 px-3 rounded-xl transition-all border",
                    isCurrent ? "bg-primary/8 border-primary/20" : "border-transparent hover:border-border hover:bg-muted/20"
                  )}
                  data-testid={`verse-${verse.number}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Verse number circle */}
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold mt-2 transition-colors",
                      isCurrent ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    )}>
                      {verse.number}
                    </div>

                    {/* Verse text */}
                    <p
                      className="flex-1 text-right leading-loose font-quran text-foreground"
                      style={fontSizeStyle}
                    >
                      {verse.text}
                    </p>
                  </div>

                  {/* Action buttons - show on hover or when active */}
                  <div className={cn(
                    "flex items-center justify-end gap-1 mt-2 transition-opacity",
                    "opacity-0 group-hover:opacity-100", isCurrent && "opacity-100"
                  )}>
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => isPlaying ? audio.pause() : playVerse(verse.number)}
                      data-testid={`btn-play-verse-${verse.number}`}>
                      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => copyVerse(verse)} data-testid={`btn-copy-verse-${verse.number}`}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => toggleBookmark(verse.number)} data-testid={`btn-bookmark-verse-${verse.number}`}>
                      {bmked
                        ? <BookmarkCheck className="h-3 w-3 text-accent" />
                        : <Bookmark className="h-3 w-3" />}
                    </Button>
                    {verse.sajda && (
                      <Badge variant="outline" className="text-[9px] font-arabic text-amber-600 border-amber-300">سجدة</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Surah navigation at bottom */}
        {!loading && (
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button variant="outline" className="font-arabic gap-1" disabled={surahNum >= 114}
              onClick={() => setSurahNum(s => s + 1)} data-testid="btn-bottom-next-surah">
              <ChevronLeft className="h-4 w-4" />
              {surahNum < 114 ? SURAHS[surahNum].nameArabic : ""}
            </Button>
            <Button variant="outline" className="font-arabic gap-1" disabled={surahNum <= 1}
              onClick={() => setSurahNum(s => s - 1)} data-testid="btn-bottom-prev-surah">
              {surahNum > 1 ? SURAHS[surahNum - 2].nameArabic : ""}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

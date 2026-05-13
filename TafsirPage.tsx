import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { SURAHS, getSurah } from "@/lib/surahs";
import { getSurahVerses } from "@/lib/quranApi";
import { getTafsirForSurah, TAFSIR_EDITIONS } from "@/lib/tafsirApi";
import type { Verse } from "@/lib/types";
import type { TafsirEntry } from "@/lib/tafsirApi";
import { Loader2, ChevronDown, BookMarked } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export default function TafsirPage() {
  const { surahNumber } = useParams<{ surahNumber?: string }>();
  const [surahNum, setSurahNum] = useState(Number(surahNumber) || 1);
  const [tafsirEdition, setTafsirEdition] = useState("ar.muyassar");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [tafsir, setTafsir] = useState<Map<number, TafsirEntry>>(new Map());
  const [loading, setLoading] = useState(false);
  const [openVerses, setOpenVerses] = useState<Set<number>>(new Set());
  const surah = getSurah(surahNum);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSurahVerses(surahNum),
      getTafsirForSurah(surahNum, tafsirEdition),
    ]).then(([v, t]) => {
      setVerses(v);
      const map = new Map<number, TafsirEntry>();
      for (const entry of t) map.set(entry.verseNumber, entry);
      setTafsir(map);
      setLoading(false);
    });
  }, [surahNum, tafsirEdition]);

  const toggleVerse = (n: number) => {
    setOpenVerses((prev) => {
      const s = new Set(prev);
      if (s.has(n)) s.delete(n);
      else s.add(n);
      return s;
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto" dir="rtl">
      <h1 className="text-xl font-arabic font-bold text-primary mb-4">التفسير</h1>

      <div className="flex gap-3 mb-4">
        <Select value={String(surahNum)} onValueChange={(v) => setSurahNum(Number(v))}>
          <SelectTrigger className="font-arabic flex-1" data-testid="select-tafsir-surah">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-56 overflow-y-auto">
            {SURAHS.map((s) => (
              <SelectItem key={s.number} value={String(s.number)} className="font-arabic text-xs" data-testid={`option-tafsir-surah-${s.number}`}>
                {s.number}. {s.nameArabic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tafsirEdition} onValueChange={setTafsirEdition}>
          <SelectTrigger className="font-arabic w-40" data-testid="select-tafsir-edition">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAFSIR_EDITIONS.map((e) => (
              <SelectItem key={e.id} value={e.id} className="font-arabic text-xs" data-testid={`option-tafsir-${e.id}`}>
                {e.nameArabic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {surah && (
        <div className="text-center mb-6">
          <h2 className="font-quran-xl text-primary">{surah.nameArabic}</h2>
          <p className="text-xs text-muted-foreground font-arabic">{TAFSIR_EDITIONS.find((e) => e.id === tafsirEdition)?.nameArabic}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2" data-testid="tafsir-list">
          {verses.map((verse) => {
            const t = tafsir.get(verse.number);
            const isOpen = openVerses.has(verse.number);
            return (
              <Collapsible key={verse.number} open={isOpen} onOpenChange={() => toggleVerse(verse.number)}>
                <Card className={cn("overflow-hidden transition-all", isOpen && "border-primary/30")} data-testid={`tafsir-verse-${verse.number}`}>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-[10px] font-bold text-primary">{verse.number}</span>
                        </div>
                        <p className="font-quran text-base leading-loose text-right flex-1">{verse.text}</p>
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground mt-2 transition-transform shrink-0", isOpen && "rotate-180")} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {t ? (
                      <CardContent className="pt-0 pb-4 px-4 border-t border-border">
                        <div className="flex gap-2 items-start mt-3">
                          <BookMarked className="h-4 w-4 text-accent shrink-0 mt-1" />
                          <p className="font-arabic text-sm leading-relaxed text-foreground/90 text-right">{t.text}</p>
                        </div>
                      </CardContent>
                    ) : (
                      <CardContent className="pt-0 pb-4 px-4 border-t border-border">
                        <p className="text-xs text-muted-foreground font-arabic text-center mt-3">التفسير غير متاح حالياً</p>
                      </CardContent>
                    )}
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}

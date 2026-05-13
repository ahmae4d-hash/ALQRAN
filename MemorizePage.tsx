import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { SURAHS, getSurah } from "@/lib/surahs";
import { getSurahVerses } from "@/lib/quranApi";
import { getMemorizationProgress, updateMemorizationProgress } from "@/lib/storage";
import { useAudio } from "@/contexts/AudioContext";
import type { Verse, MemorizationProgress } from "@/lib/types";
import { Brain, CheckCircle, Circle, Clock, Play, RotateCcw, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  not_started: "text-muted-foreground",
  learning: "text-blue-500",
  memorized: "text-green-500",
  reviewing: "text-amber-500",
};

const STATUS_LABELS = {
  not_started: "لم يبدأ",
  learning: "يتعلم",
  memorized: "محفوظ",
  reviewing: "مراجعة",
};

export default function MemorizePage() {
  const { surahNumber } = useParams<{ surahNumber?: string }>();
  const audio = useAudio();
  const [surahNum, setSurahNum] = useState(Number(surahNumber) || 1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [progress, setProgress] = useState<Map<number, MemorizationProgress>>(new Map());
  const [loading, setLoading] = useState(false);
  const [hiddenVerses, setHiddenVerses] = useState<Set<number>>(new Set());
  const surah = getSurah(surahNum);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSurahVerses(surahNum),
      getMemorizationProgress(surahNum),
    ]).then(([v, p]) => {
      setVerses(v);
      const map = new Map<number, MemorizationProgress>();
      for (const item of p) map.set(item.verseNumber, item);
      setProgress(map);
      setLoading(false);
    });
  }, [surahNum]);

  const updateStatus = async (verseNumber: number, status: MemorizationProgress["status"]) => {
    await updateMemorizationProgress(surahNum, verseNumber, { status });
    setProgress((prev) => {
      const map = new Map(prev);
      const existing = map.get(verseNumber);
      map.set(verseNumber, {
        surahNumber: surahNum,
        verseNumber,
        status,
        reviewCount: (existing?.reviewCount ?? 0) + 1,
        confidence: status === "memorized" ? 100 : status === "learning" ? 50 : 0,
        lastReviewed: Date.now(),
      });
      return map;
    });
  };

  const toggleHide = (verseNumber: number) => {
    setHiddenVerses((prev) => {
      const n = new Set(prev);
      if (n.has(verseNumber)) n.delete(verseNumber);
      else n.add(verseNumber);
      return n;
    });
  };

  const memorizedCount = Array.from(progress.values()).filter((p) => p.status === "memorized").length;
  const progressPercent = verses.length > 0 ? (memorizedCount / verses.length) * 100 : 0;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-arabic font-bold text-primary">الحفظ</h1>
        <Select value={String(surahNum)} onValueChange={(v) => setSurahNum(Number(v))}>
          <SelectTrigger className="w-36 font-arabic text-sm" data-testid="select-memorize-surah">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-56 overflow-y-auto">
            {SURAHS.map((s) => (
              <SelectItem key={s.number} value={String(s.number)} className="font-arabic text-xs" data-testid={`option-mem-surah-${s.number}`}>
                {s.number}. {s.nameArabic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {surah && (
        <Card className="mb-4" data-testid="memorize-progress-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-arabic text-sm flex justify-between">
              <span>{surah.nameArabic} — {surah.versesCount} آية</span>
              <Badge variant="outline" className="font-arabic text-xs">{memorizedCount} محفوظ</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-2" data-testid="memorize-progress-bar" />
            <p className="text-xs text-muted-foreground font-arabic mt-1">{Math.round(progressPercent)}% من السورة</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2" data-testid="memorize-verses-list">
          {verses.map((verse) => {
            const p = progress.get(verse.number);
            const status = p?.status ?? "not_started";
            const hidden = hiddenVerses.has(verse.number);
            return (
              <Card
                key={verse.number}
                className={cn("transition-all", status === "memorized" && "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20")}
                data-testid={`memorize-verse-${verse.number}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1 shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-primary">{verse.number}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      {hidden ? (
                        <div className="text-center py-2">
                          <Button variant="ghost" size="sm" className="font-arabic text-xs" onClick={() => toggleHide(verse.number)} data-testid={`btn-show-verse-${verse.number}`}>
                            اضغط لإظهار الآية
                          </Button>
                        </div>
                      ) : (
                        <p className="font-quran text-base leading-loose text-right mb-2">{verse.text}</p>
                      )}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => audio.play(surahNum, verse.number)} data-testid={`btn-play-mem-${verse.number}`}>
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleHide(verse.number)} data-testid={`btn-hide-verse-${verse.number}`}>
                            {hidden ? <Circle className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          {(["learning", "reviewing", "memorized"] as const).map((s) => (
                            <Button
                              key={s}
                              variant={status === s ? "default" : "outline"}
                              size="sm"
                              className="h-6 text-[10px] font-arabic px-2"
                              onClick={() => updateStatus(verse.number, s)}
                              data-testid={`btn-status-${s}-${verse.number}`}
                            >
                              {STATUS_LABELS[s]}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

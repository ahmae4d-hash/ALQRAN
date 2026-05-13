import { useState, useEffect, useRef, useCallback } from "react";
import { SURAHS, getSurah } from "@/lib/surahs";
import { getSurahVerses } from "@/lib/quranApi";
import { updateMemorizationProgress } from "@/lib/storage";
import { useAudio } from "@/contexts/AudioContext";
import type { Verse } from "@/lib/types";
import {
  Mic, MicOff, Play, Pause, Eye, EyeOff,
  ChevronRight, ChevronLeft, Loader2, CheckCircle2,
  XCircle, RotateCcw, Volume2, BookOpen, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type PracticeMode = "listen_repeat" | "blind_test" | "full_recite";
type VerseResult = "correct" | "almost" | "wrong" | null;

export default function TasmeeePage() {
  const audio = useAudio();
  const [surahNum, setSurahNum] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(1);
  const [showText, setShowText] = useState(true);
  const [mode, setMode] = useState<PracticeMode>("listen_repeat");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [verseResult, setVerseResult] = useState<VerseResult>(null);
  const [sessionResults, setSessionResults] = useState<Map<number, VerseResult>>(new Map());
  const [step, setStep] = useState<"listen" | "recite" | "result">("listen");
  const [hasListened, setHasListened] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const surah = getSurah(surahNum);

  useEffect(() => {
    setLoading(true);
    getSurahVerses(surahNum).then((v) => {
      setVerses(v);
      setCurrentVerse(1);
      resetVerse();
      setLoading(false);
    });
  }, [surahNum]);

  const resetVerse = () => {
    setStep("listen");
    setHasListened(false);
    setVerseResult(null);
    setIsRecording(false);
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const playCurrentVerse = () => {
    audio.play(surahNum, currentVerse);
    setHasListened(true);
    if (mode !== "full_recite") setStep("recite");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setStep("result");
      };
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const markResult = async (result: "correct" | "almost" | "wrong") => {
    setVerseResult(result);
    setSessionResults((prev) => new Map(prev).set(currentVerse, result));
    const status = result === "correct" ? "memorized" : result === "almost" ? "learning" : "reviewing";
    await updateMemorizationProgress(surahNum, currentVerse, { status });
  };

  const goToVerse = (n: number) => {
    setCurrentVerse(n);
    resetVerse();
    if (mode === "blind_test") setShowText(false);
  };

  const nextVerse = () => { if (currentVerse < (surah?.versesCount ?? 0)) goToVerse(currentVerse + 1); };
  const prevVerse = () => { if (currentVerse > 1) goToVerse(currentVerse - 1); };

  const currentVerseData = verses.find((v) => v.number === currentVerse);
  const totalVerses = surah?.versesCount ?? 0;
  const sessionScore = Array.from(sessionResults.values()).filter((r) => r === "correct").length;
  const sessionTotal = sessionResults.size;

  const MODES: { id: PracticeMode; label: string; desc: string }[] = [
    { id: "listen_repeat", label: "استمع وردد", desc: "استمع للآية ثم رددها" },
    { id: "blind_test", label: "اختبار أعمى", desc: "احفظ بدون رؤية النص" },
    { id: "full_recite", label: "تلاوة حرة", desc: "اقرأ الآيات بنفسك" },
  ];

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-arabic font-bold text-primary flex items-center gap-2">
          <Mic className="h-5 w-5 text-accent" /> التسميع
        </h1>
        {sessionTotal > 0 && (
          <Badge variant="outline" className="font-arabic text-xs gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            {sessionScore}/{sessionTotal}
          </Badge>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Select value={String(surahNum)} onValueChange={(v) => setSurahNum(Number(v))}>
          <SelectTrigger className="font-arabic flex-1 min-w-0" data-testid="select-tasmee-surah">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-56 overflow-y-auto">
            {SURAHS.map((s) => (
              <SelectItem key={s.number} value={String(s.number)} className="font-arabic text-xs"
                data-testid={`option-tasmee-surah-${s.number}`}>
                {s.number}. {s.nameArabic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mode} onValueChange={(v) => { setMode(v as PracticeMode); resetVerse(); if (v === "blind_test") setShowText(false); else setShowText(true); }}>
          <SelectTrigger className="font-arabic w-40" data-testid="select-tasmee-mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODES.map((m) => (
              <SelectItem key={m.id} value={m.id} className="font-arabic text-xs" data-testid={`option-mode-${m.id}`}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mode description */}
      <div className="text-xs font-arabic text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mb-4">
        {MODES.find(m => m.id === mode)?.desc}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-arabic text-muted-foreground">{currentVerse}/{totalVerses}</span>
            <Progress value={(currentVerse / totalVerses) * 100} className="flex-1 h-1.5" data-testid="tasmee-progress" />
            <span className="text-xs font-arabic text-muted-foreground">
              {Math.round((currentVerse / totalVerses) * 100)}%
            </span>
          </div>

          {/* Verse results mini-map */}
          {sessionResults.size > 0 && (
            <div className="flex flex-wrap gap-1 mb-3" data-testid="tasmee-results-map">
              {Array.from({ length: totalVerses }, (_, i) => i + 1).map((n) => {
                const r = sessionResults.get(n);
                return (
                  <button key={n} onClick={() => goToVerse(n)}
                    className={cn("w-5 h-5 rounded text-[9px] font-bold transition-colors",
                      n === currentVerse ? "ring-2 ring-primary" : "",
                      r === "correct" ? "bg-green-500 text-white" :
                        r === "almost" ? "bg-amber-400 text-white" :
                          r === "wrong" ? "bg-red-400 text-white" :
                            "bg-muted text-muted-foreground"
                    )} data-testid={`verse-dot-${n}`}>
                    {n}
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Verse Card */}
          <Card className={cn("mb-4 transition-all border-2",
            step === "listen" && "border-blue-200 dark:border-blue-800",
            step === "recite" && "border-amber-200 dark:border-amber-800",
            step === "result" && verseResult === "correct" ? "border-green-300 dark:border-green-700" :
              step === "result" && verseResult === "almost" ? "border-amber-300 dark:border-amber-700" :
                step === "result" && verseResult === "wrong" ? "border-red-300 dark:border-red-700" : ""
          )} data-testid="tasmee-verse-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-arabic text-sm">
                  {surah?.nameArabic} — الآية {currentVerse}
                </CardTitle>
                <div className="flex gap-1">
                  <Badge variant={step === "listen" ? "default" : "outline"} className="text-[10px] font-arabic">
                    {step === "listen" ? "استمع" : step === "recite" ? "ردد" : "تقييم"}
                  </Badge>
                  {verseResult && (
                    <Badge
                      className={cn("text-[10px] font-arabic",
                        verseResult === "correct" ? "bg-green-500" :
                          verseResult === "almost" ? "bg-amber-500" : "bg-red-500")}
                    >
                      {verseResult === "correct" ? "✓ حفظت" : verseResult === "almost" ? "~ تقريباً" : "✗ راجع"}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Verse text */}
              {(showText && mode !== "blind_test") || (mode === "blind_test" && step === "result") || mode === "full_recite" ? (
                <p className="font-quran-lg text-right leading-loose text-foreground mb-4" data-testid="tasmee-verse-text">
                  {currentVerseData?.text}
                </p>
              ) : mode === "blind_test" && step !== "result" ? (
                <div className="text-center py-6 mb-4" data-testid="tasmee-verse-hidden">
                  <div className="inline-flex items-center gap-2 bg-muted rounded-xl px-4 py-3">
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    <span className="font-arabic text-sm text-muted-foreground">النص مخفي — ردد من حفظك</span>
                  </div>
                </div>
              ) : null}

              {/* STEP: LISTEN */}
              {step === "listen" && (
                <Button className="w-full gap-2 font-arabic" size="lg" onClick={playCurrentVerse}
                  data-testid="btn-tasmee-play">
                  <Volume2 className="h-5 w-5" />
                  {mode === "full_recite" ? "اقرأ الآية" : "استمع للآية"}
                </Button>
              )}

              {/* STEP: RECITE */}
              {step === "recite" && mode !== "full_recite" && (
                <div className="space-y-3">
                  {!isRecording ? (
                    <Button className="w-full gap-2 font-arabic bg-red-500 hover:bg-red-600" size="lg"
                      onClick={startRecording} data-testid="btn-start-record">
                      <Mic className="h-5 w-5" />
                      ابدأ التسجيل وردد الآية
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-3 py-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-arabic font-bold text-red-600 dark:text-red-400">يسجّل... {formatTime(recordingTime)}</span>
                      </div>
                      <Button variant="outline" className="w-full gap-2 font-arabic border-red-300 text-red-600"
                        onClick={stopRecording} data-testid="btn-stop-record">
                        <MicOff className="h-4 w-4" />
                        أوقف التسجيل
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="font-arabic flex-1" onClick={playCurrentVerse} data-testid="btn-replay">
                      <RotateCcw className="h-3.5 w-3.5 ml-1" /> أعد الاستماع
                    </Button>
                    <Button variant="ghost" size="sm" className="font-arabic flex-1" onClick={() => setStep("result")} data-testid="btn-skip-record">
                      تقييم يدوي
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP: RESULT */}
              {(step === "result" || mode === "full_recite") && !verseResult && (
                <div className="space-y-2">
                  <p className="text-center font-arabic text-sm text-muted-foreground mb-2">كيف كان أداؤك؟</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button className="bg-green-500 hover:bg-green-600 font-arabic gap-1 flex-col h-auto py-3"
                      onClick={() => markResult("correct")} data-testid="btn-result-correct">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-xs">ممتاز</span>
                    </Button>
                    <Button className="bg-amber-500 hover:bg-amber-600 font-arabic gap-1 flex-col h-auto py-3"
                      onClick={() => markResult("almost")} data-testid="btn-result-almost">
                      <Star className="h-5 w-5" />
                      <span className="text-xs">تقريباً</span>
                    </Button>
                    <Button className="bg-red-500 hover:bg-red-600 font-arabic gap-1 flex-col h-auto py-3"
                      onClick={() => markResult("wrong")} data-testid="btn-result-wrong">
                      <XCircle className="h-5 w-5" />
                      <span className="text-xs">أخطأت</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={prevVerse} disabled={currentVerse <= 1} className="font-arabic gap-1"
              data-testid="btn-tasmee-prev">
              <ChevronRight className="h-4 w-4" /> السابقة
            </Button>
            <Button variant="ghost" size="sm" onClick={resetVerse} className="font-arabic text-xs text-muted-foreground"
              data-testid="btn-reset-verse">
              <RotateCcw className="h-3 w-3 ml-1" /> إعادة
            </Button>
            <Button variant={verseResult ? "default" : "outline"} onClick={nextVerse}
              disabled={currentVerse >= totalVerses} className="font-arabic gap-1"
              data-testid="btn-tasmee-next">
              التالية <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

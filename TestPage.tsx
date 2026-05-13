import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { SURAHS } from "@/lib/surahs";
import { getSurahVerses } from "@/lib/quranApi";
import { generateQuiz, checkAnswer, normalizeArabic } from "@/lib/quizGenerator";
import { useAudio } from "@/contexts/AudioContext";
import type { Verse, QuizQuestion } from "@/lib/types";
import { CheckCircle2, XCircle, Trophy, RotateCcw, Play, Loader2, Lightbulb, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type QuizState = "setup" | "quiz" | "finished";

export default function TestPage() {
  const { surahNumber } = useParams<{ surahNumber?: string }>();
  const audio = useAudio();
  const [surahNum, setSurahNum] = useState(Number(surahNumber) || 2);
  const [loading, setLoading] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [results, setResults] = useState<{ correct: boolean; userAnswer: string; question: QuizQuestion }[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);

  const currentQuestion = questions[currentIndex];
  const score = results.filter((r) => r.correct).length;
  const isMultiChoice = currentQuestion?.type === "multiple_choice" || currentQuestion?.type === "identify_surah";

  const startQuiz = async () => {
    setLoading(true);
    const verses = await getSurahVerses(surahNum);
    const quiz = generateQuiz(verses, questionCount);
    setQuestions(quiz);
    setCurrentIndex(0);
    setResults([]);
    setUserAnswer("");
    setSelectedOption(null);
    setShowAnswer(false);
    setShowHint(false);
    setQuizState("quiz");
    setLoading(false);
  };

  const submitAnswer = () => {
    if (!currentQuestion) return;
    const given = isMultiChoice ? (selectedOption ?? "") : userAnswer.trim();
    const correct = isMultiChoice
      ? normalizeArabic(given) === normalizeArabic(currentQuestion.answer)
      : checkAnswer(given, currentQuestion.answer);
    setResults((prev) => [...prev, { correct, userAnswer: given, question: currentQuestion }]);
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    setShowAnswer(false);
    setShowHint(false);
    setUserAnswer("");
    setSelectedOption(null);
    if (currentIndex + 1 >= questions.length) setQuizState("finished");
    else setCurrentIndex((i) => i + 1);
  };

  const lastResult = results[results.length - 1];
  const progressVal = questions.length > 0 ? ((currentIndex + (showAnswer ? 1 : 0)) / questions.length) * 100 : 0;

  /* ── SETUP SCREEN ── */
  if (quizState === "setup") return (
    <div className="p-4 md:p-6 max-w-lg mx-auto" dir="rtl">
      <h1 className="text-xl font-arabic font-bold text-primary mb-6 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-accent" /> الاختبارات
      </h1>
      <Card>
        <CardHeader><CardTitle className="font-arabic">إعداد الاختبار</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-sm font-arabic text-muted-foreground mb-2 block">اختر السورة</label>
            <Select value={String(surahNum)} onValueChange={(v) => setSurahNum(Number(v))}>
              <SelectTrigger className="font-arabic" data-testid="select-test-surah"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {SURAHS.filter(s => s.versesCount >= 5).map((s) => (
                  <SelectItem key={s.number} value={String(s.number)} className="font-arabic text-xs"
                    data-testid={`option-test-surah-${s.number}`}>
                    {s.number}. {s.nameArabic} ({s.versesCount} آية)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-arabic text-muted-foreground mb-2 block">عدد الأسئلة</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <Button key={n} variant={questionCount === n ? "default" : "outline"} size="sm"
                  className="font-arabic flex-1" onClick={() => setQuestionCount(n)} data-testid={`btn-qcount-${n}`}>
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-arabic text-muted-foreground">أنواع الأسئلة:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {["اختيار من متعدد", "أكمل الآية", "حدد السورة", "إكمال حر"].map(t => (
                <Badge key={t} variant="outline" className="text-[10px] font-arabic">{t}</Badge>
              ))}
            </div>
          </div>
          <Button className="w-full font-arabic gap-2" onClick={startQuiz} disabled={loading} data-testid="btn-start-quiz">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
            ابدأ الاختبار
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  /* ── FINISHED SCREEN ── */
  if (quizState === "finished") {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 90 ? { label: "ممتاز", color: "text-green-500" } :
      pct >= 70 ? { label: "جيد جداً", color: "text-blue-500" } :
        pct >= 50 ? { label: "جيد", color: "text-amber-500" } :
          { label: "تحتاج تدريباً أكثر", color: "text-red-500" };
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto" dir="rtl">
        <div className="text-center mb-6">
          <Trophy className={cn("h-16 w-16 mx-auto mb-3", pct >= 70 ? "text-accent" : "text-muted-foreground")} />
          <h2 className="text-2xl font-arabic font-bold mb-1">انتهى الاختبار!</h2>
          <p className={cn("text-5xl font-bold mb-1", grade.color)}>{pct}%</p>
          <p className={cn("text-lg font-arabic font-semibold mb-1", grade.color)}>{grade.label}</p>
          <p className="text-muted-foreground font-arabic">{score} صحيح من {questions.length}</p>
        </div>

        {/* Results breakdown */}
        <Card className="mb-4">
          <CardContent className="p-3 space-y-2">
            {results.map((r, i) => (
              <div key={i} className={cn("flex items-start gap-2 p-2 rounded-lg text-xs",
                r.correct ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/20")}
                data-testid={`result-${i}`}>
                {r.correct
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="font-arabic text-xs text-muted-foreground truncate">{r.question.question.split("\n")[0]}</p>
                  {!r.correct && (
                    <p className="font-arabic text-[10px] text-green-700 dark:text-green-400 mt-0.5">
                      الصواب: {r.question.answer.substring(0, 40)}...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => setQuizState("setup")} variant="outline" className="flex-1 font-arabic gap-1" data-testid="btn-new-quiz">
            <RotateCcw className="h-4 w-4" /> جديد
          </Button>
          <Button onClick={startQuiz} className="flex-1 font-arabic gap-1" data-testid="btn-retry-quiz">
            <RotateCcw className="h-4 w-4" /> أعد المحاولة
          </Button>
        </div>
      </div>
    );
  }

  /* ── QUIZ SCREEN ── */
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-arabic text-muted-foreground">السؤال</span>
          <Badge variant="outline" className="font-arabic">{currentIndex + 1}/{questions.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-bold text-green-600">{score}</span>
          <XCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm font-bold text-red-500">{results.length - score}</span>
        </div>
      </div>
      <Progress value={progressVal} className="mb-4 h-1.5" data-testid="quiz-progress" />

      <Card className="mb-3" data-testid="quiz-question-card">
        <CardContent className="p-5">
          {/* Question type label */}
          <Badge variant="secondary" className="font-arabic text-xs mb-3">
            {currentQuestion?.type === "fill_blank" ? "أكمل الفراغ" :
              currentQuestion?.type === "identify_surah" ? "حدد السورة" :
                currentQuestion?.type === "multiple_choice" ? "اختيار من متعدد" : "أكمل الآية"}
          </Badge>

          {/* Question text */}
          <p className="font-arabic text-sm md:text-base leading-loose text-right mb-4 whitespace-pre-line">
            {currentQuestion?.question}
          </p>

          {/* Options (MCQ) */}
          {isMultiChoice && currentQuestion?.options && (
            <div className="space-y-2 mb-4" data-testid="quiz-options">
              {currentQuestion.options.map((opt, i) => {
                const isCorrectOpt = normalizeArabic(opt) === normalizeArabic(currentQuestion.answer);
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={i}
                    disabled={showAnswer}
                    onClick={() => !showAnswer && setSelectedOption(opt)}
                    className={cn(
                      "w-full text-right p-3 rounded-xl border font-arabic text-sm transition-all",
                      showAnswer && isCorrectOpt && "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 font-semibold",
                      showAnswer && !isCorrectOpt && isSelected && "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400",
                      !showAnswer && isSelected && "border-primary bg-primary/10 font-semibold",
                      !showAnswer && !isSelected && "border-border hover:border-primary/40 hover:bg-muted/40 cursor-pointer",
                    )}
                    data-testid={`quiz-option-${i}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0">
                        {["أ","ب","ج","د"][i]}
                      </span>
                      {opt}
                      {showAnswer && isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-green-500 mr-auto shrink-0" />}
                      {showAnswer && !isCorrectOpt && isSelected && <XCircle className="h-4 w-4 text-red-500 mr-auto shrink-0" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Free text input */}
          {!isMultiChoice && (
            <div className="mb-4">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !showAnswer && userAnswer.trim() && submitAnswer()}
                placeholder="اكتب إجابتك هنا..."
                className="font-arabic text-right text-base"
                disabled={showAnswer}
                data-testid="quiz-text-input"
                dir="rtl"
              />
            </div>
          )}

          {/* Hint */}
          {showHint && currentQuestion?.hint && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-lg p-2.5 mb-3" data-testid="quiz-hint">
              <p className="text-xs font-arabic text-amber-700 dark:text-amber-400">💡 {currentQuestion.hint}</p>
            </div>
          )}

          {/* Answer feedback */}
          {showAnswer && lastResult && (
            <div className={cn("p-3 rounded-xl mb-3 border", lastResult.correct
              ? "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700"
              : "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800")}
              data-testid="quiz-feedback">
              <div className="flex items-center gap-2 mb-1">
                {lastResult.correct
                  ? <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-arabic font-bold text-green-700 dark:text-green-400">إجابة صحيحة! 🎉</span></>
                  : <><XCircle className="h-4 w-4 text-red-500" /><span className="font-arabic font-bold text-red-700 dark:text-red-400">إجابة خاطئة</span></>}
              </div>
              {!lastResult.correct && (
                <p className="font-arabic text-sm text-foreground/80 mt-1">
                  الإجابة الصحيحة: <span className="font-quran text-base text-primary">{currentQuestion?.answer}</span>
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!showAnswer ? (
              <>
                <Button className="flex-1 font-arabic" onClick={submitAnswer}
                  disabled={isMultiChoice ? !selectedOption : !userAnswer.trim()}
                  data-testid="btn-submit-answer">
                  تحقق من الإجابة
                </Button>
                {!showHint && currentQuestion?.hint && (
                  <Button variant="outline" size="icon" onClick={() => setShowHint(true)} data-testid="btn-show-hint">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => audio.play(currentQuestion.surahNumber, currentQuestion.verseNumber)} data-testid="btn-play-question">
                  <Play className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button className="flex-1 font-arabic gap-1" onClick={nextQuestion} data-testid="btn-next-question">
                  {currentIndex + 1 >= questions.length ? "🏆 النتائج" : "التالي"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => audio.play(currentQuestion.surahNumber, currentQuestion.verseNumber)} data-testid="btn-play-answer">
                  <Play className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

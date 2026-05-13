import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSettings } from "@/contexts/SettingsContext";
import { useAudio } from "@/contexts/AudioContext";
import { getDailyGoal, getOverallStats, getRecentSessions, incrementDailyProgress } from "@/lib/storage";
import { SURAHS } from "@/lib/surahs";
import {
  BookOpen, Headphones, Brain, ClipboardList, Mic2, BookMarked,
  TrendingUp, Star, Play, Flame, Target, Calendar, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DailyGoal, ReadingSession } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAILY_VERSES = [
  { surah: 65, verse: 3, text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ" },
  { surah: 2, verse: 286, text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا" },
  { surah: 3, verse: 173, text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ" },
  { surah: 94, verse: 5, text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا" },
  { surah: 2, verse: 152, text: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ" },
  { surah: 39, verse: 53, text: "إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ" },
  { surah: 13, verse: 28, text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ" },
];

const QUICK_ACTIONS = [
  { href: "/read", icon: BookOpen, label: "قراءة", desc: "اقرأ المصحف", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" },
  { href: "/listen", icon: Headphones, label: "استماع", desc: "استمع للقراء", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  { href: "/memorize", icon: Brain, label: "الحفظ", desc: "حفظ الآيات", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  { href: "/test", icon: ClipboardList, label: "اختبار", desc: "اختبر نفسك", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  { href: "/tasmee", icon: Mic2, label: "التسميع", desc: "تدرب على التلاوة", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800" },
  { href: "/tafsir", icon: BookMarked, label: "التفسير", desc: "فهم الآيات", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
];

const SHORT_SURAHS = [112, 113, 114, 1, 67, 36, 55, 56, 78];

export default function HomePage() {
  const { settings } = useSettings();
  const audio = useAudio();
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [stats, setStats] = useState({ totalMemorized: 0, totalBookmarks: 0, totalSessions: 0, surahsStarted: 0 });
  const [recentSessions, setRecentSessions] = useState<ReadingSession[]>([]);
  const todayVerse = DAILY_VERSES[new Date().getDay() % DAILY_VERSES.length];
  const lastReadSurah = settings.lastRead ? SURAHS.find((s) => s.number === settings.lastRead!.surahNumber) : null;

  useEffect(() => {
    getDailyGoal().then(setDailyGoal);
    getOverallStats().then(setStats);
    getRecentSessions(5).then(setRecentSessions);
  }, []);

  const goalPercent = dailyGoal ? Math.min(100, (dailyGoal.current / dailyGoal.target) * 100) : 0;
  const todaySurahName = SURAHS.find(s => s.number === todayVerse.surah)?.nameArabic ?? "";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5" dir="rtl">
      {/* Greeting */}
      <div className="text-center pt-4 pb-2">
        <p className="font-quran text-3xl text-primary leading-loose mb-1">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p className="text-sm text-muted-foreground font-arabic">
          {new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Daily Verse */}
      <Card className="relative overflow-hidden border-accent/30 bg-gradient-to-bl from-primary/5 via-card to-accent/5" data-testid="card-daily-verse">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent" />
        <CardHeader className="pb-2 pr-6">
          <CardTitle className="text-xs font-arabic text-muted-foreground flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-accent fill-accent" />
            آية اليوم
          </CardTitle>
        </CardHeader>
        <CardContent className="pr-6">
          <p className="font-quran text-xl md:text-2xl leading-loose text-center text-foreground mb-3">{todayVerse.text}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-arabic">سورة {todaySurahName} ﴿{todayVerse.verse}﴾</p>
            <Button size="sm" variant="ghost" className="h-7 gap-1 font-arabic text-xs"
              onClick={() => audio.play(todayVerse.surah, todayVerse.verse)} data-testid="btn-play-daily-verse">
              <Play className="h-3 w-3" /> استمع
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Continue Reading + Daily Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {lastReadSurah ? (
          <Card data-testid="card-continue-reading">
            <CardContent className="p-4">
              <div className="flex items-center gap-1 mb-2">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground font-arabic">استمر في القراءة</span>
              </div>
              <p className="font-arabic font-bold text-base mb-1">{lastReadSurah.nameArabic}</p>
              <p className="text-xs text-muted-foreground font-arabic mb-3">الآية {settings.lastRead?.verseNumber}</p>
              <Link href={`/read/${lastReadSurah.number}`}>
                <Button size="sm" className="w-full font-arabic" data-testid="btn-continue-reading">تابع القراءة</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed" data-testid="card-start-reading">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-primary/30 mx-auto mb-2" />
              <p className="text-sm font-arabic text-muted-foreground mb-3">ابدأ رحلتك مع القرآن</p>
              <Link href="/read/1">
                <Button size="sm" className="w-full font-arabic" data-testid="btn-start-reading">ابدأ بالفاتحة</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card data-testid="card-daily-goal">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground font-arabic">هدف اليوم</span>
              </div>
              <Badge variant={goalPercent >= 100 ? "default" : "outline"} className="text-[10px] font-arabic">
                {dailyGoal ? `${dailyGoal.current}/${dailyGoal.target}` : "—"} آية
              </Badge>
            </div>
            <Progress value={goalPercent} className="h-2 mb-1" data-testid="progress-daily-goal" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground font-arabic">{Math.round(goalPercent)}% مكتمل</span>
              {goalPercent >= 100 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-arabic flex items-center gap-1">
                  <Flame className="h-3 w-3" /> أحسنت!
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-arabic font-semibold text-muted-foreground mb-2">الوظائف</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2" data-testid="quick-actions-grid">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className={cn("cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border", action.color)} data-testid={`card-action-${action.href.replace("/", "")}`}>
                <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                  <action.icon className="h-6 w-6" />
                  <p className="font-arabic font-semibold text-xs">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Short Surahs for quick listening */}
      <Card data-testid="card-short-surahs">
        <CardHeader className="pb-2">
          <CardTitle className="font-arabic text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            سور قصيرة — اضغط للاستماع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SHORT_SURAHS.map(num => {
              const s = SURAHS.find(x => x.number === num);
              return s ? (
                <Button key={num} variant="outline" size="sm"
                  className="font-arabic text-xs gap-1.5 h-7"
                  onClick={() => audio.play(num, 1)}
                  data-testid={`btn-quick-surah-${num}`}>
                  <Play className="h-2.5 w-2.5" />
                  {s.nameArabic}
                  <span className="text-muted-foreground">({s.versesCount})</span>
                </Button>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div>
        <h2 className="text-sm font-arabic font-semibold text-muted-foreground mb-2">إحصائياتك</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2" data-testid="stats-grid">
          {[
            { label: "آيات محفوظة", value: stats.totalMemorized, icon: Brain, color: "text-purple-500" },
            { label: "إشارات مرجعية", value: stats.totalBookmarks, icon: BookMarked, color: "text-blue-500" },
            { label: "جلسات القراءة", value: stats.totalSessions, icon: Calendar, color: "text-green-500" },
            { label: "سور مبدوءة", value: stats.surahsStarted, icon: TrendingUp, color: "text-amber-500" },
          ].map((s) => (
            <Card key={s.label} data-testid={`stat-${s.label}`}>
              <CardContent className="p-3 text-center">
                <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-arabic leading-tight">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <Card data-testid="card-recent-sessions">
          <CardHeader className="pb-2">
            <CardTitle className="font-arabic text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              آخر الجلسات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {recentSessions.slice(0, 4).map((s, i) => {
                const surah = SURAHS.find(x => x.number === s.surahNumber);
                return (
                  <Link key={i} href={`/read/${s.surahNumber}`}>
                    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50 cursor-pointer" data-testid={`recent-session-${i}`}>
                      <span className="font-arabic text-sm">{surah?.nameArabic}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-arabic">آية {s.verseNumber}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(s.timestamp).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

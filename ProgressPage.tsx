import { useState, useEffect } from "react";
import { getOverallStats, getMemorizationProgress, getDailyGoal, getRecentSessions } from "@/lib/storage";
import { SURAHS } from "@/lib/surahs";
import type { MemorizationProgress, DailyGoal, ReadingSession } from "@/lib/types";
import { Brain, Bookmark, TrendingUp, BookOpen, Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ProgressPage() {
  const [stats, setStats] = useState({ totalMemorized: 0, totalBookmarks: 0, totalSessions: 0, surahsStarted: 0 });
  const [progress, setProgress] = useState<MemorizationProgress[]>([]);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [recentSessions, setRecentSessions] = useState<ReadingSession[]>([]);

  useEffect(() => {
    Promise.all([
      getOverallStats(),
      getMemorizationProgress(),
      getDailyGoal(),
      getRecentSessions(10),
    ]).then(([s, p, d, r]) => {
      setStats(s);
      setProgress(p);
      setDailyGoal(d);
      setRecentSessions(r);
    });
  }, []);

  const surahProgress = SURAHS.map((surah) => {
    const surahProgress = progress.filter((p) => p.surahNumber === surah.number);
    const memorized = surahProgress.filter((p) => p.status === "memorized").length;
    return { surah, memorized, total: surah.versesCount, percent: surah.versesCount > 0 ? (memorized / surah.versesCount) * 100 : 0 };
  }).filter((s) => s.memorized > 0).sort((a, b) => b.percent - a.percent);

  const STAT_CARDS = [
    { label: "محفوظات", value: stats.totalMemorized, icon: Brain, color: "text-purple-500" },
    { label: "إشارات", value: stats.totalBookmarks, icon: Bookmark, color: "text-blue-500" },
    { label: "جلسات القراءة", value: stats.totalSessions, icon: BookOpen, color: "text-green-500" },
    { label: "سور مبدوءة", value: stats.surahsStarted, icon: TrendingUp, color: "text-amber-500" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto" dir="rtl">
      <h1 className="text-xl font-arabic font-bold text-primary mb-4">التقدم والإحصائيات</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" data-testid="stats-cards">
        {STAT_CARDS.map((s) => (
          <Card key={s.label} data-testid={`stat-card-${s.label}`}>
            <CardContent className="p-3 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground font-arabic">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {dailyGoal && (
        <Card className="mb-4" data-testid="daily-goal-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-arabic text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              هدف اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(100, (dailyGoal.current / dailyGoal.target) * 100)} className="h-2" data-testid="daily-goal-progress" />
            <p className="text-xs text-muted-foreground font-arabic mt-1">
              {dailyGoal.current} / {dailyGoal.target} آية — {Math.round(Math.min(100, (dailyGoal.current / dailyGoal.target) * 100))}%
            </p>
          </CardContent>
        </Card>
      )}

      {surahProgress.length > 0 && (
        <Card className="mb-4" data-testid="memorization-progress-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-arabic text-sm">تقدم الحفظ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {surahProgress.slice(0, 8).map(({ surah, memorized, total, percent }) => (
              <div key={surah.number} data-testid={`progress-surah-${surah.number}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-arabic text-sm">{surah.nameArabic}</span>
                  <Badge variant="outline" className="font-arabic text-[10px]">{memorized}/{total}</Badge>
                </div>
                <Progress value={percent} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {recentSessions.length > 0 && (
        <Card data-testid="recent-sessions-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-arabic text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              آخر الجلسات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSessions.map((s, i) => {
              const surah = SURAHS.find((su) => su.number === s.surahNumber);
              return (
                <div key={i} className="flex justify-between items-center py-1 border-b border-border last:border-0" data-testid={`session-${i}`}>
                  <span className="font-arabic text-sm">{surah?.nameArabic} — الآية {s.verseNumber}</span>
                  <span className="text-xs text-muted-foreground font-arabic">
                    {new Date(s.timestamp).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Link } from "wouter";
import { JUZ_RANGES, SURAHS } from "@/lib/surahs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JuzPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto" dir="rtl">
      <div className="mb-4">
        <h1 className="text-xl font-arabic font-bold text-primary">الأجزاء والأحزاب</h1>
        <p className="text-sm text-muted-foreground font-arabic">٣٠ جزءاً</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="juz-list">
        {JUZ_RANGES.map((juz) => {
          const startSurah = SURAHS.find((s) => s.number === juz.surah);
          const nextJuz = JUZ_RANGES[juz.juz];
          const endSurah = nextJuz
            ? SURAHS.find((s) => s.number === nextJuz.surah)
            : SURAHS[113];
          return (
            <Link key={juz.juz} href={`/read/${juz.surah}`}>
              <Card className="cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors" data-testid={`juz-card-${juz.juz}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{juz.juz}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-arabic font-semibold text-sm">الجزء {juz.juz}</p>
                    <p className="text-xs text-muted-foreground font-arabic">
                      {startSurah?.nameArabic} ({juz.verse}) — {endSurah?.nameArabic}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-arabic text-xs shrink-0">
                    سورة {juz.surah}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

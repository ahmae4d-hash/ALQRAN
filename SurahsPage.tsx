import { useState } from "react";
import { Link } from "wouter";
import { SURAHS } from "@/lib/surahs";
import { useAudio } from "@/contexts/AudioContext";
import { Search, Play, BookOpen, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

export default function SurahsPage() {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const audio = useAudio();

  const filtered = SURAHS.filter(
    (s) =>
      s.nameArabic.includes(query) ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      String(s.number).includes(query)
  );
  const meccan = filtered.filter((s) => s.revelation === "Meccan");
  const medinan = filtered.filter((s) => s.revelation === "Medinan");

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-arabic font-bold text-primary">السور القرآنية</h1>
          <p className="text-xs text-muted-foreground font-arabic">١١٤ سورة</p>
        </div>
        <div className="flex gap-1">
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-8 w-8"
            onClick={() => setViewMode("list")} data-testid="btn-view-list">
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8"
            onClick={() => setViewMode("grid")} data-testid="btn-view-grid">
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن سورة بالاسم أو الرقم..."
          className="pr-9 font-arabic"
          data-testid="input-surah-search"
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4 font-arabic">
          <TabsTrigger value="all" data-testid="tab-all">الكل ({filtered.length})</TabsTrigger>
          <TabsTrigger value="meccan" data-testid="tab-meccan">مكية ({meccan.length})</TabsTrigger>
          <TabsTrigger value="medinan" data-testid="tab-medinan">مدنية ({medinan.length})</TabsTrigger>
        </TabsList>

        {(["all", "meccan", "medinan"] as const).map((tab) => {
          const list = tab === "all" ? filtered : tab === "meccan" ? meccan : medinan;
          return (
            <TabsContent key={tab} value={tab}>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2" data-testid={`surah-grid-${tab}`}>
                  {list.map((surah) => (
                    <Link key={surah.number} href={`/read/${surah.number}`}>
                      <div
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
                          surah.revelation === "Meccan"
                            ? "border-amber-200/60 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/10 hover:border-amber-400/60"
                            : "border-blue-200/60 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10 hover:border-blue-400/60"
                        )}
                        data-testid={`surah-grid-card-${surah.number}`}
                      >
                        <span className="text-[10px] text-muted-foreground">{surah.number}</span>
                        <span className="font-arabic font-bold text-sm text-center leading-tight">{surah.nameArabic}</span>
                        <span className="text-[10px] text-muted-foreground font-arabic">{surah.versesCount} آية</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5" data-testid={`surah-list-${tab}`}>
                  {list.map((surah) => (
                    <div
                      key={surah.number}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/3 transition-all group"
                      data-testid={`surah-card-${surah.number}`}
                    >
                      {/* Number */}
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{surah.number}</span>
                      </div>

                      {/* Info */}
                      <Link href={`/read/${surah.number}`} className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-arabic font-semibold text-foreground">{surah.nameArabic}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-arabic",
                                surah.revelation === "Meccan"
                                  ? "border-amber-400/50 text-amber-600 dark:text-amber-400"
                                  : "border-blue-400/50 text-blue-600 dark:text-blue-400"
                              )}
                            >
                              {surah.revelation === "Meccan" ? "مكية" : "مدنية"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-arabic mt-0.5">
                          {surah.versesCount} آية — الجزء {surah.juz[0]}
                        </p>
                      </Link>

                      {/* Action buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={(e) => { e.preventDefault(); audio.play(surah.number, 1); }}
                          data-testid={`btn-play-surah-${surah.number}`}>
                          <Play className="h-3 w-3" />
                        </Button>
                        <Link href={`/read/${surah.number}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`btn-read-surah-${surah.number}`}>
                            <BookOpen className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

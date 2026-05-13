import { useState } from "react";
import { Link } from "wouter";
import { searchQuran } from "@/lib/quranApi";
import { SURAHS } from "@/lib/surahs";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult { surahNumber: number; verseNumber: number; text: string; }

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const r = await searchQuran(query);
    setResults(r);
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto" dir="rtl">
      <h1 className="text-xl font-arabic font-bold text-primary mb-4">البحث في القرآن</h1>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في القرآن الكريم..."
            className="pr-9 font-arabic"
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            data-testid="input-search"
          />
        </div>
        <Button onClick={doSearch} disabled={loading || !query.trim()} data-testid="btn-search">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-12" data-testid="search-loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground font-arabic" data-testid="search-empty">
          لا توجد نتائج لـ "{query}"
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2" data-testid="search-results">
          <p className="text-sm text-muted-foreground font-arabic mb-3">{results.length} نتيجة</p>
          {results.map((r, i) => {
            const surah = SURAHS.find((s) => s.number === r.surahNumber);
            return (
              <Link key={i} href={`/read/${r.surahNumber}`}>
                <Card className="cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors mb-2" data-testid={`search-result-${i}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Badge variant="outline" className="font-arabic text-xs shrink-0">
                        {surah?.nameArabic} : {r.verseNumber}
                      </Badge>
                    </div>
                    <p className="font-quran text-sm leading-loose text-right">{r.text}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {!searched && (
        <div className="text-center py-12" data-testid="search-placeholder">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground font-arabic">ابحث عن آية أو كلمة في القرآن الكريم</p>
        </div>
      )}
    </div>
  );
}

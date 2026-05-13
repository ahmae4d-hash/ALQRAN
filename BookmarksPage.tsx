import { useState, useEffect } from "react";
import { Link } from "wouter";
import { getBookmarks, removeBookmark } from "@/lib/storage";
import { SURAHS } from "@/lib/surahs";
import type { Bookmark } from "@/lib/types";
import { Bookmark as BookmarkIcon, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    getBookmarks().then((bm) =>
      setBookmarks(bm.sort((a, b) => b.createdAt - a.createdAt))
    );
  }, []);

  const remove = async (id: string) => {
    await removeBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto" dir="rtl">
      <h1 className="text-xl font-arabic font-bold text-primary mb-4">الإشارات المرجعية</h1>

      {bookmarks.length === 0 ? (
        <div className="text-center py-16" data-testid="bookmarks-empty">
          <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground font-arabic">لا توجد إشارات مرجعية بعد</p>
          <p className="text-xs text-muted-foreground font-arabic mt-1">يمكنك إضافة إشارة من صفحة القراءة</p>
        </div>
      ) : (
        <div className="space-y-2" data-testid="bookmarks-list">
          {bookmarks.map((bm) => {
            const surah = SURAHS.find((s) => s.number === bm.surahNumber);
            return (
              <Card key={bm.id} className="hover:border-primary/30 transition-colors" data-testid={`bookmark-${bm.id}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <BookmarkIcon className="h-4 w-4 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-arabic font-semibold text-sm">{surah?.nameArabic}</span>
                      <Badge variant="outline" className="text-[10px] font-arabic">الآية {bm.verseNumber}</Badge>
                    </div>
                    {bm.note && <p className="text-xs text-muted-foreground font-arabic truncate mt-0.5">{bm.note}</p>}
                    <p className="text-[10px] text-muted-foreground font-arabic mt-0.5">
                      {new Date(bm.createdAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Link href={`/read/${bm.surahNumber}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`btn-goto-bookmark-${bm.id}`}>
                        <BookOpen className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => remove(bm.id)} data-testid={`btn-remove-bookmark-${bm.id}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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

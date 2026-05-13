import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-full flex items-center justify-center p-8" dir="rtl">
      <div className="text-center">
        <p className="font-quran text-2xl text-primary mb-2">﴿ وَاللَّهُ عَلِيمٌ بِكُلِّ شَيْءٍ ﴾</p>
        <h2 className="text-xl font-arabic font-bold text-foreground mb-2">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground font-arabic mb-6">عذراً، لم نتمكن من العثور على هذه الصفحة</p>
        <Link href="/">
          <Button className="gap-2 font-arabic" data-testid="btn-home">
            <Home className="h-4 w-4" /> العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}

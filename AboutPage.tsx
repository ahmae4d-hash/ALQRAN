import { Phone, MessageCircle, Mail, Code2, BookOpen, Star, Heart, Shield, Globe, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES_LIST = [
  "قراءة القرآن الكريم كاملاً بـ 5 روايات",
  "22 قارئاً من كبار قراء العالم",
  "نظام حفظ وتتبع الآيات",
  "اختبارات تفاعلية متعددة الأنواع",
  "التسميع بتسجيل الصوت",
  "التفسير من 6 مصادر موثوقة",
  "بحث في القرآن الكريم",
  "الإشارات المرجعية والتعليقات",
  "يعمل بدون إنترنت (PWA)",
  "دعم الوضع الليلي والنهاري",
  "إحصائيات وتتبع التقدم",
  "دعم جميع المقامات الموسيقية",
];

const TECH_STACK = [
  { name: "React 19", desc: "واجهة المستخدم" },
  { name: "TypeScript", desc: "أمان الأنواع" },
  { name: "Vite + PWA", desc: "بناء وتطوير" },
  { name: "Tailwind CSS v4", desc: "التصميم" },
  { name: "IndexedDB", desc: "التخزين المحلي" },
  { name: "alquran.cloud", desc: "نص القرآن" },
  { name: "everyayah.com", desc: "الصوتيات" },
  { name: "shadcn/ui", desc: "مكونات UI" },
];

function IslamicPattern() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full opacity-10" fill="currentColor">
      <defs>
        <pattern id="islamic-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <polygon points="20,0 40,10 40,30 20,40 0,30 0,10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <polygon points="20,5 35,12.5 35,27.5 20,35 5,27.5 5,12.5" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <polygon points="20,10 30,15 30,25 20,30 10,25 10,15" fill="none" stroke="currentColor" strokeWidth="0.2" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#islamic-grid)" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <polygon points="100,40 130,80 120,125 80,125 70,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <polygon points="100,160 70,120 80,75 120,75 130,120" fill="none" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

export default function AboutPage() {
  const whatsappUrl = "https://wa.me/201090844039?text=السلام%20عليكم%2C%20أتواصل%20معكم%20بخصوص%20تطبيق%20المصحف%20الشريف";

  return (
    <div className="min-h-full" dir="rtl">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-bl from-primary/20 via-background to-accent/10 border-b border-border overflow-hidden">
        <div className="absolute inset-0 text-primary pointer-events-none">
          <IslamicPattern />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-quran text-4xl text-primary mb-2">المصحف الشريف</h1>
          <p className="font-arabic text-lg text-foreground/80 mb-3">تطبيق القرآن الكريم المتكامل</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge className="font-arabic">PWA</Badge>
            <Badge variant="outline" className="font-arabic">مجاني بالكامل</Badge>
            <Badge variant="outline" className="font-arabic">يعمل بدون إنترنت</Badge>
            <Badge variant="outline" className="font-arabic">الإصدار 2.0</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* About the App */}
        <Card data-testid="card-about-app">
          <CardHeader>
            <CardTitle className="font-arabic flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              عن التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-arabic text-foreground/80 leading-relaxed mb-4">
              المصحف الشريف هو تطبيق قرآني متكامل يجمع بين التلاوة والحفظ والاستماع والتفسير في منصة واحدة.
              يهدف التطبيق إلى تيسير التفاعل مع كتاب الله الكريم لكل مسلم في كل مكان.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES_LIST.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-arabic text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="about-stats">
          {[
            { label: "سورة", value: "١١٤", icon: BookOpen, color: "text-green-500" },
            { label: "آية", value: "٦٢٣٦", icon: Star, color: "text-amber-500" },
            { label: "قارئ", value: "٢٢", icon: Heart, color: "text-rose-500" },
            { label: "تفسير", value: "٦", icon: Globe, color: "text-blue-500" },
          ].map((s) => (
            <Card key={s.label} className="text-center" data-testid={`about-stat-${s.label}`}>
              <CardContent className="p-4">
                <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
                <p className="font-arabic text-3xl font-bold text-primary">{s.value}</p>
                <p className="font-arabic text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Quran Visual */}
        <Card className="overflow-hidden" data-testid="card-quran-visual">
          <CardContent className="p-0">
            <div className="relative bg-gradient-to-bl from-primary to-primary/70 p-8 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 400 200" className="w-full h-full" fill="white">
                  {[...Array(8)].map((_, i) => (
                    <g key={i} transform={`translate(${i * 50}, 0)`}>
                      <polygon points="25,10 45,30 45,70 25,90 5,70 5,30" fill="none" stroke="white" strokeWidth="0.5" />
                      <polygon points="25,20 38,35 38,65 25,80 12,65 12,35" fill="none" stroke="white" strokeWidth="0.3" />
                    </g>
                  ))}
                  {[...Array(4)].map((_, i) => (
                    <circle key={i} cx={50 + i * 100} cy="100" r={20 + i * 5} fill="none" stroke="white" strokeWidth="0.3" />
                  ))}
                </svg>
              </div>
              <div className="relative">
                <p className="font-quran text-3xl text-white mb-2">﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾</p>
                <p className="font-arabic text-white/80 text-sm">سورة العلق — الآية الأولى</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card data-testid="card-tech-stack">
          <CardHeader>
            <CardTitle className="font-arabic flex items-center gap-2">
              <Code2 className="h-5 w-5 text-accent" />
              التقنيات المستخدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TECH_STACK.map((t) => (
                <div key={t.name} className="bg-muted rounded-lg p-2.5 text-center" data-testid={`tech-${t.name}`}>
                  <p className="font-mono text-xs font-bold text-primary">{t.name}</p>
                  <p className="font-arabic text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Developer Contact */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5" data-testid="card-developer-contact">
          <CardHeader>
            <CardTitle className="font-arabic flex items-center gap-2">
              <Phone className="h-5 w-5 text-accent" />
              تواصل مع المطور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg font-arabic">م</span>
              </div>
              <div>
                <p className="font-arabic font-bold text-foreground">المطوّر</p>
                <p className="font-arabic text-sm text-muted-foreground">مطوّر تطبيق المصحف الشريف</p>
                <p className="font-arabic text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-green-500" />
                  متاح للتواصل والدعم الفني
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full gap-2 font-arabic bg-green-600 hover:bg-green-700 text-white" data-testid="btn-whatsapp">
                  <MessageCircle className="h-4 w-4" />
                  تواصل عبر واتساب
                  <span className="text-white/80 text-xs">01090844039</span>
                </Button>
              </a>

              <a href="tel:+201090844039">
                <Button variant="outline" className="w-full gap-2 font-arabic" data-testid="btn-phone">
                  <Phone className="h-4 w-4" />
                  اتصل مباشرة: 01090844039
                </Button>
              </a>
            </div>

            <div className="text-center pt-2 border-t border-border">
              <p className="text-xs font-arabic text-muted-foreground">
                ساعات العمل: السبت — الخميس، ٩ ص — ١٠ م
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dua / Prayer */}
        <Card className="bg-gradient-to-bl from-accent/10 to-primary/5 border-accent/20" data-testid="card-dua">
          <CardContent className="p-6 text-center">
            <p className="font-quran text-xl text-primary leading-loose mb-2">
              ﴿ رَبِّ زِدْنِي عِلْمًا ﴾
            </p>
            <p className="font-arabic text-sm text-muted-foreground">سورة طه — الآية ١١٤</p>
            <p className="font-arabic text-xs text-muted-foreground mt-3">
              جعله الله خالصاً لوجهه الكريم — نفع الله به الأمة الإسلامية
            </p>
          </CardContent>
        </Card>

        <p className="text-center font-arabic text-xs text-muted-foreground pb-4">
          © {new Date().getFullYear()} المصحف الشريف — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}

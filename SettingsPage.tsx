import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudio } from "@/contexts/AudioContext";
import { RECITERS } from "@/lib/reciters";
import { NARRATIONS } from "@/lib/reciters";
import { TAFSIR_EDITIONS } from "@/lib/tafsirApi";
import { clearCache } from "@/lib/quranApi";
import { Sun, Moon, Monitor, Type, Book, Headphones, Settings, Trash2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const FONT_FAMILIES = [
  { id: "uthmanic", name: "Amiri (عثماني)" },
  { id: "naskh", name: "Naskh (نسخ)" },
  { id: "default", name: "الافتراضي" },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const audio = useAudio();
  const { toast } = useToast();

  const clearAllCache = async () => {
    await clearCache();
    toast({ title: "تم مسح الكاش", description: "سيتم إعادة تحميل البيانات عند الحاجة" });
  };

  const SECTIONS = [
    {
      title: "المظهر",
      icon: Sun,
      content: (
        <div className="space-y-4">
          <div>
            <Label className="font-arabic text-sm mb-2 block">الثيم</Label>
            <div className="flex gap-2">
              {([["light", "نهاري", Sun], ["dark", "ليلي", Moon], ["auto", "تلقائي", Monitor]] as const).map(([v, label, Icon]) => (
                <Button key={v} variant={theme === v ? "default" : "outline"} size="sm"
                  className="font-arabic gap-1 flex-1" onClick={() => setTheme(v)} data-testid={`btn-theme-${v}`}>
                  <Icon className="h-3.5 w-3.5" /> {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "القراءة",
      icon: Type,
      content: (
        <div className="space-y-4">
          <div>
            <Label className="font-arabic text-sm mb-2 block">حجم الخط: {settings.fontSize}px</Label>
            <Slider value={[settings.fontSize]} min={14} max={44} step={2}
              onValueChange={([v]) => updateSettings({ fontSize: v })}
              data-testid="slider-settings-font-size" />
          </div>
          <div>
            <Label className="font-arabic text-sm mb-2 block">نوع الخط</Label>
            <Select value={settings.fontFamily} onValueChange={(v: "uthmanic" | "naskh" | "default") => updateSettings({ fontFamily: v })}>
              <SelectTrigger className="font-arabic" data-testid="select-font-family"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="font-arabic" data-testid={`option-font-${f.id}`}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-arabic text-sm mb-2 block">الرواية</Label>
            <Select value={settings.narration} onValueChange={(v) => updateSettings({ narration: v })}>
              <SelectTrigger className="font-arabic" data-testid="select-settings-narration"><SelectValue /></SelectTrigger>
              <SelectContent>
                {NARRATIONS.map((n) => (
                  <SelectItem key={n.id} value={n.id} className="font-arabic" data-testid={`option-narration-settings-${n.id}`}>{n.nameArabic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-arabic text-sm mb-2 block">التفسير الافتراضي</Label>
            <Select value={settings.tafsirSource} onValueChange={(v) => updateSettings({ tafsirSource: v })}>
              <SelectTrigger className="font-arabic" data-testid="select-tafsir-default"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TAFSIR_EDITIONS.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="font-arabic" data-testid={`option-tafsir-default-${e.id}`}>{e.nameArabic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: "الصوت",
      icon: Headphones,
      content: (
        <div className="space-y-4">
          <div>
            <Label className="font-arabic text-sm mb-2 block">القارئ الافتراضي</Label>
            <Select value={settings.selectedReciterId} onValueChange={(v) => { updateSettings({ selectedReciterId: v }); audio.setReciter(v); }}>
              <SelectTrigger className="font-arabic" data-testid="select-default-reciter"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-56 overflow-y-auto">
                {RECITERS.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="font-arabic text-xs" data-testid={`option-default-reciter-${r.id}`}>{r.nameArabic}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-arabic text-sm mb-2 block">سرعة التشغيل: {settings.playbackSpeed ?? 1}x</Label>
            <Slider value={[settings.playbackSpeed ?? 1]} min={0.5} max={2} step={0.25}
              onValueChange={([v]) => updateSettings({ playbackSpeed: v })}
              data-testid="slider-speed" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-arabic text-sm">التشغيل التلقائي للآية التالية</Label>
            <Switch checked={settings.autoAdvance} onCheckedChange={(v) => updateSettings({ autoAdvance: v })} data-testid="switch-auto-advance" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-arabic text-sm">تكرار الآية</Label>
            <Switch checked={settings.repeatVerse} onCheckedChange={(v) => updateSettings({ repeatVerse: v })} data-testid="switch-repeat-verse" />
          </div>
        </div>
      ),
    },
    {
      title: "البيانات والكاش",
      icon: Trash2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-arabic">بعد تحميل السور لأول مرة، ستعمل بدون إنترنت تماماً</p>
          <Button variant="outline" className="w-full font-arabic gap-2" onClick={clearAllCache} data-testid="btn-clear-cache">
            <Trash2 className="h-4 w-4" /> مسح الكاش
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto" dir="rtl">
      <h1 className="text-xl font-arabic font-bold text-primary mb-6">الإعدادات</h1>
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <Card key={section.title} data-testid={`settings-section-${section.title}`}>
            <CardHeader className="pb-2">
              <CardTitle className="font-arabic text-sm flex items-center gap-2">
                <section.icon className="h-4 w-4 text-accent" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>{section.content}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudio } from "@/contexts/AudioContext";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";
import {
  BookOpen, Headphones, Brain, ClipboardList, Mic2,
  BookMarked, Search, Bookmark, Settings, TrendingUp,
  Users, Layout, Moon, Sun, Home, Menu, X,
  Volume2, VolumeX, Pause, Play, SkipForward, SkipBack, Star, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SURAHS } from "@/lib/surahs";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "الرئيسية" },
  { href: "/surahs", icon: Layout, label: "السور" },
  { href: "/read", icon: BookOpen, label: "القراءة" },
  { href: "/listen", icon: Headphones, label: "الاستماع" },
  { href: "/memorize", icon: Brain, label: "الحفظ" },
  { href: "/test", icon: ClipboardList, label: "الاختبارات" },
  { href: "/tasmee", icon: Mic2, label: "التسميع" },
  { href: "/tafsir", icon: BookMarked, label: "التفسير" },
  { href: "/search", icon: Search, label: "البحث" },
  { href: "/bookmarks", icon: Bookmark, label: "الإشارات" },
  { href: "/reciters", icon: Users, label: "القراء" },
  { href: "/juz", icon: Star, label: "الأجزاء" },
  { href: "/progress", icon: TrendingUp, label: "التقدم" },
  { href: "/settings", icon: Settings, label: "الإعدادات" },
  { href: "/about", icon: Info, label: "عن التطبيق" },
];

const PRIMARY_NAV = NAV_ITEMS.slice(0, 8);
const SECONDARY_NAV = NAV_ITEMS.slice(8);

function AudioBar() {
  const audio = useAudio();
  const surah = SURAHS.find((s) => s.number === audio.currentSurah);
  const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  if (!audio.isPlaying && audio.currentTime === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border shadow-2xl" data-testid="audio-bar">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <Slider
          value={[progress]} max={100} step={0.1}
          onValueChange={([v]) => audio.seek((v / 100) * audio.duration)}
          className="h-1 mb-2" data-testid="audio-progress"
        />
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-arabic font-medium truncate text-foreground">
              {surah?.nameArabic} — الآية {audio.currentVerse}
            </p>
            <p className="text-[10px] text-muted-foreground">{formatTime(audio.currentTime)} / {formatTime(audio.duration)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={audio.prevVerse} data-testid="btn-audio-prev">
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" className="h-8 w-8 rounded-full"
              onClick={audio.isPlaying ? audio.pause : audio.resume} data-testid="btn-audio-play">
              {audio.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"
              onClick={() => audio.nextVerse(surah?.versesCount ?? 286)} data-testid="btn-audio-next">
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={audio.toggleMute} data-testid="btn-audio-mute">
              {audio.isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavLink({ item, active, compact = false }: { item: typeof NAV_ITEMS[0]; active: boolean; compact?: boolean }) {
  return (
    <Link href={item.href}>
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-arabic cursor-pointer transition-all whitespace-nowrap",
          compact && "px-2 py-1",
          active
            ? "bg-primary text-primary-foreground font-semibold"
            : "text-foreground/70 hover:text-foreground hover:bg-muted"
        )}
        data-testid={`nav-${item.href.replace("/", "") || "home"}`}
      >
        <item.icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        <span>{item.label}</span>
      </div>
    </Link>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const audio = useAudio();
  const showAudioBar = audio.isPlaying || audio.currentTime > 0;

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden" dir="rtl">
      {/* Top Header */}
      <header className="shrink-0 border-b border-border bg-card/95 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" data-testid="btn-mobile-menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0" dir="rtl">
                <div className="p-4 border-b border-border">
                  <h2 className="font-arabic font-bold text-primary text-lg">القائمة</h2>
                </div>
                <nav className="p-3 space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-arabic cursor-pointer transition-colors",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-muted"
                      )}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </div>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/">
              <span className="font-arabic font-bold text-primary text-base cursor-pointer" data-testid="app-title">
                المصحف الشريف
              </span>
            </Link>
          </div>

          {/* Desktop search shortcut */}
          <Link href="/search" className="hidden md:block">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground hover:border-primary/30 hover:bg-muted cursor-pointer transition-colors" data-testid="nav-search-shortcut">
              <Search className="h-3.5 w-3.5" />
              <span className="font-arabic">بحث في القرآن...</span>
            </div>
          </Link>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme} data-testid="btn-toggle-theme">
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation tabs bar */}
        <div className="max-w-7xl mx-auto px-4 pb-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} compact />
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={cn("flex-1 overflow-y-auto", showAudioBar && "pb-20")}>
        {children}
      </main>

      {/* Bottom mobile nav */}
      <nav className="md:hidden shrink-0 flex items-center justify-around border-t border-border bg-card py-2 z-30">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn("flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg cursor-pointer",
                active ? "text-primary" : "text-muted-foreground")}
                data-testid={`mobile-bottom-nav-${item.href.replace("/", "") || "home"}`}>
                <item.icon className="h-5 w-5" />
                <span className="text-[9px] font-arabic">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <AudioBar />
    </div>
  );
}

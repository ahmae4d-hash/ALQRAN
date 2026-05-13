import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { SURAHS, getSurah } from "@/lib/surahs";
import { RECITERS, getReciter } from "@/lib/reciters";
import { getSurahVerses } from "@/lib/quranApi";
import { useAudio } from "@/contexts/AudioContext";
import { useSettings } from "@/contexts/SettingsContext";
import type { Verse } from "@/lib/types";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function ListenPage() {
  const { surahNumber } = useParams<{ surahNumber?: string }>();
  const { settings, updateSettings } = useSettings();
  const audio = useAudio();
  const [surahNum, setSurahNum] = useState(Number(surahNumber) || settings.lastRead?.surahNumber || 1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const surah = getSurah(surahNum);
  const reciter = getReciter(audio.reciterId);

  useEffect(() => {
    setLoading(true);
    getSurahVerses(surahNum).then((v) => { setVerses(v); setLoading(false); });
  }, [surahNum]);

  const togglePlay = () => {
    if (audio.isPlaying) audio.pause();
    else if (audio.currentSurah === surahNum && audio.currentTime > 0) audio.resume();
    else audio.play(surahNum, 1);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto" dir="rtl">
      <h1 className="text-xl font-arabic font-bold text-primary mb-4">الاستماع</h1>

      <Card className="mb-4" data-testid="player-card">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-arabic font-bold text-lg text-foreground">{reciter.nameArabic}</h2>
            <p className="text-sm text-muted-foreground font-arabic">{surah?.nameArabic} — الآية {audio.currentVerse}</p>
          </div>

          <div className="mb-4">
            <Slider
              value={[audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0]}
              max={100} step={0.1}
              onValueChange={([v]) => audio.seek((v / 100) * audio.duration)}
              data-testid="player-progress-slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(audio.currentTime)}</span>
              <span>{formatTime(audio.duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={audio.prevVerse} data-testid="btn-listen-prev">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button size="icon" className="h-12 w-12 rounded-full" onClick={togglePlay} data-testid="btn-listen-play">
              {audio.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> :
                audio.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => audio.nextVerse(surah?.versesCount ?? 286)} data-testid="btn-listen-next">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={audio.toggleMute} data-testid="btn-mute-listen">
              {audio.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider value={[audio.isMuted ? 0 : audio.volume * 100]} max={100} step={1}
              onValueChange={([v]) => audio.setVolume(v / 100)}
              className="flex-1" data-testid="volume-slider" />
            <Select value={String(settings.playbackSpeed ?? 1)}
              onValueChange={(v) => updateSettings({ playbackSpeed: Number(v) })}>
              <SelectTrigger className="w-16 h-8 text-xs" data-testid="select-speed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPEEDS.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs" data-testid={`option-speed-${s}`}>{s}x</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted-foreground font-arabic mb-1 block">السورة</label>
          <Select value={String(surahNum)} onValueChange={(v) => setSurahNum(Number(v))}>
            <SelectTrigger className="font-arabic text-sm" data-testid="select-listen-surah">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-56 overflow-y-auto">
              {SURAHS.map((s) => (
                <SelectItem key={s.number} value={String(s.number)} className="font-arabic text-xs" data-testid={`option-listen-surah-${s.number}`}>
                  {s.number}. {s.nameArabic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-arabic mb-1 block">القارئ</label>
          <Select value={audio.reciterId} onValueChange={audio.setReciter}>
            <SelectTrigger className="font-arabic text-sm" data-testid="select-listen-reciter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-56 overflow-y-auto">
              {RECITERS.map((r) => (
                <SelectItem key={r.id} value={r.id} className="font-arabic text-xs" data-testid={`option-reciter-${r.id}`}>
                  {r.nameArabic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-1" data-testid="listen-verses-list">
          {verses.map((verse) => (
            <div
              key={verse.number}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                audio.currentVerse === verse.number && audio.currentSurah === surahNum && "bg-primary/10 border border-primary/30"
              )}
              onClick={() => audio.play(surahNum, verse.number)}
              data-testid={`listen-verse-${verse.number}`}
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {audio.currentVerse === verse.number && audio.currentSurah === surahNum && audio.isPlaying
                  ? <Pause className="h-3 w-3 text-primary" />
                  : <span className="text-[10px] text-primary font-bold">{verse.number}</span>}
              </div>
              <p className="font-quran text-sm leading-loose flex-1 text-right truncate">{verse.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

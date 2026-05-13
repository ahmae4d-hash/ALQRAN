import { useState } from "react";
import { RECITERS, NARRATIONS, MAQAMAT, getRecitersByNarration, getRecitersByMaqam } from "@/lib/reciters";
import { useAudio } from "@/contexts/AudioContext";
import { Check, Play, Users, Globe, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function RecitersPage() {
  const audio = useAudio();
  const [selectedMaqam, setSelectedMaqam] = useState("all");

  const getFilteredByMaqam = () => selectedMaqam === "all" ? RECITERS : getRecitersByMaqam(selectedMaqam);

  const ReciterCard = ({ reciter }: { reciter: typeof RECITERS[0] }) => {
    const isSelected = audio.reciterId === reciter.id;
    const narration = NARRATIONS.find((n) => n.id === reciter.narration);
    return (
      <Card
        className={cn("cursor-pointer transition-all hover:shadow-md", isSelected && "border-primary bg-primary/5 shadow-md")}
        onClick={() => audio.setReciter(reciter.id)}
        data-testid={`reciter-card-${reciter.id}`}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-arabic font-bold",
              isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
              {isSelected ? <Check className="h-5 w-5" /> : reciter.nameArabic.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <p className="font-arabic font-bold text-sm leading-tight">{reciter.nameArabic}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-arabic shrink-0">
                  <Globe className="h-2.5 w-2.5" /> {reciter.country}
                </div>
              </div>
              <p className="font-arabic text-xs text-muted-foreground mt-0.5 line-clamp-2">{reciter.bio}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <Badge variant="outline" className="text-[9px] font-arabic">{narration?.nameArabic}</Badge>
                <Badge variant="outline" className="text-[9px] font-arabic">{reciter.style === "Murattal" ? "مرتل" : "مجود"}</Badge>
                {reciter.maqamat.slice(0, 2).map(mId => {
                  const m = MAQAMAT.find(x => x.id === mId);
                  return m ? (
                    <Badge key={mId} variant="secondary" className="text-[9px] font-arabic">{m.nameArabic}</Badge>
                  ) : null;
                })}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"
              onClick={(e) => { e.stopPropagation(); audio.setReciter(reciter.id); audio.play(1, 1); }}
              data-testid={`btn-preview-reciter-${reciter.id}`}>
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-arabic font-bold text-primary">القراء الكرام</h1>
          <p className="text-xs text-muted-foreground font-arabic">{RECITERS.length} قارئاً متاحاً</p>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-3 font-arabic flex-wrap h-auto gap-1">
          <TabsTrigger value="all" data-testid="tab-reciters-all">الكل ({RECITERS.length})</TabsTrigger>
          <TabsTrigger value="hafs" data-testid="tab-reciters-hafs">حفص ({getRecitersByNarration("hafs").length})</TabsTrigger>
          <TabsTrigger value="warsh" data-testid="tab-reciters-warsh">ورش ({getRecitersByNarration("warsh").length})</TabsTrigger>
          <TabsTrigger value="maqamat" data-testid="tab-reciters-maqamat">
            <Music className="h-3.5 w-3.5 ml-1" /> المقامات
          </TabsTrigger>
        </TabsList>

        {["all", "hafs", "warsh"].map((tab) => {
          const list = tab === "all" ? RECITERS : getRecitersByNarration(tab);
          return (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-2" data-testid={`reciters-list-${tab}`}>
                {list.map((r) => <ReciterCard key={r.id} reciter={r} />)}
              </div>
            </TabsContent>
          );
        })}

        <TabsContent value="maqamat">
          <div className="mb-3">
            <Select value={selectedMaqam} onValueChange={setSelectedMaqam}>
              <SelectTrigger className="font-arabic" data-testid="select-maqam">
                <SelectValue placeholder="اختر المقام" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-arabic">كل المقامات</SelectItem>
                {MAQAMAT.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="font-arabic text-sm"
                    data-testid={`option-maqam-${m.id}`}>
                    {m.nameArabic} — {m.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Maqamat info cards */}
          {selectedMaqam === "all" && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {MAQAMAT.map((m) => (
                <button key={m.id} onClick={() => setSelectedMaqam(m.id)}
                  className="text-right p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  data-testid={`maqam-info-${m.id}`}>
                  <p className="font-arabic font-bold text-sm text-primary">{m.nameArabic}</p>
                  <p className="font-arabic text-[10px] text-muted-foreground mt-0.5">{m.description}</p>
                  <p className="font-arabic text-[10px] text-accent mt-1">
                    {getRecitersByMaqam(m.id).length} قراء
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2" data-testid="reciters-list-maqam">
            {getFilteredByMaqam().map((r) => <ReciterCard key={r.id} reciter={r} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

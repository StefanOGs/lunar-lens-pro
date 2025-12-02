import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Moon, Sun } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NatalChartWheel from "./NatalChartWheel";

interface NatalChartData {
  birthData: {
    date: string;
    time: string;
    location: string;
    coordinates: { lat: number; lon: number };
  };
  chart: {
    sunSign: string;
    ascendant: { sign: string; degree: number };
    planets: Array<{
      name: string;
      sign: string;
      degree: number;
      house: number;
    }>;
    houses: Array<{
      house: number;
      sign: string;
      degree: number;
    }>;
    aspects: Array<{
      planet1: string;
      planet2: string;
      aspect: string;
      angle: number;
    }>;
  };
  analysis: string;
}

interface NatalChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: NatalChartData | null;
}

const NatalChartModal = ({ open, onOpenChange, data }: NatalChartModalProps) => {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) return; onOpenChange(isOpen); }}>
      <DialogContent className="max-w-4xl max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl text-center">Вашата Натална Карта</DialogTitle>
          <DialogDescription className="text-center">
            {data.birthData.date} в {data.birthData.time}, {data.birthData.location}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Natal Chart Wheel Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Графична Натална Карта</CardTitle>
                <CardDescription className="text-center">
                  Визуализация на вашата натална карта с всички планети, домове и аспекти
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NatalChartWheel
                  planets={data.chart.planets || []}
                  houses={data.chart.houses || []}
                  aspects={data.chart.aspects || []}
                  ascendantDegree={data.chart.houses?.[0] 
                    ? (() => {
                        const SIGNS = ["Овен", "Телец", "Близнаци", "Рак", "Лъв", "Дева", "Везни", "Скорпион", "Стрелец", "Козирог", "Водолей", "Риби"];
                        const signIndex = SIGNS.indexOf(data.chart.houses[0].sign);
                        return signIndex >= 0 ? signIndex * 30 + data.chart.houses[0].degree : 0;
                      })()
                    : 0}
                />
              </CardContent>
            </Card>

            {/* Basic Chart Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Слънчев Знак</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.chart.sunSign}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Асцендент</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data.chart.ascendant.sign}</p>
                  <p className="text-sm text-muted-foreground">{data.chart.ascendant.degree}°</p>
                </CardContent>
              </Card>
            </div>

            {/* Planets */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" />
                  <CardTitle>Планетарни Позиции</CardTitle>
                </div>
                <CardDescription>Позициите на основните планети във вашата натална карта</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {data.chart.planets?.length > 0 ? data.chart.planets.map((planet, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-medium">{planet.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {planet.sign} {planet.degree}° • {planet.house}-ти дом
                      </div>
                    </div>
                  )) : <p className="text-muted-foreground">Няма данни за планети</p>}
                </div>
              </CardContent>
            </Card>

            {/* Houses */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <CardTitle>Астрологични Домове</CardTitle>
                </div>
                <CardDescription>Позициите на 12-те астрологични дома</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {data.chart.houses?.length > 0 ? data.chart.houses.map((house) => (
                    <div key={house.house} className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium">{house.house}-ти дом</div>
                      <div className="text-sm text-muted-foreground">
                        {house.sign} {house.degree}°
                      </div>
                    </div>
                  )) : <p className="text-muted-foreground col-span-full">Няма данни за домове</p>}
                </div>
              </CardContent>
            </Card>

            {/* Aspects */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle>Планетарни Аспекти</CardTitle>
                </div>
                <CardDescription>Важни ъглови връзки между планетите</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {data.chart.aspects?.length > 0 ? data.chart.aspects.map((aspect, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm">
                        {aspect.planet1} {aspect.aspect} {aspect.planet2}
                      </span>
                      <span className="text-xs text-muted-foreground">{aspect.angle}°</span>
                    </div>
                  )) : <p className="text-muted-foreground">Няма данни за аспекти</p>}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Астрологичен Анализ</CardTitle>
                <CardDescription>Подробна интерпретация на вашата натална карта</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {data.analysis.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NatalChartModal;

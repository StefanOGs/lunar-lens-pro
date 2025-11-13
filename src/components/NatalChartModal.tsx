import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Moon, Sun } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NatalChartData {
  birthData: {
    date: string;
    time: string;
    location: string;
    coordinates: { lat: number; lon: number };
  };
  chart: {
    sunSign: string;
    ascendant: string;
    planets: Array<{
      name: string;
      sign: string;
      degree: number;
      house: number;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
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
                  <p className="text-2xl font-bold">{data.chart.ascendant}</p>
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
                  {data.chart.planets.map((planet, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-medium">{planet.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {planet.sign} {planet.degree}° • {planet.house}-ти дом
                      </div>
                    </div>
                  ))}
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Briefcase, TrendingUp, Star, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CareerCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data
const careerMeter = {
  entrepreneur: 65,
  leader: 35,
};

const strengths = [
  "Креативно мислене",
  "Лидерски качества",
  "Стратегическо планиране",
  "Комуникационни умения",
  "Адаптивност към промени",
];

const prosperityAreas = [
  { name: "Технологии и иновации", icon: "💻" },
  { name: "Консултации и обучения", icon: "📚" },
  { name: "Творчески индустрии", icon: "🎨" },
  { name: "Финанси и инвестиции", icon: "💰" },
];

const CareerCodeDialog = ({ open, onOpenChange }: CareerCodeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Финансов Код на Успеха</DialogTitle>
              <DialogDescription>
                Твоят персонален кариерен анализ
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Career Meter */}
          <Card className="bg-background/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Твоят професионален профил
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Предприемач</span>
                  <span className="text-amber-500">{careerMeter.entrepreneur}%</span>
                </div>
                <Progress value={careerMeter.entrepreneur} className="h-3" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Лидер / Мениджър</span>
                  <span className="text-primary">{careerMeter.leader}%</span>
                </div>
                <Progress value={careerMeter.leader} className="h-3" />
              </div>

              <p className="text-sm text-muted-foreground pt-2">
                Твоята натална карта показва силен предприемачески дух. Имаш 
                потенциала да изградиш нещо собствено, но и уменията да водиш екипи.
              </p>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Твоите силни страни
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strengths.map((strength, index) => (
                    <li 
                      key={strength}
                      className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Prosperity Areas */}
            <Card className="bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Сфери на просперитет
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {prosperityAreas.map((area, index) => (
                    <li 
                      key={area.name}
                      className="flex items-center gap-3 text-sm animate-in fade-in slide-in-from-right-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-xl">{area.icon}</span>
                      {area.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Financial Advice */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <h3 className="font-semibold text-lg">Златен съвет за теб</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                С твоята комбинация от планетарни влияния, най-благоприятните години 
                за стартиране на собствен бизнес са когато Юпитер транзитира твоя 10-ти 
                дом. Инвестирай в образование и нетуъркинг — те ще ти донесат най-голяма 
                възвращаемост. Избягвай импулсивни финансови решения през ретроградните 
                периоди на Меркурий.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CareerCodeDialog;

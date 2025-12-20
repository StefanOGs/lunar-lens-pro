import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoveRadarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data for the love timeline
const monthsData = [
  { month: "Януари", status: "neutral", label: "Неутрален период" },
  { month: "Февруари", status: "passion", label: "Страст и Емоции" },
  { month: "Март", status: "passion", label: "Страст и Емоции" },
  { month: "Април", status: "reflection", label: "Време за размисъл" },
  { month: "Май", status: "neutral", label: "Неутрален период" },
  { month: "Юни", status: "passion", label: "Страст и Емоции" },
  { month: "Юли", status: "passion", label: "Страст и Емоции" },
  { month: "Август", status: "reflection", label: "Време за размисъл" },
  { month: "Септември", status: "neutral", label: "Неутрален период" },
  { month: "Октомври", status: "passion", label: "Страст и Емоции" },
  { month: "Ноември", status: "reflection", label: "Време за размисъл" },
  { month: "Декември", status: "passion", label: "Страст и Емоции" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "passion":
      return "bg-emerald-500/80 border-emerald-400";
    case "reflection":
      return "bg-orange-500/80 border-orange-400";
    default:
      return "bg-gray-500/60 border-gray-400";
  }
};

const getStatusTextColor = (status: string) => {
  switch (status) {
    case "passion":
      return "text-emerald-400";
    case "reflection":
      return "text-orange-400";
    default:
      return "text-gray-400";
  }
};

const LoveRadarDialog = ({ open, onOpenChange }: LoveRadarDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-rose-500/30 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Любовен Радар</DialogTitle>
              <DialogDescription>
                Твоят емоционален календар за следващите 12 месеца
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center p-4 bg-background/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/80" />
              <span className="text-sm text-muted-foreground">Страст и Емоции</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500/80" />
              <span className="text-sm text-muted-foreground">Време за размисъл</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500/60" />
              <span className="text-sm text-muted-foreground">Неутрален период</span>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {monthsData.map((item, index) => (
              <div 
                key={item.month}
                className="group relative animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`p-3 rounded-lg border ${getStatusColor(item.status)} text-center transition-transform hover:scale-105`}>
                  <p className="text-xs font-medium text-foreground/90">{item.month}</p>
                </div>
                {/* Tooltip on hover */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className={`text-xs whitespace-nowrap ${getStatusTextColor(item.status)}`}>
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Advice Section */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Съвет на звездите за теб</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Тази година Венера ти благоприятства особено през пролетта и есента. 
                Февруари и Март са идеални за нови запознанства, докато лятото носи възможност 
                за задълбочаване на съществуващи връзки. Използвай периодите на "размисъл", 
                за да преосмислиш какво наистина търсиш в любовта. Доверявай се на интуицията 
                си през октомври — звездите подсказват съдбовна среща.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoveRadarDialog;

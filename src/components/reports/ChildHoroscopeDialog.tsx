import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Baby, Sparkles, Star, Heart, Lightbulb } from "lucide-react";

interface ChildHoroscopeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChildProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

// Mock result data
const getMockResult = (name: string) => ({
  superpower: "Творческо въображение",
  superpowerDesc: `${name} има невероятна способност да вижда света по уникален начин и да създава нови идеи.`,
  emotionalWorld: "Луна в Рак",
  emotionalDesc: `${name} е дълбоко емоционално дете, което се нуждае от сигурност и топлина. Семейството е от изключително значение.`,
  talents: [
    { name: "Артистични способности", icon: "🎨" },
    { name: "Емоционална интелигентност", icon: "💖" },
    { name: "Интуитивно мислене", icon: "✨" },
    { name: "Комуникативност", icon: "💬" },
  ],
});

const ChildHoroscopeDialog = ({ open, onOpenChange }: ChildHoroscopeDialogProps) => {
  const [formData, setFormData] = useState<ChildProfile>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof getMockResult> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.birthDate) {
      setResult(getMockResult(formData.name));
      setShowResult(true);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setShowResult(false);
      setFormData({ name: "", birthDate: "", birthTime: "", birthPlace: "" });
      setResult(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 flex items-center justify-center">
              <Baby className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Звездно Дете</DialogTitle>
              <DialogDescription>
                {showResult ? `Астрологичен профил на ${formData.name}` : "Създай астрологичен профил на детето"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!showResult ? (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="childName">Име на детето</Label>
              <Input
                id="childName"
                placeholder="Въведи името..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background/50 border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Дата на раждане</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="bg-background/50 border-border/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthTime">Час на раждане (по избор)</Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthPlace">Място на раждане (по избор)</Label>
              <Input
                id="birthPlace"
                placeholder="Напр. София, България"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                className="bg-background/50 border-border/50"
              />
            </div>

            <Button type="submit" className="w-full mt-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Създай профил
            </Button>
          </form>
        ) : (
          /* Result View */
          <div className="space-y-5 mt-4">
            {/* Superpower Card */}
            <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 border-violet-500/30 overflow-hidden relative">
              <div className="absolute top-2 right-2">
                <Star className="w-8 h-8 text-yellow-400/50" />
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                  <h3 className="font-bold text-lg">Суперсила</h3>
                </div>
                <p className="text-xl font-semibold text-primary">{result?.superpower}</p>
                <p className="text-sm text-muted-foreground">{result?.superpowerDesc}</p>
              </CardContent>
            </Card>

            {/* Emotional World Card */}
            <Card className="bg-gradient-to-br from-pink-500/15 to-rose-500/5 border-pink-500/30">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400" />
                  <h3 className="font-bold text-lg">Емоционален свят</h3>
                </div>
                <p className="text-lg font-medium text-pink-400">{result?.emotionalWorld}</p>
                <p className="text-sm text-muted-foreground">{result?.emotionalDesc}</p>
              </CardContent>
            </Card>

            {/* Talents Card */}
            <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-accent" />
                  <h3 className="font-bold text-lg">Таланти</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {result?.talents.map((talent, index) => (
                    <div 
                      key={talent.name}
                      className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/50 animate-in fade-in slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-xl">{talent.icon}</span>
                      <span className="text-sm">{talent.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Create Another Button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setShowResult(false);
                setFormData({ name: "", birthDate: "", birthTime: "", birthPlace: "" });
                setResult(null);
              }}
            >
              Създай нов профил
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChildHoroscopeDialog;

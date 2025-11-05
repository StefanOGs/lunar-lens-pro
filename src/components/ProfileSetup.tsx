import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const zodiacSigns = [
  { value: "Овен", label: "Овен (21 март - 19 април)" },
  { value: "Телец", label: "Телец (20 април - 20 май)" },
  { value: "Близнаци", label: "Близнаци (21 май - 20 юни)" },
  { value: "Рак", label: "Рак (21 юни - 22 юли)" },
  { value: "Лъв", label: "Лъв (23 юли - 22 август)" },
  { value: "Дева", label: "Дева (23 август - 22 септември)" },
  { value: "Везни", label: "Везни (23 септември - 22 октомври)" },
  { value: "Скорпион", label: "Скорпион (23 октомври - 21 ноември)" },
  { value: "Стрелец", label: "Стрелец (22 ноември - 21 декември)" },
  { value: "Козирог", label: "Козирог (22 декември - 19 януари)" },
  { value: "Водолей", label: "Водолей (20 януари - 18 февруари)" },
  { value: "Риби", label: "Риби (19 февруари - 20 март)" },
];

interface ProfileSetupProps {
  userId: string;
  onProfileCreated: () => void;
}

const ProfileSetup = ({ userId, onProfileCreated }: ProfileSetupProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    zodiacSign: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('profiles').insert({
        user_id: userId,
        full_name: formData.fullName,
        birth_date: formData.birthDate,
        birth_time: formData.birthTime || null,
        birth_place: formData.birthPlace || null,
        zodiac_sign: formData.zodiacSign,
      });

      if (error) throw error;

      toast({
        title: "Успех!",
        description: "Вашият профил е създаден успешно.",
      });
      
      onProfileCreated();
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Пълно име</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate">Дата на раждане *</Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthTime">Час на раждане (незадължително)</Label>
        <Input
          id="birthTime"
          type="time"
          value={formData.birthTime}
          onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthPlace">Място на раждане (незадължително)</Label>
        <Input
          id="birthPlace"
          placeholder="София, България"
          value={formData.birthPlace}
          onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="zodiacSign">Зодия *</Label>
        <Select value={formData.zodiacSign} onValueChange={(value) => setFormData({ ...formData, zodiacSign: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Изберете вашата зодия" />
          </SelectTrigger>
          <SelectContent>
            {zodiacSigns.map((sign) => (
              <SelectItem key={sign.value} value={sign.value}>
                {sign.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Създаване..." : "Създай Профил"}
      </Button>
    </form>
  );
};

export default ProfileSetup;

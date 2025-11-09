import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";

const zodiacSigns = [
  { value: "Овен", label: "Овен (21 март - 19 април)", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { value: "Телец", label: "Телец (20 април - 20 май)", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { value: "Близнаци", label: "Близнаци (21 май - 20 юни)", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { value: "Рак", label: "Рак (21 юни - 22 юли)", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { value: "Лъв", label: "Лъв (23 юли - 22 август)", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { value: "Дева", label: "Дева (23 август - 22 септември)", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { value: "Везни", label: "Везни (23 септември - 22 октомври)", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { value: "Скорпион", label: "Скорпион (23 октомври - 21 ноември)", startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { value: "Стрелец", label: "Стрелец (22 ноември - 21 декември)", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { value: "Козирог", label: "Козирог (22 декември - 19 януари)", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { value: "Водолей", label: "Водолей (20 януари - 18 февруари)", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { value: "Риби", label: "Риби (19 февруари - 20 март)", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

const calculateZodiacSign = (dateString: string): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  for (const sign of zodiacSigns) {
    if (sign.startMonth === sign.endMonth) {
      if (month === sign.startMonth && day >= sign.startDay && day <= sign.endDay) {
        return sign.value;
      }
    } else {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay)
      ) {
        return sign.value;
      }
    }
  }
  
  return "";
};

interface ProfileSetupProps {
  userId: string;
  onProfileCreated: () => void;
  existingProfile?: any;
  isEditing?: boolean;
}

const ProfileSetup = ({ userId, onProfileCreated, existingProfile, isEditing = false }: ProfileSetupProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: existingProfile?.full_name || "",
    birthDate: existingProfile?.birth_date || "",
    birthTime: existingProfile?.birth_time || "",
    birthPlace: existingProfile?.birth_place || "",
    zodiacSign: existingProfile?.zodiac_sign || "",
  });

  useEffect(() => {
    if (formData.birthDate) {
      const calculatedSign = calculateZodiacSign(formData.birthDate);
      if (calculatedSign && calculatedSign !== formData.zodiacSign) {
        setFormData(prev => ({ ...prev, zodiacSign: calculatedSign }));
      }
    }
  }, [formData.birthDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            birth_date: formData.birthDate,
            birth_time: formData.birthTime || null,
            birth_place: formData.birthPlace || null,
            zodiac_sign: formData.zodiacSign,
          })
          .eq('user_id', userId);

        if (error) throw error;

        toast({
          title: "Успех!",
          description: "Вашият профил е актуализиран успешно.",
        });
      } else {
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
      }
      
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
        <Label htmlFor="birthDate" className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span>Дата на раждане (ДД/ММ/ГГГГ) *</span>
        </Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          required
          placeholder="дд.мм.гггг"
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthTime" className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>Час на раждане (незадължително)</span>
        </Label>
        <Input
          id="birthTime"
          type="time"
          value={formData.birthTime}
          onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
          className="text-base"
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
        <Label htmlFor="zodiacSign">Зодия (автоматично)</Label>
        <Input
          id="zodiacSign"
          value={formData.zodiacSign ? zodiacSigns.find(s => s.value === formData.zodiacSign)?.label : ""}
          disabled
          className="bg-muted"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (isEditing ? "Запазване..." : "Създаване...") : (isEditing ? "Запази Промените" : "Създай Профил")}
      </Button>
    </form>
  );
};

export default ProfileSetup;

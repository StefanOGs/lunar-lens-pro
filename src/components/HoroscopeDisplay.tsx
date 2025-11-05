import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, Calendar, TrendingUp } from "lucide-react";

interface HoroscopeDisplayProps {
  profile: any;
}

const HoroscopeDisplay = ({ profile }: HoroscopeDisplayProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dailyHoroscope, setDailyHoroscope] = useState("");
  const [weeklyHoroscope, setWeeklyHoroscope] = useState("");
  const [monthlyHoroscope, setMonthlyHoroscope] = useState("");
  const [activeTab, setActiveTab] = useState("daily");

  const generateHoroscope = async (type: 'daily' | 'weekly' | 'monthly') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-horoscope', {
        body: {
          type,
          zodiacSign: profile.zodiac_sign
        }
      });

      if (error) throw error;

      if (type === 'daily') setDailyHoroscope(data.horoscope);
      else if (type === 'weekly') setWeeklyHoroscope(data.horoscope);
      else if (type === 'monthly') setMonthlyHoroscope(data.horoscope);

      if (data.cached) {
        toast({
          title: "Хороскоп зареден",
          description: "Показва се вашият запазен хороскоп.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно генериране на хороскоп",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'daily' && !dailyHoroscope) generateHoroscope('daily');
    else if (value === 'weekly' && !weeklyHoroscope) generateHoroscope('weekly');
    else if (value === 'monthly' && !monthlyHoroscope) generateHoroscope('monthly');
  };

  // Load daily horoscope on mount
  useEffect(() => {
    generateHoroscope('daily');
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
            <Star className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl">Здравейте, {profile.full_name}!</CardTitle>
          <CardDescription className="text-lg">
            Зодия: <span className="font-semibold text-foreground">{profile.zodiac_sign}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Вашите Персонализирани Хороскопи</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">
                <Calendar className="w-4 h-4 mr-2" />
                Дневен
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <TrendingUp className="w-4 h-4 mr-2" />
                Седмичен
              </TabsTrigger>
              <TabsTrigger value="monthly">
                <Star className="w-4 h-4 mr-2" />
                Месечен
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Дневен хороскоп за {profile.zodiac_sign}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateHoroscope('daily')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Обнови"}
                  </Button>
                </div>
                {loading && !dailyHoroscope ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {dailyHoroscope || "Натиснете Обнови, за да генерирате хороскоп"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Седмичен хороскоп за {profile.zodiac_sign}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateHoroscope('weekly')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Обнови"}
                  </Button>
                </div>
                {loading && !weeklyHoroscope ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {weeklyHoroscope || "Зареждане..."}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Месечен хороскоп за {profile.zodiac_sign}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateHoroscope('monthly')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Обнови"}
                  </Button>
                </div>
                {loading && !monthlyHoroscope ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {monthlyHoroscope || "Зареждане..."}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HoroscopeDisplay;

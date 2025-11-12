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
  const [yearlyHoroscope, setYearlyHoroscope] = useState("");
  const [activeTab, setActiveTab] = useState("daily");

  const generateHoroscope = async (type: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
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
      else if (type === 'yearly') setYearlyHoroscope(data.horoscope);

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
    else if (value === 'yearly' && !yearlyHoroscope) generateHoroscope('yearly');
  };

  // Load daily horoscope on mount and when zodiac sign changes
  useEffect(() => {
    if (profile.zodiac_sign) {
      generateHoroscope('daily');
    }
  }, [profile.zodiac_sign]);

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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-2">
              <TabsTrigger value="daily" className="text-sm sm:text-base py-3">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Дневен</span>
                <span className="sm:hidden">Ден</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-sm sm:text-base py-3">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Седмичен</span>
                <span className="sm:hidden">Седм</span>
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-sm sm:text-base py-3">
                <Star className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Месечен</span>
                <span className="sm:hidden">Мес</span>
              </TabsTrigger>
              <TabsTrigger value="yearly" className="text-sm sm:text-base py-3">
                <Star className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Годишен</span>
                <span className="sm:hidden">Год</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold">Дневен хороскоп за {profile.zodiac_sign}</h3>
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold">Седмичен хороскоп за {profile.zodiac_sign}</h3>
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold">Месечен хороскоп за {profile.zodiac_sign}</h3>
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

            <TabsContent value="yearly" className="mt-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold">Годишен хороскоп за {profile.zodiac_sign}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateHoroscope('yearly')}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Обнови"}
                  </Button>
                </div>
                {loading && !yearlyHoroscope ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {yearlyHoroscope || "Зареждане..."}
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

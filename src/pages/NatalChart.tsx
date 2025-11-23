import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import NatalChartModal from "@/components/NatalChartModal";
import { useToast } from "@/hooks/use-toast";
import { generateNatalChartWithAnalysis } from "@/lib/natalChartService";

const NatalChart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });
  const [locationData, setLocationData] = useState<{
    city: string;
    country: string;
    lat: number;
    lon: number;
  } | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }
    
    setUser(session.user);
    await loadUserProfile(session.user.id);
    setLoading(false);
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        // Convert ISO date (YYYY-MM-DD) to European format (DD/MM/YYYY)
        const dateObj = new Date(profile.birth_date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const europeanDate = `${day}/${month}/${year}`;

        setFormData({
          birthDate: europeanDate,
          birthTime: profile.birth_time || "",
          birthPlace: profile.birth_place || "",
        });

        // Use saved coordinates from profile
        if (profile.birth_lat && profile.birth_lon && profile.birth_place) {
          setLocationData({
            city: profile.birth_place,
            country: "",
            lat: profile.birth_lat,
            lon: profile.birth_lon
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Грешка",
        description: "Не успяхме да заредим вашия профил",
        variant: "destructive"
      });
    }
  };

  const generateNatalChart = async () => {
    if (!locationData) {
      toast({
        title: "Моля изберете локация",
        description: "Изберете населено място от предложените опции за точни координати",
        variant: "destructive"
      });
      return;
    }

    // Validate and convert European date format (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
    const dateParts = formData.birthDate.split('/');
    if (dateParts.length !== 3) {
      toast({
        title: "Невалидна дата",
        description: "Моля въведете дата в формат ДД/ММ/ГГГГ",
        variant: "destructive"
      });
      return;
    }
    const [day, month, year] = dateParts;
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    setGenerating(true);
    
    try {
      // Use local Swiss Ephemeris calculation
      const data = await generateNatalChartWithAnalysis(
        isoDate,
        formData.birthTime,
        locationData
      );

      setChartData(data);
      setModalOpen(true);
      
      toast({
        title: "Готово!",
        description: "Вашата натална карта е генерирана успешно.",
      });
    } catch (error: any) {
      console.error('Error generating natal chart:', error);
      toast({
        title: "Грешка",
        description: error.message || "Възникна проблем при генерирането на картата",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleLocationSelect = (location: { city: string; country: string; lat: number; lon: number; displayName: string }) => {
    setLocationData({
      city: location.city,
      country: location.country,
      lat: location.lat,
      lon: location.lon
    });
    setFormData(prev => ({ ...prev, birthPlace: location.displayName }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Натална карта</CardTitle>
              <CardDescription>
                Въведете вашите данни за раждане, за да генерирате вашата натална карта
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); generateNatalChart(); }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Дата на раждане (ДД/ММ/ГГГГ)
                  </Label>
                  <Input
                    id="birthDate"
                    type="text"
                    placeholder="31/12/1990"
                    value={formData.birthDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d/]/g, '');
                      if (value.length >= 2 && value[2] !== '/') {
                        value = value.slice(0, 2) + '/' + value.slice(2);
                      }
                      if (value.length >= 5 && value[5] !== '/') {
                        value = value.slice(0, 5) + '/' + value.slice(5);
                      }
                      if (value.length > 10) value = value.slice(0, 10);
                      setFormData(prev => ({ ...prev, birthDate: value }));
                    }}
                    readOnly
                    className="cursor-not-allowed opacity-70"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthTime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Час на раждане
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                    readOnly
                    className="cursor-not-allowed opacity-70"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Място на раждане</Label>
                  <LocationAutocomplete
                    value={formData.birthPlace}
                    onChange={(value) => setFormData(prev => ({ ...prev, birthPlace: value }))}
                    onLocationSelect={handleLocationSelect}
                    placeholder="Въведете град на раждане"
                    label=""
                  />
                  {!locationData && (
                    <p className="text-xs text-destructive">
                      Моля, изберете точно място от списъка за прецизно изчисление
                    </p>
                  )}
                  {locationData && (
                    <p className="text-xs text-muted-foreground">
                      ✓ Координати: {locationData.lat.toFixed(4)}°, {locationData.lon.toFixed(4)}°
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={generating}>
                  {generating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Генериране...
                    </>
                  ) : (
                    "Генерирай карта"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <NatalChartModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
        data={chartData}
      />
    </Layout>
  );
};

export default NatalChart;

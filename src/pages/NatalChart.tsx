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

const NatalChart = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
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
    setLoading(false);
  };

  const generateNatalChart = () => {
    console.log("Generating natal chart with data:", {
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      birthPlace: formData.birthPlace,
      location: locationData
    });
    // API logic will be added later
  };

  const handleLocationSelect = (location: { city: string; country: string; lat: number; lon: number; displayName: string }) => {
    setLocationData({
      city: location.city,
      country: location.country,
      lat: location.lat,
      lon: location.lon
    });
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
                    Дата на раждане
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
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
                    required
                  />
                </div>

                <LocationAutocomplete
                  value={formData.birthPlace}
                  onChange={(value) => setFormData(prev => ({ ...prev, birthPlace: value }))}
                  onLocationSelect={handleLocationSelect}
                  label="Място на раждане"
                  placeholder="Въведете град или населено място"
                />

                <Button type="submit" className="w-full">
                  Генерирай карта
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default NatalChart;

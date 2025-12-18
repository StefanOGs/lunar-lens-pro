import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Moon, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import cosmicBg from "@/assets/cosmic-bg.jpg";

const PersonalForecast = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [forecast, setForecast] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
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
    await loadProfile(session.user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Грешка",
        description: "Не успяхме да заредим профила ви",
        variant: "destructive"
      });
    } else {
      setProfile(data);
    }
  };

  const generateForecast = async () => {
    if (!profile) {
      toast({
        title: "Грешка",
        description: "Моля, първо попълнете профила си",
        variant: "destructive"
      });
      navigate("/edit-profile");
      return;
    }

    setGenerating(true);
    try {
      // Extract first name from full_name
      const firstName = profile.full_name?.split(' ')[0] || 'Приятел';

      const { data, error } = await supabase.functions.invoke('generate-personal-forecast', {
        body: {
          firstName,
          birthDate: profile.birth_date,
          birthTime: profile.birth_time,
          birthPlace: profile.birth_place,
          zodiacSign: profile.zodiac_sign
        }
      });

      if (error) {
        throw error;
      }

      setForecast(data.forecast);
      toast({
        title: "Прогнозата е готова!",
        description: `Персонална прогноза за ${firstName}`,
      });

    } catch (error: any) {
      console.error('Error generating forecast:', error);
      toast({
        title: "Грешка",
        description: error.message || "Не успяхме да генерираме прогнозата",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const formatForecast = (text: string) => {
    // Split by sections and format
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Bold headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-primary mt-6 mb-2">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      // Emoji bullet points
      if (line.startsWith('✨') || line.startsWith('⚠️')) {
        return (
          <p key={index} className="font-medium mt-4 mb-2">
            {line}
          </p>
        );
      }
      // List items
      if (line.startsWith('- ')) {
        return (
          <p key={index} className="text-muted-foreground ml-4 my-1">
            {line}
          </p>
        );
      }
      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={index} className="text-foreground/90 my-3 leading-relaxed">
            {line}
          </p>
        );
      }
      return null;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Moon className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('bg-BG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Layout user={user}>
      {/* Full page cosmic background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${cosmicBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Персонализирана прогноза</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Вашата прогноза за днес
            </h1>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">{currentDate}</span>
            </div>
          </div>

          {/* Main Card */}
          <Card className="bg-card/60 backdrop-blur-md border-border/50 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Персонална прогноза за {profile?.full_name?.split(' ')[0] || 'вас'}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="relative space-y-4">
              {!forecast ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Натиснете бутона, за да получите персонализирана астрологична прогноза, 
                    създадена специално за вас на база вашите рождени данни.
                  </p>
                  <Button 
                    size="lg"
                    onClick={generateForecast}
                    disabled={generating}
                    className="gap-2"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Проверка...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Провери прогноза
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="prose prose-invert max-w-none">
                    {formatForecast(forecast)}
                  </div>
                  
                  <div className="pt-6 flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={generateForecast}
                      disabled={generating}
                      className="gap-2"
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Проверка...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Провери нова прогноза
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-card/40 backdrop-blur-sm border-border/30">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground text-center">
                💡 Прогнозата се генерира на база вашата дата на раждане{profile?.birth_time ? ', час' : ''}{profile?.birth_place ? ' и място' : ''} — колкото повече данни имате в профила си, толкова по-точна ще бъде.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PersonalForecast;

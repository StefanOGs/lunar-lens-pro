import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Heart, Moon, Sun, MapPin, Calendar, Clock, Wand2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import cosmicBg from "@/assets/cosmic-bg.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } else {
      setProfile(data);
    }
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

  if (!profile) {
    navigate("/edit-profile");
    return null;
  }

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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Hero Section */}
          <div className="text-center space-y-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Зодия: {profile.zodiac_sign}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Здравейте, {profile.full_name || 'Приятел'}!
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Добре дошли в Eclyptica — вашето място за персонализирани астрологични анализи и прозрения от звездите.
            </p>
          </div>

          {/* Profile Info Card */}
          <Card className="bg-card/60 backdrop-blur-md border-border/50 shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Вашият астрологичен профил
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sun className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Име</p>
                    <p className="font-medium">{profile.full_name || 'Не е посочено'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Star className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Зодия</p>
                    <p className="font-medium">{profile.zodiac_sign}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Calendar className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Дата на раждане</p>
                    <p className="font-medium">
                      {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('bg-BG') : 'Не е посочена'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Час на раждане</p>
                    <p className="font-medium">{profile.birth_time || 'Не е посочен'}</p>
                  </div>
                </div>
                {profile.birth_place && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <MapPin className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Място на раждане</p>
                      <p className="font-medium">{profile.birth_place}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/personal-forecast" className="group">
              <Card className="bg-card/60 backdrop-blur-md border-border/50 hover:border-accent/50 hover:shadow-glow transition-all duration-300 h-full group-hover:scale-[1.02]">
                <CardHeader className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Wand2 className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-sm">Прогноза</CardTitle>
                  <CardDescription className="text-xs">Персонална</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/horoscopes" className="group">
              <Card className="bg-card/60 backdrop-blur-md border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300 h-full group-hover:scale-[1.02]">
                <CardHeader className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-sm">Хороскопи</CardTitle>
                  <CardDescription className="text-xs">Ежедневни</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/zodiac" className="group">
              <Card className="bg-card/60 backdrop-blur-md border-border/50 hover:border-secondary/50 hover:shadow-glow transition-all duration-300 h-full group-hover:scale-[1.02]">
                <CardHeader className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Sun className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle className="text-sm">Зодии</CardTitle>
                  <CardDescription className="text-xs">12 знака</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/services" className="group">
              <Card className="bg-card/60 backdrop-blur-md border-border/50 hover:border-accent/50 hover:shadow-glow transition-all duration-300 h-full group-hover:scale-[1.02]">
                <CardHeader className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-sm">Услуги</CardTitle>
                  <CardDescription className="text-xs">Анализи</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/compatibility" className="group">
              <Card className="bg-card/60 backdrop-blur-md border-border/50 hover:border-destructive/50 hover:shadow-glow transition-all duration-300 h-full group-hover:scale-[1.02]">
                <CardHeader className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-destructive/20 to-accent/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-destructive" />
                  </div>
                  <CardTitle className="text-sm">Съвместимост</CardTitle>
                  <CardDescription className="text-xs">Любов</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/lunar-calendar" className="group">
              <Card className="bg-card/60 backdrop-blur-md border-border/50 hover:border-muted-foreground/50 hover:shadow-glow transition-all duration-300 h-full group-hover:scale-[1.02]">
                <CardHeader className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted/40 to-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Moon className="w-6 h-6 text-foreground" />
                  </div>
                  <CardTitle className="text-sm">Лунен календар</CardTitle>
                  <CardDescription className="text-xs">Фази</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
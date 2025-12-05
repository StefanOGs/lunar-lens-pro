import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Heart, Moon, Sun } from "lucide-react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="w-20 h-20 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Здравейте, {profile.full_name || 'Приятел'}!
            </h1>
            <p className="text-xl text-muted-foreground">
              Зодия: {profile.zodiac_sign}
            </p>
          </div>

          {/* Profile Info Card */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Вашият астрологичен профил</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Име</p>
                  <p className="font-medium">{profile.full_name || 'Не е посочено'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Зодия</p>
                  <p className="font-medium">{profile.zodiac_sign}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Дата на раждане</p>
                  <p className="font-medium">
                    {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('bg-BG') : 'Не е посочена'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Час на раждане</p>
                  <p className="font-medium">{profile.birth_time || 'Не е посочен'}</p>
                </div>
                {profile.birth_place && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Място на раждане</p>
                    <p className="font-medium">{profile.birth_place}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link to="/horoscopes">
              <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Хороскопи
                  </CardTitle>
                  <CardDescription className="text-xs">Вижте вашите хороскопи</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/zodiac">
              <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sun className="w-5 h-5 text-primary" />
                    Зодии
                  </CardTitle>
                  <CardDescription className="text-xs">Научете за зодиите</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/services">
              <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="w-5 h-5 text-primary" />
                    Услуги
                  </CardTitle>
                  <CardDescription className="text-xs">Разгледайте услугите</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/compatibility">
              <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Heart className="w-5 h-5 text-primary" />
                    Съвместимост
                  </CardTitle>
                  <CardDescription className="text-xs">Проверете съвместимостта</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/lunar-calendar">
              <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Moon className="w-5 h-5 text-primary" />
                    Лунен календар
                  </CardTitle>
                  <CardDescription className="text-xs">Следете лунните фази</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Welcome Message */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                Добре дошли в Eclyptica! Вашето място за персонализирани астрологични анализи и хороскопи. 
                Разгледайте нашите услуги и открийте повече за себе си чрез силата на звездите.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

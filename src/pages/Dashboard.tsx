import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, LogOut, User as UserIcon, Settings, Menu, Home, Star, Heart, Moon, Crown } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProfileSetup from "@/components/ProfileSetup";
import HoroscopeDisplay from "@/components/HoroscopeDisplay";
import logo from "@/assets/logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleProfileCreated = async () => {
    if (user) {
      await loadProfile(user.id);
      setIsEditingProfile(false);
      toast({
        title: isEditingProfile ? "Профилът е актуализиран!" : "Профилът е създаден!",
        description: isEditingProfile ? "Промените са запазени успешно." : "Вашият персонализиран хороскоп е готов.",
      });
    }
  };

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    setUpgradeDialogOpen(true);
  };

  const handleUpgradeClick = () => {
    setUpgradeDialogOpen(false);
    // Navigate to subscriptions section or page
    document.getElementById('subscriptions')?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="min-h-screen bg-gradient-cosmic">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={logo} alt="Eclyptica Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold">Eclyptica</span>
            </Link>
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Начало
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <Link to="/about">
                За нас
              </Link>
            </Button>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="w-4 h-4" />
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Изход
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-2 text-sm border-b border-border pb-4">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-muted-foreground text-xs break-all">{user?.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Изход
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!profile || isEditingProfile ? (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">
                  {isEditingProfile ? "Редактирайте Вашия Профил" : "Създайте Вашия Астрологичен Профил"}
                </CardTitle>
                <CardDescription>
                  {isEditingProfile 
                    ? "Променете вашите данни за раждане" 
                    : "Въведете вашите данни за раждане, за да получите персонализирани хороскопи"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSetup 
                  userId={user?.id || ''} 
                  onProfileCreated={handleProfileCreated}
                  existingProfile={profile}
                  isEditing={isEditingProfile}
                />
                {isEditingProfile && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4" 
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Отказ
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Персонализирани хороскопи
                  </CardTitle>
                  <CardDescription>Вашите дневни, седмични и месечни хороскопи</CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleServiceClick("Натална карта")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Натална карта
                  </CardTitle>
                  <CardDescription>Пълен астрологичен анализ на вашето раждане</CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleServiceClick("Съвместимост")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Съвместимост
                  </CardTitle>
                  <CardDescription>Анализ на астрологичната съвместимост</CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleServiceClick("Лунен календар")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-primary" />
                    Лунен календар
                  </CardTitle>
                  <CardDescription>Следете лунните фази и влиянието им</CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
                id="subscriptions"
                onClick={() => handleServiceClick("Абонаменти")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    Абонаменти
                  </CardTitle>
                  <CardDescription>Разгледайте нашите планове и услуги</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditingProfile(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Редактирай Профил
              </Button>
            </div>
            <HoroscopeDisplay profile={profile} />
          </div>
        )}
      </main>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Премиум услуга</DialogTitle>
            <DialogDescription>
              Тази услуга е достъпна само за потребители с по-висок абонаментен план. Желаете ли да надградите своя план?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Отказ
            </Button>
            <Button onClick={handleUpgradeClick}>
              Да, покажи планове
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

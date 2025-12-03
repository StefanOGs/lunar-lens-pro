import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart, Moon, Sparkles, TrendingUp } from "lucide-react";
import Layout from "@/components/Layout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Services = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");

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

  const handleServiceClick = (serviceName: string) => {
    if (serviceName === "Натална карта") {
      navigate("/natal-chart");
    } else if (serviceName === "Съвместимост") {
      navigate("/compatibility");
    } else {
      setSelectedService(serviceName);
      setUpgradeDialogOpen(true);
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

  return (
    <Layout user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Нашите услуги</h1>
            <p className="text-xl text-muted-foreground">
              Открийте пълния потенциал на астрологията с нашите специализирани услуги
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Натална карта</CardTitle>
                <CardDescription>
                  Пълен астрологичен анализ на вашето раждане с подробно описание на всички планети и аспекти
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleServiceClick("Натална карта")}
                >
                  Виж повече
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Съвместимост</CardTitle>
                <CardDescription>
                  Анализ на астрологичната съвместимост между вас и вашия партньор за по-хармонични отношения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleServiceClick("Съвместимост")}
                >
                  Виж повече
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center mb-4">
                  <Moon className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Лунен календар</CardTitle>
                <CardDescription>
                  Следете лунните фази и тяхното влияние върху вашия живот и вземайте по-добри решения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleServiceClick("Лунен календар")}
                >
                  Виж повече
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Персонални прогнози</CardTitle>
                <CardDescription>
                  Задълбочени месечни и годишни прогнози, базирани на вашата натална карта
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleServiceClick("Персонални прогнози")}
                >
                  Виж повече
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-mystical flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Транзити и прогреси</CardTitle>
                <CardDescription>
                  Проследете важните астрологични транзити и тяхното влияние върху вашия живот
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleServiceClick("Транзити и прогреси")}
                >
                  Виж повече
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Премиум услуга</DialogTitle>
            <DialogDescription>
              Тази услуга ({selectedService}) е достъпна само за потребители с по-висок абонаментен план. 
              Желаете ли да надградите своя план?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Отказ
            </Button>
            <Button onClick={() => {
              setUpgradeDialogOpen(false);
              // TODO: Navigate to pricing/subscription page
            }}>
              Да, покажи планове
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Services;

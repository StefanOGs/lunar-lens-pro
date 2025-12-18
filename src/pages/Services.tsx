import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart, Moon, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import cosmicBg from "@/assets/cosmic-bg.jpg";

const services = [
  {
    name: "Натална карта",
    description: "Пълен астрологичен анализ на вашето раждане с подробно описание на всички планети и аспекти",
    icon: Star,
    route: "/natal-chart",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
    borderColor: "hover:border-amber-500/50",
  },
  {
    name: "Съвместимост",
    description: "Анализ на астрологичната съвместимост между вас и вашия партньор за по-хармонични отношения",
    icon: Heart,
    route: "/compatibility",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
    borderColor: "hover:border-rose-500/50",
  },
  {
    name: "Лунен календар",
    description: "Следете лунните фази и тяхното влияние върху вашия живот и вземайте по-добри решения",
    icon: Moon,
    route: "/lunar-calendar",
    gradient: "from-slate-400/20 to-zinc-500/20",
    iconColor: "text-slate-300",
    borderColor: "hover:border-slate-400/50",
  },
  {
    name: "Персонални прогнози",
    description: "Задълбочени месечни и годишни прогнози, базирани на вашата натална карта",
    icon: TrendingUp,
    route: "/personal-forecast",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
    borderColor: "hover:border-emerald-500/50",
  },
  {
    name: "Транзити и прогреси",
    description: "Проследете важните астрологични транзити и тяхното влияние върху вашия живот",
    icon: Sparkles,
    route: "/transits-progressions",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
    borderColor: "hover:border-violet-500/50",
  },
];

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

  const handleServiceClick = (service: typeof services[0]) => {
    navigate(service.route);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic">
        <div className="text-center">
          <Moon className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${cosmicBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Астрологични услуги</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Нашите услуги
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Открийте пълния потенциал на астрологията с нашите специализирани услуги
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <Card 
                  key={service.name}
                  className={`group relative overflow-hidden bg-card/60 backdrop-blur-md border-border/50 ${service.borderColor} transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleServiceClick(service)}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Glow Effect */}
                  <div className="absolute -inset-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} border border-border/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground/80 leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between group/btn hover:bg-primary/10"
                    >
                      <span>Виж повече</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center pt-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
              <p className="text-muted-foreground mb-4">
                Искате пълен достъп до всички услуги?
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/plans')}
                className="group"
              >
                <span>Вижте нашите планове</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
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
              navigate('/plans');
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

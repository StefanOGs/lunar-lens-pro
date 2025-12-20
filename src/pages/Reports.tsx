import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Briefcase, Baby, Sparkles, Moon, Crown } from "lucide-react";
import Layout from "@/components/Layout";
import cosmicBg from "@/assets/cosmic-bg.jpg";
import LoveRadarDialog from "@/components/reports/LoveRadarDialog";
import CareerCodeDialog from "@/components/reports/CareerCodeDialog";
import ChildHoroscopeDialog from "@/components/reports/ChildHoroscopeDialog";

const Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loveDialogOpen, setLoveDialogOpen] = useState(false);
  const [careerDialogOpen, setCareerDialogOpen] = useState(false);
  const [childDialogOpen, setChildDialogOpen] = useState(false);

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

  const services = [
    {
      id: "love",
      icon: Heart,
      iconColor: "text-pink-500",
      bgGradient: "from-pink-500/20 to-rose-500/20",
      borderHover: "hover:border-pink-500/50",
      title: "Любовен Радар",
      subtitle: "Твоят емоционален календар за годината",
      description: "Разбери кога звездите са на твоя страна за романтика, кога да действаш и кога да изчакаш. Прогноза за ключовите периоди в любовния ти живот.",
      buttonText: "Виж своя календар",
      onOpen: () => setLoveDialogOpen(true)
    },
    {
      id: "career",
      icon: Briefcase,
      iconColor: "text-amber-500",
      bgGradient: "from-amber-500/20 to-yellow-500/20",
      borderHover: "hover:border-amber-500/50",
      title: "Финансов Код на Успеха",
      subtitle: "Кариера, пари и лична мисия",
      description: "Роден ли си за собствен бизнес или за кариера в корпорация? Открий скритите си таланти за печелене на пари и професионален растеж.",
      buttonText: "Разкодирай успеха си",
      onOpen: () => setCareerDialogOpen(true)
    },
    {
      id: "child",
      icon: Baby,
      iconColor: "text-violet-400",
      bgGradient: "from-violet-500/20 to-purple-500/20",
      borderHover: "hover:border-violet-500/50",
      title: "Звездно Дете",
      subtitle: "Опознай потенциала на малките",
      description: "Уникален наръчник за родители. Разбери талантите, емоционалните нужди и начина на учене на твоето дете още от малко.",
      buttonText: "Създай профил на дете",
      onOpen: () => setChildDialogOpen(true)
    }
  ];

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
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Премиум Анализи</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Специализирани Доклади
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Дълбоки астрологични анализи за любов, кариера и семейство. Разкрий скритите послания на звездите.
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card 
                key={service.id}
                className={`group bg-card/60 backdrop-blur-md border-border/50 ${service.borderHover} shadow-lg hover:shadow-glow transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <CardHeader className="relative space-y-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-primary/80 font-medium">
                      {service.subtitle}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="relative space-y-6">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                  
                  <Button 
                    onClick={service.onOpen}
                    className="w-full group-hover:bg-primary transition-colors"
                    variant="outline"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {service.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <LoveRadarDialog open={loveDialogOpen} onOpenChange={setLoveDialogOpen} />
      <CareerCodeDialog open={careerDialogOpen} onOpenChange={setCareerDialogOpen} />
      <ChildHoroscopeDialog open={childDialogOpen} onOpenChange={setChildDialogOpen} />
    </Layout>
  );
};

export default Reports;

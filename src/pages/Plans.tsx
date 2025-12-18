import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Star, Sparkles, Infinity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription, SubscriptionPlan } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import cosmicBg from "@/assets/cosmic-bg.jpg";

const plans = [
  {
    id: "FREE" as SubscriptionPlan,
    name: "Безплатен",
    price: "0",
    period: null,
    description: "За запознаване с услугата",
    icon: Star,
    features: [
      { name: "Общ дневен хороскоп", included: true },
      { name: "Базова натална карта", included: true },
      { name: "Персонализирани прогнози", included: false },
      { name: "Съвместимост", included: false },
      { name: "Ежедневни email насоки", included: false },
    ],
    popular: false,
  },
  {
    id: "BASIC" as SubscriptionPlan,
    name: "Basic",
    price: "5.99",
    period: "месец",
    description: "Достъп до всички услуги",
    icon: Sparkles,
    features: [
      { name: "Общ дневен хороскоп", included: true },
      { name: "Пълна натална карта", included: true },
      { name: "Персонализирани прогнози", included: true },
      { name: "Съвместимост", included: true },
      { name: "Ежедневни email насоки", included: false },
    ],
    popular: true,
  },
  {
    id: "PREMIUM" as SubscriptionPlan,
    name: "Premium",
    price: "12.99",
    period: "месец",
    description: "Личен астролог",
    icon: Crown,
    features: [
      { name: "Общ дневен хороскоп", included: true },
      { name: "Пълна натална карта", included: true },
      { name: "Персонализирани прогнози", included: true },
      { name: "Съвместимост", included: true },
      { name: "Ежедневни email насоки", included: true },
    ],
    popular: false,
  },
  {
    id: "LIFETIME" as SubscriptionPlan,
    name: "Lifetime",
    price: "79.99",
    period: null,
    oneTime: true,
    description: "Завинаги Premium",
    icon: Infinity,
    features: [
      { name: "Общ дневен хороскоп", included: true },
      { name: "Пълна натална карта", included: true },
      { name: "Персонализирани прогнози", included: true },
      { name: "Съвместимост", included: true },
      { name: "Ежедневни email насоки", included: true },
    ],
    popular: false,
  },
];

const oneTimeProducts = [
  {
    id: "forecast",
    name: "Персонална прогноза",
    price: "1.99",
    description: "Една персонализирана прогноза",
  },
  {
    id: "compatibility",
    name: "Анализ съвместимост",
    price: "2.49",
    description: "Един анализ на съвместимост",
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { subscription, loading: subLoading, getActivePlan } = useSubscription(userId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setUserId(session.user.id);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    // For now, show a message that Stripe is not connected yet
    toast({
      title: "Скоро!",
      description: "Плащанията ще бъдат достъпни скоро. Благодарим за интереса!",
    });
  };

  const handleBuyOneTime = (productId: string) => {
    toast({
      title: "Скоро!",
      description: "Еднократните покупки ще бъдат достъпни скоро.",
    });
  };

  const currentPlan = getActivePlan();

  if (loading || subLoading) {
    return (
      <Layout user={user}>
        <div 
          className="min-h-screen flex items-center justify-center"
          style={{
            backgroundImage: `url(${cosmicBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div 
        className="min-h-screen py-12 px-4"
        style={{
          backgroundImage: `url(${cosmicBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Планове и Абонаменти
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Изберете планът, който отговаря на вашето космическо пътуване
            </p>
            {currentPlan !== 'FREE' && (
              <Badge variant="outline" className="text-lg px-4 py-2 border-primary">
                Текущ план: {plans.find(p => p.id === currentPlan)?.name}
              </Badge>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;
              const isPlanLower = plans.findIndex(p => p.id === plan.id) < plans.findIndex(p => p.id === currentPlan);
              
              return (
                <Card 
                  key={plan.id}
                  className={`flex flex-col relative backdrop-blur-md ${
                    plan.popular 
                      ? 'shadow-glow border-primary scale-105 bg-gradient-to-b from-primary/10 to-card/80' 
                      : isCurrentPlan
                      ? 'border-green-500 bg-card/80'
                      : 'hover:shadow-card bg-card/60'
                  } transition-all duration-300`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 shadow-lg">
                        Най-популярен
                      </Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-4 py-1 shadow-lg">
                        Активен план
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`w-7 h-7 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                    <div className="pt-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">
                        лв{plan.period ? `/${plan.period}` : plan.oneTime ? ' еднократно' : ''}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={`text-sm ${!feature.included ? 'text-muted-foreground' : ''}`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={isCurrentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                      disabled={isCurrentPlan || isPlanLower}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {isCurrentPlan 
                        ? "Активен" 
                        : isPlanLower 
                        ? "Надолу" 
                        : currentPlan === 'FREE' 
                        ? "Избери план" 
                        : "Ъпгрейд"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* One-time Products */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Еднократни услуги</h2>
            <p className="text-center text-muted-foreground mb-8">
              Без абонамент - плати само за това, което ти трябва
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {oneTimeProducts.map((product) => (
                <Card key={product.id} className="bg-card/60 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <span className="text-2xl font-bold">{product.price}</span>
                    <span className="text-muted-foreground ml-1">лв</span>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleBuyOneTime(product.id)}
                    >
                      Купи
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Info text */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground text-sm">
              Всички планове включват 7-дневен пробен период. Можете да откажете по всяко време.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

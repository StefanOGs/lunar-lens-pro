import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Star, Sparkles, Infinity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
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
    ],
    popular: false,
  },
  {
    name: "Basic",
    price: "5.99",
    period: "месец",
    description: "Достъп до всички услуги",
    icon: Sparkles,
    features: [
      { name: "Пълна натална карта", included: true },
      { name: "Персонализирани прогнози", included: true },
      { name: "Съвместимост", included: true },
      { name: "Ежедневни email насоки", included: false },
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "12.99",
    period: "месец",
    description: "Личен астролог",
    icon: Crown,
    features: [
      { name: "Всичко от Basic", included: true },
      { name: "Ежедневни персонални прогнози", included: true },
      { name: "Email насоки", included: true },
      { name: "По-дълбоки интерпретации", included: true },
    ],
    popular: false,
  },
  {
    name: "Lifetime",
    price: "79.99",
    oneTime: true,
    description: "Завинаги Premium",
    icon: Infinity,
    features: [
      { name: "Всичко от Premium", included: true },
      { name: "Без изтичане", included: true },
      { name: "Без бъдещи такси", included: true },
      { name: "Приоритетна поддръжка", included: true },
    ],
    popular: false,
  },
];

export const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Изисква се вход",
        description: "Моля, влезте в профила си, за да изберете план.",
      });
      navigate("/auth");
      return;
    }
    
    navigate("/plans");
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Абонаментни Планове</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Изберете планът, който отговаря на вашето космическо пътуване
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={index}
                className={`flex flex-col relative ${
                  plan.popular 
                    ? 'shadow-glow border-primary sm:scale-105 bg-gradient-to-b from-primary/5 to-card' 
                    : 'hover:shadow-card bg-card/50'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 shadow-lg">
                      Най-популярен
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    plan.popular ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                  <div className="pt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">
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
                
                <CardFooter className="pt-4">
                  <Button 
                    className="w-full" 
                    size="default"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={handlePlanClick}
                  >
                    Започнете Сега
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Всички планове включват 7-дневен пробен период без ангажимент
          </p>
        </div>
      </div>
    </section>
  );
};

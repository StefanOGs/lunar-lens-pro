import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Лунен",
    price: "19",
    period: "месец",
    description: "Идеален за начинаещи",
    features: [
      "Седмични хороскопи",
      "Месечни прогнози",
      "Лунен календар",
      "Email поддръжка"
    ],
    popular: false
  },
  {
    name: "Звезден",
    price: "39",
    period: "месец",
    description: "Най-популярен избор",
    features: [
      "Всичко от Лунен",
      "Персонализирани съвети",
      "Достъп до медитации",
      "Месечни ритуали",
      "AI Астролог (10 въпроса)",
      "Приоритетна поддръжка"
    ],
    popular: true
  },
  {
    name: "Космически",
    price: "69",
    period: "месец",
    description: "Пълна астрологична еволюция",
    features: [
      "Всичко от Звезден",
      "Неограничен AI Астролог",
      "Видео анализи",
      "1-на-1 консултации (месечно)",
      "Ексклузивни прогнози",
      "VIP общност",
      "Ранен достъп до нови функции"
    ],
    popular: false
  }
];

export const SubscriptionPlans = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Абонаментни Планове</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Изберете планът, който отговаря на вашето космическо пътуване
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`flex flex-col relative ${
                plan.popular 
                  ? 'shadow-glow border-primary scale-105 bg-gradient-to-b from-primary/5 to-card' 
                  : 'hover:shadow-card bg-card/50'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-gold text-background px-4 py-1 shadow-lg">
                    Най-популярен
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="pt-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">лв/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`mt-1 rounded-full p-1 ${
                        plan.popular ? 'bg-primary' : 'bg-muted'
                      }`}>
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-6">
                <Button 
                  className="w-full" 
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Започнете Сега
                </Button>
              </CardFooter>
            </Card>
          ))}
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

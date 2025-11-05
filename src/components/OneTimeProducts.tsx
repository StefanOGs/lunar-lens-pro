import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart, Sparkles } from "lucide-react";

const products = [
  {
    icon: Star,
    title: "Натална Карта",
    description: "Пълен анализ на вашата натална карта с интерпретации на планети, домове и аспекти",
    price: "49 лв",
    features: [
      "Персонализирана карта",
      "Детайлна интерпретация",
      "PDF формат",
      "Lifelong достъп"
    ]
  },
  {
    icon: Heart,
    title: "Анализ на Съвместимост",
    description: "Синастрия между двама души - разберете космическата ви връзка",
    price: "69 лв",
    features: [
      "Сравнение на карти",
      "Анализ на аспекти",
      "Съвети за връзката",
      "Detailed insights"
    ]
  },
  {
    icon: Sparkles,
    title: "Соларен Хороскоп",
    description: "Персонализирана прогноза за цялата година напред",
    price: "89 лв",
    features: [
      "Годишна прогноза",
      "Месечни акценти",
      "Транзитен анализ",
      "Препоръки"
    ]
  }
];

export const OneTimeProducts = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Еднократни Продукти</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Дълбоки астрологични анализи, персонализирани специално за вас
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <Card 
                key={index}
                className="flex flex-col hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-to-b from-card to-card/50 border-border/50"
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">{product.title}</CardTitle>
                  <CardDescription className="text-base pt-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-secondary">{product.price}</span>
                  </div>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg">
                    Поръчайте Сега
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

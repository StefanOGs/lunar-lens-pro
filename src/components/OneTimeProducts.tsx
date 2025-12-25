import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const products = [
  {
    icon: Sparkles,
    title: "Персонална Прогноза",
    description: "Една персонализирана астрологична прогноза, насочена директно към вас",
    price: "1.99",
    features: [
      "Персонален текст с вашето име",
      "Практически съвети за деня",
      "Какво да правиш / избягваш",
    ]
  },
  {
    icon: Heart,
    title: "Анализ Съвместимост",
    description: "Един детайлен анализ на съвместимостта между двама души",
    price: "2.49",
    features: [
      "6 аспекта на съвместимост",
      "Емоции, комуникация, страст",
      "Дългосрочен потенциал",
    ]
  },
];

export const OneTimeProducts = () => {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-10 sm:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">Еднократни Услуги</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Без абонамент – плати само за това, което ти трябва
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <Card 
                key={index}
                className="flex flex-col hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-gradient-to-b from-card to-card/50 border-border/50"
              >
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{product.title}</CardTitle>
                  <CardDescription className="text-sm pt-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 p-4 sm:p-6 pt-0">
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl font-bold text-secondary">{product.price}</span>
                    <span className="text-muted-foreground ml-1">лв</span>
                  </div>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 pt-0">
                  <Button className="w-full" size="lg" asChild>
                    <Link to="/auth">Купи</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-muted-foreground text-sm">
            Работи дори за безплатни потребители
          </p>
        </div>
      </div>
    </section>
  );
};

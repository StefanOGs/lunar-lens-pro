import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: Sun,
    title: "Дневен Хороскоп",
    description: "Вашата космическа прогноза за днес",
    action: "Прочетете Сега",
    route: "/horoscopes"
  },
  {
    icon: Calendar,
    title: "Седмична Прогноза",
    description: "Планирайте седмицата си с небесна мъдрост",
    action: "Разгледайте",
    route: "/horoscopes"
  },
  {
    icon: Moon,
    title: "Лунен Календар",
    description: "Следете фазите на Луната и техните влияния",
    action: "Вижте Фазите",
    route: "/lunar-calendar"
  },
  {
    icon: TrendingUp,
    title: "Месечни Транзити",
    description: "Важни астрологични събития този месец",
    action: "Научете Повече",
    route: "/transits-progressions"
  }
];

export const FreeServices = () => {
  const navigate = useNavigate();

  const handleServiceClick = (route: string) => {
    // Navigate to the service - auth will be checked on the target page
    navigate(route);
  };

  return (
    <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto">
        <div className="text-center mb-10 sm:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">Безплатни Услуги</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Започнете вашето астрологично пътуване с нашите безплатни ежедневни прозрения
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50 cursor-pointer"
                onClick={() => handleServiceClick(service.route)}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-mystical flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10 text-sm sm:text-base">
                    {service.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Moon, Sun, Scissors, Heart, Briefcase, Leaf, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import { format, addDays } from "date-fns";
import { bg } from "date-fns/locale";
import cosmicBg from "@/assets/cosmic-bg.jpg";

// Lunar phase calculation based on known new moon reference
const LUNAR_CYCLE = 29.53058867; // days
const KNOWN_NEW_MOON = new Date("2024-01-11T11:57:00Z").getTime(); // Known new moon date

interface MoonPhaseInfo {
  phase: string;
  phaseName: string;
  illumination: number;
  emoji: string;
  daysInCycle: number;
}

interface PhaseRecommendation {
  title: string;
  icon: React.ReactNode;
  good: string[];
  avoid: string[];
}

const getMoonPhase = (date: Date): MoonPhaseInfo => {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const daysSinceNew = diff / (1000 * 60 * 60 * 24);
  const daysInCycle = ((daysSinceNew % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
  
  // Calculate illumination (approximate)
  const illumination = Math.round((1 - Math.cos((daysInCycle / LUNAR_CYCLE) * 2 * Math.PI)) / 2 * 100);
  
  // Determine phase
  let phase: string;
  let phaseName: string;
  let emoji: string;
  
  if (daysInCycle < 1.85) {
    phase = "new";
    phaseName = "Новолуние";
    emoji = "🌑";
  } else if (daysInCycle < 7.38) {
    phase = "waxing-crescent";
    phaseName = "Растяща сърпа";
    emoji = "🌒";
  } else if (daysInCycle < 9.23) {
    phase = "first-quarter";
    phaseName = "Първа четвърт";
    emoji = "🌓";
  } else if (daysInCycle < 14.77) {
    phase = "waxing-gibbous";
    phaseName = "Растяща луна";
    emoji = "🌔";
  } else if (daysInCycle < 16.61) {
    phase = "full";
    phaseName = "Пълнолуние";
    emoji = "🌕";
  } else if (daysInCycle < 22.15) {
    phase = "waning-gibbous";
    phaseName = "Намаляваща луна";
    emoji = "🌖";
  } else if (daysInCycle < 24.00) {
    phase = "last-quarter";
    phaseName = "Последна четвърт";
    emoji = "🌗";
  } else {
    phase = "waning-crescent";
    phaseName = "Намаляваща сърпа";
    emoji = "🌘";
  }
  
  return { phase, phaseName, illumination, emoji, daysInCycle };
};

const getNextPhaseDate = (targetPhase: string, fromDate: Date): Date => {
  const phases = ["new", "first-quarter", "full", "last-quarter"];
  const phaseDays = [0, 7.38, 14.77, 22.15];
  
  const targetIndex = phases.indexOf(targetPhase);
  if (targetIndex === -1) return fromDate;
  
  const currentPhase = getMoonPhase(fromDate);
  let daysUntil = phaseDays[targetIndex] - currentPhase.daysInCycle;
  
  if (daysUntil <= 0) {
    daysUntil += LUNAR_CYCLE;
  }
  
  return addDays(fromDate, Math.round(daysUntil));
};

const getPhaseRecommendations = (phase: string): PhaseRecommendation[] => {
  const recommendations: Record<string, PhaseRecommendation[]> = {
    "new": [
      { title: "Нови начала", icon: <Sun className="w-5 h-5" />, good: ["Започване на нови проекти", "Поставяне на цели", "Медитация и интроспекция"], avoid: ["Вземане на важни решения", "Рискови начинания"] },
      { title: "Здраве", icon: <Heart className="w-5 h-5" />, good: ["Детоксикация", "Пост", "Започване на диета"], avoid: ["Хирургични интервенции", "Интензивни тренировки"] },
      { title: "Красота", icon: <Scissors className="w-5 h-5" />, good: ["Почивка за кожата", "Хидратация"], avoid: ["Подстригване (за бърз растеж)", "Козметични процедури"] },
    ],
    "waxing-crescent": [
      { title: "Растеж", icon: <Leaf className="w-5 h-5" />, good: ["Развитие на идеи", "Изграждане на навици", "Садене на растения"], avoid: ["Отлагане на планове"] },
      { title: "Кариера", icon: <Briefcase className="w-5 h-5" />, good: ["Планиране", "Нови контакти", "Обучения"], avoid: ["Финализиране на договори"] },
      { title: "Красота", icon: <Scissors className="w-5 h-5" />, good: ["Подстригване (за бърз растеж)", "Укрепващи маски"], avoid: ["Епилация"] },
    ],
    "first-quarter": [
      { title: "Действие", icon: <Sun className="w-5 h-5" />, good: ["Преодоляване на препятствия", "Вземане на решения", "Активни действия"], avoid: ["Избягване на конфликти"] },
      { title: "Кариера", icon: <Briefcase className="w-5 h-5" />, good: ["Преговори", "Презентации", "Стартиране на кампании"], avoid: ["Пасивно изчакване"] },
      { title: "Здраве", icon: <Heart className="w-5 h-5" />, good: ["Интензивни тренировки", "Предизвикателства"], avoid: ["Претоварване"] },
    ],
    "waxing-gibbous": [
      { title: "Усъвършенстване", icon: <Sparkles className="w-5 h-5" />, good: ["Довършване на проекти", "Финализиране на детайли", "Корекции"], avoid: ["Започване на нови неща"] },
      { title: "Отношения", icon: <Heart className="w-5 h-5" />, good: ["Задълбочаване на връзки", "Романтични срещи"], avoid: ["Критика към партньора"] },
      { title: "Кариера", icon: <Briefcase className="w-5 h-5" />, good: ["Ревизия на работата", "Подготовка за презентации"], avoid: ["Нови проекти"] },
    ],
    "full": [
      { title: "Кулминация", icon: <Moon className="w-5 h-5" />, good: ["Празнуване на успехи", "Социални събития", "Творчески изяви"], avoid: ["Важни решения (емоциите са силни)", "Конфронтации"] },
      { title: "Здраве", icon: <Heart className="w-5 h-5" />, good: ["Енергизиращи практики", "Лунни бани"], avoid: ["Хирургия", "Кръводаряване"] },
      { title: "Красота", icon: <Scissors className="w-5 h-5" />, good: ["Хидратиращи процедури", "Маски за коса"], avoid: ["Подстригване (ще расте бавно)"] },
    ],
    "waning-gibbous": [
      { title: "Благодарност", icon: <Heart className="w-5 h-5" />, good: ["Споделяне на знания", "Менторство", "Благотворителност"], avoid: ["Задържане на ресурси"] },
      { title: "Кариера", icon: <Briefcase className="w-5 h-5" />, good: ["Завършване на задачи", "Делегиране", "Анализ на резултати"], avoid: ["Нови инвестиции"] },
      { title: "Здраве", icon: <Leaf className="w-5 h-5" />, good: ["Почивка", "Масажи", "Детоксикация"], avoid: ["Нови диети"] },
    ],
    "last-quarter": [
      { title: "Освобождаване", icon: <Sun className="w-5 h-5" />, good: ["Приключване на стари проекти", "Разчистване", "Прошка"], avoid: ["Вкопчване в миналото"] },
      { title: "Дом", icon: <Calendar className="w-5 h-5" />, good: ["Почистване", "Изхвърляне на ненужни вещи", "Ремонти"], avoid: ["Нови покупки за дома"] },
      { title: "Красота", icon: <Scissors className="w-5 h-5" />, good: ["Епилация", "Почистващи процедури"], avoid: ["Подстригване"] },
    ],
    "waning-crescent": [
      { title: "Почивка", icon: <Moon className="w-5 h-5" />, good: ["Медитация", "Съновидения", "Интуитивни практики"], avoid: ["Взимане на важни решения"] },
      { title: "Здраве", icon: <Heart className="w-5 h-5" />, good: ["Сън и възстановяване", "Релаксация"], avoid: ["Интензивни натоварвания"] },
      { title: "Духовност", icon: <Sparkles className="w-5 h-5" />, good: ["Рефлексия", "Журнализиране", "Подготовка за ново начало"], avoid: ["Действия без план"] },
    ],
  };
  
  return recommendations[phase] || recommendations["new"];
};

const LunarCalendar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<MoonPhaseInfo | null>(null);
  const [upcomingPhases, setUpcomingPhases] = useState<{ name: string; date: Date; emoji: string }[]>([]);
  const [weekPhases, setWeekPhases] = useState<{ date: Date; phase: MoonPhaseInfo }[]>([]);

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

  useEffect(() => {
    const today = new Date();
    setCurrentPhase(getMoonPhase(today));
    
    // Calculate upcoming major phases
    const upcoming = [
      { name: "Новолуние", date: getNextPhaseDate("new", today), emoji: "🌑" },
      { name: "Първа четвърт", date: getNextPhaseDate("first-quarter", today), emoji: "🌓" },
      { name: "Пълнолуние", date: getNextPhaseDate("full", today), emoji: "🌕" },
      { name: "Последна четвърт", date: getNextPhaseDate("last-quarter", today), emoji: "🌗" },
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
    setUpcomingPhases(upcoming);
    
    // Calculate week phases
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      week.push({ date, phase: getMoonPhase(date) });
    }
    setWeekPhases(week);
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }
    
    setUser(session.user);
    setLoading(false);
  };

  if (loading || !currentPhase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic">
        <div className="text-center">
          <Moon className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      </div>
    );
  }

  const recommendations = getPhaseRecommendations(currentPhase.phase);

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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Лунен календар</h1>
            <p className="text-xl text-muted-foreground">
              {format(new Date(), "d MMMM yyyy", { locale: bg })}
            </p>
          </div>

          {/* Current Phase */}
          <Card className="bg-card/60 backdrop-blur-md border-border/50">
            <CardHeader className="text-center pb-2">
              <div className="text-8xl mb-4">{currentPhase.emoji}</div>
              <CardTitle className="text-3xl">{currentPhase.phaseName}</CardTitle>
              <CardDescription className="text-lg">
                Осветеност: {currentPhase.illumination}%
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Week View */}
          <Card className="bg-card/60 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Тази седмица
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekPhases.map((day, index) => (
                  <div 
                    key={index} 
                    className={`text-center p-2 rounded-lg ${index === 0 ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted/50'}`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {format(day.date, "EEE", { locale: bg })}
                    </div>
                    <div className="text-2xl mb-1">{day.phase.emoji}</div>
                    <div className="text-xs font-medium">
                      {format(day.date, "d", { locale: bg })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Phases */}
          <Card className="bg-card/60 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Предстоящи фази
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {upcomingPhases.map((phase, index) => (
                  <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl mb-2">{phase.emoji}</div>
                    <div className="font-medium text-sm">{phase.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(phase.date, "d MMM", { locale: bg })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">
              Препоръки за {currentPhase.phaseName.toLowerCase()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className="bg-card/60 backdrop-blur-md border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {rec.icon}
                      {rec.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">✓ Добре за:</p>
                      <ul className="text-sm space-y-1">
                        {rec.good.map((item, i) => (
                          <li key={i} className="text-green-600 dark:text-green-400">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">✗ Избягвайте:</p>
                      <ul className="text-sm space-y-1">
                        {rec.avoid.map((item, i) => (
                          <li key={i} className="text-red-500 dark:text-red-400">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LunarCalendar;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, TrendingUp, AlertCircle, Clock, Star, ArrowRight, Loader2, Lock, Crown } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import cosmicBg from "@/assets/cosmic-bg.jpg";
import { useSubscription } from "@/hooks/useSubscription";

interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
}

interface TransitData {
  planet: string;
  currentSign: string;
  natalAspect: string;
  natalPlanet: string;
  influence: "positive" | "challenging" | "neutral";
  intensity: number;
  description: string;
  duration: string;
}

interface ProgressionData {
  planet: string;
  progressedSign: string;
  natalSign: string;
  theme: string;
  description: string;
  yearsActive: string;
}

interface TransitAnalysis {
  currentPlanets: PlanetPosition[];
  transits: TransitData[];
  progressions: ProgressionData[];
  overview: string;
  keyDates: { date: string; event: string; importance: "high" | "medium" | "low" }[];
}

const ZODIAC_SIGNS = [
  "Овен", "Телец", "Близнаци", "Рак", "Лъв", "Дева",
  "Везни", "Скорпион", "Стрелец", "Козирог", "Водолей", "Риби"
];

const PLANETS = [
  { name: "Слънце", symbol: "☉", speed: "fast" },
  { name: "Луна", symbol: "☽", speed: "fast" },
  { name: "Меркурий", symbol: "☿", speed: "fast" },
  { name: "Венера", symbol: "♀", speed: "fast" },
  { name: "Марс", symbol: "♂", speed: "medium" },
  { name: "Юпитер", symbol: "♃", speed: "slow" },
  { name: "Сатурн", symbol: "♄", speed: "slow" },
  { name: "Уран", symbol: "♅", speed: "outer" },
  { name: "Нептун", symbol: "♆", speed: "outer" },
  { name: "Плутон", symbol: "♇", speed: "outer" }
];

// Approximate current planetary positions (updated periodically)
const getCurrentPlanetaryPositions = (): PlanetPosition[] => {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Simplified planetary position calculation based on average orbital periods
  const positions: PlanetPosition[] = [
    { planet: "Слънце", sign: ZODIAC_SIGNS[Math.floor((dayOfYear / 365.25) * 12) % 12], degree: (dayOfYear % 30) + 1, retrograde: false },
    { planet: "Луна", sign: ZODIAC_SIGNS[Math.floor((dayOfYear * 13.37 / 365.25) * 12) % 12], degree: Math.floor(Math.random() * 30) + 1, retrograde: false },
    { planet: "Меркурий", sign: ZODIAC_SIGNS[(Math.floor((dayOfYear / 365.25) * 12) + (dayOfYear % 3 === 0 ? 1 : 0)) % 12], degree: (dayOfYear % 30) + 1, retrograde: dayOfYear % 116 < 23 },
    { planet: "Венера", sign: ZODIAC_SIGNS[(Math.floor((dayOfYear / 365.25) * 12) + 1) % 12], degree: (dayOfYear % 30) + 1, retrograde: dayOfYear % 584 < 42 },
    { planet: "Марс", sign: ZODIAC_SIGNS[Math.floor((dayOfYear / 687) * 12) % 12], degree: (dayOfYear % 30) + 1, retrograde: dayOfYear % 780 < 72 },
    { planet: "Юпитер", sign: ZODIAC_SIGNS[Math.floor(((now.getFullYear() - 2023) / 11.86) * 12 + 0) % 12], degree: 15, retrograde: dayOfYear > 150 && dayOfYear < 270 },
    { planet: "Сатурн", sign: ZODIAC_SIGNS[Math.floor(((now.getFullYear() - 2023) / 29.46) * 12 + 10) % 12], degree: 12, retrograde: dayOfYear > 140 && dayOfYear < 280 },
    { planet: "Уран", sign: "Телец", degree: 25, retrograde: dayOfYear > 170 && dayOfYear < 310 },
    { planet: "Нептун", sign: "Риби", degree: 29, retrograde: dayOfYear > 160 && dayOfYear < 300 },
    { planet: "Плутон", sign: "Водолей", degree: 2, retrograde: dayOfYear > 130 && dayOfYear < 280 }
  ];
  
  return positions;
};

const getZodiacIndex = (sign: string): number => {
  return ZODIAC_SIGNS.indexOf(sign);
};

const calculateAspect = (degree1: number, sign1: string, degree2: number, sign2: string): string | null => {
  const pos1 = getZodiacIndex(sign1) * 30 + degree1;
  const pos2 = getZodiacIndex(sign2) * 30 + degree2;
  const diff = Math.abs(pos1 - pos2);
  const normalizedDiff = diff > 180 ? 360 - diff : diff;
  
  if (normalizedDiff <= 8) return "Съвпад";
  if (normalizedDiff >= 52 && normalizedDiff <= 68) return "Секстил";
  if (normalizedDiff >= 82 && normalizedDiff <= 98) return "Квадрат";
  if (normalizedDiff >= 112 && normalizedDiff <= 128) return "Тригон";
  if (normalizedDiff >= 172 && normalizedDiff <= 188) return "Опозиция";
  
  return null;
};

const TransitsProgressions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<TransitAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { canAccessFeature, loading: subscriptionLoading, getActivePlan } = useSubscription(userId);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setUserId(session.user.id);
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
    setUserId(session.user.id);
    await loadUserProfile(session.user.id);
    setLoading(false);
  };

  const hasAccess = canAccessFeature('transitsProgressions');

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const generateAnalysis = async () => {
    if (!userProfile?.zodiac_sign) {
      toast.error("Моля, първо попълнете профила си с дата на раждане");
      return;
    }

    setAnalyzing(true);

    try {
      const currentPositions = getCurrentPlanetaryPositions();
      
      const { data, error } = await supabase.functions.invoke("generate-transits-analysis", {
        body: {
          zodiacSign: userProfile.zodiac_sign,
          birthDate: userProfile.birth_date,
          birthTime: userProfile.birth_time,
          currentPlanets: currentPositions
        }
      });

      if (error) throw error;

      setAnalysis({
        currentPlanets: currentPositions,
        ...data
      });
      
      toast.success("Анализът е готов!");
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast.error("Грешка при генериране на анализа");
    } finally {
      setAnalyzing(false);
    }
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case "positive": return "text-green-500";
      case "challenging": return "text-red-500";
      default: return "text-yellow-500";
    }
  };

  const getInfluenceBg = (influence: string) => {
    switch (influence) {
      case "positive": return "bg-green-500/20 border-green-500/30";
      case "challenging": return "bg-red-500/20 border-red-500/30";
      default: return "bg-yellow-500/20 border-yellow-500/30";
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "high": return <Badge variant="destructive">Важно</Badge>;
      case "medium": return <Badge variant="secondary">Средно</Badge>;
      default: return <Badge variant="outline">Леко</Badge>;
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Layout user={user}>
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
          <div className="max-w-lg mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardContent className="pt-8 pb-8 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Достъпът е ограничен</h2>
                  <p className="text-muted-foreground">
                    Функцията "Транзити и прогреси" е достъпна за потребители с план BASIC или по-висок.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Текущ план: <span className="font-semibold text-primary">{getActivePlan()}</span>
                  </p>
                </div>
                <Button onClick={() => navigate('/plans')} className="gap-2">
                  <Crown className="w-4 h-4" />
                  Вижте плановете
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const currentPositions = getCurrentPlanetaryPositions();

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
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">Транзити и прогреси</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Открийте как текущите планетарни позиции влияят на вашия живот и какви теми се разгръщат в дългосрочен план
            </p>
          </div>

          {/* Current Planetary Positions */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Текущи планетарни позиции
              </CardTitle>
              <CardDescription>
                Къде се намират планетите в момента ({new Date().toLocaleDateString("bg-BG")})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {currentPositions.map((pos) => {
                  const planetInfo = PLANETS.find(p => p.name === pos.planet);
                  return (
                    <div 
                      key={pos.planet}
                      className="p-3 rounded-lg bg-muted/50 border border-border/50 text-center"
                    >
                      <div className="text-2xl mb-1">{planetInfo?.symbol}</div>
                      <div className="font-medium text-sm">{pos.planet}</div>
                      <div className="text-xs text-muted-foreground">
                        {pos.sign} {pos.degree}°
                        {pos.retrograde && <span className="text-red-400 ml-1">℞</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Generate Analysis Button */}
          {!analysis && (
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <TrendingUp className="w-16 h-16 text-primary mx-auto" />
                  <h2 className="text-2xl font-semibold">Персонализиран анализ</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Проверете персонализиран анализ на транзитите и прогресиите въз основа на вашата натална карта
                  </p>
                  <Button 
                    size="lg" 
                    onClick={generateAnalysis}
                    disabled={analyzing || !userProfile?.zodiac_sign}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Анализиране...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Провери анализ
                      </>
                    )}
                  </Button>
                  {!userProfile?.zodiac_sign && (
                    <p className="text-sm text-destructive">
                      Моля, първо попълнете профила си с дата на раждане
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysis && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Преглед</TabsTrigger>
                <TabsTrigger value="transits">Транзити</TabsTrigger>
                <TabsTrigger value="progressions">Прогреси</TabsTrigger>
                <TabsTrigger value="dates">Ключови дати</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Общ преглед
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                      {analysis.overview}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Активни транзити</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.transits.slice(0, 3).map((transit, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border ${getInfluenceBg(transit.influence)}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{transit.planet}</span>
                            <span className={`text-sm ${getInfluenceColor(transit.influence)}`}>
                              {transit.natalAspect} {transit.natalPlanet}
                            </span>
                          </div>
                          <Progress value={transit.intensity * 10} className="h-2" />
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setActiveTab("transits")}
                      >
                        Виж всички <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Предстоящи събития</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.keyDates.slice(0, 4).map((event, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div>
                            <div className="font-medium text-sm">{event.event}</div>
                            <div className="text-xs text-muted-foreground">{event.date}</div>
                          </div>
                          {getImportanceBadge(event.importance)}
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setActiveTab("dates")}
                      >
                        Виж всички <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Transits Tab */}
              <TabsContent value="transits" className="space-y-4">
                {analysis.transits.map((transit, idx) => (
                  <Card key={idx} className={`bg-card/80 backdrop-blur-sm border ${getInfluenceBg(transit.influence)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">
                            {PLANETS.find(p => p.name === transit.planet)?.symbol}
                          </span>
                          {transit.planet} в {transit.currentSign}
                        </CardTitle>
                        <Badge variant={transit.influence === "positive" ? "default" : transit.influence === "challenging" ? "destructive" : "secondary"}>
                          {transit.influence === "positive" ? "Благоприятен" : transit.influence === "challenging" ? "Предизвикателен" : "Неутрален"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {transit.natalAspect} натален {transit.natalPlanet}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Интензивност:</span>
                        <Progress value={transit.intensity * 10} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{transit.intensity}/10</span>
                      </div>
                      <p className="text-foreground/90">{transit.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Продължителност: {transit.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Progressions Tab */}
              <TabsContent value="progressions" className="space-y-4">
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      Какво са прогресиите?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Прогресиите са дългосрочни астрологични техники, при които един ден след раждането се равнява на една година от живота. 
                      Те показват вътрешната еволюция и психологическите теми, които се разгръщат през годините.
                    </p>
                  </CardContent>
                </Card>

                {analysis.progressions.map((prog, idx) => (
                  <Card key={idx} className="bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">
                            {PLANETS.find(p => p.name === prog.planet)?.symbol}
                          </span>
                          Прогресирано {prog.planet}
                        </CardTitle>
                        <Badge variant="outline">{prog.yearsActive}</Badge>
                      </div>
                      <CardDescription>
                        От {prog.natalSign} → {prog.progressedSign}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="font-medium text-primary mb-1">Тема:</div>
                        <p>{prog.theme}</p>
                      </div>
                      <p className="text-foreground/90">{prog.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Key Dates Tab */}
              <TabsContent value="dates" className="space-y-4">
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Ключови дати за следващите месеци
                    </CardTitle>
                    <CardDescription>
                      Важни астрологични събития, които ще повлияят на вашия знак
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.keyDates.map((event, idx) => (
                        <div 
                          key={idx}
                          className={`p-4 rounded-lg border ${
                            event.importance === "high" 
                              ? "bg-red-500/10 border-red-500/30" 
                              : event.importance === "medium"
                              ? "bg-yellow-500/10 border-yellow-500/30"
                              : "bg-muted/50 border-border/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{event.date}</span>
                            {getImportanceBadge(event.importance)}
                          </div>
                          <p className="text-foreground/90">{event.event}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Regenerate Button */}
          {analysis && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={generateAnalysis}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Обновяване...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Обнови анализа
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TransitsProgressions;

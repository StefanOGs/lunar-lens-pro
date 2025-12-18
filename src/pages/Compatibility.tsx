import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Heart, Sparkles, Loader2, Info, MessageCircle, Flame, Target, Clock, Trophy, Lock, Crown } from "lucide-react";
import Layout from "@/components/Layout";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { toast } from "sonner";
import cosmicBg from "@/assets/cosmic-bg.jpg";
import { useSubscription } from "@/hooks/useSubscription";

interface PersonData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  birthLat: number | null;
  birthLon: number | null;
}

interface AspectResult {
  name: string;
  score: number;
  interpretation: string;
}

interface CompatibilityResult {
  overallScore: number;
  aspects: AspectResult[];
  summary: string;
}

const aspectIcons: Record<string, React.ReactNode> = {
  "Емоционална съвместимост": <Heart className="w-5 h-5" />,
  "Комуникация и разбирателство": <MessageCircle className="w-5 h-5" />,
  "Страст и химия": <Flame className="w-5 h-5" />,
  "Житейски цели и ценности": <Target className="w-5 h-5" />,
  "Темперамент и ежедневие": <Clock className="w-5 h-5" />,
  "Дългосрочен потенциал": <Trophy className="w-5 h-5" />,
};

const getScoreColor = (score: number): string => {
  if (score >= 8) return "text-green-500";
  if (score >= 6) return "text-yellow-500";
  if (score >= 4) return "text-orange-500";
  return "text-red-500";
};

const getProgressColor = (score: number): string => {
  if (score >= 8) return "bg-green-500";
  if (score >= 6) return "bg-yellow-500";
  if (score >= 4) return "bg-orange-500";
  return "bg-red-500";
};

const getZodiacSign = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  
  const zodiacSigns = [
    { sign: "Козирог", start: [1, 1], end: [1, 19] },
    { sign: "Водолей", start: [1, 20], end: [2, 18] },
    { sign: "Риби", start: [2, 19], end: [3, 20] },
    { sign: "Овен", start: [3, 21], end: [4, 19] },
    { sign: "Телец", start: [4, 20], end: [5, 20] },
    { sign: "Близнаци", start: [5, 21], end: [6, 20] },
    { sign: "Рак", start: [6, 21], end: [7, 22] },
    { sign: "Лъв", start: [7, 23], end: [8, 22] },
    { sign: "Дева", start: [8, 23], end: [9, 22] },
    { sign: "Везни", start: [9, 23], end: [10, 22] },
    { sign: "Скорпион", start: [10, 23], end: [11, 21] },
    { sign: "Стрелец", start: [11, 22], end: [12, 21] },
    { sign: "Козирог", start: [12, 22], end: [12, 31] },
  ];

  for (const z of zodiacSigns) {
    const [startMonth, startDay] = z.start;
    const [endMonth, endDay] = z.end;
    
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return z.sign;
    }
  }
  
  return "Козирог";
};

const getDataLevel = (person: PersonData): 'basic' | 'medium' | 'full' => {
  const hasDate = !!person.birthDate;
  const hasTime = !!person.birthTime;
  const hasPlace = !!person.birthPlace && person.birthLat !== null;
  
  if (hasDate && hasTime && hasPlace) return 'full';
  if (hasDate && (hasTime || hasPlace)) return 'medium';
  return 'basic';
};

const Compatibility = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [dataLevel, setDataLevel] = useState<'basic' | 'medium' | 'full'>('basic');
  
  const { canAccessFeature, loading: subscriptionLoading, getActivePlan } = useSubscription(userId);
  
  const [person1, setPerson1] = useState<PersonData>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    birthLat: null,
    birthLon: null,
  });
  
  const [person2, setPerson2] = useState<PersonData>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    birthLat: null,
    birthLon: null,
  });

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

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setPerson1(prev => ({
          ...prev,
          name: profile.full_name || "Вие",
          birthDate: profile.birth_date || "",
          birthTime: profile.birth_time || "",
          birthPlace: profile.birth_place || "",
          birthLat: profile.birth_lat,
          birthLon: profile.birth_lon,
        }));
      }
    };
    
    loadProfile();
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }
    
    setUser(session.user);
    setUserId(session.user.id);
    setLoading(false);
  };

  const hasAccess = canAccessFeature('compatibility', 'compatibility');

  const handleAnalyze = async () => {
    if (!person1.birthDate || !person2.birthDate) {
      toast.error("Моля въведете датите на раждане и за двамата");
      return;
    }

    setAnalyzing(true);
    setResult(null);

    const level1 = getDataLevel(person1);
    const level2 = getDataLevel(person2);
    const overallLevel = level1 === 'full' && level2 === 'full' ? 'full' 
      : (level1 === 'basic' || level2 === 'basic') ? 'basic' 
      : 'medium';
    
    setDataLevel(overallLevel);

    try {
      const { data, error } = await supabase.functions.invoke('generate-compatibility', {
        body: {
          person1: {
            ...person1,
            zodiacSign: getZodiacSign(person1.birthDate),
          },
          person2: {
            ...person2,
            zodiacSign: getZodiacSign(person2.birthDate),
          },
          dataLevel: overallLevel,
        }
      });

      if (error) throw error;
      
      setResult(data.result);
    } catch (error) {
      console.error('Error analyzing compatibility:', error);
      toast.error("Грешка при анализа. Моля опитайте отново.");
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes('-')) return dateStr;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
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
                    Функцията "Съвместимост" е достъпна за потребители с план BASIC или по-висок, 
                    или с еднократна покупка.
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
          <div className="text-center space-y-4">
            <Heart className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-4xl md:text-5xl font-bold">Съвместимост</h1>
            <p className="text-xl text-muted-foreground">
              Открийте астрологичната съвместимост между двама души
            </p>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Как работи?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Само дата на раждане:</strong> Базова съвместимост по зодиакални знаци</p>
              <p><strong>Дата + час ИЛИ място:</strong> По-детайлен анализ с допълнителни фактори</p>
              <p><strong>Дата + час + място:</strong> Пълен астрологичен анализ с асцендент и планети</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Person 1 */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Първи човек</CardTitle>
                <CardDescription>Вашите данни (заредени от профила)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name1">Име (незадължително)</Label>
                  <Input
                    id="name1"
                    value={person1.name}
                    onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
                    placeholder="Име"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date1">Дата на раждане *</Label>
                  <Input
                    id="date1"
                    type="date"
                    value={formatDateForInput(person1.birthDate)}
                    onChange={(e) => setPerson1({ ...person1, birthDate: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time1">Час на раждане (незадължително)</Label>
                  <Input
                    id="time1"
                    type="time"
                    value={person1.birthTime}
                    onChange={(e) => setPerson1({ ...person1, birthTime: e.target.value })}
                  />
                </div>
                
                <LocationAutocomplete
                  label="Място на раждане (незадължително)"
                  value={person1.birthPlace}
                  onChange={(value) => setPerson1({ ...person1, birthPlace: value })}
                  onLocationSelect={(location) => {
                    setPerson1({
                      ...person1,
                      birthPlace: location.displayName,
                      birthLat: location.lat,
                      birthLon: location.lon,
                    });
                  }}
                  placeholder="Въведете град..."
                />
              </CardContent>
            </Card>

            {/* Person 2 */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Втори човек</CardTitle>
                <CardDescription>Данни на партньора</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name2">Име (незадължително)</Label>
                  <Input
                    id="name2"
                    value={person2.name}
                    onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
                    placeholder="Име"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date2">Дата на раждане *</Label>
                  <Input
                    id="date2"
                    type="date"
                    value={person2.birthDate}
                    onChange={(e) => setPerson2({ ...person2, birthDate: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time2">Час на раждане (незадължително)</Label>
                  <Input
                    id="time2"
                    type="time"
                    value={person2.birthTime}
                    onChange={(e) => setPerson2({ ...person2, birthTime: e.target.value })}
                  />
                </div>
                
                <LocationAutocomplete
                  label="Място на раждане (незадължително)"
                  value={person2.birthPlace}
                  onChange={(value) => setPerson2({ ...person2, birthPlace: value })}
                  onLocationSelect={(location) => {
                    setPerson2({
                      ...person2,
                      birthPlace: location.displayName,
                      birthLat: location.lat,
                      birthLon: location.lon,
                    });
                  }}
                  placeholder="Въведете град..."
                />
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleAnalyze}
              disabled={analyzing || !person1.birthDate || !person2.birthDate}
              className="min-w-[200px]"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Анализиране...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Анализирай съвместимостта
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center">
                        <span className={`text-5xl font-bold ${getScoreColor(result.overallScore / 10)}`}>
                          {result.overallScore}
                        </span>
                      </div>
                      <Heart className="absolute -top-2 -right-2 w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Обща съвместимост</h2>
                      <p className="text-sm text-muted-foreground">
                        ({dataLevel === 'full' ? 'Пълен анализ' : dataLevel === 'medium' ? 'Среден детайл' : 'Базов анализ'})
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Aspects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.aspects.map((aspect, index) => (
                  <Card key={index} className="bg-card/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-primary">
                              {aspectIcons[aspect.name] || <Sparkles className="w-5 h-5" />}
                            </span>
                            <h3 className="font-semibold text-sm">{aspect.name}</h3>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(aspect.score)}`}>
                            {aspect.score}/10
                          </span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${getProgressColor(aspect.score)}`}
                            style={{ width: `${aspect.score * 10}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {aspect.interpretation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Обобщение
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90 leading-relaxed">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Compatibility;
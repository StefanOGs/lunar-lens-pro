import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { zodiacSigns, getSignById, getElementColor, getElementName } from "@/data/zodiacSigns";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const ZodiacDetails = () => {
  const navigate = useNavigate();
  const { sign: signId } = useParams<{ sign: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const sign = signId ? getSignById(signId) : undefined;
  
  // Get previous and next signs
  const currentIndex = zodiacSigns.findIndex(s => s.id === signId);
  const prevSign = currentIndex > 0 ? zodiacSigns[currentIndex - 1] : zodiacSigns[11];
  const nextSign = currentIndex < 11 ? zodiacSigns[currentIndex + 1] : zodiacSigns[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sign) {
    return (
      <Layout user={user}>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Знакът не е намерен</h1>
          <Button asChild>
            <Link to="/zodiac">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Обратно към всички знаци
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/zodiac">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Всички знаци
          </Link>
        </Button>

        {/* Header Section */}
        <Card className={`mb-8 bg-gradient-to-br ${getElementColor(sign.element)} border backdrop-blur-sm`}>
          <CardContent className="p-8 md:p-12 text-center">
            {/* Large Glyph */}
            <div className="text-8xl md:text-9xl mb-6">{sign.glyph}</div>
            
            {/* Sign Name */}
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{sign.nameBg}</h1>
            <p className="text-xl text-muted-foreground mb-4">{sign.name}</p>
            
            {/* Date Range */}
            <p className="text-lg font-medium mb-6">{sign.dateRange}</p>
            
            {/* Info Badges */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 rounded-full bg-background/50">
                <span className="text-sm text-muted-foreground">Елемент: </span>
                <span className="font-medium">{getElementName(sign.element)}</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-background/50">
                <span className="text-sm text-muted-foreground">Управител: </span>
                <span className="font-medium">{sign.ruling}</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-background/50">
                <span className="text-sm text-muted-foreground">Качество: </span>
                <span className="font-medium">{sign.quality}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 md:p-10">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {sign.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground/90 leading-relaxed mb-6 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 gap-4">
            <Button variant="outline" asChild className="flex-1 md:flex-none">
              <Link to={`/zodiac/${prevSign.id}`}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{prevSign.nameBg}</span>
                <span className="sm:hidden">Предишен</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/zodiac">
                Всички знаци
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="flex-1 md:flex-none">
              <Link to={`/zodiac/${nextSign.id}`}>
                <span className="hidden sm:inline">{nextSign.nameBg}</span>
                <span className="sm:hidden">Следващ</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ZodiacDetails;

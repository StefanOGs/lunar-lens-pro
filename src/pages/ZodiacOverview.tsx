import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { zodiacSigns, getElementColor, getElementName } from "@/data/zodiacSigns";
import { ArrowRight } from "lucide-react";
import cosmicBg from "@/assets/cosmic-bg.jpg";

const ZodiacOverview = () => {
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Зодиакални знаци</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Открийте характеристиките, силните страни и предизвикателствата на всеки зодиакален знак
          </p>
        </div>

        {/* Zodiac Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {zodiacSigns.map((sign) => (
            <Link key={sign.id} to={`/zodiac/${sign.id}`}>
              <Card 
                className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br ${getElementColor(sign.element)} border backdrop-blur-sm`}
              >
                <CardContent className="p-6 text-center">
                  {/* Glyph */}
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {sign.glyph}
                  </div>
                  
                  {/* Sign Name */}
                  <h2 className="text-2xl font-bold mb-1">{sign.nameBg}</h2>
                  <p className="text-sm text-muted-foreground mb-3">{sign.name}</p>
                  
                  {/* Date Range */}
                  <p className="text-sm font-medium text-foreground/80 mb-4">
                    {sign.dateRange}
                  </p>
                  
                  {/* Element Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 text-sm">
                    <span>{getElementName(sign.element)}</span>
                  </div>
                  
                  {/* Read More */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Прочети повече</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ZodiacOverview;

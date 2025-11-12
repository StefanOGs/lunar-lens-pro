import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import ProfileSetup from "@/components/ProfileSetup";
import { useToast } from "@/hooks/use-toast";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadProfile(session.user.id);
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
    await loadProfile(session.user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
    } else {
      setProfile(data);
    }
  };

  const handleProfileCreated = async () => {
    if (user) {
      await loadProfile(user.id);
      toast({
        title: profile ? "Профилът е актуализиран!" : "Профилът е създаден!",
        description: profile ? "Промените са запазени успешно." : "Вашият персонализиран хороскоп е готов.",
      });
      navigate("/home");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Зареждане...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">
                {profile ? "Редактирайте Вашия Профил" : "Създайте Вашия Астрологичен Профил"}
              </CardTitle>
              <CardDescription>
                {profile 
                  ? "Променете вашите данни за раждане" 
                  : "Въведете вашите данни за раждане, за да получите персонализирани хороскопи"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSetup 
                userId={user?.id || ''} 
                onProfileCreated={handleProfileCreated}
                existingProfile={profile}
                isEditing={!!profile}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;

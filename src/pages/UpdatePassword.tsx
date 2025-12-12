import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Listen for auth state changes to detect when user lands from email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      } else if (session) {
        setSessionReady(true);
      }
    });

    // Check if there's already a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Грешка",
        description: "Паролите не съвпадат.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Грешка",
        description: "Паролата трябва да е поне 6 символа.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Паролата е променена!",
        description: "Вече можете да влезете с новата си парола.",
      });

      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Грешка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-cosmic">
        <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Зареждане...</CardTitle>
            <CardDescription>
              Моля, изчакайте докато потвърдим вашата заявка.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-cosmic">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Нова парола</CardTitle>
          <CardDescription>
            Въведете новата си парола по-долу
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Нова парола</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Потвърдете паролата</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Запазване..." : "Запази новата парола"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePassword;

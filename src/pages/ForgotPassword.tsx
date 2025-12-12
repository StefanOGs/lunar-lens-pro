import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Имейлът е изпратен!",
        description: "Проверете имейла си за линк за нулиране на паролата.",
      });
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-cosmic">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-mystical flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Забравена парола</CardTitle>
          <CardDescription>
            {emailSent 
              ? "Проверете имейла си за инструкции за нулиране на паролата"
              : "Въведете имейл адреса си и ще ви изпратим линк за нулиране на паролата"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Имейл</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Изпращане..." : "Изпрати линк за нулиране"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Ако имейл адресът съществува в нашата система, ще получите имейл с инструкции.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Изпрати отново
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Link to="/auth">
            <Button variant="ghost" className="text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад към вход
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;

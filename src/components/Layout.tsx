import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, UserIcon, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import { User } from "@supabase/supabase-js";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
}

const Layout = ({ children, user }: LayoutProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic flex flex-col">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={logo} alt="Eclyptica Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold">Eclyptica</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/home">Начало</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/horoscopes">Моите хороскопи</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/services">Услуги</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/about">За нас</Link>
              </Button>
            </nav>
          </div>
          
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="w-4 h-4" />
              <span className="text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/edit-profile">
                <Settings className="w-4 h-4 mr-2" />
                Редактирай профил
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Изход
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-2 text-sm border-b border-border pb-4">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-muted-foreground text-xs break-all">{user?.email}</span>
                </div>
                
                <nav className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/home">Начало</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/horoscopes">Моите хороскопи</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/services">Услуги</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/about">За нас</Link>
                  </Button>
                </nav>

                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/edit-profile">
                    <Settings className="w-4 h-4 mr-2" />
                    Редактирай профил
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Изход
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Eclyptica. Всички права запазени.
        </div>
      </footer>
    </div>
  );
};

export default Layout;

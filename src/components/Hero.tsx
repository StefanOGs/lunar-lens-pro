import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-cosmic.jpg";
import logo from "@/assets/logo.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Eclyptica Logo" className="h-8 sm:h-10 w-auto" />
            <span className="text-lg sm:text-xl font-bold">Eclyptica</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/about">За нас</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">Вход</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-xs sm:text-sm text-foreground">Вашият път сред звездите</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-mystical leading-tight">
            Астрологични Прозрения
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
            Персонализирани натални карти, хороскопи и астрологични анализи,
            създадени специално за вас
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4">
            <Button 
              className="text-sm sm:text-base md:text-lg px-5 py-2 sm:px-6 sm:py-2 md:px-8 md:py-3 shadow-glow hover:shadow-[0_0_50px_hsl(var(--primary)/0.4)] transition-all duration-300 animate-pulse-glow w-full sm:w-auto" 
              onClick={() => window.location.href = '/auth'}
            >
              Открийте космическата си истина
            </Button>
            <Button 
              variant="outline" 
              className="text-sm sm:text-base md:text-lg px-5 py-2 sm:px-6 sm:py-2 md:px-8 md:py-3 border-primary/50 hover:bg-primary/10 transition-all duration-300 w-full sm:w-auto" 
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            >
              Вижте Услугите
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

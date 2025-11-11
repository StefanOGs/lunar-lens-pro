import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-cosmic.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-foreground">Вашият път сред звездите</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-mystical leading-tight">
            Астрологични Прозрения
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Персонализирани натални карти, хороскопи и астрологични анализи,
            създадени специално за вас
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              className="text-base sm:text-lg px-6 py-2 sm:px-8 sm:py-3 shadow-glow hover:shadow-[0_0_50px_hsl(var(--primary)/0.4)] transition-all duration-300 animate-pulse-glow" 
              onClick={() => window.location.href = '/auth'}
            >
              Открийте космическата си истина
            </Button>
            <Button variant="outline" className="text-base sm:text-lg px-6 py-2 sm:px-8 sm:py-3 border-primary/50 hover:bg-primary/10 transition-all duration-300" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
              Вижте Услугите
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

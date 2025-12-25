import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section 
      className="py-16 sm:py-24 px-4 bg-gradient-to-b from-background to-card/30"
      aria-labelledby="cta-heading"
    >
      <div className="container mx-auto max-w-4xl text-center">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-mystical/20 backdrop-blur-sm border border-primary/30 space-y-6">
          <h2 
            id="cta-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
          >
            Готови ли сте да откриете звездите?
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Създайте безплатен профил и получете достъп до персонализирани хороскопи, 
            натална карта и космически прозрения.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg"
              className="shadow-glow hover:shadow-[0_0_50px_hsl(var(--primary)/0.4)] transition-all duration-300 gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              asChild
            >
              <Link to="/auth">
                Създай Профил
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary/50 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              asChild
            >
              <Link to="/zodiac">
                Разгледай Зодиите
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

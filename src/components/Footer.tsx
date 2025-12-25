import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="space-y-4 col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-lg sm:text-xl font-bold">Eclyptica.com</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Вашият водач в космическата мъдрост и астрологичните прозрения
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Услуги</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><Link to="/natal-chart" className="hover:text-foreground transition-colors">Натална Карта</Link></li>
              <li><Link to="/compatibility" className="hover:text-foreground transition-colors">Съвместимост</Link></li>
              <li><Link to="/horoscopes" className="hover:text-foreground transition-colors">Хороскопи</Link></li>
              <li><Link to="/services" className="hover:text-foreground transition-colors">Консултации</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Ресурси</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><Link to="/zodiac" className="hover:text-foreground transition-colors">Зодии</Link></li>
              <li><Link to="/lunar-calendar" className="hover:text-foreground transition-colors">Лунен Календар</Link></li>
              <li><Link to="/plans" className="hover:text-foreground transition-colors">Планове</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">За нас</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Свържете се</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="mailto:contact@eclyptica.com" className="hover:text-foreground transition-colors">Контакти</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Поддръжка</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Условия</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Поверителност</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 sm:pt-8 border-t border-border/50 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {currentYear} Eclyptica.com. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
};

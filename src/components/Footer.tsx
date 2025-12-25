import { Sparkles } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
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
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Натална Карта</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Съвместимост</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Хороскопи</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Консултации</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Ресурси</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Блог</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Учебни материали</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">За нас</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Свържете се</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Контакти</a></li>
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

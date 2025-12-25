import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="border-t border-border/50 bg-card/30 backdrop-blur-sm"
      role="contentinfo"
      aria-label="Долен колонтитул на сайта"
    >
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" aria-hidden="true" />
              <span className="text-lg sm:text-xl font-bold">Eclyptica.com</span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Вашият водач в космическата мъдрост и астрологичните прозрения
            </p>
          </div>
          
          <nav aria-label="Услуги">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Услуги</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/natal-chart" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Натална Карта
                </Link>
              </li>
              <li>
                <Link to="/compatibility" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Съвместимост
                </Link>
              </li>
              <li>
                <Link to="/horoscopes" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Хороскопи
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Консултации
                </Link>
              </li>
            </ul>
          </nav>
          
          <nav aria-label="Ресурси">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Ресурси</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/zodiac" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Зодиите
                </Link>
              </li>
              <li>
                <Link to="/lunar-calendar" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Лунен Календар
                </Link>
              </li>
              <li>
                <Link to="/plans" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Планове
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  За нас
                </Link>
              </li>
            </ul>
          </nav>
          
          <nav aria-label="Правна информация">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Свържете се</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Контакти
                </Link>
              </li>
              <li>
                <a href="mailto:support@eclyptica.com" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Поддръжка
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Условия
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  Поверителност
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="pt-6 sm:pt-8 border-t border-border/50 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {currentYear} Eclyptica.com. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
};

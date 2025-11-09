import { useEffect, useState } from "react";
import { Moon } from "lucide-react";

export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center animate-fade-out">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Moon className="w-16 h-16 text-primary animate-spin" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Зареждане...</p>
      </div>
    </div>
  );
};

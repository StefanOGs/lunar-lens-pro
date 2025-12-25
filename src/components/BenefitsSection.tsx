import { Star, Shield, Sparkles, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const benefits = [
  {
    icon: Star,
    title: "Персонализирани Анализи",
    description: "Уникални астрологични прозрения, базирани на вашата точна натална карта"
  },
  {
    icon: Shield,
    title: "Професионална Точност",
    description: "Използваме Swiss Ephemeris за максимално точни астрологични изчисления"
  },
  {
    icon: Sparkles,
    title: "Дневни Прогнози",
    description: "Получавайте персонализирани хороскопи всеки ден безплатно"
  },
  {
    icon: Zap,
    title: "Мигновени Резултати",
    description: "Генерирайте вашата натална карта за секунди"
  },
  {
    icon: Heart,
    title: "Анализ за Съвместимост",
    description: "Открийте астрологичната съвместимост с вашия партньор"
  }
];

export const BenefitsSection = () => {
  const prefersReducedMotion = useReducedMotion();
  
  const containerVariants = prefersReducedMotion
    ? {}
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      };

  const itemVariants = prefersReducedMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4 }
        }
      };

  return (
    <section 
      className="py-16 sm:py-24 px-4 bg-gradient-to-b from-card/30 to-background"
      aria-labelledby="benefits-heading"
    >
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16 space-y-4">
          <h2 
            id="benefits-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
          >
            Защо Eclyptica?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Вашето персонално астрологично пътешествие започва тук
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-colors text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-mystical flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

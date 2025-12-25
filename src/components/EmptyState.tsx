import { LucideIcon, Moon, FileQuestion, Search, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'calendar' | 'history';
}

const variantIcons: Record<string, LucideIcon> = {
  default: Moon,
  search: Search,
  calendar: Calendar,
  history: FileQuestion,
};

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) => {
  const IconComponent = icon || variantIcons[variant];
  
  // Check for reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  
  const containerVariants = prefersReducedMotion 
    ? {} 
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      {...containerVariants}
    >
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <IconComponent className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

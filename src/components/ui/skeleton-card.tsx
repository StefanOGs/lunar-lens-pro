import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

interface SkeletonCardProps {
  showIcon?: boolean;
  showDescription?: boolean;
  showButton?: boolean;
  className?: string;
}

export const SkeletonCard = ({
  showIcon = true,
  showDescription = true,
  showButton = true,
  className = '',
}: SkeletonCardProps) => {
  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <CardHeader>
        {showIcon && (
          <Skeleton className="w-12 h-12 rounded-lg mb-4" />
        )}
        <Skeleton className="h-6 w-3/4 mb-2" />
        {showDescription && (
          <Skeleton className="h-4 w-full" />
        )}
      </CardHeader>
      {showButton && (
        <CardContent>
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      )}
    </Card>
  );
};

export const SkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-card/30">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
        />
      ))}
    </div>
  );
};

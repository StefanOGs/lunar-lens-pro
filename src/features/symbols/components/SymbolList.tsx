// Symbol List Component

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Filter,
  X
} from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { bg } from 'date-fns/locale';
import { SymbolLogWithCategories, SymbolCategory } from '../types';
import { cn } from '@/lib/utils';

interface SymbolListProps {
  symbols: SymbolLogWithCategories[];
  categories: SymbolCategory[];
  loading: boolean;
  onSelect: (id: string) => void;
}

const INTENSITY_COLORS = [
  'bg-green-500/20 text-green-600',
  'bg-blue-500/20 text-blue-600',
  'bg-yellow-500/20 text-yellow-600',
  'bg-orange-500/20 text-orange-600',
  'bg-red-500/20 text-red-600',
];

export function SymbolList({ symbols, categories, loading, onSelect }: SymbolListProps) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Calculate patterns (count of same symbol in last 30 days)
  const symbolPatterns = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSymbols = symbols.filter(s => new Date(s.logged_at) >= thirtyDaysAgo);
    const counts: Record<string, number> = {};
    
    for (const s of recentSymbols) {
      const key = s.symbol.toLowerCase().trim();
      counts[key] = (counts[key] || 0) + 1;
    }
    
    return counts;
  }, [symbols]);

  const filteredSymbols = useMemo(() => {
    return symbols.filter(symbol => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!symbol.symbol.toLowerCase().includes(searchLower) && 
            !symbol.context?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Category filter
      if (selectedCategories.length > 0) {
        if (!symbol.categories.some(c => selectedCategories.includes(c.id))) {
          return false;
        }
      }
      
      // Date filter
      const loggedDate = new Date(symbol.logged_at);
      switch (dateFilter) {
        case 'today':
          if (!isToday(loggedDate)) return false;
          break;
        case 'week':
          if (!isThisWeek(loggedDate, { locale: bg })) return false;
          break;
        case 'month':
          if (!isThisMonth(loggedDate)) return false;
          break;
      }
      
      return true;
    });
  }, [symbols, search, selectedCategories, dateFilter]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Днес, ' + format(date, 'HH:mm');
    if (isYesterday(date)) return 'Вчера, ' + format(date, 'HH:mm');
    return format(date, 'd MMM yyyy, HH:mm', { locale: bg });
  };

  const getPatternCount = (symbol: SymbolLogWithCategories) => {
    return symbolPatterns[symbol.symbol.toLowerCase().trim()] || 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Търси символи..."
            className="pl-10 bg-background/50"
          />
        </div>
        
        {/* Date filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={dateFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDateFilter('all')}
          >
            Всички
          </Button>
          <Button
            variant={dateFilter === 'today' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDateFilter('today')}
          >
            Днес
          </Button>
          <Button
            variant={dateFilter === 'week' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDateFilter('week')}
          >
            Тази седмица
          </Button>
          <Button
            variant={dateFilter === 'month' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setDateFilter('month')}
          >
            Този месец
          </Button>
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                style={{
                  backgroundColor: selectedCategories.includes(category.id) ? category.color : 'transparent',
                  borderColor: category.color,
                  color: selectedCategories.includes(category.id) ? 'white' : category.color
                }}
                onClick={() => toggleCategory(category.id)}
              >
                {category.name}
                {selectedCategories.includes(category.id) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Symbol List */}
      {filteredSymbols.length === 0 ? (
        <Card className="bg-card/30 border-dashed">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {symbols.length === 0 
                ? 'Все още няма записани символи' 
                : 'Няма символи, отговарящи на филтрите'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSymbols.map((symbol) => {
            const patternCount = getPatternCount(symbol);
            
            return (
              <Card 
                key={symbol.id} 
                className="bg-card/50 hover:bg-card/80 transition-colors cursor-pointer group"
                onClick={() => onSelect(symbol.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                          {symbol.symbol}
                        </h3>
                        {patternCount >= 2 && (
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {patternCount}x / 30 дни
                          </Badge>
                        )}
                      </div>
                      
                      {symbol.context && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {symbol.context}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(symbol.logged_at)}
                        </span>
                        
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", INTENSITY_COLORS[symbol.intensity - 1])}
                        >
                          Интензивност: {symbol.intensity}
                        </Badge>
                        
                        {symbol.categories.map((cat) => (
                          <Badge
                            key={cat.id}
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: cat.color, color: cat.color }}
                          >
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Sparkles className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

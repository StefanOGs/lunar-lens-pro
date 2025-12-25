import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Moon, Plus, Calendar, Filter, Trash2 } from 'lucide-react';
import { DreamWithTags, DreamTag } from '../types';
import { format, parseISO } from 'date-fns';
import { bg } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DreamListProps {
  dreams: DreamWithTags[];
  tags: DreamTag[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
}

const MOOD_ICONS = ['😰', '😟', '😐', '😊', '✨'];

export function DreamList({ dreams, tags, loading, onDelete }: DreamListProps) {
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterMood, setFilterMood] = useState<string>('all');

  const filteredDreams = useMemo(() => {
    return dreams.filter(dream => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesTitle = dream.title.toLowerCase().includes(searchLower);
        const matchesBody = dream.body.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesBody) return false;
      }
      
      // Tag filter
      if (filterTag !== 'all') {
        if (!dream.tags.some(t => t.id === filterTag)) return false;
      }
      
      // Mood filter
      if (filterMood !== 'all') {
        if (dream.mood !== parseInt(filterMood)) return false;
      }
      
      return true;
    });
  }, [dreams, search, filterTag, filterMood]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-card/60">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Търси в сънищата..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Таг" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички тагове</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterMood} onValueChange={setFilterMood}>
              <SelectTrigger className="w-full sm:w-[140px] bg-background/50">
                <SelectValue placeholder="Настроение" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички</SelectItem>
                {MOOD_ICONS.map((icon, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {icon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredDreams.length === 0 && !loading && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="py-16 text-center">
            <Moon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {dreams.length === 0 ? 'Още нямаш записани сънища' : 'Няма резултати'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {dreams.length === 0 
                ? 'Започни да водиш дневник на сънищата си' 
                : 'Опитай с друг филтър'}
            </p>
            {dreams.length === 0 && (
              <Button asChild>
                <Link to="/dreams/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Запиши първия си сън
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dreams List */}
      <div className="grid gap-4">
        {filteredDreams.map(dream => (
          <Link key={dream.id} to={`/dreams/${dream.id}`}>
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {dream.mood && (
                        <span className="text-xl">{MOOD_ICONS[dream.mood - 1]}</span>
                      )}
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {dream.title}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {dream.body}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(dream.dream_date), 'd MMMM yyyy', { locale: bg })}
                      </span>
                      
                      {dream.tags.map(tag => (
                        <Badge 
                          key={tag.id} 
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Изтрий съня?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Това действие е необратимо. Сънят и всички негови анализи ще бъдат изтрити завинаги.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отказ</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={(e) => {
                            e.preventDefault();
                            onDelete(dream.id);
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Изтрий
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

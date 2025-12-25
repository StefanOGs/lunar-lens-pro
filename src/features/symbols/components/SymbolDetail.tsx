// Symbol Detail Component

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Calendar, 
  Trash2, 
  Edit, 
  RefreshCw,
  Brain,
  Heart,
  TrendingUp,
  MessageCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SymbolLogWithCategories, SymbolInsight, PatternData } from '../types';


interface SymbolDetailProps {
  symbol: SymbolLogWithCategories | null;
  insight: SymbolInsight | null;
  loading: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onRegenerate: () => Promise<void>;
  onAskInChat?: () => void;
}

const INTENSITY_LABELS = [
  'Едва забележимо',
  'Леко забележимо',
  'Умерено',
  'Силно',
  'Много силно'
];

const INTENSITY_COLORS = [
  'bg-green-500/20 text-green-600 border-green-500/30',
  'bg-blue-500/20 text-blue-600 border-blue-500/30',
  'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  'bg-orange-500/20 text-orange-600 border-orange-500/30',
  'bg-red-500/20 text-red-600 border-red-500/30',
];

export function SymbolDetail({ 
  symbol, 
  insight, 
  loading, 
  onBack, 
  onEdit, 
  onDelete,
  onRegenerate,
  onAskInChat
}: SymbolDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const handleDelete = async () => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този символ?')) return;
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await onRegenerate();
    setIsRegenerating(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card className="bg-card/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!symbol) {
    return (
      <Card className="bg-card/30 border-dashed">
        <CardContent className="py-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Символът не е намерен</p>
          <Button variant="ghost" onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад към списъка
          </Button>
        </CardContent>
      </Card>
    );
  }

  const patterns = (insight?.pattern || []) as PatternData[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Редактирай
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Symbol Info Card */}
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {symbol.symbol}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {format(new Date(symbol.logged_at), 'PPP, HH:mm', { locale: bg })}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn("text-sm", INTENSITY_COLORS[symbol.intensity - 1])}
            >
              {INTENSITY_LABELS[symbol.intensity - 1]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {symbol.context && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Контекст</h4>
              <p className="text-foreground whitespace-pre-wrap">{symbol.context}</p>
            </div>
          )}
          
          {symbol.categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {symbol.categories.map((cat) => (
                <Badge
                  key={cat.id}
                  style={{ backgroundColor: cat.color, color: 'white' }}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pattern Card */}
      {patterns.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Открити модели (последни 30 дни)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {patterns.slice(0, 4).map((pattern, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <span className="font-medium">{pattern.symbol}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{pattern.count}x</Badge>
                    {pattern.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {pattern.trend === 'decreasing' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Tabs */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Интерпретации</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Обнови анализа
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jung" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Юнг
              </TabsTrigger>
              <TabsTrigger value="freud" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Фройд
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="jung" className="mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {insight?.jung ? (
                  <div dangerouslySetInnerHTML={{ __html: insight.jung.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                ) : (
                  <p className="text-muted-foreground">Няма налична юнгианска интерпретация.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="freud" className="mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {insight?.freud ? (
                  <div dangerouslySetInnerHTML={{ __html: insight.freud.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                ) : (
                  <p className="text-muted-foreground">Няма налична фройдистка интерпретация.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Ask in PRO Chat */}
      {onAskInChat && (
        <Button 
          variant="outline" 
          className="w-full border-primary/20 hover:bg-primary/10"
          onClick={onAskInChat}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Попитай в PRO чата за по-дълбок анализ
        </Button>
      )}
    </div>
  );
}

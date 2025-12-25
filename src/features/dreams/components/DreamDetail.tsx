import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Moon, Calendar, Sparkles, Brain, BookOpen, 
  MessageSquare, Loader2, RefreshCw, Save
} from 'lucide-react';
import { DreamWithTags, DreamAnalysis, DreamSymbol } from '../types';
import { JUNG_ARCHETYPES, FREUD_SYMBOLS } from '../utils/dreamAnalyzer';
import { format, parseISO } from 'date-fns';
import { bg } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface DreamDetailProps {
  dream: DreamWithTags | null;
  loading: boolean;
  onRunAnalysis: (dreamId: string, dreamText: string, approach: 'jung' | 'freud' | 'mixed') => Promise<DreamAnalysis | null>;
  onGetAnalysis: (dreamId: string) => Promise<DreamAnalysis[]>;
  symbols: DreamSymbol[];
  onSaveSymbol: (symbol: string, meaningJung?: string, meaningFreud?: string, notes?: string) => Promise<boolean>;
}

const MOOD_LABELS = ['😰 Кошмар', '😟 Неспокоен', '😐 Неутрален', '😊 Приятен', '✨ Вълшебен'];

export function DreamDetail({ dream, loading, onRunAnalysis, onGetAnalysis, symbols, onSaveSymbol }: DreamDetailProps) {
  const [analyses, setAnalyses] = useState<DreamAnalysis[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (dream) {
      loadAnalyses();
    }
  }, [dream]);

  const loadAnalyses = async () => {
    if (!dream) return;
    const data = await onGetAnalysis(dream.id);
    setAnalyses(data);
  };

  const handleRunAnalysis = async (approach: 'jung' | 'freud' | 'mixed') => {
    if (!dream) return;
    setAnalysisLoading(true);
    try {
      await onRunAnalysis(dream.id, dream.body, approach);
      await loadAnalyses();
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Highlight symbols in text
  const highlightedBody = useMemo(() => {
    if (!dream) return null;
    
    const allSymbols = new Set([
      ...Object.keys(JUNG_ARCHETYPES),
      ...Object.keys(FREUD_SYMBOLS),
      ...symbols.map(s => s.symbol.toLowerCase()),
    ]);
    
    // Split text into words and non-words
    const parts = dream.body.split(/(\s+)/);
    
    return parts.map((part, i) => {
      const cleanWord = part.toLowerCase().replace(/[.,!?;:'"()\[\]{}]/g, '');
      
      if (allSymbols.has(cleanWord)) {
        const jungMeaning = JUNG_ARCHETYPES[cleanWord];
        const freudMeaning = FREUD_SYMBOLS[cleanWord];
        const userSymbol = symbols.find(s => s.symbol.toLowerCase() === cleanWord);
        
        return (
          <HoverCard key={i}>
            <HoverCardTrigger asChild>
              <span className="bg-primary/20 text-primary rounded px-0.5 cursor-help underline decoration-dotted">
                {part}
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-semibold capitalize">{cleanWord}</h4>
                {jungMeaning && (
                  <div className="text-sm">
                    <span className="text-purple-400 font-medium">Юнг:</span> {jungMeaning.archetype} - {jungMeaning.meaning}
                  </div>
                )}
                {freudMeaning && (
                  <div className="text-sm">
                    <span className="text-pink-400 font-medium">Фройд:</span> {freudMeaning.category} - {freudMeaning.meaning}
                  </div>
                )}
                {userSymbol && (
                  <div className="text-sm border-t pt-2 mt-2">
                    <span className="text-green-400 font-medium">Моите бележки:</span> {userSymbol.notes || 'Няма'}
                  </div>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      }
      
      return part;
    });
  }, [dream, symbols]);

  const mixedAnalysis = analyses.find(a => a.approach === 'mixed');
  const jungAnalysis = analyses.find(a => a.approach === 'jung');
  const freudAnalysis = analyses.find(a => a.approach === 'freud');

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/60">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dream) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardContent className="py-16 text-center">
          <Moon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold">Сънят не беше намерен</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Dream Content */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {dream.mood && (
                  <span className="text-3xl">{MOOD_LABELS[dream.mood - 1].split(' ')[0]}</span>
                )}
                <div>
                  <CardTitle className="text-2xl">{dream.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4" />
                    {format(parseISO(dream.dream_date), 'd MMMM yyyy', { locale: bg })}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {dream.tags.map(tag => (
                  <Badge 
                    key={tag.id}
                    style={{ backgroundColor: `${tag.color}30`, color: tag.color, borderColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {highlightedBody}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              💡 Подчертаните думи са разпознати символи. Задръж курсора за повече информация.
            </p>
          </CardContent>
        </Card>

        {/* Analysis Tabs */}
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Анализ на съня
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRunAnalysis('mixed')}
                disabled={analysisLoading}
              >
                {analysisLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Анализирай
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1">
                <TabsTrigger value="summary" className="gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Резюме</span>
                </TabsTrigger>
                <TabsTrigger value="jung" className="gap-1">
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Юнг</span>
                </TabsTrigger>
                <TabsTrigger value="freud" className="gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Фройд</span>
                </TabsTrigger>
                <TabsTrigger value="symbols" className="gap-1">
                  <Moon className="w-4 h-4" />
                  <span className="hidden sm:inline">Символи</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Бележки</span>
                </TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="mt-4">
                {mixedAnalysis ? (
                  <div className="space-y-4">
                    <p className="text-foreground/90 whitespace-pre-wrap">{mixedAnalysis.summary}</p>
                    
                    {mixedAnalysis.themes && mixedAnalysis.themes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Теми</h4>
                        <div className="flex flex-wrap gap-2">
                          {mixedAnalysis.themes.map((theme, i) => (
                            <Badge key={i} variant="secondary">{theme}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {mixedAnalysis.confidence && (
                      <div className="text-sm text-muted-foreground">
                        Увереност: {Math.round(mixedAnalysis.confidence * 100)}%
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Натисни "Анализирай" за да получиш анализ на съня</p>
                  </div>
                )}
              </TabsContent>

              {/* Jung Tab */}
              <TabsContent value="jung" className="mt-4">
                {jungAnalysis || mixedAnalysis ? (
                  <div className="space-y-4">
                    {(jungAnalysis?.archetypes || mixedAnalysis?.archetypes || []).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-purple-400">Архетипи</h4>
                        <div className="flex flex-wrap gap-2">
                          {(jungAnalysis?.archetypes || mixedAnalysis?.archetypes || []).map((arch, i) => (
                            <Badge key={i} className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                              {arch}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(jungAnalysis?.key_symbols || mixedAnalysis?.key_symbols || []).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Юнгиански символи</h4>
                        <div className="grid gap-2">
                          {(jungAnalysis?.key_symbols || mixedAnalysis?.key_symbols || [])
                            .filter(s => JUNG_ARCHETYPES[s])
                            .map((symbol, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded bg-background/50">
                                <Badge variant="outline" className="capitalize">{symbol}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {JUNG_ARCHETYPES[symbol]?.meaning}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Анализирай съня за юнгиански интерпретации</p>
                  </div>
                )}
              </TabsContent>

              {/* Freud Tab */}
              <TabsContent value="freud" className="mt-4">
                {freudAnalysis || mixedAnalysis ? (
                  <div className="space-y-4">
                    {(freudAnalysis?.key_symbols || mixedAnalysis?.key_symbols || []).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-pink-400">Фройдистки символи</h4>
                        <div className="grid gap-2">
                          {(freudAnalysis?.key_symbols || mixedAnalysis?.key_symbols || [])
                            .filter(s => FREUD_SYMBOLS[s])
                            .map((symbol, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded bg-background/50">
                                <Badge variant="outline" className="capitalize bg-pink-500/10 border-pink-500/30">
                                  {symbol}
                                </Badge>
                                <div className="text-sm">
                                  <span className="text-pink-400">{FREUD_SYMBOLS[symbol]?.category}</span>
                                  <span className="text-muted-foreground"> - {FREUD_SYMBOLS[symbol]?.meaning}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Анализирай съня за фройдистки интерпретации</p>
                  </div>
                )}
              </TabsContent>

              {/* Symbols Tab */}
              <TabsContent value="symbols" className="mt-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Твой личен речник на символи. Добави значения, които са важни за теб.
                  </p>
                  
                  {symbols.length > 0 ? (
                    <div className="grid gap-2">
                      {symbols.map(symbol => (
                        <Card key={symbol.id} className="bg-background/50">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-medium capitalize">{symbol.symbol}</h5>
                                {symbol.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">{symbol.notes}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Moon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Още нямаш лични символи</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-4">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Добави лични бележки за този сън..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[150px] bg-background/50"
                  />
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Запази бележки
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

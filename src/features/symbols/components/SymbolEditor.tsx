// Symbol Editor Component

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus, X, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SymbolFormData, SymbolCategory, SymbolLogWithCategories } from '../types';

interface SymbolEditorProps {
  initialData?: SymbolLogWithCategories;
  categories: SymbolCategory[];
  onSubmit: (data: SymbolFormData) => Promise<void>;
  onCreateCategory: (name: string, color: string) => Promise<string | null>;
  isSubmitting?: boolean;
}

const INTENSITY_LABELS = [
  'Едва забележимо',
  'Леко забележимо',
  'Умерено',
  'Силно',
  'Много силно'
];

const CATEGORY_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

export function SymbolEditor({ 
  initialData, 
  categories, 
  onSubmit, 
  onCreateCategory,
  isSubmitting = false 
}: SymbolEditorProps) {
  const [symbol, setSymbol] = useState(initialData?.symbol || '');
  const [context, setContext] = useState(initialData?.context || '');
  const [intensity, setIntensity] = useState(initialData?.intensity || 3);
  const [loggedAt, setLoggedAt] = useState<Date>(
    initialData?.logged_at ? new Date(initialData.logged_at) : new Date()
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categories.map(c => c.id) || []
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol.trim()) return;

    await onSubmit({
      symbol: symbol.trim(),
      context: context.trim(),
      intensity,
      logged_at: loggedAt.toISOString(),
      category_ids: selectedCategoryIds
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setCreatingCategory(true);
    const id = await onCreateCategory(newCategoryName.trim(), newCategoryColor);
    if (id) {
      setSelectedCategoryIds(prev => [...prev, id]);
      setNewCategoryName('');
      setShowNewCategory(false);
    }
    setCreatingCategory(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {initialData ? 'Редактирай символ' : 'Запиши символ'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Символ / Събитие *</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="напр. видях гарван 3 пъти, 11:11 на часовника..."
              className="bg-background/50"
              required
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label htmlFor="context">Контекст</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Опиши ситуацията, мислите и чувствата си в този момент..."
              className="bg-background/50 min-h-[100px]"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Дата и час</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background/50",
                    !loggedAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {loggedAt ? format(loggedAt, 'PPP, HH:mm', { locale: bg }) : 'Избери дата'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={loggedAt}
                  onSelect={(date) => date && setLoggedAt(date)}
                  locale={bg}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Intensity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Интензивност</Label>
              <span className="text-sm text-muted-foreground">
                {INTENSITY_LABELS[intensity - 1]}
              </span>
            </div>
            <Slider
              value={[intensity]}
              onValueChange={([value]) => setIntensity(value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label>Категории</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategoryIds.includes(category.id) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  style={{
                    backgroundColor: selectedCategoryIds.includes(category.id) ? category.color : 'transparent',
                    borderColor: category.color,
                    color: selectedCategoryIds.includes(category.id) ? 'white' : category.color
                  }}
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.name}
                  {selectedCategoryIds.includes(category.id) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
              
              {!showNewCategory ? (
                <Badge
                  variant="outline"
                  className="cursor-pointer border-dashed hover:bg-primary/10"
                  onClick={() => setShowNewCategory(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Нова категория
                </Badge>
              ) : (
                <div className="flex items-center gap-2 w-full mt-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Име на категория"
                    className="flex-1 h-8 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                          newCategoryColor === color ? "border-foreground scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategoryColor(color)}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                  >
                    {creatingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Добави'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryName('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !symbol.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Записване...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {initialData ? 'Запази промените' : 'Запиши символ'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

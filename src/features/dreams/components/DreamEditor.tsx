import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Plus, X, Sparkles, Moon, Save, Loader2 } from 'lucide-react';
import { DreamTag, DreamFormData } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DreamEditorProps {
  initialData?: Partial<DreamFormData>;
  tags: DreamTag[];
  onSubmit: (data: DreamFormData) => Promise<void>;
  onCreateTag: (name: string, color: string) => Promise<DreamTag | null>;
  isSubmitting?: boolean;
}

const MOOD_LABELS = ['😰 Кошмар', '😟 Неспокоен', '😐 Неутрален', '😊 Приятен', '✨ Вълшебен'];
const TAG_COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

export function DreamEditor({ initialData, tags, onSubmit, onCreateTag, isSubmitting }: DreamEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [dreamDate, setDreamDate] = useState(initialData?.dream_date || new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<number | null>(initialData?.mood ?? 3);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialData?.tagIds || []);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [showNewTagDialog, setShowNewTagDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    await onSubmit({
      title: title.trim(),
      body: body.trim(),
      dream_date: dreamDate,
      mood,
      tagIds: selectedTagIds,
    });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    const tag = await onCreateTag(newTagName.trim(), newTagColor);
    if (tag) {
      setSelectedTagIds(prev => [...prev, tag.id]);
      setNewTagName('');
      setShowNewTagDialog(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Moon className="w-5 h-5 text-primary" />
            Запиши съня си
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title & Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Заглавие</Label>
              <Input
                id="title"
                placeholder="Дай име на съня си..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Дата на съня</Label>
              <Input
                id="date"
                type="date"
                value={dreamDate}
                onChange={(e) => setDreamDate(e.target.value)}
                className="bg-background/50"
                required
              />
            </div>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Описание на съня</Label>
            <Textarea
              id="body"
              placeholder="Опиши подробно какво се случи в съня... Включи емоции, хора, места, символи..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-background/50 min-h-[200px] resize-y"
              required
            />
          </div>

          {/* Mood Slider */}
          <div className="space-y-4">
            <Label>Настроение на съня</Label>
            <div className="px-2">
              <Slider
                value={[mood ?? 3]}
                onValueChange={([val]) => setMood(val)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                {MOOD_LABELS.map((label, i) => (
                  <span 
                    key={i} 
                    className={`${mood === i + 1 ? 'text-primary font-medium' : ''} text-xs sm:text-sm`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Тагове</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : 'transparent',
                    borderColor: tag.color,
                    color: selectedTagIds.includes(tag.id) ? 'white' : tag.color,
                  }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                  {selectedTagIds.includes(tag.id) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
              
              <Dialog open={showNewTagDialog} onOpenChange={setShowNewTagDialog}>
                <DialogTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer border-dashed hover:border-solid"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Нов таг
                  </Badge>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Създай нов таг</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Име на тага</Label>
                      <Input
                        placeholder="напр. Повтарящ се, Ясен, Летене..."
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Цвят</Label>
                      <div className="flex gap-2">
                        {TAG_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full transition-all ${newTagColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewTagColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      className="w-full"
                    >
                      Създай таг
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button 
          type="submit" 
          size="lg" 
          className="flex-1 gap-2"
          disabled={isSubmitting || !title.trim() || !body.trim()}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Запази съня
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          size="lg" 
          className="gap-2"
          disabled={isSubmitting || !body.trim()}
        >
          <Sparkles className="w-4 h-4" />
          Анализирай
        </Button>
      </div>
    </form>
  );
}

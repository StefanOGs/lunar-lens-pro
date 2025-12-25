import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dream, DreamTag, DreamWithTags, DreamFormData, DreamSymbol, DreamAnalysis } from '../types';
import { useToast } from '@/hooks/use-toast';
import { analyzeDream } from '../utils/dreamAnalyzer';

export function useDreams(userId: string | undefined) {
  const [dreams, setDreams] = useState<DreamWithTags[]>([]);
  const [tags, setTags] = useState<DreamTag[]>([]);
  const [symbols, setSymbols] = useState<DreamSymbol[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all dreams with tags
  const fetchDreams = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Fetch dreams
      const { data: dreamsData, error: dreamsError } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', userId)
        .order('dream_date', { ascending: false });
      
      if (dreamsError) throw dreamsError;
      
      // Fetch all tag mappings for user's dreams
      const dreamIds = dreamsData?.map(d => d.id) || [];
      
      if (dreamIds.length === 0) {
        setDreams([]);
        setLoading(false);
        return;
      }
      
      const { data: tagMaps, error: tagMapsError } = await supabase
        .from('dream_tag_map')
        .select('dream_id, tag_id')
        .in('dream_id', dreamIds);
      
      if (tagMapsError) throw tagMapsError;
      
      // Fetch all user tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('dream_tags')
        .select('*')
        .eq('user_id', userId);
      
      if (tagsError) throw tagsError;
      
      setTags(tagsData || []);
      
      // Combine dreams with tags
      const dreamsWithTags: DreamWithTags[] = (dreamsData || []).map(dream => {
        const dreamTagIds = tagMaps?.filter(tm => tm.dream_id === dream.id).map(tm => tm.tag_id) || [];
        const dreamTags = tagsData?.filter(t => dreamTagIds.includes(t.id)) || [];
        return { ...dream, tags: dreamTags };
      });
      
      setDreams(dreamsWithTags);
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно зареждане на сънища',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Fetch symbols
  const fetchSymbols = useCallback(async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('dream_symbols')
      .select('*')
      .eq('user_id', userId);
    
    if (!error && data) {
      setSymbols(data);
    }
  }, [userId]);

  // Create dream
  const createDream = async (data: DreamFormData): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      const { data: newDream, error } = await supabase
        .from('dreams')
        .insert({
          user_id: userId,
          title: data.title,
          body: data.body,
          dream_date: data.dream_date,
          mood: data.mood,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add tag mappings
      if (data.tagIds.length > 0) {
        const { error: tagError } = await supabase
          .from('dream_tag_map')
          .insert(data.tagIds.map(tagId => ({
            dream_id: newDream.id,
            tag_id: tagId,
          })));
        
        if (tagError) throw tagError;
      }
      
      toast({
        title: 'Успех',
        description: 'Сънят беше записан успешно',
      });
      
      await fetchDreams();
      return newDream.id;
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно записване на съня',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update dream
  const updateDream = async (dreamId: string, data: Partial<DreamFormData>): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.body !== undefined) updateData.body = data.body;
      if (data.dream_date !== undefined) updateData.dream_date = data.dream_date;
      if (data.mood !== undefined) updateData.mood = data.mood;
      
      const { error } = await supabase
        .from('dreams')
        .update(updateData)
        .eq('id', dreamId);
      
      if (error) throw error;
      
      // Update tags if provided
      if (data.tagIds !== undefined) {
        // Remove existing tags
        await supabase
          .from('dream_tag_map')
          .delete()
          .eq('dream_id', dreamId);
        
        // Add new tags
        if (data.tagIds.length > 0) {
          await supabase
            .from('dream_tag_map')
            .insert(data.tagIds.map(tagId => ({
              dream_id: dreamId,
              tag_id: tagId,
            })));
        }
      }
      
      toast({
        title: 'Успех',
        description: 'Сънят беше обновен успешно',
      });
      
      await fetchDreams();
      return true;
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно обновяване на съня',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete dream
  const deleteDream = async (dreamId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('dreams')
        .delete()
        .eq('id', dreamId);
      
      if (error) throw error;
      
      toast({
        title: 'Изтрито',
        description: 'Сънят беше изтрит',
      });
      
      await fetchDreams();
      return true;
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно изтриване',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Create tag
  const createTag = async (name: string, color: string = '#8B5CF6'): Promise<DreamTag | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('dream_tags')
        .insert({ user_id: userId, name, color })
        .select()
        .single();
      
      if (error) throw error;
      
      setTags(prev => [...prev, data]);
      return data;
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешно създаване на таг',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Run analysis
  const runAnalysis = async (dreamId: string, dreamText: string, approach: 'jung' | 'freud' | 'mixed' = 'mixed'): Promise<DreamAnalysis | null> => {
    try {
      const analysisData = await analyzeDream(dreamId, dreamText, approach);
      
      const { data, error } = await supabase
        .from('dream_analysis')
        .upsert({
          ...analysisData,
          key_symbols: analysisData.key_symbols,
          themes: analysisData.themes,
          archetypes: analysisData.archetypes,
        }, {
          onConflict: 'dream_id,approach'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Анализ готов',
        description: 'Анализът на съня е завършен',
      });
      
      return data as unknown as DreamAnalysis;
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message || 'Неуспешен анализ',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Get analysis for dream
  const getAnalysis = async (dreamId: string): Promise<DreamAnalysis[]> => {
    const { data, error } = await supabase
      .from('dream_analysis')
      .select('*')
      .eq('dream_id', dreamId);
    
    if (error) {
      console.error('Error fetching analysis:', error);
      return [];
    }
    
    return (data || []) as unknown as DreamAnalysis[];
  };

  // Create/update symbol
  const saveSymbol = async (symbol: string, meaningJung?: string, meaningFreud?: string, notes?: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { error } = await supabase
        .from('dream_symbols')
        .upsert({
          user_id: userId,
          symbol: symbol.toLowerCase(),
          meaning_jung: meaningJung,
          meaning_freud: meaningFreud,
          notes,
        }, {
          onConflict: 'user_id,symbol'
        });
      
      if (error) throw error;
      
      await fetchSymbols();
      return true;
    } catch (error: any) {
      toast({
        title: 'Грешка',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchDreams();
    fetchSymbols();
  }, [fetchDreams, fetchSymbols]);

  return {
    dreams,
    tags,
    symbols,
    loading,
    fetchDreams,
    createDream,
    updateDream,
    deleteDream,
    createTag,
    runAnalysis,
    getAnalysis,
    saveSymbol,
  };
}

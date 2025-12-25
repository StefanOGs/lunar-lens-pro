// Symbols Feature - Data Hook

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  SymbolLogWithCategories, 
  SymbolCategory, 
  SymbolInsight,
  PatternData,
  SymbolFormData,
  SymbolAnalysis
} from '../types';
import { analyzeSymbol } from '../utils/symbolAnalyzer';

export function useSymbols(userId?: string) {
  const [symbols, setSymbols] = useState<SymbolLogWithCategories[]>([]);
  const [categories, setCategories] = useState<SymbolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all symbols with categories
  const fetchSymbols = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Fetch symbols
      const { data: symbolsData, error: symbolsError } = await supabase
        .from('symbols_log')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false });

      if (symbolsError) throw symbolsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('symbol_categories')
        .select('*')
        .eq('user_id', userId);

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch symbol-category mappings
      const symbolIds = symbolsData?.map(s => s.id) || [];
      let mappings: { symbol_log_id: string; category_id: string }[] = [];
      
      if (symbolIds.length > 0) {
        const { data: mappingsData, error: mappingsError } = await supabase
          .from('symbol_map')
          .select('*')
          .in('symbol_log_id', symbolIds);

        if (mappingsError) throw mappingsError;
        mappings = mappingsData || [];
      }

      // Combine data
      const symbolsWithCategories: SymbolLogWithCategories[] = (symbolsData || []).map(symbol => ({
        ...symbol,
        categories: mappings
          .filter(m => m.symbol_log_id === symbol.id)
          .map(m => categoriesData?.find(c => c.id === m.category_id))
          .filter(Boolean) as SymbolCategory[]
      }));

      setSymbols(symbolsWithCategories);
    } catch (error: any) {
      console.error('Error fetching symbols:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно зареждане на символите',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchSymbols();
  }, [fetchSymbols]);

  // Create symbol
  const createSymbol = async (data: SymbolFormData): Promise<string | null> => {
    if (!userId) return null;

    try {
      // Insert symbol
      const { data: symbolData, error: symbolError } = await supabase
        .from('symbols_log')
        .insert({
          user_id: userId,
          symbol: data.symbol,
          context: data.context || null,
          intensity: data.intensity,
          logged_at: data.logged_at
        })
        .select()
        .single();

      if (symbolError) throw symbolError;

      // Insert category mappings
      if (data.category_ids.length > 0) {
        const mappings = data.category_ids.map(category_id => ({
          symbol_log_id: symbolData.id,
          category_id
        }));

        const { error: mappingError } = await supabase
          .from('symbol_map')
          .insert(mappings);

        if (mappingError) throw mappingError;
      }

      // Generate and save analysis
      const symbolWithCategories: SymbolLogWithCategories = {
        ...symbolData,
        categories: categories.filter(c => data.category_ids.includes(c.id))
      };

      const analysis = await analyzeSymbol(symbolWithCategories, symbols);
      
      await supabase
        .from('symbol_insights')
        .insert({
          symbol_log_id: symbolData.id,
          jung: analysis.jung,
          freud: analysis.freud,
          pattern: JSON.stringify(analysis.pattern)
        });

      toast({
        title: 'Успех',
        description: 'Символът е записан'
      });

      await fetchSymbols();
      return symbolData.id;
    } catch (error: any) {
      console.error('Error creating symbol:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно записване на символа',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Update symbol
  const updateSymbol = async (id: string, data: Partial<SymbolFormData>): Promise<boolean> => {
    try {
      const updateData: any = {};
      if (data.symbol !== undefined) updateData.symbol = data.symbol;
      if (data.context !== undefined) updateData.context = data.context || null;
      if (data.intensity !== undefined) updateData.intensity = data.intensity;
      if (data.logged_at !== undefined) updateData.logged_at = data.logged_at;

      const { error } = await supabase
        .from('symbols_log')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update category mappings if provided
      if (data.category_ids !== undefined) {
        // Delete existing mappings
        await supabase
          .from('symbol_map')
          .delete()
          .eq('symbol_log_id', id);

        // Insert new mappings
        if (data.category_ids.length > 0) {
          const mappings = data.category_ids.map(category_id => ({
            symbol_log_id: id,
            category_id
          }));

          await supabase
            .from('symbol_map')
            .insert(mappings);
        }
      }

      toast({
        title: 'Успех',
        description: 'Символът е обновен'
      });

      await fetchSymbols();
      return true;
    } catch (error: any) {
      console.error('Error updating symbol:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно обновяване на символа',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Delete symbol
  const deleteSymbol = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('symbols_log')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Успех',
        description: 'Символът е изтрит'
      });

      await fetchSymbols();
      return true;
    } catch (error: any) {
      console.error('Error deleting symbol:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно изтриване на символа',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Create category
  const createCategory = async (name: string, color: string = '#8B5CF6'): Promise<string | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('symbol_categories')
        .insert({ user_id: userId, name, color })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      return data.id;
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно създаване на категория',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Delete category
  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('symbol_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== id));
      await fetchSymbols(); // Refresh to update category references
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно изтриване на категория',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Get symbol with insight
  const getSymbolWithInsight = async (id: string): Promise<{ symbol: SymbolLogWithCategories; insight: SymbolInsight | null } | null> => {
    const symbol = symbols.find(s => s.id === id);
    if (!symbol) return null;

    try {
      const { data: insightData } = await supabase
        .from('symbol_insights')
        .select('*')
        .eq('symbol_log_id', id)
        .maybeSingle();

      const insight: SymbolInsight | null = insightData ? {
        ...insightData,
        pattern: (typeof insightData.pattern === 'string' ? JSON.parse(insightData.pattern) : insightData.pattern) as PatternData[]
      } : null;

      return { symbol, insight };
    } catch (error) {
      console.error('Error fetching insight:', error);
      return { symbol, insight: null };
    }
  };

  // Regenerate analysis
  const regenerateAnalysis = async (symbolId: string): Promise<boolean> => {
    const symbol = symbols.find(s => s.id === symbolId);
    if (!symbol) return false;

    try {
      const analysis = await analyzeSymbol(symbol, symbols);

      // Upsert insight
      const { error } = await supabase
        .from('symbol_insights')
        .upsert({
          symbol_log_id: symbolId,
          jung: analysis.jung,
          freud: analysis.freud,
          pattern: JSON.stringify(analysis.pattern)
        }, {
          onConflict: 'symbol_log_id'
        });

      if (error) throw error;

      toast({
        title: 'Успех',
        description: 'Анализът е обновен'
      });

      return true;
    } catch (error: any) {
      console.error('Error regenerating analysis:', error);
      toast({
        title: 'Грешка',
        description: 'Неуспешно обновяване на анализа',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    symbols,
    categories,
    loading,
    createSymbol,
    updateSymbol,
    deleteSymbol,
    createCategory,
    deleteCategory,
    getSymbolWithInsight,
    regenerateAnalysis,
    refetch: fetchSymbols
  };
}

// Symbols Feature - Types

export interface SymbolCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface SymbolLog {
  id: string;
  user_id: string;
  symbol: string;
  context: string | null;
  intensity: number;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export interface SymbolLogWithCategories extends SymbolLog {
  categories: SymbolCategory[];
}

export interface SymbolInsight {
  id: string;
  symbol_log_id: string;
  jung: string | null;
  freud: string | null;
  pattern: PatternData[];
  created_at: string;
}

export interface PatternData {
  symbol: string;
  count: number;
  dates: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface SymbolFormData {
  symbol: string;
  context: string;
  intensity: number;
  logged_at: string;
  category_ids: string[];
}

export interface SymbolAnalysis {
  jung: string;
  freud: string;
  pattern: PatternData[];
}

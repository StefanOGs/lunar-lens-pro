// Dream Types

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  body: string;
  dream_date: string;
  mood: number | null;
  created_at: string;
  updated_at: string;
}

export interface DreamTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DreamTagMap {
  dream_id: string;
  tag_id: string;
}

export interface DreamSymbol {
  id: string;
  user_id: string;
  symbol: string;
  meaning_jung: string | null;
  meaning_freud: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DreamAnalysisApproach = 'jung' | 'freud' | 'mixed';

export interface DreamAnalysis {
  id: string;
  dream_id: string;
  approach: DreamAnalysisApproach;
  summary: string | null;
  key_symbols: string[];
  themes: string[];
  archetypes: string[];
  confidence: number | null;
  created_at: string;
}

export interface DreamWithTags extends Dream {
  tags: DreamTag[];
}

export interface DreamWithAnalysis extends DreamWithTags {
  analysis: DreamAnalysis[];
}

// Form types
export interface DreamFormData {
  title: string;
  body: string;
  dream_date: string;
  mood: number | null;
  tagIds: string[];
}

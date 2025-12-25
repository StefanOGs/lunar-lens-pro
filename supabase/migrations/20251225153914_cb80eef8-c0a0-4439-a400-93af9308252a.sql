-- Create enum for analysis approach
CREATE TYPE public.dream_analysis_approach AS ENUM ('jung', 'freud', 'mixed');

-- Dreams table
CREATE TABLE public.dreams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  dream_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dream tags table
CREATE TABLE public.dream_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Dream-tag mapping (many-to-many)
CREATE TABLE public.dream_tag_map (
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.dream_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (dream_id, tag_id)
);

-- Dream symbols dictionary
CREATE TABLE public.dream_symbols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  meaning_jung TEXT,
  meaning_freud TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Dream analysis results
CREATE TABLE public.dream_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  approach dream_analysis_approach NOT NULL DEFAULT 'mixed',
  summary TEXT,
  key_symbols JSONB DEFAULT '[]'::jsonb,
  themes JSONB DEFAULT '[]'::jsonb,
  archetypes JSONB DEFAULT '[]'::jsonb,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dream_id, approach)
);

-- Indexes for performance
CREATE INDEX idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX idx_dreams_dream_date ON public.dreams(dream_date DESC);
CREATE INDEX idx_dreams_created_at ON public.dreams(created_at DESC);
CREATE INDEX idx_dream_tags_user_id ON public.dream_tags(user_id);
CREATE INDEX idx_dream_symbols_user_id ON public.dream_symbols(user_id);
CREATE INDEX idx_dream_symbols_symbol ON public.dream_symbols(symbol);
CREATE INDEX idx_dream_analysis_dream_id ON public.dream_analysis(dream_id);

-- Enable RLS on all tables
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_tag_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dreams
CREATE POLICY "Users can view their own dreams" ON public.dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dreams" ON public.dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams" ON public.dreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams" ON public.dreams
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dream_tags
CREATE POLICY "Users can view their own tags" ON public.dream_tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags" ON public.dream_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON public.dream_tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON public.dream_tags
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dream_tag_map (via dreams ownership)
CREATE POLICY "Users can view their dream tags mapping" ON public.dream_tag_map
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.dreams WHERE id = dream_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create their dream tags mapping" ON public.dream_tag_map
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.dreams WHERE id = dream_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete their dream tags mapping" ON public.dream_tag_map
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.dreams WHERE id = dream_id AND user_id = auth.uid())
  );

-- RLS Policies for dream_symbols
CREATE POLICY "Users can view their own symbols" ON public.dream_symbols
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own symbols" ON public.dream_symbols
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symbols" ON public.dream_symbols
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symbols" ON public.dream_symbols
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dream_analysis (via dreams ownership)
CREATE POLICY "Users can view their dream analysis" ON public.dream_analysis
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.dreams WHERE id = dream_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create their dream analysis" ON public.dream_analysis
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.dreams WHERE id = dream_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update their dream analysis" ON public.dream_analysis
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.dreams WHERE id = dream_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete their dream analysis" ON public.dream_analysis
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.dreams WHERE id = dream_id AND user_id = auth.uid())
  );

-- Trigger for updated_at on dreams
CREATE TRIGGER update_dreams_updated_at
  BEFORE UPDATE ON public.dreams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on dream_symbols
CREATE TRIGGER update_dream_symbols_updated_at
  BEFORE UPDATE ON public.dream_symbols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
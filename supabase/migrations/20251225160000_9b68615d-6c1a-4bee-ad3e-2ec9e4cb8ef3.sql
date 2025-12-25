
-- Create symbol_categories table
CREATE TABLE public.symbol_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create symbols_log table
CREATE TABLE public.symbols_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  context TEXT,
  intensity INTEGER DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create symbol_map junction table
CREATE TABLE public.symbol_map (
  symbol_log_id UUID NOT NULL REFERENCES public.symbols_log(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.symbol_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (symbol_log_id, category_id)
);

-- Create symbol_insights table
CREATE TABLE public.symbol_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol_log_id UUID NOT NULL REFERENCES public.symbols_log(id) ON DELETE CASCADE,
  jung TEXT,
  freud TEXT,
  pattern JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.symbol_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbols_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbol_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbol_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for symbol_categories
CREATE POLICY "Users can view their own categories" ON public.symbol_categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.symbol_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.symbol_categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.symbol_categories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for symbols_log
CREATE POLICY "Users can view their own symbols" ON public.symbols_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own symbols" ON public.symbols_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own symbols" ON public.symbols_log
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own symbols" ON public.symbols_log
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for symbol_map (via symbols_log ownership)
CREATE POLICY "Users can view their symbol mappings" ON public.symbol_map
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.symbols_log WHERE symbols_log.id = symbol_map.symbol_log_id AND symbols_log.user_id = auth.uid())
  );
CREATE POLICY "Users can create their symbol mappings" ON public.symbol_map
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.symbols_log WHERE symbols_log.id = symbol_map.symbol_log_id AND symbols_log.user_id = auth.uid())
  );
CREATE POLICY "Users can delete their symbol mappings" ON public.symbol_map
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.symbols_log WHERE symbols_log.id = symbol_map.symbol_log_id AND symbols_log.user_id = auth.uid())
  );

-- RLS policies for symbol_insights (via symbols_log ownership)
CREATE POLICY "Users can view their symbol insights" ON public.symbol_insights
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.symbols_log WHERE symbols_log.id = symbol_insights.symbol_log_id AND symbols_log.user_id = auth.uid())
  );
CREATE POLICY "Users can create their symbol insights" ON public.symbol_insights
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.symbols_log WHERE symbols_log.id = symbol_insights.symbol_log_id AND symbols_log.user_id = auth.uid())
  );
CREATE POLICY "Users can update their symbol insights" ON public.symbol_insights
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.symbols_log WHERE symbols_log.id = symbol_insights.symbol_log_id AND symbols_log.user_id = auth.uid())
  );
CREATE POLICY "Users can delete their symbol insights" ON public.symbol_insights
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.symbols_log WHERE symbols_log.id = symbol_insights.symbol_log_id AND symbols_log.user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX idx_symbols_log_user_id ON public.symbols_log(user_id);
CREATE INDEX idx_symbols_log_logged_at ON public.symbols_log(logged_at DESC);
CREATE INDEX idx_symbols_log_symbol ON public.symbols_log(symbol);
CREATE INDEX idx_symbol_categories_user_id ON public.symbol_categories(user_id);
CREATE INDEX idx_symbol_insights_symbol_log_id ON public.symbol_insights(symbol_log_id);

-- Trigger for updated_at
CREATE TRIGGER update_symbols_log_updated_at
  BEFORE UPDATE ON public.symbols_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

// Symbols Page - List and Quick Add

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { SymbolList, useSymbols } from '@/features/symbols';

export default function Symbols() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Дневник на символите | Eclyptica';
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { symbols, categories, loading: symbolsLoading } = useSymbols(user?.id);

  if (loading) {
    return (
      <Layout user={null}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Зареждане...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Синхроничност
            </h1>
            <p className="text-muted-foreground mt-1">
              Записвай и анализирай знаци от Вселената
            </p>
          </div>
          <Button onClick={() => navigate('/symbols/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Нов символ
          </Button>
        </div>

        {/* Symbol List */}
        <SymbolList
          symbols={symbols}
          categories={categories}
          loading={symbolsLoading}
          onSelect={(id) => navigate(`/symbols/${id}`)}
        />
      </div>
    </Layout>
  );
}

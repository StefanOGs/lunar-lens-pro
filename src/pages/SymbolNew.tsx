// New Symbol Page

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Layout from '@/components/Layout';
import { Sparkles } from 'lucide-react';
import { SymbolEditor, useSymbols, SymbolFormData } from '@/features/symbols';

export default function SymbolNew() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Нов символ | Eclyptica';
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

  const { categories, createSymbol, createCategory } = useSymbols(user?.id);

  const handleSubmit = async (data: SymbolFormData) => {
    setIsSubmitting(true);
    const id = await createSymbol(data);
    setIsSubmitting(false);
    
    if (id) {
      navigate(`/symbols/${id}`);
    }
  };

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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-primary" />
          Запиши символ
        </h1>

        <SymbolEditor
          categories={categories}
          onSubmit={handleSubmit}
          onCreateCategory={createCategory}
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  );
}

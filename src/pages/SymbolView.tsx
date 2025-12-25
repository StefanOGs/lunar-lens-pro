// Symbol View Page

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Layout from '@/components/Layout';
import { Sparkles } from 'lucide-react';
import { 
  SymbolDetail, 
  SymbolEditor,
  useSymbols, 
  SymbolLogWithCategories, 
  SymbolInsight,
  SymbolFormData
} from '@/features/symbols';

export default function SymbolView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState<SymbolLogWithCategories | null>(null);
  const [insight, setInsight] = useState<SymbolInsight | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { 
    symbols,
    categories, 
    getSymbolWithInsight, 
    updateSymbol,
    deleteSymbol, 
    regenerateAnalysis,
    createCategory
  } = useSymbols(user?.id);

  const loadSymbol = useCallback(async () => {
    if (!id || symbols.length === 0) return;
    
    setDetailLoading(true);
    const result = await getSymbolWithInsight(id);
    if (result) {
      setSymbol(result.symbol);
      setInsight(result.insight);
      document.title = `${result.symbol.symbol} | Eclyptica`;
    }
    setDetailLoading(false);
  }, [id, symbols, getSymbolWithInsight]);

  useEffect(() => {
    loadSymbol();
  }, [loadSymbol]);

  const handleDelete = async () => {
    if (!id) return;
    const success = await deleteSymbol(id);
    if (success) {
      navigate('/symbols');
    }
  };

  const handleRegenerate = async () => {
    if (!id) return;
    const success = await regenerateAnalysis(id);
    if (success) {
      await loadSymbol();
    }
  };

  const handleUpdate = async (data: SymbolFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    const success = await updateSymbol(id, data);
    setIsSubmitting(false);
    if (success) {
      setIsEditing(false);
      await loadSymbol();
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {isEditing && symbol ? (
          <>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-primary" />
              Редактирай символ
            </h1>
            <SymbolEditor
              initialData={symbol}
              categories={categories}
              onSubmit={handleUpdate}
              onCreateCategory={createCategory}
              isSubmitting={isSubmitting}
            />
          </>
        ) : (
          <SymbolDetail 
            symbol={symbol}
            insight={insight}
            loading={detailLoading}
            onBack={() => navigate('/symbols')}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onRegenerate={handleRegenerate}
            onAskInChat={() => {
              // TODO: Navigate to chat with context
              console.log('Ask in chat:', symbol);
            }}
          />
        )}
      </div>
    </Layout>
  );
}

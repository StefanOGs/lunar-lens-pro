import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Layout from '@/components/Layout';
import { Moon } from 'lucide-react';
import { DreamDetail, useDreams, DreamWithTags } from '@/features/dreams';
import { Helmet } from 'react-helmet';

export default function DreamView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dream, setDream] = useState<DreamWithTags | null>(null);
  const [dreamLoading, setDreamLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { dreams, symbols, runAnalysis, getAnalysis, saveSymbol } = useDreams(user?.id);

  // Find dream from cached dreams
  useEffect(() => {
    if (id && dreams.length > 0) {
      const found = dreams.find(d => d.id === id);
      setDream(found || null);
      setDreamLoading(false);
    } else if (id && user) {
      // Fetch single dream if not in cache
      const fetchDream = async () => {
        setDreamLoading(true);
        try {
          const { data: dreamData, error } = await supabase
            .from('dreams')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

          if (error || !dreamData) {
            setDream(null);
            setDreamLoading(false);
            return;
          }

          // Fetch tags
          const { data: tagMaps } = await supabase
            .from('dream_tag_map')
            .select('tag_id')
            .eq('dream_id', id);

          const tagIds = tagMaps?.map(tm => tm.tag_id) || [];

          const { data: tagsData } = await supabase
            .from('dream_tags')
            .select('*')
            .in('id', tagIds);

          setDream({
            ...dreamData,
            tags: tagsData || [],
          });
        } finally {
          setDreamLoading(false);
        }
      };

      fetchDream();
    }
  }, [id, dreams, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <Moon className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <Layout user={user}>
      <Helmet>
        <title>{dream?.title || 'Сън'} | Eclyptica</title>
        <meta name="description" content="Преглед и анализ на съня" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <DreamDetail 
          dream={dream}
          loading={dreamLoading}
          onRunAnalysis={runAnalysis}
          onGetAnalysis={getAnalysis}
          symbols={symbols}
          onSaveSymbol={saveSymbol}
        />
      </div>
    </Layout>
  );
}

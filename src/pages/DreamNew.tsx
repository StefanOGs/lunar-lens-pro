import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Layout from '@/components/Layout';
import { Moon } from 'lucide-react';
import { DreamEditor, useDreams, DreamFormData } from '@/features/dreams';

export default function DreamNew() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const { tags, createDream, createTag } = useDreams(user?.id);

  const handleSubmit = async (data: DreamFormData) => {
    setSubmitting(true);
    try {
      const dreamId = await createDream(data);
      if (dreamId) {
        navigate(`/dreams/${dreamId}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <Moon className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <Layout user={user}>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
          <Moon className="w-8 h-8 text-primary" />
          Запиши нов сън
        </h1>

        <DreamEditor 
          tags={tags}
          onSubmit={handleSubmit}
          onCreateTag={createTag}
          isSubmitting={submitting}
        />
      </div>
    </Layout>
  );
}

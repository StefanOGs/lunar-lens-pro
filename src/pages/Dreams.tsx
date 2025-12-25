import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Moon } from 'lucide-react';
import { DreamList, useDreams } from '@/features/dreams';
import { Helmet } from 'react-helmet';

export default function Dreams() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const { dreams, tags, loading: dreamsLoading, deleteDream } = useDreams(user?.id);

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
        <title>Дневник на сънищата | Eclyptica</title>
        <meta name="description" content="Записвай и анализирай сънищата си с юнгиански и фройдистки методи" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Moon className="w-8 h-8 text-primary" />
              Дневник на сънищата
            </h1>
            <p className="text-muted-foreground mt-1">
              Записвай, анализирай и разбирай сънищата си
            </p>
          </div>
          
          <Button onClick={() => navigate('/dreams/new')} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Нов сън
          </Button>
        </div>

        {/* Dreams List */}
        <DreamList 
          dreams={dreams} 
          tags={tags} 
          loading={dreamsLoading}
          onDelete={deleteDream}
        />
      </div>
    </Layout>
  );
}

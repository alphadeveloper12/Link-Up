import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string | null;
  created_at: string;
  skills_required: string[];
};

export function useProjects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) { setError(userErr.message); setLoading(false); return; }
    if (!user) { setError('You are not signed in.'); setLoading(false); return; }

    const { data, error: qErr } = await supabase
      .from('projects')
      .select('id, user_id, title, description, status, created_at, skills_required')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (qErr) setError(qErr.message);
    else setProjects(data || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, projects, error, refresh: load };
}
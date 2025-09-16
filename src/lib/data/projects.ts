// src/lib/data/projects.ts
import { supabase } from '@/lib/supabase';

export async function getProjectById(projectId?: string) {
  if (!projectId) return { data: null, error: null };

  // Use the new aggregated view
  const { data, error } = await supabase
    .from('project_dashboard_view')
    .select('*')
    .eq('id', projectId)
    .single();

  // If we need team data, fetch it separately from the view
  let teamData = [];
  if (data && !error) {
    const { data: teams } = await supabase
      .from('project_team_members_view')
      .select('*')
      .eq('project_id', projectId)
      .order('full_name', { ascending: true });
    teamData = teams || [];
  }

  return { data, error };
}
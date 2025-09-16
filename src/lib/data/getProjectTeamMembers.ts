import { supabase } from '@/lib/supabase';

export async function getProjectTeamMembers(projectId: string) {
  const { data, error } = await supabase
    .from('project_team_members_view')
    .select('*')
    .eq('project_id', projectId)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return { data: [], error };
  }
  return { data: data ?? [], error: null };
}
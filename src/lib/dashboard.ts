import { supabase } from '@/lib/supabase';

export type DashboardJson = {
  project: {
    id: string;
    title: string;
    description: string | null;
    user_id: string;
    skills_required: string[] | null;
    created_at: string;
  } | null;
  milestones: Array<any>;
  files: Array<any>;
  payments: Array<any>;
  events: Array<any>;
} | null;

export async function fetchProjectDashboard(projectId: string): Promise<DashboardJson> {
  const { data, error } = await supabase
    .from('project_dashboard_view')
    .select('*')
    .eq('id', projectId)
    .single();

  // Gracefully handle: 0 rows (PostgREST code PGRST116) or other errors
  if (error) {
    // log it so we can inspect in Famous console without crashing the page
    console.warn('get_project_dashboard error', error);
    // Most common: PGRST116 => return null so the UI can show "not found"
    return null;
  }

  return (data ?? null) as DashboardJson;
}
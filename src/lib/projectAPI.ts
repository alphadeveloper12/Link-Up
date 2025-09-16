import { supabase } from '@/lib/supabase';

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  skills_required: string[];
  created_at: string;
  status?: string | null;
  budget?: number;
  timeline?: string;
};

// Create a new project
export async function createProject({
  title,
  description,
  skills_required = []
}: {
  title: string;
  description?: string;
  skills_required?: string[];
}) {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw userErr || new Error('Not signed in');

  // Process skills input - handle both string and array formats
  const skillsArray = Array.isArray(skills_required) 
    ? skills_required 
    : typeof skills_required === 'string' 
    ? skills_required.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const { data, error } = await supabase.from('projects').insert({
    title,
    description: description ?? '',
    skills_required: skillsArray,
    user_id: user.id,
  }).select().single();

  if (error) throw error;
  return data;
}

// Update an existing project
export async function updateProject(
  projectId: string,
  updates: {
    title?: string;
    description?: string;
    skills_required?: string[];
    status?: string;
    budget?: number;
    timeline?: string;
  }
) {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw userErr || new Error('Not signed in');

  // Ensure skills_required is always an array
  if (updates.skills_required !== undefined) {
    updates.skills_required = Array.isArray(updates.skills_required) 
      ? updates.skills_required 
      : [];
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', user.id) // Ensure user owns the project
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get projects for the current user
export async function getUserProjects() {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw userErr || new Error('Not signed in');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get a single project by ID
// Get a single project by ID using dashboard view
export async function getProject(projectId: string) {
  const { data, error } = await supabase
    .from('project_dashboard_view')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

// Search projects by skills
export async function searchProjectsBySkills(skills: string[]) {
  if (!skills.length) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .contains('skills_required', skills)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Helper function to safely render skills
export function renderSkills(skills_required: any): string[] {
  return Array.isArray(skills_required) 
    ? skills_required 
    : (skills_required ? String(skills_required).split(',').map(s => s.trim()) : []);
}
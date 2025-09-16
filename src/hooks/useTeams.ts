import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  skills: string[];
  members: TeamMember[];
  availability_status: string;
  projects_completed: number;
  rating: number;
  hourly_rate: number;
  match_score?: number;
  matching_skills?: string[];
}

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchTeams = async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('match-teams', {
        body: { project_id: projectId },
      });

      if (error) throw error;
      setTeams(data.teams || []);
      return data.teams;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to match teams';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectTeam = async (projectId: string, teamId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('select-team', {
        body: { project_id: projectId, team_id: teamId },
      });

      if (error) throw error;
      return data.selection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select team';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    teams,
    loading,
    error,
    matchTeams,
    selectTeam
  };
};
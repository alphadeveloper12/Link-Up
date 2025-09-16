import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  description?: string;
  hourly_rate?: number;
  availability_status?: string;
  skills: string[];
  industry: string;
  rating: number;
  completed_projects: number;
  match_score: number;
  match_reason: string;
}

interface RecommendedTeamsProps {
  projectId?: string;
  requirements?: string;
  userPreferences?: string;
  maxTeams?: number;
}

export const RecommendedTeams: React.FC<RecommendedTeamsProps> = ({
  projectId,
  requirements,
  userPreferences,
  maxTeams = 3
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedTeams();
  }, [projectId, requirements]);

  const fetchRecommendedTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('match-teams', {
        body: { 
          project_id: projectId,
          requirements,
          user_preferences: userPreferences
        },
      });

      if (error) throw error;
      setTeams(data.teams.slice(0, maxTeams));
    } catch (error) {
      console.error('Error fetching recommended teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recommended Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recommended Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No team recommendations available at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Recommended Teams
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{team.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{team.rating}</span>
                    <Users className="h-4 w-4 ml-2" />
                    <span>{team.completed_projects} projects</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {team.match_score}% match
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{team.match_reason}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {team.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {team.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{team.skills.length - 3} more
                  </Badge>
                )}
              </div>
              
              <Button size="sm" className="w-full">
                View Team Profile
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
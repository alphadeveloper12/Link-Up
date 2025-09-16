import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Star, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  skills: string[];
  rating: number;
  match_score: number;
  match_reason: string;
}

export const SmartTeamSuggestions: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSmartSuggestions();
  }, []);

  const fetchSmartSuggestions = async () => {
    try {
      setLoading(true);
      
      // Mock data instead of calling the edge function
      const mockTeams = [
        {
          id: '1',
          name: 'WebDev Experts',
          skills: ['React', 'Node.js', 'TypeScript'],
          rating: 4.8,
          match_score: 95,
          match_reason: 'Perfect match for your recent web development projects'
        },
        {
          id: '2',
          name: 'Mobile Masters',
          skills: ['React Native', 'Flutter', 'iOS'],
          rating: 4.6,
          match_score: 88,
          match_reason: 'Great for mobile app development based on your preferences'
        }
      ];
      
      setTeams(mockTeams);
    } catch (error) {
      console.error('Error fetching smart suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Smart Team Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
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

  if (teams.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Smart Team Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{team.name}</h4>
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {team.match_score}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{team.rating}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{team.match_reason}</p>
              </div>
              <Button size="sm" variant="outline" className="ml-3 text-xs">
                View
              </Button>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
          See All Suggestions
        </Button>
      </CardContent>
    </Card>
  );
};
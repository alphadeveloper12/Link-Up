import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import RelevantProjects from '@/components/RelevantProjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Star, TrendingUp, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const TeamDashboard = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTeamData();
    }
  }, [user]);

  const fetchTeamData = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user?.id); // remove .single()

      if (error) throw error;

      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation /> */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {teams.length > 0 ? `${teams[0].name} Dashboard` : 'Team Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">
              {teams.length > 0 ? 'Find relevant projects and grow your business' : 'Create your team profile to get started'}
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {teams.length > 0 ? 'Edit Profile' : 'Create Profile'}
          </Button>
        </div>

        {teams.length > 0 ? (
          teams.map((team) => (
            <div key={team.id} className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{team.projects_completed || 0}</div>
                    <p className="text-xs text-muted-foreground">Total completed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Team Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">{team.rating || '0.0'}</div>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${team.hourly_rate || '0'}</div>
                    <p className="text-xs text-muted-foreground">per hour</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        team.availability_status === 'available' ? 'bg-green-500' :
                        team.availability_status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="capitalize text-sm font-medium">
                        {team.availability_status || 'Unknown'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <RelevantProjects 
                  teamSkills={team.skills || []} 
                  teamId={team.id}
                />
              </div>
            </div>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Team Dashboard</CardTitle>
              <CardDescription>Create your team profile to start finding relevant projects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Set up your team profile to showcase your skills, experience, and get matched with projects that fit your expertise.
              </p>
              <Button>Create Team Profile</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeamDashboard;

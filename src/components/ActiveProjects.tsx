import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, DollarSign, User, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ActiveProjectsProps {
  teamId: string;
}

const ActiveProjects: React.FC<ActiveProjectsProps> = ({ teamId }) => {
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchActiveProjects();
    }
  }, [teamId]);

  const fetchActiveProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('project_teams')
      .select(`
        *,
        projects!project_teams_project_id_fkey (
          id,
          title,
          description,
          budget,
          timeline,
          status,
          created_at,
          skills_required,
          users (
            id,
            full_name,
            email
          )
        )
      `)
      .eq('team_id', teamId)
      .in('status', ['active', 'in_progress']);

    if (error) throw error;
    setActiveProjects(data || []);
  } catch (error) {
    console.error('Error fetching active projects:', error);
    toast({
      title: 'Error',
      description: 'Failed to load active projects',
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateProgress = (project: any) => {
    if (!project.created_at || !project.timeline) return 0;

    const createdDate = new Date(project.created_at);
    const now = new Date();
    const daysElapsed = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let timelineDays = 30; // default
    if (project.timeline.includes('week')) {
      timelineDays = parseInt(project.timeline) * 7;
    } else if (project.timeline.includes('month')) {
      timelineDays = parseInt(project.timeline) * 30;
    }

    return Math.min((daysElapsed / timelineDays) * 100, 100);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading active projects...</p>
      </div>
    );
  }

  if (activeProjects.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Projects</h3>
          <p className="text-gray-600">
            You don't have any active projects at the moment. Check the relevant
            projects tab to find new opportunities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Active Projects</h2>
        <Badge variant="secondary" className="text-sm">
          {activeProjects.length} Active
        </Badge>
      </div>

      <div className="grid gap-6">
        {activeProjects.map((projectTeam) => {
          const project = projectTeam.projects; // still .projects
          const progress = calculateProgress(project);

          return (
            <Card key={projectTeam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        projectTeam.status
                      )}`}
                    ></div>
                    <Badge variant="outline" className="capitalize">
                      {projectTeam.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      ${project.budget?.toLocaleString() || 'TBD'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{project.timeline || 'TBD'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">
                      {project.users?.full_name || 'Client'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {project.skills_required && project.skills_required.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {project.skills_required.slice(0, 5).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {project.skills_required.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.skills_required.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    View Project
                  </Button>
                  <Button size="sm" variant="outline">
                    Update Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveProjects;

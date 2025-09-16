import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, DollarSign, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  timeline: string;
  skills_required: string[];
  location: string;
  created_at: string;
  user_id: string;
}

interface RelevantProjectsProps {
  teamSkills: string[];
  teamId: string;
}

const RelevantProjects: React.FC<RelevantProjectsProps> = ({ teamSkills, teamId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyingProject, setNotifyingProject] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRelevantProjects();
  }, [teamSkills]);

  const fetchRelevantProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter projects that match team skills
      const relevantProjects = data?.filter((project: Project) => {
        if (!project.skills_required || !Array.isArray(project.skills_required)) return false;
        return project.skills_required.some(skill => 
          teamSkills.some(teamSkill => 
            teamSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(teamSkill.toLowerCase())
          )
        );
      }) || [];

      setProjects(relevantProjects.slice(0, 6)); // Show top 6 matches
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const notifyClient = async (projectId: string) => {
    setNotifyingProject(projectId);
    try {
      const { data, error } = await supabase.functions.invoke('send-project-interest', {
        body: { projectId, teamId }
      });

      if (error) throw error;

      toast({
        title: "Interest Sent!",
        description: "The client has been notified of your interest in this project."
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setNotifyingProject(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relevant Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Projects Matching Your Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No matching projects found at the moment.
          </p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-lg">{project.title}</h4>
                  <div className="flex items-center gap-1 text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">${project.budget?.toLocaleString()}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.skills_required?.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {project.skills_required?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.skills_required.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {project.timeline}
                    </div>
                    {project.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => notifyClient(project.id)}
                    disabled={notifyingProject === project.id}
                    className="flex items-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    {notifyingProject === project.id ? 'Sending...' : 'Express Interest'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelevantProjects;
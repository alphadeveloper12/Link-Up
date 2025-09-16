import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, TrendingUp, Users } from 'lucide-react';
import ProjectChatPanel from '@/components/ProjectChatPanel';
import ProjectFileManager from '@/components/ProjectFileManager';
import ProjectMilestones from '@/components/ProjectMilestones';
import ProjectTeamManagement from '@/components/ProjectTeamManagement';
import ProjectOverview from '@/components/ProjectOverview';

type Project = {
  id: string;
  title: string;
  description: string | null;
  skills_required: string[];
  created_at: string;
  status: string;
  budget?: number;
};

export default function ProjectDashboardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      const { data, error } = await supabase
        .from('project_dashboard_view')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
      } else {
        setProject(data);
      }
      setLoading(false);
    }

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project || !projectId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <p className="mt-4 text-gray-600">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/projects')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-gray-600">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(project.skills_required) && project.skills_required.length > 0 ? (
                    project.skills_required.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))
                  ) : (
                    <Badge variant="outline">No skills specified</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <ProjectOverview 
                project={project}
                projectId={projectId}
                userId={user?.id || ''}
              />
            </TabsContent>


            <TabsContent value="chat" className="mt-6">
              <ProjectChatPanel
                projectId={projectId}
                userId={user?.id || ''}
                userName={user?.email?.split('@')[0] || 'User'}
                userAvatar={user?.user_metadata?.avatar_url}
              />
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <ProjectFileManager
                projectId={projectId}
                userId={user?.id || ''}
              />
            </TabsContent>

            <TabsContent value="milestones" className="mt-6">
              <ProjectMilestones
                projectId={projectId}
                userId={user?.id || ''}
                isClient={true}
              />
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <ProjectTeamManagement
                projectId={projectId}
                userId={user?.id || ''}
                isClient={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
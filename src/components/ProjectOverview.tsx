import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { getProjectTeamMembers } from '@/lib/data/getProjectTeamMembers';
import { supabase } from '@/lib/supabase';

interface ProjectOverviewProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    skills_required: string[];
    created_at: string;
    status: string;
    budget?: number;
  };
  projectId: string;
  userId: string;
}

interface Milestone {
  id: string;
  title: string;
  status: string;
  due_date: string;
}

interface TeamMember {
  team_member_id: string;
  team_id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  user_name: string;
}

export default function ProjectOverview({ project, projectId, userId }: ProjectOverviewProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch milestones
        const { data: milestonesData } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('due_date', { ascending: true });

        // Fetch team members using the new helper
        const { data: teamData } = await getProjectTeamMembers(projectId);

        setMilestones(milestonesData || []);
        setTeamMembers(teamData || []);

      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId]);

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-32 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Project Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Started</span>
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status</span>
                <Badge variant="outline">{project.status}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Budget</span>
                <span>${project.budget || 'Not set'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Completion</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {completedMilestones} of {totalMilestones} milestones completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 3).map((member) => (
                <Avatar key={member.user_id} className="border-2 border-background">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback>{member.full_name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
              {teamMembers.length > 3 && (
                <Avatar className="border-2 border-background">
                  <AvatarFallback>+{teamMembers.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
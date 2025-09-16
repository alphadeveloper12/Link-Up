import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamProfileForm } from '@/components/TeamProfileForm';
import ActiveProjects from '@/components/ActiveProjects';
import { ArrowLeft, Edit, Star, DollarSign, Users, CheckCircle, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SIGNUP_ROUTE, addParams, guessIntentFromRoute } from '@/utils/auth-helpers';

const TeamProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isNewTeam, setIsNewTeam] = useState(!teamId);

  // related projects state
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
  // new: notifying state
  const [notifyingProject, setNotifyingProject] = useState<string | null>(null);

  // auth redirect
  useEffect(() => {
    const isCreateRoute = location.pathname.includes('/create');
    if (isCreateRoute && !isAuthenticated && !authLoading) {
      const intent = guessIntentFromRoute();
      const authUrl = addParams(SIGNUP_ROUTE, {
        next: location.pathname + location.search,
        intent
      });
      navigate(authUrl);
      return;
    }

    if (isCreateRoute && isAuthenticated) {
      setIsNewTeam(true);
      setLoading(false);
    }
  }, [location, isAuthenticated, authLoading, navigate]);

  // fetch team
  useEffect(() => {
    if (teamId) {
      fetchTeam();
    } else {
      setLoading(false);
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      setTeam(data);
    } catch (error) {
      console.error('Error fetching team:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // fetch related projects when team skills loaded
  useEffect(() => {
    if (team?.skills?.length) {
      fetchRelatedProjects(team.skills);
    }
  }, [team]);

const fetchRelatedProjects = async (skills: string[]) => {
  if (!skills?.length) {
    setRelatedProjects([]);
    return;
  }

  try {
    const filters = skills.map((s) => `skills_required.cs.{${s}}`).join(',');

    // get current user to know which projects to exclude
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .neq('user_id', currentUserId) // 👈 exclude own projects
      .or(filters);

    if (error) throw error;
    setRelatedProjects(data);
  } catch (error) {
    console.error('Error fetching related projects:', error);
    toast({
      title: 'Error',
      description: 'Failed to load related projects',
      variant: 'destructive'
    });
  }
};



  // new: notify client function
  const notifyClient = async (projectId: string) => {
    setNotifyingProject(projectId);
    try {
      const { data, error } = await supabase.functions.invoke('send-project-interest', {
        body: { projectId, teamId }
      });

      if (error) throw error;

      toast({
        title: 'Interest Sent!',
        description: 'The client has been notified of your interest in this project.'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setNotifyingProject(null);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to save a team profile',
          variant: 'destructive'
        });
        return;
      }

      const teamData = {
        ...formData,
        user_id: user.id,
        name: formData.name || '',
        description: formData.description || '',
        hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
        availability_status: formData.availability_status || null,
        skills: formData.skills?.length ? formData.skills : [],
        industries: formData.industries?.length ? formData.industries : [],
        members: formData.members?.length ? formData.members : [],
        past_projects: formData.past_projects?.length ? formData.past_projects : [],
        testimonials: formData.testimonials?.length ? formData.testimonials : []
      };

      if (isNewTeam) {
        const { data, error } = await supabase
          .from('teams')
          .insert([teamData])
          .select()
          .single();

        if (error) throw error;

        setTeam(data);
        setIsNewTeam(false);
        toast({
          title: 'Success!',
          description: 'Team profile created successfully'
        });
        navigate(`/team-profile/${data.id}`);
      } else {
        const { data, error } = await supabase
          .from('teams')
          .update(teamData)
          .eq('id', teamId)
          .select()
          .single();

        if (error) throw error;

        setTeam(data);
        setIsEditing(false);
        toast({
          title: 'Success!',
          description: 'Team profile updated successfully'
        });
      }
    } catch (error: any) {
      console.error('Error saving team:', error);
      toast({
        title: 'Error',
        description: `Failed to save team profile: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading team profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNewTeam ? 'Create Team Profile' : team?.name || 'Team Profile'}
              </h1>
            </div>

            {!isNewTeam && !isEditing && (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isNewTeam || isEditing ? (
          <div className="max-w-4xl mx-auto">
            <TeamProfileForm
              initialData={team}
              onSave={handleSave}
              isEditing={!isNewTeam}
            />
            {!isNewTeam && (
              <div className="mt-6 flex justify-start">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="active">Active Projects</TabsTrigger>
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="projects">Past Projects</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {team?.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{team?.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            ${team?.hourly_rate}/hour
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">
                            {team?.projects_completed || 0} projects completed
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">
                            {team?.rating || '0.0'} rating
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600">
                            {team?.members?.length || 0} members
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Skills & Expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {team?.skills?.map((skill: string) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {team?.industries && team.industries.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Industries</h4>
                            <div className="flex flex-wrap gap-2">
                              {team.industries.map((industry: string) => (
                                <Badge key={industry} variant="outline">
                                  {industry}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Related Projects */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {relatedProjects.length > 0 ? (
                        <div className="space-y-4">
                          {relatedProjects.map((project) => (
                            <div key={project.id} className="border rounded-lg p-4">
                              <h4 className="font-semibold">{project.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {project.description}
                              </p>
                              {project.skills_required && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.skills_required.map((skill: string) => (
                                    <Badge
                                      key={skill}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {/* Added Express Interest Button */}
                              <div className="mt-3 flex justify-end">
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
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No related projects found.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="active">
              {teamId ? (
                <ActiveProjects teamId={teamId} />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-600">
                      Please save your team profile first to view active projects.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="members">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team?.members?.map((member: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-16 h-16 mx-auto mb-4">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name?.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                      {member.bio && (
                        <p className="text-sm text-gray-500">{member.bio}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>Past Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {team?.past_projects?.length > 0 ? (
                    <div className="space-y-4">
                      {team.past_projects.map((project: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold">{project.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {project.description}
                          </p>
                          {project.technologies && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech: string) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No past projects added yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testimonials">
              <Card>
                <CardHeader>
                  <CardTitle>Client Testimonials</CardTitle>
                </CardHeader>
                <CardContent>
                  {team?.testimonials?.length > 0 ? (
                    <div className="space-y-4">
                      {team.testimonials.map((testimonial: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <p className="text-gray-700 italic">
                            "{testimonial.content}"
                          </p>
                          <div className="mt-2 text-sm text-gray-600">
                            - {testimonial.client_name}
                            {testimonial.company && `, ${testimonial.company}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No testimonials added yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default TeamProfile;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, UserPlus, Mail, Phone, MessageCircle, Star } from 'lucide-react';
import { getProjectTeamMembers } from '@/lib/data/getProjectTeamMembers';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  skills: string[];
  rating: number;
  joined_at: string;
  status: 'active' | 'inactive';
}

interface ProjectTeamManagementProps {
  projectId: string;
  userId: string;
  isClient: boolean;
}

export default function ProjectTeamManagement({ projectId, userId, isClient }: ProjectTeamManagementProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: '',
    message: ''
  });

  useEffect(() => {
    fetchTeamMembers();
  }, [projectId]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await getProjectTeamMembers(projectId);

      if (error) throw error;

      const members = data?.map(item => ({
        id: item.user_id,
        name: item.full_name || 'Unknown',
        email: item.user_id, // We don't have email in the view, using user_id as placeholder
        role: item.role || 'Team Member',
        avatar_url: item.avatar_url,
        skills: [], // Skills would need to be added to the view if needed
        rating: 0, // Rating would need to be added to the view if needed
        joined_at: new Date().toISOString(), // Would need to be added to the view
        status: 'active' as const
      })) || [];

      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const inviteTeamMember = async () => {
    if (!inviteData.email.trim()) return;

    setInviting(true);
    try {
      // Send invitation email
      const { error } = await supabase.functions.invoke('resend-email', {
        body: {
          to: inviteData.email,
          subject: 'Project Team Invitation',
          html: `
            <h2>You've been invited to join a project team!</h2>
            <p>Role: ${inviteData.role}</p>
            <p>Message: ${inviteData.message}</p>
            <p>Click <a href="${window.location.origin}/projects/${projectId}">here</a> to join the project.</p>
          `
        }
      });

      if (error) throw error;
      
      toast.success('Team member invited successfully');
      setInviteData({ email: '', role: '', message: '' });
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const startVideoCall = (memberId: string) => {
    // In a real app, this would integrate with video calling service
    toast.info('Video call feature coming soon!');
  };

  const sendMessage = (memberId: string) => {
    // This would open the chat panel or direct message
    toast.info('Direct messaging feature coming soon!');
  };

  if (loading) {
    return <div className="p-4">Loading team members...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </div>
            {isClient && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    />
                    <Input
                      placeholder="Role (e.g., Developer, Designer)"
                      value={inviteData.role}
                      onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                    />
                    <Textarea
                      placeholder="Personal message (optional)"
                      value={inviteData.message}
                      onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                    />
                    <Button onClick={inviteTeamMember} disabled={inviting} className="w-full">
                      {inviting ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {teamMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No team members yet. Invite your first team member to get started.
              </p>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{member.name}</h4>
                        {member.rating > 0 && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-muted-foreground ml-1">
                              {member.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendMessage(member.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `mailto:${member.email}`}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startVideoCall(member.id)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {teamMembers.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(teamMembers.flatMap(m => m.skills)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique Skills</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
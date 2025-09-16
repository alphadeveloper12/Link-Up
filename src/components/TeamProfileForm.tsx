import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AIProfileAssistant } from './AIProfileAssistant';
import { AIPortfolioUploader } from './AIPortfolioUploader';
import { TeamMemberUploader } from './TeamMemberUploader';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { SIGNUP_ROUTE, TEAM_CREATE_ROUTE, DRAFT_TEAM_KEY, addParams } from '@/utils/auth-helpers';
import PdfToText from 'react-pdftotext';


interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio?: string;
  cv_url?: string;
}

interface TeamProfileFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  isEditing?: boolean;
}

export const TeamProfileForm: React.FC<TeamProfileFormProps> = ({
  initialData,
  onSave,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    skills: initialData?.skills || [],
    industries: initialData?.industries || [],
    hourly_rate: initialData?.hourly_rate || '',
    availability_status: initialData?.availability_status || 'available',
    members: initialData?.members || [{ name: '', role: '', avatar: '', bio: '' }],
    past_projects: initialData?.past_projects || [],
    testimonials: initialData?.testimonials || []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberFiles, setMemberFiles] = useState<Record<number, File | null>>({});

  // handle CV upload to Supabase Storage
  const handleMemberFileUpload = async (index: number, file: File) => {
    if (!file) return;

    // Sanitize file name
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `team-member-files/${Date.now()}-${sanitizedName}`;

    try {
      const { error } = await supabase.storage.from('project-files').upload(path, file);
      if (error) throw error;

      const { data: publicData } = supabase.storage.from('project-files').getPublicUrl(path);
      const publicUrl = publicData.publicUrl;

      handleMemberUpdate(index, { cv_url: publicUrl });
      setMemberFiles(prev => ({ ...prev, [index]: file }));

      toast({ title: 'File uploaded', description: 'CV uploaded successfully' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Upload failed', description: 'Could not upload CV', variant: 'destructive' });
    }
  };

  // call your backend to generate profile fields from CV
const handleGenerateAIProfile = async (index: number) => {
  setLoading(true);
  try {
    const member = formData.members[index];
    const file = memberFiles[index];
    if (!file) {
      toast({ title: 'Upload a CV first', description: 'Please upload a CV', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Extract text using react-pdftotext
    const fullText = await PdfToText(file);

    // Call ai-profile-assistant function with extracted text
    const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-profile-assistant', {
      body: {
        action: 'generate_ai_profile',
        data: { cv_text: fullText }
      }
    });

    if (aiError) throw aiError;

    const aiParsed = typeof aiData === 'string' ? JSON.parse(aiData) : aiData;

    if (aiParsed?.success) {
      handleMemberUpdate(index, {
        name: aiParsed.profile?.name || member.name,
        role: aiParsed.profile?.role || '',
        bio: aiParsed.profile?.bio || ''
      });

      toast({ title: 'AI Profile Generated', description: 'Profile fields filled from CV' });
    } else {
      toast({ title: 'AI generation failed', description: 'AI returned an error', variant: 'destructive' });
    }
  } catch (err: any) {
    console.error(err);
    toast({ title: 'AI generation failed', description: err.message || 'Something went wrong', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};





  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddIndustry = () => {
    if (newIndustry.trim() && !formData.industries.includes(newIndustry.trim())) {
      setFormData(prev => ({
        ...prev,
        industries: [...prev.industries, newIndustry.trim()]
      }));
      setNewIndustry('');
    }
  };

  const handleRemoveIndustry = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.filter(i => i !== industry)
    }));
  };

  const handleAddMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', role: '', avatar: '', bio: '' }]
    }));
  };

  const handleRemoveMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleMemberUpdate = (index: number, data: any) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) =>
        i === index ? { ...member, ...data } : member
      )
    }));
  };

  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isAuthenticated && !authLoading) {
      const draft = collectTeamDraft();
      sessionStorage.setItem(DRAFT_TEAM_KEY, JSON.stringify(draft));
      const url = addParams(SIGNUP_ROUTE, { next: TEAM_CREATE_ROUTE, intent: 'team' });
      toast({
        title: 'Please sign up to continue',
        description: 'Your team profile will be saved.'
      });
      navigate(url);
      return;
    }

    try {
      const teamData = {
        ...formData,
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

      sessionStorage.removeItem(DRAFT_TEAM_KEY);
      await onSave(teamData);
    } catch (error) {
      console.error('Error saving team profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const collectTeamDraft = () => {
    return {
      name: formData.name,
      description: formData.description,
      skills: formData.skills,
      industries: formData.industries,
      hourly_rate: formData.hourly_rate,
      availability_status: formData.availability_status,
      members: formData.members.map(m => ({ ...m, avatar: '' }))
    };
  };

  useEffect(() => {
    if (isAuthenticated && !isEditing) {
      const draftStr = sessionStorage.getItem(DRAFT_TEAM_KEY);
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          setFormData(prev => ({ ...prev, ...draft }));
        } catch (e) {
          console.error('Failed to parse draft data:', e);
        }
      }
    }
  }, [isAuthenticated, isEditing]);

  const handleAISuggestion = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectAdd = (project: any) => {
    setFormData(prev => ({
      ...prev,
      past_projects: [...prev.past_projects, project]
    }));
  };

  return (
    <div className="space-y-6">
      <AIProfileAssistant teamData={formData} onSuggestion={handleAISuggestion} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your team name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your team's expertise and approach"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))
                  }
                  placeholder="85"
                />
              </div>

              <div>
                <Label htmlFor="availability">Availability Status</Label>
                <Select
                  value={formData.availability_status}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, availability_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available Now</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={e =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddSkill())
                }
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleRemoveSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Industries */}
        <Card>
          <CardHeader>
            <CardTitle>Industries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newIndustry}
                onChange={e => setNewIndustry(e.target.value)}
                placeholder="Add an industry"
                onKeyPress={e =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddIndustry())
                }
              />
              <Button type="button" onClick={handleAddIndustry} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.industries.map(industry => (
                <Badge key={industry} variant="outline" className="flex items-center gap-1">
                  {industry}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleRemoveIndustry(industry)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.members.map((member, index) => (
              <div key={index} className="relative">
                <TeamMemberUploader
                  memberIndex={index}
                  member={member}
                  onMemberChange={handleMemberChange}
                  onMemberUpdate={handleMemberUpdate}
                />
                <div className="mt-2 flex gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={e => {
                      if (e.target.files?.[0])
                        handleMemberFileUpload(index, e.target.files[0]);
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!memberFiles[index]} // only enabled after upload
                    onClick={() => handleGenerateAIProfile(index)}
                  >
                    Generate AI Profile
                  </Button>
                </div>

                {formData.members.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(index)}
                    className="absolute top-2 right-2 z-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button type="button" onClick={handleAddMember} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>

        <AIPortfolioUploader onProjectAdd={handleProjectAdd} />

        {formData.past_projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.past_projects.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    {project.image_url && (
                      <img
                        src={project.image_url}
                        alt={project.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    {project.tags && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag: string, tagIndex: number) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="min-w-32">
            {loading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

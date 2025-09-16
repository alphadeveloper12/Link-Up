import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Video, MessageCircle, Calendar, ArrowLeft, Building2, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ChatPanel from './ChatPanel';
import MilestonesList from './MilestonesList';
import FileUpload from './FileUpload';
import ProjectProgress from './ProjectProgress';
import PersonalizedOnboarding from './PersonalizedOnboarding';
import ActivityFeed from './ActivityFeed';
import { AdvancedFileManager } from './AdvancedFileManager';
import { CalendarIntegration } from './CalendarIntegration';
import EscrowStatus from './EscrowStatus';
import PaymentHistory from './PaymentHistory';
import { SmartTeamSuggestions } from './SmartTeamSuggestions';
interface ProjectDashboardProps {
  project?: {
    name: string;
    description: string;
    timeline: string;
    budget: string;
    industry?: string;
  };
  team?: {
    name: string;
    members: Array<{
      name: string;
      role: string;
      avatar: string;
    }>;
  };
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ 
  project = {
    name: "E-commerce Platform",
    description: "Modern e-commerce platform with React, Node.js, and payment integration",
    timeline: "6 weeks",
    budget: "$15,000",
    industry: "E-commerce"
  },
  team = {
    name: "React Ninjas",
    members: [
      { name: "Sarah Chen", role: "Lead Developer", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" },
      { name: "Mike Rodriguez", role: "UI/UX Designer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
      { name: "Alex Kim", role: "Backend Developer", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }
    ]
  }
}) => {
  const navigate = useNavigate();
  const [escrowStatus, setEscrowStatus] = useState<'funded' | 'pending_submission' | 'pending_approval' | 'released'>('funded');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  const mockPayments = [
    {
      id: '1',
      milestone: 'Project Setup & Planning',
      amount: 3000,
      status: 'funded' as const,
      date: '2024-01-15',
      method: 'card' as const
    },
    {
      id: '2', 
      milestone: 'UI/UX Design Phase',
      amount: 4000,
      status: 'pending' as const,
      date: '2024-01-20',
      method: 'card' as const
    }
  ];

  const handleReleasePayment = () => {
    setEscrowStatus('released');
  };

  const generateSummary = async () => {
    if (!project.description.trim()) return;
    
    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-summarizer', {
        body: { text: project.description, type: 'project' }
      });
      
      if (error) throw error;
      setAiSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          
          <Card className="p-6">
            {aiSummary && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">AI Summary:</p>
                <p className="text-blue-700 text-sm">{aiSummary}</p>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSummary}
                    disabled={isGeneratingSummary}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    {isGeneratingSummary ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-1" />
                        Summarize with AI
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-gray-600 mb-4">{project.description}</p>
                {project.industry && (
                  <div className="mb-4">
                    <Badge className="bg-blue-100 text-blue-800 rounded-xl">
                      <Building2 className="w-3 h-3 mr-1" />
                      {project.industry}
                    </Badge>
                  </div>
                )}
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span>Timeline: {project.timeline}</span>
                  <span>Budget: {project.budget}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Video className="w-4 h-4 mr-2" />
                  Kickoff Call
                </Button>
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>
            
            {/* Team Section */}
            <div>
              <h3 className="font-semibold mb-3">Your Team: {team.name}</h3>
              <div className="flex space-x-4">
                {team.members.map((member, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectProgress />
            <MilestonesList />
            <AdvancedFileManager />
            <PaymentHistory payments={mockPayments} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <SmartTeamSuggestions />
            <PersonalizedOnboarding />
            <EscrowStatus 
              escrowBalance={3000}
              currentMilestone="Project Setup & Planning"
              status={escrowStatus}
              onReleasePayment={escrowStatus === 'pending_approval' ? handleReleasePayment : undefined}
            />
            <ActivityFeed />
            <CalendarIntegration />
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
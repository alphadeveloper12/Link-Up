import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, Bot, Loader2, Settings, Sparkles, MessageSquare, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ConfettiAnimation from './ConfettiAnimation';
import AIOnboardingChat from './AIOnboardingChat';

interface UserProfile {
  role: string;
  goals: string;
  projectType: string;
  experience: string;
  industry: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  icon: string;
  action?: string;
  aiGuidance?: string;
}

const PersonalizedOnboarding: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: '',
    goals: '',
    projectType: '',
    experience: 'Beginner',
    industry: ''
  });
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string>('');
  const [showChat, setShowChat] = useState(false);

  const generatePersonalizedChecklist = async () => {
    if (!userProfile.role || !userProfile.goals || !userProfile.projectType) {
      alert('Please fill in your role, goals, and project type to generate a personalized checklist.');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-onboarding', {
        body: {
          userProfile,
          action: 'generateChecklist'
        }
      });

      if (error) throw error;

      // Check if the response indicates success
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate checklist');
      }

      const generatedItems = data.result.map((item: any) => ({
        ...item,
        completed: false,
        icon: getIconComponent(item.icon)
      }));

      setItems(generatedItems);
    } catch (error) {
      console.error('Error generating checklist:', error);
      // Provide fallback checklist instead of just showing error
      const fallbackItems = [
        {
          id: '1',
          title: 'Complete Your Profile',
          description: 'Add your professional details and project preferences',
          completed: false,
          required: true,
          icon: getIconComponent('Settings')
        },
        {
          id: '2', 
          title: 'Define Your Goals',
          description: 'Set clear objectives for your project or business',
          completed: false,
          required: true,
          icon: getIconComponent('Sparkles')
        }
      ];
      setItems(fallbackItems);
    } finally {
      setIsGenerating(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'FileText': <CheckCircle className="w-4 h-4" />,
      'CreditCard': <CheckCircle className="w-4 h-4" />,
      'Users': <CheckCircle className="w-4 h-4" />,
      'MessageSquare': <MessageSquare className="w-4 h-4" />,
      'Settings': <Settings className="w-4 h-4" />,
      'Sparkles': <Sparkles className="w-4 h-4" />
    };
    return iconMap[iconName] || <CheckCircle className="w-4 h-4" />;
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const openAIChat = (stepTitle: string) => {
    setSelectedStep(stepTitle);
    setShowChat(true);
  };

  const completedCount = items.filter(item => item.completed).length;
  const isFullyComplete = completedCount === items.length && items.length > 0;

  useEffect(() => {
    if (isFullyComplete) {
      setShowConfetti(true);
    }
  }, [isFullyComplete]);

  return (
    <>
      <ConfettiAnimation show={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Setup</TabsTrigger>
            <TabsTrigger value="checklist">AI Checklist</TabsTrigger>
            <TabsTrigger value="guidance">AI Guidance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tell us about yourself</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Your Role</Label>
                  <Input
                    id="role"
                    value={userProfile.role}
                    onChange={(e) => setUserProfile({...userProfile, role: e.target.value})}
                    placeholder="e.g., Project Manager, Developer, Designer"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={userProfile.industry}
                    onChange={(e) => setUserProfile({...userProfile, industry: e.target.value})}
                    placeholder="e.g., E-commerce, Healthcare, Finance"
                  />
                </div>
                <div>
                  <Label htmlFor="goals">Primary Goals</Label>
                  <Input
                    id="goals"
                    value={userProfile.goals}
                    onChange={(e) => setUserProfile({...userProfile, goals: e.target.value})}
                    placeholder="e.g., Launch MVP, Scale business, Learn new skills"
                  />
                </div>
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Input
                    id="projectType"
                    value={userProfile.projectType}
                    onChange={(e) => setUserProfile({...userProfile, projectType: e.target.value})}
                    placeholder="e.g., Web App, Mobile App, Marketing Campaign"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select value={userProfile.experience} onValueChange={(value) => setUserProfile({...userProfile, experience: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={generatePersonalizedChecklist} 
                disabled={isGenerating}
                className="mt-4"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating AI Checklist...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Generate My Personalized Checklist
                  </>
                )}
              </Button>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Learn from the Best</span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Access AI-curated training modules from top-performing teams
                </p>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Explore Training Academy
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="checklist">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Your AI-Generated Checklist</h3>
                {items.length > 0 && (
                  <Badge variant={isFullyComplete ? "default" : "secondary"}>
                    {completedCount}/{items.length} Complete
                  </Badge>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Generate your personalized checklist from the Profile Setup tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {item.icon}
                          <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                            {item.title}
                          </h4>
                          {item.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                          {item.completed && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => openAIChat(item.title)}
                        >
                          <Bot className="w-3 h-3 mr-1" />
                          Get AI Help
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="guidance">
            {showChat && selectedStep ? (
              <AIOnboardingChat
                userProfile={userProfile}
                currentStep={selectedStep}
                onStepComplete={(stepId) => toggleItem(stepId)}
              />
            ) : (
              <Card className="p-6 text-center">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Click "Get AI Help" on any checklist item to start a conversation</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PersonalizedOnboarding;
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, FileText, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RecommendedTeams } from '@/components/RecommendedTeams';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';

const PostProject: React.FC = () => {
  const [step, setStep] = useState(1);
  const [projectSubmitted, setProjectSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    industry: '',
    customIndustry: '',
    skills: ''
  });
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { triggerProjectCreated } = useEmailAutomation();

  const createProject = async ({
    title,
    description,
    skills,
  }: {
    title: string;
    description?: string;
    skills?: string[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in');

    const skillsArray = Array.isArray(skills) 
      ? skills 
      : typeof skills === 'string' 
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const { data, error } = await supabase.from('projects').insert({
      title,
      description: description ?? '',
      skills_required: skillsArray,
      user_id: user.id,
    }).select().single();

    if (error) throw error;
    return data;
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        // Convert skills string to array
        const skillsArray = formData.skills
          .split(',')
          .map(skill => skill.trim())
          .filter(Boolean);

        await createProject({
          title: formData.projectName,
          description: formData.description,
          skills: skillsArray
        });

        await triggerProjectCreated(
          'client@example.com',
          'John Doe',  
          formData.projectName,
          '5000'
        );
      } catch (error) {
        console.error('Project creation failed:', error);
      }
      setProjectSubmitted(true);
    }
  };

  const generateSummary = async () => {
    if (!formData.description.trim()) return;
    
    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-summarizer', {
        body: { text: formData.description, type: 'project' }
      });
      
      if (error) throw error;
      setAiSummary(data?.summary || 'Summary generated successfully');
    } catch (error) {
      console.error('Error generating summary:', error);
      setAiSummary('AI summarization is temporarily unavailable. Your project description looks great!');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const progress = (step / 3) * 100;

  if (projectSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-purple-100 mb-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Posted Successfully!</h1>
              <p className="text-gray-600">Your project "{formData.projectName}" has been posted. Here are some recommended teams:</p>
            </div>
          </div>
          
          <RecommendedTeams 
            requirements={formData.description}
            userPreferences={`Industry: ${formData.industry}, Skills: ${formData.skills}`}
            maxTeams={5}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-purple-100">
          <div className="text-center mb-8">
            <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Your Project</h1>
            <p className="text-gray-600">Tell us about your project needs</p>
          </div>

          <Progress value={progress} className="mb-8" />

          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <Input
                  placeholder="e.g., Mobile App Development"
                  value={formData.projectName}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  className="rounded-2xl border-purple-200 focus:border-blue-500"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Project Description</label>
                <Textarea
                  placeholder="Describe your project requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="rounded-2xl border-purple-200 focus:border-blue-500 min-h-32"
                />
                
                {formData.description.trim() && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSummary}
                    disabled={isGeneratingSummary}
                    className="w-full rounded-2xl border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    {isGeneratingSummary ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Summary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Summarize with AI
                      </>
                    )}
                  </Button>
                )}
                
                {aiSummary && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                    <p className="text-sm font-medium text-blue-800 mb-1">AI Summary:</p>
                    <p className="text-blue-700">{aiSummary}</p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                  <SelectTrigger className="rounded-2xl border-purple-200 focus:border-blue-500">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-app-development">Web & App Development</SelectItem>
                    <SelectItem value="marketing-advertising">Marketing & Advertising</SelectItem>
                    <SelectItem value="interior-design">Interior Design</SelectItem>
                    <SelectItem value="architecture-construction">Architecture & Construction</SelectItem>
                    <SelectItem value="finance-accounting">Finance & Accounting</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.industry === 'other' && (
                  <Input
                    placeholder="Please specify your industry"
                    value={formData.customIndustry}
                    onChange={(e) => setFormData({...formData, customIndustry: e.target.value})}
                    className="rounded-2xl border-purple-200 focus:border-blue-500"
                  />
                )}

                <label className="block text-sm font-medium text-gray-700">Skills Required</label>
                <Input
                  placeholder="e.g., React, Node.js, UI/UX Design"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className="rounded-2xl border-purple-200 focus:border-blue-500"
                />
              </div>
            )}

            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl py-4 text-lg"
            >
              {step === 3 ? 'Find My Team' : 'Next'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostProject;
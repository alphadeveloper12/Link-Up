import React, { useState, useEffect, KeyboardEvent } from 'react';
import { X, FileText, Sparkles, Upload, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import SuccessModal from './SuccessModal';
import CustomDateTimeModal from './CustomDateTimeModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { SIGNUP_ROUTE, POST_PROJECT_ROUTE, DRAFT_PROJECT_KEY, addParams } from '@/utils/auth-helpers';
import PdfToText from 'react-pdftotext';

interface PostProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostProjectModal: React.FC<PostProjectModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    customIndustry: '',
    timeline: '',
    budget: '',
    files: null as FileList | null
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCustomDateTime, setShowCustomDateTime] = useState(false);
  const [error, setError] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadedFileObjects, setUploadedFileObjects] = useState<File[]>([]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const draftStr = sessionStorage.getItem(DRAFT_PROJECT_KEY);
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          setFormData(prev => ({ ...prev, ...draft, files: null }));
          if (draft.skills) setSkills(draft.skills.split(','));
        } catch (e) {
          console.error('Failed to parse draft data:', e);
        }
      }
    }
  }, [isOpen, isAuthenticated]);

  const collectProjectDraft = () => ({
    name: formData.name,
    description: formData.description,
    industry: formData.industry,
    customIndustry: formData.customIndustry,
    skills: skills.join(','),
    timeline: formData.timeline,
    budget: formData.budget
  });

  const validateForm = () => {
    if (!formData.name.trim()) return 'Project name is required';
    if (!formData.description.trim()) return 'Project description is required';
    if (!skills.length) return 'Please add at least one skill';
    return null;
  };

  const isFormComplete = () => {
    return (
      formData.name.trim() &&
      formData.description.trim() &&
      skills.length > 0 &&
      formData.industry.trim() &&
      (formData.industry !== 'other' || formData.customIndustry.trim()) &&
      formData.timeline.trim() &&
      formData.budget.trim() &&
      formData.files && formData.files.length > 0
    );
  };

  const createProject = async ({
    title,
    description,
    skillsArray,
  }: {
    title: string;
    description?: string;
    skillsArray?: string[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be signed in');

    const { data, error } = await supabase.from('projects').insert({
      title,
      description: description ?? '',
      skills_required: skillsArray,
      user_id: user.id,
    }).select().single();

    if (error) throw error;
    return data;
  };

  const uploadFiles = async (projectId: string, files: FileList) => {
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const filePath = `${projectId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      uploaded.push(publicData.publicUrl);
    }
    setUploadedUrls(uploaded);
    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!isFormComplete()) {
      setError('Please fill in all fields and upload at least one file.');
      return;
    }

    if (!isAuthenticated && !loading) {
      const draft = collectProjectDraft();
      sessionStorage.setItem(DRAFT_PROJECT_KEY, JSON.stringify(draft));
      const url = addParams(SIGNUP_ROUTE, { next: POST_PROJECT_ROUTE, intent: 'client' });
      toast({
        title: "Please sign up to continue",
        description: "Your project details will be saved."
      });
      navigate(url);
      return;
    }

    setIsSubmitting(true);

    try {
      const project = await createProject({
        title: formData.name,
        description: formData.description,
        skillsArray: skills
      });

      if (formData.files && formData.files.length > 0) {
        const urls = await uploadFiles(project.id, formData.files);
        await supabase
          .from('projects')
          .update({ file_urls: urls })
          .eq('id', project.id);
      }

      /** 🔹 ADD MILESTONES HERE */
      try {
  // 🔹 total budget as number
  const budgetValue =
    parseFloat(formData.budget.replace(/[^0-9.]/g, '')) || 0;

  // 🔹 the three percentages you want to apply
  const percentages = [30, 40, 30];

  // 🔹 build milestone objects
  const milestones = percentages.map((pct, idx) => {
    const amount = budgetValue * (pct / 100);
    return {
      project_id: project.id,
      order_index: idx + 1,
      title: `Milestone ${idx + 1}`,
      description: `Payment part ${idx + 1} - ${pct}% of budget ($${amount.toFixed(
        2
      )})`,
      percentage: pct, // 🔹 send percentage column
      amount: amount.toFixed(2), // 🔹 send amount column
      due_date: null // you can compute due dates if you want
    };
  });

  // 🔹 insert them into Supabase
  const { error: milestoneError } = await supabase
    .from('project_milestones')
    .insert(milestones);

  if (milestoneError) console.error('Milestone insert error', milestoneError);
} catch (mErr) {
  console.error('Milestone creation failed', mErr);
}

      /** 🔹 END MILESTONES */

      sessionStorage.removeItem(DRAFT_PROJECT_KEY);

      setShowSuccess(true);
      toast({
        title: "Project posted successfully!",
        description: "Finding your best-fit team..."
      });

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        navigate(`/team-match?projectId=${project.id}`);
      }, 2000);
    } catch (err) {
      setError('Failed to post project. Please try again.');
      console.error('Project submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setSelectedFiles(fileArray.map(f => f.name));

    // 🔹 Save actual file objects for later use in generateProject
    setUploadedFileObjects(fileArray);

    const uploadedUrls: string[] = [];

    for (const file of fileArray) {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `project-files/${Date.now()}-${sanitizedName}`;

      try {
        const { error } = await supabase.storage.from('project-files').upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
        if (error) throw error;

        const { data: publicData } = supabase.storage.from('project-files').getPublicUrl(path);
        uploadedUrls.push(publicData.publicUrl);
      } catch (err) {
        console.error(err);
        toast({ title: 'Upload failed', description: `Could not upload ${file.name}`, variant: 'destructive' });
      }
    }

    // Save uploaded URLs to state and formData
    setUploadedUrls(uploadedUrls);
    setFormData(prev => ({ ...prev, files: files }));

    toast({ title: 'Files uploaded', description: 'All files uploaded successfully!' });

    // ✅ Show Generate AI Project button
    if (uploadedUrls.length > 0) {
      setShowGenerateButton(true);
    }
  };

  const generateProject = async () => {
    if (uploadedFileObjects.length === 0) {
      toast({
        title: "Missing information",
        description: "Please upload at least one PDF to generate the project details",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      let combinedText = '';

      // Extract text from all uploaded PDF files
      for (const file of uploadedFileObjects) {
        try {
          const text = await PdfToText(file);
          combinedText += text + '\n\n';
        } catch (err) {
          console.error('PDF extraction failed for', file.name, err);
        }
      }

      const { data, error } = await supabase.functions.invoke('ai-profile-assistant', {
        body: {
          type: 'generate_project',
          projectData: {
            name: formData.name,
            description: formData.description,
            industry: formData.industry === 'other' ? formData.customIndustry : formData.industry,
            skills: skills,
            timeline: formData.timeline,
            budget: formData.budget,
            uploadedFiles: combinedText.trim(),
          }
        }
      });

      if (error) throw error;

      if (data?.project) {
        setFormData(prev => ({
          ...prev,
          name: data.project.title || prev.name,
          description: data.project.description || prev.description,
        }));
        if (data.project.skills && Array.isArray(data.project.skills)) {
          setSkills(data.project.skills);
        }

        toast({
          title: "Project generated!",
          description: "AI has generated the project details based on your inputs and PDFs"
        });
      }

    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !skills.includes(skill)) {
        setSkills([...skills, skill]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  if (!isOpen) return null;

  const isCustomTimeline =
    formData.timeline &&
    !['urgent', '1week', '1month', 'custom'].includes(formData.timeline);


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Post Your Project</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Project Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mobile App Development"
                className="h-12 rounded-xl border-2 border-purple-100"
              />
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Project Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project goals and requirements..."
                className="min-h-24 rounded-xl border-2 border-purple-100 resize-none"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Industry *</label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-purple-100">
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
                  value={formData.customIndustry}
                  onChange={(e) => setFormData({ ...formData, customIndustry: e.target.value })}
                  placeholder="Please specify your industry"
                  className="h-12 rounded-xl border-2 border-purple-100 mt-2"
                />
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Skills Required *</label>
              <div className="flex flex-wrap gap-2 border-2 border-purple-100 rounded-xl p-2 min-h-[50px]">
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-purple-200 text-purple-900 px-2 py-1 rounded-full">
                    {skill}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                  </div>
                ))}
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter"
                  className="border-none min-w-[120px] focus:ring-0 focus:outline-none h-8"
                />
              </div>
            </div>

            {/* Timeline & Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />Timeline *
                </label>
                <Select
                  value={isCustomTimeline ? 'custom' : formData.timeline}
                  onValueChange={(value) => {
                    if (value === 'custom') setShowCustomDateTime(true);
                    else setFormData({ ...formData, timeline: value });
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2 border-purple-100">
                    <SelectValue placeholder="Select timeline">
                      {isCustomTimeline ? `Custom: ${formData.timeline}` : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent (ASAP)</SelectItem>
                    <SelectItem value="1week">1 Week</SelectItem>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />Budget *
                </label>
                <Input
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g., $5,000 - $10,000"
                  className="h-12 rounded-xl border-2 border-purple-100"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Project Brief/Specs *
                </label>

                {showGenerateButton && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateProject}
                    disabled={generating}
                    className="ml-4"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    AI Generate Project
                  </Button>
                )}
              </div>

              

              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="h-12 rounded-xl border-2 border-dashed border-purple-200 flex items-center justify-center bg-purple-50 hover:bg-purple-100 transition-colors">
                  <span className="text-purple-600 text-sm">Click to upload files</span>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {selectedFiles.map((name, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Upload className="w-3 h-3 text-purple-500" />
                      {name}
                    </li>
                  ))}
                </ul>
              )}

              {/* {uploadedUrls.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-green-600">
                  {uploadedUrls.map((url, idx) => (
                    <li key={idx} className="truncate">
                      ✅ Uploaded:{" "}
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {url.split('/').pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              )} */}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isFormComplete()}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Find My Team'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Project Posted!"
        message="We're now matching you with the best teams…"
        buttonText="View Teams"
      />

      <CustomDateTimeModal
        isOpen={showCustomDateTime}
        onClose={() => setShowCustomDateTime(false)}
        onSave={(dateTime) => setFormData({ ...formData, timeline: dateTime })}
      />
    </div>
  );
};

export default PostProjectModal;

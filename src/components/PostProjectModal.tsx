import React, { useState, useEffect } from 'react';
import { X, FileText, Sparkles, Upload, Calendar, DollarSign } from 'lucide-react';
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
    skills: '',
    timeline: '',
    budget: '',
    files: null as FileList | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCustomDateTime, setShowCustomDateTime] = useState(false);
  const [error, setError] = useState('');

  // 🟢 added states
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Restore draft data on mount
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const draftStr = sessionStorage.getItem(DRAFT_PROJECT_KEY);
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          setFormData(prev => ({ ...prev, ...draft, files: null }));
        } catch (e) {
          console.error('Failed to parse draft data:', e);
        }
      }
    }
  }, [isOpen, isAuthenticated]);

  const collectProjectDraft = () => {
    return {
      name: formData.name,
      description: formData.description,
      industry: formData.industry,
      customIndustry: formData.customIndustry,
      skills: formData.skills,
      timeline: formData.timeline,
      budget: formData.budget
    };
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Project name is required';
    if (!formData.description.trim()) return 'Project description is required';
    if (!formData.skills.trim()) return 'Skills required field is required';
    return null;
  };

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

  // Helper to upload files to Supabase Storage
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
    setUploadedUrls(uploaded); // 🟢 store uploaded URLs
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

    // Check authentication before proceeding
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
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean);

      // 1. create the project row
      const project = await createProject({
        title: formData.name,
        description: formData.description,
        skills: skillsArray
      });

      // 2. upload files if any
      if (formData.files && formData.files.length > 0) {
        const urls = await uploadFiles(project.id, formData.files);

        // 3. update project row with file URLs (if you added column)
        await supabase
          .from('projects')
          .update({ file_urls: urls })
          .eq('id', project.id);
      }

      // Clear draft on successful submission
      sessionStorage.removeItem(DRAFT_PROJECT_KEY);

      setShowSuccess(true);
      toast({
        title: "Project posted successfully!",
        description: "Finding your best-fit team..."
      });

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        navigate('/team-match');
      }, 2000);
    } catch (err) {
      setError('Failed to post project. Please try again.');
      console.error('Project submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟢 handle file input and show names
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFormData({ ...formData, files });
    if (files) {
      const names = Array.from(files).map(f => f.name);
      setSelectedFiles(names);
    } else {
      setSelectedFiles([]);
    }
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
            {/* Project name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Project Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mobile App Development"
                className="h-12 rounded-xl border-2 border-purple-100"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Project Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project goals and requirements..."
                className="min-h-24 rounded-xl border-2 border-purple-100 resize-none"
                required
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Industry</label>
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">Skills Required</label>
              <Input
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., React, Node.js, UI/UX Design"
                className="h-12 rounded-xl border-2 border-purple-100"
                required
              />
            </div>

            {/* Timeline and budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />Timeline
                </label>
                <Select
                  value={isCustomTimeline ? 'custom' : formData.timeline}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setShowCustomDateTime(true);
                    } else {
                      setFormData({ ...formData, timeline: value });
                    }
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
                  <DollarSign className="w-4 h-4 inline mr-1" />Budget (Optional)
                </label>
                <Input
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g., $5,000 - $10,000"
                  className="h-12 rounded-xl border-2 border-purple-100"
                />
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Upload className="w-4 h-4 inline mr-1" />Project Brief/Specs (Optional)
              </label>
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

              {/* 🟢 show selected file names */}
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

              {/* 🟢 show uploaded file URLs */}
              {uploadedUrls.length > 0 && (
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
              )}
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
                disabled={isSubmitting}
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
        onSave={(dateTime) => {
          setFormData({ ...formData, timeline: dateTime });
        }}
      />
    </div>
  );
};

export default PostProjectModal;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Project {
  id: string;
  title: string;
  description: string;
  skills_required: string[];
  status: string;
  created_at: string;
  budget?: number;
  timeline?: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('Project ID is required');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, description, skills_required, status, created_at, budget, timeline')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Project not found');
          } else {
            setError(`Error: ${error.message}`);
          }
          setProject(null);
        } else {
          setProject(data);
        }
      } catch (err) {
        setError('Failed to fetch project');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-32 mb-6" />
          <Card className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-1/3" />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Card className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Card className="p-6">
            <p className="text-gray-600">Project not found</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.title}</h1>
            <Badge 
              variant={project.status === 'open' ? 'default' : 'secondary'}
              className="mb-4"
            >
              {project.status}
            </Badge>
          </div>

          {project.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(project.skills_required) && project.skills_required.length > 0 ? (
                project.skills_required.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No specific skills listed</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {project.budget && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Budget: ${project.budget.toLocaleString()}</span>
              </div>
            )}
            
            {project.timeline && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Timeline: {project.timeline}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate(`/project-dashboard/${id}`)}
            >
              Apply to Project
            </Button>
            <Button variant="outline">
              Save Project
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;
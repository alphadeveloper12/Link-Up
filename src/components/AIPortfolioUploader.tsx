import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Sparkles, Loader2, Image } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIPortfolioUploaderProps {
  onProjectAdd: (project: any) => void;
}

export function AIPortfolioUploader({ onProjectAdd }: AIPortfolioUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  const analyzeWithAI = async () => {
    if (!imageUrl) return;

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-portfolio-analyzer', {
        body: {
          imageUrl,
          projectName,
          description
        }
      });

      if (data?.success) {
        try {
          const analysisData = JSON.parse(data.analysis);
          setAnalysis(analysisData);
        } catch {
          setAnalysis({ highlight: data.analysis });
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }
    setAnalyzing(false);
  };

  const addProject = () => {
    const project = {
      name: projectName,
      description: analysis?.highlight || description,
      image_url: imageUrl,
      tags: analysis?.tags || [],
      technologies: analysis?.technologies || []
    };
    onProjectAdd(project);
    
    // Reset form
    setProjectName('');
    setDescription('');
    setImageUrl('');
    setAnalysis(null);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          AI Portfolio Uploader
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="portfolio-upload"
            />
            <label htmlFor="portfolio-upload">
              <Button
                variant="outline"
                disabled={uploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload Image
                </span>
              </Button>
            </label>
          </div>
        </div>

        <Textarea
          placeholder="Project description (optional - AI can generate this)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {imageUrl && (
          <div className="space-y-4">
            <img src={imageUrl} alt="Project" className="w-full h-48 object-cover rounded-lg" />
            
            <Button
              onClick={analyzeWithAI}
              disabled={analyzing}
              className="w-full"
              variant="outline"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Auto-Generate Project Highlights
            </Button>
          </div>
        )}

        {analysis && (
          <div className="p-4 bg-blue-50 rounded-lg space-y-3">
            <h4 className="font-medium text-blue-700">AI Analysis:</h4>
            <p className="text-sm">{analysis.highlight}</p>
            
            {analysis.tags && (
              <div>
                <span className="text-sm font-medium">Tags: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysis.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {analysis.technologies && (
              <div>
                <span className="text-sm font-medium">Technologies: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysis.technologies.map((tech: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={addProject}
          disabled={!projectName || !imageUrl}
          className="w-full"
        >
          Add to Portfolio
        </Button>
      </CardContent>
    </Card>
  );
}
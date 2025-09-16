import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, FileText, Image, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIFileAnalyzerProps {
  fileName: string;
  fileUrl: string;
  fileType: string;
  onAnalysisComplete?: (analysis: string) => void;
}

export const AIFileAnalyzer: React.FC<AIFileAnalyzerProps> = ({
  fileName,
  fileUrl,
  fileType,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-file-analyzer', {
        body: {
          fileUrl,
          fileName,
          fileType,
          analysisType: 'comprehensive'
        }
      });

      if (functionError) throw functionError;

      setAnalysis(data.analysis);
      onAnalysisComplete?.(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFileIcon = () => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
        
        <Badge variant="secondary" className="flex items-center gap-1">
          {getFileIcon()}
          {fileType.split('/')[1]?.toUpperCase() || 'FILE'}
        </Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {analysis}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
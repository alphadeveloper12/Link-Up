import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Star, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProposalCardProps {
  proposal: {
    id: string;
    teamName: string;
    description: string;
    budget: string;
    timeline: string;
    rating: number;
  };
  autoSummarize?: boolean;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, autoSummarize = false }) => {
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  React.useEffect(() => {
    if (autoSummarize && proposal.description) {
      generateSummary();
    }
  }, [autoSummarize, proposal.description]);

  const generateSummary = async () => {
    if (!proposal.description.trim()) return;
    
    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-summarizer', {
        body: { text: proposal.description, type: 'proposal' }
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
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {aiSummary && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-1">AI Summary:</p>
          <p className="text-green-700 text-sm">{aiSummary}</p>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{proposal.teamName}</h3>
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{proposal.rating}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">{proposal.budget}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">{proposal.timeline}</span>
            </div>
          </div>
        </div>
        
        {!autoSummarize && (
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
        )}
      </div>
      
      <p className="text-gray-600 mb-4">{proposal.description}</p>
      
      <div className="flex justify-between items-center">
        <Badge variant="secondary">Proposal</Badge>
        <div className="space-x-2">
          <Button variant="outline" size="sm">View Details</Button>
          <Button size="sm">Accept Proposal</Button>
        </div>
      </div>
    </Card>
  );
};

export default ProposalCard;
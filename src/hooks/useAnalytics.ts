import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface PerformanceMetrics {
  industry: string;
  avgCompletionTime: number;
  avgRating: number;
  projectCount: number;
  topPractices: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  industry: string;
  content: string;
  practices: string[];
  aiGenerated: boolean;
  approved: boolean;
}

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([
    {
      industry: 'Software Development',
      avgCompletionTime: 14.5,
      avgRating: 4.7,
      projectCount: 156,
      topPractices: ['Agile methodology', 'Daily standups', 'Code reviews']
    },
    {
      industry: 'Design',
      avgCompletionTime: 8.2,
      avgRating: 4.8,
      projectCount: 89,
      topPractices: ['User research', 'Prototyping', 'Design systems']
    }
  ]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const generateTrainingContent = async (industry: string) => {
    const newModule: TrainingModule = {
      id: Date.now().toString(),
      title: `Best Practices for ${industry}`,
      industry,
      content: `AI-generated training module for ${industry} teams.`,
      practices: ['Structured workflows', 'Performance tracking', 'Clear communication'],
      aiGenerated: true,
      approved: false
    };
    setTrainingModules(prev => [...prev, newModule]);
  };

  const approveTrainingModule = async (moduleId: string) => {
    setTrainingModules(prev => 
      prev.map(module => 
        module.id === moduleId ? { ...module, approved: true } : module
      )
    );
  };

  return {
    metrics,
    trainingModules,
    loading,
    generateInsights,
    generateTrainingContent,
    approveTrainingModule
  };
};

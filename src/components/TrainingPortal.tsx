import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Award, Users, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TrainingModuleCard } from './TrainingModuleCard';

interface TrainingModule {
  id: string;
  title: string;
  industry: string;
  content: string;
  practices?: string[];
  topTeams?: any[];
  aiGenerated: boolean;
  approved: boolean;
  createdAt: string;
}

export const TrainingPortal: React.FC = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const industries = ['all', 'Software Development', 'Design', 'Marketing', 'Content Creation'];

  useEffect(() => {
    fetchTrainingModules();
  }, []);

  const fetchTrainingModules = async () => {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching training modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = selectedIndustry === 'all' 
    ? modules 
    : modules.filter(m => m.industry === selectedIndustry);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading training modules...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Training Academy
        </h1>
        <p className="text-muted-foreground">
          Learn from the best teams and master industry best practices
        </p>
      </div>

      <div className="mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Learn from Top Performers</h3>
                <p className="text-blue-700">
                  AI-curated insights from the highest-rated teams in each industry
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedIndustry} onValueChange={setSelectedIndustry} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {industries.map((industry) => (
            <TabsTrigger key={industry} value={industry} className="capitalize">
              {industry === 'all' ? 'All Industries' : industry}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedIndustry} className="space-y-6">
          {filteredModules.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No training modules yet</h3>
                <p className="text-muted-foreground">
                  Training modules will appear here once they're created and approved.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredModules.map((module) => (
                <TrainingModuleCard key={module.id} module={module} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Users, Award, Brain } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AIInsightsDashboard from './AIInsightsDashboard';

interface TeamData {
  name: string;
  rating: number;
  completionRate: number;
  avgTime: number;
}

interface AnalyticsData {
  topTeams: TeamData[];
  insights: string;
  industry: string;
}

const AdminAnalytics: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingTraining, setCreatingTraining] = useState(false);

  const industries = [
    'Software Development',
    'Design',
    'Marketing',
    'Content Creation',
    'Data Science'
  ];

  const analyzeTeams = async () => {
    if (!selectedIndustry) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analytics-insights', {
        body: { action: 'analyze_teams', industry: selectedIndustry },
      });

      if (error) throw error;
      setAnalyticsData(data);
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTrainingModule = async () => {
    if (!analyticsData) return;
    
    setCreatingTraining(true);
    try {
      const { data, error } = await supabase.functions.invoke('analytics-insights', {
        body: { 
          action: 'create_training', 
          industry: selectedIndustry,
          teamData: analyticsData
        },
      });

      if (error) throw error;
      
      // Save to training_modules table
      const { error: dbError } = await supabase
        .from('training_modules')
        .insert([data]);

      if (dbError) throw dbError;
      
      alert('Training module created successfully!');
    } catch (error) {
      console.error('Training creation error:', error);
    } finally {
      setCreatingTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="platform-insights" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="platform-insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Platform Insights
          </TabsTrigger>
          <TabsTrigger value="team-analysis" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform-insights">
          <AIInsightsDashboard />
        </TabsContent>

        <TabsContent value="team-analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Team Performance Analytics
              </CardTitle>
              <CardDescription>
                Analyze top-performing teams and generate training insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={analyzeTeams} disabled={!selectedIndustry || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Analyze Teams
                </Button>
              </div>

              {analyticsData && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Top Performing Teams - {analyticsData.industry}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {analyticsData.topTeams.map((team, index) => (
                          <div key={team.name} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary">#{index + 1}</Badge>
                              <div>
                                <p className="font-medium">{team.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {team.avgTime} days avg • {team.completionRate}% completion
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {team.rating}/5
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Generated Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {analyticsData.insights}
                      </p>
                      <div className="mt-4">
                        <Button onClick={createTrainingModule} disabled={creatingTraining}>
                          {creatingTraining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Create Training Module
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Users, Workflow, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Insight {
  id: string;
  type: 'trend' | 'performance' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

interface TeamCluster {
  industry: string;
  teams: any[];
  avgRating: number;
  successRate: number;
  topSkills: string[];
}

const AIAnalyticsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [clusters, setClusters] = useState<TeamCluster[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Fetch project data
      const { data: projects } = await supabase.from('projects').select('id, title, description, status, created_at, skills_required, user_id');
      const { data: teams } = await supabase.from('teams').select('id, name, description, skills, rating, created_at, user_id');
      
      const { data, error } = await supabase.functions.invoke('analytics-insights', {
        body: { 
          action: 'generateInsights',
          data: { projects, teams }
        }
      });

      if (error) throw error;
      
      // Parse insights from GPT-4o response
      const parsedInsights = parseInsights(data.insights);
      setInsights(parsedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const clusterTeams = async () => {
    setLoading(true);
    try {
      const { data: teams } = await supabase.from('teams').select('id, name, description, skills, rating, created_at, user_id');
      
      const { data, error } = await supabase.functions.invoke('analytics-insights', {
        body: { 
          action: 'clusterTeams',
          data: { teams }
        }
      });

      if (error) throw error;
      
      const parsedClusters = parseClusters(data.clusters);
      setClusters(parsedClusters);
    } catch (error) {
      console.error('Error clustering teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractWorkflows = async () => {
    setLoading(true);
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('*, teams(*)')
        .eq('status', 'completed')
        .gte('rating', 4.5);
      
      const { data, error } = await supabase.functions.invoke('analytics-insights', {
        body: { 
          action: 'extractWorkflows',
          data: projects
        }
      });

      if (error) throw error;
      
      const parsedWorkflows = parseWorkflows(data.workflows);
      setWorkflows(parsedWorkflows);
    } catch (error) {
      console.error('Error extracting workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseInsights = (text: string): Insight[] => {
    // Simple parsing - in production, use more sophisticated parsing
    const lines = text.split('\n').filter(line => line.trim());
    return lines.slice(0, 5).map((line, index) => ({
      id: `insight-${index}`,
      type: index % 3 === 0 ? 'trend' : index % 3 === 1 ? 'performance' : 'recommendation',
      title: line.substring(0, 50) + '...',
      description: line,
      confidence: 0.8 + Math.random() * 0.2,
      actionable: Math.random() > 0.5
    }));
  };

  const parseClusters = (text: string): TeamCluster[] => {
    // Mock clustering data - in production, parse GPT response
    return [
      {
        industry: 'E-commerce',
        teams: [],
        avgRating: 4.8,
        successRate: 92,
        topSkills: ['React', 'Node.js', 'AWS']
      },
      {
        industry: 'Healthcare',
        teams: [],
        avgRating: 4.6,
        successRate: 88,
        topSkills: ['HIPAA', 'Security', 'Database']
      }
    ];
  };

  const parseWorkflows = (text: string): any[] => {
    // Mock workflow data
    return [
      {
        id: 'workflow-1',
        title: 'High-Performance E-commerce Development',
        steps: ['Requirements Analysis', 'MVP Development', 'User Testing', 'Optimization'],
        successRate: 95,
        avgDuration: '6 weeks'
      }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={generateInsights} disabled={loading} variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            Generate Insights
          </Button>
          <Button onClick={clusterTeams} disabled={loading} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Cluster Teams
          </Button>
          <Button onClick={extractWorkflows} disabled={loading} variant="outline">
            <Workflow className="w-4 h-4 mr-2" />
            Extract Workflows
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="clusters">Team Clusters</TabsTrigger>
          <TabsTrigger value="workflows">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Analyzing data with AI...
            </div>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={insight.type === 'trend' ? 'default' : insight.type === 'performance' ? 'secondary' : 'outline'}>
                          {insight.type}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    {insight.actionable && (
                      <Button size="sm" className="mt-3">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Create Training Module
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4">
          <div className="grid gap-4">
            {clusters.map((cluster, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {cluster.industry} Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{cluster.avgRating}</div>
                      <div className="text-sm text-gray-500">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{cluster.successRate}%</div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{cluster.topSkills.length}</div>
                      <div className="text-sm text-gray-500">Top Skills</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cluster.topSkills.map((skill, i) => (
                      <Badge key={i} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="w-5 h-5" />
                    {workflow.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-lg font-semibold text-green-600">{workflow.successRate}%</div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">{workflow.avgDuration}</div>
                      <div className="text-sm text-gray-500">Avg Duration</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Workflow Steps:</h4>
                    <div className="flex flex-wrap gap-2">
                      {workflow.steps.map((step: string, i: number) => (
                        <Badge key={i} variant="outline">{i + 1}. {step}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="mt-4" size="sm">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Publish as Training Module
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalyticsDashboard;
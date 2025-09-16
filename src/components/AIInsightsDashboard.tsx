import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PlatformData {
  totalProjects: number;
  completedProjects: number;
  avgRating: number;
  avgCompletionTime: number;
  industryBreakdown: Record<string, {
    projects: number;
    avgRating: number;
    avgTime: number;
  }>;
  topPerformanceFactors: string[];
}

interface AnalyticsInsights {
  platformData: PlatformData;
  insights: string;
  embeddings: number;
  timeRange: string;
}

const AIInsightsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsInsights | null>(null);
  const [loading, setLoading] = useState(false);

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const generateInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analytics-insights', {
        body: { action: 'analyze_performance', timeRange },
      });

      if (error) throw error;
      setAnalyticsData(data);
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = analyticsData 
    ? ((analyticsData.platformData.completedProjects / analyticsData.platformData.totalProjects) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Platform Analytics
          </CardTitle>
          <CardDescription>
            GPT-4o insights with OpenAI Embeddings for trend analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={generateInsights} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Generate AI Insights
            </Button>
          </div>

          {analyticsData && (
            <div className="space-y-6">
              {/* Platform Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Projects</span>
                    </div>
                    <p className="text-2xl font-bold">{analyticsData.platformData.totalProjects}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Completion Rate</span>
                    </div>
                    <p className="text-2xl font-bold">{completionRate}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Avg Rating</span>
                    </div>
                    <p className="text-2xl font-bold">{analyticsData.platformData.avgRating}/5</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Avg Time</span>
                    </div>
                    <p className="text-2xl font-bold">{analyticsData.platformData.avgCompletionTime}d</p>
                  </CardContent>
                </Card>
              </div>

              {/* Industry Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Performance Analysis</CardTitle>
                  <CardDescription>
                    Processed with OpenAI Embeddings ({analyticsData.embeddings} vectors)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.platformData.industryBreakdown).map(([industry, data]) => (
                      <div key={industry} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{industry}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.projects} projects • {data.avgTime} days avg
                          </p>
                        </div>
                        <Badge variant="outline">{data.avgRating}/5</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    GPT-4o Generated Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {analyticsData.insights}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Factors */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performance Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analyticsData.platformData.topPerformanceFactors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <span className="text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsDashboard;
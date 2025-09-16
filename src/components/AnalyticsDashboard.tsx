import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Clock, Star, Brain, Shield } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

export const AnalyticsDashboard: React.FC = () => {
  const { metrics, loading, generateInsights } = useAnalytics();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Privacy-focused performance insights</p>
        </div>
        <Button onClick={generateInsights} className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Refresh Insights
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
        <Shield className="w-4 h-4" />
        All data is anonymized and aggregated to protect team privacy
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {metric.industry}
                <Badge variant="secondary">{metric.projectCount} projects</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Avg: {metric.avgCompletionTime} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Rating: {metric.avgRating}/5.0</span>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Top Practices:</h4>
                <div className="space-y-1">
                  {metric.topPractices.map((practice, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {practice}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
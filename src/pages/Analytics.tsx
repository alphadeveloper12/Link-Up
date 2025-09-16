import React from 'react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import AdminAnalytics from '@/components/AdminAnalytics';
import AIAnalyticsDashboard from '@/components/AIAnalyticsDashboard';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const Analytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
              <TabsTrigger value="admin">Admin Analytics</TabsTrigger>
              <TabsTrigger value="ai">AI Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <AnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="admin">
              <AdminAnalytics />
            </TabsContent>
            
            <TabsContent value="ai">
              <AIAnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
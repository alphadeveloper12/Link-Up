import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, Brain, Eye, Clock, CheckCircle } from 'lucide-react';
import { AIFileAnalyzer } from './AIFileAnalyzer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface TrainingModuleCardProps {
  module: TrainingModule;
}

export const TrainingModuleCard: React.FC<TrainingModuleCardProps> = ({ module }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{module.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant="secondary">{module.industry}</Badge>
              {module.aiGenerated && (
                <Badge variant="outline" className="text-blue-600">
                  AI Generated
                </Badge>
              )}
            </CardDescription>
          </div>
          <Award className="h-5 w-5 text-yellow-500" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {module.content.substring(0, 150)}...
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(module.createdAt).toLocaleDateString()}</span>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                View Module
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  {module.title}
                </DialogTitle>
                <DialogDescription>
                  <Badge variant="secondary" className="mr-2">{module.industry}</Badge>
                  {module.aiGenerated && (
                    <Badge variant="outline" className="text-blue-600">
                      AI Generated from Top Performers
                    </Badge>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Best Practices & Insights</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{module.content}</p>
                  </div>
                </div>

                {module.practices && module.practices.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Practices</h4>
                    <ul className="space-y-2">
                      {module.practices.map((practice, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
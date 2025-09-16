import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Clock, Calendar } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  dueDate: string;
  assignee: string;
}

const MilestonesList: React.FC = () => {
  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Project Setup & Planning',
      description: 'Initial project setup, requirements gathering, and technical planning',
      status: 'completed',
      dueDate: '2024-01-15',
      assignee: 'Sarah Chen'
    },
    {
      id: '2',
      title: 'UI/UX Design Phase',
      description: 'Create wireframes, mockups, and design system',
      status: 'in-progress',
      dueDate: '2024-01-25',
      assignee: 'Mike Rodriguez'
    },
    {
      id: '3',
      title: 'Frontend Development',
      description: 'Build responsive frontend components and pages',
      status: 'pending',
      dueDate: '2024-02-10',
      assignee: 'Alex Kim'
    },
    {
      id: '4',
      title: 'Backend API Development',
      description: 'Develop REST APIs and database integration',
      status: 'pending',
      dueDate: '2024-02-15',
      assignee: 'Sarah Chen'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Project Milestones</h3>
        <Button variant="outline" size="sm">Add Milestone</Button>
      </div>
      
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div 
            key={milestone.id} 
            className={`flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-all ${
              milestone.status === 'in-progress' 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50' 
                : ''
            }`}
          >
            <div className="relative">
              {getStatusIcon(milestone.status)}
              {milestone.status === 'in-progress' && (
                <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded-full animate-pulse">
                  NOW
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-medium ${milestone.status === 'in-progress' ? 'text-blue-800' : ''}`}>
                  {milestone.title}
                </h4>
                <Badge className={getStatusBadge(milestone.status)}>
                  {milestone.status.replace('-', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Due: {milestone.dueDate}
                </div>
                <div>Assigned to: {milestone.assignee}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MilestonesList;
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign } from 'lucide-react';

const ProjectProgress: React.FC = () => {
  const progress = 35;
  const milestones = [
    { name: 'Planning', completed: true },
    { name: 'Design', completed: true },
    { name: 'Development', completed: false, current: true },
    { name: 'Testing', completed: false },
    { name: 'Deployment', completed: false }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Project Progress</h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Timeline</p>
            <p className="text-sm font-medium">6 weeks</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Time Left</p>
            <p className="text-sm font-medium">4 weeks</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-xs text-gray-500">Budget</p>
            <p className="text-sm font-medium">$15,000</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Milestone Timeline</h4>
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              milestone.completed ? 'bg-green-500' : 
              milestone.current ? 'bg-blue-500' : 'bg-gray-300'
            }`} />
            <span className={`text-sm ${
              milestone.completed ? 'text-green-700' : 
              milestone.current ? 'text-blue-700 font-medium' : 'text-gray-500'
            }`}>
              {milestone.name}
            </span>
            {milestone.current && (
              <Badge variant="secondary" className="text-xs">Current</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProjectProgress;
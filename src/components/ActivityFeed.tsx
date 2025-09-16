import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, FileUp, CheckCircle, Users, Calendar } from 'lucide-react';

interface Activity {
  id: string;
  type: 'message' | 'file' | 'milestone' | 'team' | 'meeting';
  user: string;
  avatar: string;
  action: string;
  timestamp: string;
  details?: string;
}

const ActivityFeed: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'milestone',
      user: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      action: 'completed milestone',
      details: 'Project Setup & Planning',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'file',
      user: 'Mike Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      action: 'uploaded file',
      details: 'wireframes_v2.pdf',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      type: 'message',
      user: 'Alex Kim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      action: 'sent a message',
      details: 'Looking good! Ready to start development.',
      timestamp: '6 hours ago'
    },
    {
      id: '4',
      type: 'team',
      user: 'You',
      avatar: '',
      action: 'joined the project',
      timestamp: '1 day ago'
    }
  ];

  const getIcon = (type: string) => {
    const icons = {
      message: <MessageSquare className="w-4 h-4 text-blue-600" />,
      file: <FileUp className="w-4 h-4 text-green-600" />,
      milestone: <CheckCircle className="w-4 h-4 text-purple-600" />,
      team: <Users className="w-4 h-4 text-orange-600" />,
      meeting: <Calendar className="w-4 h-4 text-red-600" />
    };
    return icons[type as keyof typeof icons] || icons.message;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={activity.avatar} />
              <AvatarFallback>{activity.user[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getIcon(activity.type)}
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
              </div>
              {activity.details && (
                <p className="text-sm text-gray-600 truncate">{activity.details}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityFeed;
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
        title: ['New Message', 'Milestone Complete', 'Team Update'][Math.floor(Math.random() * 3)],
        message: 'You have a new update on your project.',
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs display-flex items-center justify-center rounded-full text-white">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showPanel && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowPanel(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
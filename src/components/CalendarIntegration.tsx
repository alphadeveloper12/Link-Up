import React, { useState } from 'react';
import { Calendar, Clock, Plus, ExternalLink, Users, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: number;
  type: 'meeting' | 'deadline' | 'review';
  attendees: string[];
  location?: string;
  description?: string;
}

export const CalendarIntegration: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Project Kickoff Meeting',
      date: new Date(),
      time: '10:00 AM',
      duration: 60,
      type: 'meeting',
      attendees: ['John Doe', 'Jane Smith'],
      location: 'Conference Room A'
    },
    {
      id: '2',
      title: 'Design Review Deadline',
      date: new Date(Date.now() + 86400000),
      time: '5:00 PM',
      duration: 0,
      type: 'deadline',
      attendees: ['Design Team']
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'meeting' as const
  });

  const addEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: new Date(newEvent.date),
        time: newEvent.time,
        duration: 60,
        type: newEvent.type,
        attendees: []
      };
      setEvents(prev => [...prev, event]);
      setNewEvent({ title: '', date: '', time: '', type: 'meeting' });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const connectToGoogle = () => {
    // Simulate Google Calendar integration
    alert('Google Calendar integration would be implemented here');
  };

  const connectToOutlook = () => {
    // Simulate Outlook integration
    alert('Outlook Calendar integration would be implemented here');
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Calendar Integration
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={connectToGoogle}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Google
          </Button>
          <Button variant="outline" size="sm" onClick={connectToOutlook}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Outlook
          </Button>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList>
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          <TabsTrigger value="add">Add Event</TabsTrigger>
          <TabsTrigger value="sync">Sync Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    {event.attendees.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {event.attendees.join(', ')}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <div className="space-y-4 max-w-md">
            <Input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
            />
            <Input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="review">Review</option>
            </select>
            <Button onClick={addEvent} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="mt-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Sync Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>Sync project milestones to calendar</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>Send email reminders</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Auto-create meetings for new milestones</span>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
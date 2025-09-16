import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, CreditCard, Users, MessageSquare, Sparkles, CheckCircle } from 'lucide-react';
import ConfettiAnimation from './ConfettiAnimation';
import PaymentModal from './PaymentModal';
import NDAModal from './NDAModal';
import { gapi } from 'gapi-script';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  icon: React.ReactNode;
  action?: string;
}

interface Milestone {
  id: string;
  name: string;
  percentage: number;
  description: string;
  archived?: boolean;
  approved?: boolean;
  paymentReleased?: boolean;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
}

const CLIENT_ID = '1013030639423-b95kussvvts4bidb9him7g9o0c16at5o.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

const OnboardingChecklist: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const location = useLocation();
  const q = new URLSearchParams(location.search);
  const projectName = q.get('project') || 'New Project';

  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', title: 'Sign NDA', description: 'Review and sign NDA', completed: false, required: true, icon: <FileText className="w-4 h-4" />, action: 'Sign Now' },
    { id: '2', title: 'Setup Payment', description: 'Configure payment method', completed: false, required: true, icon: <CreditCard className="w-4 h-4" />, action: 'Setup Payment' },
    { id: '3', title: 'Team Introduction', description: 'Meet your team', completed: true, required: true, icon: <Users className="w-4 h-4" /> },
    { id: '4', title: 'Learn from the Best', description: 'Access training modules', completed: false, required: false, icon: <Sparkles className="w-4 h-4" />, action: 'View Training' },
    { id: '5', title: 'Project Kickoff Call', description: 'Schedule initial call', completed: false, required: false, icon: <MessageSquare className="w-4 h-4" />, action: 'Schedule Call' }
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'm1', name: 'Milestone 1', percentage: 20, description: 'Initial project setup and requirements gathering' },
    { id: 'm2', name: 'Milestone 2', percentage: 30, description: 'UI/UX design and prototypes' },
    { id: 'm3', name: 'Milestone 3', percentage: 30, description: 'Development of core features' },
    { id: 'm4', name: 'Milestone 4', percentage: 20, description: 'Testing, bug fixes, and deployment' },
  ]);

  const [showConfetti, setShowConfetti] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Initialize gapi client
  useEffect(() => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      });
    });
  }, []);

  const signIn = async () => {
    const auth = gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
      await auth.signIn({
        prompt: 'consent',
        redirect_uri: 'http://localhost:3000/oauth2callback'
      });
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      await signIn();

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const fetchedEvents: CalendarEvent[] = response.result.items || [];
      setEvents(fetchedEvents);

      if (fetchedEvents.length === 0) {
        alert('No upcoming events found.');
      } else {
        console.log('Upcoming events:', fetchedEvents);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      alert('Failed to fetch events.');
    }
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleActionClick = (item: ChecklistItem) => {
    if (item.id === '1') setShowNDAModal(true);
    else if (item.id === '2') setShowPaymentModal(true);
    else if (item.id === '4') window.location.href = '/training';
    else if (item.id === '5') fetchUpcomingEvents();
  };

  const handlePaymentSuccess = () => {
    setItems(items.map(item => item.id === '2' ? { ...item, completed: true } : item));
  };

  const handleNDASigned = () => {
    setItems(items.map(item => item.id === '1' ? { ...item, completed: true } : item));
  };

  const completedCount = items.filter(item => item.completed).length;
  const requiredCount = items.filter(item => item.required).length;
  const completedRequired = items.filter(item => item.completed && item.required).length;
  const isFullyComplete = completedCount === items.length;

  useEffect(() => {
    if (isFullyComplete && !wasCompleted) {
      setShowConfetti(true);
      setWasCompleted(true);
    }
  }, [isFullyComplete, wasCompleted]);

  // Milestone actions
  const archiveMilestone = (id: string) => {
    setMilestones(milestones.map(ms => ms.id === id ? { ...ms, archived: true } : ms));
  };

  const approveMilestone = (id: string) => {
    setMilestones(milestones.map(ms => ms.id === id ? { ...ms, approved: true, paymentReleased: true } : ms));
  };

  return (
    <>
      <ConfettiAnimation show={showConfetti} onComplete={() => setShowConfetti(false)} />

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Onboarding Checklist</h3>
        </div>

        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox checked={item.completed} onCheckedChange={() => toggleItem(item.id)} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {item.icon}
                  <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>{item.title}</h4>
                  {item.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                  {item.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                {item.action && !item.completed && (
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => handleActionClick(item)}>
                    {item.action}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {completedRequired < requiredCount && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-700">Please complete all required items to proceed with the project.</p>
          </div>
        )}
      </Card>

      {events.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Google Calendar Events</h3>
          <ul className="space-y-2">
            {events.map(event => (
              <li key={event.id}>
                <strong>{event.summary || 'No title'}</strong> – {event.start.dateTime || event.start.date}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Project Milestones</h3>
        <div className="space-y-3">
          {milestones.map(ms => (
            <div key={ms.id} className="p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{ms.name}</span>
                <Badge variant="secondary">{ms.percentage}% of budget</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{ms.description}</p>
              <div className="flex space-x-2">
                {!ms.archived && (
                  <Button size="sm" variant="outline" onClick={() => archiveMilestone(ms.id)}>
                    Archive
                  </Button>
                )}
                {ms.archived && !ms.approved && (
                  <Button size="sm" variant="secondary" onClick={() => approveMilestone(ms.id)}>
                    Approve (Client)
                  </Button>
                )}
                {ms.paymentReleased && (
                  <Badge variant="success">Payment Released</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        project={{ name: "E-commerce Platform", milestone: "Project Setup & Planning", amount: 3000 }}
      />

      <NDAModal
        isOpen={showNDAModal}
        onClose={() => setShowNDAModal(false)}
        onSigned={handleNDASigned}
        projectData={{ name: "E-commerce Platform Development", clientName: "Client Company LLC", teamName: "Development Team Inc" }}
      />
    </>
  );
};

export default OnboardingChecklist;

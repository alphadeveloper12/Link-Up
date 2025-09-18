import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  FileText,
  CreditCard,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import ConfettiAnimation from './ConfettiAnimation';
import PaymentModal from './PaymentModal';
import NDAModal from './NDAModal';
import { gapi } from 'gapi-script';
import { supabase } from '@/lib/supabase';

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
  amount: number; // 👈 add this
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

interface OnboardingChecklistProps {
  projectId: string;
  teamId: string;
}

const CLIENT_ID =
  '1013030639423-b95kussvvts4bidb9him7g9o0c16at5o.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  projectId,
  teamId
}) => {
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);

  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Sign NDA',
      description: 'Review and sign NDA',
      completed: false,
      required: true,
      icon: <FileText className="w-4 h-4" />,
      action: 'Sign Now'
    },
    {
      id: '2',
      title: 'Setup Payment',
      description: 'Configure payment method',
      completed: false,
      required: true,
      icon: <CreditCard className="w-4 h-4" />,
      action: 'Setup Payment'
    },
    {
      id: '3',
      title: 'Team Introduction',
      description: 'Meet your team',
      completed: true,
      required: true,
      icon: <Users className="w-4 h-4" />
    },
    {
      id: '4',
      title: 'Learn from the Best',
      description: 'Access training modules',
      completed: false,
      required: false,
      icon: <Sparkles className="w-4 h-4" />,
      action: 'View Training'
    },
    {
      id: '5',
      title: 'Project Kickoff Call',
      description: 'Schedule initial call',
      completed: false,
      required: false,
      icon: <MessageSquare className="w-4 h-4" />,
      action: 'Schedule Call'
    }
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );

  const [showConfetti, setShowConfetti] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [gapiReady, setGapiReady] = useState(false);

  // Initialise Google API
  useEffect(() => {
    const initClient = async () => {
      try {
        await gapi.client.init({
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
          ]
        });
        console.log('Google API client initialised');
        setGapiReady(true);
      } catch (err) {
        console.error('Error initialising gapi client', err);
      }
    };
    gapi.load('client:auth2', initClient);
  }, []);

  // Fetch project and team data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        if (projectError) throw projectError;
        setProject(projectData);

        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();
        if (teamError) throw teamError;
        setTeam(teamData);
      } catch (error) {
        console.error('Error fetching project or team:', error);
      }
    };
    fetchData();
  }, [projectId, teamId]);

  // Fetch project milestones from Supabase
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const { data, error } = await supabase
          .from('project_milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true });

        if (error) throw error;

        const mapped: Milestone[] = data.map((m: any) => ({
          id: m.id,
          name: m.title,
          percentage: m.percentage || 0,
          description: m.description,
          archived: m.status === 'archived',
          approved: m.status === 'approved',
          paymentReleased: m.payment_released,
          amount: parseFloat(m.amount) || 0 // 👈 bring the amount across too
        }));

        setMilestones(mapped);
      } catch (err) {
        console.error('Error fetching milestones', err);
      }
    };

    fetchMilestones();
  }, [projectId]);

  const signIn = async () => {
    if (!gapiReady) {
      alert('Google API not initialised yet');
      return;
    }
    const auth = gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
      await auth.signIn({ prompt: 'consent' });
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      await signIn();
      console.log('Signed in, fetching events...');
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      });
      const fetchedEvents: CalendarEvent[] = response.result.items || [];
      setEvents(fetchedEvents);
      console.log('Events response', fetchedEvents);
      if (fetchedEvents.length === 0) {
        alert('No upcoming events found.');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      alert('Failed to fetch events.');
    }
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleActionClick = (item: ChecklistItem) => {
    if (item.id === '1') setShowNDAModal(true);
    else if (item.id === '2') setShowPaymentModal(true);
    else if (item.id === '4') window.location.href = '/training';
    else if (item.id === '5') fetchUpcomingEvents();
  };

  const handlePaymentSuccess = () => {
    // Payment success for project setup or milestone
    setItems(items.map(item =>
      item.id === '2' ? { ...item, completed: true } : item
    ));
    if (selectedMilestone) {
      approveMilestone(selectedMilestone.id);
      setSelectedMilestone(null);
    }
  };

  const handleNDASigned = () => {
    setItems(items.map(item =>
      item.id === '1' ? { ...item, completed: true } : item
    ));
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

  const archiveMilestone = async (id: string) => {
    try {
      await supabase
        .from('project_milestones')
        .update({ status: 'archived' })
        .eq('id', id);

      setMilestones(milestones.map(ms =>
        ms.id === id ? { ...ms, archived: true } : ms
      ));
    } catch (err) {
      console.error('Failed to archive milestone', err);
    }
  };

  const approveMilestone = async (id: string) => {
    try {
      await supabase
        .from('project_milestones')
        .update({ status: 'approved', payment_released: true })
        .eq('id', id);

      setMilestones(milestones.map(ms =>
        ms.id === id ? { ...ms, approved: true, paymentReleased: true } : ms
      ));
    } catch (err) {
      console.error('Failed to approve milestone', err);
    }
  };

  const handlePaymentForMilestone = (ms: Milestone) => {
    setSelectedMilestone(ms);
    setShowPaymentModal(true);
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
            <div
              key={item.id}
              className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {item.icon}
                  <h4
                    className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}
                  >
                    {item.title}
                  </h4>
                  {item.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {item.completed && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                {item.action && !item.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleActionClick(item)}
                  >
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
            <p className="text-sm text-amber-700">
              Please complete all required items to proceed with the project.
            </p>
          </div>
        )}
      </Card>

      {events.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Upcoming Google Calendar Events
          </h3>
          <ul className="space-y-2">
            {events.map(event => (
              <li key={event.id}>
                <strong>{event.summary || 'No title'}</strong> –{' '}
                {event.start.dateTime || event.start.date}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Project Milestones</h3>
        <div className="space-y-3">
          {milestones.map(ms => (
            <div
              key={ms.id}
              className="p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{ms.name}</span>
                <Badge variant="secondary">{ms.percentage}% of budget – ${ms.amount.toFixed(2)}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{ms.description}</p>
              <div className="flex space-x-2">
                {!ms.archived && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => archiveMilestone(ms.id)}
                  >
                    Archive
                  </Button>
                )}
                {ms.archived && !ms.approved && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handlePaymentForMilestone(ms)}
                  >
                    Approve & Pay
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
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedMilestone(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
        project={{
          name: project?.name || 'Project',
          milestone: selectedMilestone?.name || 'Project Setup & Planning',
          amount: selectedMilestone?.amount || 0
        }}
      />

      <NDAModal
        isOpen={showNDAModal}
        onClose={() => setShowNDAModal(false)}
        onSigned={handleNDASigned}
        projectData={{
          name: project?.title || 'Project Name',
          clientName: 'Client Company LLC',
          clientEntity: 'LLC',
          clientAddress: '123 Client St, City, Country',
          teamName: team?.name || 'Team Name',
          teamEntity: 'LLC',
          teamAddress: team?.description || '',
          termYears: '2',
          survivalYears: '5',
          governingLaw: 'Delaware',
          venue: 'Delaware'
        }}
      />
    </>
  );
};

export default OnboardingChecklist;

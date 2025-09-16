import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Plus, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  title: string;
  description: string;
  due_date: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'paid';
  created_at: string;
}

interface ProjectMilestonesProps {
  projectId: string;
  userId: string;
  isClient: boolean;
}

export default function ProjectMilestones({ projectId, userId, isClient }: ProjectMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    due_date: '',
    amount: 0
  });

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async () => {
    if (!newMilestone.title.trim()) return;

    setCreating(true);
    try {
      const { error } = await supabase
        .from('milestones')
        .insert([{
          ...newMilestone,
          project_id: projectId,
          status: 'pending',
          created_by: userId
        }]);

      if (error) throw error;
      
      toast.success('Milestone created successfully');
      setNewMilestone({ title: '', description: '', due_date: '', amount: 0 });
      fetchMilestones();
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
    } finally {
      setCreating(false);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ status })
        .eq('id', milestoneId);

      if (error) throw error;
      
      toast.success('Milestone updated successfully');
      fetchMilestones();
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedMilestones = milestones.filter(m => m.status === 'completed' || m.status === 'paid').length;
  const progressPercentage = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  if (loading) {
    return <div className="p-4">Loading milestones...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Project Milestones
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {completedMilestones}/{milestones.length} completed
            </div>
            {isClient && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Milestone</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Milestone title"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={newMilestone.due_date}
                      onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Amount ($)"
                      value={newMilestone.amount}
                      onChange={(e) => setNewMilestone({ ...newMilestone, amount: Number(e.target.value) })}
                    />
                    <Button onClick={createMilestone} disabled={creating} className="w-full">
                      {creating ? 'Creating...' : 'Create Milestone'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
        <Progress value={progressPercentage} className="w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No milestones created yet. Add your first milestone to track progress.
            </p>
          ) : (
            milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <button
                  onClick={() => {
                    const nextStatus = milestone.status === 'pending' ? 'in_progress' : 
                                    milestone.status === 'in_progress' ? 'completed' : milestone.status;
                    if (nextStatus !== milestone.status) {
                      updateMilestoneStatus(milestone.id, nextStatus);
                    }
                  }}
                  className="mt-1"
                >
                  {getStatusIcon(milestone.status)}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{milestone.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(milestone.status)}>
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                      {milestone.amount > 0 && (
                        <Badge variant="outline">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${milestone.amount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                  {milestone.due_date && (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Due: {new Date(milestone.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
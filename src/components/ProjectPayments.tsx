import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { DollarSign, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Payment {
  id: string;
  milestone_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method: string;
  created_at: string;
  milestone_title?: string;
}

interface ProjectPaymentsProps {
  projectId: string;
  userId: string;
  isClient: boolean;
}

export default function ProjectPayments({ projectId, userId, isClient }: ProjectPaymentsProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchMilestones();
  }, [projectId]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          milestones (
            title
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    }
  };

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (milestoneId: string, amount: number) => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: amount * 100, // Convert to cents
          currency: 'usd',
          projectId,
          milestoneId,
          userId
        }
      });

      if (error) throw error;

      // In a real app, you'd redirect to Stripe checkout or handle payment UI
      toast.success('Payment initiated successfully');
      
      // Simulate payment completion for demo
      setTimeout(() => {
        recordPayment(milestoneId, amount, 'completed');
      }, 2000);
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  const recordPayment = async (milestoneId: string, amount: number, status: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          project_id: projectId,
          milestone_id: milestoneId,
          amount,
          status,
          payment_method: 'stripe',
          created_by: userId
        }]);

      if (error) throw error;
      
      // Update milestone status to paid
      await supabase
        .from('milestones')
        .update({ status: 'paid' })
        .eq('id', milestoneId);
      
      fetchPayments();
      toast.success('Payment recorded successfully');
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalProject = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const paymentProgress = totalProject > 0 ? (totalPaid / totalProject) * 100 : 0;

  if (loading) {
    return <div className="p-4">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payment Overview
            <div className="text-sm text-muted-foreground">
              ${totalPaid.toFixed(2)} / ${totalProject.toFixed(2)}
            </div>
          </CardTitle>
          <Progress value={paymentProgress} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                ${(totalProject - totalPaid).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(paymentProgress)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No payments recorded yet.
              </p>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.milestone_title || 'Milestone Payment'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                    <Badge variant="outline">
                      <CreditCard className="h-3 w-3 mr-1" />
                      {payment.payment_method}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {isClient && milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones
                .filter(m => !payments.some(p => p.milestone_id === m.id && p.status === 'completed'))
                .map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground">${milestone.amount?.toFixed(2)}</p>
                    </div>
                    <Button
                      onClick={() => initiatePayment(milestone.id, milestone.amount)}
                      disabled={processing}
                      size="sm"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {processing ? 'Processing...' : 'Pay Now'}
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
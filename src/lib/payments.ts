import { supabase } from '@/lib/supabase';

export interface PaymentData {
  project_id: string;
  amount: number;
  currency?: string;
  milestone_id?: string;
  status: 'pending' | 'completed' | 'failed';
  stripe_payment_intent_id?: string;
  metadata?: any;
}

export async function recordPayment(paymentData: PaymentData) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) throw userErr || new Error('Not signed in');

  const { error } = await supabase.from('payments').insert({
    ...paymentData,
    currency: paymentData.currency || 'USD',
    user_id: user.id,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function createPaymentIntent(
  projectId: string,
  amount: number,
  milestoneId?: string,
  currency = 'USD'
) {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: {
      amount,
      currency: currency.toLowerCase(),
      projectId,
      milestoneId,
    }
  });

  if (error) throw error;
  return data;
}
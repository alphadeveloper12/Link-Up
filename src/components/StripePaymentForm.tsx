import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

interface StripePaymentFormProps {
  amount: number;
  projectName: string;
  milestone: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  projectName,
  milestone,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent with proper metadata
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount,
          projectId: 'temp-project-id', // Should be actual project ID
          milestoneId: 'temp-milestone-id', // Should be actual milestone ID
          teamId: 'temp-team-id', // Should be actual team ID
          clientId: 'temp-client-id', // Should be actual client ID
          metadata: {
            projectName,
            milestone
          }
        }
      });

      if (paymentError) throw paymentError;

      // Confirm payment with PaymentElement
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Confirm with backend
      await supabase.functions.invoke('confirm-payment', {
        body: {
          paymentIntentId: paymentData.paymentIntentId,
          projectId: 'temp-project-id',
          milestoneId: 'temp-milestone-id'
        }
      });

      onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <PaymentElement />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {processing ? 'Processing...' : `Pay $${amount.toLocaleString()}`}
      </Button>
    </form>
  );
};

export default StripePaymentForm;
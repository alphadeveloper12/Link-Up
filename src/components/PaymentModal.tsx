import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Building2, Shield, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { recordPayment } from '@/lib/payments';
import CreditCardForm from './CreditCardForm';
import BankAccountForm from './BankAccountForm';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  project: {
    name: string;
    milestone: string;
    amount: number;
  };
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  project
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreditCardSubmit = async (cardData: any) => {
    setProcessing(true);
    setError(null);

    try {
      // Create payment intent with currency and milestone support
      const { data, error: paymentError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: project.amount,
          currency: 'USD',
          projectId: 'project-123', // Replace with actual project ID
          milestoneId: project.milestone,
          paymentMethod: 'card',
          cardData,
          metadata: {
            projectName: project.name,
            milestone: project.milestone
          }
        }
      });

      if (paymentError) throw paymentError;

      // Record payment in database
      await recordPayment({
        project_id: 'project-123',
        amount: project.amount,
        currency: 'USD',
        milestone_id: project.milestone,
        status: 'completed',
        stripe_payment_intent_id: data.paymentIntentId
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleBankTransferSubmit = async (bankData: any) => {
    setProcessing(true);
    setError(null);

    try {
      // Setup bank transfer
      const { data, error: bankError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: project.amount,
          paymentMethod: 'bank',
          bankData,
          metadata: {
            projectName: project.name,
            milestone: project.milestone
          }
        }
      });

      if (bankError) throw bankError;

      // Simulate successful setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Bank transfer setup failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Setup Escrow Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Details */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Project:</span>
                <span className="text-sm">{project.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Milestone:</span>
                <span className="text-sm">{project.milestone}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Amount:</span>
                <span>${project.amount.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Escrow Notice */}
          <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Info className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">Secure Escrow Protection</p>
              <p>Funds held securely until milestone completion.</p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="flex items-center justify-center p-4 h-auto"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Credit Card
              </Button>
              <Button
                variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('bank')}
                className="flex items-center justify-center p-4 h-auto"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Bank Transfer
              </Button>
            </div>
          </div>

          {/* Payment Forms */}
          {paymentMethod === 'card' && (
            <CreditCardForm
              amount={project.amount}
              onSubmit={handleCreditCardSubmit}
              processing={processing}
              error={error || undefined}
            />
          )}

          {paymentMethod === 'bank' && (
            <BankAccountForm
              amount={project.amount}
              onSubmit={handleBankTransferSubmit}
              processing={processing}
              error={error || undefined}
            />
          )}

          <div className="flex justify-center">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
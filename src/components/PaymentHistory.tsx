import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Receipt, CreditCard } from 'lucide-react';

interface PaymentRecord {
  id: string;
  milestone: string;
  amount: number;
  status: 'pending' | 'funded' | 'released' | 'completed';
  date: string;
  method: 'card' | 'bank';
}

interface PaymentHistoryProps {
  payments: PaymentRecord[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: 'bg-gray-100 text-gray-800', text: 'Pending' },
      funded: { color: 'bg-blue-100 text-blue-800', text: 'Funded' },
      released: { color: 'bg-green-100 text-green-800', text: 'Released' },
      completed: { color: 'bg-purple-100 text-purple-800', text: 'Completed' }
    };
    const config = configs[status as keyof typeof configs];
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const downloadReceipt = (paymentId: string) => {
    // Simulate receipt download
    console.log(`Downloading receipt for payment ${paymentId}`);
  };

  const downloadInvoice = (paymentId: string) => {
    // Simulate invoice download
    console.log(`Downloading invoice for payment ${paymentId}`);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Receipt className="w-5 h-5 mr-2" />
          Payment History
        </h3>
        <Badge variant="outline">
          {payments.length} Transaction{payments.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No payment history yet</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{payment.milestone}</h4>
                  <p className="text-sm text-gray-600">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {payment.method === 'card' ? 'Credit Card' : 'Bank Transfer'}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                {getStatusBadge(payment.status)}
                
                <div className="flex space-x-2">
                  {(payment.status === 'released' || payment.status === 'completed') && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReceipt(payment.id)}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Receipt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadInvoice(payment.id)}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Invoice
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default PaymentHistory;
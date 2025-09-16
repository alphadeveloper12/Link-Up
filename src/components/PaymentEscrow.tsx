import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import PaymentModal from './PaymentModal';

const PaymentEscrow: React.FC = () => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  
  const milestones = [
    { name: "Project Setup", amount: 1000, status: "completed", date: "Jan 15" },
    { name: "Design Phase", amount: 2500, status: "completed", date: "Jan 22" },
    { name: "Development", amount: 4000, status: "ready", date: "Feb 5" },
    { name: "Testing & Launch", amount: 1500, status: "pending", date: "Feb 12" }
  ];

  const completedAmount = milestones.filter(m => m.status === 'completed').reduce((sum, m) => sum + m.amount, 0);
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const progress = (completedAmount / totalAmount) * 100;

  const handlePaymentClick = (milestone: any) => {
    setSelectedMilestone(milestone);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    // Update milestone status or refresh data
    console.log('Payment successful for milestone:', selectedMilestone?.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-purple-100">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Escrow</h1>
            <p className="text-gray-600">Your payments are protected until milestones are completed</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Escrow Progress</span>
              <span className="font-bold text-gray-900">${completedAmount.toLocaleString()} / ${totalAmount.toLocaleString()}</span>
            </div>
            <Progress value={progress} className="mb-2" />
            <div className="text-sm text-gray-500">{progress.toFixed(0)}% of funds released</div>
          </div>

          <div className="space-y-4 mb-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-purple-100">
                <div className="flex items-center space-x-4">
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : milestone.status === 'ready' ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 animate-pulse"></div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{milestone.name}</h3>
                    <p className="text-sm text-gray-500">Due: {milestone.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-gray-900">${milestone.amount.toLocaleString()}</span>
                  <Badge className={
                    milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                    milestone.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }>
                    {milestone.status}
                  </Badge>
                  {milestone.status === 'ready' && (
                    <Button 
                      onClick={() => handlePaymentClick(milestone)}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl"
                    >
                      Release Payment
                    </Button>
                  )}
                  {milestone.status === 'pending' && (
                    <Button 
                      onClick={() => handlePaymentClick(milestone)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Fund Milestone
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Payment Summary</h3>
                <p className="opacity-90">Total project value: ${totalAmount.toLocaleString()}</p>
                <p className="opacity-90">Funds in escrow: ${(totalAmount - completedAmount).toLocaleString()}</p>
              </div>
              <CreditCard className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>
        
        {selectedMilestone && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            onPaymentSuccess={handlePaymentSuccess}
            project={{
              name: "Web Development Project",
              milestone: selectedMilestone.name,
              amount: selectedMilestone.amount
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentEscrow;
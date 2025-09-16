import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface EscrowStatusProps {
  escrowBalance: number;
  currentMilestone: string;
  status: 'funded' | 'pending_submission' | 'pending_approval' | 'released';
  onReleasePayment?: () => void;
}

const EscrowStatus: React.FC<EscrowStatusProps> = ({
  escrowBalance,
  currentMilestone,
  status,
  onReleasePayment
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'funded':
        return {
          icon: <Shield className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800',
          text: 'Funds Secured',
          description: 'Team can begin work'
        };
      case 'pending_submission':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-800',
          text: 'Work in Progress',
          description: 'Awaiting milestone submission'
        };
      case 'pending_approval':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'bg-amber-100 text-amber-800',
          text: 'Pending Approval',
          description: 'Review and approve milestone'
        };
      case 'released':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800',
          text: 'Payment Released',
          description: 'Milestone completed'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-600" />
          Escrow Status
        </h3>
        <Badge className={statusConfig.color}>
          {statusConfig.icon}
          <span className="ml-1">{statusConfig.text}</span>
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Escrow Balance:</span>
          <span className="font-semibold text-lg">${escrowBalance.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Current Milestone:</span>
          <span className="text-sm font-medium">{currentMilestone}</span>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {statusConfig.description}
        </div>

        {status === 'pending_approval' && onReleasePayment && (
          <Button 
            onClick={onReleasePayment}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Release Payment
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EscrowStatus;
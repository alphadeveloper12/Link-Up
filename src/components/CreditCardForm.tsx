import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Lock } from 'lucide-react';

interface CreditCardFormProps {
  amount: number;
  onSubmit: (cardData: any) => void;
  processing: boolean;
  error?: string;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  amount,
  onSubmit,
  processing,
  error
}) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: '',
    billingAddress: {
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvc') {
      value = value.replace(/[^0-9]/gi, '').substring(0, 4);
    }

    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field: string, value: string) => {
    setCardData(prev => ({
      ...prev,
      billingAddress: { ...prev.billingAddress, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cardData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <CreditCard className="w-4 h-4" />
          <Label className="font-medium">Card Information</Label>
        </div>

        <div>
          <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardData.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            maxLength={19}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="expiryDate" className="text-sm">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="text"
              placeholder="MM/YY"
              value={cardData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              maxLength={5}
              required
            />
          </div>
          <div>
            <Label htmlFor="cvc" className="text-sm">CVC</Label>
            <Input
              id="cvc"
              type="text"
              placeholder="123"
              value={cardData.cvc}
              onChange={(e) => handleInputChange('cvc', e.target.value)}
              maxLength={4}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cardholderName" className="text-sm">Cardholder Name</Label>
          <Input
            id="cardholderName"
            type="text"
            placeholder="John Doe"
            value={cardData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <Label className="font-medium">Billing Address</Label>
        
        <div>
          <Label htmlFor="address" className="text-sm">Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="123 Main Street"
            value={cardData.billingAddress.line1}
            onChange={(e) => handleBillingChange('line1', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city" className="text-sm">City</Label>
            <Input
              id="city"
              type="text"
              placeholder="New York"
              value={cardData.billingAddress.city}
              onChange={(e) => handleBillingChange('city', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="state" className="text-sm">State</Label>
            <Input
              id="state"
              type="text"
              placeholder="NY"
              value={cardData.billingAddress.state}
              onChange={(e) => handleBillingChange('state', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="postalCode" className="text-sm">Postal Code</Label>
          <Input
            id="postalCode"
            type="text"
            placeholder="10001"
            value={cardData.billingAddress.postalCode}
            onChange={(e) => handleBillingChange('postalCode', e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
        <Lock className="w-3 h-3" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      <Button
        type="submit"
        disabled={processing}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {processing ? 'Processing...' : `Pay $${amount.toLocaleString()}`}
      </Button>
    </form>
  );
};

export default CreditCardForm;
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Lock, Info } from 'lucide-react';

interface BankAccountFormProps {
  amount: number;
  onSubmit: (bankData: any) => void;
  processing: boolean;
  error?: string;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  amount,
  onSubmit,
  processing,
  error
}) => {
  const [bankData, setBankData] = useState({
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    bankName: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === 'accountNumber' || field === 'routingNumber') {
      value = value.replace(/[^0-9]/gi, '');
    }
    setBankData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setBankData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(bankData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Bank Transfer Info */}
      <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">ACH Bank Transfer</p>
          <p>Processing time: 1-3 business days. Lower fees than credit cards.</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Building2 className="w-4 h-4" />
          <Label className="font-medium">Bank Account Information</Label>
        </div>

        <div>
          <Label htmlFor="accountHolderName" className="text-sm">Account Holder Name</Label>
          <Input
            id="accountHolderName"
            type="text"
            placeholder="John Doe"
            value={bankData.accountHolderName}
            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="bankName" className="text-sm">Bank Name</Label>
          <Input
            id="bankName"
            type="text"
            placeholder="Chase Bank"
            value={bankData.bankName}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="routingNumber" className="text-sm">Routing Number</Label>
          <Input
            id="routingNumber"
            type="text"
            placeholder="021000021"
            value={bankData.routingNumber}
            onChange={(e) => handleInputChange('routingNumber', e.target.value)}
            maxLength={9}
            required
          />
          <p className="text-xs text-gray-500 mt-1">9-digit number found on your checks</p>
        </div>

        <div>
          <Label htmlFor="accountNumber" className="text-sm">Account Number</Label>
          <Input
            id="accountNumber"
            type="text"
            placeholder="1234567890"
            value={bankData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="accountType" className="text-sm">Account Type</Label>
          <Select value={bankData.accountType} onValueChange={(value) => handleInputChange('accountType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">Checking</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bank Address */}
      <div className="space-y-4">
        <Label className="font-medium">Bank Address</Label>
        
        <div>
          <Label htmlFor="bankAddress" className="text-sm">Street Address</Label>
          <Input
            id="bankAddress"
            type="text"
            placeholder="123 Bank Street"
            value={bankData.address.line1}
            onChange={(e) => handleAddressChange('line1', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="bankCity" className="text-sm">City</Label>
            <Input
              id="bankCity"
              type="text"
              placeholder="New York"
              value={bankData.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="bankState" className="text-sm">State</Label>
            <Input
              id="bankState"
              type="text"
              placeholder="NY"
              value={bankData.address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bankPostalCode" className="text-sm">Postal Code</Label>
          <Input
            id="bankPostalCode"
            type="text"
            placeholder="10001"
            value={bankData.address.postalCode}
            onChange={(e) => handleAddressChange('postalCode', e.target.value)}
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
        <span>Your bank information is encrypted and secure</span>
      </div>

      <Button
        type="submit"
        disabled={processing}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {processing ? 'Setting up...' : `Setup Bank Transfer - $${amount.toLocaleString()}`}
      </Button>
    </form>
  );
};

export default BankAccountForm;
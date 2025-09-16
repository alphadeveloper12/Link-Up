import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Continue",
  onButtonClick
}) => {
  if (!isOpen) return null;

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-100 w-full max-w-md">
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4 w-20 h-20 mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{message}</p>
          </div>
          
          <Button 
            onClick={handleButtonClick}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
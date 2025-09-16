import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CustomDateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dateTime: string) => void;
}

const CustomDateTimeModal: React.FC<CustomDateTimeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSave = () => {
    if (date && time) {
      const dateTime = `${date} ${time}`;
      onSave(dateTime);
      onClose();
      setDate('');
      setTime('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Custom Timeline</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-xl border-2 border-purple-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 rounded-xl border-2 border-purple-100"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!date || !time}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDateTimeModal;
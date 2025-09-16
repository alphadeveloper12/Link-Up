import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AISearchBar } from '@/components/AISearchBar';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Platform
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AISearchBar 
            placeholder="Ask AI about projects, teams, features, or anything..."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
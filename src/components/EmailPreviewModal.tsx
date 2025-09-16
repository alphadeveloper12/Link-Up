import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailPreviewModalProps {
  open: boolean;
  onClose: () => void;
  subject: string;
  htmlContent: string;
  recipient: string;
}

export function EmailPreviewModal({ 
  open, 
  onClose, 
  subject, 
  htmlContent, 
  recipient 
}: EmailPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
          <div className="text-sm text-muted-foreground">
            To: {recipient}
          </div>
          <div className="text-sm font-medium">
            Subject: {subject}
          </div>
        </DialogHeader>
        <ScrollArea className="h-96 border rounded p-4">
          <div 
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className="prose prose-sm max-w-none"
          />
        </ScrollArea>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
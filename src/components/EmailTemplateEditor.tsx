import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  html_body: string;
}

interface EmailTemplateEditorProps {
  template?: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: EmailTemplate) => void;
}

const VARIABLE_SUGGESTIONS = [
  '{{first_name}}',
  '{{last_name}}',
  '{{email}}',
  '{{company}}',
  '{{project_name}}',
  '{{unsubscribe_url}}',
  '{{custom1}}',
  '{{custom2}}'
];

export function EmailTemplateEditor({ template, isOpen, onClose, onSave }: EmailTemplateEditorProps) {
  const [formData, setFormData] = useState<EmailTemplate>({
    name: template?.name || '',
    subject: template?.subject || '',
    html_body: template?.html_body || ''
  });

  const insertVariable = (variable: string, field: 'subject' | 'html_body') => {
    const textarea = document.getElementById(field) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData[field];
      const newText = text.substring(0, start) + variable + text.substring(end);
      
      setFormData(prev => ({ ...prev, [field]: newText }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.subject.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Welcome Email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="subject">Subject Line</Label>
              <div className="flex gap-1 flex-wrap">
                {VARIABLE_SUGGESTIONS.slice(0, 4).map(variable => (
                  <Badge
                    key={variable}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => insertVariable(variable, 'subject')}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Welcome to {{company}}!"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="html_body">HTML Body</Label>
              <div className="flex gap-1 flex-wrap">
                {VARIABLE_SUGGESTIONS.map(variable => (
                  <Badge
                    key={variable}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => insertVariable(variable, 'html_body')}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
            <Textarea
              id="html_body"
              value={formData.html_body}
              onChange={(e) => setFormData(prev => ({ ...prev, html_body: e.target.value }))}
              placeholder="<h1>Hello {{first_name}}!</h1><p>Welcome to our platform...</p>"
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.subject.trim()}>
              {template ? 'Update' : 'Create'} Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
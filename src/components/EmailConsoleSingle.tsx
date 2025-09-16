import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { EmailPreviewModal } from './EmailPreviewModal';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: Record<string, string>;
}

export function EmailConsoleSingle() {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [variables, setVariables] = useState('');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [isAdmin] = useState(true); // TODO: Replace with actual role check

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateChange = (value: string) => {
    setTemplateId(value);
    const template = templates.find(t => t.id === value);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setVariables(JSON.stringify(template.variables, null, 2));
    } else {
      setSubject('');
      setBody('');
      setVariables('');
    }
  };

  const renderTemplate = (templateBody: string, templateSubject: string, vars: string) => {
    try {
      const parsedVars = vars ? JSON.parse(vars) : {};
      let renderedBody = templateBody;
      let renderedSubject = templateSubject;
      
      Object.entries(parsedVars).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        renderedBody = renderedBody.replace(regex, String(value));
        renderedSubject = renderedSubject.replace(regex, String(value));
      });
      
      return { body: renderedBody, subject: renderedSubject };
    } catch {
      return { body: templateBody, subject: templateSubject };
    }
  };

  const handlePreview = () => {
    const { body: renderedBody, subject: renderedSubject } = renderTemplate(body, subject, variables);
    setPreviewContent(renderedBody);
    setPreviewSubject(renderedSubject);
    setShowPreview(true);
  };

  const handleSend = async () => {
    if (!isAdmin) {
      toast({ title: 'Error', description: 'Admin access required', variant: 'destructive' });
      return;
    }

    if (!recipient || !subject || !body) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { body: renderedBody, subject: renderedSubject } = renderTemplate(body, subject, variables);
      
      const { data, error } = await supabase.functions.invoke('send-single-email', {
        body: { recipient, subject: renderedSubject, body: renderedBody, templateId, variables }
      });

      if (error) throw error;

      // Log to email_events
      await supabase.from('email_events').insert({
        type: 'single',
        recipient,
        subject: renderedSubject,
        template_id: templateId || null,
        status: data.success ? 'sent' : 'failed',
        provider: data.provider,
        error_message: data.error
      });

      if (data.success) {
        toast({ title: 'Success', description: `Email sent via ${data.provider}!` });
        setRecipient('');
        setSubject('');
        setBody('');
        setTemplateId('');
        setVariables('');
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send email', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Single Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Email</Label>
            <Input
              id="recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="template-select">Template (Optional)</Label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select template or leave blank for custom" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div>
            <Label htmlFor="body">Body (HTML)</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="<p>Your email content here...</p>"
              rows={6}
            />
          </div>

          {templateId && (
            <div>
              <Label htmlFor="variables">Variables (JSON)</Label>
              <Textarea
                id="variables"
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                placeholder='{"name": "John Doe", "company": "Acme Corp"}'
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={!subject || !body}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={sending || !isAdmin} 
              className="flex-1"
            >
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
          
          {!isAdmin && (
            <p className="text-sm text-muted-foreground">
              Admin access required to send emails
            </p>
          )}
        </CardContent>
      </Card>

      <EmailPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        subject={previewSubject}
        htmlContent={previewContent}
        recipient={recipient}
      />
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TestTube } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export function EmailConsoleTest() {
  const [email, setEmail] = useState('admin@linkup.com'); // Default admin email
  const [subject, setSubject] = useState('Test Email from LinkUp');
  const [body, setBody] = useState(`<h2>Test Email</h2>
<p>This is a test email from the LinkUp Email Console.</p>
<p>If you're seeing this, the email system is working correctly!</p>
<br>
<p>Best regards,<br>The LinkUp Team</p>`);
  const [sending, setSending] = useState(false);

  // Try to get current user's email if available
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    getCurrentUser();
  }, []);

  const handleSendTest = async () => {
    if (!email || !subject || !body) {
      toast({ 
        title: 'Error', 
        description: 'Please fill all fields', 
        variant: 'destructive' 
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          to: email,
          subject,
          body
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast({ 
          title: 'Success', 
          description: `Test email sent successfully via ${data.provider}!` 
        });
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Send test email error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to send test email', 
        variant: 'destructive' 
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Send Test Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">To (Email)</Label>
          <Input
            id="test-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@linkup.com"
          />
        </div>
        <div>
          <Label htmlFor="test-subject">Subject</Label>
          <Input
            id="test-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Test Email Subject"
          />
        </div>
        <div>
          <Label htmlFor="test-body">Body (HTML)</Label>
          <Textarea
            id="test-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="<p>Your HTML email content here...</p>"
            className="font-mono text-sm"
          />
        </div>
        <Button onClick={handleSendTest} disabled={sending} className="w-full">
          {sending ? 'Sending...' : 'Send Test'}
        </Button>
      </CardContent>
    </Card>
  );
}
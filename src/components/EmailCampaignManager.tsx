import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';
import { Mail, Send, Users, TrendingUp } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  template_type: string;
  subject: string;
  body_template: string;
  created_at: string;
  is_active: boolean;
}

interface EmailSend {
  id: string;
  recipient_email: string;
  recipient_name: string;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  signed_up_at: string | null;
  status: string;
}

export default function EmailCampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [emailSends, setEmailSends] = useState<EmailSend[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalSignedUp: 0
  });

  useEffect(() => {
    fetchCampaigns();
    fetchEmailSends();
  }, []);

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (data) setCampaigns(data);
  };

  const fetchEmailSends = async () => {
    const { data } = await supabase
      .from('email_sends')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(100);
    
    if (data) {
      setEmailSends(data);
      setStats({
        totalSent: data.length,
        totalOpened: data.filter(s => s.opened_at).length,
        totalClicked: data.filter(s => s.clicked_at).length,
        totalSignedUp: data.filter(s => s.signed_up_at).length
      });
    }
  };

  const sendInvitation = async () => {
    if (!selectedCampaign || !recipientEmail) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-tracking', {
        body: {
          campaignId: selectedCampaign,
          recipientEmail,
          recipientName,
          referrerName,
          referralSource
        }
      });

      if (error) throw error;

      // Reset form
      setRecipientEmail('');
      setRecipientName('');
      setReferrerName('');
      setReferralSource('');
      
      // Refresh data
      fetchEmailSends();
      
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opened</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpened}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSent > 0 ? Math.round((stats.totalOpened / stats.totalSent) * 100) : 0}% open rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicked</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicked}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSent > 0 ? Math.round((stats.totalClicked / stats.totalSent) * 100) : 0}% click rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed Up</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSignedUp}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSent > 0 ? Math.round((stats.totalSignedUp / stats.totalSent) * 100) : 0}% conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Send Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Invitation Email</CardTitle>
          <CardDescription>Send personalized invitation emails to potential users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="campaign">Email Template</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign template" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="name">Recipient Name</Label>
              <Input
                id="name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label htmlFor="referrer">Referrer Name (optional)</Label>
              <Input
                id="referrer"
                value={referrerName}
                onChange={(e) => setReferrerName(e.target.value)}
                placeholder="Jane Smith"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="source">Referral Source (optional)</Label>
              <Input
                id="source"
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                placeholder="LinkedIn, Twitter, etc."
              />
            </div>
          </div>
          
          <Button 
            onClick={sendInvitation} 
            disabled={loading || !selectedCampaign || !recipientEmail}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Email Sends */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Email Sends</CardTitle>
          <CardDescription>Track the performance of your invitation emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailSends.slice(0, 10).map((send) => (
              <div key={send.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{send.recipient_name || send.recipient_email}</p>
                  <p className="text-sm text-muted-foreground">{send.recipient_email}</p>
                  <p className="text-xs text-muted-foreground">
                    Sent: {new Date(send.sent_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={send.opened_at ? 'default' : 'secondary'}>
                    {send.opened_at ? 'Opened' : 'Sent'}
                  </Badge>
                  {send.clicked_at && <Badge variant="default">Clicked</Badge>}
                  {send.signed_up_at && <Badge variant="default" className="bg-green-500">Signed Up</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
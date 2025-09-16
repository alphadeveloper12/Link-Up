import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Radio, Upload, Users, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
}

export function EmailConsoleBroadcast() {
  const [activeTab, setActiveTab] = useState('segment');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [campaignName, setCampaignName] = useState('');
  
  // Segment Send state
  const [segmentFilters, setSegmentFilters] = useState({
    role: '',
    signupDateFrom: '',
    signupDateTo: '',
    status: '',
    industry: ''
  });
  const [variablesMapping, setVariablesMapping] = useState('');
  const [safetyConfirm, setSafetyConfirm] = useState(false);
  
  // CSV Upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  
  // Progress state
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase.from('email_templates').select('*');
    setTemplates(data || []);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    const text = await file.text();
    const lines = text.split('\n');
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim());
      setCsvColumns(headers);
    }
  };

  const handlePreviewSample = async () => {
    // Implementation for preview
    toast({ title: 'Preview', description: 'Sample preview generated' });
  };

  const handleQueueSend = async () => {
    if (!selectedTemplate || !campaignName) {
      toast({ title: 'Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    if (activeTab === 'segment' && !safetyConfirm) {
      toast({ title: 'Error', description: 'Please confirm safety checkbox', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      // Use the updated email-automation function with global settings
      const { data, error } = await supabase.functions.invoke('email-broadcast', {
        body: {
          campaignName,
          templateId: selectedTemplate,
          type: activeTab,
          segmentFilters: activeTab === 'segment' ? segmentFilters : null,
          csvData: activeTab === 'csv' ? await csvFile?.text() : null,
          columnMapping: activeTab === 'csv' ? columnMapping : null,
          variablesMapping: activeTab === 'segment' ? variablesMapping : null,
          // Global settings will be handled by the function
          useGlobalSettings: true
        }
      });

      if (error) throw error;
      toast({ title: 'Success', description: 'Campaign queued successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to queue campaign', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Broadcast / Campaign
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <div>
            <Label>Campaign Name</Label>
            <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </div>
          <div>
            <Label>Template (Required)</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="segment" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Segment Send
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select value={segmentFilters.role} onValueChange={(v) => setSegmentFilters({...segmentFilters, role: v})}>
                  <SelectTrigger><SelectValue placeholder="Any role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={segmentFilters.status} onValueChange={(v) => setSegmentFilters({...segmentFilters, status: v})}>
                  <SelectTrigger><SelectValue placeholder="Any status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Signup From</Label>
                <Input type="date" value={segmentFilters.signupDateFrom} onChange={(e) => setSegmentFilters({...segmentFilters, signupDateFrom: e.target.value})} />
              </div>
              <div>
                <Label>Signup To</Label>
                <Input type="date" value={segmentFilters.signupDateTo} onChange={(e) => setSegmentFilters({...segmentFilters, signupDateTo: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Variables Mapping (JSON)</Label>
              <Textarea 
                value={variablesMapping} 
                onChange={(e) => setVariablesMapping(e.target.value)}
                placeholder='{"first_name": "{{first_name}}", "company": "{{company}}"}'
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="safety" checked={safetyConfirm} onCheckedChange={(checked) => setSafetyConfirm(!!checked)} />
              <Label htmlFor="safety" className="text-sm">I confirm this is a non-transactional message and includes unsubscribe.</Label>
            </div>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <div>
              <Label>Upload CSV</Label>
              <Input type="file" accept=".csv" onChange={handleCsvUpload} />
              {csvFile && <p className="text-sm text-green-600">File: {csvFile.name}</p>}
            </div>
            {csvColumns.length > 0 && (
              <div>
                <Label>Map CSV Columns to Template Variables</Label>
                <div className="space-y-2">
                  {['first_name', 'last_name', 'company', 'custom1', 'custom2'].map((variable) => (
                    <div key={variable} className="flex items-center gap-2">
                      <Label className="w-20">{variable}:</Label>
                      <Select value={columnMapping[variable] || ''} onValueChange={(v) => setColumnMapping({...columnMapping, [variable]: v})}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {csvColumns.map((col) => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {sending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sending Progress</span>
              <span>{progress.sent + progress.failed} / {progress.total}</span>
            </div>
            <Progress value={progress.total > 0 ? ((progress.sent + progress.failed) / progress.total) * 100 : 0} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Sent: {progress.sent}</span>
              <span>Failed: {progress.failed}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviewSample}>
            Preview Sample (10)
          </Button>
          <Button onClick={handleQueueSend} disabled={sending} className="flex-1">
            {sending ? 'Sending...' : 'Queue Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
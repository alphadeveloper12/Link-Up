import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { RefreshCw, RotateCcw, Calendar, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EmailEvent {
  id: string;
  created_at: string;
  type: string;
  provider: string;
  to_email: string;
  subject: string;
  status: string;
  error_message?: string;
  campaign_id?: string;
  payload?: any;
  rendered_html?: string;
}

export function EmailActivityLog() {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EmailEvent | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('email_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching email events:', error);
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async (event: EmailEvent) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-single-email', {
        body: {
          to: event.to_email,
          subject: event.subject,
          html: event.rendered_html || event.payload?.html || '',
          resend: true
        }
      });

      if (error) throw error;
      
      // Refresh the events list
      fetchEvents();
      alert('Email resent successfully!');
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Failed to resend email');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'queued':
        return <Badge className="bg-yellow-100 text-yellow-800">Queued</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      test: 'bg-blue-100 text-blue-800',
      single: 'bg-purple-100 text-purple-800',
      broadcast: 'bg-orange-100 text-orange-800',
      system: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Email Activity Log
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchEvents}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="broadcast">Broadcast</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>

          {/* Events List */}
          <ScrollArea className="h-96">
            {loading ? (
              <p className="text-sm text-gray-500 p-4">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-gray-500 p-4">No email events found</p>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(event.status)}
                        {getTypeBadge(event.type)}
                        <span className="text-xs text-gray-500">{event.provider}</span>
                      </div>
                      <p className="font-medium text-sm">{event.to_email}</p>
                      <p className="text-xs text-gray-600 truncate">{event.subject}</p>
                      {event.error_message && (
                        <p className="text-xs text-red-600 truncate" title={event.error_message}>
                          Error: {event.error_message}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                      {event.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            resendEmail(event);
                          }}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Resend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <SheetContent className="w-[600px] sm:w-[800px]">
          <SheetHeader>
            <SheetTitle>Email Event Details</SheetTitle>
          </SheetHeader>
          {selectedEvent && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedEvent.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="mt-1">{getTypeBadge(selectedEvent.type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Provider</label>
                  <p className="text-sm">{selectedEvent.provider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Sent At</label>
                  <p className="text-sm">{new Date(selectedEvent.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Recipient</label>
                <p className="text-sm">{selectedEvent.to_email}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <p className="text-sm">{selectedEvent.subject}</p>
              </div>

              {selectedEvent.error_message && (
                <div>
                  <label className="text-sm font-medium text-red-600">Error Message</label>
                  <p className="text-sm text-red-600">{selectedEvent.error_message}</p>
                </div>
              )}

              {selectedEvent.rendered_html && (
                <div>
                  <label className="text-sm font-medium">Rendered HTML Preview</label>
                  <div className="mt-2 border rounded-lg p-4 bg-white">
                    <div dangerouslySetInnerHTML={{ __html: selectedEvent.rendered_html }} />
                  </div>
                </div>
              )}

              {selectedEvent.payload && (
                <div>
                  <label className="text-sm font-medium">Raw Payload</label>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
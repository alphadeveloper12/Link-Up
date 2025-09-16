// src/hooks/useExpressInterest.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function useExpressInterest(teamId: string) {
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const { toast } = useToast();

  const expressInterest = async (projectId: string) => {
    setNotifyingId(projectId);
    try {
      const { error } = await supabase.functions.invoke('send-project-interest', {
        body: { projectId, teamId }
      });

      if (error) throw error;

      toast({
        title: 'Interest Sent!',
        description: 'The client has been notified of your interest in this project.',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setNotifyingId(null);
    }
  };

  return { notifyingId, expressInterest };
}

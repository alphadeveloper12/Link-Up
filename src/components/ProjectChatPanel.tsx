import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, Paperclip, Image, FileText, Download, Users, Phone, Video } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  message: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
  message_type: 'text' | 'file' | 'image';
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

interface ProjectChatPanelProps {
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
}

export default function ProjectChatPanel({ projectId, userId, userName, userAvatar }: ProjectChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    subscribeToPresence();
    
    return () => {
      supabase.removeAllChannels();
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };
  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`project-chat-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToPresence = () => {
    const channel = supabase.channel(`presence-${projectId}`, {
      config: { presence: { key: userId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(Object.keys(state));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, user_name: userName });
        }
      });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          project_id: projectId,
          message: newMessage,
          user_id: userId,
          user_name: userName,
          user_avatar: userAvatar,
          message_type: 'text'
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(`${projectId}/chat/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(`${projectId}/chat/${fileName}`);

      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          project_id: projectId,
          message: `Shared ${messageType}: ${file.name}`,
          user_id: userId,
          user_name: userName,
          user_avatar: userAvatar,
          message_type: messageType,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size
        }]);

      if (error) throw error;
      toast.success('File shared successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startVideoCall = () => {
    toast.info('Video call feature coming soon!');
  };

  const startVoiceCall = () => {
    toast.info('Voice call feature coming soon!');
  };

  if (loading) {
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Project Chat</span>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{onlineUsers.length} online</span>
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={startVoiceCall}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={startVideoCall}>
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex items-start space-x-3 ${
                message.user_id === userId ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.user_avatar} />
                  <AvatarFallback>
                    {message.user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 max-w-xs ${
                  message.user_id === userId ? 'text-right' : ''
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{message.user_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {message.message_type === 'image' && message.file_url ? (
                    <div className="mt-2">
                      <img 
                        src={message.file_url} 
                        alt={message.file_name}
                        className="max-w-full h-auto rounded-lg cursor-pointer"
                        onClick={() => window.open(message.file_url, '_blank')}
                      />
                      <p className="text-sm text-muted-foreground mt-1">{message.file_name}</p>
                    </div>
                  ) : message.message_type === 'file' && message.file_url ? (
                    <div className="mt-2 p-3 border rounded-lg bg-muted">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{message.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {message.file_size ? formatFileSize(message.file_size) : ''}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={message.file_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={`mt-1 p-3 rounded-lg ${
                      message.user_id === userId 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" size="sm" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
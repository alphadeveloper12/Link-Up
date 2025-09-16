import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Phone, Video, Paperclip, Smile, Heart, ThumbsUp } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  isUser?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
  hasFile?: boolean;
  fileName?: string;
}

const ChatPanel: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'Welcome to the project! Excited to work with you.',
      timestamp: '10:30 AM',
      reactions: [{ emoji: '👍', count: 2, users: ['You', 'Mike'] }]
    },
    {
      id: '2',
      sender: 'You',
      avatar: '',
      content: 'Thanks! Looking forward to getting started.',
      timestamp: '10:32 AM',
      isUser: true
    },
    {
      id: '3',
      sender: 'Mike Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'Project wireframes uploaded',
      timestamp: '11:15 AM',
      hasFile: true,
      fileName: 'wireframes_v2.pdf'
    }
  ]);

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  const handleFileUpload = () => {
    // Handle file upload
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: reactions.map(r => 
              r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, 'You'] } : r
            )
          };
        } else {
          return {
            ...msg,
            reactions: [...reactions, { emoji, count: 1, users: ['You'] }]
          };
        }
      }
      return msg;
    }));
  };

  return (
    <Card className="h-96 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Team Chat</h3>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Phone className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-xs ${msg.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={msg.avatar} />
                <AvatarFallback>{msg.sender[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className={`p-3 rounded-lg ${msg.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                  {msg.hasFile && (
                    <div className="flex items-center space-x-2 mb-2 p-2 bg-white/10 rounded">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-xs">{msg.fileName}</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.timestamp}
                  </p>
                </div>
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex space-x-1 mt-1">
                    {msg.reactions.map((reaction, idx) => (
                      <button
                        key={idx}
                        onClick={() => addReaction(msg.id, reaction.emoji)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 rounded-full px-2 py-1 flex items-center space-x-1"
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => addReaction(msg.id, '❤️')}
                      className="text-xs bg-gray-200 hover:bg-gray-300 rounded-full px-2 py-1"
                    >
                      <Heart className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2 mb-2">
          <Button size="sm" variant="outline" onClick={handleFileUpload}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatPanel;
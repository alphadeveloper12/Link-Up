import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Bot } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ChatBotConfig {
  id: string;
  system_prompt: string;
  tone: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
}

export const ChatBotAdmin: React.FC = () => {
  const [config, setConfig] = useState<ChatBotConfig>({
    id: '',
    system_prompt: `You are an intelligent AI assistant for a comprehensive project management platform that connects clients with remote teams worldwide. You use GPT-4o to provide conversational, helpful, and personalized assistance.

PLATFORM FEATURES YOU HELP WITH:
- Project posting and requirements definition
- AI-powered team matching and recommendations
- Onboarding and personalized checklists
- Payment processing and escrow management
- Real-time collaboration and chat
- Analytics and performance insights
- Training modules and best practices
- File management and sharing
- Milestone tracking and progress monitoring

CONVERSATION STYLE:
- Be conversational, friendly, and professional
- Ask clarifying questions when needed
- Provide step-by-step guidance
- Offer specific examples and best practices
- Guide users to relevant platform features
- Escalate complex issues to human support when appropriate

Always be helpful, accurate, and guide users toward successful project outcomes.`,
    tone: 'friendly',
    max_tokens: 800,
    temperature: 0.7,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbot_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Error",
        description: "Failed to load chatbot configuration",
        variant: "destructive"
      });
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('chatbot_config')
        .upsert({
          ...config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chatbot configuration updated successfully"
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AI Chatbot Configuration
        </h1>
        <p className="text-gray-600">Manage your AI assistant's behavior and knowledge base</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                value={config.system_prompt}
                onChange={(e) => setConfig(prev => ({ ...prev, system_prompt: e.target.value }))}
                placeholder="Define how the AI should behave and what it should know..."
                rows={6}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  value={config.max_tokens}
                  onChange={(e) => setConfig(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                  min="100"
                  max="1000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  min="0"
                  max="2"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={config.is_active}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is-active">Enable Chatbot</Label>
            </div>

            <Button onClick={saveConfig} disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Platform Features</h4>
                <p className="text-blue-700">Include information about project posting, team matching, payments, and analytics.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Tone & Style</h4>
                <p className="text-green-700">Define whether the bot should be formal, casual, technical, or beginner-friendly.</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">Limitations</h4>
                <p className="text-purple-700">Specify what the bot cannot do and when to escalate to human support.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
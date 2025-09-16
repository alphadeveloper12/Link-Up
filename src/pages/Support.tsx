import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Mail, Phone, FileText, Settings } from 'lucide-react';
import { ChatBot } from '@/components/ChatBot';
import { AISearchBar } from '@/components/AISearchBar';

const Support: React.FC = () => {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const faqs = [
    {
      question: 'How do I post a new project?',
      answer: 'Navigate to the "Post Project" section and fill out the project details form.'
    },
    {
      question: 'How does team matching work?',
      answer: 'Our AI analyzes your project requirements and matches you with suitable teams based on skills and availability.'
    },
    {
      question: 'What payment methods are supported?',
      answer: 'We support all major credit cards, PayPal, and bank transfers through our secure escrow system.'
    }
  ];

  const handleSubmitTicket = () => {
    console.log('Submitting ticket:', ticketForm);
    // Reset form
    setTicketForm({ subject: '', message: '', priority: 'medium' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
          <p className="text-gray-600">Get help with your account, projects, and platform features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Options */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">AI Assistant</p>
                    <p className="text-sm text-gray-600">Get instant help</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@platform.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">1-800-SUPPORT</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submit Ticket */}
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Submit a ticket and we'll get back to you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                />
                <Textarea
                  placeholder="Describe your issue..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
                <div className="flex justify-between items-center">
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <Button onClick={handleSubmitTicket}>Submit Ticket</Button>
                </div>
              </CardContent>
            </Card>
            {/* AI Knowledge Base Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search Knowledge Base</CardTitle>
                <CardDescription>Ask AI about platform features, troubleshooting, and best practices</CardDescription>
              </CardHeader>
              <CardContent>
                <AISearchBar placeholder="Search knowledge base with AI..." />
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-medium mb-2">{faq.question}</h4>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dedicated AI Assistant Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                AI Assistant (GPT-5o)
              </CardTitle>
              <CardDescription>
                Get instant help with onboarding, platform features, and troubleshooting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ChatBot isFloating={false} className="h-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Support;
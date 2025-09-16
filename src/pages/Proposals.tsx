import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Settings } from 'lucide-react';
import ProposalCard from '@/components/ProposalCard';

const Proposals: React.FC = () => {
  const [autoSummarize, setAutoSummarize] = useState(false);

  const mockProposals = [
    {
      id: '1',
      teamName: 'React Ninjas',
      description: 'We specialize in modern React development with TypeScript, Next.js, and advanced state management. Our team has 5+ years of experience building scalable e-commerce platforms with integrated payment systems, user authentication, and real-time features.',
      budget: '$12,000',
      timeline: '5 weeks',
      rating: 4.9
    },
    {
      id: '2',
      teamName: 'Full Stack Masters',
      description: 'Our comprehensive approach includes React frontend, Node.js backend, PostgreSQL database, and AWS deployment. We focus on performance optimization, security best practices, and maintainable code architecture for long-term success.',
      budget: '$15,500',
      timeline: '6 weeks',
      rating: 4.7
    },
    {
      id: '3',
      teamName: 'Digital Innovators',
      description: 'We offer end-to-end e-commerce solutions with custom UI/UX design, mobile-responsive development, payment gateway integration, inventory management, and analytics dashboard. Our agile methodology ensures regular updates and client collaboration.',
      budget: '$18,000',
      timeline: '8 weeks',
      rating: 4.8
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Proposals</h1>
              <p className="text-gray-600">Review and manage proposals for your project</p>
            </div>
            <FileText className="w-12 h-12 text-blue-600" />
          </div>

          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <div>
                  <Label htmlFor="auto-summarize" className="text-sm font-medium">
                    Auto-summarize proposals with AI
                  </Label>
                  <p className="text-xs text-gray-500">
                    Automatically generate AI summaries for all proposals
                  </p>
                </div>
              </div>
              <Switch
                id="auto-summarize"
                checked={autoSummarize}
                onCheckedChange={setAutoSummarize}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {mockProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              autoSummarize={autoSummarize}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {mockProposals.length} proposals received for your project
          </p>
        </div>
      </div>
    </div>
  );
};

export default Proposals;
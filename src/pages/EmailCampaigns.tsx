import React from 'react';
import EmailCampaignManager from '@/components/EmailCampaignManager';

export default function EmailCampaigns() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Campaigns</h1>
        <p className="text-muted-foreground">
          Manage and track your invitation email campaigns to grow your user base.
        </p>
      </div>
      
      <EmailCampaignManager />
    </div>
  );
}
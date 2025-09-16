import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailConsoleTest } from '@/components/EmailConsoleTest';
import { EmailConsoleSingle } from '@/components/EmailConsoleSingle';
import { EmailConsoleBroadcast } from '@/components/EmailConsoleBroadcast';
import { EmailConsoleTemplates } from '@/components/EmailConsoleTemplates';
import { EmailActivityLog } from '@/components/EmailActivityLog';
import { EmailGlobalSettings } from '@/components/EmailGlobalSettings';

export default function EmailConsole() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Console</h1>
              <p className="text-sm text-gray-500">Manage email campaigns and communications</p>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmailConsoleTest />
              <EmailConsoleSingle />
              <EmailConsoleBroadcast />
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <EmailConsoleTemplates />
          </TabsContent>

          <TabsContent value="activity">
            <EmailActivityLog />
          </TabsContent>

          <TabsContent value="settings">
            <EmailGlobalSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
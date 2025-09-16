import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, CheckCircle, AlertCircle, Mail } from 'lucide-react';

export function EmailGlobalSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Global Email Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Primary Provider
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="default">SendGrid</Badge>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <p className="text-xs text-gray-500">
              Primary email delivery service with automatic failover
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Fallback Provider
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Resend</Badge>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Standby</span>
            </div>
            <p className="text-xs text-gray-500">
              Automatic fallback when primary provider fails
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Default Settings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">From Address:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                no-reply@quickenquotes.com
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reply-To:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                support@quickenquotes.com
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Company Name:</span>
              <span className="font-medium">LinkUp</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retry Logic:</span>
              <span className="text-green-600">Automatic fallback enabled</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Automatic Failover</p>
              <p className="text-blue-700">
                If SendGrid fails, emails automatically retry with Resend. 
                All events are logged with provider information.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import Navigation from '@/components/Navigation';
import { AdminUserManagement } from '@/components/AdminUserManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, BarChart3, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
            <p className="text-gray-600 mt-2">System administration and management</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Administrator
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Console
              </CardTitle>
              <CardDescription>Manage email campaigns and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/email-console">
                <Button className="w-full">Open Email Console</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>View system analytics and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/analytics">
                <Button className="w-full" variant="outline">View Analytics</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">Manage Users</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <AdminUserManagement />
        </div>
      </div>
    </div>
  );
};

export default Admin;
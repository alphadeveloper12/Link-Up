import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export function AdminUserManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'list' }
      });

      if (error) throw error;
      setAdmins(data.admins || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    setAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'add', email: newAdminEmail.trim() }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user added successfully"
      });

      setNewAdminEmail('');
      loadAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add admin user",
        variant: "destructive"
      });
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (userId: string, email: string) => {
    if (!confirm(`Remove admin access for ${email}?`)) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'remove', userId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user removed successfully"
      });

      loadAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin user",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin User Management
        </CardTitle>
        <CardDescription>
          Manage users who have administrative access to the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only grant admin access to trusted users. Admins have full system access.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Input
            placeholder="Enter user email to add as admin"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAdmin()}
          />
          <Button onClick={addAdmin} disabled={adding || !newAdminEmail.trim()}>
            <UserPlus className="h-4 w-4 mr-2" />
            {adding ? 'Adding...' : 'Add Admin'}
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Current Admin Users</h3>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : admins.length === 0 ? (
            <div className="text-sm text-muted-foreground">No admin users found</div>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{admin.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Added {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="secondary">{admin.role}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdmin(admin.user_id, admin.email)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
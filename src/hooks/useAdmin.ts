import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function checkAdminStatus() {
      if (!isAuthenticated || !user) {
        setIsAdmin(false);
        setAdminData(null);
        setLoading(false);
        return;
      }

      try {
        // Use the RPC function instead of direct table access
        const { data, error } = await supabase.rpc('is_admin');

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAdminData(null);
        } else {
          setIsAdmin(data || false);
          // If admin, fetch admin data
          if (data) {
            const { data: adminData, error: adminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('user_id', user.id)
              .eq('is_active', true)
              .single();
            
            if (!adminError && adminData) {
              setAdminData(adminData);
            }
          } else {
            setAdminData(null);
          }
        }
      } catch (err) {
        console.error('Admin check error:', err);
        setIsAdmin(false);
        setAdminData(null);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, isAuthenticated]);

  return { isAdmin, adminData, loading };
}
// src/routes/ResetPassword.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const next = params.get('next') || '/start';
  const intent = params.get('intent') || '';

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Capture session from the redirect (hash or code)
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (location.hash.includes('access_token')) {
          const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) throw error;
          // Clean the hash
          window.history.replaceState({}, '', window.location.pathname + window.location.search);
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        setReady(true);
      } catch (err: any) {
        toast({ 
          title: 'Link error', 
          description: err?.message || 'Invalid or expired link.', 
          variant: 'destructive' 
        });
        navigate(`/login?next=${encodeURIComponent(next)}&intent=${intent}`, { replace: true });
      }
    })();
  }, [location.hash, navigate, next, intent, toast]);

  const targetAfterAuth = 
    next ||
    (intent === 'team'
      ? '/team-profile/create'
      : intent === 'client'
      ? '/projects?open=post-project'
      : '/start');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      return toast({ 
        title: 'Password too short', 
        description: 'Use at least 8 characters.', 
        variant: 'destructive' 
      });
    }
    
    if (password !== confirmPassword) {
      return toast({ 
        title: 'Passwords do not match', 
        variant: 'destructive' 
      });
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({ 
        title: 'Password updated', 
        description: 'You are now signed in.' 
      });
      navigate(targetAfterAuth, { replace: true });
    } catch (err: any) {
      toast({ 
        title: 'Could not update password', 
        description: err?.message || 'Try sending a new reset link.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <h1 className="text-2xl font-bold text-blue-600">LinkUp</h1>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Set a new password</CardTitle>
          <CardDescription className="text-gray-600">Enter and confirm your new password</CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying link…</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">New password (min 8 chars)</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  autoComplete="new-password"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm password</Label>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  autoComplete="new-password"
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
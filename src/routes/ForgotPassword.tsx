// src/routes/ForgotPassword.tsx
import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const { toast } = useToast();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const next = params.get('next') || '/start';
  const intent = params.get('intent') || '';
  const origin = window.location.origin;

  // where the email will send users to set a new password
  const redirectTo = `${origin}/auth/reset?next=${encodeURIComponent(next)}&intent=${intent}`;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast({
        title: 'Check your email',
        description: 'We sent a password reset link.',
      });
    } catch (err: any) {
      toast({
        title: 'Could not send reset email',
        description: err?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Forgot password</CardTitle>
          <CardDescription className="text-gray-600">We'll email you a link to reset it</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
            <div className="text-center text-sm text-gray-600">
              <Link to={`/login?next=${encodeURIComponent(next)}&intent=${intent}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                Back to sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
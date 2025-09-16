import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { testAuthRedirectUrls } from '@/utils/auth-test';
import { getDefaultRouteForRole } from '@/utils/routing';

type Mode = 'magic' | 'password';

const Login = () => {
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const next = params.get('next') || '/start';
  const intent = params.get('intent') || '';

  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}&intent=${intent}`;
  const signupHref = `/signup?next=${encodeURIComponent(next)}&intent=${intent}`;
  const forgotHref = `/forgot-password?next=${encodeURIComponent(next)}&intent=${intent}`;

  const targetAfterAuth =
    next ||
    (intent === 'team'
      ? '/team-profile/create'
      : intent === 'client'
      ? '/projects?open=post-project'
      : '/start');

  async function handleMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
    toast({ title: 'Check your email!', description: 'We sent you a magic link to sign in.' });
  }

  async function handlePasswordLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Get user profile to determine role
    let profile = null;
    if (data.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      profile = profileData;
    }
    
    const params = new URLSearchParams(location.search);
    const next = params.get('next');
    const intent = params.get('intent');
    
    const route = next || (intent === 'team' ? '/team-profile/create' : intent === 'client' ? '/projects?open=post-project' : getDefaultRouteForRole(profile?.role));
    navigate(route, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (process.env.NODE_ENV === 'development') testAuthRedirectUrls();
      if (mode === 'magic') await handleMagicLink();
      else await handlePasswordLogin();
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <h1 className="text-2xl font-bold text-blue-600">LinkUp</h1>
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mode toggle */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === 'magic' ? 'default' : 'outline'}
              onClick={() => setMode('magic')}
            >
              Magic link
            </Button>
            <Button
              type="button"
              variant={mode === 'password' ? 'default' : 'outline'}
              onClick={() => setMode('password')}
            >
              Email & password
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            {mode === 'password' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? mode === 'magic'
                  ? 'Sending magic link...'
                  : 'Signing in...'
                : mode === 'magic'
                ? 'Sign in with magic link'
                : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to={forgotHref} className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link to={signupHref} className="text-blue-600 hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
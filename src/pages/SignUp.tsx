import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

// Supabase client
const SUPABASE_URL = 'https://vjpqqsrdtepbvckihekl.supabase.co';
const SUPABASE_ANON = 'sb_publishable_LVqfD06tBkUTGT6vfB5hNw_gis6tnm0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setUser } = useAuth();

  const [mode, setMode] = useState<'magic' | 'password'>('magic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirm: '',
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  // Magic link signup
  async function handleMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) throw error;
    toast({ title: 'Check your email', description: 'Magic link sent!' });
  }

  // Email/password signup
  async function handlePasswordSignUp() {
    if (formData.password.length < 8)
      throw new Error('Password must be at least 8 characters');
    if (formData.password !== formData.confirm)
      throw new Error('Passwords do not match');

    // 1️⃣ Signup user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create auth user');

    const userId = authData.user.id;

    // 2️⃣ Insert profile in public.users — make sure account_type is valid
    const { error: profileError } = await supabase.from('users').insert([
      {
        id: userId,
        email: formData.email,
        full_name: formData.fullName,
        account_type: 'client', // satisfies your CHECK constraint
      },
    ]);

    if (profileError) throw profileError;

    setUser?.(authData.user);

    toast({ title: 'Account created', description: 'You are now signed up!' });
    navigate('/', { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'magic') await handleMagicLink();
      else await handlePasswordSignUp();
    } catch (err: any) {
      toast({
        title: 'Sign-up error',
        description: err?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Join LinkUp and start collaborating</CardDescription>
        </CardHeader>
        <CardContent>
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
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {mode === 'password' && (
              <>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={formData.confirm}
                    onChange={(e) =>
                      setFormData({ ...formData, confirm: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;

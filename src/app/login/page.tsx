'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectTo, setRedirectTo] = useState('/admin/dashboard');
  const router = useRouter();

  // Get redirectTo from URL on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setRedirectTo(params.get('redirectTo') || '/admin/dashboard');
    }
  }, []);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace(redirectTo);
        router.refresh();
      }
    };
    checkAuth();
  }, [router, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user) {
        // Check if user is in admin_users table using service role
        console.log('Checking admin user for email:', data.user.email);
        
        const response = await fetch('/api/admin/check-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: data.user.email }),
        });

        console.log('API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API error:', errorData);
          await supabase.auth.signOut();
          setError(`Access denied. API Error: ${response.status}`);
          return;
        }

        const responseData = await response.json();
        console.log('API response data:', responseData);
        
        const { adminUser } = responseData;

        if (!adminUser || !adminUser.is_active) {
          console.error('Admin user check failed:', { adminUser });
          await supabase.auth.signOut();
          setError('Access denied. User not found in admin table or inactive.');
          return;
        }

        console.log('Admin user found:', adminUser);

        toast.success('Login successful!');
        router.replace(redirectTo);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@craftedanomaly.com"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Authorized personnel only</p>
              <p className="mt-1">Contact system administrator for access</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

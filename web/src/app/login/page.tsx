'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { AuthShell } from '@/components/layout/auth-shell';
import { apiClient } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('userName', response.data.user?.name || 'Staff');
      localStorage.setItem('userRole', response.data.user?.role || 'Owner');
      localStorage.setItem(
        'userPermissions',
        JSON.stringify(response.data.user?.permissions ?? []),
      );
      router.push('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK' || !err.response) {
          setError(
            'Cannot reach the API. Run `npm run dev` in apps/api (http://localhost:3001) and refresh.',
          );
        } else {
          const data = err.response.data as { message?: string | string[] } | undefined;
          let msg = 'Login failed';
          if (typeof data?.message === 'string') msg = data.message;
          else if (Array.isArray(data?.message)) msg = data.message.join(' ');
          setError(msg.length > 220 ? `${msg.slice(0, 217)}…` : msg);
        }
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure workspace"
      showSignupCta={false}
      footer={
        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link href="/" className="font-medium hover:text-foreground">
            ← Back to homepage
          </Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to open your POS and back office tools.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive backdrop-blur-sm">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="flex min-w-0 flex-col gap-2">
            <Label
              htmlFor="email"
              className="block w-full shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@restaurant.com"
              className="min-w-0"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <Label
              htmlFor="password"
              className="block w-full shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="min-w-0 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button type="submit" className="h-11 w-full rounded-xl text-[15px]" loading={loading}>
          Continue
        </Button>
      </form>
    </AuthShell>
  );
}

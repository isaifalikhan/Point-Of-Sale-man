'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/components/layout/auth-shell';
import { apiClient } from '@/lib/api-client';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    businessType: 'RESTAURANT',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/signup', formData);
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('businessType', formData.businessType);
      localStorage.setItem('userRole', response.data.user?.role ?? 'Owner');
      localStorage.setItem(
        'userPermissions',
        JSON.stringify(response.data.user?.permissions ?? []),
      );
      router.push('/dashboard');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      const msg =
        typeof ax.response?.data?.message === 'string'
          ? ax.response.data.message
          : 'Failed to sign up';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const typeChip = (
    mode: 'RESTAURANT' | 'CLOTHING',
    emoji: string,
    title: string,
  ) => (
    <button
      type="button"
      onClick={() => setFormData({ ...formData, businessType: mode })}
      className={cn(
        'relative overflow-hidden rounded-2xl border px-4 py-4 text-left shadow-inner-gloss transition-all',
        formData.businessType === mode
          ? 'border-primary/50 bg-gradient-to-br from-primary/15 via-card/70 to-transparent ring-2 ring-primary/35'
          : 'border-white/35 bg-card/45 hover:border-primary/25 hover:bg-card/65',
      )}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="mt-3 block font-heading text-sm font-bold text-foreground">{title}</span>
    </button>
  );

  return (
    <AuthShell
      eyebrow="Onboarding"
      footer={
        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link href="/" className="font-medium hover:text-foreground">
            ← Back to homepage
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSignup} className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Create your venue</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Spin up tenants, menus, staff, and POS in a couple of minutes.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive backdrop-blur-sm">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          {typeChip('RESTAURANT', '🍽️', 'Restaurant')}
          {typeChip('CLOTHING', '👕', 'Retail')}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Business name
            </Label>
            <Input
              id="businessName"
              placeholder={formData.businessType === 'RESTAURANT' ? 'Pizza Heaven' : 'Urban Style'}
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>
        </div>

        <Button type="submit" className="h-11 w-full rounded-xl text-[15px]" loading={loading}>
          Create workspace
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

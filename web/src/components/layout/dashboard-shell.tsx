'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrandMark } from '@/components/layout/brand-mark';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DASHBOARD_NAV_POS_CTA,
  DASHBOARD_NAV_SETTINGS,
  getSidebarMainItems,
  shouldShowNavItem,
} from '@/config/navigation';
import { cn } from '@/lib/utils';
import { hasAnyPermission, readPermissionsFromStorage } from '@/lib/rbac';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [businessType, setBusinessType] = useState<'RESTAURANT' | 'CLOTHING'>('RESTAURANT');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const isPosMode = pathname.includes('/dashboard/pos');

  useEffect(() => {
    const savedType = localStorage.getItem('businessType') as 'RESTAURANT' | 'CLOTHING' | null;
    if (savedType === 'RESTAURANT' || savedType === 'CLOTHING') {
      setBusinessType(savedType);
    }
    setUserPermissions(readPermissionsFromStorage());
  }, [pathname]);

  const navItems = useMemo(
    () => getSidebarMainItems(businessType, userPermissions),
    [businessType, userPermissions],
  );

  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/dashboard/pos');
    router.prefetch(DASHBOARD_NAV_SETTINGS.href);
    navItems.forEach((item) => router.prefetch(item.href));
  }, [router, navItems]);

  const canOpenPos = hasAnyPermission(
    userPermissions,
    DASHBOARD_NAV_POS_CTA.requiredPermissions as string[],
  );
  const canOpenSettings = shouldShowNavItem(DASHBOARD_NAV_SETTINGS, {
    businessType,
    userPermissions,
  });

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userPermissions');
    setLogoutConfirmOpen(false);
    router.push('/login');
  }

  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-mesh-gradient opacity-70" />
      <div className="relative flex min-h-screen">
        <aside className="sidebar-glass hidden w-64 shrink-0 flex-col border-r border-white/20 md:flex sticky top-0 h-screen overflow-y-auto">
          <div className="flex h-16 items-center border-b border-white/15 px-5">
            <Link href="/dashboard" className="outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
              <BrandMark className="text-sidebar-foreground" />
            </Link>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
            {navItems.map((item) => {
              const active =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                    active
                      ? 'bg-gradient-to-r from-primary via-primary to-indigo-600 text-primary-foreground shadow-gloss-soft'
                      : 'text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0 opacity-90" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="mt-auto border-t border-white/15 pt-4">
              {canOpenPos ? (
                <Link
                  href={DASHBOARD_NAV_POS_CTA.href}
                  className={cn(
                    'relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-bold transition-all',
                    isPosMode
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-gloss-soft ring-2 ring-emerald-300/35'
                      : 'border border-emerald-400/35 bg-gradient-to-br from-emerald-500/15 via-card/70 to-teal-500/10 text-emerald-800 shadow-inner-gloss hover:border-emerald-400/55 hover:shadow-gloss-soft dark:text-emerald-100',
                  )}
                >
                  <span className="shine-overlay absolute inset-0 opacity-40" aria-hidden />
                  <DASHBOARD_NAV_POS_CTA.icon className="relative z-10 h-5 w-5" />
                  <span className="relative z-10">{DASHBOARD_NAV_POS_CTA.label}</span>
                </Link>
              ) : null}
            </div>
          </nav>

          <div className="border-t border-white/15 p-3">
            {canOpenSettings ? (
              <Link
                href={DASHBOARD_NAV_SETTINGS.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground',
                  pathname.startsWith(DASHBOARD_NAV_SETTINGS.href) &&
                    'bg-sidebar-accent text-sidebar-accent-foreground',
                )}
              >
                <DASHBOARD_NAV_SETTINGS.icon className="h-5 w-5" />
                {DASHBOARD_NAV_SETTINGS.label}
              </Link>
            ) : null}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="header-gloss sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 border-b border-white/20 px-3 sm:px-6 shadow-sm backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="truncate font-heading text-base sm:text-lg font-semibold tracking-tight md:text-xl">
                {isPosMode ? 'POS' : 'Dashboard'}
              </h2>
              <span className="hidden shrink-0 rounded-full border border-white/35 bg-card/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-inner-gloss sm:inline">
                {businessType === 'RESTAURANT' ? 'Restaurant' : 'Retail'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              {!isPosMode && canOpenPos ? (
                <Link
                  href="/dashboard/pos"
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 px-2.5 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold text-emerald-900 shadow-inner-gloss transition hover:border-emerald-400/55 hover:shadow-gloss-soft dark:text-emerald-100"
                >
                  <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  POS
                </Link>
              ) : null}
              {isPosMode && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/25 bg-card/75 px-2.5 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold text-primary shadow-inner-gloss transition hover:shadow-gloss-soft"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Admin
                </Link>
              )}

              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 border border-white/40 shadow-inner-gloss">
                <AvatarFallback className="bg-gradient-to-br from-primary/85 to-indigo-600 text-xs sm:text-sm font-semibold text-primary-foreground">
                  POS
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                title="Sign out"
                onClick={() => setLogoutConfirmOpen(true)}
                className="rounded-full p-1.5 sm:p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </header>

          <main
            className={cn(
              'relative flex-1 bg-transparent',
              isPosMode
                ? 'flex min-h-0 flex-col overflow-hidden p-0'
                : 'overflow-auto p-3 sm:p-6 lg:p-8',
            )}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <ConfirmationModal
        isOpen={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Sign out?"
        description="You will need to sign in again to access the dashboard and POS."
        confirmText="Sign out"
        cancelText="Stay signed in"
        type="warning"
        onConfirm={handleLogout}
      />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>
              <BrandMark className="text-foreground" />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all',
                    active
                      ? 'bg-gradient-to-r from-primary via-primary to-indigo-600 text-primary-foreground shadow-gloss-soft'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="mt-4 pt-4 border-t">
              {canOpenPos ? (
                <Link
                  href={DASHBOARD_NAV_POS_CTA.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-bold transition-all',
                    isPosMode
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'border border-emerald-400/35 bg-emerald-50 text-emerald-800',
                  )}
                >
                  <DASHBOARD_NAV_POS_CTA.icon className="h-5 w-5" />
                  <span>{DASHBOARD_NAV_POS_CTA.label}</span>
                </Link>
              ) : null}
            </div>

            {canOpenSettings ? (
              <Link
                href={DASHBOARD_NAV_SETTINGS.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground mt-2',
                  pathname.startsWith(DASHBOARD_NAV_SETTINGS.href) &&
                    'bg-accent text-accent-foreground',
                )}
              >
                <DASHBOARD_NAV_SETTINGS.icon className="h-5 w-5" />
                {DASHBOARD_NAV_SETTINGS.label}
              </Link>
            ) : null}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

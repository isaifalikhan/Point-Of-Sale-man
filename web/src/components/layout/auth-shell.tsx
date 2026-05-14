import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { BRAND } from "@/config/brand";

type AuthShellProps = {
  children: ReactNode;
  /** e.g. "Welcome back" */
  eyebrow?: string;
  footer?: ReactNode;
  /** When false, hides the header link to signup (e.g. on login). */
  showSignupCta?: boolean;
};

export function AuthShell({ children, eyebrow, footer, showSignupCta = true }: AuthShellProps) {
  return (
    <div className="luxury-marketing relative min-h-screen overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(212,166,79,0.1),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-24 h-[480px] w-[480px] rounded-full bg-primary/25 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[90px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" className="rounded-xl outline-none ring-offset-[#0B0B0B] focus-visible:ring-2 focus-visible:ring-[#D4A64F]/60">
          <BrandMark className="text-[#F5F5F5]" iconClassName="lux-gold-gradient text-[#0B0B0B] shadow-none ring-0" />
        </Link>
        {showSignupCta ? (
          <Link
            href="/signup"
            className="glass-panel hidden rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground shadow-sm hover:bg-card/90 sm:inline-flex"
          >
            New business
          </Link>
        ) : null}
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-10 px-4 pb-14 pt-6 md:grid-cols-[1.05fr_1fr] md:items-center md:px-8 lg:max-w-7xl">
        <section className="hidden select-none md:block">
          <div className="glass-panel relative overflow-hidden rounded-3xl p-10 shadow-gloss-lg">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-primary/15" />
            <div className="shine-overlay pointer-events-none" />
            {eyebrow && (
              <p className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-white/35 bg-card/55 px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-inner-gloss backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                {eyebrow}
              </p>
            )}
            <h1 className="relative font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.1] tracking-tight text-[#F5F5F5] lg:text-[2.65rem]">
              Run service, menus, and staff from one{' '}
              <span className="lux-text-gradient">luminous</span>{' '}
              command center.
            </h1>
            <p className="relative mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              {BRAND.shortDescription}
            </p>

            <div className="relative mt-10 grid gap-3 sm:grid-cols-2">
              {[
                { k: 'Live orders', v: 'KDS synced' },
                { k: 'Inventory', v: 'Low-stock signals' },
                { k: 'Roles', v: 'POS-safe permissions' },
                { k: 'Analytics', v: 'Shift-ready insights' },
              ].map((row) => (
                <div
                  key={row.k}
                  className="rounded-2xl border border-white/30 bg-card/35 px-4 py-3 text-sm shadow-inner-gloss backdrop-blur-md"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{row.k}</p>
                  <p className="mt-1 font-semibold text-foreground">{row.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-md md:mx-0">
          <div className="glass-panel glow-ring relative rounded-3xl p-px shadow-gloss-lg">
            <div className="rounded-[1.4rem] bg-card/80 p-6 shadow-inner-gloss backdrop-blur-2xl sm:p-8">
              {children}
            </div>
          </div>
          {footer}
        </section>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/layout/brand-mark';
import { BRAND } from '@/config/brand';
import { 
  ArrowRight,
  Store,
  ChefHat,
  Package,
  LineChart,
  Users,
  TableIcon,
  CheckCircle2,
  Zap,
  CreditCard,
  Smartphone,
  Wifi,
  WifiOff,
  Split,
  Receipt,
  Clock,
  AlertTriangle,
  Utensils,
  TrendingUp,
  Calendar,
  Shield,
  Cloud,
  Bell,
  Sparkles
} from 'lucide-react';

export default function FeaturesPage() {
  const mainFeatures = [
    {
      id: 'pos',
      icon: Store,
      title: BRAND.features.pos.title,
      description: BRAND.features.pos.description,
      highlights: BRAND.features.pos.highlights,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/20 to-purple-500/10',
      details: [
        { icon: Smartphone, title: 'Touch-optimized', desc: 'Designed for tablets and touchscreens with large tap targets and swipe gestures.' },
        { icon: Split, title: 'Bill splitting', desc: 'Split by item, seat, or percentage. Handle even the most complex group tabs.' },
        { icon: WifiOff, title: 'Offline mode', desc: 'Keep taking orders even if your internet goes down. Syncs automatically when back online.' },
        { icon: Receipt, title: 'Digital receipts', desc: 'Email or SMS receipts to reduce paper waste and build your customer database.' },
      ],
    },
    {
      id: 'kds',
      icon: ChefHat,
      title: BRAND.features.kds.title,
      description: BRAND.features.kds.description,
      highlights: BRAND.features.kds.highlights,
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-500/20 to-amber-500/10',
      details: [
        { icon: Zap, title: 'Instant routing', desc: 'Orders appear on the right station screen the moment they\'re placed.' },
        { icon: Clock, title: 'Prep timers', desc: 'Track how long each dish takes. Identify bottlenecks and optimize your kitchen flow.' },
        { icon: AlertTriangle, title: 'Allergy alerts', desc: 'Critical allergy information is highlighted prominently on every ticket.' },
        { icon: Bell, title: 'Rush alerts', desc: 'Get notified when orders are backing up so you can call for backup.' },
      ],
    },
    {
      id: 'inventory',
      icon: Package,
      title: BRAND.features.inventory.title,
      description: BRAND.features.inventory.description,
      highlights: BRAND.features.inventory.highlights,
      gradient: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-500/20 to-pink-500/10',
      details: [
        { icon: Utensils, title: 'Recipe costing', desc: 'Know exactly what each dish costs to make. Price your menu for profit.' },
        { icon: TrendingUp, title: 'Auto-deduction', desc: 'Inventory updates automatically as you sell. No manual counting needed.' },
        { icon: Bell, title: 'Low-stock alerts', desc: 'Get notified before you run out. Never 86 a popular item again.' },
        { icon: Calendar, title: 'Par levels', desc: 'Set minimum quantities and generate automatic purchase orders.' },
      ],
    },
    {
      id: 'analytics',
      icon: LineChart,
      title: BRAND.features.analytics.title,
      description: BRAND.features.analytics.description,
      highlights: BRAND.features.analytics.highlights,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-500/20 to-green-500/10',
      details: [
        { icon: TrendingUp, title: 'Sales heatmaps', desc: 'See your busiest hours and days at a glance. Staff smarter, not harder.' },
        { icon: Sparkles, title: 'Menu insights', desc: 'Identify your stars and dogs. Know what to promote and what to retire.' },
        { icon: Users, title: 'Staff metrics', desc: 'Track sales per server, average check size, and upsell performance.' },
        { icon: CreditCard, title: 'Payment breakdown', desc: 'See how customers pay. Track cash vs card, tips, and more.' },
      ],
    },
    {
      id: 'staff',
      icon: Users,
      title: BRAND.features.staff.title,
      description: BRAND.features.staff.description,
      highlights: BRAND.features.staff.highlights,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-500/20 to-cyan-500/10',
      details: [
        { icon: Shield, title: 'Role permissions', desc: 'Control who can void orders, apply discounts, or access reports.' },
        { icon: Clock, title: 'Time clock', desc: 'Built-in punch in/out. Track hours and export for payroll.' },
        { icon: CreditCard, title: 'Tip tracking', desc: 'Track tips by shift and server. Support tip pooling and tip-out.' },
        { icon: Calendar, title: 'Scheduling', desc: 'Build schedules, manage availability, and handle shift swaps.' },
      ],
    },
    {
      id: 'tables',
      icon: TableIcon,
      title: BRAND.features.tables.title,
      description: BRAND.features.tables.description,
      highlights: BRAND.features.tables.highlights,
      gradient: 'from-indigo-500 to-blue-600',
      bgGradient: 'from-indigo-500/20 to-blue-500/10',
      details: [
        { icon: Sparkles, title: 'Visual layout', desc: 'Drag-and-drop floor plan that matches your actual space.' },
        { icon: Clock, title: 'Table timers', desc: 'See how long tables have been seated. Optimize turnover.' },
        { icon: Users, title: 'Merge & transfer', desc: 'Combine tables for large parties or transfer checks between servers.' },
        { icon: Bell, title: 'Wait management', desc: 'Track your waitlist and text guests when their table is ready.' },
      ],
    },
  ];

  const additionalFeatures = [
    { icon: Cloud, title: 'Cloud-based', desc: 'Access from anywhere. No local servers to maintain.' },
    { icon: Shield, title: 'Bank-level security', desc: 'SOC 2 compliant with end-to-end encryption.' },
    { icon: Wifi, title: 'Real-time sync', desc: 'All devices stay perfectly in sync, instantly.' },
    { icon: Smartphone, title: 'Mobile app', desc: 'Check sales and manage from your phone.' },
    { icon: Zap, title: 'API access', desc: 'Integrate with your existing tools and workflows.' },
    { icon: Users, title: 'Multi-location', desc: 'Manage all your locations from one dashboard.' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-[0.85]" />
      <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-44 bottom-1/3 h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/25 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-1/3 h-[32rem] w-[32rem] rounded-full bg-cyan-400/15 blur-[100px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <header className="sticky top-0 z-50 border-b border-white/30 bg-[oklch(1_0_0_/0.55)] px-6 py-4 shadow-inner-gloss backdrop-blur-xl md:px-10">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6">
          <Link href="/" className="rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
            <BrandMark />
          </Link>
          <nav className="hidden gap-8 text-xs font-bold uppercase tracking-wider text-muted-foreground md:flex">
            <Link href="/features" className="text-foreground">Features</Link>
            <Link href="/#testimonials" className="transition hover:text-foreground">Testimonials</Link>
            <Link href="/#pricing" className="transition hover:text-foreground">Pricing</Link>
            <Link href="/about" className="transition hover:text-foreground">About</Link>
            <Link href="/contact" className="transition hover:text-foreground">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">Sign in</Link>
            <Link href="/signup">
              <Button className="h-10 rounded-full bg-gradient-to-b from-primary to-[oklch(0.44_0.19_268)] px-6 shadow-gloss-soft ring-1 ring-white/20">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-16 pt-16 text-center md:px-8 md:pt-24">
          <span className="glass-panel relative mb-7 inline-flex items-center gap-2 overflow-hidden rounded-full border-white/35 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary shadow-inner-gloss">
            <Zap className="size-4" aria-hidden />
            Powerful Features
          </span>
          <h1 className="font-heading mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
              run your restaurant
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            From taking orders to tracking inventory, from kitchen tickets to end-of-day reports — RestoOS handles it all in one beautiful, unified platform.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="h-14 rounded-full px-10 text-base shadow-gloss-lg ring-1 ring-white/40">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="h-14 rounded-full border-white/40 bg-card/50 px-10 text-base shadow-inner-gloss backdrop-blur-md">
                Schedule demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Quick Nav */}
        <section className="border-t border-white/10 py-8">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-wrap justify-center gap-3">
              {mainFeatures.map((feature) => (
                <a
                  key={feature.id}
                  href={`#${feature.id}`}
                  className="glass-panel flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground shadow-gloss-soft transition-all hover:shadow-gloss-lg"
                >
                  <feature.icon className="h-4 w-4 text-primary" />
                  {feature.title.replace('Lightning-Fast ', '').replace('Smart ', '').replace('Actionable ', '')}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        {mainFeatures.map((feature, idx) => (
          <section
            key={feature.id}
            id={feature.id}
            className={`py-20 ${idx % 2 === 0 ? 'border-t border-white/20 bg-card/30 backdrop-blur-sm' : ''}`}
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className={`grid items-center gap-12 lg:grid-cols-2 ${idx % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                {/* Content */}
                <div className={idx % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.bgGradient} text-primary shadow-inner-gloss ring-1 ring-white/40`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {feature.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        <span className="font-medium text-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Feature Details Grid */}
                <div className={`grid gap-4 sm:grid-cols-2 ${idx % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  {feature.details.map((detail, i) => (
                    <div key={i} className="glass-panel group hover-scale relative overflow-hidden rounded-2xl p-6 shadow-gloss-soft transition-all hover:shadow-gloss-lg">
                      <div className="shine-overlay pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-20" />
                      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.bgGradient} text-primary shadow-inner-gloss ring-1 ring-white/40`}>
                        <detail.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground">{detail.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Additional Features */}
        <section className="border-t border-white/20 bg-card/30 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Plus everything else you'd expect
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Built-in capabilities that make RestoOS a complete solution.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {additionalFeatures.map((feature, i) => (
                <div key={i} className="glass-panel flex items-start gap-4 rounded-2xl p-6 shadow-gloss-soft">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/10 text-primary shadow-inner-gloss ring-1 ring-white/40">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary/10 via-indigo-500/5 to-fuchsia-500/10 py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Ready to see it in action?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Start your free 14-day trial today. No credit card required. Full access to all features.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="h-14 rounded-full px-10 text-base shadow-gloss-lg ring-1 ring-white/40">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="h-14 rounded-full border-white/40 bg-card/50 px-10 text-base shadow-inner-gloss backdrop-blur-md">
                  Schedule a demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950 px-6 py-14 text-slate-400">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <BrandMark className="text-white" iconClassName="shadow-gloss-icon" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-500">{BRAND.shortDescription}</p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white">Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} {BRAND.name}. Crafted for high-traffic hospitality.
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/layout/brand-mark';
import { BRAND } from '@/config/brand';
import { 
  CheckCircle2, 
  Utensils, 
  LayoutDashboard, 
  Store, 
  Users, 
  LineChart,
  Zap,
  Shield,
  Globe,
  Clock,
  ArrowRight,
  Star,
  ChefHat,
  CreditCard,
  Package,
  TableIcon,
  Play
} from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-[0.85]" />
      <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-44 bottom-0 h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/25 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 rounded-full bg-cyan-400/15 blur-[100px]" />
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
            <Link href="#features" className="transition hover:text-foreground">
              Features
            </Link>
            <Link href="#testimonials" className="transition hover:text-foreground">
              Testimonials
            </Link>
            <Link href="#pricing" className="transition hover:text-foreground">
              Pricing
            </Link>
            <Link href="/about" className="transition hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-foreground">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
              Sign in
            </Link>
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
        <section className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-16 text-center md:px-8 md:pb-24 md:pt-24 lg:pb-28">
          <span className="glass-panel relative mb-7 inline-flex items-center gap-2 overflow-hidden rounded-full border-white/35 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary shadow-inner-gloss">
            <Utensils className="size-4" aria-hidden />
            {BRAND.tagline}
          </span>
          <h1 className="font-heading mx-auto max-w-5xl text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Run your restaurant like a{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                well-oiled machine
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary via-indigo-500 to-fuchsia-500 opacity-50" />
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {BRAND.longDescription}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="group h-14 rounded-full px-10 text-base shadow-gloss-lg ring-1 ring-white/40"
              >
                Start 14-day free trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-white/40 bg-card/50 px-10 text-base shadow-inner-gloss backdrop-blur-md"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch demo
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: BRAND.stats.restaurants, label: 'Restaurants', icon: Store },
              { value: BRAND.stats.transactions, label: 'Transactions', icon: CreditCard },
              { value: BRAND.stats.countries, label: 'Countries', icon: Globe },
              { value: BRAND.stats.uptime, label: 'Uptime', icon: Shield },
            ].map((stat, i) => (
              <div key={i} className="glass-panel rounded-2xl px-4 py-5 text-center shadow-gloss-soft">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary/70" />
                <p className="text-2xl font-bold text-foreground md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-16 w-full max-w-5xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/50 via-violet-500/40 to-fuchsia-400/50 opacity-80 blur-2xl" />
            <div className="glass-panel glow-ring relative aspect-video overflow-hidden rounded-[1.35rem] p-1 shadow-gloss-lg">
              <div className="shine-overlay pointer-events-none absolute inset-0 z-10 opacity-30" />
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 md:min-h-[320px]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <LayoutDashboard className="mb-3 h-12 w-12 text-white/30" />
                <p className="text-sm font-mono text-white/40">Live dashboard preview</p>
                <p className="mt-2 text-xs text-white/25">Orders • Kitchen • Analytics • Inventory</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="border-t border-white/10 py-12">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">
              Trusted by restaurants worldwide
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
              {['Fine Dining Co.', 'Quick Bites', 'Urban Kitchen', 'The Grill House', 'Sushi Express'].map((name, i) => (
                <span key={i} className="text-lg font-bold tracking-tight text-foreground/70">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-white/20 bg-card/30 py-24 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Zap className="h-3.5 w-3.5" />
                Powerful Features
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Everything you need to run service
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                From the moment a customer walks in to the final report at closing — we've got every step covered.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Store,
                  title: BRAND.features.pos.title,
                  desc: BRAND.features.pos.description,
                  gradient: 'from-violet-500/20 to-purple-500/10',
                },
                {
                  icon: ChefHat,
                  title: BRAND.features.kds.title,
                  desc: BRAND.features.kds.description,
                  gradient: 'from-orange-500/20 to-amber-500/10',
                },
                {
                  icon: Users,
                  title: BRAND.features.staff.title,
                  desc: BRAND.features.staff.description,
                  gradient: 'from-blue-500/20 to-cyan-500/10',
                },
                {
                  icon: LineChart,
                  title: BRAND.features.analytics.title,
                  desc: BRAND.features.analytics.description,
                  gradient: 'from-emerald-500/20 to-green-500/10',
                },
                {
                  icon: Package,
                  title: BRAND.features.inventory.title,
                  desc: BRAND.features.inventory.description,
                  gradient: 'from-rose-500/20 to-pink-500/10',
                },
                {
                  icon: TableIcon,
                  title: BRAND.features.tables.title,
                  desc: BRAND.features.tables.description,
                  gradient: 'from-indigo-500/20 to-blue-500/10',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="glass-panel group hover-scale relative overflow-hidden rounded-2xl p-8 shadow-gloss-soft transition-all hover:shadow-gloss-lg"
                >
                  <div className="shine-overlay pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-20" />
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-primary shadow-inner-gloss ring-1 ring-white/40`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/features">
                <Button variant="outline" className="h-12 rounded-full border-white/40 bg-card/50 px-8 shadow-inner-gloss backdrop-blur-md">
                  Explore all features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <Clock className="h-3.5 w-3.5" />
                Quick Setup
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Up and running in minutes
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                No complicated setup. No expensive hardware. Just sign up, configure your menu, and start serving.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: '01', title: 'Create your account', desc: 'Sign up in under a minute. No credit card required for the trial.' },
                { step: '02', title: 'Configure your menu', desc: 'Import your menu or build it from scratch with our intuitive editor.' },
                { step: '03', title: 'Start taking orders', desc: 'Train your staff in minutes and go live the same day.' },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="glass-panel relative rounded-2xl p-8 shadow-gloss-soft">
                    <span className="absolute -top-4 left-6 rounded-full bg-gradient-to-br from-primary to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-gloss-icon">
                      {item.step}
                    </span>
                    <h3 className="mt-4 font-heading text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-muted-foreground">{item.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-gradient-to-r from-primary/40 to-transparent md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="border-t border-white/20 bg-card/30 py-24 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                Testimonials
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Loved by restaurants everywhere
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Don't just take our word for it. Here's what restaurant owners are saying about RestoOS.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {BRAND.testimonials.map((testimonial, i) => (
                <div key={i} className="glass-panel relative overflow-hidden rounded-2xl p-8 shadow-gloss-soft">
                  <div className="shine-overlay pointer-events-none absolute inset-0 opacity-10" />
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-lg leading-relaxed text-foreground/90">"{testimonial.quote}"</p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 font-bold text-white shadow-gloss-icon">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-600">
              <CreditCard className="h-3.5 w-3.5" />
              Pricing
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              No hidden fees. No long-term contracts. Upgrade or downgrade anytime.
            </p>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 text-left md:grid-cols-3">
              {[
                {
                  name: 'Starter',
                  price: '$49',
                  desc: 'Perfect for small cafes and food trucks getting started.',
                  features: ['1 location', 'Core POS features', 'Basic analytics', 'Email support', '1,000 orders/month'],
                },
                {
                  name: 'Professional',
                  price: '$99',
                  desc: 'For growing restaurants that need more power.',
                  popular: true,
                  features: ['Up to 3 locations', 'POS + Kitchen Display', 'Inventory management', 'Staff management', 'Priority support', 'Unlimited orders'],
                },
                {
                  name: 'Enterprise',
                  price: '$199',
                  desc: 'For chains and franchises with complex needs.',
                  features: ['Unlimited locations', 'Full API access', 'Custom integrations', 'Advanced analytics', '24/7 phone support', 'Dedicated account manager'],
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col rounded-3xl p-8 transition-all ${
                    plan.popular
                      ? 'glass-panel scale-[1.02] border-primary/40 shadow-gloss-lg ring-2 ring-primary/25'
                      : 'glass-panel border-white/40 shadow-gloss-soft hover:shadow-gloss-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-4 py-1 text-xs font-bold text-primary-foreground shadow-gloss-soft">
                      Most popular
                    </div>
                  )}
                  <h3 className="font-heading text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-2 min-h-12 text-sm text-muted-foreground">{plan.desc}</p>
                  <p className="mt-6 text-5xl font-extrabold text-foreground">
                    {plan.price}
                    <span className="text-lg font-medium text-muted-foreground">/mo</span>
                  </p>
                  <ul className="mt-8 flex-1 space-y-4">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex gap-3 text-foreground/90">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button
                      className={`mt-10 h-12 w-full rounded-xl text-base ${
                        plan.popular
                          ? 'bg-gradient-to-b from-primary to-[oklch(0.44_0.19_268)] shadow-gloss-soft'
                          : 'bg-secondary/80 text-secondary-foreground shadow-inner-gloss'
                      }`}
                    >
                      Start free trial
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-white/20 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-fuchsia-500/10 py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Ready to transform your restaurant?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Join thousands of restaurants already using RestoOS. Start your free trial today — no credit card required.
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
                  Talk to sales
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
              <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white">Integrations</Link></li>
              <li><Link href="#" className="hover:text-white">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
              <li><Link href="#" className="hover:text-white">Press</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white">Security</Link></li>
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

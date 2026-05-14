import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/layout/brand-mark';
import { BRAND } from '@/config/brand';
import { 
  ArrowRight, 
  Heart, 
  Lightbulb, 
  Target, 
  Users,
  Zap,
  Globe,
  Award,
  Coffee
} from 'lucide-react';

export default function AboutPage() {
  const team = [
    { name: 'Alex Rivera', role: 'CEO & Co-founder', avatar: 'AR', bio: 'Former restaurant owner turned tech entrepreneur.' },
    { name: 'Priya Sharma', role: 'CTO & Co-founder', avatar: 'PS', bio: '15 years building enterprise software at scale.' },
    { name: 'Marcus Chen', role: 'Head of Product', avatar: 'MC', bio: 'Obsessed with creating intuitive user experiences.' },
    { name: 'Elena Kowalski', role: 'Head of Customer Success', avatar: 'EK', bio: 'Ensuring every restaurant thrives with RestoOS.' },
    { name: 'David Okonkwo', role: 'Lead Engineer', avatar: 'DO', bio: 'Making the impossible possible, one feature at a time.' },
    { name: 'Sophie Martinez', role: 'Head of Design', avatar: 'SM', bio: 'Turning complex workflows into beautiful simplicity.' },
  ];

  const values = [
    { icon: Lightbulb, title: 'Simplicity First', desc: 'We believe powerful software doesn't have to be complicated. Every feature we build passes the "busy Friday night" test.' },
    { icon: Heart, title: 'Customer Obsession', desc: 'Our customers aren't just users — they're partners. We listen, learn, and build what actually helps them succeed.' },
    { icon: Zap, title: 'Speed Matters', desc: 'In hospitality, every second counts. We optimize relentlessly for performance because your customers are waiting.' },
    { icon: Target, title: 'Relentless Improvement', desc: 'We ship updates weekly. Good enough never is. There's always a better way, and we're determined to find it.' },
  ];

  const milestones = [
    { year: '2020', title: 'Founded', desc: 'RestoOS was born out of frustration with clunky legacy POS systems.' },
    { year: '2021', title: 'First 100 customers', desc: 'Word spread quickly among restaurant owners looking for a better way.' },
    { year: '2022', title: 'Series A', desc: 'Raised $12M to accelerate product development and expansion.' },
    { year: '2023', title: 'International launch', desc: 'Expanded to 15 countries across North America and Europe.' },
    { year: '2024', title: '2,000+ restaurants', desc: 'Crossed the milestone of serving over 2,000 active restaurants.' },
    { year: '2025', title: 'AI-powered features', desc: 'Launched intelligent forecasting and automated inventory management.' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-[0.85]" />
      <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-44 bottom-1/3 h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/25 blur-[100px]" />
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
            <Link href="/#features" className="transition hover:text-foreground">Features</Link>
            <Link href="/#testimonials" className="transition hover:text-foreground">Testimonials</Link>
            <Link href="/#pricing" className="transition hover:text-foreground">Pricing</Link>
            <Link href="/about" className="text-foreground">About</Link>
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
            <Heart className="size-4" aria-hidden />
            Our Story
          </span>
          <h1 className="font-heading mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Building the future of{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
              restaurant technology
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            We started RestoOS because we believed restaurants deserved better software — tools that are as fast, 
            intuitive, and reliable as the teams that use them.
          </p>
        </section>

        {/* Mission Section */}
        <section className="border-t border-white/20 bg-card/30 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Target className="h-3.5 w-3.5" />
                  Our Mission
                </span>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Empowering restaurants to focus on what matters
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Every restaurant owner got into the business because they love food, hospitality, and bringing 
                  people together — not because they wanted to wrestle with complicated software.
                </p>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  Our mission is to build tools that fade into the background, letting your team deliver 
                  exceptional experiences without the tech getting in the way.
                </p>
              </div>
              <div className="glass-panel relative overflow-hidden rounded-3xl p-8 shadow-gloss-lg">
                <div className="shine-overlay pointer-events-none absolute inset-0 opacity-20" />
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: BRAND.stats.restaurants, label: 'Restaurants' },
                    { value: BRAND.stats.transactions, label: 'Transactions' },
                    { value: BRAND.stats.countries, label: 'Countries' },
                    { value: BRAND.stats.uptime, label: 'Uptime' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Origin Story */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="glass-panel relative overflow-hidden rounded-3xl p-10 shadow-gloss-lg md:p-14">
              <div className="shine-overlay pointer-events-none absolute inset-0 opacity-15" />
              <Coffee className="mb-6 h-12 w-12 text-primary" />
              <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">How it all started</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  In 2020, our co-founder Alex Rivera was running a bustling tapas bar in Austin. Like most 
                  restaurant owners, he was juggling a dozen systems — a clunky POS from the 90s, spreadsheets 
                  for inventory, paper tickets flying around the kitchen, and endless hours reconciling everything.
                </p>
                <p>
                  One chaotic Friday night, after the third order got lost between the bar and kitchen, Alex 
                  turned to his friend Priya (a software engineer) and said: "There has to be a better way."
                </p>
                <p>
                  That conversation sparked RestoOS. We set out to build the system Alex wished he had — one 
                  that's beautiful, blazing fast, and actually designed for how restaurants really work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="border-t border-white/20 bg-card/30 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <Award className="h-3.5 w-3.5" />
                Our Values
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                What we believe in
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {values.map((value, i) => (
                <div key={i} className="glass-panel group hover-scale relative overflow-hidden rounded-2xl p-8 shadow-gloss-soft transition-all hover:shadow-gloss-lg">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/10 text-primary shadow-inner-gloss ring-1 ring-white/40">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground">{value.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-600">
                <Globe className="h-3.5 w-3.5" />
                Our Journey
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Milestones along the way
              </h2>
            </div>
            <div className="relative space-y-8">
              <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-primary/50 via-indigo-500/30 to-fuchsia-500/20 md:left-1/2" />
              {milestones.map((milestone, i) => (
                <div key={i} className={`relative flex flex-col gap-4 md:flex-row ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="ml-20 md:ml-0 md:w-1/2 md:px-8">
                    <div className="glass-panel rounded-2xl p-6 shadow-gloss-soft">
                      <span className="text-sm font-bold text-primary">{milestone.year}</span>
                      <h3 className="mt-1 font-heading text-lg font-bold text-foreground">{milestone.title}</h3>
                      <p className="mt-2 text-muted-foreground">{milestone.desc}</p>
                    </div>
                  </div>
                  <div className="absolute left-6 top-6 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 ring-4 ring-background md:left-1/2 md:-translate-x-1/2" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="border-t border-white/20 bg-card/30 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                <Users className="h-3.5 w-3.5" />
                Our Team
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                The people behind RestoOS
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                A passionate team of engineers, designers, and hospitality veterans building the future of restaurant tech.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member, i) => (
                <div key={i} className="glass-panel group hover-scale relative overflow-hidden rounded-2xl p-6 text-center shadow-gloss-soft transition-all hover:shadow-gloss-lg">
                  <div className="shine-overlay pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-20" />
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-2xl font-bold text-white shadow-gloss-icon">
                    {member.avatar}
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary/10 via-indigo-500/5 to-fuchsia-500/10 py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Want to join us?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We're always looking for talented people who are passionate about building great software for the hospitality industry.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="#">
                <Button size="lg" className="h-14 rounded-full px-10 text-base shadow-gloss-lg ring-1 ring-white/40">
                  View open positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="h-14 rounded-full border-white/40 bg-card/50 px-10 text-base shadow-inner-gloss backdrop-blur-md">
                  Get in touch
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

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandMark } from '@/components/layout/brand-mark';
import { BRAND } from '@/config/brand';
import { 
  ArrowRight,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Clock,
  Send,
  Headphones,
  BookOpen,
  Users
} from 'lucide-react';

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email us',
      desc: 'For general inquiries and support',
      value: 'hello@restoos.com',
      action: 'mailto:hello@restoos.com',
    },
    {
      icon: Phone,
      title: 'Call us',
      desc: 'Mon-Fri, 9am-6pm EST',
      value: '+1 (555) 123-4567',
      action: 'tel:+15551234567',
    },
    {
      icon: MessageSquare,
      title: 'Live chat',
      desc: 'Average response time: 2 min',
      value: 'Start a conversation',
      action: '#',
    },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: 'Help Center',
      desc: 'Browse our knowledge base for tutorials, FAQs, and troubleshooting guides.',
      link: '#',
    },
    {
      icon: Users,
      title: 'Community',
      desc: 'Join our community of restaurant owners sharing tips and best practices.',
      link: '#',
    },
    {
      icon: Headphones,
      title: 'Schedule a Demo',
      desc: 'See RestoOS in action with a personalized walkthrough from our team.',
      link: '#',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-[0.85]" />
      <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-44 bottom-1/3 h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/25 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 rounded-full bg-emerald-400/15 blur-[100px]" />
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
            <Link href="/about" className="transition hover:text-foreground">About</Link>
            <Link href="/contact" className="text-foreground">Contact</Link>
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
        <section className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-12 pt-16 text-center md:px-8 md:pt-24">
          <span className="glass-panel relative mb-7 inline-flex items-center gap-2 overflow-hidden rounded-full border-white/35 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary shadow-inner-gloss">
            <MessageSquare className="size-4" aria-hidden />
            Get in touch
          </span>
          <h1 className="font-heading mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            We'd love to{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
              hear from you
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Have questions about RestoOS? Want to schedule a demo? Our team is here to help you find the perfect solution for your restaurant.
          </p>
        </section>

        {/* Contact Methods */}
        <section className="py-12">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {contactMethods.map((method, i) => (
                <a
                  key={i}
                  href={method.action}
                  className="glass-panel group hover-scale relative overflow-hidden rounded-2xl p-6 text-center shadow-gloss-soft transition-all hover:shadow-gloss-lg"
                >
                  <div className="shine-overlay pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-20" />
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/10 text-primary shadow-inner-gloss ring-1 ring-white/40">
                    <method.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">{method.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{method.desc}</p>
                  <p className="mt-3 font-semibold text-primary group-hover:underline">{method.value}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content: Form + Info */}
        <section className="border-t border-white/20 bg-card/30 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div className="glass-panel relative overflow-hidden rounded-3xl p-8 shadow-gloss-lg md:p-10">
                <div className="shine-overlay pointer-events-none absolute inset-0 opacity-15" />
                <h2 className="font-heading text-2xl font-bold text-foreground">Send us a message</h2>
                <p className="mt-2 text-muted-foreground">Fill out the form and we'll get back to you within 24 hours.</p>
                
                <form className="mt-8 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="h-12 rounded-xl border-white/40 bg-white/50 shadow-inner-gloss backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="h-12 rounded-xl border-white/40 bg-white/50 shadow-inner-gloss backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@restaurant.com"
                      className="h-12 rounded-xl border-white/40 bg-white/50 shadow-inner-gloss backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="restaurant" className="text-sm font-medium">Restaurant name</Label>
                    <Input
                      id="restaurant"
                      placeholder="The Best Bistro"
                      className="h-12 rounded-xl border-white/40 bg-white/50 shadow-inner-gloss backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                    <select
                      id="subject"
                      className="flex h-12 w-full rounded-xl border border-white/40 bg-white/50 px-4 text-sm shadow-inner-gloss backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a topic...</option>
                      <option value="sales">Sales inquiry</option>
                      <option value="demo">Schedule a demo</option>
                      <option value="support">Technical support</option>
                      <option value="partnership">Partnership opportunity</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Tell us about your restaurant and how we can help..."
                      className="flex w-full rounded-xl border border-white/40 bg-white/50 px-4 py-3 text-sm shadow-inner-gloss backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="h-14 w-full rounded-xl text-base shadow-gloss-lg">
                    <Send className="mr-2 h-5 w-5" />
                    Send message
                  </Button>
                </form>
              </div>

              {/* Info Panel */}
              <div className="space-y-8">
                {/* Office Info */}
                <div className="glass-panel relative overflow-hidden rounded-2xl p-8 shadow-gloss-soft">
                  <h3 className="font-heading text-xl font-bold text-foreground">Our office</h3>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Address</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          123 Innovation Drive, Suite 400<br />
                          Austin, TX 78701, USA
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Business hours</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                          Weekend: Emergency support only
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="mb-4 font-heading text-xl font-bold text-foreground">Helpful resources</h3>
                  <div className="space-y-4">
                    {resources.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.link}
                        className="glass-panel group flex items-start gap-4 rounded-2xl p-5 shadow-gloss-soft transition-all hover:shadow-gloss-lg"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/10 text-primary shadow-inner-gloss ring-1 ring-white/40">
                          <resource.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground group-hover:text-primary">{resource.title}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{resource.desc}</p>
                        </div>
                        <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Find quick answers to common questions about RestoOS.
            </p>
            <div className="mt-10 grid gap-4 text-left md:grid-cols-2">
              {[
                { q: 'How long is the free trial?', a: '14 days with full access to all features. No credit card required.' },
                { q: 'Can I import my existing menu?', a: 'Yes! We support CSV import and can help migrate from most POS systems.' },
                { q: 'What hardware do I need?', a: 'RestoOS works on any modern tablet, computer, or dedicated POS hardware.' },
                { q: 'Is my data secure?', a: 'Absolutely. We use bank-level encryption and are SOC 2 compliant.' },
              ].map((faq, i) => (
                <div key={i} className="glass-panel rounded-2xl p-6 shadow-gloss-soft">
                  <h4 className="font-semibold text-foreground">{faq.q}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
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

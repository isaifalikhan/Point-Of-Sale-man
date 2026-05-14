import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarketingShell } from '@/components/marketing/marketing-shell';
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
    <MarketingShell>
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-12 pt-16 text-center md:px-8 md:pt-24">
          <span className="glass-panel relative mb-7 inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E7C27D]">
            <MessageSquare className="size-4" aria-hidden />
            Get in touch
          </span>
          <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.08] tracking-tight text-[#F5F5F5] md:text-5xl lg:text-6xl">
            We&apos;d love to{' '}
            <span className="lux-text-gradient">hear from you</span>
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
                        className="h-12 rounded-xl border-white/[0.1] bg-[#111111]/90 text-[#F5F5F5] shadow-none backdrop-blur-sm focus-visible:border-[#D4A64F]/50 focus-visible:ring-[#D4A64F]/25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="h-12 rounded-xl border-white/[0.1] bg-[#111111]/90 text-[#F5F5F5] shadow-none backdrop-blur-sm focus-visible:border-[#D4A64F]/50 focus-visible:ring-[#D4A64F]/25"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@restaurant.com"
                      className="h-12 rounded-xl border-white/[0.1] bg-[#111111]/90 text-[#F5F5F5] shadow-none backdrop-blur-sm focus-visible:border-[#D4A64F]/50 focus-visible:ring-[#D4A64F]/25"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="restaurant" className="text-sm font-medium">Restaurant name</Label>
                    <Input
                      id="restaurant"
                      placeholder="The Best Bistro"
                      className="h-12 rounded-xl border-white/[0.1] bg-[#111111]/90 text-[#F5F5F5] shadow-none backdrop-blur-sm focus-visible:border-[#D4A64F]/50 focus-visible:ring-[#D4A64F]/25"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                    <select
                      id="subject"
                      className="flex h-12 w-full rounded-xl border border-white/[0.1] bg-[#111111]/90 px-4 text-sm text-[#F5F5F5] shadow-none backdrop-blur-sm transition-colors focus-visible:border-[#D4A64F]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A64F]/25"
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
                      className="flex w-full rounded-xl border border-white/[0.1] bg-[#111111]/90 px-4 py-3 text-sm text-[#F5F5F5] shadow-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-[#D4A64F]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A64F]/25"
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="lux-gold-gradient h-14 w-full rounded-xl border-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B0B0B]">
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
    </MarketingShell>
  );
}

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import {
  ArrowRight,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  BookOpen,
  Users,
} from 'lucide-react';
import { VENUE, toTelHref, whatsappHref } from '@/config/venue-public';

export default function ContactPage() {
  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'WhatsApp orders',
      desc: 'Fastest way to order for delivery or pickup',
      value: VENUE.whatsappDisplay,
      action: whatsappHref(),
      external: true,
    },
    {
      icon: Phone,
      title: 'Call us',
      desc: VENUE.hours,
      value: VENUE.phones.map((p) => `${p.label}: ${p.numbers.join(', ')}`).join(' · '),
      action: toTelHref(VENUE.phones[0]!.numbers[0]!),
      external: false,
    },
    {
      icon: MapPin,
      title: 'Visit us',
      desc: 'Awami Shopping Center, Haider Road',
      value: VENUE.addressLines.join(', '),
      action: 'https://maps.google.com/?q=' + encodeURIComponent(VENUE.addressLines.join(', ') + ', Oghi, Pakistan'),
      external: true,
    },
  ];

  const resources: {
    icon: LucideIcon;
    title: string;
    desc: string;
    href: string;
    external?: boolean;
  }[] = [
    {
      icon: BookOpen,
      title: 'Food menu',
      desc: 'Pizzas, deals, broast, shawarma, Chinese, and sweets with current prices.',
      href: '/menu',
    },
    {
      icon: Users,
      title: 'Family dining',
      desc: 'Dine in, takeaway, and home delivery — free Wi‑Fi in house.',
      href: '/about',
    },
    {
      icon: Phone,
      title: 'Rider line',
      desc: `Delivery: ${VENUE.phones[1]!.numbers.join(', ')}`,
      href: toTelHref(VENUE.phones[1]!.numbers[0]!),
    },
  ];

  return (
    <MarketingShell>
      <main className="relative z-10">
        <section className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-12 pt-16 text-center md:px-8 md:pt-24">
          <span className="glass-panel relative mb-7 inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E7C27D]">
            <MessageCircle className="size-4" aria-hidden />
            Get in touch
          </span>
          <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.08] tracking-tight text-[#F5F5F5] md:text-5xl lg:text-6xl">
            We&apos;d love to{' '}
            <span className="lux-text-gradient">hear from you</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {VENUE.legalName} — {VENUE.hours.toLowerCase()}. WhatsApp your order or call for delivery across Oghi.
          </p>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {contactMethods.map((method, i) => (
                <a
                  key={i}
                  href={method.action}
                  {...(method.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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

        <section className="border-t border-white/20 bg-card/30 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="glass-panel relative overflow-hidden rounded-3xl p-8 shadow-gloss-lg md:p-10">
                <div className="shine-overlay pointer-events-none absolute inset-0 opacity-15" />
                <h2 className="font-heading text-2xl font-bold text-foreground">Send us a message</h2>
                <p className="mt-2 text-muted-foreground">
                  Prefer WhatsApp?{' '}
                  <a href={whatsappHref()} className="font-medium text-primary underline-offset-4 hover:underline">
                    Open chat
                  </a>
                  .
                </p>

                <form className="mt-8 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-2">
                      <Label htmlFor="firstName" className="block text-sm font-medium">
                        First name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        className="h-12 min-w-0 rounded-xl border-white/[0.1] bg-[#111111]/90 text-[#F5F5F5] shadow-none backdrop-blur-sm focus-visible:border-[#D4A64F]/50 focus-visible:ring-[#D4A64F]/25"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      <Label htmlFor="lastName" className="block text-sm font-medium">
                        Last name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        className="h-12 min-w-0 rounded-xl border-white/[0.1] bg-[#111111]/90 text-[#F5F5F5] shadow-none backdrop-blur-sm focus-visible:border-[#D4A64F]/50 focus-visible:ring-[#D4A64F]/25"
                      />
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-2">
                    <Label htmlFor="email" className="block text-sm font-medium">
                      Phone or email
                    </Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="03xx-xxxxxxx or you@email.com"
                      className="h-12 min-w-0 rounded-xl border-white/[0.1] bg-[#111111]/90 text-[#F5F5F5] shadow-none backdrop-blur-sm focus-visible:border-[#D4A64F]/50 focus-visible:ring-[#D4A64F]/25"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col gap-2">
                    <Label htmlFor="message" className="block text-sm font-medium">
                      Message
                    </Label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Tell us your order, party size, or question..."
                      className="flex min-h-[120px] w-full min-w-0 rounded-xl border border-white/[0.1] bg-[#111111]/90 px-4 py-3 text-sm text-[#F5F5F5] shadow-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-[#D4A64F]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A64F]/25"
                    />
                  </div>

                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-14 w-full items-center justify-center rounded-xl lux-gold-gradient text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B0B0B] transition-opacity hover:opacity-95"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Message on WhatsApp
                  </a>
                </form>
              </div>

              <div className="space-y-8">
                <div className="glass-panel relative overflow-hidden rounded-2xl p-8 shadow-gloss-soft">
                  <h3 className="font-heading text-xl font-bold text-foreground">Our restaurant</h3>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Address</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {VENUE.addressLines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                          <span className="block">Oghi, Pakistan</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Hours</p>
                        <p className="mt-1 text-sm text-muted-foreground">{VENUE.hours}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {VENUE.services.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-white/[0.1] bg-[#111111]/60 px-3 py-1 text-xs text-[#B8B8B8]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-heading text-xl font-bold text-foreground">Helpful links</h3>
                  <div className="space-y-4">
                    {resources.map((resource) => (
                      <a
                        key={resource.title}
                        href={resource.href}
                        {...(resource.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="glass-panel group flex items-start gap-4 rounded-2xl p-5 shadow-gloss-soft transition-all hover:shadow-gloss-lg"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/10 text-primary shadow-inner-gloss ring-1 ring-white/40">
                          <resource.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-foreground group-hover:text-primary">{resource.title}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{resource.desc}</p>
                        </div>
                        <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Quick answers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Ordering, parking, and service at {VENUE.shortName}.
            </p>
            <div className="mt-10 grid gap-4 text-left md:grid-cols-2">
              {[
                {
                  q: 'How do I order delivery?',
                  a: `WhatsApp ${VENUE.whatsappDisplay} with your address and cart — or call the rider line ${VENUE.phones[1]!.numbers[0]}.`,
                },
                {
                  q: 'Do you have dine-in?',
                  a: 'Yes — family dining hall on the first floor of Awami Shopping Center with free Wi‑Fi.',
                },
                {
                  q: 'What are your hours?',
                  a: VENUE.hours,
                },
                {
                  q: 'Where do I see prices?',
                  a: 'Browse the full food menu on this site — prices match our printed boards.',
                },
              ].map((faq, i) => (
                <div key={i} className="glass-panel rounded-2xl p-6 shadow-gloss-soft">
                  <h4 className="font-semibold text-foreground">{faq.q}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
            <Link
              href="/menu"
              className="mt-10 inline-flex text-sm font-semibold text-[#E7C27D] underline-offset-4 hover:underline"
            >
              View full menu →
            </Link>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}

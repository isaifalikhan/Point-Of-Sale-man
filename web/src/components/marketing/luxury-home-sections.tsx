"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ChefHat,
  CreditCard,
  Globe,
  LineChart,
  Package,
  Play,
  Shield,
  Sparkles,
  Star,
  Store,
  TableIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

/** Native img avoids next/image remotePatterns issues (e.g. invalid `**` host) so Unsplash always loads. */
function LuxuryFillImg({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}

function unsplashPhoto(photoPath: string, w: number) {
  return `https://images.unsplash.com/${photoPath}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${w}&q=85`;
}

const HERO_IMAGE = unsplashPhoto("photo-1414235077428-338989a2e8c0", 2000);

const GALLERY = [
  { src: unsplashPhoto("photo-1517248135467-4c7edcad34c4", 1000), alt: "Dining room ambience" },
  { src: unsplashPhoto("photo-1559339352-11d035aa65de", 1000), alt: "Chef plating" },
  { src: unsplashPhoto("photo-1544025162-d76694265947", 1000), alt: "Grill and flames" },
  { src: unsplashPhoto("photo-1551218808-94e220e084d2", 1000), alt: "Wine and table" },
  { src: unsplashPhoto("photo-1504674900247-0877df9cc836", 1000), alt: "Fine dish" },
  { src: unsplashPhoto("photo-1577219491135-ce391730fb2c", 1000), alt: "Kitchen craft" },
] as const;

const menuCategories = [
  {
    id: "finesse",
    label: "Finesse",
    tag: "Front of house",
    items: [
      {
        title: BRAND.features.pos.title,
        desc: BRAND.features.pos.description,
        price: "Core",
        icon: Store,
        image: unsplashPhoto("photo-1555396273-367ea4eb4db5", 1200),
      },
      {
        title: BRAND.features.tables.title,
        desc: BRAND.features.tables.description,
        price: "Floor",
        icon: TableIcon,
        image: unsplashPhoto("photo-1517248135467-4c7edcad34c4", 1200),
      },
    ],
  },
  {
    id: "heart",
    label: "Heart",
    tag: "Back of house",
    items: [
      {
        title: BRAND.features.kds.title,
        desc: BRAND.features.kds.description,
        price: "Pass",
        icon: ChefHat,
        image: unsplashPhoto("photo-1556910103-1c02745aae4d", 1200),
      },
      {
        title: BRAND.features.staff.title,
        desc: BRAND.features.staff.description,
        price: "Team",
        icon: Users,
        image: unsplashPhoto("photo-1522071820081-009f0129c71c", 1200),
      },
    ],
  },
  {
    id: "insight",
    label: "Insight",
    tag: "Control",
    items: [
      {
        title: BRAND.features.inventory.title,
        desc: BRAND.features.inventory.description,
        price: "Cellar",
        icon: Package,
        image: unsplashPhoto("photo-1544025162-d76694265947", 1200),
      },
      {
        title: BRAND.features.analytics.title,
        desc: BRAND.features.analytics.description,
        price: "Study",
        icon: LineChart,
        image: unsplashPhoto("photo-1551218808-94e220e084d2", 1200),
      },
    ],
  },
] as const;

const signatures = [
  {
    title: BRAND.features.pos.title,
    line: "The opening gesture — instant, composed, exact.",
    icon: Store,
    href: "/features#pos",
  },
  {
    title: BRAND.features.kds.title,
    line: "Rhythm for the line. Tickets that move like choreography.",
    icon: ChefHat,
    href: "/features#kds",
  },
  {
    title: BRAND.features.analytics.title,
    line: "Clarity after the rush. Margins, peaks, and pace — distilled.",
    icon: LineChart,
    href: "/features#analytics",
  },
] as const;

const plans = [
  {
    name: "Starter",
    price: "$49",
    desc: "Perfect for small cafes and food trucks getting started.",
    features: ["1 location", "Core POS features", "Basic analytics", "Email support", "1,000 orders/month"],
  },
  {
    name: "Professional",
    price: "$99",
    desc: "For growing restaurants that need more power.",
    popular: true,
    features: [
      "Up to 3 locations",
      "POS + Kitchen Display",
      "Inventory management",
      "Staff management",
      "Priority support",
      "Unlimited orders",
    ],
  },
  {
    name: "Enterprise",
    price: "$199",
    desc: "For chains and franchises with complex needs.",
    features: [
      "Unlimited locations",
      "Full API access",
      "Custom integrations",
      "Advanced analytics",
      "24/7 phone support",
      "Dedicated account manager",
    ],
  },
] as const;

export function LuxuryHomeSections() {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0.25]);

  const [menuTab, setMenuTab] = useState<(typeof menuCategories)[number]["id"]>("finesse");
  const activeMenu = useMemo(
    () => menuCategories.find((c) => c.id === menuTab) ?? menuCategories[0],
    [menuTab],
  );

  const [tIndex, setTIndex] = useState(0);
  const testimonial = BRAND.testimonials[tIndex]!;

  return (
    <main className="relative">
      {/* Hero — ref target must sit in a positioned ancestor chain for useScroll */}
      <section ref={heroRef} className="relative isolate min-h-[100dvh] overflow-hidden">
        <motion.div style={{ y: heroImgY }} className="absolute inset-0">
          <LuxuryFillImg
            src={HERO_IMAGE}
            alt=""
            priority
            className="scale-105 object-center"
          />
        </motion.div>
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/75 via-[#0B0B0B]/55 to-[#0B0B0B]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(212,166,79,0.12),transparent)]" />

        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 md:px-8 md:pb-24 md:pt-40">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#E7C27D]"
          >
            {BRAND.tagline}
          </motion.p>
          <div className="mt-6 max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[1.05] tracking-tight text-[#F5F5F5]"
            >
              Service, elevated.
              <span className="mt-2 block text-[#B8B8B8]">One luminous system for the house.</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-xl text-base leading-relaxed text-[#B8B8B8] md:text-lg"
          >
            {BRAND.longDescription}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link href="/signup">
              <Button className="lux-gold-gradient h-14 rounded-full border-0 px-10 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0B0B0B] shadow-[0_12px_40px_-12px_rgba(212,166,79,0.5)]">
                Begin service
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              className="h-14 rounded-full border-white/[0.14] bg-white/[0.04] px-10 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#F5F5F5] backdrop-blur-md hover:bg-white/[0.08]"
            >
              <Play className="mr-2 size-4" aria-hidden />
              Watch film
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {[
              { value: BRAND.stats.restaurants, label: "Venues", icon: Store },
              { value: BRAND.stats.transactions, label: "Covers", icon: CreditCard },
              { value: BRAND.stats.countries, label: "Cities", icon: Globe },
              { value: BRAND.stats.uptime, label: "Always on", icon: Shield },
            ].map((stat, i) => (
              <div key={i} className="lux-glass rounded-2xl px-4 py-5 text-center">
                <stat.icon className="mx-auto mb-2 size-5 text-[#D4A64F]/80" aria-hidden />
                <p className="text-xl font-medium text-[#F5F5F5] md:text-2xl">{stat.value}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#B8B8B8]">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <a
            href="#story"
            className="mt-14 inline-flex items-center gap-2 self-center text-[11px] font-medium uppercase tracking-[0.28em] text-[#B8B8B8] transition-colors hover:text-[#E7C27D] md:self-start"
          >
            <span>Scroll</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowDown className="size-4" />
            </motion.span>
          </a>
        </div>
      </section>

      {/* Trusted */}
      <section className="border-y border-white/[0.08] bg-[#111111]/50 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-5 text-center md:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#B8B8B8]/80">
            Trusted in dining rooms worldwide
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-sm font-medium tracking-tight text-[#B8B8B8]/70">
            {["Fine Dining Co.", "Quick Bites", "Urban Kitchen", "The Grill House", "Sushi Express"].map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* About / Story */}
      <section id="story" className="scroll-mt-28 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="grid gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">The house</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[#F5F5F5] md:text-5xl">
                A story told in service, not software.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-[#B8B8B8]">{BRAND.longDescription}</p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E7C27D] transition-colors hover:text-[#F5F5F5]"
              >
                Read our story
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="relative lg:col-span-7">
              <div className="relative aspect-[4/5] max-h-[520px] overflow-hidden rounded-2xl border border-white/[0.08] md:aspect-[16/11] md:max-h-none">
                {/* <LuxuryFillImg
                  src={unsplashPhoto("photo-1550966873-12d2b48cc04d", 1200)}
                  alt="Culinary craft"
                  className="object-center"
                /> */}
                <LuxuryFillImg
  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop"
  alt="Luxury restaurant dining"
  className="object-center"
/>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0B0B]/50 to-transparent" />
              </div>
              <div className="lux-glass absolute -bottom-8 left-6 right-6 max-w-sm rounded-2xl p-6 md:left-auto md:right-8 md:top-1/2 md:bottom-auto md:-translate-y-1/2 md:max-w-xs">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E7C27D]/90">Tonight</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-[#F5F5F5]">Every seat, one thread.</p>
                <p className="mt-2 text-sm leading-relaxed text-[#B8B8B8]">
                  POS, kitchen, floor, and ledger — composed as a single experience.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Menu / Platform */}
      <section id="menu" className="scroll-mt-28 border-t border-white/[0.08] bg-[#111111]/30 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">The carte</p>
            <h2 className="mx-auto mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[#F5F5F5] md:text-5xl">
              Choose your line — every course is connected.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#B8B8B8]">
              Explore the platform as you would a tasting menu: finesse on the floor, heart in the kitchen, insight in the office.
            </p>
          </Reveal>

          <Reveal className="mt-14" delay={0.08}>
            <div
              role="tablist"
              aria-label="Menu categories"
              className="flex flex-wrap justify-center gap-2 border-b border-white/[0.08] pb-6"
            >
              {menuCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={menuTab === cat.id}
                  onClick={() => setMenuTab(cat.id)}
                  className={cn(
                    "rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all",
                    menuTab === cat.id
                      ? "lux-gold-gradient text-[#0B0B0B] shadow-[0_8px_28px_-10px_rgba(212,166,79,0.45)]"
                      : "border border-white/[0.1] bg-white/[0.03] text-[#B8B8B8] hover:border-[#D4A64F]/30 hover:text-[#F5F5F5]",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-[#B8B8B8]/70">{activeMenu.tag}</p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {activeMenu.items.map((item, i) => (
                <motion.div
                  key={`${menuTab}-${item.title}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="group lux-glass overflow-hidden rounded-2xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <LuxuryFillImg
                      src={item.image}
                      alt={item.title}
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent opacity-80" />
                    <div className="absolute left-5 top-5 flex size-11 items-center justify-center rounded-xl border border-white/20 bg-black/30 text-[#E7C27D] backdrop-blur-md">
                      <item.icon className="size-5" />
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-[family-name:var(--font-display)] text-2xl text-[#F5F5F5]">{item.title}</h3>
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A64F]">
                        {item.price}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#B8B8B8] md:text-base">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/features">
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-white/[0.14] bg-transparent px-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5F5F5] hover:bg-white/[0.06]"
                >
                  Full tasting
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Signature */}
      <section id="signature" className="scroll-mt-28 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Chef selections</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[#F5F5F5] md:text-5xl">
                Signature plates
              </h2>
            </div>
            <p className="max-w-md text-[#B8B8B8]">Three movements we refine endlessly — the ones guests feel first.</p>
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {signatures.map((sig, i) => (
              <Reveal key={sig.title} delay={i * 0.08}>
                <Link
                  href={sig.href}
                  className="group relative block h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111]/40 p-8 transition-all duration-500 hover:border-[#D4A64F]/35 hover:shadow-[0_0_60px_-20px_rgba(212,166,79,0.25)]"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[#D4A64F]/10 blur-3xl transition-opacity group-hover:opacity-100" />
                  <sig.icon className="size-8 text-[#D4A64F]" />
                  <h3 className="mt-6 font-[family-name:var(--font-display)] text-2xl text-[#F5F5F5]">{sig.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#B8B8B8]">{sig.line}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E7C27D]">
                    Discover
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="scroll-mt-28 border-t border-white/[0.08] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Gallery</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[#F5F5F5] md:text-5xl">
              Atmosphere in still frames
            </h2>
            <p className="mt-4 text-[#B8B8B8]">A quiet study of light, texture, and appetite — optimized for fast loads.</p>
          </Reveal>
          <Reveal className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3" delay={0.06}>
            {GALLERY.map((img, i) => (
              <div
                key={`${img.alt}-${i}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.08] sm:aspect-[4/5]"
              >
                <LuxuryFillImg
                  src={img.src}
                  alt={img.alt}
                  className="transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[#0B0B0B]/0 transition-colors duration-500 group-hover:bg-[#0B0B0B]/25" />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="scroll-mt-28 border-t border-white/[0.08] bg-[#111111]/25 py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Voices</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[#F5F5F5] md:text-5xl">
              From the floor
            </h2>
          </Reveal>
          <div className="relative mt-14">
            <div className="flex items-center justify-center gap-3">
              {BRAND.testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show testimonial ${i + 1}`}
                  onClick={() => setTIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    tIndex === i ? "w-10 lux-gold-gradient" : "w-2 bg-white/20 hover:bg-white/35",
                  )}
                />
              ))}
            </div>
            <div className="relative mt-10 min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="lux-glass mx-auto max-w-3xl rounded-2xl p-8 text-center md:p-12"
                >
                  <Sparkles className="mx-auto size-6 text-[#D4A64F]/80" aria-hidden />
                  <div className="mt-4 flex justify-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="size-4 fill-[#D4A64F] text-[#D4A64F]" />
                    ))}
                  </div>
                  <blockquote className="mt-6 font-[family-name:var(--font-display)] text-xl leading-relaxed text-[#F5F5F5] md:text-2xl">
                    “{testimonial.quote}”
                  </blockquote>
                  <div className="mt-8 flex flex-col items-center gap-1">
                    <p className="text-sm font-medium text-[#F5F5F5]">{testimonial.name}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#B8B8B8]">{testimonial.role}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-28 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-5 text-center md:px-8">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Reservations</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[#F5F5F5] md:text-5xl">
              Transparent covers
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#B8B8B8]">
              No hidden fees. No long-term contracts. Upgrade or downgrade anytime.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 text-left md:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.06}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-500",
                    "popular" in plan && plan.popular
                      ? "border-[#D4A64F]/40 bg-[#111111]/80 shadow-[0_0_80px_-30px_rgba(212,166,79,0.35)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]",
                  )}
                >
                  {"popular" in plan && plan.popular ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full lux-gold-gradient px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0B0B]">
                      Most loved
                    </span>
                  ) : null}
                  <h3 className="font-[family-name:var(--font-display)] text-2xl text-[#F5F5F5]">{plan.name}</h3>
                  <p className="mt-2 min-h-[3rem] text-sm text-[#B8B8B8]">{plan.desc}</p>
                  <p className="mt-6 font-[family-name:var(--font-display)] text-5xl text-[#F5F5F5]">
                    {plan.price}
                    <span className="text-base font-sans font-medium text-[#B8B8B8]">/mo</span>
                  </p>
                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex gap-3 text-sm text-[#F5F5F5]/90">
                        <CheckCircle2 className="size-5 shrink-0 text-[#D4A64F]" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="mt-10 block">
                    <Button
                      className={cn(
                        "h-12 w-full rounded-xl text-[11px] font-semibold uppercase tracking-[0.16em]",
                        "popular" in plan && plan.popular
                          ? "lux-gold-gradient border-0 text-[#0B0B0B]"
                          : "border border-white/[0.12] bg-[#111111] text-[#F5F5F5] hover:bg-[#161616]",
                      )}
                    >
                      Start trial
                    </Button>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-sm text-[#B8B8B8]/80">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* Reservation / CTA */}
      <section id="reserve" className="scroll-mt-28 relative overflow-hidden border-t border-white/[0.08] py-24 md:py-32">
        <div className="absolute inset-0">
          <LuxuryFillImg
            src={unsplashPhoto("photo-1559339352-11d035aa65de", 1600)}
            alt=""
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/92 to-[#0B0B0B]/85" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center md:px-8">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Hold a table</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[#F5F5F5] md:text-5xl">
              Reserve a walkthrough
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#B8B8B8]">
              Tell us about your rooms, your rush, and your rituals. We will tailor the demo like a private seating.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/contact">
                <Button className="lux-gold-gradient h-14 rounded-full border-0 px-10 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0B0B0B]">
                  Open diary
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="h-14 rounded-full border-white/[0.18] bg-black/30 px-10 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#F5F5F5] backdrop-blur-md hover:bg-black/45"
                >
                  Start trial
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

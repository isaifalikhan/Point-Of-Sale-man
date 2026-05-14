import Link from "next/link";
import { Mail, Rss, Share2 } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { BRAND } from "@/config/brand";
import { LuxuryNewsletter } from "@/components/marketing/luxury-newsletter";

const footerNav = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Plans", href: "/#pricing" },
    { label: "Experience", href: "/#menu" },
  ],
  company: [
    { label: "Story", href: "/about" },
    { label: "Visit", href: "/contact" },
    { label: "Careers", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function LuxuryFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-[#0B0B0B] px-5 py-16 text-[#B8B8B8] md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/[0.08] pb-14 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <BrandMark className="text-[#F5F5F5]" iconClassName="lux-gold-gradient text-[#0B0B0B] shadow-none ring-0" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#B8B8B8]">{BRAND.shortDescription}</p>
            <div className="mt-8 flex gap-3">
              <a
                href="#"
                className="flex size-10 items-center justify-center rounded-full border border-white/[0.1] text-[#F5F5F5] transition-colors hover:border-[#D4A64F]/50 hover:text-[#E7C27D]"
                aria-label="Share"
              >
                <Share2 className="size-4" />
              </a>
              <a
                href="mailto:hello@restoos.com"
                className="flex size-10 items-center justify-center rounded-full border border-white/[0.1] text-[#F5F5F5] transition-colors hover:border-[#D4A64F]/50 hover:text-[#E7C27D]"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </a>
              <a
                href="/contact"
                className="flex size-10 items-center justify-center rounded-full border border-white/[0.1] text-[#F5F5F5] transition-colors hover:border-[#D4A64F]/50 hover:text-[#E7C27D]"
                aria-label="Updates"
              >
                <Rss className="size-4" />
              </a>
            </div>
          </div>
          <LuxuryNewsletter />
        </div>

        <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Product</h4>
            <ul className="space-y-3 text-sm">
              {footerNav.product.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-[#F5F5F5]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Company</h4>
            <ul className="space-y-3 text-sm">
              {footerNav.company.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-[#F5F5F5]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Legal</h4>
            <ul className="space-y-3 text-sm">
              {footerNav.legal.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-[#F5F5F5]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Concierge</h4>
            <p className="text-sm leading-relaxed">
              Private onboarding for multi-location teams.{" "}
              <Link href="/contact" className="text-[#E7C27D] underline-offset-4 hover:underline">
                Request access
              </Link>
              .
            </p>
          </div>
        </div>

        <p className="mt-14 text-center text-[11px] tracking-wide text-[#B8B8B8]/70">
          © {new Date().getFullYear()} {BRAND.name}. Crafted for exceptional hospitality.
        </p>
      </div>
    </footer>
  );
}

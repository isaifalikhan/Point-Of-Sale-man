"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Food menu", href: "/menu" },
  { label: "Experience", href: "/#menu" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Voices", href: "/#testimonials" },
  { label: "Plans", href: "/#pricing" },
  { label: "Features", href: "/features" },
  { label: "Story", href: "/about" },
  { label: "Visit", href: "/contact" },
] as const;

export function LuxuryHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 24);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      onScroll();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  const linkClass = (href: string) => {
    const base = href.split("#")[0];
    const active =
      href.startsWith("/#")
        ? pathname === "/"
        : pathname === base || (base !== "/" && pathname?.startsWith(base));
    return cn(
      "text-[11px] font-medium uppercase tracking-[0.22em] transition-colors duration-300",
      active ? "text-[#E7C27D]" : "text-[#B8B8B8] hover:text-[#F5F5F5]",
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background,backdrop-filter,border-color,box-shadow] duration-500",
        scrolled
          ? "border-white/[0.08] bg-[#0B0B0B]/72 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.75)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-5 md:h-[4.5rem] md:px-8">
        <Link
          href="/"
          className="rounded-lg outline-none ring-offset-[#0B0B0B] focus-visible:ring-2 focus-visible:ring-[#D4A64F]/60"
        >
          <BrandMark className="text-[#F5F5F5]" iconClassName="lux-gold-gradient text-[#0B0B0B] shadow-none ring-0" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden text-[12px] font-medium text-[#B8B8B8] transition-colors hover:text-[#F5F5F5] sm:inline"
          >
            Sign in
          </Link>
          <Link href="/contact" className="hidden sm:block">
            <Button className="lux-gold-gradient h-10 rounded-full border-0 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0B0B0B] shadow-[0_8px_32px_-8px_rgba(212,166,79,0.55)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
              Book a table
            </Button>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex size-10 items-center justify-center rounded-lg text-[#F5F5F5] transition-colors hover:bg-white/[0.06] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton
              className="w-[min(100%,22rem)] border-l border-white/[0.08] bg-[#0B0B0B]/95 p-0 text-[#F5F5F5] backdrop-blur-2xl"
            >
              <SheetHeader className="border-b border-white/[0.08] p-6 text-left">
                <SheetTitle className="text-xl tracking-tight text-[#F5F5F5]">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4" aria-label="Mobile">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#B8B8B8] transition-colors hover:bg-white/[0.05] hover:text-[#E7C27D]"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.08] pt-4">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm text-[#F5F5F5]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm text-[#F5F5F5]"
                  >
                    Start trial
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="lux-gold-gradient mx-2 mt-2 rounded-full py-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#0B0B0B]"
                  >
                    Book a table
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

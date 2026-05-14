"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LuxuryNewsletter() {
  const [email, setEmail] = useState("");

  return (
    <div className="lux-glass rounded-2xl p-8 md:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Journal</p>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[#F5F5F5] md:text-3xl">
        Notes from the pass
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#B8B8B8]">
        Occasional letters on service design, operations, and product updates. No clutter.
      </p>
      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setEmail("");
        }}
      >
        <label htmlFor="footer-newsletter" className="sr-only">
          Email for updates
        </label>
        <Input
          id="footer-newsletter"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@restaurant.com"
          autoComplete="email"
          className="h-12 flex-1 rounded-xl border-white/[0.1] bg-[#111111]/80 text-[#F5F5F5] placeholder:text-[#B8B8B8]/60 focus-visible:border-[#D4A64F]/50 focus-visible:ring-[#D4A64F]/30"
        />
        <Button
          type="submit"
          className="lux-gold-gradient h-12 shrink-0 rounded-xl border-0 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B0B0B]"
        >
          Subscribe
        </Button>
      </form>
      <p className="mt-4 text-xs text-[#B8B8B8]/70">
        Prefer a conversation?{" "}
        <Link href="/contact" className="text-[#E7C27D] underline-offset-4 hover:underline">
          Speak with us
        </Link>
        .
      </p>
    </div>
  );
}

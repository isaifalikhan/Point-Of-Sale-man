import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  BUNDLE_DEALS,
  MAIN_MENU_SECTIONS,
  NUMBERED_DEALS,
  PIZZA_EXTRAS,
  PIZZA_SPECIAL,
  PIZZA_STANDARD,
} from "@/config/baba-jani-menu";
import { VENUE, whatsappHref } from "@/config/venue-public";

function Rs(p: string) {
  return `Rs ${p}`;
}

export default function MenuPage() {
  return (
    <MarketingShell>
      <main className="relative z-10 pb-24">
        <section className="mx-auto max-w-7xl px-5 pt-16 md:px-8 md:pt-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E7C27D]/90">Menu</p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-[#F5F5F5] md:text-5xl">
            {VENUE.legalName}
          </h1>
          <p className="mt-4 max-w-2xl text-[#B8B8B8]">
            {VENUE.hours}. Order on WhatsApp{" "}
            <a href={whatsappHref()} className="text-[#E7C27D] underline-offset-4 hover:underline">
              {VENUE.whatsappDisplay}
            </a>
            .
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-full border border-white/[0.14] bg-white/[0.04] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5F5F5] backdrop-blur-md transition-colors hover:bg-white/[0.08]"
            >
              Location & phones
            </Link>
            <a
              href={whatsappHref()}
              className="inline-flex h-11 items-center rounded-full lux-gold-gradient px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B0B0B]"
            >
              WhatsApp order
            </a>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-5 md:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[#F5F5F5] md:text-3xl">
            Pizza — standard
          </h2>
          <p className="mt-2 text-sm text-[#B8B8B8]">Sizes: S 7&quot; · M 10&quot; · L 12&quot; · Ext L</p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111111]/40">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wider text-[#B8B8B8]">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-3 py-3">S</th>
                  <th className="px-3 py-3">M</th>
                  <th className="px-3 py-3">L</th>
                  <th className="px-3 py-3">Ext L</th>
                </tr>
              </thead>
              <tbody>
                {PIZZA_STANDARD.map((row) => (
                  <tr key={row.name} className="border-b border-white/[0.06] text-[#F5F5F5] last:border-0">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-3 py-3 text-[#E7C27D]">{row.s ? Rs(row.s) : "—"}</td>
                    <td className="px-3 py-3 text-[#E7C27D]">{row.m ? Rs(row.m) : "—"}</td>
                    <td className="px-3 py-3 text-[#E7C27D]">{row.l ? Rs(row.l) : "—"}</td>
                    <td className="px-3 py-3 text-[#E7C27D]">{row.ext ? Rs(row.ext) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-5 md:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[#F5F5F5] md:text-3xl">
            Pizza — special
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#111111]/40">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] font-semibold uppercase tracking-wider text-[#B8B8B8]">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-3 py-3">S</th>
                  <th className="px-3 py-3">M</th>
                  <th className="px-3 py-3">L</th>
                  <th className="px-3 py-3">Ext L</th>
                </tr>
              </thead>
              <tbody>
                {PIZZA_SPECIAL.map((row) => (
                  <tr key={row.name} className="border-b border-white/[0.06] text-[#F5F5F5] last:border-0">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-3 py-3 text-[#E7C27D]">{row.s ? Rs(row.s) : "—"}</td>
                    <td className="px-3 py-3 text-[#E7C27D]">{row.m ? Rs(row.m) : "—"}</td>
                    <td className="px-3 py-3 text-[#E7C27D]">{row.l ? Rs(row.l) : "—"}</td>
                    <td className="px-3 py-3 text-[#E7C27D]">{row.ext ? Rs(row.ext) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-[#B8B8B8]">{PIZZA_EXTRAS.toppings}</p>
          <p className="mt-1 text-sm text-[#B8B8B8]">{PIZZA_EXTRAS.crusts}</p>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-5 md:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[#F5F5F5] md:text-3xl">
            Bundle deals
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BUNDLE_DEALS.map((d) => (
              <li
                key={d.title}
                className="lux-glass rounded-2xl border border-white/[0.08] p-6"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E7C27D]/90">{d.title}</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[#F5F5F5]">{Rs(d.price)}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#B8B8B8]">{d.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-5 md:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[#F5F5F5] md:text-3xl">
            Special deals
          </h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {NUMBERED_DEALS.map((d) => (
              <li
                key={d.n}
                className="flex gap-3 rounded-xl border border-white/[0.06] bg-[#111111]/35 px-4 py-3 text-sm text-[#F5F5F5]"
              >
                <span className="shrink-0 font-mono text-[#E7C27D]">{d.n}.</span>
                <span className="flex-1 text-[#B8B8B8]">{d.name}</span>
                <span className="shrink-0 font-semibold text-[#F5F5F5]">{Rs(d.price)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-5 md:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[#F5F5F5] md:text-3xl">
            À la carte
          </h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {MAIN_MENU_SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="border-b border-white/[0.1] pb-2 text-lg font-semibold text-[#E7C27D]">{section.title}</h3>
                <ul className="mt-4 space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex justify-between gap-4 text-sm text-[#B8B8B8]"
                    >
                      <span className="text-[#F5F5F5]">
                        {item.name}
                        {item.note ? (
                          <span className="mt-0.5 block text-xs text-[#B8B8B8]/80">{item.note}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 font-medium text-[#E7C27D]">{Rs(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-5 text-center md:px-8">
          <p className="text-sm text-[#B8B8B8]">
            Prices and availability may change. Confirm on WhatsApp ({VENUE.whatsappDisplay}) before ordering.
          </p>
          <p className="mt-2 text-xs text-[#B8B8B8]/70">
            © {new Date().getFullYear()} {VENUE.legalName}
          </p>
        </section>
      </main>
    </MarketingShell>
  );
}

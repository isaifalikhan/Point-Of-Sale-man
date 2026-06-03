import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { VENUE, whatsappHref } from "@/config/venue-public";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  variants?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
};

const PIZZA_TOPPING_NOTE =
  "Extra toppings — S: Rs 49 · M: Rs 99 · L: Rs 149 · XL: Rs 199";

type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

function Rs(p: number | string) {
  return `Rs ${p}`;
}

async function getPublicMenu(): Promise<MenuCategory[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const res = await fetch(`${apiBase}/public/menu`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function MenuPage() {
  const categories = await getPublicMenu();

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
            Full menu (live from database)
          </h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {categories.map((section) => (
              <div key={section.id}>
                <h3 className="border-b border-white/[0.1] pb-2 text-lg font-semibold text-[#E7C27D]">{section.name}</h3>
                <ul className="mt-4 space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-4 text-sm text-[#B8B8B8]"
                    >
                      <span className="text-[#F5F5F5]">
                        {item.name}
                        {item.variants && item.variants.length > 0 ? (
                          <span className="mt-0.5 block text-xs text-[#B8B8B8]/80">
                            {item.variants.map((v) => `${v.name}: ${Rs(v.price)}`).join(" · ")}
                          </span>
                        ) : null}
                        {item.addons && item.addons.length > 0 ? (
                          <span className="mt-0.5 block text-xs text-[#B8B8B8]/80">
                            {item.addons.map((a) => `${a.name}: ${Rs(a.price)}`).join(" · ")}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 font-medium text-[#E7C27D]">
                        {item.variants && item.variants.length > 0 ? "Variants" : Rs(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
                {(section.name === "Pizza" || section.name === "Pizza Special") && (
                  <p className="mt-3 text-xs text-[#B8B8B8]/90">{PIZZA_TOPPING_NOTE}</p>
                )}
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

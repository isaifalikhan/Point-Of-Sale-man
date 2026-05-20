import type { ReactNode } from "react";
import { LuxuryBackground } from "@/components/marketing/luxury-background";
import { LuxuryFooter } from "@/components/marketing/luxury-footer";
import { LuxuryHeader } from "@/components/marketing/luxury-header";

type MarketingShellProps = {
  children: ReactNode;
};

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="luxury-marketing relative min-h-screen overflow-x-hidden bg-[#0B0B0B] text-[#F5F5F5]">
      <LuxuryBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <LuxuryHeader />
        <div className="relative flex-1">{children}</div>
        <LuxuryFooter />
      </div>
    </div>
  );
}

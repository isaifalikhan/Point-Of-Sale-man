import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";

type BrandMarkProps = {
  className?: string;
  iconClassName?: string;
  stacked?: boolean;
};

export function BrandMark({ className, iconClassName, stacked }: BrandMarkProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight text-foreground",
        stacked && "flex-col items-start gap-0.5",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-indigo-600 text-primary-foreground shadow-gloss-icon",
          iconClassName,
        )}
      >
        <Utensils className="h-5 w-5" aria-hidden />
      </span>
      <span className="font-heading text-lg leading-none">{BRAND.name}</span>
    </div>
  );
}

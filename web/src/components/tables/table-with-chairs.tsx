"use client";

import { cn } from "@/lib/utils";
import { displayTableLabel, type TableRecord } from "@/lib/table-floors";

const STATUS_STYLES: Record<
  string,
  { table: string; chair: string; ring: string; label: string }
> = {
  AVAILABLE: {
    table: "bg-emerald-600/90 shadow-[inset_0_2px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(16,185,129,0.35)]",
    chair: "bg-emerald-800/75 border-emerald-900/40",
    ring: "ring-emerald-400/50",
    label: "text-emerald-950",
  },
  OCCUPIED: {
    table: "bg-amber-500/95 shadow-[inset_0_2px_0_rgba(255,255,255,0.3),0_8px_20px_rgba(245,158,11,0.4)]",
    chair: "bg-amber-700/80 border-amber-900/40",
    ring: "ring-amber-400/60",
    label: "text-amber-950",
  },
  BILL_PENDING: {
    table: "bg-rose-500/95 shadow-[inset_0_2px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(244,63,94,0.4)]",
    chair: "bg-rose-700/80 border-rose-900/40",
    ring: "ring-rose-400/60",
    label: "text-rose-950",
  },
  RESERVED: {
    table: "bg-sky-500/95 shadow-[inset_0_2px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(14,165,233,0.35)]",
    chair: "bg-sky-700/80 border-sky-900/40",
    ring: "ring-sky-400/60",
    label: "text-sky-950",
  },
};

const DEFAULT_STATUS = STATUS_STYLES.AVAILABLE;

/** Chair slots around the table — order matches typical seating layout */
const CHAIR_SLOTS = [
  "top",
  "right",
  "bottom",
  "left",
  "top-right",
  "bottom-right",
  "bottom-left",
  "top-left",
  "top-2",
  "bottom-2",
  "left-2",
  "right-2",
] as const;

type ChairSlot = (typeof CHAIR_SLOTS)[number];

const SLOT_CLASS: Record<ChairSlot, string> = {
  top: "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full",
  bottom: "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full",
  left: "absolute left-0 top-1/2 -translate-x-full -translate-y-1/2",
  right: "absolute right-0 top-1/2 translate-x-full -translate-y-1/2",
  "top-right": "absolute right-0 top-0 -translate-y-1/3 translate-x-1/3",
  "bottom-right": "absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3",
  "bottom-left": "absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3",
  "top-left": "absolute left-0 top-0 -translate-x-1/3 -translate-y-1/3",
  "top-2": "absolute left-[28%] top-0 -translate-y-full",
  "bottom-2": "absolute bottom-0 left-[28%] translate-y-full",
  "left-2": "absolute left-0 top-[28%] -translate-x-full",
  "right-2": "absolute right-0 top-[28%] translate-x-full",
};

function chairsForCapacity(capacity: number): ChairSlot[] {
  const n = Math.max(1, Math.min(Math.round(capacity), CHAIR_SLOTS.length));
  if (n === 1) return ["bottom"];
  if (n === 2) return ["top", "bottom"];
  if (n === 3) return ["top", "left", "right"];
  if (n === 4) return ["top", "bottom", "left", "right"];
  return CHAIR_SLOTS.slice(0, n);
}

type TableWithChairsProps = {
  table: TableRecord;
  floorAccent: "sky" | "warm";
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

function Chair({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-3.5 w-3.5 rounded-sm border shadow-sm sm:h-4 sm:w-4",
        className,
      )}
      aria-hidden
    />
  );
}

export function TableWithChairs({
  table,
  floorAccent,
  selected,
  onClick,
  className,
}: TableWithChairsProps) {
  const styles = STATUS_STYLES[table.status] ?? DEFAULT_STATUS;
  const label = displayTableLabel(table.name);
  const seats = Math.max(1, table.capacity);
  const slots = chairsForCapacity(seats);
  const isWide = seats >= 6;
  const isRound = seats <= 4 && !isWide;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-center rounded-2xl p-4 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:p-5",
        floorAccent === "sky"
          ? "focus-visible:ring-sky-400/80"
          : "focus-visible:ring-amber-500/80",
        selected && "scale-[1.03] ring-2 ring-offset-2",
        selected && (floorAccent === "sky" ? "ring-sky-400" : "ring-amber-500"),
        isWide ? "min-h-[7.5rem] min-w-[7.5rem]" : "min-h-[6.5rem] min-w-[6.5rem]",
        className,
      )}
    >
      {slots.map((slot) => (
        <Chair key={slot} className={cn(SLOT_CLASS[slot], styles.chair)} />
      ))}

      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center border-2 border-white/25 transition-transform group-hover:scale-105 group-active:scale-95",
          styles.table,
          styles.ring,
          "ring-2",
          isWide
            ? "h-14 w-[5rem] rounded-xl sm:h-16 sm:w-[5.5rem]"
            : isRound
              ? seats === 1
                ? "h-11 w-11 rounded-full sm:h-12 sm:w-12"
                : "h-12 w-12 rounded-full sm:h-14 sm:w-14"
              : "h-12 w-14 rounded-lg sm:h-14 sm:w-16",
        )}
      >
        <span className={cn("text-lg font-black leading-none sm:text-xl", styles.label)}>
          {label}
        </span>
        <span
          className={cn(
            "mt-0.5 text-[8px] font-bold uppercase tracking-wider opacity-80 sm:text-[9px]",
            styles.label,
          )}
        >
          {seats} {seats === 1 ? "seat" : "seats"}
        </span>
      </div>
    </button>
  );
}

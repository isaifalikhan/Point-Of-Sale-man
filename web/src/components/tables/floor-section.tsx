"use client";

import type { ReactNode } from "react";
import { CloudSun, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FloorConfig, FloorId, TableRecord } from "@/lib/table-floors";
import { TableWithChairs } from "@/components/tables/table-with-chairs";

type FloorSectionProps = {
  floor: FloorConfig;
  tables: TableRecord[];
  selectedId: string | null;
  onSelectTable: (table: TableRecord) => void;
  /** Optional bar under the floor when a table is selected */
  renderTableActions?: (table: TableRecord) => ReactNode;
};

const FLOOR_THEMES: Record<
  FloorId,
  {
    accent: "sky" | "warm";
    panel: string;
    header: string;
    pattern: string;
    icon: typeof CloudSun;
  }
> = {
  rooftop: {
    accent: "sky",
    panel:
      "bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 border-sky-500/25",
    header: "from-sky-500/20 via-transparent to-indigo-600/10",
    pattern:
      "opacity-[0.12] [background-image:radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.5)_0%,transparent_45%),radial-gradient(circle_at_80%_10%,rgba(199,210,254,0.35)_0%,transparent_40%)]",
    icon: CloudSun,
  },
  ground: {
    accent: "warm",
    panel:
      "bg-gradient-to-br from-amber-950/90 via-stone-900 to-amber-950 border-amber-600/25",
    header: "from-amber-500/15 via-transparent to-orange-800/10",
    pattern:
      "opacity-[0.1] [background-image:repeating-linear-gradient(90deg,rgba(251,191,36,0.15)_0px,rgba(251,191,36,0.15)_1px,transparent_1px,transparent_48px),repeating-linear-gradient(0deg,rgba(251,191,36,0.08)_0px,rgba(251,191,36,0.08)_1px,transparent_1px,transparent_48px)]",
    icon: Home,
  },
};

export function FloorSection({
  floor,
  tables,
  selectedId,
  onSelectTable,
  renderTableActions,
}: FloorSectionProps) {
  const theme = FLOOR_THEMES[floor.id];
  const Icon = theme.icon;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 shadow-2xl",
        theme.panel,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0", theme.pattern)} />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b",
          theme.header,
        )}
      />

      {/* Header */}
      <header className="relative border-b border-white/10 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 shadow-lg sm:size-16",
                floor.id === "rooftop"
                  ? "bg-sky-500/25 text-sky-200"
                  : "bg-amber-500/25 text-amber-200",
              )}
            >
              <Icon className="size-7 sm:size-8" aria-hidden />
            </div>
            <div>
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.35em]",
                  floor.id === "rooftop" ? "text-sky-300/90" : "text-amber-300/90",
                )}
              >
                {floor.id === "rooftop" ? "Level 2 · Open air" : "Level 1 · Indoor"}
              </p>
              <h2 className="mt-1 font-heading text-2xl font-black tracking-tight text-white sm:text-3xl">
                {floor.title}
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/65">
                {floor.subtitle}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "rounded-2xl border border-white/10 px-4 py-3 text-center backdrop-blur-sm",
              floor.id === "rooftop" ? "bg-sky-950/40" : "bg-amber-950/40",
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Tables
            </p>
            <p className="text-2xl font-black text-white">
              {floor.tableRange[0]}–{floor.tableRange[1]}
            </p>
            <p className="mt-0.5 text-xs text-white/50">{tables.length} on floor</p>
          </div>
        </div>
      </header>

      {/* Table grid — aisle paths between rows */}
      <div className="relative px-4 py-8 sm:px-8 sm:py-10">
        <div
          className={cn(
            "mx-auto grid max-w-5xl gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12",
            floor.id === "rooftop"
              ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"
              : "grid-cols-2 sm:grid-cols-4 max-w-3xl",
          )}
        >
          {tables.map((table) => (
            <div key={table.id} className="flex flex-col items-center">
              <TableWithChairs
                table={table}
                floorAccent={theme.accent}
                selected={selectedId === table.id}
                onClick={() => onSelectTable(table)}
              />
            </div>
          ))}
        </div>

        {tables.length === 0 && (
          <p className="py-12 text-center text-sm text-white/50">
            No tables on this floor yet. Run table seed or add tables {floor.tableRange[0]}–
            {floor.tableRange[1]}.
          </p>
        )}

        {/* Decorative floor label */}
        <div
          className={cn(
            "pointer-events-none absolute bottom-4 right-6 select-none font-black uppercase tracking-[0.4em] opacity-[0.07] sm:text-6xl",
            floor.id === "rooftop" ? "text-sky-200" : "text-amber-200",
          )}
        >
          {floor.id === "rooftop" ? "ROOFTOP" : "GROUND"}
        </div>
      </div>

      {/* Selected table actions slot */}
      {renderTableActions && selectedId && tables.some((t) => t.id === selectedId) && (
        <div className="relative border-t border-white/10 bg-black/25 px-5 py-4 sm:px-8">
          {renderTableActions(tables.find((t) => t.id === selectedId)!)}
        </div>
      )}
    </section>
  );
}

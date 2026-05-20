/** Floor layout for Baba Jani — 22 tables total (Rooftop 1–18, Ground 1–4). */

export type FloorId = "rooftop" | "ground";

export type FloorConfig = {
  id: FloorId;
  title: string;
  subtitle: string;
  tableRange: [number, number];
  /** Name prefix stored in API / seed */
  namePrefix: string;
  defaultCapacity: number;
};

export const TABLE_FLOORS: FloorConfig[] = [
  {
    id: "rooftop",
    title: "Rooftop Terrace",
    subtitle: "Open air · Tables 1 – 18 · Evening breeze & city views",
    tableRange: [1, 18],
    namePrefix: "Rooftop",
    defaultCapacity: 4,
  },
  {
    id: "ground",
    title: "Ground Floor",
    subtitle: "Main dining hall · Tables 1 – 4 · Family seating",
    tableRange: [1, 4],
    namePrefix: "Ground Floor",
    defaultCapacity: 4,
  },
];

export const TOTAL_TABLES = 22;

export type TableRecord = {
  id: string;
  name: string;
  capacity: number;
  status: string;
  x?: number;
  y?: number;
  branchId?: string;
};

export function tableNumberFromName(name: string): number {
  const match = name.match(/(\d+)\s*$/);
  return match ? parseInt(match[1], 10) : 0;
}

export function floorForTable(name: string): FloorId {
  const lower = name.toLowerCase();
  if (lower.includes("ground")) return "ground";
  if (lower.includes("rooftop")) return "rooftop";
  // Legacy names: Table 19–22 were ground before local numbering
  const n = tableNumberFromName(name);
  if (n >= 19) return "ground";
  return "rooftop";
}

export function displayTableLabel(name: string): string {
  const n = tableNumberFromName(name);
  return n > 0 ? String(n) : name;
}

export function groupTablesByFloor(tables: TableRecord[]): Record<FloorId, TableRecord[]> {
  const grouped: Record<FloorId, TableRecord[]> = { rooftop: [], ground: [] };
  for (const t of tables) {
    grouped[floorForTable(t.name)].push(t);
  }
  for (const id of Object.keys(grouped) as FloorId[]) {
    grouped[id].sort(
      (a, b) => tableNumberFromName(a.name) - tableNumberFromName(b.name),
    );
  }
  return grouped;
}

export function expectedTableName(floor: FloorConfig, num: number): string {
  return `${floor.namePrefix} - Table ${num}`;
}

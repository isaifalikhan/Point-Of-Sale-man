/** Hall layout — Family 1-10, General 11-21, Rooftop 1-10. */

export type FloorId = "family" | "general" | "rooftop";

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
    id: "family",
    title: "Family Hall",
    subtitle: "Indoor family zone · Tables 1 - 10",
    tableRange: [1, 10],
    namePrefix: "Family Hall",
    defaultCapacity: 6,
  },
  {
    id: "general",
    title: "General Hall",
    subtitle: "Main general zone · Tables 11 - 21",
    tableRange: [11, 21],
    namePrefix: "General Hall",
    defaultCapacity: 4,
  },
  {
    id: "rooftop",
    title: "Rooftop",
    subtitle: "Open air zone · Tables 1 - 10",
    tableRange: [1, 10],
    namePrefix: "Rooftop",
    defaultCapacity: 4,
  },
];

export const TOTAL_TABLES = 31;

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
  if (lower.includes("family")) return "family";
  if (lower.includes("general")) return "general";
  if (lower.includes("rooftop")) return "rooftop";
  return "family";
}

export function displayTableLabel(name: string): string {
  const n = tableNumberFromName(name);
  return n > 0 ? String(n) : name;
}

export function groupTablesByFloor(tables: TableRecord[]): Record<FloorId, TableRecord[]> {
  const grouped: Record<FloorId, TableRecord[]> = { family: [], general: [], rooftop: [] };
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

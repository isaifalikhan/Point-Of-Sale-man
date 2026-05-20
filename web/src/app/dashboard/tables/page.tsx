'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, LayoutGrid, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { apiClient } from '@/lib/api-client';
import { FloorSection } from '@/components/tables/floor-section';
import {
  TABLE_FLOORS,
  TOTAL_TABLES,
  groupTablesByFloor,
  floorForTable,
  type TableRecord,
  expectedTableName,
} from '@/lib/table-floors';

const TABLE_STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'BILL_PENDING', label: 'Bill pending' },
  { value: 'RESERVED', label: 'Reserved' },
] as const;

export default function FloorPlanManagement() {
  const [tables, setTables] = useState<TableRecord[]>([]);
  const [branches, setBranches] = useState<{ id: string; name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [editingTable, setEditingTable] = useState<TableRecord | null>(null);
  const [savingTable, setSavingTable] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 4,
    branchId: '',
    floorIndex: 0 as 0 | 1,
    tableNum: 1,
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creatingTable, setCreatingTable] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; tableId: string | null }>({
    isOpen: false,
    tableId: null,
  });

  const grouped = useMemo(() => groupTablesByFloor(tables), [tables]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tablesRes, branchesRes] = await Promise.all([
        apiClient.get('/tables'),
        apiClient.get('/branches'),
      ]);
      setTables(tablesRes.data);
      setBranches(branchesRes.data);
      if (branchesRes.data.length > 0) {
        setNewTable((prev) => ({ ...prev, branchId: branchesRes.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching tables data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTableEditor = (table: TableRecord) => {
    setSelectedTableId(table.id);
    setEditingTable({ ...table });
  };

  const closeTableEditor = () => {
    setEditingTable(null);
    setSelectedTableId(null);
  };

  const handleCreateTable = async () => {
    setCreatingTable(true);
    try {
      const floor = TABLE_FLOORS[newTable.floorIndex]!;
      const name =
        newTable.name.trim() || expectedTableName(floor, newTable.tableNum);
      await apiClient.post('/tables', {
        name,
        capacity: newTable.capacity,
        branchId: newTable.branchId,
        x: 0,
        y: 0,
      });
      await fetchData();
      setIsAddOpen(false);
      setNewTable({
        name: '',
        capacity: 4,
        branchId: branches[0]?.id || '',
        floorIndex: 0,
        tableNum: 1,
      });
    } catch (error) {
      console.error('Error creating table:', error);
    } finally {
      setCreatingTable(false);
    }
  };

  const handleSaveTable = async () => {
    if (!editingTable) return;
    setSavingTable(true);
    try {
      const existing = tables.find((t) => t.id === editingTable.id);
      await apiClient.patch(`/tables/${editingTable.id}`, {
        name: editingTable.name.trim(),
        capacity: Math.max(1, editingTable.capacity),
      });
      if (existing && existing.status !== editingTable.status) {
        await apiClient.patch(`/tables/${editingTable.id}/status`, {
          status: editingTable.status,
        });
      }
      const updated = {
        ...editingTable,
        name: editingTable.name.trim(),
        capacity: Math.max(1, editingTable.capacity),
      };
      setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      closeTableEditor();
    } catch (error) {
      console.error('Error updating table:', error);
    } finally {
      setSavingTable(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await apiClient.delete(`/tables/${id}`);
      setTables((prev) => prev.filter((t) => t.id !== id));
      closeTableEditor();
      setConfirmDelete({ isOpen: false, tableId: null });
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const editingFloor = editingTable
    ? TABLE_FLOORS.find((f) => f.id === floorForTable(editingTable.name))?.title
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-20">
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Loading floor plan…
        </p>
      </div>
    );
  }

  const occupied = tables.filter((t) => t.status === 'OCCUPIED').length;
  const free = tables.filter((t) => t.status === 'AVAILABLE').length;

  return (
    <>
      <div className="mx-auto max-w-[1600px] space-y-6 pb-16">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Restaurant floor plan
              </h1>
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              {TOTAL_TABLES} tables · Rooftop 1–18 · Ground 1–4
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-500" /> {free} free
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-900">
              <span className="size-2 rounded-full bg-amber-500" /> {occupied} occupied
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {tables.length} total
            </span>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger
              render={
                <Button className="h-10 bg-indigo-600 px-5 text-xs font-bold uppercase tracking-wider hover:bg-indigo-700">
                  <Plus className="mr-2 h-4 w-4" /> Add table
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add table</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={newTable.floorIndex}
                    onChange={(e) => {
                      const floorIndex = Number(e.target.value) as 0 | 1;
                      const floor = TABLE_FLOORS[floorIndex]!;
                      setNewTable({
                        ...newTable,
                        floorIndex,
                        tableNum: floor.tableRange[0],
                        capacity: floor.defaultCapacity,
                      });
                    }}
                  >
                    {TABLE_FLOORS.map((f, i) => (
                      <option key={f.id} value={i}>
                        {f.title} ({f.tableRange[0]}–{f.tableRange[1]})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Table number</Label>
                  <Input
                    type="number"
                    min={TABLE_FLOORS[newTable.floorIndex]!.tableRange[0]}
                    max={TABLE_FLOORS[newTable.floorIndex]!.tableRange[1]}
                    value={newTable.tableNum}
                    onChange={(e) =>
                      setNewTable({ ...newTable, tableNum: parseInt(e.target.value, 10) || 1 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custom name (optional)</Label>
                  <Input
                    placeholder={expectedTableName(
                      TABLE_FLOORS[newTable.floorIndex]!,
                      newTable.tableNum,
                    )}
                    value={newTable.name}
                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seats</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={newTable.capacity}
                    onChange={(e) =>
                      setNewTable({ ...newTable, capacity: parseInt(e.target.value, 10) || 4 })
                    }
                  />
                </div>
                <Button
                  onClick={handleCreateTable}
                  className="w-full bg-indigo-600"
                  loading={creatingTable}
                >
                  Create table
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-4 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:text-xs">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-amber-500" /> Occupied
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-rose-500" /> Bill pending
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-sky-500" /> Reserved
          </span>
          <span className="text-slate-400">Click a table to edit</span>
        </div>

        <div className="space-y-10">
          {TABLE_FLOORS.map((floor) => (
            <FloorSection
              key={floor.id}
              floor={floor}
              tables={grouped[floor.id]}
              selectedId={selectedTableId}
              onSelectTable={openTableEditor}
            />
          ))}
        </div>

        {tables.length < TOTAL_TABLES && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
            Expected {TOTAL_TABLES} tables; found {tables.length}. Run{' '}
            <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">
              api/src/scripts/seed-tables.ts
            </code>{' '}
            to seed Rooftop 1–18 and Ground 1–4.
          </p>
        )}
      </div>

      <Dialog
        open={!!editingTable}
        onOpenChange={(open) => {
          if (!open) closeTableEditor();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit table</DialogTitle>
            <DialogDescription>
              {editingFloor ? `${editingFloor} · ` : ''}
              Update name, seats, or status. Chair icons update when you change seats.
            </DialogDescription>
          </DialogHeader>
          {editingTable ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-table-name">Table name</Label>
                <Input
                  id="edit-table-name"
                  value={editingTable.name}
                  onChange={(e) =>
                    setEditingTable({ ...editingTable, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-table-seats">Seats</Label>
                <Input
                  id="edit-table-seats"
                  type="number"
                  min={1}
                  max={12}
                  value={editingTable.capacity}
                  onChange={(e) =>
                    setEditingTable({
                      ...editingTable,
                      capacity: Math.max(1, parseInt(e.target.value, 10) || 1),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  1 seat shows 1 chair, 2 seats show 2 chairs, and so on.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-table-status">Status</Label>
                <select
                  id="edit-table-status"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  value={editingTable.status}
                  onChange={(e) =>
                    setEditingTable({ ...editingTable, status: e.target.value })
                  }
                >
                  {TABLE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button
                  onClick={handleSaveTable}
                  className="flex-1 bg-indigo-600"
                  loading={savingTable}
                >
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                  onClick={() =>
                    setConfirmDelete({ isOpen: true, tableId: editingTable.id })
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) => setConfirmDelete({ ...confirmDelete, isOpen: open })}
        title="Delete table?"
        description="This removes the table from the floor plan."
        confirmText="Delete"
        type="danger"
        onConfirm={() => confirmDelete.tableId && handleDeleteTable(confirmDelete.tableId)}
      />
    </>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Layers,
  Mail,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hasAnyPermission, Permission, readPermissionsFromStorage } from '@/lib/rbac';
import { cn } from '@/lib/utils';

type RoleRow = {
  id: string;
  name: string;
  permissions: string[];
  isSystem: boolean;
  _count?: { users: number };
};

type CatalogEntry = { key: string; label: string; description: string };

type StaffRow = {
  id: string;
  email: string;
  name: string;
  role: { id: string; name: string; permissions?: string[] } | null;
  createdAt: string;
  shifts?: { status: string }[];
  hasPin?: boolean;
};

export default function StaffManagement() {
  const router = useRouter();

  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    roleId: '',
    pin: '',
  });

  const [createPreset, setCreatePreset] = useState({
    name: '',
    permissions: [] as string[],
  });

  const [editPreset, setEditPreset] = useState({
    name: '',
    permissions: [] as string[],
  });

  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [roleBeingEdited, setRoleBeingEdited] = useState<RoleRow | null>(null);

  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [memberBeingEdited, setMemberBeingEdited] = useState<StaffRow | null>(null);
  const [memberEditForm, setMemberEditForm] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    pin: '',
  });

  const [addingStaff, setAddingStaff] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingMember, setSavingMember] = useState(false);



  const fetchCatalog = useCallback(async () => {
    try {
      const res = await apiClient.get<CatalogEntry[]>('/roles/catalog');
      setCatalog(res.data);
    } catch {
      setCatalog([]);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    const res = await apiClient.get<RoleRow[]>('/roles');
    setRoles(res.data);
    return res.data;
  }, []);

  const fetchStaff = useCallback(async () => {
    const res = await apiClient.get<StaffRow[]>('/auth/staff');
    setStaff(res.data);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await fetchCatalog();
      await fetchStaff();
      const rList = await fetchRoles();
      setNewMember((nm) =>
        nm.roleId || !rList.length ? nm : { ...nm, roleId: rList[0]?.id ?? '' },
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fetchCatalog, fetchRoles, fetchStaff]);

  useEffect(() => {
    const p = readPermissionsFromStorage();
    if (!hasAnyPermission(p, [Permission.STAFF_MANAGE])) {
      router.replace('/dashboard');
      return;
    }
    void refreshAll();
  }, [refreshAll, router]);

  const togglePermission = (keys: string[], key: string, checked: boolean) => {
    if (key === Permission.ALL) {
      return checked ? [Permission.ALL] : [];
    }
    const withoutAll = keys.filter((k) => k !== Permission.ALL);
    if (checked) return [...new Set([...withoutAll, key])];
    return withoutAll.filter((k) => k !== key);
  };

  const handleAddStaff = async () => {
    setAddingStaff(true);
    try {
      await apiClient.post('/auth/staff', {
        ...newMember,
        roleId: newMember.roleId || undefined,
        pin: newMember.pin || undefined,
      });
      await fetchStaff();
      setNewMember({ name: '', email: '', password: 'Password@123', roleId: roles[0]?.id ?? '', pin: '' });
    } catch (e: unknown) {
      const msg = e as { response?: { data?: { message?: string } } };
      window.alert(msg.response?.data?.message || 'Could not add team member.');
    } finally {
      setAddingStaff(false);
    }
  };

  const handleCreateRole = async () => {
    setCreatingRole(true);
    try {
      await apiClient.post('/roles', createPreset);
      await fetchRoles();
      setCreatePreset({ name: '', permissions: [] });
    } catch (e: unknown) {
      const msg = e as { response?: { data?: { message?: string } } };
      window.alert(msg.response?.data?.message || 'Could not create role.');
    } finally {
      setCreatingRole(false);
    }
  };

  const openEditRole = (r: RoleRow) => {
    setRoleBeingEdited(r);
    setEditPreset({ name: r.name, permissions: [...r.permissions] });
    setEditRoleOpen(true);
  };

  const saveEditedRole = async () => {
    if (!roleBeingEdited) return;
    setSavingRole(true);
    try {
      await apiClient.patch(`/roles/${roleBeingEdited.id}`, editPreset);
      await fetchRoles();
      setEditRoleOpen(false);
      setRoleBeingEdited(null);
    } catch (e: unknown) {
      const msg = e as { response?: { data?: { message?: string } } };
      window.alert(msg.response?.data?.message || 'Could not update role.');
    } finally {
      setSavingRole(false);
    }
  };

  const deleteRole = async (r: RoleRow) => {
    if (r.isSystem) {
      window.alert('Built-in presets cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete role “${r.name}”?`)) return;
    try {
      await apiClient.delete(`/roles/${r.id}`);
      await fetchRoles();
    } catch (e: unknown) {
      const msg = e as { response?: { data?: { message?: string } } };
      window.alert(msg.response?.data?.message || 'Could not delete role.');
    }
  };

  const openEditMember = (m: StaffRow) => {
    setMemberBeingEdited(m);
    setMemberEditForm({
      name: m.name,
      email: m.email,
      password: '',
      roleId: m.role?.id ?? '',
      pin: '',
    });
    setEditMemberOpen(true);
  };

  const saveMember = async () => {
    if (!memberBeingEdited) return;
    setSavingMember(true);
    try {
      const body: Record<string, string> = {
        name: memberEditForm.name.trim(),
        email: memberEditForm.email.trim(),
      };
      body.roleId = memberEditForm.roleId || '';
      if (memberEditForm.password.trim()) {
        body.password = memberEditForm.password.trim();
      }
      if (memberEditForm.pin.length === 4) {
        body.pin = memberEditForm.pin.trim();
      }

      await apiClient.patch(`/auth/staff/${memberBeingEdited.id}`, body);
      await fetchStaff();
      setEditMemberOpen(false);
      setMemberBeingEdited(null);
    } catch (e: unknown) {
      const msg = e as { response?: { data?: { message?: string } } };
      window.alert(msg.response?.data?.message || 'Could not update team member.');
    } finally {
      setSavingMember(false);
    }
  };

  const removeStaff = async (m: StaffRow) => {
    if (!window.confirm(`Remove ${m.name} from this workspace?`)) return;
    try {
      await apiClient.delete(`/auth/staff/${m.id}`);
      await fetchStaff();
    } catch (e: unknown) {
      const msg = e as { response?: { data?: { message?: string } } };
      window.alert(msg.response?.data?.message || 'Could not delete team member.');
    }
  };

  const clearMemberPin = async () => {
    if (!memberBeingEdited || !window.confirm('Remove POS PIN from this teammate?')) return;
    try {
      await apiClient.patch(`/auth/staff/${memberBeingEdited.id}`, { pin: '' });
      await fetchStaff();
      setEditMemberOpen(false);
      setMemberBeingEdited(null);
    } catch (e: unknown) {
      const msg = e as { response?: { data?: { message?: string } } };
      window.alert(msg.response?.data?.message || 'Could not remove PIN.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Loading team…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Roles & employees
          </h1>
          <p className="mt-1 text-slate-500">
            Managers define permission presets, then invite staff with email, password, optional PIN-only
            POS login.
          </p>
        </div>
      </div>

      <Tabs defaultValue="people" className="w-full gap-4">
        <TabsList variant="default" className="h-auto w-full flex-wrap justify-start rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
          <TabsTrigger value="people" className="gap-2 rounded-lg px-4 py-2">
            <Users className="h-4 w-4" /> Team
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2 rounded-lg px-4 py-2">
            <Layers className="h-4 w-4" /> Role presets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="space-y-6 pt-2">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger
                render={
                  <Button type="button" className="bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="mr-2 h-4 w-4" /> Add team member
                  </Button>
                }
              />
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New employee</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Full name</Label>
                    <Input
                      value={newMember.name}
                      placeholder="Jordan Lee"
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                    <div className="grid gap-2">
                      <Label>Email login</Label>
                      <Input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Initial password</Label>
                      <Input
                        type="password"
                        value={newMember.password}
                        onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                    <div className="grid gap-2">
                      <Label>Role preset</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newMember.roleId}
                        onChange={(e) => setNewMember({ ...newMember, roleId: e.target.value })}
                      >
                        <option value="">No role (login only — add a preset later)</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                            {r.isSystem ? ' (built-in)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label>POS PIN (optional)</Label>
                      <Input
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="4 digits"
                        value={newMember.pin}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            pin: e.target.value.replace(/\D/g, '').slice(0, 4),
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button type="button" className="w-full bg-indigo-600" onClick={handleAddStaff} loading={addingStaff}>
                    Create account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/40">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-indigo-500" /> Active teammates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50/30 text-muted-foreground">
                      <th className="px-6 py-4 font-semibold">Employee</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">PIN / shift</th>
                      <th className="px-6 py-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {staff.map((member) => (
                      <tr key={member.id} className="group hover:bg-muted/40">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-indigo-100 bg-white shadow-sm dark:border-indigo-900">
                              <AvatarFallback className="bg-indigo-50 text-[10px] font-bold uppercase text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
                                {member.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground">{member.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Joined {new Date(member.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-3 w-3 shrink-0 opacity-70" />
                            {member.email}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                              member.role ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' : 'bg-muted text-muted-foreground',
                            )}
                          >
                            <Shield className="h-3 w-3" />
                            {member.role?.name ?? 'No role'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider">
                            {member.hasPin ? (
                              <span className="w-fit rounded-sm bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                PIN set
                              </span>
                            ) : (
                              <span className="w-fit rounded-sm bg-muted px-2 py-0.5 text-muted-foreground">
                                No PIN
                              </span>
                            )}
                            {member.shifts?.[0]?.status === 'ACTIVE' ? (
                              <span className="w-fit rounded-sm bg-emerald-600/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                                Clocked in
                              </span>
                            ) : (
                              <span className="w-fit text-muted-foreground">Offline</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEditMember(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeStaff(member)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {staff.length === 0 && (
                  <div className="py-16 text-center text-muted-foreground">No staff yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6 pt-2">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5 text-indigo-500" /> Custom role
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 sm:max-w-md">
                <Label>Preset name</Label>
                <Input
                  value={createPreset.name}
                  placeholder="Shift lead"
                  onChange={(e) => setCreatePreset({ ...createPreset, name: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {catalog.map((c) => (
                  <label
                    key={c.key}
                    className="flex cursor-pointer gap-3 rounded-lg border border-border/80 bg-card/50 p-3 text-left shadow-sm"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-input"
                      checked={createPreset.permissions.includes(c.key)}
                      onChange={(e) =>
                        setCreatePreset({
                          ...createPreset,
                          permissions: togglePermission(
                            createPreset.permissions,
                            c.key,
                            e.target.checked,
                          ),
                        })
                      }
                    />
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{c.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground leading-snug">
                        {c.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <div>
                <Button
                  type="button"
                  className="bg-indigo-600"
                  onClick={handleCreateRole}
                  disabled={!createPreset.name.trim() || createPreset.permissions.length === 0}
                  loading={creatingRole}
                >
                  Save preset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Existing presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-semibold text-foreground">
                      {r.name}
                      {r.isSystem ? (
                        <span className="ml-2 text-xs font-normal uppercase tracking-wider text-muted-foreground">
                          built-in
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {r.permissions.join(', ') || '—'}
                    </div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {r._count?.users ?? 0} assigned
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEditRole(r)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteRole(r)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit “{roleBeingEdited?.name}”</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={editPreset.name}
                onChange={(e) => setEditPreset({ ...editPreset, name: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {catalog.map((c) => (
                <label
                  key={c.key}
                  className="flex cursor-pointer gap-3 rounded-lg border border-border p-3"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={editPreset.permissions.includes(c.key)}
                    onChange={(e) =>
                      setEditPreset({
                        ...editPreset,
                        permissions: togglePermission(
                          editPreset.permissions,
                          c.key,
                          e.target.checked,
                        ),
                      })
                    }
                  />
                  <span className="text-sm font-medium">{c.label}</span>
                </label>
              ))}
            </div>
            <Button
              type="button"
              className="bg-indigo-600"
              onClick={saveEditedRole}
              disabled={!editPreset.name.trim() || editPreset.permissions.length === 0}
              loading={savingRole}
            >
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editMemberOpen} onOpenChange={setEditMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit teammate</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={memberEditForm.name}
                onChange={(e) => setMemberEditForm({ ...memberEditForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={memberEditForm.email}
                onChange={(e) => setMemberEditForm({ ...memberEditForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role preset</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={memberEditForm.roleId}
                onChange={(e) => setMemberEditForm({ ...memberEditForm, roleId: e.target.value })}
              >
                <option value="">No role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>New password (optional)</Label>
              <Input
                type="password"
                value={memberEditForm.password}
                placeholder="leave blank"
                onChange={(e) => setMemberEditForm({ ...memberEditForm, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>New PIN (optional)</Label>
              <Input
                inputMode="numeric"
                maxLength={4}
                placeholder="four digits — leave blank to keep"
                value={memberEditForm.pin}
                onChange={(e) =>
                  setMemberEditForm({
                    ...memberEditForm,
                    pin: e.target.value.replace(/\D/g, '').slice(0, 4),
                  })
                }
              />
              <Button type="button" variant="outline" size="sm" className="w-fit text-xs" onClick={clearMemberPin}>
                Remove PIN entirely
              </Button>
            </div>
            <Button type="button" className="bg-indigo-600" onClick={saveMember} loading={savingMember}>
              Save teammate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

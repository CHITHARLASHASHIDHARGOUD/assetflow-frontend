import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useAuth, usePermissions } from './auth-context';
export { calculateDepreciation } from './types';

/* ---------- mapping: Spring Boot API (camelCase) <-> existing UI shapes ---------- */
const toCat = (c) => ({
  id: c.id,
  name: c.name,
  default_useful_life_years: c.defaultUsefulLifeYears,
  residual_value_percent: Number(c.residualValuePercent ?? 0),
  created_at: '',
});

const toEmp = (e) => ({
  id: e.id,
  name: e.name,
  department: e.department ?? null,
  email: e.email ?? null,
  has_account: e.hasAccount,
  created_at: '',
});

export const toAsset = (a) => ({
  id: a.id,
  asset_tag: a.assetTag,
  name: a.name,
  status: a.status,
  category_id: a.category?.id ?? null,
  asset_categories: a.category ? toCat(a.category) : null,
  serial_number: a.serialNumber ?? null,
  purchase_date: a.purchaseDate,
  purchase_cost: Number(a.purchaseCost),
  condition: a.status === 'RETIRED' ? 'retired' : a.condition ? String(a.condition).toLowerCase() : 'good',
  location: a.location ?? null,
  notes: a.notes ?? null,
  useful_life_years: a.usefulLifeYears,
  residual_value_percent: Number(a.residualValuePercent ?? 0),
  is_archived: a.status === 'RETIRED',
  retired_reason: a.retiredReason ?? null,
  created_by: null,
  created_at: a.createdAt,
  updated_at: a.updatedAt,
});

export const toAssignment = (a) => ({
  id: a.id,
  asset_id: a.assetId,
  asset_tag: a.assetTag,
  asset_name: a.assetName,
  employee_id: a.employeeId,
  assigned_date: a.assignedAt,
  returned_date: a.returnedAt ?? null,
  return_requested_at: a.returnRequestedAt ?? null,
  active: a.active,
  request_id: a.requestId ?? null,
  notes: a.notes ?? null,
  created_at: a.assignedAt,
  employees: { id: a.employeeId, name: a.employeeName, department: null, email: null, created_at: '' },
});

const genTag = () => `AF-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36).toString(36).toUpperCase()}`;

const toAssetBody = (v) => ({
  assetTag: v.asset_tag || genTag(),
  name: v.name,
  categoryId: v.category_id || null,
  serialNumber: v.serial_number || null,
  purchaseDate: v.purchase_date,
  purchaseCost: v.purchase_cost,
  condition: v.condition && v.condition !== 'retired' ? v.condition.toUpperCase() : undefined,
  location: v.location || null,
  notes: v.notes || null,
  usefulLifeYears: v.useful_life_years,
  residualValuePercent: v.residual_value_percent,
});

const invalidateAll = (qc) => {
  ['assets', 'assignments', 'dashboard-stats', 'requests', 'maintenance', 'reports'].forEach(k => qc.invalidateQueries({ queryKey: [k] }));
};

/* ---------- Categories ---------- */
export function useCategories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['categories'],
    enabled: !!user,
    queryFn: async () => ((await api.get('/categories')).data).map(toCat),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v) =>
      toCat((await api.post('/categories', { name: v.name, defaultUsefulLifeYears: v.default_useful_life_years, residualValuePercent: v.residual_value_percent ?? 0 })).data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...v }) => {
      const cur = (qc.getQueryData(['categories']) ?? []).find(c => c.id === id) ?? {};
      const m = { ...cur, ...v };
      return toCat((await api.put(`/categories/${id}`, { name: m.name, defaultUsefulLifeYears: m.default_useful_life_years, residualValuePercent: m.residual_value_percent ?? 0 })).data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/categories/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

/* ---------- Employees (staff + auditor only; auditors get no emails) ---------- */
export function useEmployees() {
  const { canReadAll } = usePermissions();
  return useQuery({
    queryKey: ['employees'],
    enabled: canReadAll,
    queryFn: async () => ((await api.get('/employees')).data).map(toEmp),
  });
}

const empBody = (v) => ({ name: v.name, department: v.department || null, email: v.email || null });

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v) => toEmp((await api.post('/employees', empBody(v))).data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...v }) => {
      const cur = (qc.getQueryData(['employees']) ?? []).find(e => e.id === id) ?? {};
      return toEmp((await api.put(`/employees/${id}`, empBody({ ...cur, ...v }))).data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/employees/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useBulkCreateEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows) => {
      const out = [];
      for (const r of rows) out.push(toEmp((await api.post('/employees', empBody(r))).data));
      return out;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

/* ---------- Assets ---------- */
export function useAllAssets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['assets', 'all'],
    enabled: !!user,
    queryFn: async () => ((await api.get('/assets')).data).map(toAsset),
  });
}

/** Active inventory (retired assets are listed in Reports). */
export function useAssets() {
  const q = useAllAssets();
  return { ...q, data: q.data?.filter((a) => a.status !== 'RETIRED') };
}

export function useAsset(id) {
  return useQuery({
    queryKey: ['assets', id],
    enabled: !!id,
    queryFn: async () => toAsset((await api.get(`/assets/${id}`)).data),
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v) => toAsset((await api.post('/assets', toAssetBody(v))).data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...v }) => {
      if (v.is_archived) return toAsset((await api.post(`/assets/${id}/retire`, { reason: 'Retired from asset editor' })).data);
      const cur = toAsset((await api.get(`/assets/${id}`)).data);
      return toAsset((await api.put(`/assets/${id}`, toAssetBody({ ...cur, ...v }))).data);
    },
    onSuccess: (_, vars) => { invalidateAll(qc); qc.invalidateQueries({ queryKey: ['assets', vars.id] }); },
  });
}

/** "Archive" in the old UI = retire on the server (history is kept). */
export function useArchiveAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.post(`/assets/${id}/retire`, { reason: 'Retired from asset details' }); },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useBulkCreateAssets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows) => {
      const out = [];
      for (const r of rows) out.push(toAsset((await api.post('/assets', toAssetBody(r))).data));
      return out;
    },
    onSettled: () => invalidateAll(qc),
  });
}

/* ---------- Assignments ---------- */
export function useAssignments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['assignments'],
    enabled: !!user,
    queryFn: async () => ((await api.get('/assignments')).data).map(toAssignment),
  });
}

export function useAssetAssignments(assetId) {
  const q = useAssignments();
  return { ...q, data: q.data?.filter((a) => a.asset_id === assetId) };
}

export function useCurrentAssignment(assetId) {
  const q = useAssetAssignments(assetId);
  return { ...q, data: q.data?.find((a) => a.active) ?? null };
}

export function useAssignAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v) =>
      toAssignment((await api.post('/assignments', { assetId: v.asset_id, employeeId: v.employee_id, notes: v.notes || null, requestId: v.request_id || null })).data),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Records the physical return; the asset then waits for inspection. */
export function useUnassignAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId }) => {
      await api.post(`/assignments/${assignmentId}/return`, {});
    },
    onSuccess: () => invalidateAll(qc),
  });
}

/* ---------- Roles (from the server session) ---------- */
export function useUserRole() {
  const { user } = useAuth();
  return { data: user ? user.roles.map(r => r.toLowerCase()) : null };
}

export function useIsAdmin() {
  return usePermissions().isAdmin;
}

/* ---------- Dashboard ---------- */
export function useDashboardStats() {
  const q = useAllAssets();
  const assets = q.data?.filter((a) => a.status !== 'RETIRED');
  const data = assets && {
    total: assets.length,
    assigned: assets.filter((a) => a.status === 'ASSIGNED').length,
    unassigned: assets.filter((a) => a.status !== 'ASSIGNED').length,
    conditions: {
      excellent: assets.filter((a) => a.condition === 'excellent').length,
      good: assets.filter((a) => a.condition === 'good').length,
      fair: assets.filter((a) => a.condition === 'fair').length,
      poor: assets.filter((a) => a.condition === 'poor').length,
      retired: (q.data ?? []).filter((a) => a.status === 'RETIRED').length,
    },
    totalValue: assets.reduce((s, a) => s + a.purchase_cost, 0),
  };
  return { ...q, data };
}

/* ---------- Generic helpers for the new lifecycle screens ---------- */
export function useApiQuery(key, path, enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: key,
    enabled: !!user && enabled,
    queryFn: async () => (await api.get(path)).data,
  });
}

export function useApiAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ path, body, method = 'post' }) =>
      (await api[method](path, body ?? {})).data,
    onSuccess: () => {
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['audit'] });
    },
  });
}

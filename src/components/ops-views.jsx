import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth, usePermissions } from '@/lib/auth-context';
import { errorMessage } from '@/lib/api';
import { useAllAssets, useApiAction, useApiQuery, useAssignments, useCategories, useEmployees } from '@/lib/hooks';
const d = (s) => (s ? format(new Date(s), 'MMM d, yyyy') : '—');
const money = (n) => Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
function PageHeader({ title, subtitle }) {
    return (<div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>);
}
function State({ q, empty, children }) {
    if (q.isLoading)
        return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>;
    if (q.error)
        return <p className="py-8 text-center text-sm text-destructive">{errorMessage(q.error)}</p>;
    const isEmpty = Array.isArray(q.data) ? q.data.length === 0 : !q.data;
    if (isEmpty)
        return <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>;
    return <>{children}</>;
}
function useRun() {
    const action = useApiAction();
    const run = async (path, body, ok) => {
        try {
            await action.mutateAsync({ path, body });
            toast.success(ok);
            return true;
        }
        catch (e) {
            toast.error(errorMessage(e));
            return false;
        }
    };
    return { run, pending: action.isPending };
}
const statusVariant = (s) => (['REJECTED', 'CANCELLED', 'RETIRED'].includes(s) ? 'destructive' : ['PENDING', 'REPORTED', 'OPEN', 'PENDING_INSPECTION', 'MAINTENANCE'].includes(s) ? 'secondary' : 'default');
const StatusBadge = ({ s }) => <Badge variant={statusVariant(s)}>{s.replace('_', ' ')}</Badge>;
/* ================= Employee dashboard ================= */
export function EmployeeDashboard() {
    const { user } = useAuth();
    const asg = useAssignments();
    const reqs = useApiQuery(['requests'], '/requests');
    const active = (asg.data ?? []).filter((a) => a.active);
    const pending = (reqs.data ?? []).filter(r => r.status === 'PENDING');
    return (<div>
      <PageHeader title="My dashboard" subtitle={user?.email}/>
      {!user?.employeeId && (<Card className="mb-4 border-warning"><CardContent className="pt-6 text-sm">Your account isn't linked to an employee record yet, so you can't request assets. Ask an administrator to link it.</CardContent></Card>)}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Assets assigned to me</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{asg.isLoading ? '…' : active.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Pending requests</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{reqs.isLoading ? '…' : pending.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Quick actions</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
          <Link to="/requests"><Button size="sm">Request an asset</Button></Link>
          <Link to="/assignments"><Button size="sm" variant="outline">My assets</Button></Link>
        </CardContent></Card>
      </div>
      {(asg.error || reqs.error) && <p className="mt-4 text-sm text-destructive">{errorMessage(asg.error || reqs.error)}</p>}
    </div>);
}
/* ================= Assignments + returns + inspections ================= */
export function AssignmentsView() {
    const { canManage, isEmployeeOnly } = usePermissions();
    const q = useAssignments();
    const assets = useAllAssets();
    const employees = useEmployees();
    const { run, pending } = useRun();
    const [filter, setFilter] = useState('active');
    const [assetId, setAssetId] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [inspect, setInspect] = useState({});
    const [issue, setIssue] = useState({});
    const rows = (q.data ?? []).filter((a) => filter === 'all' || a.active);
    const statusOf = (id) => (assets.data ?? []).find((a) => a.id === id)?.status;
    const awaiting = (q.data ?? []).filter((a) => !a.active && statusOf(a.asset_id) === 'PENDING_INSPECTION');
    const available = (assets.data ?? []).filter((a) => a.status === 'AVAILABLE');
    return (<div>
      <PageHeader title={isEmployeeOnly ? 'My assets' : 'Assignments & returns'} subtitle={isEmployeeOnly ? 'Assets currently and previously assigned to you' : 'Assign, return and inspect assets'}/>

      {canManage && (<Card className="mb-6"><CardHeader><CardTitle className="text-base">Assign an asset</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Select value={assetId} onValueChange={setAssetId}><SelectTrigger className="sm:w-72"><SelectValue placeholder="Available asset"/></SelectTrigger>
              <SelectContent>{available.map((a) => <SelectItem key={a.id} value={a.id}>{a.asset_tag} · {a.name}</SelectItem>)}</SelectContent></Select>
            <Select value={employeeId} onValueChange={setEmployeeId}><SelectTrigger className="sm:w-64"><SelectValue placeholder="Employee"/></SelectTrigger>
              <SelectContent>{(employees.data ?? []).map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select>
            <Button disabled={!assetId || !employeeId || pending} onClick={async () => {
                if (await run('/assignments', { assetId, employeeId }, 'Asset assigned')) {
                    setAssetId('');
                    setEmployeeId('');
                }
            }}>Assign</Button>
          </CardContent></Card>)}

      {canManage && awaiting.length > 0 && (<Card className="mb-6"><CardHeader><CardTitle className="text-base">Returned, awaiting inspection</CardTitle></CardHeader>
          <CardContent className="space-y-3">{awaiting.map((a) => {
                const v = inspect[a.id] ?? { condition: 'GOOD', outcome: 'INVENTORY', notes: '' };
                const set = (p) => setInspect(s => ({ ...s, [a.id]: { ...v, ...p } }));
                return (<div key={a.id} className="flex flex-col gap-2 rounded-md border p-3 lg:flex-row lg:items-center">
                <span className="text-sm font-medium lg:w-56">{a.asset_tag} · {a.asset_name}</span>
                <Select value={v.condition} onValueChange={c => set({ condition: c })}><SelectTrigger className="lg:w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{['EXCELLENT', 'GOOD', 'FAIR', 'POOR'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                <Select value={v.outcome} onValueChange={o => set({ outcome: o })}><SelectTrigger className="lg:w-48"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="INVENTORY">Back to inventory</SelectItem><SelectItem value="MAINTENANCE">Send to maintenance</SelectItem><SelectItem value="RETIRE">Retire</SelectItem></SelectContent></Select>
                <Input placeholder="Notes" value={v.notes} onChange={e => set({ notes: e.target.value })}/>
                <Button size="sm" disabled={pending} onClick={() => run('/inspections', { assignmentId: a.id, ...v, notes: v.notes || null }, 'Inspection recorded')}>Save inspection</Button>
              </div>);
            })}</CardContent></Card>)}

      <div className="mb-3 flex gap-2">
        <Button size="sm" variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>Active</Button>
        <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All history</Button>
      </div>
      <Card><CardContent className="pt-6">
        <State q={{ ...q, data: rows }} empty={isEmployeeOnly ? 'No assets are assigned to you.' : 'No assignments found.'}>
          <Table><TableHeader><TableRow><TableHead>Asset</TableHead>{!isEmployeeOnly && <TableHead>Employee</TableHead>}<TableHead>Assigned</TableHead><TableHead>Returned</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((a) => (<TableRow key={a.id}>
                <TableCell><Link to="/assets/$assetId" params={{ assetId: a.asset_id }} className="font-medium hover:underline">{a.asset_tag}</Link> <span className="text-muted-foreground">{a.asset_name}</span></TableCell>
                {!isEmployeeOnly && <TableCell>{a.employees?.name}</TableCell>}
                <TableCell>{d(a.assigned_date)}</TableCell>
                <TableCell>{a.active ? (a.return_requested_at ? <Badge variant="secondary">Return requested</Badge> : 'In use') : d(a.returned_date)}</TableCell>
                <TableCell className="text-right">
                  {a.active && canManage && <Button size="sm" variant="outline" disabled={pending} onClick={() => run(`/assignments/${a.id}/return`, {}, 'Return recorded; asset awaits inspection')}>Record return</Button>}
                  {a.active && isEmployeeOnly && (<div className="flex flex-col items-end gap-2">
                      {!a.return_requested_at && <Button size="sm" variant="outline" disabled={pending} onClick={() => run(`/assignments/${a.id}/request-return`, {}, 'Return requested')}>Request return</Button>}
                      <div className="flex gap-2">
                        <Input className="h-8 w-48" placeholder="Describe a problem" value={issue[a.id] ?? ''} onChange={e => setIssue(s => ({ ...s, [a.id]: e.target.value }))}/>
                        <Button size="sm" variant="ghost" disabled={!issue[a.id]?.trim() || pending} onClick={async () => {
                    if (await run('/maintenance/report', { assetId: a.asset_id, issue: issue[a.id] }, 'Issue reported'))
                        setIssue(s => ({ ...s, [a.id]: '' }));
                }}>Report</Button>
                      </div>
                    </div>)}
                </TableCell>
              </TableRow>))}</TableBody></Table>
        </State>
      </CardContent></Card>
    </div>);
}
/* ================= Requests ================= */
export function RequestsView() {
    const { user } = useAuth();
    const { canManage, hasRole } = usePermissions();
    const q = useApiQuery(['requests'], '/requests');
    const cats = useCategories();
    const assets = useAllAssets();
    const employees = useEmployees();
    const { run, pending } = useRun();
    const [categoryId, setCategoryId] = useState('');
    const [reason, setReason] = useState('');
    const [pick, setPick] = useState({});
    const canRequest = hasRole('EMPLOYEE') && !!user?.employeeId;
    const available = (assets.data ?? []).filter((a) => a.status === 'AVAILABLE');
    return (<div>
      <PageHeader title={canManage ? 'Asset requests' : 'My requests'} subtitle={canManage ? 'Approve, reject and fulfil requests' : 'Request equipment and follow its status'}/>
      {hasRole('EMPLOYEE') && (<Card className="mb-6"><CardHeader><CardTitle className="text-base">Request an asset</CardTitle></CardHeader>
          <CardContent>
            {!canRequest ? <p className="text-sm text-muted-foreground">Your account must be linked to an employee record before you can request assets.</p> : (<div className="flex flex-col gap-3">
                <Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger className="sm:w-72"><SelectValue placeholder="Category"/></SelectTrigger>
                  <SelectContent>{(cats.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                <Textarea placeholder="Why do you need it?" value={reason} onChange={e => setReason(e.target.value)} maxLength={1000}/>
                <Button className="self-start" disabled={!categoryId || !reason.trim() || pending} onClick={async () => {
                    if (await run('/requests', { categoryId, reason }, 'Request submitted')) {
                        setReason('');
                        setCategoryId('');
                    }
                }}>Submit request</Button>
              </div>)}
          </CardContent></Card>)}
      <Card><CardContent className="pt-6">
        <State q={q} empty="No requests yet.">
          <Table><TableHeader><TableRow><TableHead>Date</TableHead>{canManage && <TableHead>Employee</TableHead>}<TableHead>Category</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{(q.data ?? []).map(r => {
            const own = r.employeeId === user?.employeeId;
            const options = available.filter((a) => !r.category || a.category_id === r.category.id);
            return (<TableRow key={r.id}>
                  <TableCell>{d(r.createdAt)}</TableCell>
                  {canManage && <TableCell>{r.employeeName}</TableCell>}
                  <TableCell>{r.category?.name ?? '—'}{r.assetTag ? ` · ${r.assetTag}` : ''}</TableCell>
                  <TableCell className="max-w-xs truncate" title={r.reason}>{r.reason}{r.decisionNote ? <span className="block text-xs text-muted-foreground">Note: {r.decisionNote}</span> : null}</TableCell>
                  <TableCell><StatusBadge s={r.status}/></TableCell>
                  <TableCell className="space-x-2 text-right">
                    {r.status === 'PENDING' && canManage && !own && <>
                      <Button size="sm" disabled={pending} onClick={() => run(`/requests/${r.id}/approve`, {}, 'Request approved')}>Approve</Button>
                      <Button size="sm" variant="outline" disabled={pending} onClick={() => { const note = window.prompt('Reason for rejection (optional)') ?? undefined; run(`/requests/${r.id}/reject`, { note }, 'Request rejected'); }}>Reject</Button>
                    </>}
                    {r.status === 'APPROVED' && canManage && (employees.data ? (<span className="inline-flex gap-2">
                        <Select value={pick[r.id] ?? r.assetId ?? ''} onValueChange={v => setPick(s => ({ ...s, [r.id]: v }))}><SelectTrigger className="h-8 w-48"><SelectValue placeholder="Pick asset"/></SelectTrigger>
                          <SelectContent>{options.map((a) => <SelectItem key={a.id} value={a.id}>{a.asset_tag} · {a.name}</SelectItem>)}</SelectContent></Select>
                        <Button size="sm" disabled={!(pick[r.id] ?? r.assetId) || pending} onClick={() => run('/assignments', { assetId: pick[r.id] ?? r.assetId, employeeId: r.employeeId, requestId: r.id }, 'Request fulfilled')}>Assign</Button>
                      </span>) : null)}
                    {r.status === 'PENDING' && own && <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(`/requests/${r.id}/cancel`, {}, 'Request cancelled')}>Cancel</Button>}
                  </TableCell>
                </TableRow>);
        })}</TableBody></Table>
        </State>
      </CardContent></Card>
    </div>);
}
/* ================= Maintenance ================= */
export function MaintenanceView() {
    const { canManage, isEmployeeOnly } = usePermissions();
    const q = useApiQuery(['maintenance'], '/maintenance');
    const assets = useAllAssets();
    const { run, pending } = useRun();
    const [assetId, setAssetId] = useState('');
    const [issue, setIssue] = useState('');
    const available = (assets.data ?? []).filter((a) => a.status === 'AVAILABLE');
    const complete = (id, outcome) => {
        const resolution = window.prompt('What was done?');
        if (!resolution?.trim())
            return;
        const costText = window.prompt('Cost (optional)') ?? '';
        const cost = costText.trim() ? Number(costText) : null;
        if (cost !== null && (Number.isNaN(cost) || cost < 0)) {
            toast.error('Cost must be a positive number');
            return;
        }
        run(`/maintenance/${id}/complete`, { outcome, resolution, cost }, outcome === 'RETIRED' ? 'Completed; asset retired' : 'Completed; asset back in inventory');
    };
    return (<div>
      <PageHeader title={isEmployeeOnly ? 'My reported issues' : 'Maintenance'} subtitle={isEmployeeOnly ? 'Report problems from My assets' : 'Repairs and service history'}/>
      {canManage && (<Card className="mb-6"><CardHeader><CardTitle className="text-base">Send an asset to maintenance</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Select value={assetId} onValueChange={setAssetId}><SelectTrigger className="sm:w-72"><SelectValue placeholder="Available asset"/></SelectTrigger>
              <SelectContent>{available.map((a) => <SelectItem key={a.id} value={a.id}>{a.asset_tag} · {a.name}</SelectItem>)}</SelectContent></Select>
            <Input placeholder="Issue" value={issue} onChange={e => setIssue(e.target.value)}/>
            <Button disabled={!assetId || !issue.trim() || pending} onClick={async () => { if (await run('/maintenance', { assetId, issue }, 'Maintenance opened')) {
            setAssetId('');
            setIssue('');
        } }}>Open</Button>
          </CardContent></Card>)}
      <Card><CardContent className="pt-6">
        <State q={q} empty="No maintenance records.">
          <Table><TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Issue</TableHead><TableHead>Status</TableHead><TableHead>Opened</TableHead><TableHead>Closed</TableHead><TableHead>Cost</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{(q.data ?? []).map(m => (<TableRow key={m.id}>
                <TableCell>{m.assetTag} <span className="text-muted-foreground">{m.assetName}</span></TableCell>
                <TableCell className="max-w-xs">{m.issue}{m.resolution && <span className="block text-xs text-muted-foreground">Fix: {m.resolution}</span>}</TableCell>
                <TableCell><StatusBadge s={m.status}/></TableCell>
                <TableCell>{d(m.openedAt)}</TableCell><TableCell>{d(m.closedAt)}</TableCell>
                <TableCell>{m.cost != null ? money(m.cost) : '—'}</TableCell>
                <TableCell className="space-x-2 text-right">{canManage && <>
                  {m.status === 'REPORTED' && <><Button size="sm" variant="outline" disabled={pending} onClick={() => run(`/maintenance/${m.id}/start`, {}, 'Maintenance started')}>Start</Button>
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(`/maintenance/${m.id}/cancel`, {}, 'Issue closed')}>Dismiss</Button></>}
                  {m.status === 'OPEN' && <><Button size="sm" disabled={pending} onClick={() => complete(m.id, 'AVAILABLE')}>Complete</Button>
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => complete(m.id, 'RETIRED')}>Retire</Button></>}
                </>}</TableCell>
              </TableRow>))}</TableBody></Table>
        </State>
      </CardContent></Card>
    </div>);
}
/* ================= Reports ================= */
const REPORTS = [
    { key: 'inventory', label: 'Inventory' }, { key: 'assignments', label: 'Assignments' },
    { key: 'maintenance', label: 'Maintenance' }, { key: 'returns', label: 'Returns' },
    { key: 'depreciation', label: 'Depreciation' }, { key: 'retired', label: 'Retired' },
];
export function ReportsView() {
    const [tab, setTab] = useState('inventory');
    const q = useApiQuery(['reports', tab], `/reports/${tab}`);
    const r = q.data;
    const Stat = ({ label, value }) => (<Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{value}</CardContent></Card>);
    return (<div>
      <PageHeader title="Reports" subtitle="Live figures from the AssetFlow server"/>
      <div className="mb-4 flex flex-wrap gap-2">{REPORTS.map(x => <Button key={x.key} size="sm" variant={tab === x.key ? 'default' : 'outline'} onClick={() => setTab(x.key)}>{x.label}</Button>)}</div>
      <State q={q} empty="No data.">
        {r && tab === 'inventory' && <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Stat label="Total assets" value={r.totalAssets}/><Stat label="Total purchase cost" value={money(r.totalPurchaseCost)}/></div>
          <div className="grid gap-4 sm:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">By status</CardTitle></CardHeader><CardContent>{Object.entries(r.byStatus).map(([k, v]) => <div key={k} className="flex justify-between text-sm py-1"><span>{k}</span><span>{String(v)}</span></div>)}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">By category</CardTitle></CardHeader><CardContent>{Object.entries(r.byCategory).map(([k, v]) => <div key={k} className="flex justify-between text-sm py-1"><span>{k}</span><span>{String(v)}</span></div>)}</CardContent></Card></div></div>}
        {r && tab === 'assignments' && <div className="grid gap-4 sm:grid-cols-3"><Stat label="Active" value={r.active}/><Stat label="Returned" value={r.returned}/><Stat label="Return requested" value={r.returnRequested}/></div>}
        {r && tab === 'maintenance' && <div className="grid gap-4 sm:grid-cols-4"><Stat label="Reported" value={r.reported}/><Stat label="Open" value={r.open}/><Stat label="Completed" value={r.completed}/><Stat label="Total cost" value={money(r.totalCost)}/></div>}
        {r && tab === 'returns' && <div className="grid gap-4 sm:grid-cols-3"><Stat label="Returned" value={r.returned}/><Stat label="Awaiting inspection" value={r.pendingInspection}/><Stat label="Outcomes" value={<span className="text-sm font-normal">{Object.entries(r.outcomes).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'}</span>}/></div>}
        {r && tab === 'depreciation' && <Card><CardContent className="pt-6"><p className="mb-3 text-sm">Cost {money(r.totalCost)} · Book value {money(r.totalBookValue)}</p>
          <Table><TableHeader><TableRow><TableHead>Tag</TableHead><TableHead>Name</TableHead><TableHead>Cost</TableHead><TableHead>Per year</TableHead><TableHead>Book value</TableHead></TableRow></TableHeader>
            <TableBody>{r.rows.map((x) => <TableRow key={x.assetId}><TableCell>{x.assetTag}</TableCell><TableCell>{x.name}</TableCell><TableCell>{money(x.purchaseCost)}</TableCell><TableCell>{money(x.annualDepreciation)}</TableCell><TableCell>{money(x.bookValue)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>}
        {r && tab === 'retired' && <Card><CardContent className="pt-6">{r.count === 0 ? <p className="text-sm text-muted-foreground">No retired assets.</p> :
                <Table><TableHeader><TableRow><TableHead>Tag</TableHead><TableHead>Name</TableHead><TableHead>Retired</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
            <TableBody>{r.assets.map((a) => <TableRow key={a.id}><TableCell>{a.assetTag}</TableCell><TableCell>{a.name}</TableCell><TableCell>{d(a.retiredAt)}</TableCell><TableCell>{a.retiredReason}</TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>}
      </State>
    </div>);
}
/* ================= Audit logs ================= */
export function AuditView() {
    const [page, setPage] = useState(0);
    const q = useApiQuery(['audit', page], `/audit-logs?page=${page}&size=50`);
    const rows = q.data?.content ?? [];
    const totalPages = q.data?.totalPages ?? q.data?.page?.totalPages ?? 1;
    return (<div>
      <PageHeader title="Audit log" subtitle="Every change, read-only"/>
      <Card><CardContent className="pt-6">
        <State q={{ ...q, data: rows }} empty="No audit entries.">
          <Table><TableHeader><TableRow><TableHead>When</TableHead><TableHead>Who</TableHead><TableHead>Action</TableHead><TableHead>Record</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((l) => <TableRow key={l.id}><TableCell className="whitespace-nowrap">{format(new Date(l.createdAt), 'MMM d, HH:mm')}</TableCell><TableCell>{l.actorEmail}</TableCell><TableCell>{l.action}</TableCell><TableCell>{l.entityType}</TableCell><TableCell className="max-w-sm truncate font-mono text-xs" title={l.details}>{l.details}</TableCell></TableRow>)}</TableBody></Table>
        </State>
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
          <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </CardContent></Card>
    </div>);
}
/* ================= Users & roles (admin) ================= */
const ALL_ROLES = ['ADMIN', 'IT_MANAGER', 'EMPLOYEE', 'AUDITOR'];
export function UsersView() {
    const { user: me } = useAuth();
    const q = useApiQuery(['users'], '/users');
    const employees = useEmployees();
    const action = useApiAction();
    const put = async (path, body, ok) => {
        try {
            await action.mutateAsync({ path, body, method: 'put' });
            toast.success(ok);
        }
        catch (e) {
            toast.error(errorMessage(e));
        }
    };
    const toggleRole = (u, role) => {
        const roles = u.roles.includes(role) ? u.roles.filter((r) => r !== role) : [...u.roles, role];
        if (!roles.length) {
            toast.error('A user needs at least one role');
            return;
        }
        put(`/users/${u.id}/roles`, { roles }, 'Roles updated');
    };
    return (<div>
      <PageHeader title="Users & roles" subtitle="Grant roles, disable accounts and link people to employee records"/>
      <Card><CardContent className="pt-6">
        <State q={q} empty="No users.">
          <Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Roles</TableHead><TableHead>Employee record</TableHead><TableHead className="text-right">Account</TableHead></TableRow></TableHeader>
            <TableBody>{(q.data ?? []).map(u => (<TableRow key={u.id}>
                <TableCell>{u.email}{u.id === me?.id && <Badge variant="secondary" className="ml-2">You</Badge>}</TableCell>
                <TableCell className="space-x-1">{ALL_ROLES.map(r => (<Button key={r} size="sm" variant={u.roles.includes(r) ? 'default' : 'outline'} className="h-7 px-2 text-xs" disabled={action.isPending} onClick={() => toggleRole(u, r)}>{r.replace('_', ' ')}</Button>))}</TableCell>
                <TableCell>
                  <Select value={u.employeeId ?? 'none'} onValueChange={v => put(`/users/${u.id}/employee`, { employeeId: v === 'none' ? null : v }, 'Employee link updated')}>
                    <SelectTrigger className="h-8 w-52"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">Not linked</SelectItem>{(employees.data ?? []).map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant={u.enabled ? 'outline' : 'default'} disabled={u.id === me?.id || action.isPending} onClick={() => put(`/users/${u.id}/enabled`, { enabled: !u.enabled }, u.enabled ? 'Account disabled' : 'Account enabled')}>{u.enabled ? 'Disable' : 'Enable'}</Button>
                </TableCell>
              </TableRow>))}</TableBody></Table>
        </State>
      </CardContent></Card>
    </div>);
}
/* ================= Profile ================= */
export function ProfileView() {
    const { user } = useAuth();
    const emp = useApiQuery(['me-employee'], '/employees/me', !!user?.employeeId);
    return (<div>
      <PageHeader title="My profile"/>
      <Card className="max-w-lg"><CardContent className="space-y-2 pt-6 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{user?.email}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Roles</span><span>{user?.roles.join(', ')}</span></div>
        {user?.employeeId ? (emp.isLoading ? <p>Loading…</p> : emp.error ? <p className="text-destructive">{errorMessage(emp.error)}</p> : emp.data && <>
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{emp.data.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span>{emp.data.department ?? '—'}</span></div>
        </>) : <p className="text-muted-foreground">Not linked to an employee record yet.</p>}
      </CardContent></Card>
    </div>);
}

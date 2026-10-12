import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/lib/use-auth';
import { LayoutDashboard, Package, Users, Settings, LogOut, Menu, X, ArrowLeftRight, ClipboardList, Wrench, BarChart3, ScrollText, ShieldCheck, UserCircle, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
const ALL = ['ADMIN', 'IT_MANAGER', 'EMPLOYEE', 'AUDITOR'];
const STAFF = ['ADMIN', 'IT_MANAGER'];
// Menu per role (UI only; the server enforces permissions).
const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard, roles: ALL },
    { label: 'Assets', to: '/assets', icon: Package, roles: ALL },
    { label: 'Assignments', employeeLabel: 'My assets', to: '/assignments', icon: ArrowLeftRight, roles: ALL },
    { label: 'Requests', employeeLabel: 'My requests', to: '/requests', icon: ClipboardList, roles: ALL },
    { label: 'Maintenance', employeeLabel: 'My issues', to: '/maintenance', icon: Wrench, roles: ALL },
    { label: 'Employees', to: '/employees', icon: Users, roles: [...STAFF, 'AUDITOR'] },
    { label: 'Reports', to: '/reports', icon: BarChart3, roles: [...STAFF, 'AUDITOR'] },
    { label: 'Audit log', to: '/audit', icon: ScrollText, roles: ['ADMIN', 'AUDITOR'] },
    { label: 'Users & roles', to: '/users', icon: ShieldCheck, roles: ['ADMIN'] },
    { label: 'Settings', to: '/settings', icon: Settings, roles: ['ADMIN'] },
    { label: 'My profile', to: '/profile', icon: UserCircle, roles: ALL },
];
export function AppLayout({ children }) {
    const { signOut, user, hasRole } = useAuth();
    const employeeOnly = !hasRole('ADMIN', 'IT_MANAGER', 'AUDITOR');
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dotGridBg = {
        backgroundImage: `radial-gradient(circle, var(--landing-grid) 1.2px, transparent 1.2px)`,
        backgroundSize: '24px 24px',
    };
    return (<div className="flex min-h-screen w-full bg-landing-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (<div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)}/>)}

      {/* Sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-14 items-center justify-between gap-2 border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-sidebar-foreground"/>
            <span className="text-sm font-semibold text-sidebar-foreground">AssetFlow</span>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5"/>
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.filter(item => hasRole(...item.roles)).map(item => {
            const isActive = location.pathname === item.to ||
                (item.to !== '/' && location.pathname.startsWith(item.to));
            return (<Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={cn('flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]', isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}>
                <item.icon className="h-4 w-4"/>
                {employeeOnly && item.employeeLabel ? item.employeeLabel : item.label}
              </Link>);
        })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 truncate px-3 text-xs text-sidebar-foreground/50">
            {user?.email}
            <span className="block text-sidebar-foreground/40">{user?.roles.map(r => r.replace('_', ' ')).join(', ')}</span>
          </div>
          <button onClick={() => signOut()} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4"/>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-landing-grid px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="h-11 w-11 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5"/>
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6" style={dotGridBg}>{children}</main>
      </div>
    </div>);
}

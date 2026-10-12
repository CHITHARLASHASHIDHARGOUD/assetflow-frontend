import { createFileRoute, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/lib/use-auth';
import { LoginPage } from '@/components/login-page';
import { LandingPage } from '@/components/landing-page';
import { AppLayout } from '@/components/app-layout';
import { DashboardView } from '@/components/dashboard-view';
import { EmployeeDashboard } from '@/components/ops-views';
export const Route = createFileRoute('/')({
    head: () => ({ meta: [{ title: 'AssetFlow — IT asset lifecycle platform' }, { name: 'description', content: 'Track, assign, maintain and retire IT assets with role-based workflows.' }, { property: 'og:title', content: 'AssetFlow — IT asset lifecycle platform' }, { property: 'og:description', content: 'Track, assign, maintain and retire IT assets with role-based workflows.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
    component: IndexPage,
});
function IndexPage() {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();
    const showLogin = location.hash === 'login';
    if (loading) {
        return (<div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/>
      </div>);
    }
    if (user) {
        return (<AppLayout>
        {hasRole('ADMIN', 'IT_MANAGER', 'AUDITOR') ? <DashboardView /> : <EmployeeDashboard />}
      </AppLayout>);
    }
    if (showLogin)
        return <LoginPage />;
    return <LandingPage />;
}

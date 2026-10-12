import { Link } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { LoginPage } from '@/components/login-page';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
export function AccessDenied() {
    return (<div className="mx-auto mt-16 max-w-md text-center">
      <ShieldAlert className="mx-auto h-10 w-10 text-destructive"/>
      <h1 className="mt-4 text-xl font-semibold">Access denied</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your role doesn't include this page. Ask an administrator if you need access.</p>
      <Link to="/"><Button variant="outline" className="mt-6">Back to dashboard</Button></Link>
    </div>);
}
/** Signed-in shell with a role check. UI only; the server enforces permissions. */
export function RolePage({ roles, children }) {
    const { user, loading, hasRole } = useAuth();
    if (loading) {
        return <div className="flex min-h-screen items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/></div>;
    }
    if (!user)
        return <LoginPage />;
    return <AppLayout>{roles && !hasRole(...roles) ? <AccessDenied /> : children}</AppLayout>;
}

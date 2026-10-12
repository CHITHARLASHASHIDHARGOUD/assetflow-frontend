import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShieldAlert } from 'lucide-react';
export const Route = createFileRoute('/reset-password')({
    head: () => ({
        meta: [
            { title: 'Reset Password — AssetFlow' },
            { name: 'description', content: 'Password reset is managed by administrators.' },
        ],
    }),
    component: ResetPasswordPage,
});
function ResetPasswordPage() {
    return (<div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary"/>
          </div>
          <CardTitle className="text-lg">Password Reset</CardTitle>
          <CardDescription>
            Self-service password reset is not supported by the AssetFlow authentication server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex items-start gap-3 rounded-lg border border-muted p-4 text-left text-sm text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"/>
            <p>
              User accounts and credentials are managed directly by your system administrator. If you have forgotten your password or lost access, please contact an AssetFlow administrator to reset your credentials.
            </p>
          </div>
          <Link to="/">
            <Button className="w-full">Back to sign in</Button>
          </Link>
        </CardContent>
      </Card>
    </div>);
}

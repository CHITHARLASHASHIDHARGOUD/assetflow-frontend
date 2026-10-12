import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/lib/use-auth';
import { useAsset } from '@/lib/hooks';
import { LoginPage } from '@/components/login-page';
import { AppLayout } from '@/components/app-layout';
import { AssetFormView } from '@/components/asset-form-view';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessDenied } from '@/components/role-page';
export const Route = createFileRoute('/assets/$assetId/edit')({
    head: () => ({ meta: [{ title: 'Edit asset — AssetFlow' }, { name: 'description', content: 'Update an IT asset.' }, { property: 'og:title', content: 'Edit asset — AssetFlow' }, { property: 'og:description', content: 'Update an IT asset.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
    component: AssetEditPage,
});
function AssetEditPage() {
    const { assetId } = Route.useParams();
    const { user, loading: authLoading, hasRole } = useAuth();
    const { data: asset, isLoading } = useAsset(assetId);
    if (authLoading)
        return <div className="flex min-h-screen items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/></div>;
    if (!user)
        return <LoginPage />;
    if (!hasRole('ADMIN', 'IT_MANAGER'))
        return <AppLayout><AccessDenied /></AppLayout>;
    if (isLoading) {
        return (<AppLayout>
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-8 w-48"/>
          <Skeleton className="h-96 w-full"/>
        </div>
      </AppLayout>);
    }
    if (!asset) {
        return (<AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Asset not found</p>
        </div>
      </AppLayout>);
    }
    return (<AppLayout>
      <AssetFormView asset={{
            id: asset.id,
            asset_tag: asset.asset_tag ?? null,
            name: asset.name,
            category_id: asset.category_id,
            serial_number: asset.serial_number,
            purchase_date: asset.purchase_date,
            purchase_cost: Number(asset.purchase_cost),
            condition: asset.condition,
            location: asset.location,
            notes: asset.notes,
            useful_life_years: asset.useful_life_years,
            residual_value_percent: Number(asset.residual_value_percent),
        }}/>
    </AppLayout>);
}

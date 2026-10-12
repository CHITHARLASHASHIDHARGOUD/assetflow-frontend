import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { AssetFormView } from '@/components/asset-form-view';
export const Route = createFileRoute('/assets/new')({
    head: () => ({
        meta: [
            { title: 'New asset — AssetFlow' },
            { name: 'description', content: 'Register a new IT asset.' },
            { property: 'og:title', content: 'New asset — AssetFlow' },
            { property: 'og:description', content: 'Register a new IT asset.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: NewAssetPage,
});
function NewAssetPage() {
    return <RolePage roles={['ADMIN', 'IT_MANAGER']}><AssetFormView /></RolePage>;
}

import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { AssetsListView } from '@/components/assets-list-view';
export const Route = createFileRoute('/assets/')({
    head: () => ({
        meta: [
            { title: 'Asset inventory — AssetFlow' },
            { name: 'description', content: 'Search and filter every IT asset.' },
            { property: 'og:title', content: 'Asset inventory — AssetFlow' },
            { property: 'og:description', content: 'Search and filter every IT asset.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: AssetsPage,
});
function AssetsPage() {
    return <RolePage><AssetsListView /></RolePage>;
}

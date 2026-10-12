import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { RequestsView } from '@/components/ops-views';
export const Route = createFileRoute('/requests')({
    head: () => ({
        meta: [
            { title: 'Asset requests — AssetFlow' },
            { name: 'description', content: 'Request equipment and track approvals.' },
            { property: 'og:title', content: 'Asset requests — AssetFlow' },
            { property: 'og:description', content: 'Request equipment and track approvals.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: () => <RolePage><RequestsView /></RolePage>,
});

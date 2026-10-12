import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { MaintenanceView } from '@/components/ops-views';
export const Route = createFileRoute('/maintenance')({
    head: () => ({
        meta: [
            { title: 'Maintenance — AssetFlow' },
            { name: 'description', content: 'Repairs and service history for IT assets.' },
            { property: 'og:title', content: 'Maintenance — AssetFlow' },
            { property: 'og:description', content: 'Repairs and service history for IT assets.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: () => <RolePage><MaintenanceView /></RolePage>,
});

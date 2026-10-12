import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { ReportsView } from '@/components/ops-views';
export const Route = createFileRoute('/reports')({
    head: () => ({
        meta: [
            { title: 'Reports — AssetFlow' },
            { name: 'description', content: 'Inventory, assignment, maintenance and depreciation reports.' },
            { property: 'og:title', content: 'Reports — AssetFlow' },
            { property: 'og:description', content: 'Inventory, assignment, maintenance and depreciation reports.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: () => <RolePage roles={['ADMIN', 'IT_MANAGER', 'AUDITOR']}><ReportsView /></RolePage>,
});

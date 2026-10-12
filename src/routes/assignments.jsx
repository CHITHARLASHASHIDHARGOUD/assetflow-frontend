import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { AssignmentsView } from '@/components/ops-views';
export const Route = createFileRoute('/assignments')({
    head: () => ({
        meta: [
            { title: 'Assignments — AssetFlow' },
            { name: 'description', content: 'Assign, return and inspect IT assets.' },
            { property: 'og:title', content: 'Assignments — AssetFlow' },
            { property: 'og:description', content: 'Assign, return and inspect IT assets.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: () => <RolePage><AssignmentsView /></RolePage>,
});

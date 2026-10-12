import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { UsersView } from '@/components/ops-views';
export const Route = createFileRoute('/users')({
    head: () => ({
        meta: [
            { title: 'Users and roles — AssetFlow' },
            { name: 'description', content: 'Manage user accounts and roles.' },
            { property: 'og:title', content: 'Users and roles — AssetFlow' },
            { property: 'og:description', content: 'Manage user accounts and roles.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: () => <RolePage roles={['ADMIN']}><UsersView /></RolePage>,
});

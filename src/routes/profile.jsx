import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { ProfileView } from '@/components/ops-views';
export const Route = createFileRoute('/profile')({
    head: () => ({
        meta: [
            { title: 'My profile — AssetFlow' },
            { name: 'description', content: 'Your AssetFlow account details.' },
            { property: 'og:title', content: 'My profile — AssetFlow' },
            { property: 'og:description', content: 'Your AssetFlow account details.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: () => <RolePage><ProfileView /></RolePage>,
});

import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { AuditView } from '@/components/ops-views';
export const Route = createFileRoute('/audit')({
    head: () => ({
        meta: [
            { title: 'Audit log — AssetFlow' },
            { name: 'description', content: 'Read-only history of every change.' },
            { property: 'og:title', content: 'Audit log — AssetFlow' },
            { property: 'og:description', content: 'Read-only history of every change.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: () => <RolePage roles={['ADMIN', 'AUDITOR']}><AuditView /></RolePage>,
});

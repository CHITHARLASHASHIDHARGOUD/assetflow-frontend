import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { SettingsView } from '@/components/settings-view';
export const Route = createFileRoute('/settings')({
    head: () => ({
        meta: [
            { title: 'Settings — AssetFlow' },
            { name: 'description', content: 'Asset categories and system settings.' },
            { property: 'og:title', content: 'Settings — AssetFlow' },
            { property: 'og:description', content: 'Asset categories and system settings.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: SettingsPage,
});
function SettingsPage() {
    return <RolePage roles={['ADMIN']}><SettingsView /></RolePage>;
}

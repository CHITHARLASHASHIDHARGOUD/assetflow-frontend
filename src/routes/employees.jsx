import { createFileRoute } from '@tanstack/react-router';
import { RolePage } from '@/components/role-page';
import { EmployeesListView } from '@/components/employees-list-view';
export const Route = createFileRoute('/employees')({
    head: () => ({
        meta: [
            { title: 'Employees — AssetFlow' },
            { name: 'description', content: 'Employee directory.' },
            { property: 'og:title', content: 'Employees — AssetFlow' },
            { property: 'og:description', content: 'Employee directory.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' },
        ],
    }),
    component: EmployeesPage,
});
function EmployeesPage() {
    return <RolePage roles={['ADMIN', 'IT_MANAGER', 'AUDITOR']}><EmployeesListView /></RolePage>;
}

import AdminDashboardPage from './Dashboard'

export const metadata = {
    title: 'Admin Dashboard - Spyke AI',
    description: 'Manage users, monitor platform activity, oversee marketplace operations, and access administrative tools for Spyke AI.',
    keywords: 'admin dashboard, spyke ai admin, platform management, user management, marketplace administration',
    openGraph: {
        title: 'Admin Dashboard - Spyke AI',
        description: 'Administrative control panel for Spyke AI marketplace platform',
        type: 'website',
    },
    robots: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
    },
}
export const dynamic = 'force-dynamic';

export default function Page() {
    return <AdminDashboardPage />
}
import SimpleAnalyticsPage from './SimpleAnalytics'

export const metadata = {
    title: 'Analytics Dashboard - Spyke AI',
    description: 'View your analytics and event tracking data',
}

export const dynamic = 'force-dynamic'

export default function Page() {
    return <SimpleAnalyticsPage />
}
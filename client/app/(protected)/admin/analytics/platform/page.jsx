'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Package,
    DollarSign,
    ShoppingCart,
    Eye,
    UserCheck,
    Activity,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Download,
    BarChart3,
    Clock,
    Calendar
} from 'lucide-react'
import analyticsAPI from '@/lib/api/analytics'
import CustomSelect from '@/components/shared/CustomSelect'
import { useAdmin } from '@/providers/AdminProvider'
import { MetricCard, PageHeader, QuickActionsBar, LoadingSkeleton, EmptyState, ErrorState } from '@/components/admin'

// Growth metric card using the new MetricCard component
const GrowthCard = ({ title, value, change, changeType }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 font-medium">{title}</h3>
            {change && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${changeType === 'increase' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {changeType === 'increase' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {change}
                </div>
            )}
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
)

// Top categories component
const TopCategoriesSection = ({ categories }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Top Categories</h2>
        </div>

        {categories.length === 0 ? (
            <EmptyState
                icon={Package}
                title="No categories available"
                description="Categories will appear here once data is available"
            />
        ) : (
            <div className="space-y-3">
                {categories.map((category, index) => (
                    <div
                        key={category}
                        className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-sm font-bold">
                                #{index + 1}
                            </span>
                            <span className="text-gray-300 font-medium">{category}</span>
                        </div>
                        <div className="w-32 bg-white/5 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full"
                                style={{ width: `${Math.max(20, 100 - index * 15)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
)

export default function AdminEcommerceAnalytics() {
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [timeRange, setTimeRange] = useState('30d')
    const [analyticsData, setAnalyticsData] = useState(null)
    const [error, setError] = useState(null)

    // Get admin context
    const { isAnalyticsPage } = useAdmin()

    // Time range options for CustomSelect
    const timeRangeOptions = [
        { value: 'today', label: 'Today', icon: Clock },
        { value: '7d', label: 'Last 7 days', icon: Calendar },
        { value: '30d', label: 'Last 30 days', icon: Calendar },
        { value: 'custom', label: 'Custom range', icon: Calendar }
    ]

    const loadAnalytics = async (silent = false) => {
        try {
            setError(null)
            if (!silent) setLoading(true)
            if (silent) setRefreshing(true)

            const response = await analyticsAPI.admin.getPlatform()
            setAnalyticsData(response.data)
        } catch (error) {
            console.error('Failed to load analytics:', error)
            setError('Failed to load analytics data')

            // Set null data instead of fallback mock data
            setAnalyticsData(null)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        loadAnalytics()
    }, [timeRange])

    const handleRefresh = () => {
        loadAnalytics(true)
    }

    const handleExport = () => {
        if (!analyticsData) return
        const dataStr = JSON.stringify(analyticsData, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
        const exportFileDefaultName = `ecommerce-analytics-${new Date().toISOString().split('T')[0]}.json`
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }

    // Loading state
    if (loading) {
        return (
            <div className="space-y-8">
                <LoadingSkeleton className="h-8 w-96" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <LoadingSkeleton
                            key={i}
                            variant="card"
                        />
                    ))}
                </div>
                <LoadingSkeleton
                    className="h-64"
                    variant="card"
                />
            </div>
        )
    }

    // Error state
    if (error && !analyticsData) {
        return (
            <ErrorState
                title="Failed to load analytics"
                description={error}
                onRetry={() => loadAnalytics()}
            />
        )
    }

    const { overview, growth, topCategories } = analyticsData || {}

    // Safe values with defaults
    const safeOverview = {
        totalUsers: overview?.totalUsers || 0,
        totalSellers: overview?.totalSellers || 0,
        totalProducts: overview?.totalProducts || 0,
        activeProducts: overview?.activeProducts || 0,
        totalSales: overview?.totalSales || 0,
        totalRevenue: overview?.totalRevenue || 0,
        avgOrderValue: overview?.avgOrderValue || 0,
        totalViews: overview?.totalViews || 0
    }

    const safeGrowth = {
        newUsersLast30Days: growth?.newUsersLast30Days || 0,
        newProductsLast30Days: growth?.newProductsLast30Days || 0,
        salesLast30Days: growth?.salesLast30Days || 0
    }

    const safeCategories = topCategories || []

    // Calculate growth percentages from real data only
    const calculateGrowthChange = (current, previous) => {
        if (!previous || previous === 0) return null
        const percentage = ((current - previous) / previous) * 100
        return percentage > 0 ? `+${percentage.toFixed(1)}%` : `${percentage.toFixed(1)}%`
    }

    // Header actions
    const headerActions = [
        <CustomSelect
            key="timeRange"
            value={timeRange}
            onChange={setTimeRange}
            options={timeRangeOptions}
            placeholder="Select time range"
            searchable={false}
            allowClear={false}
            type="admin"
            className="w-48"
        />,
        <button
            key="refresh"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
        </button>,
        <button
            key="export"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
        </button>
    ]

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <PageHeader
                title="E-commerce Analytics"
                subtitle="Admin dashboard for platform insights and performance"
                breadcrumbs={['Admin', 'Analytics', 'Platform']}
                actions={headerActions}
            />

            {/* Error banner */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
                    <p className="text-rose-400 text-sm">{error}</p>
                </div>
            )}

            {/* Overview Cards */}
            <section>
                <h2 className="text-xl font-semibold text-white mb-6">Platform Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Users"
                        value={safeOverview.totalUsers.toLocaleString()}
                        icon={Users}
                        color="blue"
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Sellers"
                        value={safeOverview.totalSellers.toLocaleString()}
                        icon={UserCheck}
                        color="emerald"
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Products"
                        value={safeOverview.totalProducts.toLocaleString()}
                        icon={Package}
                        color="purple"
                        loading={loading}
                    />
                    <MetricCard
                        title="Active Products"
                        value={safeOverview.activeProducts.toLocaleString()}
                        icon={Activity}
                        color="indigo"
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Sales"
                        value={safeOverview.totalSales.toLocaleString()}
                        icon={ShoppingCart}
                        color="rose"
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Revenue"
                        value={`$${safeOverview.totalRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        color="amber"
                        loading={loading}
                    />
                    <MetricCard
                        title="Avg Order Value"
                        value={`$${safeOverview.avgOrderValue.toFixed(2)}`}
                        icon={TrendingUp}
                        color="cyan"
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Views"
                        value={safeOverview.totalViews.toLocaleString()}
                        icon={Eye}
                        color="emerald"
                        loading={loading}
                    />
                </div>
            </section>

            {/* Growth Section (Last 30 Days) */}
            <section>
                <h2 className="text-xl font-semibold text-white mb-6">Growth Metrics (Last 30 Days)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GrowthCard
                        title="New Users"
                        value={safeGrowth.newUsersLast30Days.toLocaleString()}
                        change={calculateGrowthChange(safeGrowth.newUsersLast30Days, growth?.previousUsers)}
                        changeType="increase"
                    />
                    <GrowthCard
                        title="New Products"
                        value={safeGrowth.newProductsLast30Days.toLocaleString()}
                        change={calculateGrowthChange(safeGrowth.newProductsLast30Days, growth?.previousProducts)}
                        changeType="increase"
                    />
                    <GrowthCard
                        title="Sales"
                        value={safeGrowth.salesLast30Days.toLocaleString()}
                        change={calculateGrowthChange(safeGrowth.salesLast30Days, growth?.previousSales)}
                        changeType="increase"
                    />
                </div>
            </section>

            {/* Top Categories */}
            <section>
                <TopCategoriesSection categories={safeCategories} />
            </section>
        </div>
    )
}


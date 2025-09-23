'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Package,
    AlertCircle,
    UserCheck,
    ShoppingCart,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Download,
    Shield,
    Activity
} from 'lucide-react'
import { useAdmin } from '@/providers/AdminProvider'
import Link from 'next/link'
const MetricCard = ({ icon: Icon, label, value, change, color, loading, href }) => {
    const isPositive = change && change.startsWith('+')
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-[#00FF89]/30 transition-all duration-300"
            role="listitem">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-[#00FF89]' : 'text-red-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span>{change}</span>
                    </div>
                )}
            </div>
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                </div>
            ) : (
                <>
                    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
                    <p className="text-sm text-gray-400">{label}</p>
                </>
            )}
            {href && (
                <Link
                    href={href}
                    className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                    aria-label={`View ${label} details`}
                />
            )}
        </motion.article>
    )
}
const QuickActionButton = ({ icon: Icon, label, variant = 'secondary', onClick, href }) => {
    const baseClasses =
        'px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50'
    const variants = {
        primary: 'bg-[#00FF89] text-black hover:bg-[#00FF89]/90',
        secondary: 'bg-gray-800/50 text-white border border-white/20 hover:bg-gray-700/50 hover:border-[#00FF89]/30'
    }
    const Component = href ? Link : 'button'
    return (
        <Component
            href={href}
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]}`}>
            <Icon className="w-4 h-4" />
            {label}
        </Component>
    )
}
const ActivityItem = ({ activity }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'seller':
                return UserCheck
            case 'product':
                return Package
            case 'order':
                return ShoppingCart
            case 'refund':
                return AlertCircle
            default:
                return Activity
        }
    }
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-[#00FF89]'
            case 'pending':
                return 'text-yellow-400'
            case 'urgent':
                return 'text-red-400'
            default:
                return 'text-gray-400'
        }
    }
    const Icon = getIcon(activity.type)
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
            <div className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center ${getStatusColor(activity.status)}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{activity.action}</p>
                <p className="text-gray-400 text-xs">
                    by {activity.user} • {activity.time}
                </p>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(activity.status)} bg-current/10`}>{activity.status}</div>
        </motion.div>
    )
}
export default function AdminDashboardPage() {
    const { counts, loading, refreshData, error } = useAdmin()
    const [refreshing, setRefreshing] = useState(false)
    const [recentActivity, setRecentActivity] = useState([])
    useEffect(() => {
        const loadRecentActivity = async () => {
            try {
                setRecentActivity([]) 
            } catch (error) {
                console.error('Failed to load recent activity:', error)
                setRecentActivity([])
            }
        }
        loadRecentActivity()
    }, [])
    const metrics = useMemo(() => [
        {
            icon: Users,
            label: 'Total Sellers',
            value: counts.sellers.pending + counts.sellers.active,
            color: 'from-blue-500/20 to-blue-600/20',
            href: '/admin/sellers/active'
        },
        {
            icon: UserCheck,
            label: 'Pending Approvals',
            value: counts.sellers.pending,
            change: counts.sellers.pending > 0 ? `${counts.sellers.pending} pending` : 'All clear',
            color: 'from-yellow-500/20 to-orange-600/20',
            href: '/admin/sellers/pending'
        },
        {
            icon: Package,
            label: 'Products Listed',
            value: counts.products.pending + counts.products.flagged + counts.products.featured,
            color: 'from-purple-500/20 to-purple-600/20',
            href: '/admin/products/pending'
        },
        {
            icon: Shield,
            label: 'Flagged Items',
            value: counts.products.flagged,
            change: counts.products.flagged > 0 ? `${counts.products.flagged} need review` : 'All clear',
            color: 'from-red-500/20 to-red-600/20',
            href: '/admin/products/flagged'
        }
    ], [counts])
    const handleRefresh = useCallback(async () => {
        setRefreshing(true)
        try {
            await refreshData()
        } finally {
            setRefreshing(false)
        }
    }, [refreshData])
    if (error) {
        return (
            <main className="space-y-8 max-w-7xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <h2 className="text-red-400 text-lg font-semibold mb-2">Failed to Load Dashboard</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        Retry
                    </button>
                </div>
            </main>
        )
    }
    return (
        <main className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                    <p className="text-gray-400">Monitor your platform's performance and activity</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center gap-2 disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <Link
                        href="/admin/analytics/platform"
                        className="px-4 py-2 bg-[#00FF89] text-black rounded-lg hover:bg-[#00FF89]/90 transition-colors flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        View Analytics
                    </Link>
                </div>
            </div>
            <section>
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <QuickActionButton
                        icon={UserCheck}
                        label="Review Sellers"
                        variant="primary"
                        href="/admin/sellers/pending"
                    />
                    <QuickActionButton
                        icon={Shield}
                        label="Moderate Products"
                        href="/admin/products/flagged"
                    />
                    <QuickActionButton
                        icon={Download}
                        label="Export Reports"
                        href="/admin/analytics/platform"
                    />
                    <QuickActionButton
                        icon={Activity}
                        label="System Health"
                        href="/admin/settings"
                    />
                </div>
            </section>
            <section>
                <h2 className="text-lg font-semibold text-white mb-4">Platform Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, index) => (
                        <MetricCard
                            key={index}
                            {...metric}
                            loading={loading.counts}
                        />
                    ))}
                </div>
            </section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Platform Activity</h3>
                        <select className="bg-gray-800 border border-white/20 text-white text-sm rounded-lg px-3 py-1">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                            <p className="text-sm">Advanced analytics charts coming soon</p>
                            <Link
                                href="/admin/analytics/platform"
                                className="text-[#00FF89] text-sm hover:underline mt-2 inline-block">
                                View detailed analytics →
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        <Link
                            href="/admin/activity"
                            className="text-[#00FF89] text-sm hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {recentActivity.map((activity, index) => (
                            <ActivityItem
                                key={index}
                                activity={activity}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <section>
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-full animate-pulse"></div>
                            <span className="text-gray-300">API Services</span>
                            <span className="text-[#00FF89] text-sm">Online</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-full animate-pulse"></div>
                            <span className="text-gray-300">Database</span>
                            <span className="text-[#00FF89] text-sm">Healthy</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span className="text-gray-300">Background Jobs</span>
                            <span className="text-yellow-400 text-sm">Processing</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
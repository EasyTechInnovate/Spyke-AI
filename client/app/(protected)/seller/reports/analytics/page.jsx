'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Package,
    Users,
    Eye,
    ShoppingCart,
    Star,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Download,
    Calendar,
    Filter
} from 'lucide-react'
import analyticsAPI from '@/lib/api/analytics'
const MetricCard = ({ title, value, change, changeType, icon: Icon, color = 'custom' }) => {
    const colorMap = {
        custom: 'from-[#00FF89] to-[#00E67A]',
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        amber: 'from-amber-500 to-amber-600',
        rose: 'from-rose-500 to-rose-600',
        indigo: 'from-indigo-500 to-indigo-600'
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorMap[color]} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                        changeType === 'increase' 
                            ? 'bg-[#00FF89]/10 text-[#00FF89]' 
                            : 'bg-rose-500/10 text-rose-400'
                    }`}>
                        {changeType === 'increase' ? (
                            <ArrowUpRight className="w-3 h-3" />
                        ) : (
                            <ArrowDownRight className="w-3 h-3" />
                        )}
                        {change}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
                <p className="text-gray-400 text-sm">{title}</p>
            </div>
        </motion.div>
    )
}
const QuickActions = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#00FF89]/10 to-transparent border border-[#00FF89]/20 rounded-xl hover:border-[#00FF89]/40 transition-all duration-300">
                <BarChart3 className="w-5 h-5 text-[#00FF89]" />
                <span className="text-white font-medium">Product Analytics</span>
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all duration-300">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Sales Report</span>
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all duration-300">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Customer Insights</span>
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl hover:border-amber-500/40 transition-all duration-300">
                <Download className="w-5 h-5 text-amber-400" />
                <span className="text-white font-medium">Export Data</span>
            </motion.button>
        </div>
    )
}
export default function SellerAnalyticsOverview() {
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [timeRange, setTimeRange] = useState('30d')
    const loadAnalytics = async (silent = false) => {
        try {
            if (!silent) setLoading(true)
            if (silent) setRefreshing(true)
            const data = await analyticsAPI.seller.getDashboard()
            setDashboardData(data)
        } catch (error) {
            console.error('Failed to load analytics:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }
    useEffect(() => {
        loadAnalytics()
    }, [])
    const handleRefresh = () => {
        loadAnalytics(true)
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-800 rounded w-64"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-800 rounded-2xl"></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-80 bg-gray-800 rounded-2xl"></div>
                            <div className="h-80 bg-gray-800 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Analytics Overview</h1>
                        <p className="text-gray-400">Comprehensive insights into your seller performance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#00FF89] focus:border-transparent">
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-[#00FF89] text-black rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Revenue"
                        value={`$${dashboardData?.overview?.totalRevenue?.toLocaleString() || '0'}`}
                        change="+12.5%"
                        changeType="increase"
                        icon={DollarSign}
                        color="custom"
                    />
                    <MetricCard
                        title="Total Sales"
                        value={dashboardData?.overview?.totalSales?.toLocaleString() || '0'}
                        change="+8.3%"
                        changeType="increase"
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <MetricCard
                        title="Active Products"
                        value={dashboardData?.overview?.activeProducts?.toLocaleString() || '0'}
                        change="+2"
                        changeType="increase"
                        icon={Package}
                        color="purple"
                    />
                    <MetricCard
                        title="Total Views"
                        value={dashboardData?.overview?.totalViews?.toLocaleString() || '0'}
                        change="+15.7%"
                        changeType="increase"
                        icon={Eye}
                        color="amber"
                    />
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <QuickActions />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Monthly Revenue</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#00FF89]"></div>
                                <span className="text-sm text-gray-400">Revenue</span>
                            </div>
                        </div>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Revenue chart will be displayed here</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-6">Top Performing Products</h3>
                        <div className="space-y-4">
                            {dashboardData?.topProducts?.slice(0, 5).map((product, index) => (
                                <div key={product.productId} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white truncate">{product.title}</h4>
                                        <p className="text-sm text-gray-400">{product.salesCount} sales</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-[#00FF89]">
                                            ${product.revenue?.toLocaleString()}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Star className="w-3 h-3" />
                                            4.8
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                <div className="text-center py-8 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No products data available</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Recent Sales Activity</h3>
                    <div className="space-y-4">
                        {dashboardData?.recentSales?.slice(0, 8).map((sale, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00FF89] to-[#00FF89]/80 flex items-center justify-center">
                                    <span className="text-black font-bold text-sm">
                                        {sale.userId?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white">
                                        {sale.userId?.name || 'Unknown User'}
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Purchased {sale.items?.length || 1} item{sale.items?.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-[#00FF89]">
                                        ${sale.finalAmount?.toLocaleString() || '0'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(sale.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )) || (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No recent sales activity</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
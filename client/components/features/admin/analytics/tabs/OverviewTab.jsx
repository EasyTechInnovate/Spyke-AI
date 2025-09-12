import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, DollarSign, Package, Target, Globe, TrendingUp, Activity, Eye } from 'lucide-react'

// Utility functions for formatting (same as Sales tab)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0)
}

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0)
}

const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`
}

export const OverviewTab = ({ analyticsData, timeRange }) => {
    // Extract overview data safely
    const overviewData = useMemo(() => {
        const platform = analyticsData?.platform?.data
        const overview = platform?.overview || {}
        const growth = platform?.growth || {}

        return {
            totalUsers: overview.totalUsers || 0,
            totalSellers: overview.totalSellers || 0,
            totalProducts: overview.totalProducts || 0,
            activeProducts: overview.activeProducts || 0,
            totalSales: overview.totalSales || 0,
            totalRevenue: overview.totalRevenue || 0,
            avgOrderValue: overview.avgOrderValue || 0,
            totalViews: overview.totalViews || 0,
            newUsersLast30Days: growth.newUsersLast30Days || 0,
            newProductsLast30Days: growth.newProductsLast30Days || 0,
            salesLast30Days: growth.salesLast30Days || 0
        }
    }, [analyticsData])

    const performanceMetrics = useMemo(() => {
        const conversionRate =
            overviewData.totalSales > 0 && overviewData.totalViews > 0 ? (overviewData.totalSales / overviewData.totalViews) * 100 : 0

        return {
            conversionRate
        }
    }, [overviewData])

    return (
        <div className="space-y-6">
            {/* Platform Overview Metrics - Using Sales tab style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatNumber(overviewData.totalUsers)}
                    </div>
                    <div className="text-sm text-[#00FF89]">
                        +12.5% from last period
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatCurrency(overviewData.totalRevenue)}
                    </div>
                    <div className="text-sm text-[#00FF89]">
                        +8.2% from last period
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Products</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatNumber(overviewData.totalProducts)}
                    </div>
                    <div className="text-sm text-[#00FF89]">
                        +15.3% from last period
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Conversion Rate</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatPercentage(performanceMetrics.conversionRate)}
                    </div>
                    <div className="text-sm text-[#00FF89]">
                        +0.3% from last period
                    </div>
                </motion.div>
            </div>

            {/* Platform Performance Chart - Simple placeholder */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-lg p-6"
            >
                <h3 className="text-lg font-semibold text-white mb-4">Platform Performance</h3>
                <div className="h-80 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Platform performance chart</p>
                        <p className="text-sm mt-1">Real-time data visualization coming soon</p>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics - Using Sales tab style */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4">Growth Overview</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">New Users (30 days)</span>
                            <div className="text-right">
                                <div className="text-white font-medium">{formatNumber(overviewData.newUsersLast30Days)}</div>
                                <div className="text-[#00FF89] text-xs">+12.5%</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">New Products (30 days)</span>
                            <div className="text-right">
                                <div className="text-white font-medium">{formatNumber(overviewData.newProductsLast30Days)}</div>
                                <div className="text-[#00FF89] text-xs">+8.9%</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">Active Products</span>
                            <div className="text-right">
                                <div className="text-white font-medium">{formatNumber(overviewData.activeProducts)}</div>
                                <div className="text-gray-400 text-xs">Currently live</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4">Platform Health</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">Average Order Value</span>
                            <div className="text-right">
                                <div className="text-white font-medium">{formatCurrency(overviewData.avgOrderValue)}</div>
                                <div className="text-[#00FF89] text-xs">+5.2%</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">Total Page Views</span>
                            <div className="text-right">
                                <div className="text-white font-medium">{formatNumber(overviewData.totalViews)}</div>
                                <div className="text-[#00FF89] text-xs">+18.7%</div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-medium">Total Sales</span>
                            <div className="text-right">
                                <div className="text-white font-medium">{formatNumber(overviewData.totalSales)}</div>
                                <div className="text-[#00FF89] text-xs">All time</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}


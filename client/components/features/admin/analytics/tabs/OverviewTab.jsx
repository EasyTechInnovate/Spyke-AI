import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, DollarSign, Package, Target, Globe, TrendingUp, Activity, Eye, AlertCircle, Zap, CheckCircle } from 'lucide-react'

// Utility functions for formatting (same as Sales tab)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0)
}

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0)
}

const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`
}

const EmptyStateCard = ({ title, description, icon: Icon, action }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-8 backdrop-blur-sm text-center">
        <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-700/50 rounded-full">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
        {action && <div className="flex justify-center">{action}</div>}
    </motion.div>
)

export const OverviewTab = ({ analyticsData, timeRange }) => {
    // Extract overview data safely - Updated to match real API response
    const overviewData = useMemo(() => {
        // Add comprehensive debugging
        console.log('Raw analyticsData:', analyticsData)
        console.log('analyticsData type:', typeof analyticsData)
        console.log('analyticsData keys:', analyticsData ? Object.keys(analyticsData) : 'null/undefined')

        // Handle multiple possible response structures
        let data = null

        if (analyticsData) {
            // Check if it's the direct API response with success/data structure
            if (analyticsData.success && analyticsData.data) {
                data = analyticsData.data
                console.log('Using direct API response structure')
            }
            // Check if it's already the data object
            else if (analyticsData.data && !analyticsData.success) {
                data = analyticsData
                console.log('Using wrapped data structure')
            }
            // Check if it's the unwrapped data
            else if (analyticsData.overview || analyticsData.growth) {
                data = analyticsData
                console.log('Using unwrapped data structure')
            }
            // Fallback to treating it as data
            else {
                data = analyticsData
                console.log('Using fallback data structure')
            }
        }

        console.log('Extracted data object:', data)

        const overview = data?.overview || {}
        const growth = data?.growth || {}

        console.log('Overview object:', overview)
        console.log('Growth object:', growth)

        const result = {
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

        console.log('Final overview result:', result)
        return result
    }, [analyticsData])

    // Extract top categories data
    const topCategories = useMemo(() => {
        let data = null

        if (analyticsData) {
            if (analyticsData.success && analyticsData.data) {
                data = analyticsData.data
            } else if (analyticsData.data && !analyticsData.success) {
                data = analyticsData
            } else if (analyticsData.topCategories) {
                data = analyticsData
            } else {
                data = analyticsData
            }
        }

        const categories = data?.topCategories || []
        console.log('Top categories:', categories)
        return categories
    }, [analyticsData])

    const performanceMetrics = useMemo(() => {
        const conversionRate =
            overviewData.totalSales > 0 && overviewData.totalViews > 0 ? (overviewData.totalSales / overviewData.totalViews) * 100 : 0

        return {
            conversionRate
        }
    }, [overviewData])

    // Check if we have meaningful data to display
    const hasData = useMemo(() => {
        // Debug the data values
        console.log('Overview Data:', overviewData)
        console.log('Analytics Data:', analyticsData)

        const result =
            overviewData.totalUsers > 0 ||
            overviewData.totalProducts > 0 ||
            overviewData.totalRevenue > 0 ||
            overviewData.totalSales > 0 ||
            overviewData.totalViews > 0

        console.log('Has Data Result:', result)
        return result
    }, [overviewData, analyticsData])

    return (
        <div className="space-y-6">
            {!hasData ? (
                <>
                    {/* No Data State */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EmptyStateCard
                            title="No Platform Data Yet"
                            description="Your platform analytics will appear here once users start interacting with your marketplace. Start by inviting sellers and customers to join."
                            icon={Activity}
                        />
                        <EmptyStateCard
                            title="Getting Started"
                            description="Track user registrations, product listings, sales performance, and revenue growth all in one place."
                            icon={Zap}
                        />
                    </div>

                    {/* Getting Started Tips */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-[#00FF89]" />
                            Getting Started with Analytics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-[#00FF89]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-[#00FF89]">1</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Invite Sellers</p>
                                    <p className="text-gray-400 text-sm">Onboard sellers to list their products on your platform</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-[#00FF89]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-[#00FF89]">2</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Attract Customers</p>
                                    <p className="text-gray-400 text-sm">Drive traffic to your marketplace through marketing</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-[#00FF89]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-[#00FF89]">3</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Monitor Performance</p>
                                    <p className="text-gray-400 text-sm">Track sales, revenue, and user engagement metrics</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-[#00FF89]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-[#00FF89]">4</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">Optimize & Grow</p>
                                    <p className="text-gray-400 text-sm">Use insights to improve your platform and scale</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            ) : (
                <>
                    {/* Platform Overview Metrics - Using real API data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
                                <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 text-[#00FF89]" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{formatNumber(overviewData.totalUsers)}</div>
                            <div className="text-sm text-[#00FF89]">+{formatNumber(overviewData.newUsersLast30Days)} new in 30d</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-800 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                                <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-[#00FF89]" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(overviewData.totalRevenue)}</div>
                            <div className="text-sm text-[#00FF89]">{formatNumber(overviewData.totalSales)} total sales</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-800 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-400">Total Products</h3>
                                <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-[#00FF89]" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{formatNumber(overviewData.totalProducts)}</div>
                            <div className="text-sm text-[#00FF89]">{formatNumber(overviewData.activeProducts)} active</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gray-800 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-gray-400">Avg Order Value</h3>
                                <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                                    <Target className="w-4 h-4 text-[#00FF89]" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{formatCurrency(overviewData.avgOrderValue)}</div>
                            <div className="text-sm text-[#00FF89]">Per order average</div>
                        </motion.div>
                    </div>

                    {/* Top Categories Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Top Categories</h3>
                        <div className="space-y-3">
                            {topCategories.length > 0 ? (
                                topCategories.map((category, index) => (
                                    <div
                                        key={category._id || index}
                                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-bold text-[#00FF89]">{index + 1}</span>
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{category._id.replace('_', ' ').toUpperCase()}</div>
                                                <div className="text-gray-400 text-sm">{formatNumber(category.productCount)} products</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-medium">{formatCurrency(category.avgPrice)}</div>
                                            <div className="text-gray-400 text-sm">{formatNumber(category.totalViews)} views</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 py-8">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No categories available</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Key Metrics - Updated with real data */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Growth Overview (Last 30 Days)</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium">New Users</span>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatNumber(overviewData.newUsersLast30Days)}</div>
                                        <div className="text-gray-400 text-xs">of {formatNumber(overviewData.totalUsers)} total</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium">New Products</span>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatNumber(overviewData.newProductsLast30Days)}</div>
                                        <div className="text-gray-400 text-xs">of {formatNumber(overviewData.totalProducts)} total</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium">Sales</span>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatNumber(overviewData.salesLast30Days)}</div>
                                        <div className="text-gray-400 text-xs">of {formatNumber(overviewData.totalSales)} total</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Platform Health</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium">Total Sellers</span>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatNumber(overviewData.totalSellers)}</div>
                                        <div className="text-gray-400 text-xs">Active sellers</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium">Active Products</span>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatNumber(overviewData.activeProducts)}</div>
                                        <div className="text-gray-400 text-xs">Currently live</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium">Total Page Views</span>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatNumber(overviewData.totalViews)}</div>
                                        <div className="text-gray-400 text-xs">All time</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    )
}


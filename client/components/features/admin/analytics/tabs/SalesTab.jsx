'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, ShoppingCart, Activity, Package } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line } from 'recharts'

// Utility functions for formatting
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

export const SalesTab = ({ analyticsData, timeRange, loading }) => {
    const [salesData, setSalesData] = useState(null)

    const generateTrendsWithAllDates = (dailySales, timeRange) => {
        // Calculate date range based on timeRange string
        const getDaysFromTimeRange = (period) => {
            switch (period) {
                case '7d':
                    return 7
                case '30d':
                    return 30
                case '90d':
                    return 90
                case '1y':
                    return 365
                default:
                    return 30
            }
        }

        const days = getDaysFromTimeRange(timeRange)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - (days - 1))

        // Create a map for quick lookup of existing data
        const dataMap = new Map()
        dailySales.forEach((item) => {
            const dateKey = item._id?.date || item.date
            if (dateKey) {
                dataMap.set(dateKey, {
                    revenue: item.revenue || 0,
                    salesCount: item.salesCount || 0
                })
            }
        })

        // Generate complete date range with placeholder data for missing dates
        const trends = []
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + i)
            const dateString = currentDate.toISOString().split('T')[0]
            
            const data = dataMap.get(dateString) || { revenue: 0, salesCount: 0 }
            
            trends.push({
                date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: data.revenue,
                orders: data.salesCount,
                averageOrderValue: data.revenue && data.salesCount 
                    ? Math.round(data.revenue / data.salesCount) 
                    : 0,
                // Remove mock conversion rate - will use overall conversion rate for the line
                conversionRate: 0 // Set to 0 for now, will use overall rate from metrics
            })
        }

        return trends
    }

    useEffect(() => {
        if (analyticsData) {
            // Process the passed analytics data instead of making API calls
            console.log('Sales Analytics Data received:', analyticsData)

            // Extract real data from passed analytics data
            const processedData = {
                metrics: {
                    totalRevenue: analyticsData.summary?.totalRevenue || 0,
                    totalOrders: analyticsData.summary?.totalSales || 0,
                    averageOrderValue: analyticsData.summary?.avgOrderValue || 0,
                    conversionRate: analyticsData.summary?.conversionRate || 0,
                    revenueGrowth: analyticsData.summary?.revenueGrowth || 0,
                    ordersGrowth: analyticsData.summary?.ordersGrowth || 0,
                    aovGrowth: analyticsData.summary?.aovGrowth || 0,
                    conversionGrowth: analyticsData.summary?.conversionGrowth || 0
                },
                // Transform dailySales to trends format expected by chart
                trends: generateTrendsWithAllDates(analyticsData.dailySales || [], timeRange),
                topProducts:
                    analyticsData.products?.slice(0, 10).map((product) => ({
                        _id: product._id,
                        name: product.title,
                        salesCount: product.salesCount || 0,
                        revenue: product.revenue || 0,
                        conversionRate: product.conversionRate || 0
                    })) || [],
                // Only include payment methods if we have real data from API
                paymentMethods: analyticsData.paymentMethods || []
            }

            console.log('Processed Sales Data:', processedData)
            setSalesData(processedData)
        }
    }, [analyticsData, timeRange])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-800 rounded-lg p-6 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-800 rounded-lg p-6 h-80 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-full bg-gray-700 rounded"></div>
                </div>
            </div>
        )
    }

    // Ensure we have valid data before destructuring
    if (!salesData) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-800 rounded-lg p-6 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-800 rounded-lg p-6 h-80 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-full bg-gray-700 rounded"></div>
                </div>
            </div>
        )
    }

    const { metrics = {}, trends = [], topProducts = [], paymentMethods = [] } = salesData

    // Ensure trends is a valid array
    const validTrends = Array.isArray(trends) ? trends : []

    return (
        <div className="space-y-6">
            {/* Sales Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.totalRevenue)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Orders</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalOrders)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Average Order Value</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.averageOrderValue)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Conversion Rate</h3>
                    <div className="text-2xl font-bold text-white">{formatPercentage(metrics.conversionRate)}</div>
                </motion.div>
            </div>

            {/* Sales Trends Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Sales Trends</h3>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-sm opacity-80"></div>
                            <span className="text-gray-400">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                            <span className="text-gray-400">Orders</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-2 bg-[#8B5CF6] rounded-full"></div>
                            <span className="text-gray-400">Avg Order Value</span>
                        </div>
                    </div>
                </div>
                <div className="h-80 relative">
                    <ResponsiveContainer
                        width="100%"
                        height="100%">
                        <ComposedChart data={validTrends}>
                            <defs>
                                <linearGradient
                                    id="revenueGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="#00FF89"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#00FF89"
                                        stopOpacity={0.05}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#374151"
                                opacity={0.3}
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="percentage"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `${value}%`}
                                domain={[0, 'dataMax']}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                                                <p className="text-gray-300 text-sm mb-2 font-medium">{label}</p>
                                                {payload.map((entry, index) => (
                                                    <p
                                                        key={index}
                                                        className="text-sm font-medium"
                                                        style={{ color: entry.color }}>
                                                        {entry.name}:{' '}
                                                        {entry.dataKey === 'revenue'
                                                            ? `$${entry.value?.toLocaleString()}`
                                                            : entry.dataKey === 'conversionRate'
                                                              ? `${entry.value}%`
                                                              : entry.value?.toLocaleString()}
                                                    </p>
                                                ))}
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />

                            {/* Always render chart elements - never return null to ResponsiveContainer */}
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                stroke="#00FF89"
                                fillOpacity={1}
                                fill="url(#revenueGradient)"
                                strokeWidth={2}
                                name="Revenue"
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="orders"
                                fill="#3B82F6"
                                radius={[2, 2, 0, 0]}
                                name="Orders"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="averageOrderValue"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                dot={{ fill: '#8B5CF6', r: 4 }}
                                name="Avg Order Value"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>

                    {/* No data overlay - positioned absolutely over the chart */}
                    {(!validTrends.length || !validTrends.some((item) => item.revenue > 0 || item.orders > 0)) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-800/50 rounded">
                            <div className="text-center text-gray-400">
                                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No sales data for {timeRange}</p>
                                <p className="text-sm mt-1">Chart shows date range with no recorded sales</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div
                                    key={product._id}
                                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-medium text-gray-300">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm truncate max-w-[200px]">{product.name}</div>
                                            <div className="text-gray-400 text-xs">{formatNumber(product.salesCount)} sales</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No product sales data available</p>
                                <p className="text-sm mt-1">Top products will appear once sales are recorded</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Payment Methods */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
                    <div className="space-y-4">
                        {paymentMethods.length > 0 ? (
                            paymentMethods.map((method) => (
                                <div
                                    key={method._id}
                                    className="space-y-2">
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${method.percentage}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>{formatNumber(method.count)} transactions</span>
                                        <span>{formatCurrency(method.revenue)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No payment methods data available</p>
                                <p className="text-sm mt-1">Payment analytics will appear once transactions are processed</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}


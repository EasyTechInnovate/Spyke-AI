'use client'

import { useState, useEffect, useMemo } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar, BarChart3, RefreshCw, AlertCircle, Target, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ComposedChart, Area, Bar } from 'recharts'
import analyticsAPI from '@/lib/api/analytics'
import { AnalyticsLoadingScreen } from '../AnalyticsLoadingScreen'

// Enhanced utility functions matching SalesTab
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

// Main RevenueTab component with proper API integration and matching Sales design
export default function RevenueTab({ timeRange = '30d' }) {
    const [revenueData, setRevenueData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [refreshing, setRefreshing] = useState(false)

    // Fetch revenue data
    const fetchRevenueData = async (silent = false) => {
        try {
            if (!silent) setLoading(true)
            if (silent) setRefreshing(true)
            setError(null)

            const data = await analyticsAPI.seller.getRevenue()
            setRevenueData(data)
        } catch (err) {
            console.error('Error fetching revenue data:', err)
            setError(err.message || 'Failed to load revenue analytics')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // Initial load
    useEffect(() => {
        fetchRevenueData()
    }, [timeRange])

    // Calculate comprehensive metrics from real API data
    const summaryMetrics = useMemo(() => {
        if (!revenueData) return null

        const { dailyRevenue = [], categoryRevenue = [], monthlyComparison = {} } = revenueData

        // Calculate totals from daily data
        const totalRevenue = dailyRevenue.reduce((sum, day) => sum + (day.revenue || 0), 0)
        const totalSales = dailyRevenue.reduce((sum, day) => sum + (day.salesCount || 0), 0)
        const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

        // Get current vs previous month data
        const currentMonth = monthlyComparison.current || { revenue: 0, salesCount: 0 }
        const previousMonth = monthlyComparison.previous || { revenue: 0, salesCount: 0 }
        const growth = monthlyComparison.growth || 0

        // Calculate additional insights
        const avgDailyRevenue = dailyRevenue.length > 0 ? totalRevenue / dailyRevenue.length : 0
        const peakDay = dailyRevenue.reduce((peak, day) => (day.revenue > peak.revenue ? day : peak), { revenue: 0 })

        return {
            totalRevenue,
            totalSales,
            avgOrderValue,
            growth,
            avgDailyRevenue,
            currentMonthRevenue: currentMonth.revenue,
            peakDayRevenue: peakDay.revenue,
            categoryCount: categoryRevenue.length
        }
    }, [revenueData])

    // Process daily revenue for line chart
    const chartData = useMemo(() => {
        if (!revenueData?.dailyRevenue?.length) return []

        return revenueData.dailyRevenue.map((day) => ({
            date: new Date(day._id.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: day.revenue || 0,
            sales: day.salesCount || 0,
            avgOrderValue: day.salesCount > 0 ? day.revenue / day.salesCount : 0
        }))
    }, [revenueData])

    // Manual refresh
    const handleRefresh = () => {
        fetchRevenueData(true)
    }

    // Loading state
    if (loading && !revenueData) {
        return <AnalyticsLoadingScreen variant="revenue" />
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Revenue Data</h3>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => fetchRevenueData()}
                        className="px-6 py-3 bg-[#00FF89] text-black font-medium rounded-xl hover:bg-[#00E67A] transition-colors">
                        Try Again
                    </button>
                </motion.div>
            </div>
        )
    }

    // No data state
    if (!revenueData || (!revenueData.dailyRevenue?.length && !revenueData.categoryRevenue?.length)) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-[#00FF89]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-[#00FF89]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Revenue Data Yet</h3>
                    <p className="text-gray-400 mb-6">Your revenue analytics will appear here once you start making sales</p>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-6 py-3 bg-[#00FF89] text-black font-medium rounded-xl hover:bg-[#00E67A] transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Revenue Analytics</h2>
                    <p className="text-gray-400 mt-1">Track your earnings and revenue trends</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-600 transition-colors disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Revenue Metrics Cards - Using exact SalesTab design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(summaryMetrics?.totalRevenue || 0)}</div>
                    <div className="text-sm text-emerald-400">Last 30 days</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Sales</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(summaryMetrics?.totalSales || 0)}</div>
                    <div className="text-sm text-gray-400">Total orders</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Average Order Value</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(summaryMetrics?.avgOrderValue || 0)}</div>
                    <div className="text-sm text-gray-400">Per transaction</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Growth Rate</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            {summaryMetrics?.growth >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                        </div>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${summaryMetrics?.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {summaryMetrics?.growth >= 0 ? '+' : ''}
                        {formatPercentage(Math.abs(summaryMetrics?.growth || 0))}
                    </div>
                    <div className="text-sm text-gray-400">vs last month</div>
                </motion.div>
            </div>

            {/* Revenue Trends Line Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-sm"></div>
                            <span className="text-gray-400">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                            <span className="text-gray-400">Sales Count</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#8B5CF6] rounded-sm"></div>
                            <span className="text-gray-400">Avg Order Value</span>
                        </div>
                    </div>
                </div>

                <div className="h-80 relative">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer
                            width="100%"
                            height="100%">
                            <LineChart data={chartData}>
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
                                                            {entry.dataKey === 'revenue' || entry.dataKey === 'avgOrderValue'
                                                                ? formatCurrency(entry.value)
                                                                : formatNumber(entry.value)}
                                                        </p>
                                                    ))}
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />

                                {/* Revenue trend line */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#00FF89"
                                    strokeWidth={3}
                                    dot={{ fill: '#00FF89', r: 5 }}
                                    activeDot={{ r: 8, fill: '#00FF89' }}
                                    name="Revenue"
                                />

                                {/* Sales count trend line */}
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', r: 4 }}
                                    activeDot={{ r: 6, fill: '#3B82F6' }}
                                    name="Sales Count"
                                />

                                {/* Average order value trend line */}
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="avgOrderValue"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    dot={{ fill: '#8B5CF6', r: 4 }}
                                    activeDot={{ r: 6, fill: '#8B5CF6' }}
                                    name="Avg Order Value"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-medium">No revenue trends available</p>
                                <p className="text-sm mt-1">Revenue trends will appear once you have daily sales data</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Monthly Performance Comparison */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Monthly Performance Comparison</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current Month */}
                    <div className="bg-gray-700/30 rounded-xl p-5">
                        <h4 className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Current Month
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Revenue</span>
                                <span className="text-white font-bold text-xl">
                                    {formatCurrency(revenueData?.monthlyComparison?.current?.revenue || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Sales</span>
                                <span className="text-white font-bold text-xl">
                                    {formatNumber(revenueData?.monthlyComparison?.current?.salesCount || 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Previous Month */}
                    <div className="bg-gray-700/30 rounded-xl p-5">
                        <h4 className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Previous Month
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Revenue</span>
                                <span className="text-white font-bold text-xl">
                                    {formatCurrency(revenueData?.monthlyComparison?.previous?.revenue || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Sales</span>
                                <span className="text-white font-bold text-xl">
                                    {formatNumber(revenueData?.monthlyComparison?.previous?.salesCount || 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Growth Summary */}
                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl p-5 border border-gray-600/30">
                        <h4 className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                            {summaryMetrics?.growth >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            Growth Rate
                        </h4>
                        <div className="text-center">
                            <div className={`text-3xl font-bold mb-2 ${summaryMetrics?.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {summaryMetrics?.growth >= 0 ? '+' : ''}
                                {formatPercentage(Math.abs(summaryMetrics?.growth || 0))}
                            </div>
                            <p className="text-xs text-gray-400">
                                {formatCurrency(
                                    Math.abs(
                                        (revenueData?.monthlyComparison?.current?.revenue || 0) -
                                            (revenueData?.monthlyComparison?.previous?.revenue || 0)
                                    )
                                )}{' '}
                                change
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

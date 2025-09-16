'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Target, Calendar, Users, ShoppingCart } from 'lucide-react'
import {
    ResponsiveContainer,
    ComposedChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Area,
    Bar,
    Line,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    AreaChart,
    BarChart,
    LineChart
} from 'recharts'

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

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl">
            <p className="text-white font-semibold mb-2">{label}</p>
            {payload.map((entry, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 mb-1">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-300 text-sm">
                        {entry.name}:{' '}
                        {entry.name.includes('Revenue') || entry.name.includes('Value') ? formatCurrency(entry.value) : formatNumber(entry.value)}
                    </span>
                </div>
            ))}
        </motion.div>
    )
}

export const RevenueTab = ({ analyticsData, timeRange, loading }) => {
    const [processedData, setProcessedData] = useState(null)

    useEffect(() => {
        if (analyticsData) {
            let revenueData = null

            if (analyticsData.success && analyticsData.data) {
                revenueData = analyticsData.data
            } else if (analyticsData.data && !analyticsData.hasOwnProperty('success')) {
                revenueData = analyticsData.data
            } else if (analyticsData.monthlyRevenue || analyticsData.categoryRevenue || analyticsData.commission) {
                revenueData = analyticsData
            } else {
                revenueData = analyticsData
            }

            const { monthlyRevenue = [], categoryRevenue = [], commission = {} } = revenueData || {}

            const totalRevenue = commission.totalRevenue || 0
            const totalCommission = commission.totalCommission || 0
            const totalSales = monthlyRevenue.reduce((sum, month) => sum + (month.salesCount || 0), 0)
            const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
            const netRevenue = totalRevenue - totalCommission

            const monthlyTrends = monthlyRevenue.map((month) => {
                const monthName = new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                return {
                    month: monthName,
                    revenue: month.revenue || 0,
                    sales: month.salesCount || 0,
                    avgOrderValue: month.avgOrderValue || 0,
                    netRevenue: (month.revenue || 0) - (month.revenue || 0) * 0.1
                }
            })

            const categoryData = categoryRevenue.map((cat, index) => ({
                category: cat._id?.replace(/_/g, ' ')?.replace(/\b\w/g, (l) => l.toUpperCase()) || 'Other',
                revenue: cat.revenue || 0,
                sales: cat.salesCount || 0,
                avgOrderValue: cat.avgOrderValue || 0,
                percentage: totalRevenue > 0 ? ((cat.revenue || 0) / totalRevenue) * 100 : 0,
                color: ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#6366F1'][index % 8]
            }))

            const growthRate =
                monthlyRevenue.length >= 2
                    ? (((monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0) - (monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0)) /
                          (monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 1)) *
                      100
                    : 0

            setProcessedData({
                metrics: {
                    totalRevenue,
                    netRevenue,
                    totalCommission,
                    totalSales,
                    avgOrderValue,
                    growthRate,
                    commissionRate: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0
                },
                monthlyTrends,
                categoryData
            })
        } else {
            setProcessedData(null)
        }
    }, [analyticsData])

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded-full w-3/4 mb-3"></div>
                            <div className="h-8 bg-gray-700 rounded-full w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded-full w-2/3"></div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-800/50 rounded-2xl p-6 h-96 animate-pulse">
                        <div className="h-6 bg-gray-700 rounded-full w-1/3 mb-6"></div>
                        <div className="h-full bg-gray-700 rounded-xl"></div>
                    </div>
                    <div className="bg-gray-800/50 rounded-2xl p-6 h-96 animate-pulse">
                        <div className="h-6 bg-gray-700 rounded-full w-1/3 mb-6"></div>
                        <div className="h-full bg-gray-700 rounded-xl"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!processedData) {
        return (
            <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-xl font-medium">No Revenue Data Available</p>
                    <p className="text-sm mt-2 opacity-70">Revenue analytics will appear once data is available</p>
                </div>
            </div>
        )
    }

    const { metrics, monthlyTrends, categoryData } = processedData
    const COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#6366F1']

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-[#00FF89]" />
                        </div>
                        <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                metrics.growthRate >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {metrics.growthRate >= 0 ? '+' : ''}
                            {formatPercentage(metrics.growthRate)}
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Total Revenue</h3>
                    <div className="text-3xl font-bold text-white mb-1">{formatCurrency(metrics.totalRevenue)}</div>
                    <p className="text-sm text-gray-500">Gross earnings</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Net Revenue</h3>
                    <div className="text-3xl font-bold text-white mb-1">{formatCurrency(metrics.netRevenue)}</div>
                    <p className="text-sm text-gray-500">After commissions</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Average Order Value</h3>
                    <div className="text-3xl font-bold text-white mb-1">{formatCurrency(metrics.avgOrderValue)}</div>
                    <p className="text-sm text-gray-500">Per transaction</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-amber-400" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Total Sales</h3>
                    <div className="text-3xl font-bold text-white mb-1">{formatNumber(metrics.totalSales)}</div>
                    <p className="text-sm text-gray-500">Completed orders</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Revenue Trends</h3>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#00FF89] rounded-sm opacity-80"></div>
                                <span className="text-gray-400">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                                <span className="text-gray-400">Sales Count</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-2 bg-[#8B5CF6] rounded-full"></div>
                                <span className="text-gray-400">Avg Order Value</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-80">
                        {monthlyTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00FF89" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#00FF89" stopOpacity={0.05}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <YAxis 
                                        yAxisId="left"
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value.toLocaleString()}`}
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
                                                            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                                                                {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Value') ? formatCurrency(entry.value) : formatNumber(entry.value)}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    {/* Use Line chart for Revenue instead of Area for single data points */}
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#00FF89"
                                        strokeWidth={4}
                                        dot={{ fill: '#00FF89', strokeWidth: 2, r: 8 }}
                                        activeDot={{ r: 10, fill: '#00FF89', stroke: '#00FF89', strokeWidth: 2 }}
                                        name="Revenue"
                                    />
                                    {/* Keep bars but make them thinner for single data points */}
                                    <Bar 
                                        yAxisId="right" 
                                        dataKey="sales" 
                                        fill="#3B82F6" 
                                        radius={[2, 2, 0, 0]}
                                        name="Sales Count"
                                        maxBarSize={60}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="avgOrderValue"
                                        stroke="#8B5CF6"
                                        strokeWidth={3}
                                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                                        activeDot={{ r: 8, fill: '#8B5CF6', stroke: '#8B5CF6', strokeWidth: 2 }}
                                        name="Avg Order Value"
                                        strokeDasharray="5 5"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">No monthly data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-white mb-6">Revenue by Category</h3>
                    <div className="h-80">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%">
                                <RechartsPieChart>
                                    <defs>
                                        {categoryData.map((entry, index) => (
                                            <linearGradient
                                                key={index}
                                                id={`gradient-${index}`}
                                                x1="0"
                                                y1="0"
                                                x2="1"
                                                y2="1">
                                                <stop
                                                    offset="0%"
                                                    stopColor={COLORS[index]}
                                                    stopOpacity={1}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={COLORS[index]}
                                                    stopOpacity={0.6}
                                                />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        dataKey="revenue"
                                        label={({ category, percentage }) => (percentage > 5 ? `${category}: ${percentage.toFixed(1)}%` : '')}
                                        labelLine={false}>
                                        {categoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={`url(#gradient-${index})`}
                                                stroke={COLORS[index]}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <PieChart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p className="font-medium">No category data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {categoryData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-white mb-6">Category Performance</h3>
                    <div className="h-64">
                        <ResponsiveContainer
                            width="100%"
                            height="100%">
                            <BarChart
                                data={categoryData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient
                                        id="barGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="#00FF89"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#00FF89"
                                            stopOpacity={0.2}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#374151"
                                    opacity={0.2}
                                />
                                <XAxis
                                    dataKey="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#barGradient)"
                                    name="Revenue"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {categoryData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-white mb-6">Detailed Category Breakdown</h3>
                    <div className="space-y-4">
                        {categoryData.map((category, index) => (
                            <div
                                key={category.category}
                                className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: COLORS[index] }}
                                        />
                                        <span className="text-white font-medium">{category.category}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-semibold">{formatCurrency(category.revenue)}</div>
                                        <div className="text-gray-400 text-sm">{formatNumber(category.sales)} sales</div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(category.percentage, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.2 * index }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: COLORS[index] }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Avg: {formatCurrency(category.avgOrderValue)}</span>
                                    <span>{category.percentage.toFixed(1)}% of total</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl p-6 border border-gray-700/30 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-6">Revenue Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#00FF89] mb-2">{formatCurrency(metrics.totalRevenue)}</div>
                        <div className="text-gray-400 text-sm">Total Revenue</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-2">{formatCurrency(metrics.netRevenue)}</div>
                        <div className="text-gray-400 text-sm">Net Revenue</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400 mb-2">{formatCurrency(metrics.avgOrderValue)}</div>
                        <div className="text-gray-400 text-sm">Avg Order Value</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-amber-400 mb-2">{formatNumber(metrics.totalSales)}</div>
                        <div className="text-gray-400 text-sm">Total Sales</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

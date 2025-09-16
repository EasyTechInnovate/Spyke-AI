'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tag, DollarSign, Users, TrendingUp, Percent, BarChart3, Activity, Target, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, PieChart, Pie, Cell, AreaChart, BarChart, LineChart, RadialBarChart, RadialBar, Legend } from 'recharts'

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

const clamp = (num, min, max) => Math.min(Math.max(num ?? 0, min), max)

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
            <p className="text-white font-medium mb-2">{label}</p>
            {payload.map((entry, index) => (
                <p key={index} className="text-gray-400">
                    <span style={{ color: entry.color }}>●</span> {entry.name}: {
                        entry.name.includes('Revenue') || entry.name.includes('Savings') ? formatCurrency(entry.value) : formatNumber(entry.value)
                    }
                </p>
            ))}
        </div>
    )
}

const PromocodeTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
            <p className="text-white font-medium">{data.code}</p>
            <p className="text-gray-400">Total Usage: {formatNumber(data.totalUsage)}</p>
            <p className="text-gray-400">Total Savings: {formatCurrency(data.totalSavings)}</p>
            <p className="text-gray-400">Total Revenue: {formatCurrency(data.totalRevenue)}</p>
            <p className="text-gray-400">
                Discount: {data.discountType === 'percentage' ? `${data.discountValue}%` : formatCurrency(data.discountValue)}
            </p>
        </div>
    )
}

export const PromocodesTab = ({ analyticsData, timeRange, loading }) => {
    const [promocodesData, setPromocodesData] = useState(null)

    const generateTimeSeriesData = (promocodes, timeRange) => {
        const getDaysFromTimeRange = (period) => {
            switch (period) {
                case '7d': return 7
                case '30d': return 30
                case '90d': return 90
                case '1y': return 365
                default: return 30
            }
        }

        const days = getDaysFromTimeRange(timeRange)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - (days - 1))

        const trends = []
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + i)
            
            const dateString = currentDate.toISOString().split('T')[0]
            const dayName = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            
            const dayData = promocodes.filter(promo => {
                const promoDate = new Date(promo.createdAt).toISOString().split('T')[0]
                return promoDate === dateString
            })

            const totalUsage = dayData.reduce((sum, promo) => sum + (promo.totalUsage || 0), 0)
            const totalSavings = dayData.reduce((sum, promo) => sum + (promo.totalSavings || 0), 0)
            const totalRevenue = dayData.reduce((sum, promo) => sum + (promo.totalRevenue || 0), 0)
            const activePromocodes = dayData.filter(promo => promo.isActive).length

            trends.push({
                date: dayName,
                usage: totalUsage,
                savings: totalSavings,
                revenue: totalRevenue,
                activePromocodes,
                avgSavingsPerUse: totalUsage > 0 ? totalSavings / totalUsage : 0
            })
        }

        return trends
    }

    const calculateMetrics = (promocodes) => {
        const total = promocodes.length
        const active = promocodes.filter(p => p.isActive).length
        const expired = promocodes.filter(p => new Date(p.validUntil) < new Date()).length
        const totalUsage = promocodes.reduce((sum, p) => sum + (p.totalUsage || 0), 0)
        const totalSavings = promocodes.reduce((sum, p) => sum + (p.totalSavings || 0), 0)
        const totalRevenue = promocodes.reduce((sum, p) => sum + (p.totalRevenue || 0), 0)
        const avgSavingsPerUse = totalUsage > 0 ? totalSavings / totalUsage : 0

        return {
            totalPromocodes: total,
            activePromocodes: active,
            expiredPromocodes: expired,
            totalUsage,
            totalSavings,
            totalRevenue,
            avgSavingsPerUse,
            usageRate: total > 0 ? (promocodes.filter(p => p.totalUsage > 0).length / total) * 100 : 0
        }
    }

    const getDiscountTypeDistribution = (promocodes) => {
        const distribution = promocodes.reduce((acc, promo) => {
            const type = promo.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'
            acc[type] = (acc[type] || 0) + 1
            return acc
        }, {})

        return Object.entries(distribution).map(([name, count]) => ({
            name,
            count,
            percentage: promocodes.length > 0 ? (count / promocodes.length) * 100 : 0
        }))
    }

    const getStatusDistribution = (promocodes) => {
        const now = new Date()
        const active = promocodes.filter(p => p.isActive && new Date(p.validUntil) > now).length
        const inactive = promocodes.filter(p => !p.isActive).length
        const expired = promocodes.filter(p => new Date(p.validUntil) <= now).length

        return [
            { name: 'Active', count: active, color: '#00FF89' },
            { name: 'Inactive', count: inactive, color: '#6B7280' },
            { name: 'Expired', count: expired, color: '#EF4444' }
        ].filter(item => item.count > 0)
    }

    const getTopPerformingPromocodes = (promocodes) => {
        return promocodes
            .filter(p => p.totalUsage > 0)
            .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
            .slice(0, 10)
    }

    const getUsageEfficiencyData = (promocodes) => {
        return promocodes
            .filter(p => p.usageLimit && p.totalUsage > 0)
            .map(p => ({
                code: p.code,
                efficiency: (p.totalUsage / p.usageLimit) * 100,
                totalUsage: p.totalUsage,
                usageLimit: p.usageLimit
            }))
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, 8)
    }

    useEffect(() => {
        if (analyticsData?.promocodes) {
            const promocodes = analyticsData.promocodes
            const metrics = calculateMetrics(promocodes)
            const trends = generateTimeSeriesData(promocodes, timeRange)
            const topPromocodes = getTopPerformingPromocodes(promocodes)
            const discountTypeDistribution = getDiscountTypeDistribution(promocodes)
            const statusDistribution = getStatusDistribution(promocodes)
            const usageEfficiency = getUsageEfficiencyData(promocodes)

            setPromocodesData({
                metrics,
                trends,
                topPromocodes,
                discountTypeDistribution,
                statusDistribution,
                usageEfficiency,
                allPromocodes: promocodes
            })
        }
    }, [analyticsData, timeRange])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
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

    if (!promocodesData) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
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

    const { metrics, trends, topPromocodes, discountTypeDistribution, statusDistribution, usageEfficiency } = promocodesData
    const CHART_COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#6366F1']

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Promocodes</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalPromocodes)}</div>
                    <div className="text-sm text-[#00FF89]">{formatNumber(metrics.activePromocodes)} active</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Usage</h3>
                        <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#3B82F6]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalUsage)}</div>
                    <div className="text-sm text-gray-400">{formatPercentage(metrics.usageRate)} usage rate</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Savings</h3>
                        <div className="w-8 h-8 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-[#8B5CF6]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.totalSavings)}</div>
                    <div className="text-sm text-gray-400">Avg: {formatCurrency(metrics.avgSavingsPerUse)} per use</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Revenue Impact</h3>
                        <div className="w-8 h-8 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.totalRevenue)}</div>
                    <div className="text-sm text-[#00FF89]">From promocode usage</div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Promocode Performance Trends</h3>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-sm"></div>
                            <span className="text-gray-400">Usage</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                            <span className="text-gray-400">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-2 bg-[#8B5CF6] rounded-full"></div>
                            <span className="text-gray-400">Avg Savings</span>
                        </div>
                    </div>
                </div>
                <div className="h-80 relative">
                    {trends.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
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
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="usage"
                                    fill="#00FF89"
                                    stroke="#00FF89"
                                    fillOpacity={0.15}
                                    name="Usage"
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="revenue"
                                    fill="#3B82F6"
                                    name="Revenue"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="avgSavingsPerUse"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    dot={{ fill: '#8B5CF6', r: 3 }}
                                    name="Avg Savings per Use"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No trend data available</p>
                                <p className="text-sm mt-1">Trends will appear once promocodes are used over time</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Performing Promocodes</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {topPromocodes.length > 0 ? (
                            topPromocodes.map((promo, index) => (
                                <div
                                    key={promo._id}
                                    className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-[#00FF89] to-[#3B82F6] rounded-lg flex items-center justify-center text-sm font-bold text-gray-900">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm">{promo.code}</div>
                                            <div className="text-gray-400 text-xs">
                                                {formatNumber(promo.totalUsage)} uses • {formatCurrency(promo.totalSavings)} saved
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatCurrency(promo.totalRevenue)}</div>
                                        <div className="text-gray-400 text-xs">
                                            {promo.discountType === 'percentage'
                                                ? `${promo.discountValue}% off`
                                                : `${formatCurrency(promo.discountValue)} off`}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No performance data available</p>
                                <p className="text-sm mt-1">Top promocodes will appear once they generate revenue</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
                    <div className="h-80 relative">
                        {statusDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        label={({ name, count }) => `${name}: ${count}`}>
                                        {statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No status data available</p>
                                    <p className="text-sm mt-1">Distribution will appear once promocodes are created</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Discount Type Distribution</h3>
                    <div className="h-80 relative">
                        {discountTypeDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={discountTypeDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        fill="#00FF89"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Percent className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No discount type data available</p>
                                    <p className="text-sm mt-1">Distribution will appear once promocodes are created</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Usage Efficiency</h3>
                    <div className="h-80 relative">
                        {usageEfficiency.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usageEfficiency} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis
                                        type="number"
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="code"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        width={80}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value.toFixed(1)}%`, 'Efficiency']}
                                        labelFormatter={(label) => `Code: ${label}`}
                                    />
                                    <Bar
                                        dataKey="efficiency"
                                        fill="#3B82F6"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No efficiency data available</p>
                                    <p className="text-sm mt-1">Efficiency metrics will appear for limited-use promocodes</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    DollarSign,
    TrendingUp,
    Clock,
    CreditCard,
    Users,
    Activity,
    PieChart,
    BarChart2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Download,
    TrendingDown,
    Target,
    Zap,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock as ClockIcon,
    BarChart3,
    LineChart,
    PieChart as PieChartIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Cell,
    BarChart,
    Bar,
    Pie,
    LineChart as RechartsLineChart,
    Line,
    ComposedChart,
    Legend
} from 'recharts'
import { adminAPI } from '@/lib/api/admin'
import { analyticsAPI } from '@/lib/api/analytics'
import { CHART_COLORS } from '@/lib/constants/analytics'
const MetricCard = ({ title, value, change, icon: Icon, color = 'emerald', trend, suffix = '', subtitle }) => {
    const isPositive = change >= 0
    const colorClasses = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl border ${colorClasses[color]} backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${colorClasses[color]} ring-1 ring-white/10`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-medium">{title}</p>
                        <p className="text-2xl font-bold text-white mt-1">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                            {suffix}
                        </p>
                        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    {trend}
                </div>
            )}
        </motion.div>
    )
}
const ChartCard = ({ title, children, height = 350, icon: Icon, subtitle, action }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm hover:border-gray-600 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-5 h-5 text-[#00FF89]" />}
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                </div>
            </div>
            {action && <div className="flex gap-2">{action}</div>}
        </div>
        <div style={{ height: `${height}px` }}>{children}</div>
    </motion.div>
)
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
const LoadingCard = () => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
        <div className="h-64 bg-gray-700/50 rounded"></div>
    </div>
)
const StatusBadge = ({ status, count }) => {
    const statusConfig = {
        completed: { color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle },
        pending: { color: 'text-amber-400 bg-amber-500/10', icon: ClockIcon },
        processing: { color: 'text-blue-400 bg-blue-500/10', icon: RefreshCw },
        failed: { color: 'text-rose-400 bg-rose-500/10', icon: XCircle },
        cancelled: { color: 'text-gray-400 bg-gray-500/10', icon: AlertCircle }
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
            <Icon className="w-4 h-4" />
            <span className="capitalize">{status}</span>
            <span className="text-xs opacity-75">({count})</span>
        </div>
    )
}
export default function PayoutsTab({ timeRange = '30d', loading: parentLoading }) {
    const [analyticsData, setAnalyticsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [refreshing, setRefreshing] = useState(false)

    const getDaysFromTimeRange = useCallback((period) => {
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
    }, [])

    const formatProcessingTime = (days) => {
        if (!days || days <= 0) return '0d'
        if (days < 1) {
            const totalMinutes = Math.round(days * 24 * 60)
            const hours = Math.floor(totalMinutes / 60)
            const minutes = totalMinutes % 60
            if (hours === 0) return `${minutes}m`
            return `${hours}h ${minutes}m`
        }
        return `${days.toFixed(1)}d`
    }

    const fetchAnalytics = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) setRefreshing(true)
                else setLoading(true)
                setError(null)
                // Use analytics endpoint: /v1/analytics/admin/payouts?period=30d
                const response = await analyticsAPI.admin.getPayouts({ period: timeRange })
                // Response can be { success, data: { statusBreakdown, ... } }
                const core = response?.data && response.data.statusBreakdown ? response.data : response
                console.log('Payout analytics response:', core)
                if (!core || !core.statusBreakdown) {
                    console.warn('Payout analytics: unexpected response shape', response)
                }
                setAnalyticsData(core || null)
            } catch (err) {
                console.error('Error fetching payout analytics (analytics endpoint):', err)
                setError(err.message)
            } finally {
                setLoading(false)
                setRefreshing(false)
            }
        },
        [timeRange]
    )

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    const processedData = useMemo(() => {
        if (!analyticsData) return null
        const { statusBreakdown = [], dailyTrends = [], methodBreakdown = [], processingTimes = {}, platformRevenue = {} } = analyticsData

        // Totals from status breakdown
        const totals = statusBreakdown.reduce(
            (acc, status) => {
                acc.totalCount += status.count || 0
                acc.totalAmount += status.totalAmount || 0
                return acc
            },
            { totalCount: 0, totalAmount: 0 }
        )

        // Basic status metrics
        const completedPayouts = statusBreakdown.find((s) => s._id === 'completed')?.count || 0
        const pendingPayouts = statusBreakdown.find((s) => s._id === 'pending')?.count || 0
        const failedPayouts = statusBreakdown.find((s) => s._id === 'failed')?.count || 0
        const processingPayouts = statusBreakdown.find((s) => s._id === 'processing')?.count || 0

        const completionRate = totals.totalCount > 0 ? ((completedPayouts / totals.totalCount) * 100).toFixed(1) : '0.0'
        const failureRate = totals.totalCount > 0 ? ((failedPayouts / totals.totalCount) * 100).toFixed(1) : '0.0'
        const pendingRate = totals.totalCount > 0 ? ((pendingPayouts / totals.totalCount) * 100).toFixed(1) : '0.0'

        const avgProcessingTime = processingTimes?.avgProcessingTime || 0
        const avgPayoutAmount = totals.totalCount > 0 ? totals.totalAmount / totals.totalCount : 0

        // Fill in missing dates for trends (align with SalesTab approach)
        const days = getDaysFromTimeRange(timeRange)
        const endDate = new Date() // today
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - (days - 1))

        // Map existing dailyTrends for quick lookup using ISO date key
        const trendsMap = new Map()
        dailyTrends.forEach((day) => {
            if (day._id?.year && day._id?.month && day._id?.day) {
                const dt = new Date(day._id.year, day._id.month - 1, day._id.day)
                const iso = dt.toISOString().split('T')[0]
                trendsMap.set(iso, {
                    count: day.count || 0,
                    totalAmount: day.totalAmount || 0
                })
            }
        })

        const trendsData = []
        for (let i = 0; i < days; i++) {
            const current = new Date(startDate)
            current.setDate(startDate.getDate() + i)
            const iso = current.toISOString().split('T')[0]
            const base = trendsMap.get(iso) || { count: 0, totalAmount: 0 }
            trendsData.push({
                date: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                payouts: base.count,
                amount: base.totalAmount,
                fullDate: current
            })
        }

        // Status data for Pie / summary
        const statusData = statusBreakdown.map((status) => {
            const name = status._id ? status._id.charAt(0).toUpperCase() + status._id.slice(1) : 'Unknown'
            const value = status.count || 0
            const percentage = totals.totalCount > 0 ? ((value / totals.totalCount) * 100).toFixed(1) : '0.0'
            const avgAmount = value > 0 ? status.totalAmount / value : 0
            return {
                name,
                value,
                amount: status.totalAmount || 0,
                percentage,
                avgAmount: avgAmount.toFixed(2)
            }
        })

        // Method data (horizontal bar)
        const methodData = methodBreakdown.map((method) => ({
            name: method._id ? method._id.charAt(0).toUpperCase() + method._id.slice(1) : 'Unknown',
            value: method.count || 0,
            amount: method.totalAmount || 0,
            percentage: totals.totalCount > 0 ? (((method.count || 0) / totals.totalCount) * 100).toFixed(1) : '0.0'
        }))

        // Trend deltas: compare last half vs first half (only if we have enough data)
        const calculateTrends = () => {
            if (trendsData.length < 4) {
                return { payoutVolume: 0, completionRate: 0, processingTime: 0 }
            }
            const midPoint = Math.floor(trendsData.length / 2)
            const previousPeriod = trendsData.slice(0, midPoint)
            const currentPeriod = trendsData.slice(midPoint)
            const prevVolume = previousPeriod.reduce((s, d) => s + d.payouts, 0)
            const currVolume = currentPeriod.reduce((s, d) => s + d.payouts, 0)
            const volumeTrend = prevVolume > 0 ? ((currVolume - prevVolume) / prevVolume) * 100 : 0
            // Without historical status history / processing snapshots we keep these 0 for now
            return {
                payoutVolume: parseFloat(volumeTrend.toFixed(1)),
                completionRate: 0,
                processingTime: 0
            }
        }

        const trends = calculateTrends()

        return {
            totals,
            statusData,
            trendsData: trendsData.sort((a, b) => a.fullDate - b.fullDate),
            methodData,
            completionRate,
            failureRate,
            pendingRate,
            avgProcessingTime,
            avgPayoutAmount,
            trends,
            completedPayouts,
            pendingPayouts,
            failedPayouts,
            processingPayouts,
            platformRevenue,
            hasData: totals.totalCount > 0
        }
    }, [analyticsData, getDaysFromTimeRange, timeRange])

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12">
                <div className="text-red-400 mb-4 flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Failed to load payout analytics
                </div>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                    onClick={() => fetchAnalytics(true)}
                    className="px-6 py-3 bg-[#00FF89] hover:bg-[#00E67A] text-black font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto">
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </motion.div>
        )
    }
    const isLoading = loading || parentLoading
    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <LoadingCard key={i} />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <LoadingCard />
                    <LoadingCard />
                    <LoadingCard />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <LoadingCard />
                    <LoadingCard />
                </div>
            </div>
        )
    }
    if (!processedData) {
        return (
            <EmptyStateCard
                title="No Data Available"
                description="Unable to process analytics data. Please try refreshing or contact support if the issue persists."
                icon={AlertCircle}
                action={
                    <button
                        onClick={() => fetchAnalytics(true)}
                        className="px-6 py-3 bg-[#00FF89] hover:bg-[#00E67A] text-black font-medium rounded-lg transition-colors flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh Data
                    </button>
                }
            />
        )
    }
    const {
        totals,
        statusData,
        trendsData,
        methodData,
        completionRate,
        failureRate,
        pendingRate,
        avgProcessingTime,
        avgPayoutAmount,
        trends,
        hasData,
        completedPayouts,
        pendingPayouts,
        failedPayouts,
        processingPayouts,
        platformRevenue
    } = processedData
    if (!hasData) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Payout Analytics</h2>
                        <p className="text-gray-400">Comprehensive insights into your payout system</p>
                    </div>
                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <EmptyStateCard
                        title="No Payouts Yet"
                        description="Start processing payouts to see analytics data here."
                        icon={DollarSign}
                    />
                    <EmptyStateCard
                        title="No Trends Available"
                        description="Payout trends will appear once you have transaction data."
                        icon={TrendingUp}
                    />
                    <EmptyStateCard
                        title="No Methods Data"
                        description="Payment method analytics will be available with payout data."
                        icon={CreditCard}
                    />
                    <EmptyStateCard
                        title="No Performance Data"
                        description="Processing time and completion metrics will appear here."
                        icon={Target}
                    />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-[#00FF89]/10 to-blue-500/10 border border-[#00FF89]/20 rounded-xl p-8">
                    <div className="text-center">
                        <Zap className="w-12 h-12 text-[#00FF89] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Ready to Get Started?</h3>
                        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                            Once you start processing payouts, this dashboard will provide comprehensive insights into your payout performance,
                            trends, and optimization opportunities.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                Real-time analytics
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                Performance metrics
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                Trend analysis
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                Revenue insights
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Payout Analytics</h2>
                    <p className="text-gray-400">Comprehensive insights into your payout system performance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button className="px-4 py-2 bg-[#00FF89] hover:bg-[#00E67A] text-black font-medium rounded-lg transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <MetricCard
                    title="Total Payouts"
                    value={totals.totalCount}
                    change={trends.payoutVolume}
                    icon={DollarSign}
                    color="emerald"
                    trend={`$${totals.totalAmount.toLocaleString()} total value`}
                    subtitle={`Avg: $${avgPayoutAmount.toFixed(2)}`}
                />
                <MetricCard
                    title="Success Rate"
                    value={completionRate}
                    suffix="%"
                    change={trends.completionRate}
                    icon={TrendingUp}
                    color="blue"
                    trend={`${completedPayouts} successful`}
                    subtitle={`${failureRate}% failed`}
                />
                <MetricCard
                    title="Processing Time"
                    value={avgProcessingTime < 1 ? (avgProcessingTime * 24).toFixed(2) : avgProcessingTime.toFixed(1)}
                    suffix={avgProcessingTime < 1 ? ' hrs' : ' d'}
                    change={trends.processingTime}
                    icon={Clock}
                    color="amber"
                    trend={formatProcessingTime(avgProcessingTime)}
                    subtitle={`${pendingRate}% pending`}
                />
                <MetricCard
                    title="Platform Revenue"
                    value={platformRevenue?.totalRevenue ? platformRevenue.totalRevenue.toFixed(2) : '0.00'}
                    icon={Activity}
                    color="purple"
                    trend={`Fees: $${(platformRevenue?.totalPlatformFees || 0).toFixed(2)} + $${(platformRevenue?.totalProcessingFees || 0).toFixed(2)}`}
                    subtitle={`Avg Payout $${(platformRevenue?.avgPayoutAmount || avgPayoutAmount).toFixed(2)}`}
                />
                <MetricCard
                    title="In Progress"
                    value={processingPayouts}
                    icon={RefreshCw}
                    color="indigo"
                    trend={`${pendingPayouts} pending / ${failedPayouts} failed`}
                    subtitle={`Completed ${completedPayouts}`}
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard
                    title="Status Distribution"
                    icon={PieChartIcon}
                    subtitle="Current payout statuses"
                    height={300}>
                    <ResponsiveContainer
                        width="100%"
                        height="100%">
                        <RechartsPieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value">
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#F3F4F6' }}
                                formatter={(value, name) => [`${value} payouts (${statusData.find((s) => s.name === name)?.percentage}%)`, name]}
                            />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                    {statusData.length === 0 && (
                        <div className="flex items-center justify-center h-full -mt-24 text-gray-500 text-sm">No status data</div>
                    )}
                </ChartCard>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Target className="w-5 h-5 text-[#00FF89]" />
                        <h3 className="text-lg font-semibold text-white">Status Summary</h3>
                    </div>
                    <div className="space-y-3">
                        {statusData.map((status, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between">
                                <StatusBadge
                                    status={status.name.toLowerCase()}
                                    count={status.value}
                                />
                                <div className="text-right">
                                    <p className="text-white font-medium">${status.amount.toLocaleString()}</p>
                                    <p className="text-xs text-gray-400">Avg: ${status.avgAmount}</p>
                                </div>
                            </div>
                        ))}
                        {statusData.length === 0 && <p className="text-sm text-gray-500">No status breakdown available.</p>}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-5 h-5 text-[#00FF89]" />
                        <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total Volume</span>
                            <span className="text-white font-medium">${totals.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Avg Payout</span>
                            <span className="text-white font-medium">${avgPayoutAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Success Rate</span>
                            <span className="text-emerald-400 font-medium">{completionRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Processing Time</span>
                            <span className="text-amber-400 font-medium">{formatProcessingTime(avgProcessingTime)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Platform Fees</span>
                            <span className="text-white font-medium">${(platformRevenue?.totalPlatformFees || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Processing Fees</span>
                            <span className="text-white font-medium">${(platformRevenue?.totalProcessingFees || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartCard
                    title="Payout Trends"
                    icon={LineChart}
                    subtitle="Daily payout volume & amounts"
                    height={350}>
                    <ResponsiveContainer
                        width="100%"
                        height="100%">
                        <ComposedChart data={trendsData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#374151"
                            />
                            <XAxis
                                dataKey="date"
                                stroke="#9CA3AF"
                                fontSize={12}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#9CA3AF"
                                fontSize={12}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#00FF89"
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)'
                                }}
                                labelStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="payouts"
                                fill="#00FF89"
                                fillOpacity={0.6}
                                name="Payout Count"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="amount"
                                stroke="#00FF89"
                                strokeWidth={3}
                                name="Total Amount ($)"
                                dot={{ fill: '#00FF89', strokeWidth: 2, r: 4 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                    {!trendsData.some((d) => d.payouts > 0 || d.amount > 0) && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">No payout activity in range</div>
                    )}
                </ChartCard>
                <ChartCard
                    title="Payment Methods"
                    icon={CreditCard}
                    subtitle="Distribution of payout methods"
                    height={350}>
                    <ResponsiveContainer
                        width="100%"
                        height="100%">
                        <BarChart
                            data={methodData}
                            layout="horizontal">
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#374151"
                            />
                            <XAxis
                                type="number"
                                stroke="#9CA3AF"
                                fontSize={12}
                                allowDecimals={false}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#9CA3AF"
                                fontSize={12}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#F3F4F6' }}
                                formatter={(value, name) => [`${value} payouts (${methodData.find((m) => m.name === name)?.percentage}%)`, name]}
                            />
                            <Bar
                                dataKey="value"
                                fill="#00FF89"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    {methodData.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">No method data</div>
                    )}
                </ChartCard>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Target className="w-5 h-5 text-[#00FF89]" />
                    <h3 className="text-lg font-semibold text-white">Performance Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Success Rate</span>
                        </div>
                        <p className="text-white text-lg font-bold">{completionRate}%</p>
                        <p className="text-gray-400 text-sm">
                            {completedPayouts} of {totals.totalCount} payouts completed
                        </p>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400 font-medium">Processing Time</span>
                        </div>
                        <p className="text-white text-lg font-bold">{formatProcessingTime(avgProcessingTime)}</p>
                        <p className="text-gray-400 text-sm">Average from request to completion</p>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-medium">Platform Revenue</span>
                        </div>
                        <p className="text-white text-lg font-bold">${(platformRevenue?.totalRevenue || 0).toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">Fees on {totals.totalCount} payouts</p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

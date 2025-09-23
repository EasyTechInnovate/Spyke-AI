'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    Users,
    DollarSign,
    Package,
    TrendingUp,
    Star,
    Activity,
    BarChart3,
    Eye,
    ShoppingCart,
    Calendar,
    MapPin,
    Award,
    CheckCircle,
    Clock,
    RefreshCw,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Zap,
    AlertCircle,
    PieChart as PieChartIcon,
    LineChart,
    Globe,
    CreditCard
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
    PieChart,
    Pie,
    Cell,
    BarChart,
    ScatterChart,
    Scatter,
    Legend,
    LineChart as RechartsLineChart
} from 'recharts'
import analyticsAPI from '@/lib/api/analytics'
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
const CHART_COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#6366F1']
const MetricCard = ({ title, value, change, icon: Icon, trend, suffix = '', subtitle }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">{title}</h3>
                <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#00FF89]" />
                </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {suffix}
            </div>
            {trend && <div className="text-sm text-[#00FF89]">{trend}</div>}
            {subtitle && <div className="text-sm text-gray-400 mt-1">{subtitle}</div>}
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
const EmptyStateCard = ({ title, description, icon: Icon }) => (
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
        <p className="text-gray-400 max-w-md mx-auto">{description}</p>
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
const SellerCard = ({ seller, rank }) => {
    const verificationStatusConfig = {
        approved: { color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle, label: 'Verified' },
        pending: { color: 'text-amber-400 bg-amber-500/10', icon: Clock, label: 'Pending' },
        rejected: { color: 'text-rose-400 bg-rose-500/10', icon: AlertCircle, label: 'Rejected' }
    }
    const config = verificationStatusConfig[seller.verification?.status] || verificationStatusConfig.pending
    const Icon = config.icon
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm hover:border-gray-600 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center text-sm font-bold text-[#00FF89]">
                        #{rank}
                    </div>
                    <div>
                        <h4 className="text-white font-medium truncate max-w-32">{seller.fullName}</h4>
                        <p className="text-xs text-gray-400 truncate max-w-32">{seller.email}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center">
                    <p className="text-lg font-bold text-white">{formatCurrency(seller.totalRevenue)}</p>
                    <p className="text-xs text-gray-400">Revenue</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-white">{seller.totalProducts}</p>
                    <p className="text-xs text-gray-400">Products</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                    <p className="text-white font-medium">{seller.totalSales}</p>
                    <p className="text-gray-500">Sales</p>
                </div>
                <div className="text-center">
                    <p className="text-white font-medium">{seller.avgProductRating || 0}/5</p>
                    <p className="text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                    <p className="text-white font-medium">{seller.commissionOffer?.rate || 0}%</p>
                    <p className="text-gray-500">Commission</p>
                </div>
            </div>
            {seller.location?.country && (
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {seller.location.country}
                </div>
            )}
        </motion.div>
    )
}
export default function SellersTab({ timeRange = '30d', loading: parentLoading }) {
    const [analyticsData, setAnalyticsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true)
            else setLoading(true)
            setError(null)
            const response = await analyticsAPI.admin.getSellers({
                period: timeRange.replace('d', '')
            })
            setAnalyticsData(response.data || response)
        } catch (err) {
            console.error('Error fetching seller analytics:', err)
            setError(err.message)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [timeRange])
    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])
    const processedData = useMemo(() => {
        if (!analyticsData) return null
        const sellers = analyticsData.sellers || []
        const topSellers = analyticsData.topSellers || []
        const pagination = analyticsData.pagination || {}
        const totalSellers = sellers.length
        const activeSellers = sellers.filter(s => s.isActive).length
        const verifiedSellers = sellers.filter(s => s.verification?.status === 'approved').length
        const totalRevenue = sellers.reduce((sum, s) => sum + (s.totalRevenue || 0), 0)
        const totalEarnings = sellers.reduce((sum, s) => sum + (s.stats?.totalEarnings || 0), 0)
        const totalProducts = sellers.reduce((sum, s) => sum + (s.totalProducts || 0), 0)
        const totalSales = sellers.reduce((sum, s) => sum + (s.totalSales || 0), 0)
        const totalProfileViews = sellers.reduce((sum, s) => sum + (s.stats?.profileViews || 0), 0)
        const totalReviews = sellers.reduce((sum, s) => sum + (s.stats?.totalReviews || 0), 0)
        const nichesData = sellers.reduce((acc, seller) => {
            (seller.niches || []).forEach(niche => {
                const existing = acc.find(item => item.name === niche)
                if (existing) {
                    existing.count++
                    existing.revenue += seller.totalRevenue || 0
                } else {
                    acc.push({ 
                        name: niche, 
                        count: 1, 
                        revenue: seller.totalRevenue || 0 
                    })
                }
            })
            return acc
        }, []).sort((a, b) => b.count - a.count)
        const toolsData = sellers.reduce((acc, seller) => {
            (seller.toolsSpecialization || []).forEach(tool => {
                const existing = acc.find(item => item.name === tool)
                if (existing) {
                    existing.count++
                    existing.revenue += seller.totalRevenue || 0
                } else {
                    acc.push({ 
                        name: tool, 
                        count: 1, 
                        revenue: seller.totalRevenue || 0 
                    })
                }
            })
            return acc
        }, []).sort((a, b) => b.count - a.count)
        const verificationStatusData = [
            { 
                name: 'Approved', 
                count: sellers.filter(s => s.verification?.status === 'approved').length,
                color: '#00FF89'
            },
            { 
                name: 'Pending', 
                count: sellers.filter(s => s.verification?.status === 'pending').length,
                color: '#F59E0B'
            },
            { 
                name: 'Rejected', 
                count: sellers.filter(s => s.verification?.status === 'rejected').length,
                color: '#EF4444'
            }
        ].filter(item => item.count > 0)
        const commissionRates = sellers.reduce((acc, seller) => {
            const rate = seller.commissionOffer?.rate || 0
            const existing = acc.find(item => item.rate === rate)
            if (existing) {
                existing.count++
                existing.revenue += seller.totalRevenue || 0
            } else {
                acc.push({ 
                    rate, 
                    count: 1, 
                    name: `${rate}%`, 
                    revenue: seller.totalRevenue || 0 
                })
            }
            return acc
        }, []).sort((a, b) => b.count - a.count)
        const countryData = sellers.reduce((acc, seller) => {
            const country = seller.location?.country || 'Unknown'
            const existing = acc.find(item => item.name === country)
            if (existing) {
                existing.count++
                existing.revenue += seller.totalRevenue || 0
            } else {
                acc.push({ 
                    name: country, 
                    count: 1, 
                    revenue: seller.totalRevenue || 0 
                })
            }
            return acc
        }, []).sort((a, b) => b.count - a.count)
        const payoutMethods = sellers.reduce((acc, seller) => {
            const method = seller.payoutInfo?.method || 'Not Set'
            const existing = acc.find(item => item.name === method)
            if (existing) {
                existing.count++
                existing.verified += seller.payoutInfo?.isVerified ? 1 : 0
            } else {
                acc.push({ 
                    name: method.charAt(0).toUpperCase() + method.slice(1), 
                    count: 1, 
                    verified: seller.payoutInfo?.isVerified ? 1 : 0 
                })
            }
            return acc
        }, [])
        const performanceData = sellers.map(seller => ({
            name: seller.fullName,
            revenue: seller.totalRevenue || 0,
            earnings: seller.stats?.totalEarnings || 0,
            products: seller.totalProducts || 0,
            sales: seller.totalSales || 0,
            rating: seller.stats?.averageRating || 0,
            profileViews: seller.stats?.profileViews || 0,
            commission: seller.commissionOffer?.rate || 0
        }))
        return {
            sellers,
            topSellers,
            pagination,
            metrics: {
                totalSellers,
                activeSellers,
                verifiedSellers,
                totalRevenue,
                totalEarnings,
                totalProducts,
                totalSales,
                totalProfileViews,
                totalReviews,
                avgRevenue: totalSellers > 0 ? totalRevenue / totalSellers : 0,
                avgEarnings: totalSellers > 0 ? totalEarnings / totalSellers : 0,
                verificationRate: totalSellers > 0 ? (verifiedSellers / totalSellers) * 100 : 0,
                activeRate: totalSellers > 0 ? (activeSellers / totalSellers) * 100 : 0
            },
            nichesData,
            toolsData,
            verificationStatusData,
            commissionRates,
            countryData,
            payoutMethods,
            performanceData,
            hasData: totalSellers > 0
        }
    }, [analyticsData])
    const isLoading = loading || parentLoading
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12">
                <div className="text-red-400 mb-4 flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Failed to load seller analytics
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
    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <LoadingCard key={i} />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LoadingCard />
                    <LoadingCard />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <LoadingCard />
                    <LoadingCard />
                    <LoadingCard />
                </div>
            </div>
        )
    }
    if (!processedData || !processedData.hasData) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Seller Analytics</h2>
                        <p className="text-gray-400">No seller data available</p>
                    </div>
                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
                <EmptyStateCard
                    title="No Sellers Found"
                    description="Once sellers join your platform, their analytics will appear here."
                    icon={Users}
                />
            </div>
        )
    }
    const { 
        sellers, 
        topSellers, 
        metrics, 
        nichesData, 
        toolsData, 
        verificationStatusData, 
        commissionRates, 
        countryData, 
        payoutMethods, 
        performanceData 
    } = processedData
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Seller Analytics</h2>
                    <p className="text-gray-400">
                        {metrics.totalSellers} sellers • {formatCurrency(metrics.totalRevenue)} total revenue
                    </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Sellers"
                    value={metrics.totalSellers}
                    icon={Users}
                    trend={`${metrics.activeRate.toFixed(1)}% active`}
                    subtitle={`${metrics.verifiedSellers} verified`}
                />
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(metrics.totalRevenue)}
                    icon={DollarSign}
                    trend={`Avg: ${formatCurrency(metrics.avgRevenue)}`}
                    subtitle="Platform revenue"
                />
                <MetricCard
                    title="Total Products"
                    value={metrics.totalProducts}
                    icon={Package}
                    trend={`${metrics.totalSales} total sales`}
                    subtitle="Listed products"
                />
                <MetricCard
                    title="Profile Views"
                    value={formatNumber(metrics.totalProfileViews)}
                    icon={Eye}
                    trend={`${formatNumber(metrics.totalReviews)} reviews`}
                    subtitle="Total engagement"
                />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartCard
                    title="Seller Performance"
                    icon={BarChart3}
                    subtitle="Revenue comparison between sellers"
                    height={350}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#9CA3AF" 
                                fontSize={12}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis 
                                stroke="#9CA3AF" 
                                fontSize={12} 
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                                labelStyle={{ color: '#F3F4F6' }}
                                formatter={(value, name) => [
                                    name === 'revenue' ? formatCurrency(value) : value,
                                    name
                                ]}
                            />
                            <Bar dataKey="revenue" fill="#00FF89" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
                {verificationStatusData.length > 0 && (
                    <ChartCard
                        title="Verification Status"
                        icon={CheckCircle}
                        subtitle="Seller verification breakdown"
                        height={350}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={verificationStatusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="count">
                                    {verificationStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                    formatter={(value, name) => [`${value} sellers`, name]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {nichesData.length > 0 && (
                    <ChartCard
                        title="Popular Niches"
                        icon={Target}
                        subtitle="Seller specialization trends"
                        height={350}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={nichesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#9CA3AF" 
                                    fontSize={12}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                    formatter={(value, name) => [
                                        name === 'count' ? `${value} sellers` : formatCurrency(value),
                                        name === 'count' ? 'Sellers' : 'Revenue'
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#00FF89"
                                    strokeWidth={3}
                                    dot={{ fill: '#00FF89', strokeWidth: 2, r: 6 }}
                                    activeDot={{ r: 8 }}
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
                {toolsData.length > 0 && (
                    <ChartCard
                        title="Tool Specializations"
                        icon={Zap}
                        subtitle="Popular automation tools"
                        height={350}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={toolsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#9CA3AF" 
                                    fontSize={12}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                    formatter={(value) => [`${value} sellers`, 'Count']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#8B5CF6"
                                    strokeWidth={3}
                                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                                    activeDot={{ r: 8 }}
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {commissionRates.length > 0 && (
                    <ChartCard
                        title="Commission Rates"
                        icon={CreditCard}
                        subtitle="Distribution of commission rates"
                        height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={commissionRates}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                    formatter={(value) => [`${value} sellers`, 'Count']}
                                />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
                {countryData.length > 0 && (
                    <ChartCard
                        title="Geographic Distribution"
                        icon={Globe}
                        subtitle="Sellers by country"
                        height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={countryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="count">
                                    {countryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                    formatter={(value, name) => [`${value} sellers`, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
                {payoutMethods.length > 0 && (
                    <ChartCard
                        title="Payout Methods"
                        icon={CreditCard}
                        subtitle="Preferred payment methods"
                        height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={payoutMethods}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                    formatter={(value, name) => [
                                        `${value} ${name === 'count' ? 'sellers' : 'verified'}`,
                                        name === 'count' ? 'Using Method' : 'Verified'
                                    ]}
                                />
                                <Bar dataKey="count" fill="#00FF89" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="verified" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>
            {topSellers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="w-5 h-5 text-[#00FF89]" />
                        <h3 className="text-lg font-semibold text-white">Top Performing Sellers</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topSellers.map((seller, index) => (
                            <SellerCard key={seller._id} seller={seller} rank={index + 1} />
                        ))}
                    </div>
                </motion.div>
            )}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-5 h-5 text-[#00FF89]" />
                    <h3 className="text-lg font-semibold text-white">Detailed Seller Metrics</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-3 text-gray-400 font-medium">Seller</th>
                                <th className="text-right py-3 text-gray-400 font-medium">Revenue</th>
                                <th className="text-right py-3 text-gray-400 font-medium">Products</th>
                                <th className="text-right py-3 text-gray-400 font-medium">Sales</th>
                                <th className="text-right py-3 text-gray-400 font-medium">Rating</th>
                                <th className="text-right py-3 text-gray-400 font-medium">Commission</th>
                                <th className="text-right py-3 text-gray-400 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellers.map((seller, index) => (
                                <tr key={seller._id} className="border-b border-gray-800/50 hover:bg-gray-700/20">
                                    <td className="py-3">
                                        <div>
                                            <div className="font-medium text-white">{seller.fullName}</div>
                                            <div className="text-xs text-gray-400">{seller.email}</div>
                                        </div>
                                    </td>
                                    <td className="py-3 text-right text-white">{formatCurrency(seller.totalRevenue)}</td>
                                    <td className="py-3 text-right text-white">{seller.totalProducts}</td>
                                    <td className="py-3 text-right text-white">{seller.totalSales}</td>
                                    <td className="py-3 text-right text-white">
                                        {seller.stats?.averageRating ? `${seller.stats.averageRating}/5` : 'N/A'}
                                    </td>
                                    <td className="py-3 text-right text-white">{seller.commissionOffer?.rate || 0}%</td>
                                    <td className="py-3 text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            seller.verification?.status === 'approved' 
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : seller.verification?.status === 'pending'
                                                ? 'bg-amber-500/10 text-amber-400'
                                                : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                            {seller.verification?.status || 'pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
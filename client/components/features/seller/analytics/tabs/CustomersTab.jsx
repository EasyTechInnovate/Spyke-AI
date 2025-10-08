'use client'
import { useState, useEffect, useMemo } from 'react'
import { Users, User, DollarSign, TrendingUp, TrendingDown, RefreshCw, AlertCircle, Calendar, Heart, Crown, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts'
import analyticsAPI from '@/lib/api/analytics'
import { AnalyticsLoadingScreen } from '../AnalyticsLoadingScreen'
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
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    })
}
const CustomerCard = ({ customer, index, rank }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-gray-800 rounded-lg p-6 hover:border-gray-600 transition-colors border border-gray-700">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                {rank && rank <= 3 && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        rank === 2 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                        'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                    }`}>
                        #{rank}
                    </div>
                )}
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                    {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                        <User className="w-6 h-6 text-emerald-400" />
                    )}
                </div>
                <div>
                    <h3 className="text-white font-semibold">{customer.name || 'Anonymous Customer'}</h3>
                </div>
            </div>
            {rank && rank <= 3 && (
                <Crown className={`w-5 h-5 ${
                    rank === 1 ? 'text-yellow-400' :
                    rank === 2 ? 'text-gray-300' :
                    'text-amber-400'
                }`} />
            )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
                <div className="text-white font-bold text-lg">{formatNumber(customer.totalPurchases || 0)}</div>
                <div className="text-gray-400 text-xs">Purchases</div>
            </div>
            <div className="text-center">
                <div className="text-emerald-400 font-bold text-lg">{formatCurrency(customer.totalSpent || 0)}</div>
                <div className="text-gray-400 text-xs">Total Spent</div>
            </div>
            <div className="text-center">
                <div className="text-white font-bold text-lg">{formatCurrency(customer.avgOrderValue || 0)}</div>
                <div className="text-gray-400 text-xs">Avg Order</div>
            </div>
            <div className="text-center">
                <div className="text-white font-bold text-lg">{customer.customerLifetime || 0}</div>
                <div className="text-gray-400 text-xs">Days Active</div>
            </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
                First: {customer.firstPurchase ? formatDate(customer.firstPurchase) : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">
                Last: {customer.lastPurchase ? formatDate(customer.lastPurchase) : 'N/A'}
            </div>
        </div>
    </motion.div>
)
const AcquisitionChart = ({ acquisitionTrend }) => {
    const chartData = useMemo(() => {
        if (!acquisitionTrend?.length) return []
        return acquisitionTrend.map((day) => ({
            date: day._id?.date ? new Date(day._id.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
            newCustomers: day.newCustomers || 0
        }))
    }, [acquisitionTrend])
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Customer Acquisition Trend
            </h3>
            <div className="h-64 relative">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <YAxis
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
                                                <p className="text-sm font-medium text-emerald-400">
                                                    {payload[0].value} new customers
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="newCustomers"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ fill: '#10B981', r: 5 }}
                                activeDot={{ r: 8, fill: '#10B981' }}
                                name="New Customers"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                            <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No acquisition data</p>
                            <p className="text-sm mt-1">Customer acquisition trends will appear here</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default function CustomersTab({ timeRange = '30d' }) {
    const [customerData, setCustomerData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const fetchCustomerData = async (silent = false) => {
        try {
            if (!silent) setLoading(true)
            if (silent) setRefreshing(true)
            setError(null)
            const data = await analyticsAPI.seller.getCustomers({ 
                page: currentPage, 
                limit: 20 
            })
            setCustomerData(data)
        } catch (err) {
            console.error('Error fetching customer data:', err)
            setError(err.message || 'Failed to load customer analytics')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }
    useEffect(() => {
        fetchCustomerData()
    }, [currentPage, timeRange])
    const customerInsights = useMemo(() => {
        if (!customerData) {
            return {
                totalCustomers: 0,
                avgCustomerValue: 0,
                repeatCustomers: 0,
                repeatRate: 0
            }
        }
        const totalCustomers = customerData.pagination?.totalCount || 0
        const customers = customerData.customers || []
        const totalSpent = customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0)
        const avgCustomerValue = customers.length > 0 ? totalSpent / customers.length : 0
        const repeatCustomers = customers.filter(customer => (customer.totalPurchases || 0) > 1).length
        const repeatRate = customers.length > 0 ? (repeatCustomers / customers.length) * 100 : 0
        return {
            totalCustomers, 
            avgCustomerValue, 
            repeatCustomers, 
            repeatRate 
        }
    }, [customerData])
    const topCustomers = useMemo(() => {
        if (!customerData?.customers?.length) return []
        return [...customerData.customers]
            .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
            .slice(0, 5)
    }, [customerData])
    const handleRefresh = () => {
        fetchCustomerData(true)
    }
    if (loading && !customerData) {
        return <AnalyticsLoadingScreen variant="customers" />
    }
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
                    <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Customer Data</h3>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => fetchCustomerData()}
                        className="px-6 py-3 bg-[#00FF89] text-black font-medium rounded-xl hover:bg-[#00E67A] transition-colors">
                        Try Again
                    </button>
                </motion.div>
            </div>
        )
    }
    if (!customerData?.customers?.length) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Customer Data Yet</h3>
                    <p className="text-gray-400 mb-6">Your customer analytics will appear here once you start making sales</p>
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Customer Analytics</h2>
                    <p className="text-gray-400 mt-1">Track your customer base and engagement</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-600 transition-colors disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Customers</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(customerInsights.totalCustomers)}</div>
                    <div className="text-sm text-emerald-400">All time</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Avg Customer Value</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(customerInsights.avgCustomerValue)}</div>
                    <div className="text-sm text-gray-400">Per customer</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Repeat Customers</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Heart className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(customerInsights.repeatCustomers)}</div>
                    <div className="text-sm text-gray-400">Multiple purchases</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Repeat Rate</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            {customerInsights.repeatRate >= 50 ? (
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                        </div>
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${customerInsights.repeatRate >= 50 ? 'text-emerald-400' : 'text-white'}`}>
                        {customerInsights.repeatRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Customer loyalty</div>
                </motion.div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}>
                <AcquisitionChart acquisitionTrend={customerData.acquisitionTrend} />
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-400" />
                                All Customers ({formatNumber(customerInsights.totalCustomers)})
                            </h3>
                            <div className="text-sm text-gray-400">
                                Showing {customerData.customers.length} of {customerInsights.totalCustomers}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {customerData.customers.map((customer, index) => {
                                const sortedCustomers = [...customerData.customers].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
                                const rank = sortedCustomers.findIndex(c => c.userId === customer.userId) + 1
                                const isTopCustomer = rank <= 3
                                return (
                                    <motion.div
                                        key={customer.userId || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-gray-700/50 rounded-lg p-5 hover:bg-gray-700 transition-colors border ${
                                            isTopCustomer ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-600'
                                        }`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {isTopCustomer && (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                        rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                        rank === 2 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                                                        'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                                                    }`}>
                                                        #{rank}
                                                    </div>
                                                )}
                                                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                                                    {customer.avatar ? (
                                                        <img src={customer.avatar} alt={customer.name} className="w-12 h-12 rounded-lg object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-emerald-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-white font-semibold">{customer.name || 'Anonymous Customer'}</h3>
                                                        {isTopCustomer && (
                                                            <Crown className={`w-4 h-4 ${
                                                                rank === 1 ? 'text-yellow-400' :
                                                                rank === 2 ? 'text-gray-300' :
                                                                'text-amber-400'
                                                            }`} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-emerald-400 font-bold text-lg">{formatCurrency(customer.totalSpent || 0)}</div>
                                                <div className="text-gray-400 text-sm">{customer.totalPurchases || 0} purchases</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-white font-bold">{formatNumber(customer.totalPurchases || 0)}</div>
                                                <div className="text-gray-400 text-xs">Purchases</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-emerald-400 font-bold">{formatCurrency(customer.totalSpent || 0)}</div>
                                                <div className="text-gray-400 text-xs">Total Spent</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-white font-bold">{formatCurrency(customer.avgOrderValue || 0)}</div>
                                                <div className="text-gray-400 text-xs">Avg Order</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-white font-bold">{customer.customerLifetime || 0}</div>
                                                <div className="text-gray-400 text-xs">Days Active</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                                            <div className="text-sm text-gray-400">
                                                First: {customer.firstPurchase ? formatDate(customer.firstPurchase) : 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                Last: {customer.lastPurchase ? formatDate(customer.lastPurchase) : 'N/A'}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                        {customerData.pagination && customerData.pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                                <div className="text-gray-400 text-sm">
                                    Page {customerData.pagination.currentPage} of {customerData.pagination.totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage <= 1}
                                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        Previous
                                    </button>
                                    <span className="px-3 py-2 bg-emerald-500 text-black font-medium rounded-lg">
                                        {currentPage}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(customerData.pagination.totalPages, currentPage + 1))}
                                        disabled={currentPage >= customerData.pagination.totalPages}
                                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            Quick Stats
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                <div className="text-gray-400 text-sm">Average Value</div>
                                <div className="text-white font-bold">{formatCurrency(customerInsights.avgCustomerValue)}</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                <div className="text-gray-400 text-sm">Repeat Rate</div>
                                <div className={`font-bold ${customerInsights.repeatRate >= 50 ? 'text-emerald-400' : 'text-white'}`}>
                                    {customerInsights.repeatRate.toFixed(1)}%
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                                <div className="text-gray-400 text-sm">Loyal Customers</div>
                                <div className="text-white font-bold">{formatNumber(customerInsights.repeatCustomers)}</div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            Value Tiers
                        </h3>
                        <div className="space-y-3">
                            {customerData.customers
                                .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
                                .map((customer, index) => {
                                    const isHighValue = (customer.totalSpent || 0) > 1000
                                    const isMediumValue = (customer.totalSpent || 0) > 500 && (customer.totalSpent || 0) <= 1000
                                    return (
                                        <div key={customer.userId || index} className="flex items-center gap-3 p-2">
                                            <div className={`w-3 h-3 rounded-full ${
                                                isHighValue ? 'bg-emerald-400' : 
                                                isMediumValue ? 'bg-yellow-400' : 'bg-gray-400'
                                            }`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white text-sm font-medium truncate">{customer.name}</div>
                                                <div className="text-gray-400 text-xs">{formatCurrency(customer.totalSpent || 0)}</div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                    <span>High Value ($1K+)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <span>Medium ($500-1K)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                    <span>Basic (&lt;$500)</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
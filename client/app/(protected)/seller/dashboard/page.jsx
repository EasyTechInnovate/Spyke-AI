'use client'

import { useState, useEffect, lazy, Suspense, memo } from 'react'
import Link from 'next/link'
import {
    DollarSign,
    Package,
    TrendingUp,
    Star,
    ShoppingCart,
    ArrowUpRight,
    Plus,
    CheckCircle,
    Target,
    Activity,
    Eye,
    Percent,
    Clock,
    TrendingDown,
    ExternalLink,
    RefreshCw,
    Download
} from 'lucide-react'
import sellerAPI from '@/lib/api/seller'
import DocumentUploadModal from '@/components/features/seller/SellerDocumentUpload'
import VerificationBadge from '@/components/features/seller/shared/VerificationBadge'
import CurrencySelector from '@/components/features/seller/dashboard/CurrencySelector'

const RevenueChart = lazy(() => import('@/components/features/seller/dashboard/RevenueChart'))
const PerformanceChart = lazy(() => import('@/components/features/seller/dashboard/PerformanceChart'))

const SkeletonCard = () => (
    <div
        className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6 animate-pulse"
        role="status"
        aria-label="Loading metric data">
        <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
            <div className="w-16 h-4 bg-gray-700 rounded"></div>
        </div>
        <div className="w-24 h-8 bg-gray-700 rounded mb-2"></div>
        <div className="w-32 h-4 bg-gray-700 rounded mb-1"></div>
        <div className="w-28 h-3 bg-gray-800 rounded"></div>
    </div>
)

const ProductCardSkeleton = () => (
    <div
        className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 animate-pulse"
        role="status"
        aria-label="Loading product data">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
            <div className="flex-1">
                <div className="w-32 h-5 bg-gray-700 rounded mb-2"></div>
                <div className="w-24 h-4 bg-gray-800 rounded"></div>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
            {Array(3)
                .fill(0)
                .map((_, i) => (
                    <div
                        key={i}
                        className="text-center">
                        <div className="w-12 h-8 bg-gray-700 rounded mb-1 mx-auto"></div>
                        <div className="w-16 h-4 bg-gray-800 rounded mx-auto"></div>
                    </div>
                ))}
        </div>
    </div>
)

const MetricCard = ({ icon: Icon, value, label, trend, color = 'emerald', showTrend = true, subtitle, isLoading = false, onClick }) => {
    const colorClasses = {
        emerald: 'from-[#00FF89]/20 to-[#00FF89]/5 border-[#00FF89]/30 text-[#00FF89]',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
        orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400'
    }

    if (isLoading) {
        return <SkeletonCard />
    }

    const trendValue = parseFloat(trend)
    const isPositiveTrend = trendValue > 0

    return (
        <article
            className={`bg-[#1f1f1f] border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-gray-700 focus-within:border-[#00FF89] focus-within:ring-2 focus-within:ring-[#00FF89]/20 transition-all duration-200 group ${
                onClick ? 'cursor-pointer hover:scale-[1.02] transform' : ''
            }`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={
                onClick
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onClick()
                          }
                      }
                    : undefined
            }>
            <header className="flex items-start justify-between mb-3 sm:mb-4">
                <div
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}
                    aria-hidden="true">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                {showTrend && trend && (
                    <div
                        className="flex items-center gap-1 text-xs"
                        title={`${isPositiveTrend ? 'Increase' : 'Decrease'} of ${Math.abs(trendValue)}%`}>
                        {isPositiveTrend ? (
                            <TrendingUp
                                className="w-3 h-3 text-[#00FF89]"
                                aria-hidden="true"
                            />
                        ) : (
                            <TrendingDown
                                className="w-3 h-3 text-red-400"
                                aria-hidden="true"
                            />
                        )}
                        <span
                            className={`font-medium ${isPositiveTrend ? 'text-[#00FF89]' : 'text-red-400'}`}
                            aria-label={`${isPositiveTrend ? 'Positive' : 'Negative'} trend of ${Math.abs(trendValue)} percent`}>
                            {isPositiveTrend ? '+' : ''}
                            {trend}%
                        </span>
                    </div>
                )}
            </header>
            <div>
                <p
                    className="text-xl sm:text-2xl font-bold text-white mb-1"
                    aria-label={`${label}: ${value}`}>
                    {value}
                </p>
                <p className="text-sm text-gray-300">{label}</p>
                {subtitle && (
                    <p
                        className="text-xs text-gray-400 mt-1"
                        role="note">
                        {subtitle}
                    </p>
                )}
            </div>
        </article>
    )
}

// Enhanced Product Performance Card with accessibility
const ProductCard = ({ product, index, isLoading = false }) => {
    const getTypeColor = (type) => {
        const colors = {
            prompt: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            agent: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            automation: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        }
        return colors[type] || colors.prompt
    }

    const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString()}`

    if (isLoading) {
        return <ProductCardSkeleton />
    }

    return (
        <article className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-gray-700 focus-within:border-[#00FF89] focus-within:ring-2 focus-within:ring-[#00FF89]/20 transition-all duration-200 group">
            <header className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#00FF89]/20 to-blue-500/20 rounded-lg border border-[#00FF89]/30 flex items-center justify-center text-[#00FF89] font-bold text-base sm:text-lg flex-shrink-0"
                    aria-label={`Rank ${index + 1}`}>
                    #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base sm:text-lg group-hover:text-[#00FF89] transition-colors line-clamp-1">
                        {product.title}
                    </h3>
                    <div
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2"
                        role="group"
                        aria-label="Product details">
                        <span
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium border ${getTypeColor(product.type)} w-fit`}>
                            {product.type}
                        </span>
                        <span
                            className="text-sm text-gray-300"
                            aria-label={`Price: ${formatCurrency(product.price)}`}>
                            {formatCurrency(product.price)}
                        </span>
                    </div>
                </div>
            </header>

            <div
                className="grid grid-cols-3 gap-3 sm:gap-6"
                role="group"
                aria-label="Product metrics">
                <div className="text-center">
                    <p
                        className="text-[#00FF89] font-bold text-lg sm:text-2xl mb-1"
                        aria-label={`${product.sales} sales`}>
                        {product.sales}
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm">Sales</p>
                </div>
                <div className="text-center">
                    <p
                        className="text-blue-400 font-bold text-lg sm:text-2xl mb-1"
                        aria-label={`${product.views} views`}>
                        {product.views}
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm">Views</p>
                </div>
                <div className="text-center">
                    <p
                        className="text-purple-400 font-bold text-lg sm:text-2xl mb-1"
                        aria-label={`${product.conversionRate}% conversion rate`}>
                        {product.conversionRate}%
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm">Conv. Rate</p>
                </div>
            </div>
        </article>
    )
}

// Mobile-friendly Order Card for responsive tables
const OrderCard = ({ order }) => {
    const getStatusColor = (status) => {
        const colors = {
            completed: 'bg-[#00FF89]/10 text-[#00FF89] border-[#00FF89]/20',
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
        }
        return colors[status] || colors.pending
    }

    const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString()}`

    return (
        <article className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
            <header className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-semibold text-white text-sm">#{order.orderId}</h4>
                    <p className="text-xs text-gray-400 mt-1">{order.formattedDate}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(order.status)}`}>{order.status}</span>
            </header>

            <div className="space-y-2">
                <div>
                    <p className="text-sm font-medium text-white line-clamp-1">{order.productTitle}</p>
                    <p className="text-xs text-gray-400">{order.productType}</p>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{order.buyerName || order.buyerEmail?.split('@')[0] || 'Anonymous'}</span>
                    <span className="text-sm font-bold text-[#00FF89]">{formatCurrency(order.price)}</span>
                </div>
            </div>
        </article>
    )
}

// Enhanced Recent Orders Table with mobile responsiveness
const RecentOrdersTable = ({ orders, isLoading = false }) => {
    // ...existing code for color functions...
    const getStatusColor = (status) => {
        const colors = {
            completed: 'bg-[#00FF89]/10 text-[#00FF89] border-[#00FF89]/20',
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
        }
        return colors[status] || colors.pending
    }

    const getTypeColor = (type) => {
        const colors = {
            prompt: 'text-blue-400',
            agent: 'text-purple-400',
            automation: 'text-orange-400'
        }
        return colors[type] || colors.prompt
    }

    const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString()}`

    if (isLoading) {
        return (
            <section
                className="bg-[#1f1f1f] border border-gray-800 rounded-2xl overflow-hidden"
                aria-labelledby="orders-heading">
                <header className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-xl animate-pulse"></div>
                        <div>
                            <div className="w-32 h-6 bg-gray-700 rounded mb-2 animate-pulse"></div>
                            <div className="w-48 h-4 bg-gray-800 rounded animate-pulse"></div>
                        </div>
                    </div>
                </header>
                <div className="p-6 space-y-4">
                    {Array(3)
                        .fill(0)
                        .map((_, i) => (
                            <div
                                key={i}
                                className="h-16 bg-gray-800 rounded animate-pulse"></div>
                        ))}
                </div>
            </section>
        )
    }

    if (!orders || orders.length === 0) {
        return (
            <section
                className="bg-[#1f1f1f] border border-gray-800 rounded-2xl"
                aria-labelledby="orders-heading">
                <header className="p-6 border-b border-gray-800">
                    {/* ...existing header code... */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2
                                    id="orders-heading"
                                    className="text-xl font-bold text-white">
                                    Recent Orders
                                </h2>
                                <p className="text-gray-400">Your latest transactions</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="text-center py-12 px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Your recent orders will appear here once customers start purchasing your products.
                    </p>
                    <Link
                        href="/seller/products/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/20">
                        <Plus className="w-5 h-5" />
                        Create Your First Product
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section
            className="bg-[#1f1f1f] border border-gray-800 rounded-2xl overflow-hidden"
            aria-labelledby="orders-heading">
            <header className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                            <Clock className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2
                                id="orders-heading"
                                className="text-xl font-bold text-white">
                                Recent Orders
                            </h2>
                            <p className="text-gray-400">Your latest transactions</p>
                        </div>
                    </div>
                    <Link
                        href="/seller/orders"
                        className="flex items-center gap-2 px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[44px]">
                        View All
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            {/* Mobile View */}
            <div className="block lg:hidden p-4">
                <div
                    className="space-y-4"
                    role="list"
                    aria-label="Recent orders list">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            role="listitem">
                            <OrderCard order={order} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
                <table
                    className="w-full"
                    role="table"
                    aria-label="Recent orders table">
                    <thead className="bg-[#121212] border-b border-gray-800">
                        <tr className="text-left">
                            <th
                                scope="col"
                                className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Order
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Product
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Customer
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Amount
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Date
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-4 text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="hover:bg-[#121212]/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">#{order.orderId}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <div className="text-sm font-medium text-white line-clamp-1">{order.productTitle}</div>
                                            <div className={`text-xs font-medium ${getTypeColor(order.productType)}`}>{order.productType}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{order.buyerName || order.buyerEmail?.split('@')[0] || 'Anonymous'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-[#00FF89]">{formatCurrency(order.price)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{order.formattedDate}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

// Enhanced Alert Component with better accessibility
const Alert = ({ type = 'info', title, children, action, onDismiss }) => {
    const styles = {
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
        success: 'bg-[#00FF89]/10 border-[#00FF89]/30 text-[#00FF89]',
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-100'
    }

    const icons = {
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️'
    }

    return (
        <div
            className={`rounded-2xl border p-6 ${styles[type]}`}
            role="alert"
            aria-live="polite"
            aria-labelledby={`alert-title-${type}`}>
            <div className="flex items-start gap-4">
                <div
                    className="text-xl"
                    aria-hidden="true">
                    {icons[type]}
                </div>
                <div className="flex-1">
                    <h3
                        id={`alert-title-${type}`}
                        className="font-semibold mb-2">
                        {title}
                    </h3>
                    <div className="mb-4">{children}</div>
                    <div className="flex items-center gap-3">
                        {action}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent rounded"
                                aria-label="Dismiss alert">
                                Dismiss
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Chart Loading Component
const ChartLoading = ({ height = 'h-80' }) => (
    <div
        className={`${height} bg-[#1f1f1f] border border-gray-800 rounded-2xl flex items-center justify-center`}
        role="status"
        aria-label="Loading chart">
        <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-[#00FF89] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chart...</p>
        </div>
    </div>
)

// Memoized components for better performance
const MemoizedMetricCard = memo(MetricCard)
const MemoizedProductCard = memo(ProductCard)
const MemoizedRecentOrdersTable = memo(RecentOrdersTable)

export default function SellerDashboard() {
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState(null)
    const [sellerProfile, setSellerProfile] = useState(null)
    const [selectedCurrency, setSelectedCurrency] = useState('USD')
    const [showDocumentUpload, setShowDocumentUpload] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)
    const [realTimeData, setRealTimeData] = useState(null)

    useEffect(() => {
        loadDashboardData()
        
        // Set up real-time updates every 30 seconds
        const interval = setInterval(() => {
            loadDashboardData(true) // Silent refresh
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const loadDashboardData = async (silent = false) => {
        try {
            if (!silent) {
                setRefreshing(true)
                setLoading(true)
            }
            setError(null)

            // Load real-time data from APIs
            const [profile, dashboard] = await Promise.all([
                sellerAPI.getProfile(),
                sellerAPI.getDashboard()
            ])

            // Process real-time data from dashboard response
            const processedData = {
                ...dashboard,
                realTimeMetrics: {
                    views: dashboard?.analytics?.views || 0,
                    sales: dashboard?.totalOrders || 0,
                    revenue: dashboard?.totalEarnings || 0,
                    conversionRate: parseFloat(dashboard?.analytics?.conversionRate || 0)
                },
                // Generate time-series data for charts from real data
                chartData: {
                    revenue: generateRevenueData(dashboard?.recentOrders || []),
                    performance: generatePerformanceData(dashboard?.topProducts || [])
                }
            }

            setSellerProfile(profile)
            setDashboardData(processedData)
            setRealTimeData(processedData.realTimeMetrics)
        } catch (error) {
            console.error('Dashboard load error:', error)
            if (!silent) {
                setError('Failed to load dashboard data. Please try again.')
            }
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    // Generate real revenue data from orders
    const generateRevenueData = (orders) => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            return {
                date: date.toISOString().split('T')[0],
                revenue: 0,
                orders: 0
            }
        })

        orders.forEach(order => {
            try {
                // Use orderDate field from API response, with fallbacks
                const orderDateString = order.orderDate || order.createdAt || order.date
                if (!orderDateString) return
                
                const orderDate = new Date(orderDateString)
                
                // Validate date is valid
                if (isNaN(orderDate.getTime())) return
                
                const orderDateFormatted = orderDate.toISOString().split('T')[0]
                const dayData = last30Days.find(day => day.date === orderDateFormatted)
                
                if (dayData) {
                    dayData.revenue += parseFloat(order.price || order.totalAmount || 0)
                    dayData.orders += 1
                }
            } catch (error) {
                console.warn('Error processing order date:', error, order)
                // Continue processing other orders if one fails
            }
        })

        return last30Days
    }

    // Generate real performance data from products
    const generatePerformanceData = (products) => {
        return products.map(product => {
            try {
                const views = parseInt(product.views) || 0
                const sales = parseInt(product.sales) || 0
                const price = parseFloat(product.price) || 0
                
                return {
                    name: product.title || 'Untitled Product',
                    views: views,
                    sales: sales,
                    revenue: price * sales,
                    conversionRate: views > 0 ? parseFloat(((sales / views) * 100).toFixed(1)) : 0
                }
            } catch (error) {
                console.warn('Error processing product data:', error, product)
                return {
                    name: product.title || 'Untitled Product',
                    views: 0,
                    sales: 0,
                    revenue: 0,
                    conversionRate: 0
                }
            }
        })
    }

    const handleRefresh = () => {
        loadDashboardData(true)
    }

    const formatCurrency = (amount) => {
        const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
        return `${symbols[selectedCurrency] || '$'}${Number(amount || 0).toLocaleString()}`
    }

    const isApproved = sellerProfile?.verification?.status === 'approved' && sellerProfile?.commissionOffer?.status === 'accepted'

    // Enhanced loading state with better UX
    if (loading) {
        return (
            <div
                className="min-h-screen bg-[#121212] flex items-center justify-center"
                role="status"
                aria-live="polite">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-[#00FF89] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your dashboard...</p>
                    <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => loadDashboardData()}
                        className="px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/20">
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            {/* Mobile-optimized container with proper padding */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Mobile-first Header */}
                <header
                    className="mb-6 sm:mb-8"
                    role="banner">
                    <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:gap-6">
                        {/* Title section - stacked on mobile */}
                        <div className="min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3 mb-3 sm:mb-2">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight mb-2 sm:mb-0">
                                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
                                    <br className="sm:hidden" />
                                    <span className="sm:ml-2">{sellerProfile?.fullName?.split(' ')[0] || 'Seller'}</span>
                                </h1>
                                <div className="flex-shrink-0">
                                    <VerificationBadge status={sellerProfile?.verification?.status} />
                                </div>
                            </div>
                            <p className="text-base sm:text-lg text-gray-300 mb-2 leading-relaxed">
                                {isApproved ? 'Manage your business and track performance' : 'Complete setup to start selling'}
                            </p>
                            {dashboardData?.summary?.memberSince && (
                                <p className="text-sm text-gray-400">
                                    Member since{' '}
                                    {new Date(dashboardData.summary.memberSince).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>

                        {/* Action buttons - responsive layout */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                            {isApproved && (
                                <div className="flex gap-2 sm:gap-3">
                                    <button
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[44px] disabled:opacity-50 flex-1 sm:flex-initial"
                                        aria-label="Refresh dashboard data">
                                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        <span className="sm:hidden">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                                        <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                                    </button>

                                    <div className="flex-1 sm:flex-initial">
                                        <CurrencySelector
                                            value={selectedCurrency}
                                            onChange={setSelectedCurrency}
                                        />
                                    </div>
                                </div>
                            )}
                            <Link
                                href={isApproved ? '/seller/products/create' : '/seller/profile'}
                                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] min-h-[44px] text-center ${
                                    isApproved
                                        ? 'bg-[#00FF89] text-black hover:bg-[#00FF89]/90 focus:ring-[#00FF89]/50'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50'
                                }`}>
                                <Plus className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate">{isApproved ? 'Add Product' : 'Complete Setup'}</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Mobile-optimized Alerts */}
                <div
                    className="space-y-3 sm:space-y-4 mb-6 sm:mb-8"
                    role="region"
                    aria-label="Important notifications">
                    {/* Commission Offer Alert */}
                    {sellerProfile?.verification?.status === 'commission_offered' && sellerProfile?.commissionOffer?.status !== 'accepted' && (
                        <div
                            className="rounded-2xl border p-4 sm:p-6 bg-[#00FF89]/10 border-[#00FF89]/30 text-[#00FF89]"
                            role="alert"
                            aria-live="polite">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div
                                    className="text-lg sm:text-xl flex-shrink-0"
                                    aria-hidden="true">
                                    ✅
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Commission Offer Available</h3>
                                    <p className="mb-3 sm:mb-4 text-sm leading-relaxed">
                                        We've offered you a {sellerProfile?.commissionOffer?.rate}% commission rate. Accept to start selling!
                                    </p>
                                    <Link
                                        href="/seller/profile"
                                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/20 min-h-[44px] text-sm">
                                        Review Offer ({sellerProfile?.commissionOffer?.rate}%)
                                        <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Orders Alert */}
                    {dashboardData?.pendingOrders > 0 && (
                        <div
                            className="rounded-2xl border p-4 sm:p-6 bg-amber-500/10 border-amber-500/30 text-amber-100"
                            role="alert"
                            aria-live="polite">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div
                                    className="text-lg sm:text-xl flex-shrink-0"
                                    aria-hidden="true">
                                    ⚠️
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Pending Orders Require Attention</h3>
                                    <p className="mb-3 sm:mb-4 text-sm leading-relaxed">
                                        You have {dashboardData.pendingOrders} {dashboardData.pendingOrders === 1 ? 'order' : 'orders'} waiting for
                                        fulfillment.
                                    </p>
                                    <Link
                                        href="/seller/orders?status=pending"
                                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[44px] text-sm">
                                        Process {dashboardData.pendingOrders} Orders
                                        <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {isApproved ? (
                    /* Mobile-optimized Approved Seller Dashboard */
                    <>
                        {/* Mobile-first Performance Metrics */}
                        <section
                            className="mb-6 sm:mb-8"
                            aria-labelledby="metrics-heading">
                            <h2
                                id="metrics-heading"
                                className="sr-only">
                                Performance Metrics
                            </h2>

                            {/* Primary metrics - 1 column on mobile, 2 on tablet, 4 on desktop */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                                <MemoizedMetricCard
                                    icon={DollarSign}
                                    value={formatCurrency(dashboardData?.totalEarnings || 0)}
                                    label="Total Revenue"
                                    trend={dashboardData?.performance?.revenueGrowth}
                                    color="emerald"
                                    subtitle={`${formatCurrency(dashboardData?.performance?.revenueThisMonth || 0)} this month`}
                                    isLoading={loading}
                                />
                                <MemoizedMetricCard
                                    icon={ShoppingCart}
                                    value={dashboardData?.totalOrders || 0}
                                    label="Total Orders"
                                    color="blue"
                                    showTrend={false}
                                    subtitle={`${dashboardData?.performance?.salesThisMonth || 0} this month`}
                                    isLoading={loading}
                                />
                                <MemoizedMetricCard
                                    icon={Package}
                                    value={dashboardData?.totalProducts || 0}
                                    label="Active Products"
                                    color="purple"
                                    showTrend={false}
                                    subtitle={`${dashboardData?.completedOrders || 0} completed orders`}
                                    isLoading={loading}
                                />
                                <MemoizedMetricCard
                                    icon={DollarSign}
                                    value={formatCurrency(dashboardData?.performance?.averageOrderValue || 0)}
                                    label="Avg Order Value"
                                    color="amber"
                                    showTrend={false}
                                    subtitle={`${dashboardData?.summary?.commissionRate || 0}% commission rate`}
                                    isLoading={loading}
                                />
                            </div>

                            {/* Secondary Metrics - same responsive grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                                <MemoizedMetricCard
                                    icon={Eye}
                                    value={dashboardData?.analytics?.views || 0}
                                    label="Profile Views"
                                    color="blue"
                                    showTrend={false}
                                    subtitle={`${dashboardData?.performance?.profileViews || 0} this month`}
                                    isLoading={loading}
                                />
                                <MemoizedMetricCard
                                    icon={ShoppingCart}
                                    value={dashboardData?.analytics?.carts || 0}
                                    label="Added to Cart"
                                    color="orange"
                                    showTrend={false}
                                    isLoading={loading}
                                />
                                <MemoizedMetricCard
                                    icon={Percent}
                                    value={`${dashboardData?.analytics?.conversionRate || 0}%`}
                                    label="Conversion Rate"
                                    color="purple"
                                    showTrend={false}
                                    isLoading={loading}
                                />
                                <MemoizedMetricCard
                                    icon={Star}
                                    value={`${(dashboardData?.averageRating || 0).toFixed(1)}`}
                                    label="Average Rating"
                                    color="amber"
                                    showTrend={false}
                                    isLoading={loading}
                                />
                            </div>
                        </section>

                        {/* Mobile-optimized Top Products */}
                        <section
                            className="mb-6 sm:mb-8"
                            aria-labelledby="top-products-heading">
                            {/* Mobile-friendly section header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30 flex-shrink-0">
                                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2
                                            id="top-products-heading"
                                            className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">
                                            Top Performing Products
                                        </h2>
                                        <p className="text-sm sm:text-base text-gray-400">Your best-selling products and their metrics</p>
                                    </div>
                                </div>

                                {dashboardData?.topProducts?.length > 3 && (
                                    <Link
                                        href="/seller/products"
                                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 min-h-[44px] w-full sm:w-auto">
                                        <span>View All Products</span>
                                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                    </Link>
                                )}
                            </div>

                            {/* Mobile-responsive product grid - 1 column on mobile, 2 on tablet, 3 on desktop */}
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                                role="list"
                                aria-label="Top performing products">
                                {dashboardData?.topProducts?.slice(0, 3).map((product, index) => (
                                    <div
                                        key={product.id}
                                        role="listitem">
                                        <MemoizedProductCard
                                            product={product}
                                            index={index}
                                            isLoading={loading}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Mobile-optimized Recent Orders */}
                        <section className="mb-6 sm:mb-8">
                            <MemoizedRecentOrdersTable
                                orders={dashboardData?.recentOrders || []}
                                isLoading={loading}
                            />
                        </section>

                        {/* Mobile-optimized Analytics Section */}
                        <section
                            className="mb-6 sm:mb-8"
                            aria-labelledby="analytics-heading">
                            {/* Mobile-friendly analytics header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-[#00FF89]/20 rounded-xl border border-[#00FF89]/30 flex-shrink-0">
                                        <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FF89]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2
                                            id="analytics-heading"
                                            className="text-xl sm:text-2xl font-bold text-white leading-tight mb-1">
                                            Performance Analytics
                                        </h2>
                                        <p className="text-sm sm:text-base text-gray-400">Track your business growth and optimize performance</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        /* TODO: Implement export functionality */
                                    }}
                                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#00FF89]/20 min-h-[44px] w-full sm:w-auto"
                                    title="Export analytics data">
                                    <Download className="w-4 h-4 flex-shrink-0" />
                                    <span>Export Data</span>
                                </button>
                            </div>

                            {/* Mobile-friendly charts container */}
                            <div className="space-y-6 sm:space-y-8">
                                {/* Revenue Chart - responsive container */}
                                <div className="w-full">
                                    <Suspense fallback={<ChartLoading height="h-64 sm:h-80" />}>
                                        <RevenueChart recentOrders={dashboardData?.recentOrders || []} />
                                    </Suspense>
                                </div>

                                {/* Performance Chart - responsive container */}
                                <div className="w-full">
                                    <Suspense fallback={<ChartLoading height="h-64 sm:h-80" />}>
                                        <PerformanceChart
                                            topProducts={dashboardData?.topProducts || []}
                                            allProducts={dashboardData?.allProducts || dashboardData?.topProducts || []}
                                        />
                                    </Suspense>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    /* Mobile-optimized Getting Started Section */
                    <main
                        className="max-w-2xl mx-auto text-center py-8 sm:py-12"
                        role="main">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#00FF89]/20 to-blue-500/20 rounded-2xl border border-[#00FF89]/30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-[#00FF89]" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">Welcome to Your Seller Journey</h2>
                        <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed px-4">
                            Complete your verification to start selling AI tools and earning revenue on our platform.
                        </p>

                        {/* Mobile-optimized Setup Progress */}
                        <div
                            className="space-y-3 sm:space-y-4 mb-6 sm:mb-8"
                            role="list"
                            aria-label="Setup progress steps">
                            <div
                                className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl bg-[#1f1f1f] border border-gray-800 text-left hover:border-gray-700 transition-colors"
                                role="listitem">
                                <div
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        sellerProfile?.completionPercentage >= 80
                                            ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                            : 'bg-gray-700 text-gray-400'
                                    }`}
                                    aria-label={`Step 1: ${sellerProfile?.completionPercentage >= 80 ? 'Completed' : 'Incomplete'}`}>
                                    {sellerProfile?.completionPercentage >= 80 ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : '1'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white text-base sm:text-lg mb-1">Complete Profile</h3>
                                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                        {sellerProfile?.completionPercentage || 0}% complete - Add your business information
                                    </p>
                                    <div className="mt-2 sm:mt-3 w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-[#00FF89] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${sellerProfile?.completionPercentage || 0}%` }}
                                            role="progressbar"
                                            aria-valuenow={sellerProfile?.completionPercentage || 0}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div
                                className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl bg-[#1f1f1f] border border-gray-800 text-left hover:border-gray-700 transition-colors"
                                role="listitem">
                                <div
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        sellerProfile?.verification?.status !== 'pending'
                                            ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                            : 'bg-gray-700 text-gray-400'
                                    }`}
                                    aria-label={`Step 2: ${sellerProfile?.verification?.status !== 'pending' ? 'Completed' : 'Incomplete'}`}>
                                    {sellerProfile?.verification?.status !== 'pending' ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : '2'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white text-base sm:text-lg mb-1">Submit for Review</h3>
                                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                        Upload verification documents and business proof
                                    </p>
                                </div>
                            </div>

                            <div
                                className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl bg-[#1f1f1f] border border-gray-800 text-left hover:border-gray-700 transition-colors"
                                role="listitem">
                                <div
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        isApproved ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30' : 'bg-gray-700 text-gray-400'
                                    }`}
                                    aria-label={`Step 3: ${isApproved ? 'Completed' : 'Incomplete'}`}>
                                    {isApproved ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : '3'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white text-base sm:text-lg mb-1">Start Selling</h3>
                                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">Create and publish your first AI product</p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile-optimized action buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                            <Link
                                href="/seller/profile"
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/20 min-h-[44px] flex items-center justify-center text-center">
                                Complete Setup
                            </Link>
                            <Link
                                href="/explore"
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/20 min-h-[44px] flex items-center justify-center text-center">
                                Explore Platform
                            </Link>
                        </div>
                    </main>
                )}
            </div>

            {/* Enhanced Document Upload Modal */}
            {showDocumentUpload && (
                <DocumentUploadModal
                    isOpen={showDocumentUpload}
                    onClose={() => setShowDocumentUpload(false)}
                    onSuccess={() => {
                        loadDashboardData()
                        setShowDocumentUpload(false)
                    }}
                />
            )}
        </div>
    )
}


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
    Download,
    Users,
    BarChart3
} from 'lucide-react'
import sellerAPI from '@/lib/api/seller'
import DocumentUploadModal from '@/components/features/seller/SellerDocumentUpload'
import VerificationBadge from '@/components/features/seller/shared/VerificationBadge'
import CurrencySelector from '@/components/features/seller/dashboard/CurrencySelector'
const RevenueChart = lazy(() => import('@/components/features/seller/dashboard/RevenueChart'))
const PerformanceChart = lazy(() => import('@/components/features/seller/dashboard/PerformanceChart'))
const LoadingSkeleton = ({ className = "h-4 bg-gray-700 rounded animate-pulse" }) => (
    <div className={className} />
)
const MetricCardSkeleton = () => (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
            <LoadingSkeleton className="w-12 h-12 bg-gray-700 rounded-xl" />
            <LoadingSkeleton className="w-16 h-4" />
        </div>
        <LoadingSkeleton className="w-24 h-8 mb-2" />
        <LoadingSkeleton className="w-32 h-4 mb-1" />
        <LoadingSkeleton className="w-28 h-3" />
    </div>
)
const ProductCardSkeleton = () => (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
            <LoadingSkeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1">
                <LoadingSkeleton className="w-32 h-5 mb-2" />
                <LoadingSkeleton className="w-24 h-4" />
            </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
                <div key={i} className="text-center">
                    <LoadingSkeleton className="w-12 h-8 mb-1 mx-auto" />
                    <LoadingSkeleton className="w-16 h-4 mx-auto" />
                </div>
            ))}
        </div>
    </div>
)
const ChartSkeleton = ({ height = "h-80" }) => (
    <div className={`${height} bg-[#1a1a1a] border border-gray-800 rounded-xl flex items-center justify-center`}>
        <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-[#00FF89] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading chart...</p>
        </div>
    </div>
)
const MetricCard = ({ 
    icon: Icon, 
    value, 
    label, 
    trend, 
    color = 'emerald', 
    subtitle, 
    isLoading = false,
    onClick 
}) => {
    const colorMap = {
        emerald: 'text-[#00FF89] border-[#00FF89]/30',
        blue: 'text-blue-400 border-blue-400/30',
        purple: 'text-purple-400 border-purple-400/30',
        amber: 'text-amber-400 border-amber-400/30',
        orange: 'text-orange-400 border-orange-400/30'
    }
    if (isLoading) return <MetricCardSkeleton />
    const trendValue = parseFloat(trend)
    const isPositive = trendValue > 0
    return (
        <div 
            className={`bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-black/50 border ${colorMap[color]}`}>
                    <Icon className={`w-6 h-6 ${colorMap[color].split(' ')[0]}`} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs">
                        {isPositive ? (
                            <TrendingUp className="w-3 h-3 text-[#00FF89]" />
                        ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className={isPositive ? 'text-[#00FF89]' : 'text-red-400'}>
                            {isPositive ? '+' : ''}{trend}%
                        </span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-2xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm text-gray-300">{label}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                )}
            </div>
        </div>
    )
}
const ProductCard = ({ product, index, isLoading = false }) => {
    const typeColors = {
        prompt: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        agent: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        automation: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    }
    const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString()}`
    if (isLoading) return <ProductCardSkeleton />
    return (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200 group">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#00FF89]/20 rounded-lg border border-[#00FF89]/30 flex items-center justify-center text-[#00FF89] font-bold text-lg">
                    #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg group-hover:text-[#00FF89] transition-colors line-clamp-1">
                        {product.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-md text-sm font-medium border ${typeColors[product.type] || typeColors.prompt}`}>
                            {product.type}
                        </span>
                        <span className="text-sm text-gray-300">
                            {formatCurrency(product.price)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                    <p className="text-[#00FF89] font-bold text-2xl mb-1">{product.sales}</p>
                    <p className="text-gray-300 text-sm">Sales</p>
                </div>
                <div className="text-center">
                    <p className="text-blue-400 font-bold text-2xl mb-1">{product.views}</p>
                    <p className="text-gray-300 text-sm">Views</p>
                </div>
                <div className="text-center">
                    <p className="text-purple-400 font-bold text-2xl mb-1">{product.conversionRate}%</p>
                    <p className="text-gray-300 text-sm">Conv. Rate</p>
                </div>
            </div>
        </div>
    )
}
const OrderCard = ({ order }) => {
    const statusColors = {
        completed: 'bg-[#00FF89]/10 text-[#00FF89] border-[#00FF89]/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
    }
    const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString()}`
    return (
        <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-semibold text-white text-sm">#{order.orderId}</h4>
                    <p className="text-xs text-gray-400 mt-1">{order.formattedDate}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${statusColors[order.status] || statusColors.pending}`}>
                    {order.status}
                </span>
            </div>
            <div className="space-y-2">
                <div>
                    <p className="text-sm font-medium text-white line-clamp-1">{order.productTitle}</p>
                    <p className="text-xs text-gray-400">{order.productType}</p>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                        {order.buyerName || order.buyerEmail?.split('@')[0] || 'Anonymous'}
                    </span>
                    <span className="text-sm font-bold text-[#00FF89]">
                        {formatCurrency(order.price)}
                    </span>
                </div>
            </div>
        </div>
    )
}
const OrdersSection = ({ orders, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <LoadingSkeleton className="w-48 h-6 mb-2" />
                    <LoadingSkeleton className="w-64 h-4" />
                </div>
                <div className="p-6 space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                        <LoadingSkeleton key={i} className="h-16 bg-gray-800 rounded" />
                    ))}
                </div>
            </div>
        )
    }
    if (!orders || orders.length === 0) {
        return (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                            <Clock className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                            <p className="text-gray-400">Your latest transactions</p>
                        </div>
                    </div>
                </div>
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Product
                    </Link>
                </div>
            </div>
        )
    }
    return (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                            <Clock className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
                            <p className="text-gray-400">Your latest transactions</p>
                        </div>
                    </div>
                    <Link
                        href="/seller/orders"
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 hover:text-white transition-all"
                    >
                        View All
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            </div>
            <div className="p-4 space-y-4">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    )
}
const Alert = ({ type = 'info', title, children, action }) => {
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
        <div className={`rounded-xl border p-6 ${styles[type]}`}>
            <div className="flex items-start gap-4">
                <div className="text-xl">{icons[type]}</div>
                <div className="flex-1">
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <div className="mb-4">{children}</div>
                    {action && <div>{action}</div>}
                </div>
            </div>
        </div>
    )
}
const SetupProgress = ({ sellerProfile, isApproved }) => (
    <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-[#00FF89]/20 rounded-2xl border border-[#00FF89]/30 flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-[#00FF89]" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Welcome to Your Seller Journey</h2>
        <p className="text-lg text-gray-300 mb-8 max-w-lg mx-auto">
            Complete your verification to start selling AI tools and earning revenue on our platform.
        </p>
        <div className="space-y-4 mb-8">
            {[
                {
                    step: 1,
                    title: 'Complete Profile',
                    description: `${sellerProfile?.completionPercentage || 0}% complete - Add your business information`,
                    completed: sellerProfile?.completionPercentage >= 80,
                    progress: sellerProfile?.completionPercentage || 0
                },
                {
                    step: 2,
                    title: 'Submit for Review',
                    description: 'Upload verification documents and business proof',
                    completed: sellerProfile?.verification?.status !== 'pending'
                },
                {
                    step: 3,
                    title: 'Start Selling',
                    description: 'Create and publish your first AI product',
                    completed: isApproved
                }
            ].map((item) => (
                <div key={item.step} className="flex items-center gap-4 p-6 rounded-xl bg-[#1a1a1a] border border-gray-800 text-left">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.completed 
                            ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30' 
                            : 'bg-gray-700 text-gray-400'
                    }`}>
                        {item.completed ? <CheckCircle className="w-6 h-6" /> : item.step}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg mb-1">{item.title}</h3>
                        <p className="text-gray-400">{item.description}</p>
                        {item.progress !== undefined && (
                            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-[#00FF89] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
                href="/seller/profile"
                className="w-full sm:w-auto px-8 py-4 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors"
            >
                Complete Setup
            </Link>
            <Link
                href="/explore"
                className="w-full sm:w-auto px-8 py-4 border border-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-800/50 transition-colors"
            >
                Explore Platform
            </Link>
        </div>
    </div>
)
const MemoizedMetricCard = memo(MetricCard)
const MemoizedProductCard = memo(ProductCard)
const MemoizedOrdersSection = memo(OrdersSection)
export default function SellerDashboard() {
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState(null)
    const [sellerProfile, setSellerProfile] = useState(null)
    const [selectedCurrency, setSelectedCurrency] = useState('USD')
    const [showDocumentUpload, setShowDocumentUpload] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    useEffect(() => {
        loadDashboardData()
        const interval = setInterval(() => loadDashboardData(true), 30000)
        return () => clearInterval(interval)
    }, [])
    const loadDashboardData = async (silent = false) => {
        try {
            if (!silent) {
                setRefreshing(true)
                setLoading(true)
            }
            setError(null)
            const [profile, dashboard] = await Promise.all([
                sellerAPI.getProfile(),
                sellerAPI.getDashboard()
            ])
            const processedData = {
                ...dashboard,
                chartData: {
                    revenue: generateRevenueData(dashboard?.recentOrders || []),
                    performance: generatePerformanceData(dashboard?.topProducts || [])
                }
            }
            setSellerProfile(profile)
            setDashboardData(processedData)
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
                const orderDateString = order.orderDate || order.createdAt || order.date
                if (!orderDateString) return
                const orderDate = new Date(orderDateString)
                if (isNaN(orderDate.getTime())) return
                const orderDateFormatted = orderDate.toISOString().split('T')[0]
                const dayData = last30Days.find(day => day.date === orderDateFormatted)
                if (dayData) {
                    dayData.revenue += parseFloat(order.price || order.totalAmount || 0)
                    dayData.orders += 1
                }
            } catch (error) {
                console.warn('Error processing order date:', error)
            }
        })
        return last30Days
    }
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
                console.warn('Error processing product data:', error)
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
    const formatCurrency = (amount) => {
        const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
        return `${symbols[selectedCurrency] || '$'}${Number(amount || 0).toLocaleString()}`
    }
    const isApproved = sellerProfile?.verification?.status === 'approved' && 
                      sellerProfile?.commissionOffer?.status === 'accepted'
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-[#00FF89] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading your dashboard...</p>
                    <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
                </div>
            </div>
        )
    }
    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => loadDashboardData()}
                        className="px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }
    return (
        <div className="w-full min-h-screen bg-[#0a0a0a] overflow-x-hidden">
            <header className="w-full mb-8">
                <div className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <button
                                    onClick={() => setSidebarOpen?.(true)}
                                    className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 flex-shrink-0"
                                    aria-label="Open navigation menu"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white truncate">
                                    {sellerProfile?.fullName?.split(' ')[0] || 'Seller'} Dashboard
                                </h1>
                                <VerificationBadge status={sellerProfile?.verification?.status} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400 ml-0 lg:ml-0">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span>Seller Studio</span>
                                <span className="text-gray-600">•</span>
                                <span>Creative Dashboard</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {isApproved && (
                                <>
                                    <button
                                        onClick={() => loadDashboardData(true)}
                                        disabled={refreshing}
                                        className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                    <CurrencySelector
                                        value={selectedCurrency}
                                        onChange={setSelectedCurrency}
                                    />
                                </>
                            )}
                            <Link
                                href={isApproved ? '/seller/products/create' : '/seller/profile'}
                                className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base ${
                                    isApproved
                                        ? 'bg-[#00FF89] text-black hover:bg-[#00FF89]/90'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">{isApproved ? 'Add Product' : 'Complete Setup'}</span>
                                <span className="sm:hidden">{isApproved ? 'Add' : 'Setup'}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
            <div className="space-y-4 mb-8">
                {sellerProfile?.verification?.status === 'commission_offered' && 
                 sellerProfile?.commissionOffer?.status !== 'accepted' && (
                    <Alert
                        type="success"
                        title="Commission Offer Available"
                        action={
                            <Link
                                href="/seller/profile"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors"
                            >
                                Review Offer ({sellerProfile?.commissionOffer?.rate}%)
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        }
                    >
                        <p>We've offered you a {sellerProfile?.commissionOffer?.rate}% commission rate. Accept to start selling!</p>
                    </Alert>
                )}
                {dashboardData?.pendingOrders > 0 && (
                    <Alert
                        type="warning"
                        title="Pending Orders Require Attention"
                        action={
                            <Link
                                href="/seller/orders?status=pending"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                            >
                                Process {dashboardData.pendingOrders} Orders
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        }
                    >
                        <p>
                            You have {dashboardData.pendingOrders} {dashboardData.pendingOrders === 1 ? 'order' : 'orders'} waiting for fulfillment.
                        </p>
                    </Alert>
                )}
            </div>
            {isApproved ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                            subtitle={`${dashboardData?.performance?.salesThisMonth || 0} this month`}
                            isLoading={loading}
                        />
                        <MemoizedMetricCard
                            icon={Package}
                            value={dashboardData?.totalProducts || 0}
                            label="Active Products"
                            color="purple"
                            subtitle={`${dashboardData?.completedOrders || 0} completed orders`}
                            isLoading={loading}
                        />
                        <MemoizedMetricCard
                            icon={Eye}
                            value={dashboardData?.analytics?.views || 0}
                            label="Profile Views"
                            color="amber"
                            subtitle={`${dashboardData?.performance?.profileViews || 0} this month`}
                            isLoading={loading}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <MemoizedMetricCard
                            icon={Percent}
                            value={`${dashboardData?.analytics?.conversionRate || 0}%`}
                            label="Conversion Rate"
                            color="blue"
                            isLoading={loading}
                        />
                        <MemoizedMetricCard
                            icon={Star}
                            value={`${(dashboardData?.averageRating || 0).toFixed(1)}`}
                            label="Average Rating"
                            color="amber"
                            isLoading={loading}
                        />
                        <MemoizedMetricCard
                            icon={Users}
                            value={dashboardData?.analytics?.carts || 0}
                            label="Added to Cart"
                            color="orange"
                            isLoading={loading}
                        />
                        <MemoizedMetricCard
                            icon={BarChart3}
                            value={formatCurrency(dashboardData?.performance?.averageOrderValue || 0)}
                            label="Avg Order Value"
                            color="purple"
                            subtitle={`${dashboardData?.summary?.commissionRate || 0}% commission rate`}
                            isLoading={loading}
                        />
                    </div>
                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                                    <TrendingUp className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Top Performing Products</h2>
                                    <p className="text-gray-400">Your best-selling products and their metrics</p>
                                </div>
                            </div>
                            {dashboardData?.topProducts?.length > 3 && (
                                <Link
                                    href="/seller/products"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 hover:text-white transition-all"
                                >
                                    View All Products
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {dashboardData?.topProducts?.slice(0, 3).map((product, index) => (
                                <MemoizedProductCard
                                    key={product.id}
                                    product={product}
                                    index={index}
                                    isLoading={loading}
                                />
                            ))}
                        </div>
                    </section>
                    <section className="mb-8">
                        <MemoizedOrdersSection
                            orders={dashboardData?.recentOrders || []}
                            isLoading={loading}
                        />
                    </section>
                    <section className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#00FF89]/20 rounded-xl border border-[#00FF89]/30">
                                    <Activity className="w-6 h-6 text-[#00FF89]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
                                    <p className="text-gray-400">Track your business growth and optimize performance</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 hover:text-white transition-all">
                                <Download className="w-4 h-4" />
                                <span>Export Data</span>
                            </button>
                        </div>
                        <div className="space-y-8">
                            <Suspense fallback={<ChartSkeleton height="h-80" />}>
                                <RevenueChart recentOrders={dashboardData?.recentOrders || []} />
                            </Suspense>
                            <Suspense fallback={<ChartSkeleton height="h-80" />}>
                                <PerformanceChart
                                    topProducts={dashboardData?.topProducts || []}
                                    allProducts={dashboardData?.allProducts || dashboardData?.topProducts || []}
                                />
                            </Suspense>
                        </div>
                    </section>
                </>
            ) : (
                <SetupProgress sellerProfile={sellerProfile} isApproved={isApproved} />
            )}
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
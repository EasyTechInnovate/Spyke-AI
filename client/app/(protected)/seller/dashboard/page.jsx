'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DollarSign, Package, Plus, Star, ShoppingCart, CreditCard, Settings } from 'lucide-react'
import sellerAPI from '@/lib/api/seller'
import DocumentUploadModal from '@/components/features/seller/SellerDocumentUpload'
import VerificationBadge from '@/components/features/seller/shared/VerificationBadge'
import ActionItemsPanel from '@/components/features/seller/dashboard/ActionItemsPanel'
import RecentOrdersPanel from '@/components/features/seller/dashboard/RecentOrdersPanel'
import TopProductsPanel from '@/components/features/seller/dashboard/TopProductsPanel'
import FunnelMiniChart from '@/components/features/seller/dashboard/FunnelMiniChart'
import CurrencySelector from '@/components/features/seller/dashboard/CurrencySelector'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
// ✅ Fixed StatCard component
const StatCard = ({ icon: Icon, value, label, color, trend, loading }) => {
    const getIconColor = (colorClass) => {
        if (colorClass.includes('[#00FF89]')) return 'text-[#00FF89]'
        if (colorClass.includes('blue-500')) return 'text-blue-500'
        if (colorClass.includes('purple-500')) return 'text-purple-500'
        if (colorClass.includes('yellow-500')) return 'text-yellow-500'
        return 'text-[#00FF89]' // fallback
    }

    return (
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#00FF89]/30 transition-all group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${color}/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${getIconColor(color)}`} />
                </div>
                {trend ? (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-green-400">
                        <span>{trend}%</span>
                    </div>
                ) : null}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs sm:text-sm text-gray-500">{label}</p>
        </div>
    )
}

export default function SellerDashboard() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [products, setProducts] = useState([])
    const [sellerProfile, setSellerProfile] = useState(null)
    const [selectedCurrency, setSelectedCurrency] = useState('USD')
    const [showDocumentUpload, setShowDocumentUpload] = useState(false)
    const [orders, setOrders] = useState([])
    const [topProducts, setTopProducts] = useState([])

    useEffect(() => {
        loadSellerProfile()
        loadStatsAndMetrics()
        loadProducts()
    }, [])

    const loadSellerProfile = async () => {
        try {
            const profile = await sellerAPI.getProfile()
            setSellerProfile(profile)
            if (typeof window !== 'undefined') {
                localStorage.setItem('sellerProfile', JSON.stringify(profile))
            }
        } catch (error) {
            console.error('Error loading seller profile:', error)
            if (typeof window !== 'undefined') {
                const storedProfile = localStorage.getItem('sellerProfile')
                if (storedProfile) setSellerProfile(JSON.parse(storedProfile))
            }
        }
    }

    const normalizeStats = (profile, dashboard) => {
        const pStats = profile?.stats || {}
        const d = dashboard || {}
        return {
            totalEarnings: d.totalEarnings ?? pStats.totalEarnings ?? 0,
            totalOrders: d.totalOrders ?? d.totalSales ?? pStats.totalSales ?? 0,
            totalProducts: d.totalProducts ?? pStats.totalProducts ?? 0,
            averageRating: d.averageRating ?? pStats.averageRating ?? 0,
            pendingOrders: d.pendingOrders ?? 0,
            completedOrders: d.completedOrders ?? 0
        }
    }

    const loadStatsAndMetrics = async () => {
        try {
            const dashboardData = await sellerAPI.getDashboard().catch(() => null)
            if (dashboardData) {
                setOrders(dashboardData.recentOrders || [])
                setTopProducts(dashboardData.topProducts || [])
            }
            setStats((prev) => normalizeStats(sellerProfile, dashboardData))
        } catch (e) {
            console.error('Error loading dashboard metrics', e)
            setStats(normalizeStats(sellerProfile, null))
        }
    }

    const loadProducts = async () => {
        try {
            const response = await sellerAPI.getProducts({ limit: 5 })
            let list = []
            if (response?.data?.products) {
                list = response.data.products
            } else if (response?.products) {
                list = response.products
            } else if (Array.isArray(response)) {
                list = response
            }
            list = list.map((p) => ({ ...p, id: p.id || p._id }))
            setProducts(list)
        } catch (error) {
            console.error('Error loading products:', error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        const currencySymbols = {
            USD: '$',
            INR: '₹',
            EUR: '€',
            GBP: '£',
            AUD: 'A$',
            CAD: 'C$',
            SGD: 'S$',
            AED: 'AED '
        }
        return `${currencySymbols[selectedCurrency] || '$'}${amount.toFixed(2)}`
    }

    const isApproved = sellerProfile?.verification?.status === 'approved' && sellerProfile?.commissionOffer?.status === 'accepted'
    const canAddProducts = isApproved

    if (loading || !sellerProfile) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-end gap-1.5 h-16">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-2 bg-[#00FF89] rounded-full animate-pulse"
                                style={{
                                    height: `${20 + i * 15}%`,
                                    animationDelay: `${i * 100}ms`,
                                    animationDuration: '1.5s'
                                }}
                            />
                        ))}
                    </div>
                    <h2 className="text-xl text-[#00FF89] mt-6 font-[var(--font-league-spartan)]">Loading Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-2 font-[var(--font-kumbh-sans)]">Preparing your data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full text-white">
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <header className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl text-white mb-2 font-[var(--font-league-spartan)]">Dashboard</h1>
                            <p className="text-sm sm:text-base text-gray-400 font-[var(--font-kumbh-sans)]">
                                Welcome back, {sellerProfile?.fullName || 'Seller'}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <CurrencySelector
                                value={selectedCurrency}
                                onChange={setSelectedCurrency}
                            />
                            <VerificationBadge status={sellerProfile?.verification?.status} />
                            <div className="relative group">
                                <Link
                                    href={canAddProducts ? '/seller/products/new' : '#'}
                                    onClick={(e) => {
                                        if (!canAddProducts) e.preventDefault()
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-all ${canAddProducts ? 'bg-[#00FF89] text-[#121212] hover:bg-[#00FF89]/90' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                                    aria-label="Add new product"
                                    aria-disabled={!canAddProducts}>
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Product</span>
                                    <span className="sm:hidden">Add</span>
                                </Link>
                                {!canAddProducts && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                                        <p className="text-xs text-gray-300">
                                            {sellerProfile?.verification?.status === 'commission_offered' &&
                                            !sellerProfile?.commissionOffer?.acceptedAt
                                                ? 'Accept commission offer to add products'
                                                : sellerProfile?.verification?.status === 'under_review'
                                                  ? 'Account under review'
                                                  : sellerProfile?.verification?.status === 'rejected'
                                                    ? 'Verification required to add products'
                                                    : sellerProfile?.verification?.status === 'approved' &&
                                                        !sellerProfile?.commissionOffer?.acceptedAt
                                                      ? 'Complete commission agreement to add products'
                                                      : 'Complete verification to add products'}
                                        </p>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-700" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Commission offer notification - simplified */}
                {sellerProfile?.verification?.status === 'commission_offered' && sellerProfile?.commissionOffer?.status !== 'accepted' && (
                    <div className="mb-6 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                            <div className="text-sm font-medium text-[#00FF89] mb-1">Commission Offer Pending</div>
                            <div className="text-sm text-gray-300">
                                You have a commission offer waiting for your response. Visit your profile to review terms and negotiate.
                            </div>
                        </div>
                        <div>
                            <Link
                                href="/seller/profile"
                                className="px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg text-sm font-medium hover:bg-[#00FF89]/90 transition-colors">
                                Review Offer
                            </Link>
                        </div>
                    </div>
                )}

                {/* Action Items always visible */}
                <ActionItemsPanel
                    seller={sellerProfile}
                    products={products}
                    onUploadDocs={() => setShowDocumentUpload(true)}
                />

                {/* KPIs if approved */}
                {isApproved && (
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6 mb-8">
                        <StatCard
                            icon={DollarSign}
                            value={formatCurrency(stats?.totalEarnings || 0)}
                            label="Total Earnings"
                            color="bg-[#00FF89]"
                            trend={12.5}
                            loading={loading}
                        />
                        <StatCard
                            icon={ShoppingCart}
                            value={stats?.totalOrders || 0}
                            label="Total Orders"
                            color="bg-blue-500"
                            trend={8.2}
                            loading={loading}
                        />
                        <StatCard
                            icon={Package}
                            value={stats?.totalProducts || 0}
                            label="Active Products"
                            color="bg-purple-500"
                            loading={loading}
                        />
                        <StatCard
                            icon={Star}
                            value={(stats?.averageRating || 0).toFixed(1)}
                            label="Average Rating"
                            color="bg-yellow-500"
                            loading={loading}
                        />
                    </section>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    <div className="space-y-6 xl:col-span-2">
                        <TopProductsPanel products={topProducts.length ? topProducts : products} />
                        <RecentOrdersPanel orders={orders} />
                        <FunnelMiniChart data={{ views: stats?.views || 0, carts: stats?.carts || 0, purchases: stats?.totalOrders || 0 }} />
                    </div>
                    <div className="space-y-6">
                        {/* Pending Orders */}
                        {isApproved && (
                            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-white">Pending Orders</h3>
                                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm rounded-full">
                                        {stats?.pendingOrders || 0}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">Orders awaiting processing</p>
                                <Link
                                    href="/seller/orders?status=pending"
                                    className="mt-4 inline-flex items-center text-[#00FF89] hover:text-[#00FF89]/80 transition-colors text-sm font-medium">
                                    View Orders →
                                </Link>
                            </div>
                        )}
                        {/* Quick Actions */}
                        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    href="/seller/products/new"
                                    className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg hover:bg-gray-800 transition-colors">
                                    <Plus className="w-5 h-5 text-[#00FF89]" />
                                    <span className="text-sm font-medium text-gray-300">Add New Product</span>
                                </Link>
                                <Link
                                    href="/seller/promocodes"
                                    className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg hover:bg-gray-800 transition-colors">
                                    <CreditCard className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm font-medium text-gray-300">Manage Promocodes</span>
                                </Link>
                                <Link
                                    href="/seller/profile"
                                    className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg hover:bg-gray-800 transition-colors">
                                    <Settings className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-300">Account & Verification</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showDocumentUpload && (
                <DocumentUploadModal
                    isOpen={showDocumentUpload}
                    onClose={() => setShowDocumentUpload(false)}
                    onSuccess={async () => {
                        await loadSellerProfile()
                        setShowDocumentUpload(false)
                    }}
                />
            )}
        </div>
    )
}


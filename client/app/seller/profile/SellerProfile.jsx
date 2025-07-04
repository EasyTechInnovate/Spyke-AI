'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import {
    DollarSign,
    Package,
    ShoppingCart,
    Clock,
    AlertCircle,
    CheckCircle,
    Plus,
    Eye,
    Edit,
    CreditCard,
    Settings,
    Star,
    MessageSquare,
    TrendingUp,
    Users,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import sellerAPI from '@/lib/api/seller'

// Dynamic imports for better performance
const SellerSidebar = dynamic(() => import('@/components/seller/SellerSidebar'), {
    ssr: false,
    loading: () => <div className="w-64 bg-[#1a1a1a] animate-pulse" />
})

// Enhanced Loader Component
const SellerPageLoader = () => {
    return (
        <div className="fixed inset-0 bg-[#121212] flex items-center justify-center z-50">
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

                <h2 className="text-xltext-[#00FF89] mt-6 font-[var(--font-league-spartan)]">Loading Seller Center</h2>
                <p className="text-sm text-gray-500 mt-2 font-[var(--font-kumbh-sans)]">Preparing your dashboard...</p>
            </div>
        </div>
    )
}

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, color, trend, loading }) => (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#00FF89]/30 transition-all group">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div
                className={`w-10 h-10 sm:w-12 sm:h-12 ${color}/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color.replace('/20', '')}`} />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-xs sm:text-sm text-green-400">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{trend}%</span>
                </div>
            )}
        </div>
        {loading ? (
            <div className="space-y-2">
                <div className="h-6 sm:h-8 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 sm:h-4 bg-gray-800 rounded w-2/3 animate-pulse" />
            </div>
        ) : (
            <>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{value}</h3>
                <p className="text-xs sm:text-sm text-gray-400">{label}</p>
            </>
        )}
    </div>
)

export default function SellerProfile() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [sellerProfile, setSellerProfile] = useState(null)
    const [stats, setStats] = useState(null)
    const [isMobile, setIsMobile] = useState(false)
    const [selectedCurrency, setSelectedCurrency] = useState('USD')

    const currencyConfig = {
        USD: { symbol: '$', rate: 1, position: 'before' },
        INR: { symbol: '₹', rate: 83, position: 'before' },
        EUR: { symbol: '€', rate: 0.92, position: 'before' },
        GBP: { symbol: '£', rate: 0.79, position: 'before' },
        AUD: { symbol: 'A$', rate: 1.52, position: 'before' },
        CAD: { symbol: 'C$', rate: 1.36, position: 'before' },
        SGD: { symbol: 'S$', rate: 1.35, position: 'before' },
        AED: { symbol: 'AED', rate: 3.67, position: 'after' }
    }

    const formatCurrency = (amount, currency = selectedCurrency) => {
        const config = currencyConfig[currency] || currencyConfig.USD
        const convertedAmount = (amount * config.rate).toFixed(2)

        if (config.position === 'before') {
            return `${config.symbol}${convertedAmount}`
        } else {
            return `${convertedAmount} ${config.symbol}`
        }
    }

    const detectCurrencyFromLocation = (location) => {
        const countryToCurrency = {
            India: 'INR',
            'United States': 'USD',
            'United Kingdom': 'GBP',
            Australia: 'AUD',
            Canada: 'CAD',
            Singapore: 'SGD',
            UAE: 'AED',
            Germany: 'EUR',
            France: 'EUR',
            Italy: 'EUR',
            Spain: 'EUR',
            Netherlands: 'EUR'
        }
        return countryToCurrency[location?.country] || 'USD'
    }

    // Check for mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        fetchSellerData()
    }, [])

    const fetchSellerData = async () => {
        try {
            setLoading(true)
            const minimumLoadTime = new Promise((resolve) => setTimeout(resolve, 1500))
            const dataFetch = sellerAPI.getProfile()
            const [_, response] = await Promise.all([minimumLoadTime, dataFetch])

            if (response) {
                setSellerProfile(response)
                setStats(response.stats)
                // Auto-detect currency
                const detectedCurrency = detectCurrencyFromLocation(response.location)
                setSelectedCurrency(detectedCurrency)
            } else {
                throw new Error(response.message || 'Failed to load profile')
            }
        } catch (error) {
            if (error.status === 401 || error.authError) {
                toast.error('Session expired. Please log in again.')
                router.push('/signin')
            } else if (error.status === 404) {
                toast.error('Seller profile not found. Please complete your profile.')
                router.push('/become-seller')
            } else {
                toast.error(error.message || 'Failed to load dashboard data')
            }
        } finally {
            setLoading(false)
        }
    }

    const getVerificationBadge = (status) => {
        const badges = {
            pending: {
                color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
                icon: Clock,
                text: 'Verification Pending'
            },
            approved: {
                color: 'bg-green-500/20 text-green-500 border-green-500/30',
                icon: CheckCircle,
                text: 'Verified Seller'
            },
            rejected: {
                color: 'bg-red-500/20 text-red-500 border-red-500/30',
                icon: AlertCircle,
                text: 'Verification Failed'
            }
        }
        return badges[status] || badges.pending
    }

    if (loading) {
        return <SellerPageLoader />
    }

    if (!sellerProfile) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-white mb-2">No Seller Profile Found</h1>
                    <p className="text-gray-400 mb-4">You need to create a seller profile first.</p>
                    <Link
                        href="/become-seller"
                        className="inline-flex items-center px-6 py-3 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-colors">
                        Create Seller Profile
                    </Link>
                </div>
            </div>
        )
    }

    const verificationBadge = getVerificationBadge(sellerProfile.verification?.status)
    const VerificationIcon = verificationBadge.icon

    return (
        <>
            <Head>
                <title>Seller Dashboard - {sellerProfile.fullName} | Spyke AI</title>
                <meta
                    name="description"
                    content={`Manage your products, track sales, and grow your business on Spyke AI marketplace. ${sellerProfile.bio}`}
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=5"
                />
                <link
                    rel="canonical"
                    href={`https://spyke.ai/seller/profile`}
                />
            </Head>

            <div className="flex min-h-screen bg-[#121212]">
                {/* Sidebar */}
                {!isMobile && (
                    <div className="hidden md:block fixed top-0 left-0 h-full w-64 z-40">
                        <SellerSidebar
                            currentPath="/profile"
                            sellerName={sellerProfile?.fullName}
                        />
                    </div>
                )}

                {/* Main Content */}
                <main
                    className={`flex-1 h-full overflow-y-auto overflow-x-hidden bg-[#121212] text-white ${!isMobile ? 'ml-64' : ''}`}
                    role="main">
                    <div className="w-full p-4 sm:p-6 lg:p-8">
                        {/* Page Header */}
                        <header className="mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl text-white mb-2 font-[var(--font-league-spartan)]">Dashboard</h1>
                                    <p className="text-sm sm:text-base text-gray-400 font-[var(--font-kumbh-sans)]">
                                        Welcome back, {sellerProfile.fullName}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Currency Selector */}
                                    <div className="relative">
                                        <select
                                            value={selectedCurrency}
                                            onChange={(e) => setSelectedCurrency(e.target.value)}
                                            className="appearance-none w-full pl-4 pr-10 py-2 bg-[#1a1a1a] border border-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-[#00FF89] transition-colors">
                                            <option value="USD">USD ($)</option>
                                            <option value="INR">INR (₹)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="AUD">AUD (A$)</option>
                                            <option value="CAD">CAD (C$)</option>
                                            <option value="SGD">SGD (S$)</option>
                                            <option value="AED">AED</option>
                                        </select>

                                        {/* Chevron Icon */}
                                        <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${verificationBadge.color} text-xs sm:text-sm`}>
                                        <VerificationIcon className="w-4 h-4" />
                                        <span className="font-medium">{verificationBadge.text}</span>
                                    </div>

                                    <Link
                                        href="/seller/products/new"
                                        className="flex items-center gap-2 px-4 py-2 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-colors text-sm sm:text-base"
                                        aria-label="Add new product">
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Add Product</span>
                                        <span className="sm:hidden">Add</span>
                                    </Link>
                                </div>
                            </div>
                        </header>

                        {/* Verification Banners */}
                        {sellerProfile.verification?.status === 'pending' && (
                            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-yellow-500 font-medium mb-1">Verification in Progress</h3>
                                    <p className="text-sm text-gray-300">
                                        Your seller account is under review. You can start adding products, but they won't be visible to buyers until
                                        your account is verified.
                                    </p>
                                    {sellerProfile.verification?.submittedAt && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            Submitted: {new Date(sellerProfile.verification.submittedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {sellerProfile.verification?.status === 'rejected' && sellerProfile.verification?.rejectionReason && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-red-500 font-medium mb-1">Verification Failed</h3>
                                    <p className="text-sm text-gray-300">{sellerProfile.verification.rejectionReason}</p>
                                    <Link
                                        href="/seller/verification"
                                        className="inline-flex items-center gap-2 mt-3 text-sm text-red-400 hover:text-red-300 transition-colors">
                                        Submit for Verification Again →
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
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
                                value={stats?.totalSales || 0}
                                label="Total Sales"
                                color="bg-purple-500"
                                trend={8.2}
                                loading={loading}
                            />
                            <StatCard
                                icon={Package}
                                value={stats?.totalProducts || 0}
                                label="Total Products"
                                color="bg-blue-500"
                                loading={loading}
                            />
                            <StatCard
                                icon={Star}
                                value={stats?.averageRating?.toFixed(1) || '0.0'}
                                label="Average Rating"
                                color="bg-[#FFC050]"
                                loading={loading}
                            />
                        </section>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                            {/* Left Column */}
                            <section className="xl:col-span-2 space-y-6">
                                {/* Getting Started */}
                                {stats?.totalProducts === 0 && (
                                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 sm:p-8 text-center">
                                        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                                        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Start Selling Today!</h2>
                                        <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-md mx-auto">
                                            You haven't added any products yet. Create your first product and start earning.
                                        </p>
                                        <Link
                                            href="/seller/products/new"
                                            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-colors">
                                            <Plus className="w-5 h-5" />
                                            Create Your First Product
                                        </Link>
                                    </div>
                                )}

                                {/* Profile Overview */}
                                <article className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Profile Overview</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-400 mb-3">Business Info</h3>
                                            <dl className="space-y-3">
                                                <div>
                                                    <dt className="text-xs text-gray-500">Email</dt>
                                                    <dd className="text-sm sm:text-base text-white break-all">{sellerProfile.email}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-gray-500">Website</dt>
                                                    <dd className="text-sm sm:text-base">
                                                        {sellerProfile.websiteUrl ? (
                                                            <a
                                                                href={sellerProfile.websiteUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[#00FF89] hover:text-[#00FF89]/80 break-all">
                                                                {sellerProfile.websiteUrl}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-500">Not provided</span>
                                                        )}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-gray-500">Location</dt>
                                                    <dd className="text-sm sm:text-base text-white">{sellerProfile.location.country}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-400 mb-3">Expertise</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-2">Niches</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {sellerProfile.niches.map((niche, index) => (
                                                            <span
                                                                key={index}
                                                                className="text-xs px-2 py-1 bg-[#00FF89]/20 text-[#00FF89] rounded">
                                                                {niche}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-2">Tools</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {sellerProfile.toolsSpecialization.map((tool, index) => (
                                                            <span
                                                                key={index}
                                                                className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                                                {tool}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>

                                {/* Quick Actions */}
                                <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <Link
                                        href="/seller/products"
                                        className="bg-[#1f1f1f] border border-gray-800 rounded-lg p-4 hover:border-[#00FF89]/50 transition-all text-center group">
                                        <Package className="w-8 h-8 text-[#00FF89] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs sm:text-sm text-gray-300">Products</span>
                                    </Link>
                                    <Link
                                        href="/seller/orders"
                                        className="bg-[#1f1f1f] border border-gray-800 rounded-lg p-4 hover:border-[#00FF89]/50 transition-all text-center group">
                                        <ShoppingCart className="w-8 h-8 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs sm:text-sm text-gray-300">Orders</span>
                                    </Link>
                                    <Link
                                        href="/seller/analytics"
                                        className="bg-[#1f1f1f] border border-gray-800 rounded-lg p-4 hover:border-[#00FF89]/50 transition-all text-center group">
                                        <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs sm:text-sm text-gray-300">Analytics</span>
                                    </Link>
                                    <Link
                                        href="/seller/customers"
                                        className="bg-[#1f1f1f] border border-gray-800 rounded-lg p-4 hover:border-[#00FF89]/50 transition-all text-center group">
                                        <Users className="w-8 h-8 text-[#FFC050] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs sm:text-sm text-gray-300">Customers</span>
                                    </Link>
                                </section>
                            </section>

                            {/* Right Column */}
                            <aside className="xl:col-span-1 space-y-6">
                                {/* Payout Info */}
                                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Payout Settings</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-400">Available Balance</p>
                                            <p className="text-xl sm:text-2xl font-bold text-[#00FF89]">
                                                {formatCurrency(stats?.totalEarnings || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm text-gray-400">Payout Method</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-white capitalize">{sellerProfile.payoutInfo.method}</p>
                                                {sellerProfile.payoutInfo.isVerified ? (
                                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Not Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {sellerProfile.payoutInfo.paypalEmail && (
                                            <div>
                                                <p className="text-xs sm:text-sm text-gray-400">PayPal Email</p>
                                                <p className="text-sm text-white truncate">{sellerProfile.payoutInfo.paypalEmail}</p>
                                            </div>
                                        )}
                                        <Link
                                            href="/seller/payouts"
                                            className="inline-flex items-center gap-2 text-sm text-[#00FF89] hover:text-[#00FF89]/80 transition-colors">
                                            <CreditCard className="w-4 h-4" />
                                            Manage Payouts
                                        </Link>
                                    </div>
                                </div>

                                {/* Settings Overview */}
                                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Settings Overview</h2>
                                    <div className="space-y-3">
                                        {/* Email Notifications */}
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm text-gray-300">Email Notifications</span>
                                            <span
                                                className={`text-sm font-medium ${sellerProfile.settings.emailNotifications ? 'text-[#00FF89]' : 'text-gray-500'}`}>
                                                {sellerProfile.settings.emailNotifications ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>

                                        {/* Marketing Emails */}
                                        <div className="flex items-center justify-between py-2 border-t border-gray-800">
                                            <span className="text-sm text-gray-300">Marketing Emails</span>
                                            <span
                                                className={`text-sm font-medium ${sellerProfile.settings.marketingEmails ? 'text-[#00FF89]' : 'text-gray-500'}`}>
                                                {sellerProfile.settings.marketingEmails ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>

                                        {/* Auto-approve Products */}
                                        <div className="flex items-center justify-between py-2 border-t border-gray-800">
                                            <span className="text-sm text-gray-300">Auto-approve Products</span>
                                            <span
                                                className={`text-sm font-medium ${sellerProfile.settings.autoApproveProducts ? 'text-[#00FF89]' : 'text-gray-500'}`}>
                                                {sellerProfile.settings.autoApproveProducts ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href="/seller/settings"
                                        className="inline-flex items-center gap-2 mt-4 text-sm text-[#00FF89] hover:text-[#00FF89]/80 transition-colors">
                                        <Settings className="w-4 h-4" />
                                        Manage Settings
                                    </Link>
                                </div>

                                {/* Profile Performance */}
                                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Performance</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-2xl sm:text-3xl font-bold text-white">{stats?.profileViews || 0}</p>
                                                <p className="text-xs sm:text-sm text-gray-400">Profile Views</p>
                                            </div>
                                            <Eye className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <div className="pt-4 border-t border-gray-800">
                                            <p className="text-xs text-gray-500 mb-2">This Month</p>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-green-400" />
                                                <span className="text-sm text-green-400">+18.2%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                {isMobile && (
                    <nav className="fixed bottom-0 left-0 right-0 bg-[#1f1f1f] border-t border-gray-800 z-50">
                        <div className="grid grid-cols-5 gap-1">
                            <Link
                                href="/seller/dashboard"
                                className="flex flex-col items-center py-2 text-[#00FF89]">
                                <BarChart3 className="w-5 h-5 mb-1" />
                                <span className="text-xs">Dashboard</span>
                            </Link>
                            <Link
                                href="/seller/products"
                                className="flex flex-col items-center py-2 text-gray-400">
                                <Package className="w-5 h-5 mb-1" />
                                <span className="text-xs">Products</span>
                            </Link>
                            <Link
                                href="/seller/products/new"
                                className="flex flex-col items-center py-2 text-gray-400">
                                <Plus className="w-5 h-5 mb-1" />
                                <span className="text-xs">Add</span>
                            </Link>
                            <Link
                                href="/seller/orders"
                                className="flex flex-col items-center py-2 text-gray-400">
                                <ShoppingCart className="w-5 h-5 mb-1" />
                                <span className="text-xs">Orders</span>
                            </Link>
                            <Link
                                href="/seller/settings"
                                className="flex flex-col items-center py-2 text-gray-400">
                                <Settings className="w-5 h-5 mb-1" />
                                <span className="text-xs">Settings</span>
                            </Link>
                        </div>
                    </nav>
                )}
            </div>
        </>
    )
}

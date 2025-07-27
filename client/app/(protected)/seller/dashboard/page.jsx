'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
    BarChart3, 
    DollarSign, 
    Package, 
    Users, 
    TrendingUp, 
    Plus,
    Eye,
    Star,
    ShoppingCart,
    Clock,
    CheckCircle,
    CreditCard,
    Settings,
    AlertCircle,
    Upload,
    Check,
    X,
    AlertTriangle,
    HelpCircle,
    FileText,
    Handshake,
    Rocket,
    Building,
    User
} from 'lucide-react'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'
import { toast } from 'sonner'
import sellerAPI from '@/lib/api/seller'
import DocumentUploadModal from '@/components/features/seller/SellerDocumentUpload'

// StatCard component from SellerProfile
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
                <p className="text-xl sm:text-2xl font-bold text-white mb-1">{value}</p>
                <p className="text-xs sm:text-sm text-gray-500">{label}</p>
            </>
        )}
    </div>
)

// Commission Offer Modal
const CommissionOfferModal = ({ isOpen, onClose, currentOffer, onSubmit }) => {
    const [counterRate, setCounterRate] = useState('')
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!counterRate || counterRate < 1 || counterRate > 50) {
            toast.error('Please enter a valid commission rate between 1% and 50%')
            return
        }
        if (!reason || reason.length < 10) {
            toast.error('Please provide a reason for your counter offer (minimum 10 characters)')
            return
        }

        setSubmitting(true)
        await onSubmit({ rate: Number(counterRate), reason })
        setSubmitting(false)
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white font-league-spartan">Counter Offer</h3>
                        <p className="text-sm text-gray-400 mt-1">Negotiate your commission rate</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors group">
                        <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </button>
                </div>

                <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Current Platform Offer</span>
                        <span className="text-2xl font-bold text-[#00FF89]">{currentOffer}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">The platform will take {currentOffer}% from each sale</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Your Counter Rate (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                max="50"
                                step="0.5"
                                value={counterRate}
                                onChange={(e) => setCounterRate(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent transition-all"
                                placeholder="Enter your preferred rate"
                                required
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                %
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Reason for Counter Offer</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent transition-all resize-none"
                            placeholder="Explain why you believe this rate is fair..."
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-700 transition-all">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-[#00FF89] text-[#121212] font-medium rounded-xl hover:bg-[#00FF89]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? 'Submitting...' : 'Submit Counter Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function SellerDashboard() {
    const router = useRouter()
    const track = useTrackEvent()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [products, setProducts] = useState([])
    const [sellerProfile, setSellerProfile] = useState(null)
    const [selectedCurrency, setSelectedCurrency] = useState('USD')
    const [showDocumentUpload, setShowDocumentUpload] = useState(false)
    const [processingOffer, setProcessingOffer] = useState(false)
    const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)

    useEffect(() => {
        track(ANALYTICS_EVENTS.SELLER.DASHBOARD_VIEWED, eventProperties.seller('dashboard_view'))
        loadSellerProfile()
        loadStats()
        loadProducts()
    }, [])

    const loadSellerProfile = async () => {
        try {
            const response = await sellerAPI.getSellerProfile()
            setSellerProfile(response.data || response)
            // Store in localStorage for other components
            if (typeof window !== 'undefined') {
                localStorage.setItem('sellerProfile', JSON.stringify(response.data || response))
            }
        } catch (error) {
            console.error('Error loading seller profile:', error)
            // Fallback to localStorage
            if (typeof window !== 'undefined') {
                const storedProfile = localStorage.getItem('sellerProfile')
                if (storedProfile) {
                    setSellerProfile(JSON.parse(storedProfile))
                }
            }
        }
    }

    const loadStats = async () => {
        try {
            const response = await sellerAPI.getStats()
            setStats(response.data || response)
        } catch (error) {
            console.error('Error loading stats:', error)
            // Set default stats
            setStats({
                totalEarnings: 0,
                totalOrders: 0,
                totalProducts: 0,
                averageRating: 0,
                pendingOrders: 0,
                completedOrders: 0
            })
        }
    }

    const loadProducts = async () => {
        try {
            const response = await sellerAPI.getProducts({ limit: 5 })
            setProducts(response.products || response || [])
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

    // Derived states
    const isApproved = sellerProfile?.verification?.status === 'approved' && sellerProfile?.commissionOffer?.acceptedAt
    const canAddProducts = isApproved
    const verificationStatus = sellerProfile?.verification?.status || 'pending'
    
    const verificationBadge = {
        pending: { text: 'Verification Pending', color: 'text-yellow-500 border-yellow-500/30', icon: Clock },
        under_review: { text: 'Under Review', color: 'text-blue-500 border-blue-500/30', icon: Eye },
        commission_offered: { text: 'Commission Offered', color: 'text-[#00FF89] border-[#00FF89]/30', icon: DollarSign },
        approved: { text: 'Verified Seller', color: 'text-green-500 border-green-500/30', icon: CheckCircle },
        rejected: { text: 'Verification Failed', color: 'text-red-500 border-red-500/30', icon: AlertCircle }
    }[verificationStatus] || { text: 'Pending', color: 'text-gray-500 border-gray-500/30', icon: Clock }

    const VerificationIcon = verificationBadge.icon

    const handleAcceptOffer = async () => {
        try {
            setProcessingOffer(true)
            const response = await sellerAPI.acceptCommissionOffer()
            if (response.success) {
                toast.success('Commission offer accepted! You can now start adding products.')
                await loadSellerProfile()
            }
        } catch (error) {
            console.error('Error accepting offer:', error)
            toast.error('Failed to accept commission offer. Please try again.')
        } finally {
            setProcessingOffer(false)
        }
    }

    const handleCounterOffer = async ({ rate, reason }) => {
        try {
            const response = await sellerAPI.submitCounterOffer({ rate, reason })
            if (response.success) {
                toast.success('Counter offer submitted successfully!')
                setShowCounterOfferModal(false)
                await loadSellerProfile()
            }
        } catch (error) {
            console.error('Error submitting counter offer:', error)
            toast.error('Failed to submit counter offer. Please try again.')
        }
    }

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
                <header className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl text-white mb-2 font-[var(--font-league-spartan)]">Dashboard</h1>
                            <p className="text-sm sm:text-base text-gray-400 font-[var(--font-kumbh-sans)]">
                                Welcome back, {sellerProfile?.fullName || 'Seller'}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <select
                                    value={selectedCurrency}
                                    onChange={(e) => setSelectedCurrency(e?.target.value)}
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

                            <div className="relative group">
                                <Link
                                    href={canAddProducts ? '/seller/products/new' : '#'}
                                    onClick={(e) => {
                                        if (!canAddProducts) {
                                            e.preventDefault()
                                        }
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-all text-sm sm:text-base ${
                                        canAddProducts
                                            ? 'bg-[#00FF89] text-[#121212] hover:bg-[#00FF89]/90'
                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
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
                                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-700"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {isApproved && (
                    <>
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

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="lg:col-span-2 bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Recent Products</h2>
                                {products.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <p className="text-gray-400 mb-4">No products yet</p>
                                        <Link
                                            href="/seller/products/new"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors">
                                            <Plus className="w-4 h-4" />
                                            Create Your First Product
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {products.slice(0, 5).map((product) => (
                                            <div key={product.id} className="flex items-center justify-between p-4 bg-[#121212] rounded-lg border border-gray-800">
                                                <div>
                                                    <h3 className="font-medium text-white">{product.title}</h3>
                                                    <p className="text-sm text-gray-400">${product.price} • {product.sales || 0} sales</p>
                                                </div>
                                                <Link
                                                    href={`/seller/products/edit/${product.id}`}
                                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                </Link>
                                            </div>
                                        ))}
                                        <Link
                                            href="/seller/products"
                                            className="block text-center text-[#00FF89] hover:text-[#00FF89]/80 transition-colors text-sm font-medium pt-2">
                                            View All Products →
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Pending Orders */}
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
                                            <span className="text-sm font-medium text-gray-300">Account Settings</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {!isApproved && (
                    <div className="space-y-6">
                        {/* Show verification status messages */}
                        {sellerProfile?.verification?.status === 'pending' && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="text-yellow-500 font-medium mb-1">Verification Documents Required</h3>
                                        <p className="text-sm text-gray-300">
                                            To complete your verification, please upload the required documents.
                                        </p>
                                        <button
                                            onClick={() => setShowDocumentUpload(true)}
                                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-[#121212] font-medium rounded-lg hover:bg-yellow-400 transition-colors">
                                            <Upload className="w-4 h-4" />
                                            Upload Documents
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {sellerProfile?.verification?.status === 'commission_offered' &&
                            sellerProfile?.commissionOffer?.status === 'pending' &&
                            !sellerProfile?.commissionOffer?.counterOffer?.rate && (
                                <div className="bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-[#00FF89]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <DollarSign className="w-6 h-6 text-[#00FF89]" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2">Commission Offer Received!</h3>
                                            <div className="text-gray-300 mb-4">
                                                The platform has offered you a commission rate of{' '}
                                                <span className="text-2xl font-bold text-[#00FF89]">
                                                    {sellerProfile.commissionOffer.rate}%
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={handleAcceptOffer}
                                                    disabled={processingOffer}
                                                    className="flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-all disabled:opacity-50">
                                                    {processingOffer ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
                                                            <span>Accepting...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-5 h-5" />
                                                            <span>Accept Offer</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setShowCounterOfferModal(true)}
                                                    disabled={processingOffer}
                                                    className="flex items-center gap-2 px-6 py-3 bg-[#121212] border border-[#00FF89]/30 text-[#00FF89] font-medium rounded-lg hover:bg-[#00FF89]/10 transition-all">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    Make Counter Offer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
                )}
            </div>

            {/* Document Upload Modal */}
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

            {/* Counter Offer Modal */}
            {showCounterOfferModal && (
                <CommissionOfferModal
                    isOpen={showCounterOfferModal}
                    onClose={() => setShowCounterOfferModal(false)}
                    currentOffer={sellerProfile?.commissionOffer?.rate || 10}
                    onSubmit={handleCounterOffer}
                />
            )}
        </div>
    )
}
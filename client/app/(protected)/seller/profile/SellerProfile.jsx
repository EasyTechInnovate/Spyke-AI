'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import Link from 'next/link'
import {
    Plus,
    Package,
    ShoppingCart,
    BarChart3,
    Users,
    CreditCard,
    AlertCircle,
    FileText,
    CheckCircle2,
    XCircle,
    Loader2,
    TrendingUp,
    Clock,
    Eye,
    DollarSign,
    MapPin,
    Globe,
    Calendar,
    Settings,
    Briefcase,
    Mail,
    ExternalLink,
    Edit3,
    Upload,
    Camera,
    Activity
} from 'lucide-react'
import sellerAPI from '@/lib/api/seller'
import { leagueSpartan } from '@/lib/fonts'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
import { VERIFICATION_STATUSES, COMMISSION_STATUSES } from '@/lib/constants/seller'
import VerificationBadge from '@/components/features/seller/shared/VerificationBadge'
import CommissionProgressStepper from '@/components/features/seller/dashboard/CommissionProgressStepper'
import { CommissionNegotiation } from '@/components/features/seller/profile/CommissionNegotiation'
import DocumentUploadModal from '@/components/features/seller/SellerDocumentUpload'
import CommissionNegotiationHistory from '@/components/features/seller/dashboard/CommissionNegotiationHistory'

export default function SellerProfile() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [seller, setSeller] = useState(null)
    const [showUpload, setShowUpload] = useState(false)
    const [notification, setNotification] = useState(null)
    const [processingCommission, setProcessingCommission] = useState(false)

    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true)
            const response = await sellerAPI.getProfile()
            setSeller(response?.data || response)
            setError(null)
        } catch (e) {
            setError(e?.message || 'Failed to load seller profile')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProfile()
    }, [loadProfile])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Commission negotiation handlers
    const handleAcceptCommission = async () => {
        try {
            setProcessingCommission(true)
            await sellerAPI.acceptCommissionOffer()
            await loadProfile()
            showMessage('Commission offer accepted successfully!', 'success')
        } catch (error) {
            showMessage(error.message || 'Failed to accept commission offer', 'error')
        } finally {
            setProcessingCommission(false)
        }
    }

    const handleCounterOffer = async ({ counterRate, reason }) => {
        try {
            setProcessingCommission(true)
            await sellerAPI.submitCounterOffer({ rate: counterRate, reason })
            await loadProfile()
            showMessage('Counter offer submitted successfully!', 'success')
        } catch (error) {
            showMessage(error.message || 'Failed to submit counter offer', 'error')
        } finally {
            setProcessingCommission(false)
        }
    }

    const handleRejectCommission = async (reason) => {
        try {
            setProcessingCommission(true)
            await sellerAPI.rejectCommissionOffer(reason)
            await loadProfile()
            showMessage('Commission offer rejected', 'info')
        } catch (error) {
            showMessage(error.message || 'Failed to reject commission offer', 'error')
        } finally {
            setProcessingCommission(false)
        }
    }

    // Document submission handler
    const handleDocumentSubmission = async (documents) => {
        try {
            await sellerAPI.submitVerification(documents)
            await loadProfile()
            showMessage('Documents submitted for verification', 'success')
            setShowUpload(false)
        } catch (error) {
            showMessage(error.message || 'Failed to submit documents', 'error')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-[#00FF89] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your profile...</p>
                </div>
            </div>
        )
    }

    if (error || !seller) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Unable to Load Profile</h2>
                    <p className="text-gray-400 mb-6">{error || 'Profile not found'}</p>
                    <button
                        onClick={loadProfile}
                        className="px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    const isApproved = seller.verification?.status === VERIFICATION_STATUSES.APPROVED
    const commissionAccepted = seller.commissionOffer?.status === COMMISSION_STATUSES.ACCEPTED
    const canSell = isApproved && commissionAccepted
    const isCommissionOffered = seller.verification?.status === VERIFICATION_STATUSES.COMMISSION_OFFERED

    // Prepare negotiation state for CommissionNegotiation component
    const negotiationState = isCommissionOffered
        ? {
              canNegotiate: true,
              isCounterOffered: seller.commissionOffer?.status === COMMISSION_STATUSES.COUNTER_OFFERED,
              isAccepted: seller.commissionOffer?.status === COMMISSION_STATUSES.ACCEPTED,
              currentRate: seller.commissionOffer?.rate,
              counterRate: seller.commissionOffer?.counterOffer?.rate,
              negotiationRound: seller.commissionOffer?.negotiationRound || 1,
              maxRounds: 5,
              counterReason: seller.commissionOffer?.counterOffer?.reason,
              lastActivity: seller.commissionOffer?.counterOffer?.submittedAt || seller.commissionOffer?.offeredAt,
              status: seller.commissionOffer?.status
          }
        : null

    return (
        <div className={`${leagueSpartan.className} min-h-screen bg-[#0a0a0a] text-white`}>
            <Head>
                <title>Profile - {seller.fullName} | Spyke AI</title>
                <meta
                    name="description"
                    content={`${seller.fullName}'s seller profile on Spyke AI marketplace.`}
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>

            {/* Global Notification */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 max-w-sm">
                    <InlineNotification
                        type={notification.type}
                        message={notification.message}
                        onDismiss={() => setNotification(null)}
                    />
                </div>
            )}

            {/* Hero Section */}
            <section className="relative">
                {/* Profile Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Profile Info */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#00FF89] to-blue-500 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-black">
                                    {seller.fullName?.charAt(0) || 'S'}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-[#00FF89] rounded-full hover:bg-[#00FF89]/90 transition-colors">
                                    <Edit3 className="w-4 h-4 text-black" />
                                </button>
                            </div>

                            {/* Name and Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{seller.fullName}</h1>
                                    <VerificationBadge
                                        status={seller.verification?.status}
                                        size="large"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-300 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{seller.email}</span>
                                    </div>
                                    {seller.location?.country && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">{seller.location.country}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Since {formatDate(seller.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Specializations */}
                                <div className="flex flex-wrap gap-2">
                                    {seller.niches?.map((niche) => (
                                        <span
                                            key={niche}
                                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                                            {niche}
                                        </span>
                                    ))}
                                    {seller.toolsSpecialization?.map((tool) => (
                                        <span
                                            key={tool}
                                            className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1f1f1f] border border-gray-700 rounded-xl hover:border-gray-600 transition-colors">
                                <Settings className="w-5 h-5" />
                                <span>Edit Profile</span>
                            </button>
                            {(seller.verification?.status === VERIFICATION_STATUSES.PENDING ||
                                seller.verification?.status === VERIFICATION_STATUSES.UNDER_REVIEW) && (
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-xl font-semibold hover:bg-amber-500/90 transition-colors">
                                    <Upload className="w-5 h-5" />
                                    <span>Submit Documents</span>
                                </button>
                            )}
                            {canSell && (
                                <Link
                                    href="/seller/products/create"
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF89] text-black rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-colors">
                                    <Plus className="w-5 h-5" />
                                    <span>Add Product</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Verification & Commission Progress */}
                <div className="mb-8">
                    <CommissionProgressStepper
                        verificationStatus={seller.verification?.status}
                        commissionStatus={seller.commissionOffer?.status}
                        hasCounterOffer={seller.commissionOffer?.status === COMMISSION_STATUSES.COUNTER_OFFERED}
                        acceptedAt={seller.commissionOffer?.acceptedAt}
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* Commission Negotiation Section */}
                        {negotiationState && (
                            <section>
                                <h2 className="text-xl font-semibold text-white mb-6">Commission Negotiation</h2>
                                <CommissionNegotiation
                                    negotiationState={negotiationState}
                                    onAccept={handleAcceptCommission}
                                    onCounter={handleCounterOffer}
                                    onReject={handleRejectCommission}
                                    processing={processingCommission}
                                    formatCurrency={formatCurrency}
                                />
                            </section>
                        )}

                        {/* Stats Overview */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-6">Performance Overview</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatsCard
                                    icon={DollarSign}
                                    label="Total Earnings"
                                    value={formatCurrency(seller.stats?.totalEarnings || 0)}
                                    color="emerald"
                                />
                                <StatsCard
                                    icon={ShoppingCart}
                                    label="Total Sales"
                                    value={seller.stats?.totalSales || 0}
                                    color="blue"
                                />
                                <StatsCard
                                    icon={Package}
                                    label="Products"
                                    value={seller.stats?.totalProducts || 0}
                                    color="purple"
                                />
                                <StatsCard
                                    icon={Eye}
                                    label="Profile Views"
                                    value={seller.stats?.profileViews || 0}
                                    color="amber"
                                />
                            </div>
                        </section>

                        {/* About Section */}
                        {seller.bio && (
                            <section>
                                <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                                <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6">
                                    <p className="text-gray-300 leading-relaxed">{seller.bio}</p>
                                </div>
                            </section>
                        )}

                        {/* Quick Actions Grid */}
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ActionCard
                                    icon={Package}
                                    title="Manage Products"
                                    description="Add, edit, and organize your products"
                                    href="/seller/products"
                                    enabled={canSell}
                                    gradient="from-[#00FF89] to-emerald-400"
                                />
                                <ActionCard
                                    icon={ShoppingCart}
                                    title="View Orders"
                                    description="Track and fulfill customer orders"
                                    href="/seller/orders"
                                    enabled={canSell}
                                    gradient="from-blue-500 to-blue-600"
                                />
                                <ActionCard
                                    icon={BarChart3}
                                    title="Analytics"
                                    description="View detailed performance metrics"
                                    href="/seller/analytics"
                                    enabled={canSell}
                                    gradient="from-purple-500 to-purple-600"
                                />
                                <ActionCard
                                    icon={CreditCard}
                                    title="Payouts"
                                    description="Manage earnings and payments"
                                    href="/seller/payouts"
                                    enabled={canSell}
                                    gradient="from-amber-500 to-orange-500"
                                />
                                <ActionCard
                                    icon={Users}
                                    title="Customers"
                                    description="View customer interactions"
                                    href="/seller/customers"
                                    enabled={canSell}
                                    gradient="from-pink-500 to-rose-500"
                                />
                                <ActionCard
                                    icon={Settings}
                                    title="Settings"
                                    description="Configure account preferences"
                                    href="/seller/settings"
                                    enabled={true}
                                    gradient="from-gray-500 to-gray-600"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Commission Negotiation History */}
                        {isCommissionOffered && (
                            <CommissionNegotiationHistory
                                commissionOffer={seller.commissionOffer}
                                verificationStatus={seller.verification?.status}
                            />
                        )}

                        {/* Business Information */}
                        <BusinessInfoCard seller={seller} />

                        {/* Payout Information */}
                        <PayoutInfoCard
                            seller={seller}
                            formatCurrency={formatCurrency}
                        />

                        {/* Website & Links */}
                        {(seller.websiteUrl || seller.portfolioLinks?.length > 0) && <LinksCard seller={seller} />}

                        {/* Social Handles */}
                        {Object.values(seller.socialHandles || {}).some((handle) => handle) && <SocialHandlesCard seller={seller} />}

                        {/* Recent Activity */}
                        <RecentActivityCard />
                    </div>
                </div>
            </div>

            {/* Document Upload Modal */}
            <DocumentUploadModal
                isOpen={showUpload}
                onClose={() => setShowUpload(false)}
                onSuccess={loadProfile}
            />
        </div>
    )
}

/* ========================= COMPONENTS ========================= */

const StatsCard = ({ icon: Icon, label, value, color, trend }) => {
    const colors = {
        emerald: 'from-[#00FF89]/20 to-[#00FF89]/5 border-[#00FF89]/30 text-[#00FF89]',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400'
    }

    return (
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br border ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3 text-[#00FF89]" />
                        <span className="text-[#00FF89] font-medium">+{trend}%</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-2xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm text-gray-300">{label}</p>
            </div>
        </div>
    )
}

const ActionCard = ({ icon: Icon, title, description, href, enabled, gradient }) => {
    const cardContent = (
        <div
            className={`bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6 h-full transition-all duration-300 ${
                enabled ? 'hover:border-gray-700 hover:scale-105' : 'opacity-60'
            }`}>
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
                </div>
                <div className="mt-auto">
                    {enabled ? (
                        <div className="flex items-center text-sm text-[#00FF89] font-medium">
                            <span>Open</span>
                            <ExternalLink className="w-4 h-4 ml-1" />
                        </div>
                    ) : (
                        <span className="text-xs text-gray-500">Complete verification first</span>
                    )}
                </div>
            </div>
        </div>
    )

    if (enabled) {
        return (
            <Link
                href={href}
                className="block h-full">
                {cardContent}
            </Link>
        )
    }

    return cardContent
}

const BusinessInfoCard = ({ seller }) => (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-[#00FF89]" />
            <h3 className="font-semibold text-white">Business Information</h3>
        </div>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Revenue Share</span>
                <div className="flex items-center gap-2">
                    {seller.revenueShareAgreement?.accepted ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-[#00FF89]" />
                            <span className="text-sm text-[#00FF89]">Accepted</span>
                        </>
                    ) : (
                        <>
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-amber-400">Pending</span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Custom Automation</span>
                <div className="flex items-center gap-2">
                    {seller.customAutomationServices ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-[#00FF89]" />
                            <span className="text-sm text-[#00FF89]">Available</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">Not Available</span>
                        </>
                    )}
                </div>
            </div>

            {seller.location?.timezone && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Timezone</span>
                    <span className="text-sm text-white">{seller.location.timezone}</span>
                </div>
            )}
        </div>
    </div>
)

const PayoutInfoCard = ({ seller, formatCurrency }) => (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-[#00FF89]" />
            <h3 className="font-semibold text-white">Payout Information</h3>
        </div>

        {/* Available Balance */}
        <div className="p-4 rounded-xl border border-[#00FF89]/20 bg-[#00FF89]/5 mb-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-[#00FF89]/80">Available Balance</span>
                <span className="text-xl font-bold text-[#00FF89]">{formatCurrency(seller.stats?.totalEarnings || 0)}</span>
            </div>
        </div>

        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Method</span>
                <span className="text-sm text-white capitalize">{seller.payoutInfo?.method || 'Not Set'}</span>
            </div>

            {seller.payoutInfo?.paypalEmail && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">PayPal Email</span>
                    <span className="text-sm text-white truncate max-w-32">{seller.payoutInfo.paypalEmail}</span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <div className="flex items-center gap-2">
                    {seller.payoutInfo?.isVerified ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-[#00FF89]" />
                            <span className="text-sm text-[#00FF89]">Verified</span>
                        </>
                    ) : (
                        <>
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-amber-400">Pending</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
)

const LinksCard = ({ seller }) => (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-[#00FF89]" />
            <h3 className="font-semibold text-white">Links</h3>
        </div>
        <div className="space-y-3">
            {seller.websiteUrl && (
                <a
                    href={seller.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group">
                    <Globe className="w-4 h-4 text-gray-400 group-hover:text-[#00FF89]" />
                    <span className="text-sm text-gray-300 group-hover:text-white truncate">Website</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
            )}
            {seller.portfolioLinks?.map((link, index) => (
                <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group">
                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-[#00FF89]" />
                    <span className="text-sm text-gray-300 group-hover:text-white truncate">Portfolio {index + 1}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
            ))}
        </div>
    </div>
)

const SocialHandlesCard = ({ seller }) => {
    const socialPlatforms = [
        { key: 'linkedin', icon: '💼', label: 'LinkedIn' },
        { key: 'twitter', icon: '🐦', label: 'Twitter' },
        { key: 'instagram', icon: '📸', label: 'Instagram' },
        { key: 'youtube', icon: '📺', label: 'YouTube' }
    ]

    const activeSocials = socialPlatforms.filter((platform) => seller.socialHandles?.[platform.key])

    if (activeSocials.length === 0) return null

    return (
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#00FF89]" />
                <h3 className="font-semibold text-white">Social Media</h3>
            </div>
            <div className="space-y-3">
                {activeSocials.map((platform) => (
                    <a
                        key={platform.key}
                        href={seller.socialHandles[platform.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group">
                        <span className="text-lg">{platform.icon}</span>
                        <span className="text-sm text-gray-300 group-hover:text-white">{platform.label}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                ))}
            </div>
        </div>
    )
}

const RecentActivityCard = () => (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#00FF89]" />
            <h3 className="font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400">No recent activity</p>
            <p className="text-xs text-gray-500 mt-1">Your activity will appear here</p>
        </div>
    </div>
)


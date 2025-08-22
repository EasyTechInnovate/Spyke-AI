'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
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
    Star,
    Clock
} from 'lucide-react'
import sellerAPI from '@/lib/api/seller'
import { leagueSpartan } from '@/lib/fonts'

// Import Design System Components
import {
    DESIGN_TOKENS,
    DSButton,
    DSHeading,
    DSText,
    DSContainer,
    DSStack,
    DSLoadingState,
    DSBadge,
    DSStatsCard,
    DSFormInput
} from '@/lib/design-system'

import InlineNotification from '@/components/shared/notifications/InlineNotification'

/* ========================= DESIGN SYSTEM CARD COMPONENTS ========================= */
function DSCard({ children, className = '', variant = 'elevated', style, ...props }) {
    const baseStyles = {
        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
        border: `1px solid ${DESIGN_TOKENS.colors.background.elevated}`,
        borderRadius: DESIGN_TOKENS.borderRadius['2xl'],
        transition: `all ${DESIGN_TOKENS.animation.duration.normal} ${DESIGN_TOKENS.animation.easing.easeOut}`,
        fontFamily: DESIGN_TOKENS.typography.fontFamily.title
    }

    const variantStyles = {
        elevated: {
            boxShadow: '0 1px 0 rgba(255,255,255,0.03)'
        },
        interactive: {
            cursor: 'pointer',
            '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0, 255, 137, 0.1)'
            }
        }
    }

    return (
        <div
            style={{ ...baseStyles, ...variantStyles[variant], ...style }}
            className={`ds-card ds-card--${variant} ds-card-normalize ${className}`}
            {...props}>
            {children}
        </div>
    )
}

const DSCardHeader = ({ children, className = '' }) => <div className={`px-5 pt-5 ${className}`}>{children}</div>

const DSCardContent = ({ children, className = '' }) => <div className={`px-5 pb-5 ${className}`}>{children}</div>

const DSCardFooter = ({ children, className = '' }) => <div className={`px-5 pb-5 ${className}`}>{children}</div>

/* ========================= RESPONSIVE LAYOUT SYSTEM ========================= */
/** Enhanced responsive layout with proper card alignment - Fixed spacing issue */
function ResponsiveSellerShell({ header, sidebar, statsRow, children, rightRail }) {
    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor: DESIGN_TOKENS.colors.background.dark,
                fontFamily: DESIGN_TOKENS.typography.fontFamily.title
            }}>
            {header}
            {/* Remove DSContainer padding to eliminate gap */}
            <div className="w-full max-w-[120rem] mx-auto px-0">
                {/* HERO SECTION: Profile + Stats - Fully responsive */}
                <section className="pt-4 sm:pt-6 lg:pt-8 pl-3 sm:pl-6 lg:pl-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                        {/* Profile Identity - Takes full width on mobile, 4 cols on desktop */}
                        <div className="lg:col-span-4">
                            <div className="h-full">{sidebar}</div>
                        </div>
                        
                        {/* Stats Row - Takes full width on mobile, 8 cols on desktop */}
                        <div className="lg:col-span-8">
                            <div className="h-full">{statsRow}</div>
                        </div>
                    </div>
                </section>

                {/* MAIN CONTENT SECTION: Content + Sidebar - Responsive stacking */}
                <section className="py-6 sm:py-8 pl-3 sm:pl-6 lg:pl-8 pr-3 sm:pr-6 lg:pr-8">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
                        {/* Main Content Area - Full width on mobile/tablet, 8 cols on xl */}
                        <div className="xl:col-span-8">
                            <div className="space-y-6">{children}</div>
                        </div>

                        {/* Right Sidebar - Full width on mobile/tablet, 4 cols on xl */}
                        <div className="xl:col-span-4">
                            <div className="space-y-6">{rightRail}</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

/* ========================= SIDEBAR IDENTITY ========================= */
function SellerIdentity({ seller, verificationApproved }) {
    return (
        <DSCard className="h-full">
            <DSCardHeader>
                <DSStack
                    direction="row"
                    gap="3"
                    align="center">
                    <div
                        className="h-12 w-12 rounded-xl"
                        style={{
                            background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.brand.primary}, ${DESIGN_TOKENS.colors.brand.secondary})`
                        }}
                    />
                    <div className="min-w-0 flex-1">
                        <DSHeading
                            level={3}
                            variant="subhero"
                            className="truncate text-white">
                            {seller.fullName}
                        </DSHeading>
                        <DSText
                            size="sm"
                            className="truncate"
                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                            {seller.email}
                        </DSText>
                    </div>
                </DSStack>
            </DSCardHeader>
            <DSCardContent>
                <div
                    className="flex items-center justify-between rounded-xl border px-3 py-2"
                    style={{ borderColor: DESIGN_TOKENS.colors.background.elevated }}>
                    <DSText
                        size="sm"
                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        Verification
                    </DSText>
                    <DSStack
                        direction="row"
                        gap="2"
                        align="center">
                        {verificationApproved ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <DSText
                                    size="sm"
                                    className="text-white">
                                    Approved
                                </DSText>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-4 w-4 text-amber-400" />
                                <DSText
                                    size="sm"
                                    className="text-white">
                                    Pending
                                </DSText>
                            </>
                        )}
                    </DSStack>
                </div>
            </DSCardContent>
        </DSCard>
    )
}

/* ========================= ENHANCED STATS ROW ========================= */
function EnhancedStatsRow({ stats, onStatClick }) {
    const avg = Number(stats.averageRating || 0)
    
    const statItems = [
        {
            title: "Total Earnings",
            value: stats.formatted.totalEarnings,
            sub: "All time",
            icon: CreditCard,
            onClick: () => onStatClick('earnings'),
            color: 'emerald'
        },
        {
            title: "Total Sales", 
            value: String(stats.totalSales),
            sub: "Orders completed",
            icon: ShoppingCart,
            onClick: () => onStatClick('sales'),
            color: 'blue'
        },
        {
            title: "Active Products",
            value: String(stats.totalProducts), 
            sub: "Live in store",
            icon: Package,
            onClick: () => onStatClick('products'),
            color: 'purple'
        },
        {
            title: "Avg. Rating",
            value: avg.toFixed(1),
            sub: `${stats.totalReviews} reviews`,
            icon: Star,
            onClick: () => onStatClick('rating'),
            color: 'amber'
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
            {statItems.map((item, index) => (
                <ResponsiveStatCard key={item.title} {...item} />
            ))}
        </div>
    )
}

/* ========================= RESPONSIVE STAT CARD ========================= */
function ResponsiveStatCard({ title, value, sub, icon: Icon, onClick, color }) {
    return (
        <DSCard 
            variant="interactive" 
            className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
            <button 
                onClick={onClick} 
                className="w-full h-full p-4 sm:p-5 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#00FF89] rounded-2xl"
            >
                <div className="flex items-start justify-between h-full">
                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                        <DSText 
                            size="sm" 
                            className="mb-1 sm:mb-2"
                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                        >
                            {title}
                        </DSText>
                        <DSHeading 
                            level={2} 
                            className="text-white font-bold text-lg sm:text-xl lg:text-2xl truncate mb-1"
                        >
                            {value}
                        </DSHeading>
                        {sub && (
                            <DSText 
                                size="xs" 
                                className="text-gray-400"
                            >
                                {sub}
                            </DSText>
                        )}
                    </div>
                    
                    {/* Icon Section */}
                    <div className="flex-shrink-0 ml-3">
                        <div 
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                            style={{ 
                                backgroundColor: `${DESIGN_TOKENS.colors.brand.primary}15`,
                                color: DESIGN_TOKENS.colors.brand.primary 
                            }}
                        >
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                </div>
            </button>
        </DSCard>
    )
}

/* ========================= ENHANCED QUICK ACTIONS ========================= */
function EnhancedQuickActions({ permissions }) {
    const actions = [
        {
            label: 'Products',
            icon: Package,
            href: '/seller/products',
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.brand.primary}, #34d399)`,
            enabled: permissions.canAddProducts,
            description: 'Manage your products'
        },
        {
            label: 'Orders', 
            icon: ShoppingCart,
            href: '/seller/orders',
            gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            enabled: permissions.canManageOrders,
            description: 'View and manage orders'
        },
        {
            label: 'Analytics',
            icon: BarChart3,
            href: '/seller/analytics', 
            gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            enabled: permissions.canViewAnalytics,
            description: 'View detailed analytics'
        },
        {
            label: 'Customers',
            icon: Users,
            href: '/seller/customers',
            gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.brand.secondary}, #f97316)`,
            enabled: permissions.canViewAnalytics,
            description: 'Manage relationships'
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {actions.map((action) => (
                <ResponsiveActionCard key={action.label} {...action} />
            ))}
        </div>
    )
}

/* ========================= RESPONSIVE ACTION CARD ========================= */
function ResponsiveActionCard({ label, icon: Icon, href, gradient, enabled, description }) {
    const cardContent = (
        <DSCard className={`h-full transition-all duration-300 ${
            enabled 
                ? 'hover:scale-105 hover:shadow-xl cursor-pointer' 
                : 'opacity-60 cursor-not-allowed'
        }`}>
            <DSCardContent className="p-4 sm:p-6 text-center h-full flex flex-col justify-between">
                {/* Icon */}
                <div className="mb-4">
                    <div 
                        className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl flex items-center justify-center"
                        style={{ background: enabled ? gradient : 'rgba(156, 163, 175, 0.2)' }}
                    >
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                    <DSHeading 
                        level={3} 
                        className="text-white font-semibold mb-2 text-base sm:text-lg"
                    >
                        {label}
                    </DSHeading>
                    <DSText 
                        size="sm" 
                        className="text-gray-400"
                    >
                        {enabled ? description : 'Complete verification first'}
                    </DSText>
                </div>
            </DSCardContent>
        </DSCard>
    )

    if (enabled) {
        return (
            <Link href={href} className="block h-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#00FF89] rounded-2xl">
                {cardContent}
            </Link>
        )
    }

    return <div className="h-full">{cardContent}</div>
}

/* ========================= RESPONSIVE SIDEBAR CARDS ========================= */
function ResponsiveBusinessReadiness({ permissions, seller }) {
    const items = [
        { 
            label: 'Account Verified', 
            done: !!permissions.isApproved,
            icon: permissions.isApproved ? CheckCircle2 : XCircle,
            color: permissions.isApproved ? 'text-emerald-400' : 'text-amber-400'
        },
        { 
            label: 'Commission Accepted', 
            done: !!permissions.commissionAccepted || !!seller?.commissionOffer?.acceptedAt,
            icon: (!!permissions.commissionAccepted || !!seller?.commissionOffer?.acceptedAt) ? CheckCircle2 : XCircle,
            color: (!!permissions.commissionAccepted || !!seller?.commissionOffer?.acceptedAt) ? 'text-emerald-400' : 'text-amber-400'
        },
        { 
            label: 'First Product Added', 
            done: (seller?.stats?.totalProducts ?? 0) > 0,
            icon: (seller?.stats?.totalProducts ?? 0) > 0 ? CheckCircle2 : XCircle,
            color: (seller?.stats?.totalProducts ?? 0) > 0 ? 'text-emerald-400' : 'text-amber-400'
        }
    ]
    
    const completed = items.filter(i => i.done).length
    const progress = (completed / items.length) * 100

    return (
        <DSCard className="h-full">
            <DSCardHeader>
                <div className="flex items-center justify-between">
                    <DSHeading level={3} className="text-white">
                        Business Readiness
                    </DSHeading>
                    <DSBadge variant="primary" size="small">
                        {Math.round(progress)}%
                    </DSBadge>
                </div>
            </DSCardHeader>
            
            <DSCardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${DESIGN_TOKENS.colors.brand.primary}, #34d399)`
                        }}
                    />
                </div>
                
                {/* Checklist Items */}
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div 
                            key={item.label}
                            className="flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:border-gray-600"
                            style={{ borderColor: DESIGN_TOKENS.colors.background.elevated }}
                        >
                            <DSText size="sm" className="text-white flex-1">
                                {item.label}
                            </DSText>
                            <item.icon className={`w-5 h-5 ${item.color} ml-2`} />
                        </div>
                    ))}
                </div>
                
                <DSText 
                    size="sm" 
                    className="text-center pt-2"
                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                >
                    {completed} of {items.length} completed
                </DSText>
            </DSCardContent>
        </DSCard>
    )
}

/* ========================= ENHANCED METRICS CARD ========================= */
function ResponsiveMetricsCard({ stats }) {
    const metrics = [
        { key: 'Impressions', value: stats.metrics?.impressions ?? '—', icon: '👁️' },
        { key: 'Clicks', value: stats.metrics?.clicks ?? '—', icon: '👆' },
        { key: 'CTR', value: stats.metrics?.ctr ?? '—', icon: '📊' },
        { key: 'ROAS', value: stats.metrics?.roas ?? '—', icon: '💰' }
    ]

    return (
        <DSCard className="h-full">
            <DSCardHeader>
                <DSStack direction="row" gap="2" align="center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <DSHeading level={3} className="text-white">
                        Performance (7 days)
                    </DSHeading>
                </DSStack>
            </DSCardHeader>
            
            <DSCardContent>
                <div className="grid grid-cols-2 gap-4">
                    {metrics.map((metric) => (
                        <div 
                            key={metric.key}
                            className="p-4 rounded-xl border transition-all duration-200 hover:border-gray-600 text-center"
                            style={{ borderColor: DESIGN_TOKENS.colors.background.elevated }}
                        >
                            <div className="text-2xl mb-2">{metric.icon}</div>
                            <DSText 
                                size="xs" 
                                className="mb-1"
                                style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                            >
                                {metric.key}
                            </DSText>
                            <DSText size="lg" className="font-semibold text-white">
                                {metric.value}
                            </DSText>
                        </div>
                    ))}
                </div>
            </DSCardContent>
        </DSCard>
    )
}

/* ========================= COMMISSION NEGOTIATION ========================= */
const CommissionNegotiation = ({ negotiationState, onAccept, onCounterOffer }) => {
    const [counterOfferRate, setCounterOfferRate] = useState('')
    const [counterOfferReason, setCounterOfferReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showCounterForm, setShowCounterForm] = useState(false)

    const isWaitingForAdmin = negotiationState?.status === 'counter_offered' && negotiationState?.lastOfferedBy === 'seller'
    const hasCommissionOffer = negotiationState?.status === 'pending' && negotiationState?.currentRate && negotiationState?.currentRate > 0
    const isPendingOffer = negotiationState?.status === 'pending' && (!negotiationState?.currentRate || negotiationState?.currentRate === 0)

    const handleCounterOffer = async () => {
        if (!counterOfferRate || !counterOfferReason) return

        setIsSubmitting(true)
        try {
            await onCounterOffer({ rate: parseFloat(counterOfferRate), reason: counterOfferReason })
            setCounterOfferRate('')
            setCounterOfferReason('')
            setShowCounterForm(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        setShowCounterForm(false)
        setCounterOfferRate('')
        setCounterOfferReason('')
    }

    return (
        <DSCard className="border-yellow-500/20 bg-yellow-500/5">
            <DSCardContent className="p-6">
                <DSStack
                    direction="row"
                    gap="3"
                    align="flex-start">
                    <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <DSHeading
                            level={3}
                            className="text-white mb-2">
                            Commission Rate Negotiation
                        </DSHeading>

                        {isWaitingForAdmin ? (
                            <DSStack gap="3">
                                <DSText className="text-white">
                                    Your counter offer of{' '}
                                    <span className="font-semibold text-yellow-400">{negotiationState.counterOffer?.rate}%</span> has been submitted.
                                </DSText>
                                <DSText
                                    size="sm"
                                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                    Reason: {negotiationState.counterOffer?.reason}
                                </DSText>
                                <DSStack
                                    direction="row"
                                    gap="2"
                                    align="center"
                                    className="text-yellow-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                                    <DSText size="sm">Waiting for admin response...</DSText>
                                </DSStack>
                            </DSStack>
                        ) : hasCommissionOffer ? (
                            <DSStack gap="4">
                                <DSText className="text-white">
                                    Admin has offered a commission rate of{' '}
                                    <span className="font-semibold text-yellow-400">{negotiationState.currentRate}%</span>
                                </DSText>
                                <DSText
                                    size="sm"
                                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                    Negotiation Round: {negotiationState.negotiationRound}
                                </DSText>

                                {!showCounterForm ? (
                                    <DSStack
                                        direction="row"
                                        gap="3">
                                        <DSButton
                                            variant="primary"
                                            onClick={() => onAccept()}>
                                            Accept {negotiationState.currentRate}%
                                        </DSButton>
                                        <DSButton
                                            variant="secondary"
                                            onClick={() => setShowCounterForm(true)}>
                                            Counter Offer
                                        </DSButton>
                                    </DSStack>
                                ) : (
                                    <div className="space-y-3 pt-4 border-t border-yellow-500/20">
                                        <DSStack gap="3">
                                            <DSFormInput
                                                label="Your Counter Offer Rate (%)"
                                                type="number"
                                                min="1"
                                                max="50"
                                                step="0.5"
                                                value={counterOfferRate}
                                                onChange={(e) => setCounterOfferRate(e.target.value)}
                                                placeholder="Enter rate"
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-white mb-1">Reason for Counter Offer</label>
                                                <textarea
                                                    value={counterOfferReason}
                                                    onChange={(e) => setCounterOfferReason(e.target.value)}
                                                    className="w-full px-3 py-2 border border-[#2b2b2b] bg-[#1f1f1f] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                    rows="3"
                                                    placeholder="Explain why you're requesting this rate"
                                                />
                                            </div>

                                            <DSStack
                                                direction="row"
                                                gap="3">
                                                <DSButton
                                                    variant="primary"
                                                    onClick={handleCounterOffer}
                                                    disabled={!counterOfferRate || !counterOfferReason || isSubmitting}
                                                    loading={isSubmitting}>
                                                    Submit Counter Offer
                                                </DSButton>
                                                <DSButton
                                                    variant="secondary"
                                                    onClick={handleCancel}>
                                                    Cancel
                                                </DSButton>
                                            </DSStack>
                                        </DSStack>
                                    </div>
                                )}
                            </DSStack>
                        ) : isPendingOffer ? (
                            <DSStack gap="3">
                                <DSText className="text-white">Your verification is complete. Admin will offer a commission rate soon.</DSText>
                                <DSStack
                                    direction="row"
                                    gap="2"
                                    align="center"
                                    className="text-yellow-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                                    <DSText size="sm">Waiting for commission offer...</DSText>
                                </DSStack>
                            </DSStack>
                        ) : (
                            <DSStack gap="3">
                                <DSText className="text-white">Commission negotiation in progress...</DSText>
                            </DSStack>
                        )}
                    </div>
                </DSStack>
            </DSCardContent>
        </DSCard>
    )
}

/* ========================= UPLOAD MODAL ========================= */
function DocumentUploadModal({ open, onClose, onSuccess }) {
    const [uploading, setUploading] = useState(false)
    const [files, setFiles] = useState({ identityProof: null, businessProof: null, taxDocument: null })
    const [notification, setNotification] = useState(null)

    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }

    const clearNotification = () => setNotification(null)

    if (!open) return null

    const submit = async () => {
        try {
            if (!files.identityProof && !files.businessProof && !files.taxDocument) {
                showMessage('Please select at least one document', 'error')
                return
            }
            setUploading(true)
            const fd = new FormData()
            if (files.identityProof) fd.append('identityProof', files.identityProof)
            if (files.businessProof) fd.append('businessProof', files.businessProof)
            if (files.taxDocument) fd.append('taxDocument', files.taxDocument)
            await sellerAPI.submitVerification(fd)
            showMessage('Documents submitted for verification', 'success')
            setTimeout(() => onSuccess(), 1500)
        } catch (e) {
            showMessage(e?.message || 'Upload failed', 'error')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <DSCard className="w-full max-w-md p-6">
                {notification && (
                    <div className="mb-4">
                        <InlineNotification
                            type={notification.type}
                            message={notification.message}
                            onDismiss={clearNotification}
                        />
                    </div>
                )}

                <DSHeading
                    level={3}
                    className="text-white">
                    Upload Documents
                </DSHeading>
                <DSText
                    size="sm"
                    className="mt-1"
                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                    PAN / GST / Business Proof
                </DSText>

                <div className="mt-4 grid gap-3">
                    {['identityProof', 'businessProof', 'taxDocument'].map((key) => (
                        <DSFormInput
                            key={key}
                            label={key.replace(/([A-Z])/g, ' $1')}
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setFiles((f) => ({ ...f, [key]: e.target.files?.[0] || null }))}
                        />
                    ))}

                    <DSStack
                        direction="row"
                        justify="flex-end"
                        gap="2"
                        className="pt-2">
                        <DSButton
                            variant="secondary"
                            onClick={onClose}>
                            Cancel
                        </DSButton>
                        <DSButton
                            variant="primary"
                            onClick={submit}
                            disabled={uploading}
                            loading={uploading}>
                            <FileText className="h-4 w-4" />
                            Upload
                        </DSButton>
                    </DSStack>
                </div>
            </DSCard>
        </div>
    )
}

/* ========================= DATA HOOK (sellerAPI) ========================= */
function useSellerDashboard() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedCurrency, setSelectedCurrency] = useState('INR')
    const [seller, setSeller] = useState(null)
    const [stats, setStats] = useState({
        totalEarnings: 0,
        totalSales: 0,
        totalProducts: 0,
        averageRating: 0,
        totalReviews: 0,
        formatted: { totalEarnings: '₹0' },
        metrics: {}
    })
    const [permissions, setPermissions] = useState({
        isApproved: false,
        commissionAccepted: false,
        canAddProducts: false,
        canManageOrders: false,
        canViewAnalytics: false
    })
    const [negotiationState, setNegotiationState] = useState(null)
    const [processingOffer, setProcessingOffer] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const profile = await sellerAPI.getProfile()
            const d = profile?.data || profile || {}
            // Fix: Include commission_offered as approved status since verification is complete at that stage
            const isApproved = d?.verification?.status === 'approved' || d?.verification?.status === 'commission_offered'
            // Fix: Only check commission offer status, not revenue share agreement
            const commissionAccepted = d?.commissionOffer?.status === 'accepted'

            setSeller({
                fullName: d.fullName,
                email: d.email,
                bio: d.bio,
                payoutInfo: {
                    method: d?.payoutInfo?.method || 'bank transfer',
                    paypalEmail: d?.payoutInfo?.paypalEmail || '',
                    isVerified: !!d?.payoutInfo?.isVerified
                },
                commissionOffer: { acceptedAt: d?.commissionOffer?.acceptedAt || null, rate: d?.commissionOffer?.rate ?? 10 },
                revenueShareAgreement: { accepted: d?.revenueShareAgreement?.accepted ?? false },
                verification: {
                    status: d?.verification?.status || 'pending',
                    submittedAt: d?.verification?.submittedAt || null,
                    documents: d?.verification?.documents || [],
                    feedback: d?.verification?.feedback || null
                },
                completionPercentage: d?.completionPercentage || 0
            })

            setStats({
                totalEarnings: d?.stats?.totalEarnings ?? 0,
                totalSales: d?.stats?.totalSales ?? 0,
                totalProducts: d?.stats?.totalProducts ?? 0,
                averageRating: d?.stats?.averageRating ?? 0,
                totalReviews: d?.stats?.totalReviews ?? 0,
                formatted: {
                    totalEarnings: new Intl.NumberFormat('en-IN', { style: 'currency', currency: selectedCurrency, maximumFractionDigits: 0 }).format(
                        d?.stats?.totalEarnings ?? 0
                    )
                },
                metrics: { impressions: '—', clicks: '—', ctr: '—', roas: '—' }
            })

            setPermissions({
                isApproved,
                commissionAccepted,
                canAddProducts: isApproved && commissionAccepted, // Only allow products after commission is accepted
                canManageOrders: isApproved && commissionAccepted,
                canViewAnalytics: isApproved && commissionAccepted
            })

            // Fix the commission negotiation state logic
            const hasCommissionOffer = d?.verification?.status === 'commission_offered'
            const commissionStatus = d?.commissionOffer?.status
            const commissionAcceptedAt = d?.commissionOffer?.acceptedAt

            // Show negotiation if there's an offer and it hasn't been accepted yet
            const shouldShowNegotiation = hasCommissionOffer && !commissionAcceptedAt && commissionStatus !== 'accepted'

            setNegotiationState(
                shouldShowNegotiation
                    ? {
                          isAccepted: false,
                          currentRate: d?.commissionOffer?.rate || 10,
                          negotiationRound: d?.commissionOffer?.negotiationRound || 1,
                          lastOfferedBy: d?.commissionOffer?.lastOfferedBy || 'admin',
                          status: d?.commissionOffer?.status || 'pending',
                          counterOffer: d?.commissionOffer?.counterOffer || null
                      }
                    : null
            )

            setError(null)
        } catch (e) {
            setError({ message: e?.message || 'Failed to load seller profile' })
        } finally {
            setLoading(false)
        }
    }, [selectedCurrency])

    useEffect(() => {
        load()
    }, [load])

    const formatCurrency = useCallback(
        (amount) => {
            try {
                return new Intl.NumberFormat('en-IN', { style: 'currency', currency: selectedCurrency, maximumFractionDigits: 0 }).format(amount)
            } catch {
                return `₹${Math.round(amount).toLocaleString('en-IN')}`
            }
        },
        [selectedCurrency]
    )

    const accept = async () => {
        try {
            setProcessingOffer(true)
            await sellerAPI.acceptCommissionOffer()
            showMessage('Offer accepted', 'success')
            await load()
            return true
        } catch (e) {
            showMessage(e?.message || 'Accept failed', 'error')
            return false
        } finally {
            setProcessingOffer(false)
        }
    }
    const counter = async ({ rate, reason }) => {
        try {
            await sellerAPI.submitCounterOffer({ rate, reason })
            return true
        } catch (e) {
            showMessage(e?.message || 'Counter failed', 'error')
            return false
        }
    }
    const reject = async (reason) => {
        try {
            await sellerAPI.rejectCommissionOffer(reason || 'Not viable')
            toast.message('Offer rejected')
            return true
        } catch (e) {
            showMessage(e?.message || 'Reject failed', 'error')
            return false
        }
    }

    const refresh = async () => {
        await load()
    }

    return {
        seller,
        loading,
        error,
        stats,
        selectedCurrency,
        setSelectedCurrency,
        formatCurrency,
        verificationStatus: { isApproved: permissions.isApproved },
        negotiationState,
        permissions,
        handleAcceptOffer: accept,
        handleCounterOffer: counter,
        handleRejectOffer: reject,
        processingOffer,
        refresh
    }
}

/* ========================= CURRENCY ========================= */
function CurrencySelector({ selectedCurrency, onChange }) {
    const currencies = useMemo(
        () => [
            { code: 'USD', label: 'USD ($)' },
            { code: 'INR', label: 'INR (₹)' },
            { code: 'EUR', label: 'EUR (€)' },
            { code: 'GBP', label: 'GBP (£)' },
            { code: 'AUD', label: 'AUD (A$)' },
            { code: 'CAD', label: 'CAD (C$)' },
            { code: 'SGD', label: 'SGD (S$)' },
            { code: 'AED', label: 'AED' }
        ],
        []
    )
    return (
        <div className="relative">
            <select
                value={selectedCurrency}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none border border-[#374151] bg-[#1f1f1f] px-3 py-2 pr-8 text-sm text-white rounded-lg focus:outline-none">
                {currencies.map((c) => (
                    <option
                        key={c.code}
                        value={c.code}
                        className="bg-[#1f1f1f] text-white">
                        {c.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
        </div>
    )
}

/* ========================= PAGE ========================= */
export default function SellerProfile() {
    const router = useRouter()
    const {
        seller,
        loading,
        error,
        stats,
        selectedCurrency,
        setSelectedCurrency,
        formatCurrency,
        verificationStatus,
        negotiationState,
        permissions,
        handleAcceptOffer,
        handleCounterOffer,
        handleRejectOffer,
        processingOffer,
        refresh
    } = useSellerDashboard()

    const [showUpload, setShowUpload] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)

    const onAccept = async () => {
        const ok = await handleAcceptOffer()
        if (ok) {
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 1300)
        }
    }
    const onCounter = async (data) => {
        const ok = await handleCounterOffer(data)
        if (ok) showMessage('Counter offer submitted', 'success')
    }
    const onReject = async (reason) => {
        const ok = await handleRejectOffer(reason)
        if (ok) showMessage('Offer rejected', 'success')
    }

    const handleStatClick = (k) => {
        const r = {
            earnings: '/seller/analytics?tab=earnings',
            sales: '/seller/orders',
            products: '/seller/products',
            rating: '/seller/analytics?tab=reviews'
        }
        if (permissions.canViewAnalytics && r[k]) router.push(r[k])
    }

    const onUploadSuccess = () => {
        setShowUpload(false)
        refresh()
    }

    // Priority logic: Show verification alert first, then commission negotiation
    const shouldShowVerificationAlert = !verificationStatus.isApproved
    const shouldShowCommissionNegotiation = !shouldShowVerificationAlert && negotiationState

    if (loading) {
        return (
            <div
                className="min-h-screen"
                style={{ backgroundColor: DESIGN_TOKENS.colors.background.dark }}>
                <div className="mx-auto w-full max-w-[120rem] px-3 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={`col-span-12 ${i < 2 ? 'lg:col-span-6' : 'lg:col-span-4'} h-28 rounded-2xl animate-pulse`}
                                style={{ background: 'rgba(255,255,255,0.06)' }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error || !seller) {
        return (
            <div
                className="min-h-screen grid place-items-center"
                style={{ backgroundColor: DESIGN_TOKENS.colors.background.dark }}>
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                    <h1 className="mb-2 text-2xl font-bold text-white">{error ? 'Error Loading Profile' : 'No Seller Profile Found'}</h1>
                    <p
                        className="mb-6"
                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        {error ? error.message : 'You need to create a seller profile first.'}
                    </p>
                    <Link
                        href="/become-seller"
                        className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold"
                        style={{ backgroundColor: DESIGN_TOKENS.colors.brand.primary, color: DESIGN_TOKENS.colors.brand.primaryText }}>
                        <Plus className="h-5 w-5" /> Create Seller Profile
                    </Link>
                </div>
            </div>
        )
    }

    /* --------- HEADER (sticky, compact) --------- */
    const header = (
        <div
            className="sticky top-0 z-40 border-b border-[#374151] backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(31,31,31,0.85)' }}>
            <div className="mx-auto flex w-full max-w-[120rem] items-center justify-between px-3 sm:px-6 lg:px-8 py-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {seller.fullName}</h1>
                    <p
                        className="text-sm"
                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        Manage your seller dashboard
                    </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <CurrencySelector
                        selectedCurrency={selectedCurrency}
                        onChange={setSelectedCurrency}
                    />
                    <Link
                        href="/seller/products/create"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium sm:px-4"
                        style={{ backgroundColor: DESIGN_TOKENS.colors.brand.primary, color: DESIGN_TOKENS.colors.brand.primaryText }}>
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                    </Link>
                </div>
            </div>
        </div>
    )

    /* --------- SIDEBAR + STATS ROW --------- */
    const sidebar = (
        <SellerIdentity
            seller={seller}
            verificationApproved={verificationStatus.isApproved}
        />
    )
    const statsRow = (
        <EnhancedStatsRow
            stats={stats}
            onStatClick={handleStatClick}
        />
    )

    /* --------- MAIN CONTENT --------- */
    const main = (
        <>
            {/* Priority notification display - only show one at a time */}
            {shouldShowVerificationAlert && (
                <VerificationAlerts
                    approved={verificationStatus.isApproved}
                    seller={seller}
                    onUpload={() => setShowUpload(true)}
                />
            )}

            {shouldShowCommissionNegotiation && (
                <CommissionNegotiation
                    negotiationState={negotiationState}
                    onAccept={onAccept}
                    onCounterOffer={onCounter}
                />
            )}

            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
                <EnhancedQuickActions permissions={permissions} />
            </section>

            <DSCard>
                <DSCardHeader>
                    <DSHeading
                        level={3}
                        className="text-white">
                        Recent Activity
                    </DSHeading>
                </DSCardHeader>
                <DSCardContent>
                    <DSText
                        size="sm"
                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        Your recent orders, reviews, and payouts will appear here.
                    </DSText>
                </DSCardContent>
            </DSCard>
        </>
    )

    /* --------- RIGHT RAIL --------- */
    const rightRail = (
        <>
            <ResponsiveBusinessReadiness
                permissions={permissions}
                seller={{ commissionOffer: seller.commissionOffer, stats: { totalProducts: stats.totalProducts } }}
            />
            <ResponsiveMetricsCard stats={stats} />
            <PayoutInfo
                seller={seller}
                formatCurrency={formatCurrency}
            />
        </>
    )

    return (
        <div className={`${leagueSpartan.className} seller-profile-container min-h-screen bg-[#0a0a0a] text-white`}>
            <Head>
                <title>Seller Dashboard - {seller.fullName} | Spyke AI</title>
                <meta
                    name="description"
                    content={`Manage your AI tools, track sales, and grow your business on Spyke AI marketplace. ${seller.bio || ''}`}
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=5"
                />
                <link
                    rel="canonical"
                    href="https://spyke.ai/seller/profile"
                />
            </Head>

            <ResponsiveSellerShell
                header={header}
                sidebar={sidebar}
                statsRow={statsRow}
                rightRail={rightRail}>
                {main}
            </ResponsiveSellerShell>

            <DocumentUploadModal
                open={showUpload}
                onClose={() => setShowUpload(false)}
                onSuccess={onUploadSuccess}
            />

            {showCounterOfferModal && (
                <CounterOfferModal
                    open={showCounterOfferModal}
                    onClose={() => setShowCounterOfferModal(false)}
                    onSubmit={async (data) => {
                        const success = await handleCounterOffer(data)
                        if (success) {
                            setShowCounterOfferModal(false)
                            refresh()
                            showMessage('Counter offer submitted!', 'success')
                        }
                    }}
                    currentRate={negotiationState?.currentRate || 10}
                />
            )}

            {showSuccess && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm animate-bounce rounded-2xl border border-emerald-500/30 bg-[#1f1f1f] p-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                            <svg
                                className="h-8 w-8 text-emerald-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l-4 4L19 7"
                                />
                            </svg>
                        </div>
                        <DSHeading
                            level={3}
                            className="mb-2 text-white">
                            Offer Accepted!
                        </DSHeading>
                        <DSText
                            size="sm"
                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                            You can now start adding products and earning at {negotiationState?.currentRate}% commission
                        </DSText>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ========================= COUNTER OFFER MODAL ========================= */
function CounterOfferModal({ open, onClose, onSubmit, currentRate }) {
    const [rate, setRate] = useState('')
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (!open) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!rate || !reason) {
            showMessage('Please fill in all fields', 'error')
            return
        }

        const rateNum = parseFloat(rate)
        if (isNaN(rateNum) || rateNum < 1 || rateNum > 50) {
            showMessage('Please enter a valid commission rate between 1% and 50%', 'error')
            return
        }

        setSubmitting(true)
        try {
            await onSubmit({ rate: rateNum, reason })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
            <DSCard className="w-full max-w-md p-6">
                <DSHeading
                    level={3}
                    className="text-white">
                    Submit Counter Offer
                </DSHeading>
                <DSText
                    size="sm"
                    className="mt-1"
                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                    Current rate: {currentRate}%
                </DSText>

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-4">
                    <DSFormInput
                        label="Proposed Commission Rate (%)"
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        min="1"
                        max="50"
                        step="0.1"
                        placeholder="e.g., 8.5"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Reason for Counter Offer</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why this rate works better for your business..."
                            rows={3}
                            className="w-full rounded-lg border border-[#2b2b2b] bg-[#1f1f1f] px-3 py-2 text-white placeholder-gray-400 focus:border-[#00FF89] focus:outline-none resize-none"
                            required
                        />
                    </div>

                    <DSStack
                        direction="row"
                        gap="3"
                        className="pt-2">
                        <DSButton
                            variant="secondary"
                            onClick={onClose}>
                            Cancel
                        </DSButton>
                        <DSButton
                            variant="primary"
                            type="submit"
                            disabled={submitting}
                            loading={submitting}>
                            Submit Offer
                        </DSButton>
                    </DSStack>
                </form>
            </DSCard>
        </div>
    )
}

/* ========================= VERIFICATION ALERTS ========================= */
function VerificationAlerts({ approved, seller, onUpload }) {
    // Hide verification alerts if seller is approved OR in commission negotiation phase
    const shouldHideAlerts = approved || seller?.verification?.status === 'commission_offered' || seller?.verification?.status === 'approved'

    if (shouldHideAlerts) return null

    // Show different messages based on verification status
    const getAlertContent = () => {
        switch (seller?.verification?.status) {
            case 'pending':
                return {
                    title: 'Complete Your Verification',
                    message: 'Upload KYC documents and complete business verification to unlock product listing and analytics.',
                    showUploadButton: true
                }
            case 'under_review':
                return {
                    title: 'Verification Under Review',
                    message: "Your documents are being reviewed by our team. We'll update you within 24-48 hours.",
                    showUploadButton: false
                }
            case 'rejected':
                return {
                    title: 'Verification Rejected',
                    message: seller?.verification?.feedback || 'Your verification was rejected. Please resubmit with correct documents.',
                    showUploadButton: true
                }
            default:
                return {
                    title: 'Complete Your Verification',
                    message: 'Upload KYC documents and complete business verification to unlock product listing and analytics.',
                    showUploadButton: true
                }
        }
    }

    const alertContent = getAlertContent()

    return (
        <DSCard className="border-amber-500/20 bg-amber-500/5">
            <DSCardHeader>
                <DSStack direction="row" gap="2" align="center">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                    <DSHeading level={3} className="text-white">
                        {alertContent.title}
                    </DSHeading>
                </DSStack>
            </DSCardHeader>
            <DSCardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <DSText size="sm" style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                    {alertContent.message}
                </DSText>
                <DSStack direction="row" gap="3" align="center" className="flex-shrink-0">
                    {alertContent.showUploadButton && (
                        <DSButton variant="primary" size="medium" onClick={onUpload}>
                            <FileText className="h-4 w-4" />
                            Upload Documents
                        </DSButton>
                    )}
                    <Link href="/seller/verification" className="text-sm underline text-amber-400 hover:text-amber-300 transition-colors">
                        View Requirements
                    </Link>
                </DSStack>
            </DSCardContent>
        </DSCard>
    )
}

/* ========================= ENHANCED PAYOUT INFO ========================= */
function PayoutInfo({ seller, formatCurrency }) {
    if (!seller?.payoutInfo) return null
    
    return (
        <DSCard className="h-full">
            <DSCardHeader>
                <DSStack direction="row" gap="2" align="center">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <DSHeading level={3} className="text-white">
                        Payout Information
                    </DSHeading>
                </DSStack>
            </DSCardHeader>
            
            <DSCardContent className="space-y-4">
                {/* Available Balance - Prominent Display */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <DSStack direction="row" justify="space-between" align="center">
                        <DSText size="sm" className="text-emerald-300">
                            Available Balance
                        </DSText>
                        <DSText 
                            size="xl" 
                            className="font-bold text-emerald-400"
                        >
                            {formatCurrency(seller.stats?.totalEarnings || 0)}
                        </DSText>
                    </DSStack>
                </div>
                
                {/* Payment Method */}
                <DSStack direction="row" justify="space-between" align="center">
                    <DSText size="sm" style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        Payment Method
                    </DSText>
                    <DSStack direction="row" gap="2" align="center">
                        <DSText size="sm" className="capitalize text-white">
                            {seller.payoutInfo.method}
                        </DSText>
                        {seller.payoutInfo.isVerified ? (
                            <DSBadge variant="primary" size="small">
                                Verified
                            </DSBadge>
                        ) : (
                            <DSBadge variant="secondary" size="small">
                                Pending
                            </DSBadge>
                        )}
                    </DSStack>
                </DSStack>

                {/* PayPal Email if present */}
                {seller.payoutInfo.paypalEmail && (
                    <DSStack direction="row" justify="space-between" align="center">
                        <DSText size="sm" style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                            PayPal Email
                        </DSText>
                        <DSText size="sm" className="max-w-[12rem] truncate text-white">
                            {seller.payoutInfo.paypalEmail}
                        </DSText>
                    </DSStack>
                )}
                
                {/* Next Payout Schedule */}
                <div className="pt-2 border-t border-gray-700">
                    <DSText size="xs" className="text-center" style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        Next payout: Every Friday (minimum ₹100)
                    </DSText>
                </div>
            </DSCardContent>
            
            <DSCardFooter>
                <Link
                    href="/seller/payouts"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    style={{
                        color: DESIGN_TOKENS.colors.brand.primary,
                        borderColor: `${DESIGN_TOKENS.colors.brand.primary}33`
                    }}
                >
                    <CreditCard className="h-4 w-4" /> 
                    Manage Payouts
                </Link>
            </DSCardFooter>
        </DSCard>
    )
}


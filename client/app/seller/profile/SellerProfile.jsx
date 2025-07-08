'use client'

import { useState, useEffect } from 'react'
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
    CreditCard,
    Settings,
    Star,
    TrendingUp,
    Users,
    BarChart3,
    AlertTriangle,
    Check,
    X,
    HelpCircle,
    FileText,
    Handshake,
    Rocket
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import sellerAPI from '@/lib/api/seller'

const SellerSidebar = dynamic(() => import('@/components/seller/SellerSidebar'), {
    ssr: false,
    loading: () => <div className="w-64 bg-[#1a1a1a] animate-pulse" />
})

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

const CommissionProgressStepper = ({ verificationStatus, commissionStatus, hasCounterOffer, acceptedAt }) => {
    const getStepStatus = (stepId) => {
        if (acceptedAt) {
            if (stepId <= 4) return 'completed'
            if (stepId === 5) return verificationStatus === 'approved' ? 'completed' : 'active'
        }
        switch (stepId) {
            case 1:
                return 'completed'

            case 2:
                if (['under_review', 'commission_offered', 'approved'].includes(verificationStatus)) {
                    return 'completed'
                }
                return 'active'

            case 3:
                if (verificationStatus === 'commission_offered' || verificationStatus === 'approved') {
                    return 'completed'
                }
                return verificationStatus === 'under_review' ? 'pending' : 'pending'

            case 4:
                if (verificationStatus === 'commission_offered' && !acceptedAt) {
                    return commissionStatus === 'counter_offered' ? 'active' : 'active'
                }
                return 'pending'

            case 5:
                return 'pending'

            default:
                return 'pending'
        }
    }

    const steps = [
        {
            id: 1,
            title: 'Profile Submitted',
            icon: FileText
        },
        {
            id: 2,
            title: 'Under Review',
            icon: Eye
        },
        {
            id: 3,
            title: 'Commission Offered',
            icon: DollarSign
        },
        {
            id: 4,
            title: 'Negotiation',
            icon: Handshake
        },
        {
            id: 5,
            title: 'Start Selling',
            icon: Rocket
        }
    ].map((step) => ({
        ...step,
        status: getStepStatus(step.id)
    }))

    const completedSteps = steps.filter((s) => s.status === 'completed').length
    const activeStep = steps.find((s) => s.status === 'active')
    const progressPercentage = activeStep ? (steps.indexOf(activeStep) / (steps.length - 1)) * 100 : (completedSteps / (steps.length - 1)) * 100

    return (
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Your Progress</h3>

            <div className="relative mb-4">
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#00FF89] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                </div>
            </div>

            <div className="flex justify-between items-center">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = step.status === 'completed'
                    const isActive = step.status === 'active'
                    const isPending = step.status === 'pending'

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center text-center">
                            <div
                                className={`
                                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 mb-2
                                ${
                                    isCompleted
                                        ? 'bg-[#00FF89] text-[#121212]'
                                        : isActive
                                          ? 'bg-[#00FF89]/20 text-[#00FF89] ring-2 ring-[#00FF89]'
                                          : 'bg-gray-700 text-gray-500'
                                }
                            `}>
                                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <p
                                className={`text-xs font-medium hidden sm:block ${
                                    isActive ? 'text-[#00FF89]' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                {step.title}
                            </p>
                        </div>
                    )
                })}
            </div>

            {steps.find((s) => s.status === 'active') && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                        <span className="text-[#00FF89] font-medium">Current Step:</span> {steps.find((s) => s.status === 'active').title}
                        {hasCounterOffer && ' - Counter offer submitted'}
                    </p>
                </div>
            )}
        </div>
    )
}

const CommissionTooltip = ({ rate }) => {
    const [showTooltip, setShowTooltip] = useState(false)

    return (
        <div className="relative inline-block">
            <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="ml-1 text-gray-400 hover:text-gray-300 transition-colors">
                <HelpCircle className="w-4 h-4" />
            </button>

            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-[#0a0a0a] border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="text-xs text-gray-300">
                        <p className="font-semibold text-white mb-2">How commission works:</p>
                        <p className="mb-2">The platform takes {rate}% from each sale. For example:</p>
                        <ul className="space-y-1 text-gray-400">
                            <li>• $100 sale = You get ${100 - rate}</li>
                            <li>• $500 sale = You get ${500 - (500 * rate) / 100}</li>
                            <li>• $1000 sale = You get ${1000 - (1000 * rate) / 100}</li>
                        </ul>
                        <p className="mt-2 text-[#00FF89]">This covers payment processing, hosting, support & marketing.</p>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-700"></div>
                    </div>
                </div>
            )}
        </div>
    )
}

const MobileCommissionCard = ({ commissionOffer, verificationStatus, onAccept, onCounter, processingOffer }) => {
    const [swipeOffset, setSwipeOffset] = useState(0)
    const [startX, setStartX] = useState(0)

    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX)
    }

    const handleTouchMove = (e) => {
        const currentX = e.touches[0].clientX
        const diff = currentX - startX
        if (Math.abs(diff) > 10) {
            setSwipeOffset(diff)
        }
    }

    const handleTouchEnd = () => {
        if (swipeOffset > 100) {
            onAccept()
        } else if (swipeOffset < -100) {
            onCounter()
        }
        setSwipeOffset(0)
    }

    if (verificationStatus !== 'commission_offered' || commissionOffer?.status !== 'pending' || commissionOffer?.counterOffer?.rate) {
        return null
    }

    return (
        <div className="md:hidden mb-6">
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-400">Commission Offer</h3>
                    <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold text-[#00FF89]">{commissionOffer.rate}%</span>
                        <CommissionTooltip rate={commissionOffer.rate} />
                    </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">Swipe right to accept, left to counter</p>

                <div
                    className="relative overflow-hidden rounded-lg"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}>
                    <div
                        className={`absolute inset-0 bg-green-500/20 flex items-center justify-start pl-4 transition-opacity rounded-lg ${swipeOffset > 50 ? 'opacity-100' : 'opacity-0'}`}>
                        <Check className="w-6 h-6 text-green-500" />
                        <span className="ml-2 text-green-500 font-medium text-sm">Accept</span>
                    </div>
                    <div
                        className={`absolute inset-0 bg-orange-500/20 flex items-center justify-end pr-4 transition-opacity rounded-lg ${swipeOffset < -50 ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="mr-2 text-orange-500 font-medium text-sm">Counter</span>
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                    </div>

                    <div
                        className="relative bg-[#0a0a0a] p-4 rounded-lg transition-transform"
                        style={{ transform: `translateX(${swipeOffset * 0.3}px)` }}>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                                <p className="text-xs text-gray-500">You keep</p>
                                <p className="text-lg font-semibold text-white">{100 - commissionOffer.rate}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">On $100 sale</p>
                                <p className="text-lg font-semibold text-white">${100 - commissionOffer.rate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                        onClick={onAccept}
                        disabled={processingOffer}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-[#00FF89] text-[#121212] font-medium rounded-lg disabled:opacity-50 text-sm">
                        <Check className="w-4 h-4" />
                        Accept
                    </button>
                    <button
                        onClick={onCounter}
                        disabled={processingOffer}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-[#121212] border border-[#00FF89]/30 text-[#00FF89] font-medium rounded-lg text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Counter
                    </button>
                </div>
            </div>
        </div>
    )
}

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
                                <span className="text-lg">%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">Suggest a commission rate between 1% and 50%</p>
                            {counterRate && <p className="text-xs text-[#00FF89]">You'll keep {100 - counterRate}% of sales</p>}
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Reason for Counter Offer</label>
                        <div className="relative">
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent resize-none transition-all"
                                rows="4"
                                placeholder="Explain why you're requesting this rate..."
                                required
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-500">{reason.length}/10 min</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Help us understand your perspective</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-[#00FF89] text-[#121212] rounded-xl font-semibold hover:bg-[#00FF89]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]">
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Counter Offer'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700">
                            Cancel
                        </button>
                    </div>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-500">
                            Your counter offer will be reviewed by our team. We'll notify you once a decision is made.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

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
    const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)
    const [processingOffer, setProcessingOffer] = useState(false)
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

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

    const handleAcceptOffer = async () => {
        try {
            setProcessingOffer(true)
            const minimumLoaderTime = new Promise((resolve) => setTimeout(resolve, 2000))
            const apiCall = sellerAPI.acceptCommissionOffer()
            const [response] = await Promise.all([apiCall, minimumLoaderTime])

            if (response.success) {
                setProcessingOffer(false)
                setShowSuccessAnimation(true)
                setTimeout(() => {
                    toast.success('Commission offer accepted successfully!')
                    setShowSuccessAnimation(false)
                    fetchSellerData()
                }, 2000)
            }
        } catch (error) {
            toast.error('Failed to accept commission offer')
            setProcessingOffer(false)
        }
    }

    const handleCounterOffer = async ({ rate, reason }) => {
        try {
            const response = await sellerAPI.submitCounterOffer({ rate, reason })
            if (response.success) {
                toast.success('Counter offer submitted successfully!')
                setShowCounterOfferModal(false)
                await fetchSellerData()
            }
        } catch (error) {
            toast.error('Failed to submit counter offer')
        }
    }

    const getVerificationBadge = (status) => {
        const badges = {
            pending: {
                color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
                icon: Clock,
                text: 'Verification Pending'
            },
            under_review: {
                color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
                icon: Eye,
                text: 'Under Review'
            },
            commission_offered: {
                color: 'bg-[#00FF89]/20 text-[#00FF89] border-[#00FF89]/30',
                icon: DollarSign,
                text: 'Commission Offered'
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

    const canAddProducts = sellerProfile?.verification?.status === 'approved' && sellerProfile?.commissionOffer?.acceptedAt

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
                {!isMobile && (
                    <div className="hidden md:block fixed top-0 left-0 h-full w-64 z-40">
                        <SellerSidebar
                            currentPath="/profile"
                            sellerName={sellerProfile?.fullName}
                        />
                    </div>
                )}
                <main
                    className={`flex-1 h-full overflow-y-auto overflow-x-hidden bg-[#121212] text-white ${!isMobile ? 'ml-64' : ''}`}
                    role="main">
                    <div className="w-full p-4 sm:p-6 lg:p-8">
                        <header className="mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl text-white mb-2 font-[var(--font-league-spartan)]">Dashboard</h1>
                                    <p className="text-sm sm:text-base text-gray-400 font-[var(--font-kumbh-sans)]">
                                        Welcome back, {sellerProfile.fullName}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
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
                                                    {sellerProfile.verification?.status === 'commission_offered' &&
                                                    !sellerProfile.commissionOffer?.acceptedAt
                                                        ? 'Accept commission offer to add products'
                                                        : sellerProfile.verification?.status === 'under_review'
                                                          ? 'Account under review'
                                                          : sellerProfile.verification?.status === 'rejected'
                                                            ? 'Verification required to add products'
                                                            : sellerProfile.verification?.status === 'approved' &&
                                                                !sellerProfile.commissionOffer?.acceptedAt
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

                        <MobileCommissionCard
                            commissionOffer={sellerProfile.commissionOffer}
                            verificationStatus={sellerProfile.verification?.status}
                            onAccept={handleAcceptOffer}
                            onCounter={() => setShowCounterOfferModal(true)}
                            processingOffer={processingOffer}
                        />
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

                        {sellerProfile.verification?.status === 'commission_offered' &&
                            sellerProfile.commissionOffer?.status === 'pending' &&
                            !sellerProfile.commissionOffer?.counterOffer?.rate && (
                                <div className="hidden md:block mb-6 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-[#00FF89]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <DollarSign className="w-6 h-6 text-[#00FF89]" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2">Commission Offer Received!</h3>
                                            <p className="text-gray-300 mb-4">
                                                The platform has offered you a commission rate of{' '}
                                                <span className="text-2xl font-bold text-[#00FF89]">{sellerProfile.commissionOffer.rate}%</span>
                                                <CommissionTooltip rate={sellerProfile.commissionOffer.rate} /> on all your sales.
                                            </p>
                                            <p className="text-sm text-gray-400 mb-6">
                                                This means the platform will take {sellerProfile.commissionOffer.rate}% from each sale you make. You
                                                can accept this offer or propose a different rate.
                                            </p>

                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={handleAcceptOffer}
                                                    disabled={processingOffer}
                                                    className="flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] min-w-[160px] justify-center">
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
                                                    className="flex items-center gap-2 px-6 py-3 bg-[#121212] border border-[#00FF89]/30 text-[#00FF89] font-medium rounded-lg hover:bg-[#00FF89]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] min-w-[180px] justify-center">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    Make Counter Offer
                                                </button>
                                            </div>

                                            <p className="text-xs text-gray-500 mt-4">
                                                Offered on: {new Date(sellerProfile.commissionOffer.offeredAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        {sellerProfile.commissionOffer?.status === 'counter_offered' && sellerProfile.commissionOffer?.counterOffer?.rate && (
                            <div className="mb-6 bg-[#FFC050]/10 border border-[#FFC050]/30 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-[#FFC050]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-[#FFC050]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-2">Counter Offer Under Review</h3>
                                        <p className="text-gray-300 mb-3">
                                            You have submitted a counter offer of{' '}
                                            <span className="text-lg font-bold text-[#FFC050]">
                                                {sellerProfile.commissionOffer.counterOffer.rate}%
                                            </span>
                                            <CommissionTooltip rate={sellerProfile.commissionOffer.counterOffer.rate} /> commission rate (Original
                                            offer: {sellerProfile.commissionOffer.rate}%)
                                        </p>
                                        <div className="bg-[#121212] border border-gray-800 rounded-lg p-4 mb-4">
                                            <p className="text-sm font-medium text-gray-400 mb-1">Your Reason:</p>
                                            <p className="text-sm text-gray-300">{sellerProfile.commissionOffer.counterOffer.reason}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Submitted on: {new Date(sellerProfile.commissionOffer.counterOffer.submittedAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Our team is reviewing your counter offer. We'll notify you once a decision is made.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(sellerProfile.verification?.status === 'commission_offered' ||
                            sellerProfile.verification?.status === 'approved' ||
                            sellerProfile.verification?.status === 'under_review') && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                <div className="lg:col-span-2">
                                    <CommissionProgressStepper
                                        verificationStatus={sellerProfile.verification.status}
                                        commissionStatus={sellerProfile.commissionOffer?.status}
                                        hasCounterOffer={!!sellerProfile.commissionOffer?.counterOffer?.rate}
                                        acceptedAt={sellerProfile.commissionOffer?.acceptedAt}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 h-full flex flex-col justify-center">
                                        <h3 className="text-sm font-medium text-gray-400 mb-3">Commission Status</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Platform Rate</span>
                                                <span className="text-lg font-bold text-[#00FF89]">
                                                    {sellerProfile.commissionOffer?.rate || '-'}%
                                                </span>
                                            </div>
                                            {sellerProfile.commissionOffer?.counterOffer?.rate && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">Your Counter</span>
                                                    <span className="text-lg font-bold text-[#FFC050]">
                                                        {sellerProfile.commissionOffer.counterOffer.rate}%
                                                    </span>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-gray-700">
                                                <span className="text-xs text-gray-500">Status</span>
                                                <p className="text-sm text-[#00FF89] font-medium">
                                                    {sellerProfile.commissionOffer?.status === 'counter_offered'
                                                        ? 'Under Review'
                                                        : sellerProfile.commissionOffer?.acceptedAt
                                                          ? 'Accepted'
                                                          : 'Pending Action'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                            <section className="xl:col-span-2 space-y-6">
                                {stats?.totalProducts === 0 && (
                                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 sm:p-8 text-center">
                                        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                                        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Start Selling Today!</h2>
                                        <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-md mx-auto">
                                            {canAddProducts
                                                ? "You haven't added any products yet. Create your first product and start earning."
                                                : sellerProfile.verification?.status === 'commission_offered'
                                                  ? 'Accept the commission offer to start adding products and begin selling.'
                                                  : 'Complete your verification to start adding products.'}
                                        </p>
                                        {canAddProducts ? (
                                            <Link
                                                href="/seller/products/new"
                                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-colors">
                                                <Plus className="w-5 h-5" />
                                                Create Your First Product
                                            </Link>
                                        ) : sellerProfile.verification?.status === 'commission_offered' &&
                                          !sellerProfile.commissionOffer?.acceptedAt ? (
                                            <button
                                                onClick={handleAcceptOffer}
                                                disabled={processingOffer}
                                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50">
                                                {processingOffer ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
                                                        <span>Accepting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-5 h-5" />
                                                        Accept Commission Offer
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 text-gray-400 font-medium rounded-lg cursor-not-allowed">
                                                <AlertCircle className="w-5 h-5" />
                                                Verification Required
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="relative group">
                                        <Link
                                            href={canAddProducts ? '/seller/products' : '#'}
                                            onClick={(e) => {
                                                if (!canAddProducts) {
                                                    e.preventDefault()
                                                }
                                            }}
                                            className={`bg-[#1f1f1f] border border-gray-800 rounded-lg p-4 transition-all text-center group block ${
                                                canAddProducts ? 'hover:border-[#00FF89]/50' : 'opacity-60 cursor-not-allowed'
                                            }`}>
                                            <Package className="w-8 h-8 text-[#00FF89] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs sm:text-sm text-gray-300">Products</span>
                                        </Link>
                                        {!canAddProducts && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#0a0a0a] border border-gray-700 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                                                Complete verification first
                                            </div>
                                        )}
                                    </div>
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

                            <aside className="xl:col-span-1 space-y-6">
                                {sellerProfile.commissionOffer?.acceptedAt && (
                                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6">
                                        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Commission Details</h2>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs sm:text-sm text-gray-400">Commission Rate</p>
                                                <p className="text-xl sm:text-2xl font-bold text-[#00FF89]">{sellerProfile.commissionOffer.rate}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs sm:text-sm text-gray-400">Accepted On</p>
                                                <p className="text-sm text-white">
                                                    {new Date(sellerProfile.commissionOffer.acceptedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Settings Overview</h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm text-gray-300">Email Notifications</span>
                                            <span
                                                className={`text-sm font-medium ${sellerProfile.settings.emailNotifications ? 'text-[#00FF89]' : 'text-gray-500'}`}>
                                                {sellerProfile.settings.emailNotifications ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-t border-gray-800">
                                            <span className="text-sm text-gray-300">Marketing Emails</span>
                                            <span
                                                className={`text-sm font-medium ${sellerProfile.settings.marketingEmails ? 'text-[#00FF89]' : 'text-gray-500'}`}>
                                                {sellerProfile.settings.marketingEmails ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
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
                                href={canAddProducts ? '/seller/products' : '#'}
                                onClick={(e) => {
                                    if (!canAddProducts) {
                                        e.preventDefault()
                                        toast.error('Complete verification to access products')
                                    }
                                }}
                                className={`flex flex-col items-center py-2 ${canAddProducts ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Package className="w-5 h-5 mb-1" />
                                <span className="text-xs">Products</span>
                            </Link>
                            <Link
                                href={canAddProducts ? '/seller/products/new' : '#'}
                                onClick={(e) => {
                                    if (!canAddProducts) {
                                        e.preventDefault()
                                        toast.error('Complete verification to add products')
                                    }
                                }}
                                className={`flex flex-col items-center py-2 ${canAddProducts ? 'text-gray-400' : 'text-gray-600'}`}>
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

            <CommissionOfferModal
                isOpen={showCounterOfferModal}
                onClose={() => setShowCounterOfferModal(false)}
                currentOffer={sellerProfile?.commissionOffer?.rate}
                onSubmit={handleCounterOffer}
            />

            {showSuccessAnimation && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] border border-[#00FF89]/30 rounded-2xl p-8 max-w-sm w-full mx-4 text-center transform animate-bounce-in">
                        <div className="w-20 h-20 bg-[#00FF89]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-[#00FF89]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Offer Accepted!</h3>
                        <p className="text-gray-400">Commission agreement finalized at {sellerProfile.commissionOffer?.rate}%</p>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        width: 0;
                    }
                    to {
                        width: 100%;
                    }
                }

                @keyframes bounce-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-bounce-in {
                    animation: bounce-in 0.6s ease-out;
                }

                .animation-delay-150 {
                    animation-delay: 150ms;
                }

                .animation-delay-300 {
                    animation-delay: 300ms;
                }
            `}</style>
        </>
    )
}


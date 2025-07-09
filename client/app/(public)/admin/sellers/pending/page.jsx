'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { adminAPI } from '@/lib/api/admin'
import {
    UserCheck,
    Clock,
    FileText,
    Mail,
    Calendar,
    DollarSign,
    X,
    RefreshCw,
    MapPin,
    CheckCircle,
    Eye,
    Search,
    ChevronDown,
    ChevronUp,
    Filter,
    TrendingUp,
    Globe,
    Shield,
    AlertCircle,
    Sparkles,
    ArrowRight,
    Star,
    Activity,
    Users,
    Zap,
    BarChart3,
    Timer,
    Send,
    XCircle
} from 'lucide-react'

export default function PendingSellersPage() {
    const [sellers, setSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSeller, setSelectedSeller] = useState(null)
    const [showCommissionModal, setShowCommissionModal] = useState(false)
    const [showRejectCounterModal, setShowRejectCounterModal] = useState(false)
    const [commissionRate, setCommissionRate] = useState(15)
    const [rejectReason, setRejectReason] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pagination, setPagination] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredSellers, setFilteredSellers] = useState([])
    const [expandedSellers, setExpandedSellers] = useState(new Set())
    const [activeStatusFilter, setActiveStatusFilter] = useState('all')

    const statusConfig = {
        pending: {
            color: 'text-[#FFC050]',
            bgColor: 'bg-[#FFC050]/20',
            borderColor: 'border-[#FFC050]/30',
            label: 'Pending Review',
            icon: Clock,
            actions: ['review', 'reject']
        },
        under_review: {
            color: 'text-[#00FF89]',
            bgColor: 'bg-[#00FF89]/20',
            borderColor: 'border-[#00FF89]/30',
            label: 'Under Review',
            icon: Eye,
            actions: ['offer_commission', 'reject']
        },
        commission_offered: {
            color: 'text-[#00FF89]',
            bgColor: 'bg-[#00FF89]/10',
            borderColor: 'border-[#00FF89]/30',
            label: 'Commission Offered',
            icon: DollarSign,
            actions: ['view_offer', 'resend', 'reject']
        },
        counter_offered: {
            color: 'text-[#FFC050]',
            bgColor: 'bg-[#FFC050]/10',
            borderColor: 'border-[#FFC050]/30',
            label: 'Counter Offer',
            icon: Zap,
            actions: ['accept_counter', 'reject_counter', 'new_offer']
        }
    }

    const fetchPendingSellers = async () => {
        setLoading(true)
        try {
            const response = await adminAPI.sellers.getByStatus.fetch(activeStatusFilter, page, 30)
            if (response?.profiles) {
                let sellersWithStatus = response.profiles.map((seller) => {
                    // Check for counter offer status
                    let currentStatus = seller.verification?.status || seller.status || 'pending'
                    if (seller.commissionOffer?.status === 'counter_offered') {
                        currentStatus = 'counter_offered'
                    }
                    return {
                        ...seller,
                        currentStatus
                    }
                })

                if (activeStatusFilter === 'all') {
                    sellersWithStatus = sellersWithStatus.filter((seller) => {
                        const status = seller.currentStatus || seller.status
                        return status !== 'approved' && status !== 'active'
                    })
                } else if (activeStatusFilter === 'counter_offered') {
                    sellersWithStatus = sellersWithStatus.filter((seller) => seller.currentStatus === 'counter_offered')
                }

                setSellers(sellersWithStatus)
                setFilteredSellers(sellersWithStatus)
                setPagination(response.pagination || {})
                setTotalPages(response.pagination?.totalPages || 1)
            } else {
                setSellers([])
                setFilteredSellers([])
            }
        } catch (error) {
            toast.error('Failed to fetch sellers')
            setSellers([])
            setFilteredSellers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPendingSellers()
    }, [page, activeStatusFilter])

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredSellers(sellers)
        } else {
            const query = searchQuery.toLowerCase()
            const filtered = sellers.filter(
                (seller) =>
                    seller.fullName?.toLowerCase().includes(query) ||
                    seller.email?.toLowerCase().includes(query) ||
                    seller.userId?.emailAddress?.toLowerCase().includes(query) ||
                    seller.location?.country?.toLowerCase().includes(query) ||
                    seller.niches?.some((niche) => niche.toLowerCase().includes(query)) ||
                    seller.toolsSpecialization?.some((tool) => tool.toLowerCase().includes(query))
            )
            setFilteredSellers(filtered)
        }
    }, [searchQuery, sellers])

    const toggleSellerExpansion = (sellerId) => {
        const newExpanded = new Set(expandedSellers)
        if (newExpanded.has(sellerId)) {
            newExpanded.delete(sellerId)
        } else {
            newExpanded.add(sellerId)
        }
        setExpandedSellers(newExpanded)
    }

    const handleStartReview = async (sellerId) => {
        try {
            // NOTE: You need to add a startReview endpoint in your backend
            // await adminAPI.sellers.profile.startReview(sellerId)
            fetchPendingSellers()
        } catch (error) {
            toast.error('Failed to start review')
        }
    }

    const handleOfferCommission = async () => {
        if (!selectedSeller) return

        try {
            await adminAPI.sellers.commission.offer(selectedSeller._id, commissionRate)
            toast.success(`Commission offer of ${commissionRate}% sent to ${selectedSeller.fullName}`)
            setShowCommissionModal(false)
            setSelectedSeller(null)
            fetchPendingSellers()
        } catch (error) {
            toast.error('Failed to send commission offer')
        }
    }

    const handleAcceptCounterOffer = async (sellerId, rate) => {
        try {
            // NOTE: You need to add an acceptCounterOffer endpoint in your backend
            // await adminAPI.sellers.commission.acceptCounterOffer(sellerId)
            toast.success(`Counter offer of ${rate}% accepted`)
            fetchPendingSellers()
        } catch (error) {
            toast.error('Failed to accept counter offer')
        }
    }

    const handleRejectCounterOffer = async () => {
        if (!selectedSeller || !rejectReason.trim()) return

        try {
            await adminAPI.sellers.commission.reject(selectedSeller._id, rejectReason)
            toast.success('Counter offer rejected')
            setShowRejectCounterModal(false)
            setSelectedSeller(null)
            setRejectReason('')
            fetchPendingSellers()
        } catch (error) {
            toast.error('Failed to reject counter offer')
        }
    }

    const handleRejectSeller = async (sellerId, reason) => {
        try {
            await adminAPI.sellers.profile.reject(sellerId, reason)
            toast.success('Seller profile rejected')
            fetchPendingSellers()
        } catch (error) {
            toast.error('Failed to reject seller')
        }
    }

    const formatDate = (date) => {
        if (!date) return 'N/A'
        const d = new Date(date)
        const now = new Date()
        const diffTime = Math.abs(now - d)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 1) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`

        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getStatusCounts = () => {
        if (activeStatusFilter === 'all') {
            return {
                all: sellers.length,
                pending: sellers.filter((s) => s.currentStatus === 'pending').length,
                under_review: sellers.filter((s) => s.currentStatus === 'under_review').length,
                commission_offered: sellers.filter((s) => s.currentStatus === 'commission_offered').length,
                counter_offered: sellers.filter((s) => s.currentStatus === 'counter_offered').length
            }
        } else {
            const count = pagination.total || sellers.length
            return {
                all: '-',
                pending: activeStatusFilter === 'pending' ? count : '-',
                under_review: activeStatusFilter === 'under_review' ? count : '-',
                commission_offered: activeStatusFilter === 'commission_offered' ? count : '-',
                counter_offered: activeStatusFilter === 'counter_offered' ? count : '-'
            }
        }
    }

    const statusCounts = getStatusCounts()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-[#00FF89]/10 rounded-lg">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#00FF89]" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold font-league-spartan text-white">Seller Applications</h1>
                            <p className="text-sm sm:text-base text-gray-400 font-kumbh-sans mt-0.5 sm:mt-1">
                                Review and onboard new marketplace sellers
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchPendingSellers()}
                        className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#252525] transition-colors font-kumbh-sans text-sm sm:text-base">
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-[#121212] border border-gray-800 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FF89]" />
                            <span className="text-[10px] sm:text-xs text-gray-500 uppercase">AVG TIME</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-white font-league-spartan">{sellers.length > 0 ? '2.5 days' : '0 days'}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Processing time</p>
                    </div>
                    <div className="bg-[#121212] border border-gray-800 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFC050]" />
                            <span className="text-[10px] sm:text-xs text-gray-500 uppercase">CONVERSION</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-white font-league-spartan">{sellers.length > 0 ? '87%' : '0%'}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Approval rate</p>
                    </div>
                    <div className="bg-[#121212] border border-gray-800 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFC050]" />
                            <span className="text-[10px] sm:text-xs text-gray-500 uppercase">ACTIVE</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-white font-league-spartan">{statusCounts.all}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Total pending</p>
                    </div>
                    <div className="bg-[#121212] border border-gray-800 rounded-lg p-3 sm:p-4 relative">
                        {statusCounts.counter_offered > 0 && (
                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-[#FFC050] rounded-full flex items-center justify-center animate-pulse">
                                <span className="text-[10px] sm:text-xs font-bold text-[#121212]">{statusCounts.counter_offered}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFC050]" />
                            <span className="text-[10px] sm:text-xs text-gray-500 uppercase">COUNTER</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-white font-league-spartan">{statusCounts.counter_offered || 0}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Counter offers</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email, location, niches, or tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#121212] border border-gray-700 rounded-lg text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm text-gray-500 mr-2 sm:mr-4">Filter by status:</span>
                    <button
                        onClick={() => {
                            setActiveStatusFilter('all')
                            setPage(1)
                            setSearchQuery('')
                        }}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            activeStatusFilter === 'all' ? 'bg-[#00FF89] text-[#121212]' : 'bg-[#121212] text-gray-400 hover:bg-[#252525]'
                        }`}>
                        All Applications
                        {statusCounts.all !== '-' && <span className="ml-1.5 sm:ml-2">{statusCounts.all}</span>}
                    </button>
                    <button
                        onClick={() => {
                            setActiveStatusFilter('pending')
                            setPage(1)
                            setSearchQuery('')
                        }}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            activeStatusFilter === 'pending' ? 'bg-[#FFC050]/20 text-[#FFC050]' : 'bg-[#121212] text-gray-400 hover:bg-[#252525]'
                        }`}>
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Pending Review
                        {statusCounts.pending !== '-' && <span className="ml-1">{statusCounts.pending}</span>}
                    </button>
                    <button
                        onClick={() => {
                            setActiveStatusFilter('under_review')
                            setPage(1)
                            setSearchQuery('')
                        }}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            activeStatusFilter === 'under_review' ? 'bg-[#00FF89]/20 text-[#00FF89]' : 'bg-[#121212] text-gray-400 hover:bg-[#252525]'
                        }`}>
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Under Review
                        {statusCounts.under_review !== '-' && <span className="ml-1">{statusCounts.under_review}</span>}
                    </button>
                    <button
                        onClick={() => {
                            setActiveStatusFilter('commission_offered')
                            setPage(1)
                            setSearchQuery('')
                        }}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            activeStatusFilter === 'commission_offered'
                                ? 'bg-[#00FF89]/10 text-[#00FF89]'
                                : 'bg-[#121212] text-gray-400 hover:bg-[#252525]'
                        }`}>
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Commission Offered
                        {statusCounts.commission_offered !== '-' && <span className="ml-1">{statusCounts.commission_offered}</span>}
                    </button>
                </div>
            </div>

            {/* Search Results Count */}
            {searchQuery && (
                <div className="text-xs sm:text-sm text-gray-400">
                    Showing {filteredSellers.length} results for "{searchQuery}"
                </div>
            )}

            {/* Sellers List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-[#00FF89] border-t-transparent"></div>
                </div>
            ) : filteredSellers.length === 0 ? (
                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-8 sm:p-12 text-center">
                    <UserCheck className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-white font-league-spartan">
                        {searchQuery ? 'No sellers found matching your search' : 'No Pending Sellers'}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 font-kumbh-sans mt-1.5 sm:mt-2">
                        {searchQuery ? 'Try adjusting your search criteria' : 'All seller profiles have been processed'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredSellers.map((seller) => {
                        const isExpanded = expandedSellers.has(seller._id)
                        const status = seller.currentStatus || seller.verification?.status || 'pending'
                        const config = statusConfig[status] || statusConfig.pending

                        return (
                            <div
                                key={seller._id}
                                className="bg-[#1f1f1f] border border-gray-800 rounded-xl overflow-hidden transition-all duration-200">
                                {/* Collapsed View */}
                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00FF89]/20 rounded-full flex items-center justify-center text-[#00FF89] font-bold text-base sm:text-lg flex-shrink-0">
                                                {seller.fullName?.charAt(0).toUpperCase() || 'S'}
                                            </div>

                                            {/* Basic Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                                    <h3 className="text-base sm:text-lg font-semibold text-white font-league-spartan truncate">
                                                        {seller.fullName || 'Unnamed Seller'}
                                                    </h3>
                                                    {seller.revenueShareAgreement?.accepted && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-green-400">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Revenue Agreed
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                        <span className="truncate">{seller.email}</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                        {seller.location?.country || 'Unknown'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                        {formatDate(seller.verification?.submittedAt)}
                                                    </span>
                                                </div>
                                                {/* Niches preview */}
                                                {seller.niches && seller.niches.length > 0 && (
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap">
                                                        <span className="text-[10px] sm:text-xs text-gray-500">Niches:</span>
                                                        {seller.niches.slice(0, 3).map((niche, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-1.5 sm:px-2 py-0.5 bg-[#00FF89]/10 text-[#00FF89] text-[10px] sm:text-xs rounded">
                                                                {niche}
                                                            </span>
                                                        ))}
                                                        {seller.niches.length > 3 && (
                                                            <span className="text-[10px] sm:text-xs text-gray-500">+{seller.niches.length - 3}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-full font-medium ${config.bgColor} ${config.color}`}>
                                                <config.icon className="w-3 h-3" />
                                                {config.label}
                                            </span>

                                            {status === 'pending' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleStartReview(seller._id)
                                                    }}
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors text-xs sm:text-sm flex items-center gap-1.5">
                                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span className="hidden sm:inline">Start Review</span>
                                                    <span className="sm:hidden">Review</span>
                                                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </button>
                                            )}

                                            {status === 'under_review' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedSeller(seller)
                                                        setShowCommissionModal(true)
                                                    }}
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors text-xs sm:text-sm flex items-center gap-1.5">
                                                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span className="hidden sm:inline">Offer Commission</span>
                                                    <span className="sm:hidden">Offer</span>
                                                </button>
                                            )}

                                            {status === 'commission_offered' && !seller.commissionOffer?.counterOffer && (
                                                <>
                                                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00FF89]/10 text-[#00FF89] rounded-lg font-medium text-xs sm:text-sm">
                                                        <span className="hidden sm:inline">Awaiting Response</span>
                                                        <span className="sm:hidden">Waiting</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            // Handle resend
                                                        }}
                                                        className="p-1.5 sm:p-2 bg-[#121212] text-gray-400 rounded-lg hover:bg-[#252525] transition-colors">
                                                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </button>
                                                </>
                                            )}

                                            {status === 'counter_offered' && seller.commissionOffer?.counterOffer && (
                                                <div className="flex items-center gap-2">
                                                    <div className="hidden sm:flex bg-[#FFC050]/10 border border-[#FFC050]/30 rounded-lg px-3 py-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-400">Original:</span>
                                                            <span className="text-sm font-bold text-white">{seller.commissionOffer.rate}%</span>
                                                            <ArrowRight className="w-3 h-3 text-[#FFC050]" />
                                                            <span className="text-sm font-bold text-[#FFC050]">
                                                                {seller.commissionOffer.counterOffer.rate}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (confirm(`Accept counter offer of ${seller.commissionOffer.counterOffer.rate}%?`)) {
                                                                handleAcceptCounterOffer(seller._id, seller.commissionOffer.counterOffer.rate)
                                                            }
                                                        }}
                                                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors text-xs sm:text-sm">
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedSeller(seller)
                                                            setShowRejectCounterModal(true)
                                                        }}
                                                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-xs sm:text-sm">
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedSeller(seller)
                                                            setCommissionRate(seller.commissionOffer.counterOffer.rate)
                                                            setShowCommissionModal(true)
                                                        }}
                                                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#FFC050] text-[#121212] rounded-lg font-medium hover:bg-[#FFC050]/90 transition-colors text-xs sm:text-sm">
                                                        <span className="hidden sm:inline">New Offer</span>
                                                        <span className="sm:hidden">New</span>
                                                    </button>
                                                </div>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const reason = prompt('Please provide a reason for rejection:')
                                                    if (reason) {
                                                        handleRejectSeller(seller._id, reason)
                                                    }
                                                }}
                                                className="p-1.5 sm:p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                                                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </button>

                                            <button
                                                onClick={() => toggleSellerExpansion(seller._id)}
                                                className="p-1.5 sm:p-2 bg-[#121212] text-gray-400 rounded-lg hover:bg-[#252525] transition-colors">
                                                {isExpanded ? (
                                                    <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                ) : (
                                                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded View */}
                                {isExpanded && (
                                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-800">
                                        <div className="pt-4 sm:pt-5 space-y-4 sm:space-y-5">
                                            {/* Counter Offer Alert */}
                                            {status === 'counter_offered' && seller.commissionOffer?.counterOffer && (
                                                <div className="bg-[#FFC050]/10 border border-[#FFC050]/30 rounded-lg p-3 sm:p-4">
                                                    <div className="flex items-start gap-3">
                                                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFC050] mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-[#FFC050] mb-2 text-sm sm:text-base">
                                                                Counter Offer Received
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                                                    <div>
                                                                        <span className="text-[10px] sm:text-xs text-gray-400">Original Offer:</span>
                                                                        <p className="text-base sm:text-lg font-bold text-white">
                                                                            {seller.commissionOffer.rate}%
                                                                        </p>
                                                                    </div>
                                                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFC050] hidden sm:block" />
                                                                    <div>
                                                                        <span className="text-[10px] sm:text-xs text-gray-400">Counter Offer:</span>
                                                                        <p className="text-base sm:text-lg font-bold text-[#FFC050]">
                                                                            {seller.commissionOffer.counterOffer.rate}%
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {seller.commissionOffer.counterOffer.reason && (
                                                                    <div className="mt-3 p-2 sm:p-3 bg-[#121212] rounded-lg">
                                                                        <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Seller's Reason:</p>
                                                                        <p className="text-xs sm:text-sm text-white">
                                                                            {seller.commissionOffer.counterOffer.reason}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                                                                    Submitted {formatDate(seller.commissionOffer.counterOffer.submittedAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Performance Metrics */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                                <div className="bg-[#121212] rounded-lg p-3 sm:p-4 border border-gray-800">
                                                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                        <span className="text-[10px] sm:text-xs text-gray-500">Products</span>
                                                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00FF89]" />
                                                    </div>
                                                    <p className="text-xl sm:text-2xl font-bold text-white">{seller.stats?.totalProducts || 0}</p>
                                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Ready to sell</p>
                                                </div>
                                                <div className="bg-[#121212] rounded-lg p-3 sm:p-4 border border-gray-800">
                                                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                        <span className="text-[10px] sm:text-xs text-gray-500">Experience</span>
                                                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFC050]" />
                                                    </div>
                                                    <p className="text-xl sm:text-2xl font-bold text-white">
                                                        {seller.toolsSpecialization?.length || 0}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Tools mastered</p>
                                                </div>
                                                <div className="bg-[#121212] rounded-lg p-3 sm:p-4 border border-gray-800">
                                                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                        <span className="text-[10px] sm:text-xs text-gray-500">Profile</span>
                                                        <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00FF89]" />
                                                    </div>
                                                    <p className="text-xl sm:text-2xl font-bold text-white">
                                                        {seller.bio && seller.websiteUrl && seller.payoutInfo?.method
                                                            ? '100%'
                                                            : seller.bio || seller.websiteUrl
                                                              ? '60%'
                                                              : '30%'}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Complete</p>
                                                </div>
                                                <div className="bg-[#121212] rounded-lg p-3 sm:p-4 border border-gray-800">
                                                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                        <span className="text-[10px] sm:text-xs text-gray-500">Website</span>
                                                        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFC050]" />
                                                    </div>
                                                    <p className="text-xl sm:text-2xl font-bold text-white">{seller.websiteUrl ? 'Yes' : 'No'}</p>
                                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Portfolio</p>
                                                </div>
                                            </div>

                                            {/* Contact & Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                                <div>
                                                    <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                                                        Contact Information
                                                    </h4>
                                                    <div className="space-y-2 sm:space-y-3">
                                                        <div className="flex items-start gap-2 sm:gap-3">
                                                            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5" />
                                                            <div>
                                                                <p className="text-[10px] sm:text-xs text-gray-500">Primary Email</p>
                                                                <p className="text-xs sm:text-sm text-white break-all">{seller.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-2 sm:gap-3">
                                                            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5" />
                                                            <div>
                                                                <p className="text-[10px] sm:text-xs text-gray-500">Website</p>
                                                                {seller.websiteUrl ? (
                                                                    <a
                                                                        href={seller.websiteUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs sm:text-sm text-[#00FF89] hover:underline break-all">
                                                                        {seller.websiteUrl}
                                                                    </a>
                                                                ) : (
                                                                    <p className="text-xs sm:text-sm text-gray-400">Not provided</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-2 sm:gap-3">
                                                            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5" />
                                                            <div>
                                                                <p className="text-[10px] sm:text-xs text-gray-500">Payout Method</p>
                                                                <p className="text-xs sm:text-sm text-white capitalize">
                                                                    {seller.payoutInfo?.method || 'Not configured'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                                                        Seller Profile
                                                    </h4>
                                                    {seller.bio ? (
                                                        <div className="bg-[#121212] rounded-lg p-3 sm:p-4 border border-gray-800">
                                                            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed break-words whitespace-pre-wrap">
                                                                {seller.bio}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-[#121212] rounded-lg p-3 sm:p-4 border border-gray-800 text-center">
                                                            <p className="text-xs sm:text-sm text-gray-500">No bio provided</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expertise Tags */}
                                            <div className="space-y-3 sm:space-y-4">
                                                {seller.niches && seller.niches.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                                                            Specialization Niches
                                                        </h4>
                                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                            {seller.niches.map((niche, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#00FF89]/10 text-[#00FF89] text-xs sm:text-sm rounded-lg">
                                                                    {niche}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {seller.toolsSpecialization && seller.toolsSpecialization.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                                                            Tool Expertise
                                                        </h4>
                                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                            {seller.toolsSpecialization.map((tool, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#FFC050]/10 text-[#FFC050] text-xs sm:text-sm rounded-lg">
                                                                    {tool}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Timeline & Actions */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-800">
                                                <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                        Applied {formatDate(seller.verification?.submittedAt)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                    <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#121212] text-gray-300 rounded-lg hover:bg-[#252525] transition-colors text-xs sm:text-sm font-medium">
                                                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">View Documents</span>
                                                        <span className="sm:hidden">Docs</span>
                                                    </button>
                                                    <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00FF89]/10 text-[#00FF89] rounded-lg hover:bg-[#00FF89]/20 transition-colors text-xs sm:text-sm font-medium">
                                                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        <span className="hidden sm:inline">Full Profile</span>
                                                        <span className="sm:hidden">Profile</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !searchQuery && (
                <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1f1f1f] border border-gray-800 rounded-lg text-xs sm:text-base text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252525] transition-colors">
                        Previous
                    </button>
                    <span className="text-xs sm:text-base text-white px-3 sm:px-4">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1f1f1f] border border-gray-800 rounded-lg text-xs sm:text-base text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252525] transition-colors">
                        Next
                    </button>
                </div>
            )}

            {/* Commission Modal */}
            {showCommissionModal && selectedSeller && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white font-league-spartan mb-3 sm:mb-4">
                            {selectedSeller.commissionOffer?.counterOffer ? 'Negotiate Commission' : 'Offer Commission Rate'}
                        </h3>

                        {selectedSeller.commissionOffer?.counterOffer ? (
                            <div className="mb-3 sm:mb-4">
                                <p className="text-sm sm:text-base text-gray-400 font-kumbh-sans mb-2 sm:mb-3">
                                    Negotiating with <span className="text-white font-medium">{selectedSeller.fullName}</span>
                                </p>
                                <div className="bg-[#121212] border border-gray-700 rounded-lg p-2.5 sm:p-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="text-gray-500">Your original offer:</span>
                                        <span className="text-white font-medium">{selectedSeller.commissionOffer.rate}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="text-gray-500">Seller's counter offer:</span>
                                        <span className="text-[#FFC050] font-medium">{selectedSeller.commissionOffer.counterOffer.rate}%</span>
                                    </div>
                                    {selectedSeller.commissionOffer.counterOffer.reason && (
                                        <div className="pt-2 border-t border-gray-700">
                                            <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Their reason:</p>
                                            <p className="text-[10px] sm:text-xs text-gray-300 italic">
                                                "{selectedSeller.commissionOffer.counterOffer.reason}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm sm:text-base text-gray-400 font-kumbh-sans mb-3 sm:mb-4">
                                Offer commission rate to <span className="text-white font-medium">{selectedSeller.fullName}</span>
                            </p>
                        )}

                        <div className="mb-4 sm:mb-6">
                            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5 sm:mb-2">
                                {selectedSeller.commissionOffer?.counterOffer ? 'Your new offer (%)' : 'Commission Rate (%)'}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                                className="w-full px-3 sm:px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                            />
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                Platform will take {commissionRate}% from each sale
                                {selectedSeller.commissionOffer?.counterOffer &&
                                    commissionRate === selectedSeller.commissionOffer.counterOffer.rate && (
                                        <span className="text-[#00FF89] ml-2">✓ Accepting seller's rate</span>
                                    )}
                            </p>
                            {selectedSeller.commissionOffer?.counterOffer && (
                                <div className="mt-2 flex items-center gap-2 text-[10px] sm:text-xs">
                                    <span className="text-gray-500">Quick options:</span>
                                    <button
                                        type="button"
                                        onClick={() => setCommissionRate(selectedSeller.commissionOffer.counterOffer.rate)}
                                        className="px-2 py-1 bg-[#FFC050]/20 text-[#FFC050] rounded hover:bg-[#FFC050]/30 transition-colors">
                                        Accept their rate ({selectedSeller.commissionOffer.counterOffer.rate}%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const middle = Math.round(
                                                (selectedSeller.commissionOffer.rate + selectedSeller.commissionOffer.counterOffer.rate) / 2
                                            )
                                            setCommissionRate(middle)
                                        }}
                                        className="px-2 py-1 bg-[#00FF89]/20 text-[#00FF89] rounded hover:bg-[#00FF89]/30 transition-colors">
                                        Meet in middle (
                                        {Math.round((selectedSeller.commissionOffer.rate + selectedSeller.commissionOffer.counterOffer.rate) / 2)}%)
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={handleOfferCommission}
                                className="flex-1 px-3 sm:px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors text-xs sm:text-sm">
                                {selectedSeller.commissionOffer?.counterOffer && commissionRate === selectedSeller.commissionOffer.counterOffer.rate
                                    ? 'Accept Counter Offer'
                                    : 'Send Offer'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowCommissionModal(false)
                                    setSelectedSeller(null)
                                }}
                                className="flex-1 px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-xs sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Counter Offer Modal */}
            {showRejectCounterModal && selectedSeller && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-white font-league-spartan">Reject Counter Offer</h3>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    This will reject the seller's counter offer and end the negotiation.
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="bg-[#121212] border border-gray-700 rounded-lg p-3 space-y-2 mb-4">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-500">Seller:</span>
                                    <span className="text-white font-medium">{selectedSeller.fullName}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-500">Original offer:</span>
                                    <span className="text-gray-300">{selectedSeller.commissionOffer?.rate}%</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-500">Counter offer:</span>
                                    <span className="text-[#FFC050] font-bold">{selectedSeller.commissionOffer?.counterOffer?.rate}%</span>
                                </div>
                            </div>

                            <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                                Reason for rejection <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a reason for rejecting this counter offer..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#121212] border border-gray-700 rounded-lg text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent resize-none"
                                rows="4"
                            />
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                This message will be sent to the seller explaining why their counter offer was rejected.
                            </p>
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={handleRejectCounterOffer}
                                disabled={!rejectReason.trim()}
                                className="flex-1 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center justify-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Reject Counter Offer
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectCounterModal(false)
                                    setSelectedSeller(null)
                                    setRejectReason('')
                                }}
                                className="flex-1 px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-xs sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

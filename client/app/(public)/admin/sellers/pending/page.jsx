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
    Filter
} from 'lucide-react'

export default function PendingSellersPage() {
    const [sellers, setSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSeller, setSelectedSeller] = useState(null)
    const [showCommissionModal, setShowCommissionModal] = useState(false)
    const [commissionRate, setCommissionRate] = useState(15)
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
            label: 'Pending',
            icon: Clock,
            actions: ['review', 'reject']
        },
        under_review: {
            color: 'text-[#00AFFF]',
            bgColor: 'bg-[#00AFFF]/20',
            label: 'Under Review',
            icon: Eye,
            actions: ['offer_commission', 'reject']
        },
        commission_offered: {
            color: 'text-[#00FF89]',
            bgColor: 'bg-[#00FF89]/10',
            label: 'Commission Offered',
            icon: DollarSign,
            actions: ['view_offer', 'resend', 'reject']
        }
    }

    const fetchPendingSellers = async () => {
        setLoading(true)
        try {
            const response = await adminAPI.sellers.getByStatus.fetch(activeStatusFilter, page, 30)
            if (response?.profiles) {
                let sellersWithStatus = response.profiles.map((seller) => ({
                    ...seller,
                    currentStatus: seller.verification?.status || seller.status || 'pending'
                }))

                if (activeStatusFilter === 'all') {
                    sellersWithStatus = sellersWithStatus.filter((seller) => {
                        const status = seller.currentStatus || seller.status
                        return status !== 'approved' && status !== 'active'
                    })
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
            // For now, using approve as placeholder
            // await adminAPI.sellers.profile.startReview(sellerId)

            // Temporary: You might need to create this endpoint
            toast.info('Start review functionality needs to be implemented in backend')

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
        return new Date(date).toLocaleDateString('en-US', {
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
                commission_offered: sellers.filter((s) => s.currentStatus === 'commission_offered').length
            }
        } else {
            const count = pagination.total || sellers.length
            return {
                all: '-',
                pending: activeStatusFilter === 'pending' ? count : '-',
                under_review: activeStatusFilter === 'under_review' ? count : '-',
                commission_offered: activeStatusFilter === 'commission_offered' ? count : '-'
            }
        }
    }

    const statusCounts = getStatusCounts()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold font-league-spartan text-white">Pending Seller Approvals</h1>
                        <p className="text-gray-400 font-kumbh-sans mt-1 text-lg">Review and approve seller profiles</p>
                    </div>
                    <button
                        onClick={() => fetchPendingSellers()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#252525] transition-colors font-kumbh-sans">
                        <RefreshCw className="w-5 h-5" />
                        Refresh
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email, location, niches, or tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-2 border-t border-gray-800 pt-4">
                    <Filter className="w-4 h-4 text-gray-500 mr-2" />
                    <button
                        onClick={() => {
                            setActiveStatusFilter('all')
                            setPage(1)
                            setSearchQuery('')
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeStatusFilter === 'all' ? 'bg-[#00FF89] text-[#121212]' : 'bg-[#121212] text-gray-400 hover:bg-[#252525]'
                        }`}>
                        All {statusCounts.all !== '-' && `(${statusCounts.all})`}
                    </button>
                    <button
                        onClick={() => {
                            setActiveStatusFilter('pending')
                            setPage(1)
                            setSearchQuery('')
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeStatusFilter === 'pending' ? 'bg-[#FFC050]/20 text-[#FFC050]' : 'bg-[#121212] text-gray-400 hover:bg-[#252525]'
                        }`}>
                        Pending {statusCounts.pending !== '-' && `(${statusCounts.pending})`}
                    </button>
                    <button
                        onClick={() => {
                            setActiveStatusFilter('under_review')
                            setPage(1)
                            setSearchQuery('')
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeStatusFilter === 'under_review' ? 'bg-[#00AFFF]/20 text-[#00AFFF]' : 'bg-[#121212] text-gray-400 hover:bg-[#252525]'
                        }`}>
                        Under Review {statusCounts.under_review !== '-' && `(${statusCounts.under_review})`}
                    </button>
                    <button
                        onClick={() => {
                            setActiveStatusFilter('commission_offered')
                            setPage(1)
                            setSearchQuery('')
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeStatusFilter === 'commission_offered'
                                ? 'bg-[#00FF89]/10 text-[#00FF89]'
                                : 'bg-[#121212] text-gray-400 hover:bg-[#252525]'
                        }`}>
                        Commission Offered {statusCounts.commission_offered !== '-' && `(${statusCounts.commission_offered})`}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Clock className="w-8 h-8 text-[#FFC050]" />
                        <span className="text-xs text-[#FFC050] uppercase tracking-wider font-medium">Pending</span>
                    </div>
                    <p className="text-3xl font-bold text-white font-league-spartan">{statusCounts.pending}</p>
                    <p className="text-gray-400 text-sm font-kumbh-sans mt-1">Awaiting Review</p>
                </div>

                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Eye className="w-8 h-8 text-[#00AFFF]" />
                        <span className="text-xs text-[#00AFFF] uppercase tracking-wider font-medium">Reviewing</span>
                    </div>
                    <p className="text-3xl font-bold text-white font-league-spartan">{statusCounts.under_review}</p>
                    <p className="text-gray-400 text-sm font-kumbh-sans mt-1">Under Review</p>
                </div>

                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <DollarSign className="w-8 h-8 text-[#00FF89]" />
                        <span className="text-xs text-[#00FF89] uppercase tracking-wider font-medium">Offered</span>
                    </div>
                    <p className="text-3xl font-bold text-white font-league-spartan">{statusCounts.commission_offered}</p>
                    <p className="text-gray-400 text-sm font-kumbh-sans mt-1">Commission Sent</p>
                </div>

                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <UserCheck className="w-8 h-8 text-[#00FF89]" />
                        <span className="text-xs text-[#00FF89] uppercase tracking-wider font-medium">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-white font-league-spartan">{statusCounts.all}</p>
                    <p className="text-gray-400 text-sm font-kumbh-sans mt-1">All Pending</p>
                </div>
            </div>

            {/* Search Results Count */}
            {searchQuery && (
                <div className="text-sm text-gray-400">
                    Showing {filteredSellers.length} results for "{searchQuery}"
                </div>
            )}

            {/* Sellers List - Accordion Style */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#00FF89] border-t-transparent"></div>
                </div>
            ) : filteredSellers.length === 0 ? (
                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-12 text-center">
                    <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white font-league-spartan">
                        {searchQuery ? 'No sellers found matching your search' : 'No Pending Sellers'}
                    </h3>
                    <p className="text-gray-400 font-kumbh-sans mt-2">
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
                                {/* Collapsed View - Always Visible */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 bg-[#00FF89]/20 rounded-full flex items-center justify-center text-[#00FF89] font-bold text-lg">
                                                {seller.fullName?.charAt(0).toUpperCase() || 'S'}
                                            </div>

                                            {/* Basic Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-white font-league-spartan">
                                                        {seller.fullName || 'Unnamed Seller'}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full font-medium ${config.bgColor} ${config.color}`}>
                                                        <config.icon className="w-3 h-3" />
                                                        {config.label}
                                                    </span>
                                                    {seller.revenueShareAgreement?.accepted && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Revenue Accepted
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {seller.email}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {seller.location?.country || 'Unknown'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDate(seller.verification?.submittedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {status === 'pending' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleStartReview(seller._id)
                                                    }}
                                                    className="px-4 py-2 bg-[#00AFFF] text-white rounded-lg font-medium hover:bg-[#00AFFF]/90 transition-colors text-sm flex items-center gap-1.5">
                                                    <Eye className="w-4 h-4" />
                                                    Start Review
                                                </button>
                                            )}

                                            {status === 'under_review' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedSeller(seller)
                                                        setShowCommissionModal(true)
                                                    }}
                                                    className="px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors text-sm flex items-center gap-1.5">
                                                    <DollarSign className="w-4 h-4" />
                                                    Offer Commission
                                                </button>
                                            )}

                                            {status === 'commission_offered' && (
                                                <>
                                                    <button className="px-4 py-2 bg-[#00FF89]/10 text-[#00FF89] rounded-lg font-medium text-sm">
                                                        Awaiting Response
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            // Handle resend
                                                        }}
                                                        className="p-2 bg-[#121212] text-gray-400 rounded-lg hover:bg-[#252525] transition-colors">
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const reason = prompt('Please provide a reason for rejection:')
                                                    if (reason) {
                                                        handleRejectSeller(seller._id, reason)
                                                    }
                                                }}
                                                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => toggleSellerExpansion(seller._id)}
                                                className="p-2 bg-[#121212] text-gray-400 rounded-lg hover:bg-[#252525] transition-colors">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded View - Details */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-800">
                                        <div className="pt-4 space-y-4">
                                            {/* Status Timeline */}
                                            {status === 'commission_offered' && seller.commissionOffer && (
                                                <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-lg p-3 mb-4">
                                                    <p className="text-sm text-[#00FF89] font-medium mb-1">Commission Offer Details</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                                        <span>Rate: {seller.commissionOffer.rate}%</span>
                                                        <span>Sent: {formatDate(seller.commissionOffer.sentAt)}</span>
                                                        <span>Status: {seller.commissionOffer.status}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contact Information Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                <div className="bg-[#121212] rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Account Email</p>
                                                    <p className="text-sm text-white">{seller.userId?.emailAddress || 'N/A'}</p>
                                                </div>
                                                <div className="bg-[#121212] rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Website</p>
                                                    <a
                                                        href={seller.websiteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-[#00FF89] hover:underline">
                                                        {seller.websiteUrl || 'No website'}
                                                    </a>
                                                </div>
                                                <div className="bg-[#121212] rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Payout Method</p>
                                                    <p className="text-sm text-white capitalize">{seller.payoutInfo?.method || 'Not set'}</p>
                                                </div>
                                            </div>

                                            {/* Bio */}
                                            {seller.bio && (
                                                <div className="bg-[#121212] rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Bio</p>
                                                    <p className="text-sm text-gray-300">{seller.bio}</p>
                                                </div>
                                            )}

                                            {/* Skills Section */}
                                            <div className="space-y-3">
                                                {seller.niches && seller.niches.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-2">Niches</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {seller.niches.map((niche, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 bg-[#00FF89]/10 text-[#00FF89] text-xs rounded-lg">
                                                                    {niche}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {seller.toolsSpecialization && seller.toolsSpecialization.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-2">Tools Specialization</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {seller.toolsSpecialization.map((tool, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 bg-[#FFC050]/10 text-[#FFC050] text-xs rounded-lg">
                                                                    {tool}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats and Actions */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                                <div className="flex items-center gap-6 text-xs text-gray-500">
                                                    <span>
                                                        Products: <span className="text-white">{seller.stats?.totalProducts || 0}</span>
                                                    </span>
                                                    <span>
                                                        Sales: <span className="text-white">{seller.stats?.totalSales || 0}</span>
                                                    </span>
                                                    <span>
                                                        Earnings: <span className="text-white">${seller.stats?.totalEarnings || 0}</span>
                                                    </span>
                                                    <span>
                                                        Views: <span className="text-white">{seller.stats?.profileViews || 0}</span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button className="text-[#00FF89] hover:text-[#00FF89]/80 text-sm font-medium flex items-center gap-1.5">
                                                        <FileText className="w-4 h-4" />
                                                        Documents
                                                    </button>
                                                    <button className="text-[#00FF89] hover:text-[#00FF89]/80 text-sm font-medium flex items-center gap-1.5">
                                                        <Eye className="w-4 h-4" />
                                                        Full Profile
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
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-[#1f1f1f] border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252525] transition-colors">
                        Previous
                    </button>
                    <span className="text-white px-4">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-[#1f1f1f] border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#252525] transition-colors">
                        Next
                    </button>
                </div>
            )}

            {/* Commission Modal */}
            {showCommissionModal && selectedSeller && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-white font-league-spartan mb-4">Offer Commission Rate</h3>
                        <p className="text-gray-400 font-kumbh-sans mb-4">
                            Offer commission rate to <span className="text-white font-medium">{selectedSeller.fullName}</span>
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Commission Rate (%)</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                                className="w-full px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Platform will take {commissionRate}% from each sale</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleOfferCommission}
                                className="flex-1 px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors">
                                Send Offer
                            </button>
                            <button
                                onClick={() => {
                                    setShowCommissionModal(false)
                                    setSelectedSeller(null)
                                }}
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


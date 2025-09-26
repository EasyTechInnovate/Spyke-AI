'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo, useCallback, useRef, useId } from 'react'
import { adminAPI } from '@/lib/api/admin'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
import {
    Users,
    RefreshCw,
    Timer,
    TrendingUp,
    Activity,
    Zap,
    Search,
    Filter,
    Clock,
    Eye,
    DollarSign,
    X,
    MapPin,
    Calendar,
    Mail,
    CheckCircle,
    FileText,
    Globe,
    Star,
    ArrowRight,
    XCircle,
    Info,
    X as CloseIcon,
    Download
} from 'lucide-react'
import { PageHeader, LoadingSkeleton, EmptyState, QuickActionsBar, StatsGrid } from '@/components/admin'
const BRAND = '#00FF89'
const AMBER = '#FFC050'
function formatDate(date) {
    if (!date) return 'N/A'
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now - d) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function mapStatus(seller) {
    // Handle commission offer statuses first
    const cs = seller?.commissionOffer?.status
    if (cs === 'counter_offered') return 'counter_offered'
    if (cs === 'offered' || cs === 'commission_offered') return 'commission_offered'
    
    // Return verification status (includes under_review)
    return seller?.verification?.status || seller?.status || 'pending'
}
const statusConfig = {
    pending: {
        color: 'text-[#FFC050]',
        chip: 'bg-[#352a14] text-[#FFC050]',
        label: 'Pending Review',
        icon: Clock,
        hint: 'Waiting for seller to upload documents and submit for verification.'
    },
    under_review: {
        color: 'text-[#7dd3fc]',
        chip: 'bg-[#0b2833] text-[#7dd3fc]',
        label: 'Under Review',
        icon: Eye,
        hint: 'Documents submitted. Admin can now offer commission rate.'
    },
    commission_offered: {
        color: 'text-[#00FF89]',
        chip: 'bg-[#113226] text-[#00FF89]',
        label: 'Commission Offered',
        icon: DollarSign,
        hint: 'Waiting for the seller to accept or counter.'
    },
    counter_offered: {
        color: 'text-[#FFC050]',
        chip: 'bg-[#352a14] text-[#FFC050]',
        label: 'Counter Offer',
        icon: Zap,
        hint: 'Seller proposed a different rate. Accept or propose new.'
    }
}
export default function PendingSellersPage() {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const [sellers, setSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const [tabSwitching, setTabSwitching] = useState(false)
    const [listOpacity, setListOpacity] = useState(1)
    const [selectedSeller, setSelectedSeller] = useState(null)
    const [showCommissionModal, setShowCommissionModal] = useState(false)
    const [showRejectAppModal, setShowRejectAppModal] = useState(false)
    const [showSellerDetailsModal, setShowSellerDetailsModal] = useState(false)
    const [commissionRate, setCommissionRate] = useState(15)
    const [rejectReason, setRejectReason] = useState('')
    const [legendOpen, setLegendOpen] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pagination, setPagination] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [activeStatusFilter, setActiveStatusFilter] = useState('all')
    const [selectedSellers, setSelectedSellers] = useState(new Set())
    const [showBulkActions, setShowBulkActions] = useState(false)
    const [bulkActionType, setBulkActionType] = useState(null)
    const [counts, setCounts] = useState({
        all: undefined,
        pending: undefined,
        under_review: undefined,
        commission_offered: undefined,
        counter_offered: undefined
    })
    const [actionLoading, setActionLoading] = useState(false)
    const latestReqIdRef = useRef(0)
    const cacheRef = useRef(new Map())
    const [sortBy, setSortBy] = useState('submittedAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [advancedFilters, setAdvancedFilters] = useState({
        country: '',
        experienceLevel: '',
        hasWebsite: '',
        payoutMethod: '',
        dateRange: ''
    })
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const sortOptions = [
        { value: 'submittedAt', label: 'Application Date' },
        { value: 'fullName', label: 'Name' },
        { value: 'location.country', label: 'Country' },
        { value: 'stats.totalProducts', label: 'Products' },
        { value: 'toolsSpecialization.length', label: 'Experience' }
    ]
    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortBy(newSortBy)
            setSortOrder('desc')
        }
        fetchList()
    }
    const exportSellersData = (sellersData) => {
        const csvContent = [
            ['Name', 'Email', 'Country', 'Status', 'Niches', 'Tools', 'Website', 'Submitted'],
            ...sellersData.map((seller) => [
                seller.fullName || '',
                seller.email || '',
                seller.location?.country || '',
                seller.currentStatus || '',
                (seller.niches || []).join('; '),
                (seller.toolsSpecialization || []).join('; '),
                seller.websiteUrl || '',
                formatDate(seller.verification?.submittedAt)
            ])
        ]
            .map((row) => row.map((field) => `"${field}"`).join(','))
            .join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sellers-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
    const fetchList = useCallback(
        async ({ isTabChange = false, isManualRefresh = false, silent = false } = {}) => {
            const key = `${activeStatusFilter}:${page}`
            if (isManualRefresh) setListOpacity(0.6)
            if (isTabChange) setTabSwitching(true)
            if (!silent) setLoading(true)
            if (cacheRef.current.has(key)) {
                const cached = cacheRef.current.get(key)
                setSellers(cached.list)
                setPagination(cached.pagination || {})
                setTotalPages(cached.pagination?.totalPages || 1)
            }
            try {
                const reqId = ++latestReqIdRef.current
                const res = await adminAPI.sellers.getByStatus.fetch(activeStatusFilter, page, 30)
                if (reqId !== latestReqIdRef.current) return
                const payload = res?.data?.profiles ? res.data : res
                const profiles = payload?.profiles || []
                const serverPagination = payload?.pagination || {}
                const withStatus = profiles.map((s) => ({ ...s, currentStatus: mapStatus(s) }))
                const filtered =
                    activeStatusFilter === 'all'
                        ? withStatus.filter((s) => !['approved', 'active'].includes(s.currentStatus))
                        : withStatus.filter((s) => s.currentStatus === activeStatusFilter)
                cacheRef.current.set(key, { list: filtered, pagination: serverPagination })
                setSellers(filtered)
                setPagination(serverPagination || {})
                setTotalPages(serverPagination?.totalPages || 1)
                if (activeStatusFilter === 'all') {
                    const newCounts = {
                        all: filtered.length,
                        pending: filtered.filter((s) => s.currentStatus === 'pending').length,
                        under_review: filtered.filter((s) => s.currentStatus === 'under_review').length,
                        commission_offered: filtered.filter((s) => s.currentStatus === 'commission_offered').length,
                        counter_offered: filtered.filter((s) => s.currentStatus === 'counter_offered').length
                    }
                    setCounts(newCounts)
                } else {
                    const thisTabCount = typeof serverPagination?.total === 'number' ? serverPagination.total : filtered.length
                    setCounts({
                        all: undefined,
                        pending: activeStatusFilter === 'pending' ? thisTabCount : undefined,
                        under_review: activeStatusFilter === 'under_review' ? thisTabCount : undefined,
                        commission_offered: activeStatusFilter === 'commission_offered' ? thisTabCount : undefined,
                        counter_offered: activeStatusFilter === 'counter_offered' ? thisTabCount : undefined
                    })
                }
            } catch (e) {
                console.error(e)
                showMessage('Failed to fetch sellers', 'error')
                setSellers([])
                setPagination({})
                setTotalPages(1)
                setCounts({
                    all: activeStatusFilter === 'all' ? 0 : undefined,
                    pending: activeStatusFilter === 'pending' ? 0 : undefined,
                    under_review: activeStatusFilter === 'under_review' ? 0 : undefined,
                    commission_offered: activeStatusFilter === 'commission_offered' ? 0 : undefined,
                    counter_offered: activeStatusFilter === 'counter_offered' ? 0 : undefined
                })
            } finally {
                setLoading(false)
                setTimeout(() => {
                    setTabSwitching(false)
                    setListOpacity(1)
                }, 120)
            }
        },
        [activeStatusFilter, page]
    )
    useEffect(() => {
        fetchList()
    }, [fetchList])
    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 220)
        return () => clearTimeout(id)
    }, [searchQuery])
    const filteredSellers = useMemo(() => {
        if (!debouncedQuery) return sellers
        return sellers.filter((seller) => {
            const q = debouncedQuery
            return (
                (seller.fullName || '').toLowerCase().includes(q) ||
                (seller.email || '').toLowerCase().includes(q) ||
                (seller.location?.country || '').toLowerCase().includes(q) ||
                (Array.isArray(seller.niches) && seller.niches.some((n) => (n || '').toLowerCase().includes(q))) ||
                (Array.isArray(seller.toolsSpecialization) && seller.toolsSpecialization.some((t) => (t || '').toLowerCase().includes(q)))
            )
        })
    }, [debouncedQuery, sellers])
    const handleSelectSeller = (sellerId) => {
        setSelectedSellers((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(sellerId)) {
                newSet.delete(sellerId)
            } else {
                newSet.add(sellerId)
            }
            return newSet
        })
    }
    const handleSelectAll = () => {
        if (selectedSellers.size === filteredSellers.length) {
            setSelectedSellers(new Set())
        } else {
            setSelectedSellers(new Set(filteredSellers.map((s) => s._id)))
        }
    }
    const handleBulkAction = async (action) => {
        if (selectedSellers.size === 0) return
        setActionLoading(true)
        try {
            switch (action) {
                case 'approve':
                    await Promise.all([...selectedSellers].map((id) => adminAPI.sellers.commission.offer(id, 15)))
                    showMessage(`${selectedSellers.size} sellers approved`, 'success')
                    break
                case 'reject':
                    setBulkActionType('reject')
                    setShowBulkActions(true)
                    return
                case 'export':
                    const sellersData = filteredSellers.filter((s) => selectedSellers.has(s._id))
                    exportSellersData(sellersData)
                    showMessage('Sellers data exported', 'success')
                    break
            }
            setSelectedSellers(new Set())
            fetchList()
        } catch {
            showMessage('Bulk action failed', 'error')
        } finally {
            setActionLoading(false)
        }
    }
    const handleSubmitCommission = async () => {
        if (!selectedSeller) return
        if (Number.isNaN(commissionRate) || commissionRate < 1 || commissionRate > 100) {
            showMessage('Commission must be between 1% and 100%', 'error')
            return
        }
        setActionLoading(true)
        try {
            const hasCounter = !!selectedSeller?.commissionOffer?.counterOffer?.rate
            const counterRate = selectedSeller?.commissionOffer?.counterOffer?.rate
            if (hasCounter && commissionRate === counterRate) {
                await adminAPI.sellers.commission.acceptCounter(selectedSeller._id)
                showMessage(`Counter offer accepted (${counterRate}%)`, 'success')
            } else {
                await adminAPI.sellers.commission.offer(selectedSeller._id, commissionRate)
                if (hasCounter && commissionRate !== counterRate) {
                    showMessage(`Counter offer of ${commissionRate}% sent to seller`, 'success')
                } else {
                    showMessage(`Commission offer of ${commissionRate}% sent`, 'success')
                }
            }
            setShowCommissionModal(false)
            setSelectedSeller(null)
            fetchList()
        } catch {
            showMessage('Failed to submit commission decision', 'error')
        } finally {
            setActionLoading(false)
        }
    }
    const handleAcceptCounterOffer = async (sellerId, rate) => {
        setActionLoading(true)
        try {
            await adminAPI.sellers.commission.acceptCounter(sellerId)
            showMessage(`Counter offer of ${rate}% accepted`, 'success')
            fetchList()
        } catch {
            showMessage('Failed to accept counter offer', 'error')
        } finally {
            setActionLoading(false)
        }
    }
    const handleResendOffer = async (sellerId) => {
        const seller = sellers.find((s) => s._id === sellerId)
        if (!seller?.commissionOffer?.rate) return showMessage('No previous offer to resend', 'info')
        setActionLoading(true)
        try {
            await adminAPI.sellers.commission.offer(sellerId, seller.commissionOffer.rate)
            showMessage('Offer resent', 'success')
            fetchList()
        } catch {
            showMessage('Failed to resend offer', 'error')
        } finally {
            setActionLoading(false)
        }
    }
    const handleRejectApplication = async () => {
        if (!selectedSeller || !rejectReason.trim()) return
        setActionLoading(true)
        try {
            await adminAPI.sellers.profile.reject(selectedSeller._id, rejectReason.trim())
            showMessage('Application rejected', 'success')
            setShowRejectAppModal(false)
            setSelectedSeller(null)
            setRejectReason('')
            fetchList()
        } catch {
            showMessage('Failed to reject application', 'error')
        } finally {
            setActionLoading(false)
        }
    }
    const anyModalOpen = showCommissionModal || showRejectAppModal || showSellerDetailsModal
    useEffect(() => {
        if (typeof document === 'undefined') return
        const body = document.body
        if (anyModalOpen) {
            const prev = body.style.overflow
            body.style.overflow = 'hidden'
            const onKey = (e) => {
                if (e.key === 'Escape') {
                    setShowCommissionModal(false)
                    setShowRejectAppModal(false)
                    setShowSellerDetailsModal(false)
                    setSelectedSeller(null)
                }
            }
            window.addEventListener('keydown', onKey)
            return () => {
                body.style.overflow = prev
                window.removeEventListener('keydown', onKey)
            }
        }
    }, [anyModalOpen])
    const [realTimeUpdates, setRealTimeUpdates] = useState(true)
    const [notifications, setNotifications] = useState([])
    useEffect(() => {
        if (!realTimeUpdates) return
        const interval = setInterval(() => {
            fetchList({ silent: true })
        }, 30000)
        return () => clearInterval(interval)
    }, [realTimeUpdates, fetchList])
    const addNotification = (message, type = 'info') => {
        const id = Date.now()
        setNotifications((prev) => [...prev, { id, message, type, timestamp: new Date() }])
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id))
        }, 5000)
    }
    return (
        <div className="space-y-6">
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}
            <PageHeader
                title="Seller Applications"
                subtitle="Manage pending seller applications and commission offers"
                actions={[
                    <button
                        key="refresh"
                        type="button"
                        onClick={() => fetchList({ isManualRefresh: true })}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>,
                    <button
                        key="export"
                        type="button"
                        onClick={() => exportSellersData(filteredSellers)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 rounded-lg text-sm text-white font-medium transition-colors">
                        <Download className="w-4 h-4" />
                        Export All
                    </button>
                ]}
            />
            <LegendBannerAlways statusConfig={statusConfig} />
            <StatsGrid
                stats={[
                    {
                        label: 'Avg Time',
                        value: sellers.length ? '2.5d' : '0d',
                        icon: Timer
                    },
                    {
                        label: 'Conversion',
                        value: sellers.length ? '87%' : '0%',
                        icon: TrendingUp
                    },
                    {
                        label: 'Counters',
                        value: counts.counter_offered ?? 0,
                        icon: Zap
                    },
                    {
                        label: 'Total Pending',
                        value: counts.all ?? 0,
                        icon: Users
                    }
                ]}
            />
            {debouncedQuery && (
                <div className="text-sm text-gray-400 px-1">
                    Showing {filteredSellers.length} results for “{debouncedQuery}”.
                </div>
            )}
            <QuickActionsBar>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <FilterTab
                        id="all"
                        label="All"
                        active={activeStatusFilter}
                        count={counts.all}
                        onSelect={(id) => {
                            setPage(1)
                            setSearchQuery('')
                            setListOpacity(0.75)
                            setActiveStatusFilter(id)
                            fetchList({ isTabChange: true })
                        }}
                    />
                    <FilterTab
                        id="pending"
                        label="Pending"
                        icon={Clock}
                        tone="amber"
                        active={activeStatusFilter}
                        count={counts.pending}
                        onSelect={(id) => {
                            setPage(1)
                            setSearchQuery('')
                            setListOpacity(0.75)
                            setActiveStatusFilter(id)
                            fetchList({ isTabChange: true })
                        }}
                    />
                    <FilterTab
                        id="under_review"
                        label="Review"
                        icon={Eye}
                        tone="blue"
                        active={activeStatusFilter}
                        count={counts.under_review}
                        onSelect={(id) => {
                            setPage(1)
                            setSearchQuery('')
                            setListOpacity(0.75)
                            setActiveStatusFilter(id)
                            fetchList({ isTabChange: true })
                        }}
                    />
                    <FilterTab
                        id="commission_offered"
                        label="Offered"
                        icon={DollarSign}
                        tone="green"
                        active={activeStatusFilter}
                        count={counts.commission_offered}
                        onSelect={(id) => {
                            setPage(1)
                            setSearchQuery('')
                            setListOpacity(0.75)
                            setActiveStatusFilter(id)
                            fetchList({ isTabChange: true })
                        }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search name, email, country, niches, tools…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                            aria-label="Search sellers"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchList({ isManualRefresh: true })}
                        title="Refresh"
                        className="inline-flex items-center gap-2 px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#1b1b1b] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </QuickActionsBar>
            <section
                aria-busy={loading}
                className="transition-opacity duration-200"
                style={{ opacity: listOpacity }}>
                {loading && tabSwitching ? (
                    <LoadingSkeleton />
                ) : loading ? (
                    <Loader />
                ) : filteredSellers.length === 0 ? (
                    <EmptyState
                        title={debouncedQuery ? 'No matching sellers' : 'No Pending Sellers'}
                        description={debouncedQuery ? 'Try a different search.' : 'All applications have been processed.'}
                        icon={Users}
                    />
                ) : (
                    <div className="space-y-3">
                        {filteredSellers.map((seller) => (
                            <SellerCard
                                key={seller._id}
                                seller={seller}
                                onOpenCommission={() => {
                                    setSelectedSeller(seller)
                                    setCommissionRate(seller?.commissionOffer?.rate || 15)
                                    setShowCommissionModal(true)
                                }}
                                onAcceptCounter={(sellerId, rate) => handleAcceptCounterOffer(sellerId, rate)}
                                onResendOffer={(sellerId) => handleResendOffer(sellerId)}
                                onReject={() => {
                                    setSelectedSeller(seller)
                                    setShowRejectAppModal(true)
                                }}
                                onViewDetails={() => {
                                    setSelectedSeller(seller)
                                    setShowSellerDetailsModal(true)
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>
            {totalPages > 1 && !debouncedQuery && (
                <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2.5 bg-[#141414] border border-gray-800 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1b1b1b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                        Previous
                    </button>
                    <span className="text-sm text-white px-4">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2.5 bg-[#141414] border border-gray-800 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1b1b1b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                        Next
                    </button>
                </div>
            )}
            {showCommissionModal && selectedSeller && (
                <Modal
                    onClose={() => {
                        setShowCommissionModal(false)
                        setSelectedSeller(null)
                    }}>
                    <div className="max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Commission Decision</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            {selectedSeller.commissionOffer?.counterOffer
                                ? 'Accept the seller’s counter or propose a new rate.'
                                : 'Send your commission rate. The seller must accept this to start selling.'}
                        </p>
                        {selectedSeller.commissionOffer?.counterOffer && (
                            <div className="bg-[#121212] border border-gray-700 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Your original offer</span>
                                    <span className="text-white font-medium">{selectedSeller.commissionOffer.rate}%</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Seller’s counter offer</span>
                                    <span className="text-[#FFC050] font-medium">{selectedSeller.commissionOffer.counterOffer.rate}%</span>
                                </div>
                            </div>
                        )}
                        <label className="block text-sm font-medium text-gray-400 mb-2">Commission Rate (%)</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/50 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            The platform retains <span className="text-gray-300 font-medium">{commissionRate}%</span> per sale.
                            {selectedSeller.commissionOffer?.counterOffer && commissionRate === selectedSeller.commissionOffer.counterOffer.rate && (
                                <span className="text-[var(--neon,#00FF89)] ml-1">✓ Accepting seller’s rate</span>
                            )}
                        </p>
                        {selectedSeller.commissionOffer?.counterOffer && (
                            <div className="mt-4 flex items-center gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setCommissionRate(selectedSeller.commissionOffer.counterOffer.rate)}
                                    className="px-3 py-2 bg-[#FFC050]/20 text-[#FFC050] rounded hover:bg-[#FFC050]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC050]/60">
                                    Use seller’s rate ({selectedSeller.commissionOffer.counterOffer.rate}%)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const middle = Math.round(
                                            (selectedSeller.commissionOffer.rate + selectedSeller.commissionOffer.counterOffer.rate) / 2
                                        )
                                        setCommissionRate(middle)
                                    }}
                                    className="px-3 py-2 bg-[var(--neon,#00FF89)]/20 text-[var(--neon,#00FF89)] rounded hover:bg-[var(--neon,#00FF89)]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                                    Meet in the middle (
                                    {Math.round((selectedSeller.commissionOffer.rate + selectedSeller.commissionOffer.counterOffer.rate) / 2)}%)
                                </button>
                            </div>
                        )}
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleSubmitCommission}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-3 bg-[var(--neon,#00FF89)] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60 disabled:opacity-50">
                                {selectedSeller.commissionOffer?.counterOffer && commissionRate === selectedSeller.commissionOffer.counterOffer.rate
                                    ? 'Accept Counter Offer'
                                    : 'Send Offer'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCommissionModal(false)
                                    setSelectedSeller(null)
                                }}
                                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/60">
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {showRejectAppModal && selectedSeller && (
                <Modal
                    onClose={() => {
                        setShowRejectAppModal(false)
                        setSelectedSeller(null)
                        setRejectReason('')
                    }}>
                    <div className="max-w-md w-full">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Reject Application</h3>
                                <p className="text-sm text-gray-400 mt-1">This rejects the seller’s application and ends negotiations.</p>
                            </div>
                        </div>
                        <div className="bg-[#121212] border border-gray-700 rounded-lg p-4 space-y-3 mb-4">
                            <MiniRow
                                label="Seller"
                                value={selectedSeller.fullName}
                            />
                            <MiniRow
                                label="Current offer"
                                value={(selectedSeller.commissionOffer?.rate ?? '—') + '%'}
                            />
                            {selectedSeller.commissionOffer?.counterOffer?.rate && (
                                <MiniRow
                                    label="Counter offer"
                                    value={<span className="text-[#FFC050] font-semibold">{selectedSeller.commissionOffer.counterOffer.rate}%</span>}
                                />
                            )}
                        </div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Reason for rejection <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            placeholder="Provide a clear reason that will be sent to the seller…"
                            className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus:border-transparent resize-none"
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleRejectApplication}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 disabled:opacity-50">
                                Reject Application
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRejectAppModal(false)
                                    setSelectedSeller(null)
                                    setRejectReason('')
                                }}
                                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/60">
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {showSellerDetailsModal && selectedSeller && (
                <Modal
                    onClose={() => {
                        setShowSellerDetailsModal(false)
                        setSelectedSeller(null)
                    }}>
                    <div className="max-w-3xl w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Seller Details</h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"
                                    style={{ backgroundColor: '#00FF891a', color: '#00FF89' }}>
                                    {(selectedSeller.fullName || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-white">{selectedSeller.fullName || 'Unnamed Seller'}</h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
                                        <span className="flex items-center gap-1.5 min-w-0">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{selectedSeller.email || '—'}</span>
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {selectedSeller.location?.country || 'Unknown'}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(selectedSeller.verification?.submittedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <MetricsGrid seller={selectedSeller} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ContactBlock seller={selectedSeller} />
                                <BioBlock seller={selectedSeller} />
                            </div>
                            <ExpertiseBlock seller={selectedSeller} />
                        </div>
                    </div>
                </Modal>
            )}
            {selectedSellers.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl px-5 py-4 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-300">
                                {selectedSellers.size} seller{selectedSellers.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleBulkAction('approve')}
                                    disabled={actionLoading}
                                    className="px-4 py-2.5 bg-[#00FF89] text-[#121212] rounded-lg text-sm font-medium hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50">
                                    Approve All
                                </button>
                                <button
                                    onClick={() => handleBulkAction('reject')}
                                    disabled={actionLoading}
                                    className="px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                                    Reject All
                                </button>
                                <button
                                    onClick={() => handleBulkAction('export')}
                                    className="px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                                    Export
                                </button>
                                <button
                                    onClick={() => setSelectedSellers(new Set())}
                                    className="p-2 text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {notifications.length > 0 && (
                <div className="fixed top-6 right-6 z-50 space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`px-4 py-3 rounded-lg border max-w-sm ${
                                notification.type === 'success'
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : notification.type === 'error'
                                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            }`}>
                            <p className="text-sm">{notification.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
function MiniKPI({ label, value, icon }) {
    return (
        <div className="relative rounded-lg border border-gray-800 bg-[#0f0f0f] px-3 py-2">
            <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
                <div className="opacity-80">{icon}</div>
            </div>
            <div className="text-lg font-bold text-white">{value}</div>
        </div>
    )
}
function FilterTab({ id, label, active, onSelect, icon: Icon, tone = 'neutral', count }) {
    const isActive = active === id
    const toneClass =
        tone === 'green'
            ? 'bg-[#113226] text-[#00FF89]'
            : tone === 'amber'
              ? 'bg-[#352a14] text-[#FFC050]'
              : tone === 'blue'
                ? 'bg-[#0b2833] text-[#7dd3fc]'
                : 'bg-[#1e1e1e] text-gray-300'
    const activeClass = isActive ? `${toneClass} ring-1 ring-white/10` : 'bg-[#0f0f0f] text-gray-400 hover:bg-[#1b1b1b]'
    const showCount = typeof count === 'number'
    return (
        <button
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelect?.(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[${BRAND}]/60 ${activeClass}`}>
            {Icon ? <Icon className="w-4 h-4" /> : null}
            {label}
            {showCount ? <span className="ml-1.5">{count}</span> : null}
        </button>
    )
}
function Loader() {
    return (
        <div className="flex items-center justify-center h-64">
            <div
                className="animate-spin rounded-full h-12 w-12 border-2"
                style={{ borderColor: `${BRAND}`, borderTopColor: 'transparent' }}
            />
        </div>
    )
}
function SkeletonList() {
    return (
        <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 w-2/3 bg-white/10 rounded" />
                            <div className="h-3 w-1/2 bg-white/10 rounded" />
                            <div className="h-10 w-full bg-white/5 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
function Stepper({ current }) {
    const steps = [
        { id: 'pending', label: 'Pending' },
        { id: 'under_review', label: 'Review' },
        { id: 'commission_offered', label: 'Offer' },
        { id: 'counter_offered', label: 'Counter' }
    ]
    const idx = steps.findIndex((s) => s.id === current)
    return (
        <div className="mt-3">
            <div className="flex items-center gap-2">
                {steps.map((s, i) => {
                    const active = i <= (idx === -1 ? 0 : idx)
                    return (
                        <div
                            key={s.id}
                            className="flex items-center gap-2">
                            <div
                                className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-[var(--neon,#00FF89)]' : 'bg-gray-700'}`}
                                title={s.label}
                                aria-label={s.label}
                            />
                            <span className={`text-xs ${active ? 'text-gray-200' : 'text-gray-500'}`}>{s.label}</span>
                            {i < steps.length - 1 && <div className={`w-6 h-[2px] ${i < idx ? 'bg-[var(--neon,#00FF89)]' : 'bg-gray-700'}`} />}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
function CounterStrip({ seller }) {
    return (
        <div className="bg-[#131313] border border-[#FFC050]/25 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-[#FFC050] mt-0.5" />
                <div className="flex-1">
                    <h4 className="font-semibold text-[#FFC050] mb-2 text-sm sm:text-base">Counter Offer Received</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <BadgeRow
                            label="Original Offer"
                            value={`${seller.commissionOffer.rate}%`}
                        />
                        <ArrowRight className="w-4 h-4 text-[#FFC050] hidden sm:block" />
                        <BadgeRow
                            label="Seller Counter"
                            value={`${seller.commissionOffer.counterOffer.rate}%`}
                            highlight
                        />
                    </div>
                    {seller.commissionOffer.counterOffer.reason && (
                        <div className="mt-3 p-2 bg-[#0f0f0f] rounded">
                            <p className="text-[11px] text-gray-500 mb-1">Seller’s reason:</p>
                            <p className="text-xs text-gray-200">{seller.commissionOffer.counterOffer.reason}</p>
                        </div>
                    )}
                    <p className="text-[11px] text-gray-500 mt-2">Submitted {formatDate(seller.commissionOffer.counterOffer.submittedAt)}</p>
                </div>
            </div>
        </div>
    )
}
function BadgeRow({ label, value, highlight }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">{label}:</span>
            <span className={`text-sm font-bold ${highlight ? 'text-[#FFC050]' : 'text-white'}`}>{value}</span>
        </div>
    )
}
function MetricsGrid({ seller }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile
                label="Products"
                value={seller.stats?.totalProducts || 0}>
                <FileText
                    className="w-5 h-5"
                    style={{ color: BRAND }}
                />
            </StatTile>
            <StatTile
                label="Experience"
                value={seller.toolsSpecialization?.length || 0}>
                <Star className="w-5 h-5 text-[#FFC050]" />
            </StatTile>
            <StatTile
                label="Profile"
                value={seller.bio && seller.websiteUrl && seller.payoutInfo?.method ? '100%' : seller.bio || seller.websiteUrl ? '60%' : '30%'}>
                <Activity
                    className="w-5 h-5"
                    style={{ color: BRAND }}
                />
            </StatTile>
            <StatTile
                label="Website"
                value={seller.websiteUrl ? 'Yes' : 'No'}>
                <Globe className="w-5 h-5 text-[#7dd3fc]" />
            </StatTile>
        </div>
    )
}
function StatTile({ label, value, children }) {
    return (
        <div className="bg-[#121212] rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{label}</span>
                {children}
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-transparent mt-1">.</p>
        </div>
    )
}
function ContactBlock({ seller }) {
    return (
        <div>
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Contact</h4>
            <div className="space-y-3">
                <Row
                    label="Primary Email"
                    value={seller.email || '—'}
                    icon={<Mail className="w-4 h-4 text-gray-500" />}
                />
                <Row
                    label="Website"
                    value={
                        seller.websiteUrl ? (
                            <a
                                href={seller.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[var(--neon,#00FF89)] hover:underline break-all">
                                {seller.websiteUrl}
                            </a>
                        ) : (
                            'Not provided'
                        )
                    }
                    icon={<Globe className="w-4 h-4 text-gray-500" />}
                />
                <Row
                    label="Payout Method"
                    value={seller.payoutInfo?.method ? seller.payoutInfo?.method : 'Not configured'}
                    icon={<DollarSign className="w-4 h-4 text-gray-500" />}
                />
            </div>
        </div>
    )
}
function BioBlock({ seller }) {
    const hasBio = !!seller.bio
    return (
        <div>
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Seller Profile</h4>
            {hasBio ? (
                <div className="bg-[#121212] rounded-lg p-4 border border-gray-800">
                    <p className="text-sm text-gray-300 leading-relaxed break-words whitespace-pre-wrap">{seller.bio}</p>
                </div>
            ) : (
                <div className="bg-[#121212] rounded-lg p-4 border border-gray-800 text-center">
                    <p className="text-sm text-gray-500">No bio provided</p>
                </div>
            )}
        </div>
    )
}
function ExpertiseBlock({ seller }) {
    const hasNiches = Array.isArray(seller.niches) && seller.niches.length > 0
    const hasTools = Array.isArray(seller.toolsSpecialization) && seller.toolsSpecialization.length > 0
    if (!hasNiches && !hasTools) return null
    return (
        <div className="space-y-4">
            {hasNiches && (
                <div>
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Specialization Niches</h4>
                    <div className="flex flex-wrap gap-2">
                        {seller.niches.map((n, i) => (
                            <span
                                key={i}
                                className="px-3 py-2 bg-[#0d1f19] text-[var(--neon,#00FF89)] text-sm rounded-lg">
                                {n}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {hasTools && (
                <div>
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Tool Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                        {seller.toolsSpecialization.map((t, i) => (
                            <span
                                key={i}
                                className="px-3 py-2 bg-[#352a14] text-[#FFC050] text-sm rounded-lg">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
function Row({ label, value, icon }) {
    return (
        <div className="flex items-start gap-2">
            {icon ? <div className="mt-0.5">{icon}</div> : null}
            <div className="flex-1">
                <p className="text-xs text-gray-500">{label}</p>
                <div className="text-sm text-white break-words">{value}</div>
            </div>
        </div>
    )
}
function MiniRow({ label, value }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}:</span>
            <span className="text-white">{value}</span>
        </div>
    )
}
function ActionPrimary({ onClick, label, sub, icon: Icon, loading }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className="group px-4 py-2.5 bg-[var(--neon,#00FF89)] text-[#121212] rounded-lg font-medium text-sm hover:bg-[#00FF89]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60 disabled:opacity-50"
            aria-label={label}
            title={sub}>
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
        </button>
    )
}
function InfoTip({ label = 'Info', children }) {
    const [open, setOpen] = useState(false)
    const id = useId()
    useEffect(() => {
        if (!open) return
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])
    return (
        <div className="relative inline-block">
            <button
                type="button"
                aria-label={label}
                aria-describedby={open ? id : undefined}
                onClick={() => setOpen((v) => !v)}
                onBlur={() => setOpen(false)}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                <Info className="w-4 h-4" />
            </button>
            <div
                id={id}
                role="tooltip"
                className={`absolute z-50 w-64 sm:w-72 -right-1 top-full mt-2 origin-top-right rounded-lg border border-gray-800 bg-[#121212] p-3 shadow-xl transition ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {children}
            </div>
        </div>
    )
}
function Modal({ onClose, children }) {
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            onClick={onClose}>
            <div
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}
function openDocs(seller) {
    const docs = seller?.verification?.documents
    if (!docs) return showMessage('No documents uploaded yet', 'info')
    const firstDoc = docs.identityProof || docs.businessProof || docs.taxDocument
    firstDoc ? window.open(firstDoc, '_blank', 'noopener,noreferrer') : showMessage('No documents available', 'info')
}
function openProfile(seller) {
    try {
        window.open(`/admin/sellers/${seller._id}`, '_blank', 'noopener,noreferrer')
    } catch {
        showMessage('Profile page coming soon.', 'info')
    }
}
function SellerCard({ seller, onOpenCommission, onAcceptCounter, onResendOffer, onReject, onViewDetails }) {
    const status = seller.currentStatus || 'pending'
    const cfg = statusConfig[status] || statusConfig.pending
    const hasCounter = !!seller?.commissionOffer?.counterOffer
    const handleAcceptCounter = () => onAcceptCounter(seller._id, seller?.commissionOffer?.counterOffer?.rate)
    const handleResendOffer = () => onResendOffer(seller._id)
    const primaryAction = (() => {
        if (status === 'under_review') {
            return { label: 'Offer Commission', icon: DollarSign, onClick: onOpenCommission }
        }
        if (status === 'commission_offered' && !hasCounter) {
            return { label: 'Resend Offer', icon: RefreshCw, onClick: handleResendOffer }
        }
        if (status === 'counter_offered' && hasCounter) {
            return { label: 'Accept Counter', icon: CheckCircle, onClick: handleAcceptCounter }
        }
        return null
    })()
    const showBothCounterActions = status === 'counter_offered' && hasCounter
    return (
        <div className="rounded-xl border border-gray-800 bg-[#171717] overflow-hidden">
            <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"
                            style={{ backgroundColor: '#00FF891a', color: '#00FF89' }}>
                            {(seller.fullName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-semibold text-white truncate">{seller.fullName || 'Unnamed Seller'}</h3>
                                {seller.revenueShareAgreement?.accepted && (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                                        <CheckCircle className="w-3 h-3" />
                                        Revenue Agreed
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1.5 min-w-0">
                                    <Mail className="w-4 h-4" />
                                    <span className="truncate">{seller.email || '—'}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {seller.location?.country || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(seller.verification?.submittedAt)}
                                </span>
                            </div>
                            {Array.isArray(seller.niches) && seller.niches.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap mt-3">
                                    <span className="text-xs text-gray-500">Niches:</span>
                                    {seller.niches.slice(0, 3).map((n, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 text-xs rounded bg-[#0d1f19]"
                                            style={{ color: '#00FF89' }}>
                                            {n}
                                        </span>
                                    ))}
                                    {seller.niches.length > 3 && <span className="text-xs text-gray-500">+{seller.niches.length - 3}</span>}
                                </div>
                            )}
                            <Stepper current={status} />
                        </div>
                    </div>
                    <div className="w-full sm:w-auto">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${cfg.chip}`}>
                                <cfg.icon className="w-4 h-4" />
                                {cfg.label}
                            </span>
                            <InfoTip label={`${cfg.label} info`}>
                                <p className="text-sm text-gray-200">{cfg.hint}</p>
                            </InfoTip>
                        </div>
                        <div className="flex items-center justify-end gap-2 h-12 mt-3">
                            {showBothCounterActions ? (
                                <>
                                    <ActionPrimary
                                        onClick={handleAcceptCounter}
                                        label="Accept"
                                        sub={`Accept ${seller.commissionOffer.counterOffer.rate}%`}
                                        icon={CheckCircle}
                                    />
                                    <button
                                        type="button"
                                        onClick={onOpenCommission}
                                        className="px-4 py-2.5 bg-[#FFC050] text-[#121212] rounded-lg font-medium text-sm hover:bg-[#FFC050]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC050]/60"
                                        title="Make counter offer">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            <span>Counter</span>
                                        </div>
                                    </button>
                                </>
                            ) : primaryAction ? (
                                <ActionPrimary
                                    onClick={primaryAction.onClick}
                                    label={primaryAction.label}
                                    sub=""
                                    icon={primaryAction.icon}
                                />
                            ) : (
                                <div
                                    className="w-[140px] h-12 invisible"
                                    aria-hidden
                                />
                            )}
                            <button
                                type="button"
                                onClick={onReject}
                                title="Reject application"
                                className="p-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
                                aria-label="Reject application">
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={onViewDetails}
                                className="p-2.5 bg-[#0f0f0f] text-gray-400 rounded-lg hover:bg-[#1b1b1b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60"
                                aria-label="View Details"
                                title="View Details">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
function LegendBannerAlways({ statusConfig }) {
    return (
        <div className="px-4 sm:px-6 pb-3">
            <div
                className="rounded-xl border border-sky-900/40 bg-gradient-to-br from-[#0b1220] via-[#0b1324] to-[#0e1b2a]
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_30px_rgba(10,20,40,0.25)] w-full">
                <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 pb-3 border-b border-white/5">
                    <Info className="w-5 h-5 text-sky-300" />
                    <span className="font-semibold text-sky-300 text-base">Seller Onboarding Flow</span>
                </div>
                <div className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {Object.entries(statusConfig).map(([key, cfg], index) => (
                            <div
                                key={key}
                                className="flex items-center gap-4 flex-1">
                                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 flex-1">
                                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-sky-900/30 text-sky-300 border border-sky-800/50">
                                        <cfg.icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={`text-sm font-medium ${cfg.color.replace('text-', 'text-')}`}>{cfg.label}</div>
                                        <p className="text-xs text-sky-100/70 leading-relaxed mt-1">{cfg.hint}</p>
                                    </div>
                                </div>
                                {index < Object.entries(statusConfig).length - 1 && (
                                    <div className="flex items-center justify-center">
                                        <ArrowRight className="w-6 h-6 text-sky-400/60 flex-shrink-0" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-sm text-sky-100/60">
                        Flow: <span className="text-sky-200">Pending → Under Review → Commission Offered</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, useCallback, useRef, useId } from 'react'
import { toast } from 'sonner'
import { adminAPI } from '@/lib/api/admin'
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
    ChevronDown,
    ChevronUp,
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
    SortAsc,
    SortDesc,
    Download,
    Settings
} from 'lucide-react'

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
    const cs = seller?.commissionOffer?.status
    if (cs === 'counter_offered') return 'counter_offered'
    if (cs === 'offered' || cs === 'commission_offered') return 'commission_offered'
    if (seller?.review?.status === 'under_review') return 'under_review'
    return seller?.verification?.status || seller?.status || 'pending'
}
const statusConfig = {
    pending: {
        color: 'text-[#FFC050]',
        chip: 'bg-[#352a14] text-[#FFC050]',
        label: 'Pending Review',
        icon: Clock,
        hint: 'Application submitted. Start review to proceed.'
    },
    under_review: {
        color: 'text-[#7dd3fc]',
        chip: 'bg-[#0b2833] text-[#7dd3fc]',
        label: 'Under Review',
        icon: Eye,
        hint: 'Assess details and offer a commission rate.'
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

    // Single source of truth for badges (tabs always read from this)
    const [counts, setCounts] = useState({
        all: undefined,
        pending: undefined,
        under_review: undefined,
        commission_offered: undefined,
        counter_offered: undefined
    })

    const [actionLoading, setActionLoading] = useState(false)

    const latestReqIdRef = useRef(0)
    const cacheRef = useRef(new Map()) // key: `${status}:${page}`

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

            // Serve cached quickly while fetching fresh
            if (cacheRef.current.has(key)) {
                const cached = cacheRef.current.get(key)
                setSellers(cached.list)
                setPagination(cached.pagination || {})
                setTotalPages(cached.pagination?.totalPages || 1)
                // counts are per-tab; keep existing until fresh comes back
            }

            try {
                const reqId = ++latestReqIdRef.current
                // IMPORTANT: always pass the actual active status to backend
                const res = await adminAPI.sellers.getByStatus.fetch(activeStatusFilter, page, 30)
                if (reqId !== latestReqIdRef.current) return // ignore stale response

                const payload = res?.data?.profiles ? res.data : res
                const profiles = payload?.profiles || []
                const serverPagination = payload?.pagination || {}

                const withStatus = profiles.map((s) => ({ ...s, currentStatus: mapStatus(s) }))

                // Filter client-side too (covers cases where backend returns broader set)
                const filtered =
                    activeStatusFilter === 'all'
                        ? withStatus.filter((s) => !['approved', 'active'].includes(s.currentStatus))
                        : withStatus.filter((s) => s.currentStatus === activeStatusFilter)

                // Cache fresh
                cacheRef.current.set(key, { list: filtered, pagination: serverPagination })

                // Apply list
                setSellers(filtered)
                setPagination(serverPagination || {})
                setTotalPages(serverPagination?.totalPages || 1)

                // === Correct counts per tab ===
                if (activeStatusFilter === 'all') {
                    // Show per-status breakdown only on ALL
                    const newCounts = {
                        all: filtered.length,
                        pending: filtered.filter((s) => s.currentStatus === 'pending').length,
                        under_review: filtered.filter((s) => s.currentStatus === 'under_review').length,
                        commission_offered: filtered.filter((s) => s.currentStatus === 'commission_offered').length,
                        counter_offered: filtered.filter((s) => s.currentStatus === 'counter_offered').length
                    }
                    setCounts(newCounts)
                } else {
                    // For a specific tab, show ONLY that tab's count
                    // Use server total if trustworthy, else final filtered length
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
                toast.error('Failed to fetch sellers')
                setSellers([])
                setPagination({})
                setTotalPages(1)
                // Clear counts on error so no stale numbers linger
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
                    toast.success(`${selectedSellers.size} sellers approved`)
                    break
                case 'reject':
                    // Open bulk reject modal
                    setBulkActionType('reject')
                    setShowBulkActions(true)
                    return
                case 'export':
                    // Export selected sellers data
                    const sellersData = filteredSellers.filter((s) => selectedSellers.has(s._id))
                    exportSellersData(sellersData)
                    toast.success('Sellers data exported')
                    break
            }
            setSelectedSellers(new Set())
            fetchList()
        } catch {
            toast.error('Bulk action failed')
        } finally {
            setActionLoading(false)
        }
    }

    // Actions (same behavior you had)
    const handleStartReview = async () => {
        toast.message('Start review', { description: 'This action will be available soon.' })
    }
    const handleSubmitCommission = async () => {
        if (!selectedSeller) return
        if (Number.isNaN(commissionRate) || commissionRate < 1 || commissionRate > 50) {
            toast.error('Commission must be between 1% and 50%')
            return
        }
        setActionLoading(true)
        try {
            const hasCounter = !!selectedSeller?.commissionOffer?.counterOffer?.rate
            const counterRate = selectedSeller?.commissionOffer?.counterOffer?.rate
            if (hasCounter && commissionRate === counterRate) {
                await adminAPI.sellers.commission.acceptCounter(selectedSeller._id)
                toast.success(`Counter offer accepted (${counterRate}%)`)
            } else {
                await adminAPI.sellers.commission.offer(selectedSeller._id, commissionRate)
                toast.success(`Commission offer of ${commissionRate}% sent`)
            }
            setShowCommissionModal(false)
            setSelectedSeller(null)
            fetchList()
        } catch {
            toast.error('Failed to submit commission decision')
        } finally {
            setActionLoading(false)
        }
    }
    const handleAcceptCounterOffer = async (sellerId, rate) => {
        setActionLoading(true)
        try {
            await adminAPI.sellers.commission.acceptCounter(sellerId)
            toast.success(`Counter offer of ${rate}% accepted`)
            fetchList()
        } catch {
            toast.error('Failed to accept counter offer')
        } finally {
            setActionLoading(false)
        }
    }
    const handleResendOffer = async (seller) => {
        if (!seller?.commissionOffer?.rate) return toast.info('No previous offer to resend')
        setActionLoading(true)
        try {
            await adminAPI.sellers.commission.offer(seller._id, seller.commissionOffer.rate)
            toast.success('Offer resent')
            fetchList()
        } catch {
            toast.error('Failed to resend offer')
        } finally {
            setActionLoading(false)
        }
    }
    const handleRejectApplication = async () => {
        if (!selectedSeller || !rejectReason.trim()) return
        setActionLoading(true)
        try {
            await adminAPI.sellers.profile.reject(selectedSeller._id, rejectReason.trim())
            toast.success('Application rejected')
            setShowRejectAppModal(false)
            setSelectedSeller(null)
            setRejectReason('')
            fetchList()
        } catch {
            toast.error('Failed to reject application')
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

    // WebSocket or polling for real-time updates
    useEffect(() => {
        if (!realTimeUpdates) return

        const interval = setInterval(() => {
            // Silently check for updates without showing loading
            fetchList({ silent: true })
        }, 30000) // Check every 30 seconds

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
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-[#141414]">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(600px 200px at 10% -20%, rgba(0,255,137,.08), transparent), radial-gradient(400px 150px at 90% -20%, rgba(255,192,80,.06), transparent)'
                    }}
                />
                <div className="relative p-5 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 sm:p-2.5 rounded-lg"
                                style={{ backgroundColor: `${BRAND}1a` }}>
                                <Users
                                    className="w-6 h-6"
                                    style={{ color: BRAND }}
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">Seller Applications</h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto">
                            <MiniKPI
                                label="Avg Time"
                                value={sellers.length ? '2.5d' : '0d'}
                                icon={
                                    <Timer
                                        className="w-4 h-4"
                                        style={{ color: BRAND }}
                                    />
                                }
                            />
                            <MiniKPI
                                label="Conversion"
                                value={sellers.length ? '87%' : '0%'}
                                icon={
                                    <TrendingUp
                                        className="w-4 h-4"
                                        style={{ color: AMBER }}
                                    />
                                }
                            />
                            <MiniKPI
                                label="Counters"
                                value={counts.counter_offered ?? 0}
                                icon={
                                    <Zap
                                        className="w-4 h-4"
                                        style={{ color: AMBER }}
                                    />
                                }
                            />
                        </div>
                    </div>
                </div>

                <LegendBannerAlways statusConfig={statusConfig} />

                {/* Sticky Filter Bar */}
                <div className="sticky top-0 z-10 border-t border-gray-800 bg-[#121212]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
                    <div className="px-4 sm:px-6 py-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                            {/* HORIZONTAL SCROLLER – tabs never wrap */}
                            <div className="relative -mx-4 sm:-mx-6 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)]">
                                <div className="overflow-x-auto px-4 sm:px-6">
                                    <div
                                        className="inline-flex items-center gap-2 whitespace-nowrap"
                                        role="tablist"
                                        aria-label="Filter by status">
                                        <Filter className="w-4 h-4 text-gray-500" />

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

                                        {/* 🚫 Counter tab removed */}
                                    </div>
                                </div>
                            </div>

                            {/* Search + Refresh + Legend */}
                            <div className="flex items-center gap-2 md:min-w-[360px]">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search name, email, country, niches, tools…"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-9 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                                        aria-label="Search sellers"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            aria-label="Clear search"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fetchList({ isManualRefresh: true })}
                                    title="Refresh"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#1b1b1b] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {debouncedQuery && (
                <div className="text-xs sm:text-sm text-gray-400 px-1">
                    Showing {filteredSellers.length} results for “{debouncedQuery}”.
                </div>
            )}

            {/* Advanced Sorting & Filtering Controls */}
            <div className="bg-[#171717] border border-gray-800 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    {/* Left: Sort Controls */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Sort by:</span>
                        <div className="flex items-center gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                {sortOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                                className="p-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Right: Filter Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center gap-2 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#1b1b1b] transition-colors text-sm">
                            <Settings className="w-4 h-4" />
                            Advanced Filters
                            {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={() => exportSellersData(filteredSellers)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>

                        {filteredSellers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedSellers.size === filteredSellers.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-[#00FF89] bg-[#0f0f0f] border-gray-700 rounded focus:ring-[#00FF89]/50"
                                />
                                <span className="text-sm text-gray-400">Select All</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Country</label>
                                <select
                                    value={advancedFilters.country}
                                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, country: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    <option value="">All Countries</option>
                                    <option value="USA">United States</option>
                                    <option value="India">India</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Australia">Australia</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Experience Level</label>
                                <select
                                    value={advancedFilters.experienceLevel}
                                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, experienceLevel: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    <option value="">Any Experience</option>
                                    <option value="beginner">Beginner (1-2 tools)</option>
                                    <option value="intermediate">Intermediate (3-5 tools)</option>
                                    <option value="expert">Expert (6+ tools)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Website Status</label>
                                <select
                                    value={advancedFilters.hasWebsite}
                                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, hasWebsite: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    <option value="">Any</option>
                                    <option value="yes">Has Website</option>
                                    <option value="no">No Website</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Payout Method</label>
                                <select
                                    value={advancedFilters.payoutMethod}
                                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, payoutMethod: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    <option value="">Any Method</option>
                                    <option value="bank transfer">Bank Transfer</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="stripe">Stripe</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={() =>
                                        setAdvancedFilters({
                                            country: '',
                                            experienceLevel: '',
                                            hasWebsite: '',
                                            payoutMethod: '',
                                            dateRange: ''
                                        })
                                    }
                                    className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sellers List */}
            <section
                aria-busy={loading}
                className="transition-opacity duration-200"
                style={{ opacity: listOpacity }}>
                {loading && tabSwitching ? (
                    <SkeletonList />
                ) : loading ? (
                    <Loader />
                ) : filteredSellers.length === 0 ? (
                    <EmptyState query={debouncedQuery} />
                ) : (
                    <div className="space-y-3">
                        {filteredSellers.map((seller) => (
                            <SellerCard
                                key={seller._id}
                                seller={seller}
                                onStartReview={handleStartReview}
                                onOpenCommission={() => {
                                    setSelectedSeller(seller)
                                    setCommissionRate(seller?.commissionOffer?.rate || 15)
                                    setShowCommissionModal(true)
                                }}
                                onAcceptCounter={() => handleAcceptCounterOffer(seller._id, seller?.commissionOffer?.counterOffer?.rate)}
                                onResendOffer={() => handleResendOffer(seller)}
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
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#141414] border border-gray-800 rounded-lg text-xs sm:text-base text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1b1b1b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                        Previous
                    </button>
                    <span className="text-xs sm:text-base text-white px-3 sm:px-4">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#141414] border border-gray-800 rounded-lg text-xs sm:text-base text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1b1b1b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
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
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Commission Decision</h3>
                        <p className="text-sm text-gray-400 mb-3">
                            {selectedSeller.commissionOffer?.counterOffer
                                ? 'Accept the seller’s counter or propose a new rate.'
                                : 'Send your commission rate. The seller must accept this to start selling.'}
                        </p>

                        {selectedSeller.commissionOffer?.counterOffer && (
                            <div className="bg-[#121212] border border-gray-700 rounded-lg p-3 mb-3">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-500">Your original offer</span>
                                    <span className="text-white font-medium">{selectedSeller.commissionOffer.rate}%</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-500">Seller’s counter offer</span>
                                    <span className="text-[#FFC050] font-medium">{selectedSeller.commissionOffer.counterOffer.rate}%</span>
                                </div>
                            </div>
                        )}

                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5">Commission Rate (%)</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[#121212] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/50 focus:border-transparent"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">
                            The platform retains <span className="text-gray-300 font-medium">{commissionRate}%</span> per sale.
                            {selectedSeller.commissionOffer?.counterOffer && commissionRate === selectedSeller.commissionOffer.counterOffer.rate && (
                                <span className="text-[var(--neon,#00FF89)] ml-1">✓ Accepting seller’s rate</span>
                            )}
                        </p>

                        {selectedSeller.commissionOffer?.counterOffer && (
                            <div className="mt-3 flex items-center gap-2 text-[11px]">
                                <button
                                    type="button"
                                    onClick={() => setCommissionRate(selectedSeller.commissionOffer.counterOffer.rate)}
                                    className="px-2 py-1 bg-[#FFC050]/20 text-[#FFC050] rounded hover:bg-[#FFC050]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC050]/60">
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
                                    className="px-2 py-1 bg-[var(--neon,#00FF89)]/20 text-[var(--neon,#00FF89)] rounded hover:bg-[var(--neon,#00FF89)]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                                    Meet in the middle (
                                    {Math.round((selectedSeller.commissionOffer.rate + selectedSeller.commissionOffer.counterOffer.rate) / 2)}%)
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={handleSubmitCommission}
                                disabled={actionLoading}
                                className="flex-1 px-3 py-2 bg-[var(--neon,#00FF89)] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60 disabled:opacity-50">
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
                                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/60">
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
                        <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-white">Reject Application</h3>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">This rejects the seller’s application and ends negotiations.</p>
                            </div>
                        </div>

                        <div className="bg-[#121212] border border-gray-700 rounded-lg p-3 space-y-2 mb-3">
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

                        <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1.5">
                            Reason for rejection <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            placeholder="Provide a clear reason that will be sent to the seller…"
                            className="w-full px-3 py-2 bg-[#121212] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus:border-transparent resize-none"
                        />

                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={handleRejectApplication}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 disabled:opacity-50">
                                Reject Application
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRejectAppModal(false)
                                    setSelectedSeller(null)
                                    setRejectReason('')
                                }}
                                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/60">
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
                    <div className="max-w-2xl w-full">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Seller Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                                    style={{ backgroundColor: '#00FF891a', color: '#00FF89' }}>
                                    {(selectedSeller.fullName || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white">{selectedSeller.fullName || 'Unnamed Seller'}</h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-gray-400">
                                        <span className="flex items-center gap-1 min-w-0">
                                            <Mail className="w-3 h-3" />
                                            <span className="truncate">{selectedSeller.email || '—'}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {selectedSeller.location?.country || 'Unknown'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(selectedSeller.verification?.submittedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <MetricsGrid seller={selectedSeller} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <ContactBlock seller={selectedSeller} />
                                <BioBlock seller={selectedSeller} />
                            </div>
                            <ExpertiseBlock seller={selectedSeller} />
                        </div>
                    </div>
                </Modal>
            )}

            {/* Quick Actions Toolbar */}
            {selectedSellers.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-300">
                                {selectedSellers.size} seller{selectedSellers.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleBulkAction('approve')}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 bg-[#00FF89] text-[#121212] rounded-lg text-sm font-medium hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50">
                                    Approve All
                                </button>
                                <button
                                    onClick={() => handleBulkAction('reject')}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                                    Reject All
                                </button>
                                <button
                                    onClick={() => handleBulkAction('export')}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                                    Export
                                </button>
                                <button
                                    onClick={() => setSelectedSellers(new Set())}
                                    className="p-1.5 text-gray-400 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications */}
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
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[${BRAND}]/60 ${activeClass}`}>
            {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
            {label}
            {showCount ? <span className="ml-1">{count}</span> : null}
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
function EmptyState({ query }) {
    return (
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-10 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">{query ? 'No matching sellers' : 'No Pending Sellers'}</h3>
            <p className="text-sm text-gray-400 mt-1">{query ? 'Try a different search.' : 'All applications have been processed.'}</p>
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
                                className={`h-2 w-2 rounded-full ${active ? 'bg-[var(--neon,#00FF89)]' : 'bg-gray-700'}`}
                                title={s.label}
                                aria-label={s.label}
                            />
                            <span className={`text-[11px] ${active ? 'text-gray-200' : 'text-gray-500'}`}>{s.label}</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatTile
                label="Products"
                value={seller.stats?.totalProducts || 0}>
                <FileText
                    className="w-4 h-4"
                    style={{ color: BRAND }}
                />
            </StatTile>
            <StatTile
                label="Experience"
                value={seller.toolsSpecialization?.length || 0}>
                <Star className="w-4 h-4 text-[#FFC050]" />
            </StatTile>
            <StatTile
                label="Profile"
                value={seller.bio && seller.websiteUrl && seller.payoutInfo?.method ? '100%' : seller.bio || seller.websiteUrl ? '60%' : '30%'}>
                <Activity
                    className="w-4 h-4"
                    style={{ color: BRAND }}
                />
            </StatTile>
            <StatTile
                label="Website"
                value={seller.websiteUrl ? 'Yes' : 'No'}>
                <Globe className="w-4 h-4 text-[#7dd3fc]" />
            </StatTile>
        </div>
    )
}
function StatTile({ label, value, children }) {
    return (
        <div className="bg-[#121212] rounded-lg p-3 sm:p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-xs text-gray-500">{label}</span>
                {children}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
            <p className="text-[10px] sm:text-xs text-transparent mt-0.5">.</p>
        </div>
    )
}
function ContactBlock({ seller }) {
    return (
        <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">Contact</h4>
            <div className="space-y-2 sm:space-y-3">
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
                                className="text-xs sm:text-sm text-[var(--neon,#00FF89)] hover:underline break-all">
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
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">Seller Profile</h4>
            {hasBio ? (
                <div className="bg-[#121212] rounded-lg p-3 sm:p-4 border border-gray-800">
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed break-words whitespace-pre-wrap">{seller.bio}</p>
                </div>
            ) : (
                <div className="bg-[#121212] rounded-lg p-3 sm:p-4 border border-gray-800 text-center">
                    <p className="text-xs sm:text-sm text-gray-500">No bio provided</p>
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
        <div className="space-y-3 sm:space-y-4">
            {hasNiches && (
                <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">Specialization Niches</h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {seller.niches.map((n, i) => (
                            <span
                                key={i}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#0d1f19] text-[var(--neon,#00FF89)] text-xs sm:text-sm rounded-lg">
                                {n}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {hasTools && (
                <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">Tool Expertise</h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {seller.toolsSpecialization.map((t, i) => (
                            <span
                                key={i}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#352a14] text-[#FFC050] text-xs sm:text-sm rounded-lg">
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
                <p className="text-[10px] sm:text-xs text-gray-500">{label}</p>
                <div className="text-xs sm:text-sm text-white break-words">{value}</div>
            </div>
        </div>
    )
}
function MiniRow({ label, value }) {
    return (
        <div className="flex items-center justify-between text-xs sm:text-sm">
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
            className="group px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--neon,#00FF89)] text-[#121212] rounded-lg font-medium text-xs sm:text-sm hover:bg-[#00FF89]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60 disabled:opacity-50"
            aria-label={label}
            title={sub}>
            <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
    if (!docs) return toast.info('No documents uploaded yet')
    const firstDoc = docs.identityProof || docs.businessProof || docs.taxDocument
    firstDoc ? window.open(firstDoc, '_blank', 'noopener,noreferrer') : toast.info('No documents available')
}
function openProfile(seller) {
    try {
        window.open(`/admin/sellers/${seller._id}`, '_blank', 'noopener,noreferrer')
    } catch {
        toast.message('Profile', { description: 'Profile page coming soon.' })
    }
}

function SellerCard({ seller, onStartReview, onOpenCommission, onAcceptCounter, onResendOffer, onReject, onViewDetails }) {
    const status = seller.currentStatus || 'pending'
    const cfg = statusConfig[status] || statusConfig.pending

    const hasCounter = !!seller?.commissionOffer?.counterOffer
    const primaryAction = (() => {
        if (status === 'pending') {
            return { label: 'Start Review', icon: Eye, onClick: onStartReview }
        }
        if (status === 'under_review') {
            return { label: 'Offer Commission', icon: DollarSign, onClick: onOpenCommission }
        }
        if (status === 'commission_offered' && !hasCounter) {
            return { label: 'Resend Offer', icon: RefreshCw, onClick: onResendOffer }
        }
        if (status === 'counter_offered' && hasCounter) {
            return { label: 'Accept Counter', icon: CheckCircle, onClick: onAcceptCounter }
        }
        return null
    })()

    return (
        <div className="rounded-xl border border-gray-800 bg-[#171717] overflow-hidden">
            <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: identity + meta */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                            style={{ backgroundColor: '#00FF891a', color: '#00FF89' }}>
                            {(seller.fullName || 'S').charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Name row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-white truncate">{seller.fullName || 'Unnamed Seller'}</h3>
                                {seller.revenueShareAgreement?.accepted && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-green-400">
                                        <CheckCircle className="w-3 h-3" />
                                        Revenue Agreed
                                    </span>
                                )}
                            </div>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-gray-400">
                                <span className="flex items-center gap-1 min-w-0">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{seller.email || '—'}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {seller.location?.country || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(seller.verification?.submittedAt)}
                                </span>
                            </div>

                            {/* Niches */}
                            {Array.isArray(seller.niches) && seller.niches.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                    <span className="text-[11px] text-gray-500">Niches:</span>
                                    {seller.niches.slice(0, 3).map((n, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 text-[12px] rounded bg-[#0d1f19]"
                                            style={{ color: '#00FF89' }}>
                                            {n}
                                        </span>
                                    ))}
                                    {seller.niches.length > 3 && <span className="text-[11px] text-gray-500">+{seller.niches.length - 3}</span>}
                                </div>
                            )}

                            {/* Stepper */}
                            <Stepper current={status} />
                        </div>
                    </div>

                    {/* Right: fixed 2-row column => consistent height across cards */}
                    <div className="w-full sm:w-auto">
                        {/* Row 1: Chip + info (fixed height) */}
                        <div className="flex items-center justify-end gap-2 h-9">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.chip}`}>
                                <cfg.icon className="w-3.5 h-3.5" />
                                {cfg.label}
                            </span>
                            <InfoTip label={`${cfg.label} info`}>
                                <p className="text-xs text-gray-200">{cfg.hint}</p>
                            </InfoTip>
                        </div>

                        {/* Row 2: Actions (fixed height). Always reserve space with a placeholder */}
                        <div className="flex items-center justify-end gap-2 h-10 mt-2">
                            {primaryAction ? (
                                <ActionPrimary
                                    onClick={primaryAction.onClick}
                                    label={primaryAction.label}
                                    sub=""
                                    icon={primaryAction.icon}
                                />
                            ) : (
                                <div
                                    className="w-[140px] h-10 invisible"
                                    aria-hidden
                                /> // placeholder keeps height
                            )}

                            {/* Reject */}
                            <button
                                type="button"
                                onClick={onReject}
                                title="Reject application"
                                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
                                aria-label="Reject application">
                                <X className="w-4 h-4" />
                            </button>

                            {/* View Details */}
                            <button
                                type="button"
                                onClick={onViewDetails}
                                className="p-2 bg-[#0f0f0f] text-gray-400 rounded-lg hover:bg-[#1b1b1b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60"
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
                {/* Header */}
                <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-white/5">
                    <Info className="w-4 h-4 text-sky-300" />
                    <span className="font-semibold text-sky-300">Seller Onboarding Flow</span>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                        {Object.entries(statusConfig).map(([key, cfg], index) => (
                            <div
                                key={key}
                                className="flex items-center gap-3 sm:gap-4 flex-1">
                                {/* Status Card */}
                                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 flex-1">
                                    <div className="w-8 h-8 rounded-md flex items-center justify-center bg-sky-900/30 text-sky-300 border border-sky-800/50">
                                        <cfg.icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={`text-sm font-medium ${cfg.color.replace('text-', 'text-')}`}>{cfg.label}</div>
                                        <p className="text-xs text-sky-100/70 leading-relaxed">{cfg.hint}</p>
                                    </div>
                                </div>

                                {/* Arrow between states (not after the last one) */}
                                {index < Object.entries(statusConfig).length - 1 && (
                                    <div className="flex items-center justify-center">
                                        <ArrowRight className="w-5 h-5 text-sky-400/60 flex-shrink-0" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 text-xs text-sky-100/60">
                        Flow: <span className="text-sky-200">Pending → Under Review → Commission Offered</span>
                    </div>
                </div>
            </div>
        </div>
    )
}


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
    Settings,
    Edit3,
    UserCheck,
    Package
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
export default function ActiveSellersPage() {
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
    const [showSellerDetailsModal, setShowSellerDetailsModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pagination, setPagination] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [selectedSellers, setSelectedSellers] = useState(new Set())
    const [actionLoading, setActionLoading] = useState(false)
    const [sortBy, setSortBy] = useState('joinedDate')
    const [sortOrder, setSortOrder] = useState('desc')
    const [advancedFilters, setAdvancedFilters] = useState({
        country: '',
        performanceLevel: '',
        hasWebsite: '',
        ratingRange: '',
        dateRange: ''
    })
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const [realTimeUpdates, setRealTimeUpdates] = useState(true)
    const [notifications, setNotifications] = useState([])
    const latestReqIdRef = useRef(0)
    const cacheRef = useRef(new Map())
    const sortOptions = [
        { value: 'joinedDate', label: 'Join Date' },
        { value: 'fullName', label: 'Name' },
        { value: 'location.country', label: 'Country' },
        { value: 'stats.totalProducts', label: 'Products' },
        { value: 'stats.totalRevenue', label: 'Revenue' },
        { value: 'stats.avgRating', label: 'Rating' }
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
            ['Name', 'Email', 'Country', 'Join Date', 'Products', 'Sales', 'Revenue', 'Rating', 'Website'],
            ...sellersData.map((seller) => [
                seller.fullName || '',
                seller.email || seller.userId?.emailAddress || '',
                seller.location?.country || '',
                formatDate(seller.joinedDate),
                seller.stats?.totalProducts || 0,
                seller.stats?.totalSales || 0,
                seller.stats?.totalRevenue || 0,
                seller.stats?.avgRating || 0,
                seller.websiteUrl || ''
            ])
        ]
            .map((row) => row.map((field) => `"${field}"`).join(','))
            .join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `active-sellers-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
    const fetchList = useCallback(
        async ({ isManualRefresh = false, silent = false } = {}) => {
            const key = `active:${page}`
            if (isManualRefresh) setListOpacity(0.6)
            if (!silent) setLoading(true)
            if (cacheRef.current.has(key)) {
                const cached = cacheRef.current.get(key)
                setSellers(cached.list)
                setPagination(cached.pagination || {})
                setTotalPages(cached.pagination?.totalPages || 1)
            }
            try {
                const reqId = ++latestReqIdRef.current
                const res = await adminAPI.sellers.getByStatus.fetch('approved', page, 30)
                if (reqId !== latestReqIdRef.current) return
                const payload = res?.data?.profiles ? res.data : res
                const profiles = payload?.profiles || []
                const serverPagination = payload?.pagination || {}
                const enhancedSellers = profiles.map((seller) => ({
                    ...seller,
                    stats: seller.stats || {
                        totalProducts: 0,
                        totalSales: 0,
                        totalRevenue: 0,
                        avgRating: 0,
                        profileViews: 0
                    },
                    socialLinks: seller.socialLinks || {},
                    joinedDate: seller.createdAt || seller.verification?.approvedAt || new Date().toISOString()
                }))
                cacheRef.current.set(key, { list: enhancedSellers, pagination: serverPagination })
                setSellers(enhancedSellers)
                setPagination(serverPagination || {})
                setTotalPages(serverPagination?.totalPages || 1)
            } catch (e) {
                console.error(e)
                showMessage('Failed to fetch active sellers', 'error')
                setSellers([])
                setPagination({})
                setTotalPages(1)
            } finally {
                setLoading(false)
                setTimeout(() => {
                    setListOpacity(1)
                }, 120)
            }
        },
        [page]
    )
    useEffect(() => {
        fetchList()
    }, [fetchList])
    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 220)
        return () => clearTimeout(id)
    }, [searchQuery])
    const filteredSellers = useMemo(() => {
        let filtered = sellers
        if (debouncedQuery) {
            filtered = filtered.filter((seller) => {
                const q = debouncedQuery
                return (
                    (seller.fullName || '').toLowerCase().includes(q) ||
                    (seller.email || seller.userId?.emailAddress || '').toLowerCase().includes(q) ||
                    (seller.location?.country || '').toLowerCase().includes(q) ||
                    (Array.isArray(seller.niches) && seller.niches.some((n) => (n || '').toLowerCase().includes(q))) ||
                    (Array.isArray(seller.toolsSpecialization) && seller.toolsSpecialization.some((t) => (t || '').toLowerCase().includes(q)))
                )
            })
        }
        if (advancedFilters.country) {
            filtered = filtered.filter((seller) => seller.location?.country === advancedFilters.country)
        }
        if (advancedFilters.performanceLevel) {
            filtered = filtered.filter((seller) => {
                const products = seller.stats?.totalProducts || 0
                switch (advancedFilters.performanceLevel) {
                    case 'high':
                        return products >= 10
                    case 'medium':
                        return products >= 3 && products < 10
                    case 'low':
                        return products < 3
                    default:
                        return true
                }
            })
        }
        if (advancedFilters.hasWebsite) {
            const hasWebsite = advancedFilters.hasWebsite === 'yes'
            filtered = filtered.filter((seller) => !!seller.websiteUrl === hasWebsite)
        }
        if (advancedFilters.ratingRange) {
            filtered = filtered.filter((seller) => {
                const rating = seller.stats?.avgRating || 0
                switch (advancedFilters.ratingRange) {
                    case 'excellent':
                        return rating >= 4.5
                    case 'good':
                        return rating >= 3.5 && rating < 4.5
                    case 'fair':
                        return rating >= 2.5 && rating < 3.5
                    case 'poor':
                        return rating < 2.5
                    default:
                        return true
                }
            })
        }
        return filtered
    }, [debouncedQuery, sellers, advancedFilters])
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
                case 'export':
                    const sellersData = filteredSellers.filter((s) => selectedSellers.has(s._id))
                    exportSellersData(sellersData)
                    showMessage('Sellers data exported', 'success')
                    break
                case 'suspend':
                    showMessage('Suspension feature coming soon', 'info')
                    break
                default:
                    break
            }
            setSelectedSellers(new Set())
        } catch {
            showMessage('Bulk action failed', 'error')
        } finally {
            setActionLoading(false)
        }
    }
    const anyModalOpen = showSellerDetailsModal || showEditModal
    useEffect(() => {
        if (typeof document === 'undefined') return
        const body = document.body
        if (anyModalOpen) {
            const prev = body.style.overflow
            body.style.overflow = 'hidden'
            const onKey = (e) => {
                if (e.key === 'Escape') {
                    setShowSellerDetailsModal(false)
                    setShowEditModal(false)
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
    return (
        <div className="space-y-6">
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}
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
                                <UserCheck
                                    className="w-6 h-6"
                                    style={{ color: BRAND }}
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">Active Sellers</h1>
                                <p className="text-gray-400 mt-1">
                                    Manage active seller profiles {pagination.total && `(${pagination.total} total)`}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto">
                            <MiniKPI
                                label="Total"
                                value={pagination.total || sellers.length}
                                icon={
                                    <Users
                                        className="w-4 h-4"
                                        style={{ color: BRAND }}
                                    />
                                }
                            />
                            <MiniKPI
                                label="Products"
                                value={sellers.reduce((sum, s) => sum + (s.stats?.totalProducts || 0), 0)}
                                icon={
                                    <Package
                                        className="w-4 h-4"
                                        style={{ color: '#00AFFF' }}
                                    />
                                }
                            />
                            <MiniKPI
                                label="Revenue"
                                value={`$${sellers.reduce((sum, s) => sum + (s.stats?.totalRevenue || 0), 0).toFixed(0)}`}
                                icon={
                                    <DollarSign
                                        className="w-4 h-4"
                                        style={{ color: AMBER }}
                                    />
                                }
                            />
                            <MiniKPI
                                label="Avg Rating"
                                value={
                                    sellers.length > 0
                                        ? (sellers.reduce((sum, s) => sum + (s.stats?.avgRating || 0), 0) / sellers.length).toFixed(1)
                                        : '0.0'
                                }
                                icon={
                                    <Star
                                        className="w-4 h-4"
                                        style={{ color: AMBER }}
                                    />
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="px-4 sm:px-6 pb-4">
                    <div className="relative">
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
                </div>
            </div>
            {debouncedQuery && (
                <div className="text-xs sm:text-sm text-gray-400 px-1">
                    Showing {filteredSellers.length} results for "{debouncedQuery}".
                </div>
            )}
            <div className="bg-[#171717] border border-gray-800 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
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
                                <label className="block text-xs font-medium text-gray-400 mb-1">Performance</label>
                                <select
                                    value={advancedFilters.performanceLevel}
                                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, performanceLevel: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    <option value="">Any Performance</option>
                                    <option value="high">High (10+ products)</option>
                                    <option value="medium">Medium (3-9 products)</option>
                                    <option value="low">Low (0-2 products)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Website</label>
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
                                <label className="block text-xs font-medium text-gray-400 mb-1">Rating</label>
                                <select
                                    value={advancedFilters.ratingRange}
                                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, ratingRange: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    <option value="">Any Rating</option>
                                    <option value="excellent">Excellent (4.5+)</option>
                                    <option value="good">Good (3.5-4.4)</option>
                                    <option value="fair">Fair (2.5-3.4)</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() =>
                                        setAdvancedFilters({
                                            country: '',
                                            performanceLevel: '',
                                            hasWebsite: '',
                                            ratingRange: '',
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
            <section
                aria-busy={loading}
                className="transition-opacity duration-200"
                style={{ opacity: listOpacity }}>
                {loading ? (
                    <Loader />
                ) : filteredSellers.length === 0 ? (
                    <EmptyState query={debouncedQuery} />
                ) : (
                    <div className="space-y-3">
                        {filteredSellers.map((seller) => (
                            <SellerCard
                                key={seller._id}
                                seller={seller}
                                isSelected={selectedSellers.has(seller._id)}
                                onSelect={handleSelectSeller}
                                onEdit={() => {
                                    setSelectedSeller(seller)
                                    setShowEditModal(true)
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
            {showSellerDetailsModal && selectedSeller && (
                <Modal
                    onClose={() => {
                        setShowSellerDetailsModal(false)
                        setSelectedSeller(null)
                    }}>
                    <div className="max-w-4xl w-full">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Seller Profile</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"
                                    style={{ backgroundColor: '#00FF891a', color: '#00FF89' }}>
                                    {(selectedSeller.fullName || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-xl font-semibold text-white">{selectedSeller.fullName || 'Unnamed Seller'}</h4>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full font-medium bg-[#00FF89]/20 text-[#00FF89]">
                                            <UserCheck className="w-3 h-3" />
                                            Active Seller
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {selectedSeller.email || selectedSeller.userId?.emailAddress || '—'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {selectedSeller.location?.country || 'Unknown'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Joined {formatDate(selectedSeller.joinedDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <StatTile
                                    label="Products"
                                    value={selectedSeller.stats?.totalProducts || 0}>
                                    <Package
                                        className="w-4 h-4"
                                        style={{ color: BRAND }}
                                    />
                                </StatTile>
                                <StatTile
                                    label="Sales"
                                    value={selectedSeller.stats?.totalSales || 0}>
                                    <TrendingUp className="w-4 h-4 text-blue-400" />
                                </StatTile>
                                <StatTile
                                    label="Revenue"
                                    value={`$${selectedSeller.stats?.totalRevenue || 0}`}>
                                    <DollarSign
                                        className="w-4 h-4"
                                        style={{ color: AMBER }}
                                    />
                                </StatTile>
                                <StatTile
                                    label="Rating"
                                    value={(selectedSeller.stats?.avgRating || 0).toFixed(1)}>
                                    <Star
                                        className="w-4 h-4"
                                        style={{ color: AMBER }}
                                    />
                                </StatTile>
                                <StatTile
                                    label="Views"
                                    value={selectedSeller.stats?.profileViews || 0}>
                                    <Eye className="w-4 h-4 text-gray-400" />
                                </StatTile>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <BioBlock seller={selectedSeller} />
                                <ContactBlock seller={selectedSeller} />
                            </div>
                            <ExpertiseBlock seller={selectedSeller} />
                        </div>
                    </div>
                </Modal>
            )}
            {showEditModal && selectedSeller && (
                <Modal
                    onClose={() => {
                        setShowEditModal(false)
                        setSelectedSeller(null)
                    }}>
                    <div className="max-w-2xl w-full">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Edit Seller Profile</h3>
                        <div className="space-y-4">
                            <div className="bg-[#121212] rounded-lg p-4 text-center">
                                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h4 className="text-lg font-semibold text-white mb-2">Profile Editing</h4>
                                <p className="text-sm text-gray-400 mb-4">Advanced profile editing features will be available in the next update.</p>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setSelectedSeller(null)
                                        showMessage('Profile editing feature coming soon', 'info')
                                    }}
                                    className="px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors">
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
            {selectedSellers.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-300">
                                {selectedSellers.size} seller{selectedSellers.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleBulkAction('export')}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                                    Export
                                </button>
                                <button
                                    onClick={() => handleBulkAction('suspend')}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50">
                                    Suspend
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
function EmptyState({ query }) {
    return (
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-10 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">{query ? 'No matching sellers' : 'No Active Sellers'}</h3>
            <p className="text-sm text-gray-400 mt-1">{query ? 'Try a different search.' : 'Active sellers will appear here'}</p>
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
        </div>
    )
}
function BioBlock({ seller }) {
    const hasBio = !!seller.bio
    return (
        <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">Bio</h4>
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
function ContactBlock({ seller }) {
    return (
        <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">Contact & Links</h4>
            <div className="space-y-3">
                <div className="bg-[#121212] rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Email</span>
                    </div>
                    <p className="text-sm text-white break-all">{seller.email || seller.userId?.emailAddress || 'Not provided'}</p>
                </div>
                {seller.websiteUrl && (
                    <div className="bg-[#121212] rounded-lg p-3 border border-gray-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Website</span>
                        </div>
                        <a
                            href={seller.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#00FF89] hover:underline break-all">
                            {seller.websiteUrl}
                        </a>
                    </div>
                )}
            </div>
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
                    <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Specialization Niches</h4>
                    <div className="flex flex-wrap gap-2">
                        {seller.niches.map((niche, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-[#0d1f19] text-[#00FF89] text-xs rounded-lg">
                                {niche}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {hasTools && (
                <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Tool Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                        {seller.toolsSpecialization.map((tool, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-[#352a14] text-[#FFC050] text-xs rounded-lg">
                                {tool}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
function SellerCard({ seller, isSelected, onSelect, onEdit, onViewDetails }) {
    return (
        <div className="rounded-xl border border-gray-800 bg-[#171717] overflow-hidden">
            <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelect(seller._id)}
                            className="mt-1 w-4 h-4 text-[#00FF89] bg-[#0f0f0f] border-gray-700 rounded focus:ring-[#00FF89]/50"
                        />
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                            style={{ backgroundColor: '#00FF891a', color: '#00FF89' }}>
                            {(seller.fullName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-white truncate">{seller.fullName || 'Unnamed Seller'}</h3>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full font-medium bg-[#00FF89]/20 text-[#00FF89]">
                                    <UserCheck className="w-3 h-3" />
                                    Active
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-gray-400">
                                <span className="flex items-center gap-1 min-w-0">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{seller.email || seller.userId?.emailAddress || '—'}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {seller.location?.country || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Package className="w-3 h-3" />
                                    {seller.stats?.totalProducts || 0} products
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {(seller.stats?.avgRating || 0).toFixed(1)} rating
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="text-[#00FF89] font-medium">${seller.stats?.totalRevenue || 0} revenue</span>
                                <span className="text-gray-400">{seller.stats?.totalSales || 0} sales</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onEdit}
                            className="px-3 py-1.5 bg-[#00FF89] text-[#121212] rounded-lg text-sm font-medium hover:bg-[#00FF89]/90 transition-colors flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                        </button>
                        <button
                            onClick={onViewDetails}
                            className="p-2 bg-[#0f0f0f] text-gray-400 rounded-lg hover:bg-[#1b1b1b] transition-colors">
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>
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
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}
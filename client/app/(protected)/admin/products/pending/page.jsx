'use client'

import { useState, useEffect } from 'react'
import {
    Package,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Eye,
    Shield,
    TestTube,
    AlertCircle,
    Clock,
    TrendingUp,
    User,
    Calendar,
    DollarSign,
    MessageSquare,
    Download,
    ExternalLink,
    RefreshCw,
    CheckCheck,
    MoreVertical,
    ArrowUpDown,
    Zap,
    Settings,
    SortAsc,
    SortDesc,
    ChevronUp,
    ChevronDown,
    X as CloseIcon,
    Mail,
    Globe,
    MapPin,
    Star,
    FileText,
    Activity,
    ArrowRight,
    Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import Link from 'next/link'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import AdminProductModal from '@/components/product/AdminProductModal'

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

const statusConfig = {
    pending_review: {
        color: 'text-[#FFC050]',
        chip: 'bg-[#352a14] text-[#FFC050]',
        label: 'Pending Review',
        icon: Clock,
        hint: 'Product submitted by seller. Review and verify content quality.'
    },
    unverified: {
        color: 'text-[#ff6b6b]',
        chip: 'bg-[#2a1414] text-[#ff6b6b]',
        label: 'Needs Verification',
        icon: Shield,
        hint: 'Verify product content, accuracy, and compliance.'
    },
    untested: {
        color: 'text-[#7dd3fc]',
        chip: 'bg-[#0b2833] text-[#7dd3fc]',
        label: 'Needs Testing',
        icon: TestTube,
        hint: 'Test product functionality and user experience.'
    },
    ready_to_publish: {
        color: 'text-[#00FF89]',
        chip: 'bg-[#113226] text-[#00FF89]',
        label: 'Ready to Publish',
        icon: CheckCircle,
        hint: 'Product approved and ready for seller to publish.'
    }
}

export default function PendingProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [tabSwitching, setTabSwitching] = useState(false)
    const [listOpacity, setListOpacity] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [activeStatusFilter, setActiveStatusFilter] = useState('pending_both')
    const [selectedProducts, setSelectedProducts] = useState(new Set())
    const [bulkActionLoading, setBulkActionLoading] = useState(false)
    const [error, setError] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [stats, setStats] = useState({
        pending: 0,
        urgent: 0,
        verified: 0,
        tested: 0,
        readyToPublish: 0
    })
    const [counts, setCounts] = useState({
        all: undefined,
        pending_review: undefined,
        pending_both: undefined,
        unverified: undefined,
        untested: undefined,
        ready_to_publish: undefined,
        urgent: undefined
    })
    const [actionLoading, setActionLoading] = useState(false)
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const [advancedFilters, setAdvancedFilters] = useState({
        category: '',
        type: '',
        priceRange: '',
        seller: ''
    })

    const sortOptions = [
        { value: 'createdAt', label: 'Submission Date' },
        { value: 'title', label: 'Product Name' },
        { value: 'price', label: 'Price' },
        { value: 'sellerId.fullName', label: 'Seller Name' }
    ]

    useEffect(() => {
        fetchPendingProducts()
    }, [activeStatusFilter, sortBy, sortOrder])

    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 220)
        return () => clearTimeout(id)
    }, [searchQuery])

    const fetchPendingProducts = async ({ isTabChange = false, isManualRefresh = false, silent = false } = {}) => {
        if (isManualRefresh) setListOpacity(0.6)
        if (isTabChange) setTabSwitching(true)
        if (!silent) setLoading(true)

        try {
            const params = {
                page: 1,
                limit: 50,
                sortBy,
                sortOrder,
                status: 'pending_review'
            }

            const response = await productsAPI.getAllProductsAdmin(params)

            if (response?.data?.products) {
                let allProducts = response.data.products

                const draftParams = {
                    page: 1,
                    limit: 50,
                    sortBy,
                    sortOrder,
                    status: 'draft'
                }
                const draftResponse = await productsAPI.getAllProductsAdmin(draftParams)
                const draftProducts = draftResponse?.data?.products || []

                const combinedProducts = [...allProducts, ...draftProducts.filter((p) => !p.isVerified || !p.isTested)]

                const pendingProducts = combinedProducts.filter((p) => p.status === 'pending_review' || !p.isVerified || !p.isTested)
                const urgentCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
                const urgentProducts = pendingProducts.filter((p) => new Date(p.createdAt) < urgentCutoff)

                setStats({
                    pending: pendingProducts.length,
                    urgent: urgentProducts.length,
                    verified: combinedProducts.filter((p) => p.isVerified).length,
                    tested: combinedProducts.filter((p) => p.isTested).length,
                    readyToPublish: combinedProducts.filter((p) => p.isVerified && p.isTested).length
                })

                // Apply filters
                let filteredProducts = combinedProducts
                switch (activeStatusFilter) {
                    case 'unverified':
                        filteredProducts = combinedProducts.filter((p) => !p.isVerified)
                        break
                    case 'untested':
                        filteredProducts = combinedProducts.filter((p) => !p.isTested)
                        break
                    case 'pending_both':
                        filteredProducts = combinedProducts.filter((p) => !p.isVerified || !p.isTested)
                        break
                    case 'ready_to_publish':
                        filteredProducts = combinedProducts.filter((p) => p.isVerified && p.isTested)
                        break
                    case 'urgent':
                        filteredProducts = urgentProducts
                        break
                    case 'pending_review':
                        filteredProducts = combinedProducts.filter((p) => p.status === 'pending_review')
                        break
                    default:
                        filteredProducts = pendingProducts
                        break
                }

                setCounts({
                    all: activeStatusFilter === 'all' ? filteredProducts.length : undefined,
                    pending_review:
                        activeStatusFilter === 'pending_review'
                            ? filteredProducts.length
                            : combinedProducts.filter((p) => p.status === 'pending_review').length,
                    pending_both: activeStatusFilter === 'pending_both' ? filteredProducts.length : pendingProducts.length,
                    unverified: activeStatusFilter === 'unverified' ? filteredProducts.length : combinedProducts.filter((p) => !p.isVerified).length,
                    untested: activeStatusFilter === 'untested' ? filteredProducts.length : combinedProducts.filter((p) => !p.isTested).length,
                    ready_to_publish:
                        activeStatusFilter === 'ready_to_publish'
                            ? filteredProducts.length
                            : combinedProducts.filter((p) => p.isVerified && p.isTested).length,
                    urgent: activeStatusFilter === 'urgent' ? filteredProducts.length : urgentProducts.length
                })

                setProducts(filteredProducts)
            }
        } catch (error) {
            setError(error.message || 'Failed to load products')
            toast.error('Failed to load products. Please try again.')
            setProducts([])
        } finally {
            setLoading(false)
            setTimeout(() => {
                setTabSwitching(false)
                setListOpacity(1)
            }, 120)
        }
    }

    const filteredProducts = products.filter((product) => {
        if (!debouncedQuery) return true
        const q = debouncedQuery
        return (
            (product.title || '').toLowerCase().includes(q) ||
            (product.shortDescription || '').toLowerCase().includes(q) ||
            (product.sellerId?.fullName || '').toLowerCase().includes(q) ||
            (product.category || '').toLowerCase().includes(q) ||
            (product.type || '').toLowerCase().includes(q)
        )
    })

    const handleProductAction = async (productId, action, notes = '') => {
        setActionLoading(true)
        try {
            let updateData = {}

            switch (action) {
                case 'verify':
                    updateData = { isVerified: true }
                    break
                case 'test':
                    updateData = { isTested: true }
                    break
                case 'approve':
                    updateData = { isVerified: true, isTested: true }
                    break
            }

            if (notes) updateData.adminNotes = notes

            await productsAPI.verifyProduct(productId, updateData)
            toast.success(`Product ${action}ed successfully`)
            fetchPendingProducts()
            setSelectedProducts((prev) => {
                const newSet = new Set(prev)
                newSet.delete(productId)
                return newSet
            })
        } catch (error) {
            toast.error(`Failed to ${action} product`)
        } finally {
            setActionLoading(false)
        }
    }

    const handleBulkAction = async (action) => {
        if (selectedProducts.size === 0) {
            toast.error('Please select products first')
            return
        }

        setBulkActionLoading(true)
        try {
            const promises = [...selectedProducts].map((productId) => handleProductAction(productId, action, `Bulk ${action}`))

            await Promise.all(promises)
            toast.success(`${selectedProducts.size} products updated successfully`)
            setSelectedProducts(new Set())
        } catch (error) {
            toast.error('Failed to update products')
        } finally {
            setBulkActionLoading(false)
        }
    }

    const handleSelectProduct = (productId) => {
        setSelectedProducts((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(productId)) {
                newSet.delete(productId)
            } else {
                newSet.add(productId)
            }
            return newSet
        })
    }

    const handleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set())
        } else {
            setSelectedProducts(new Set(filteredProducts.map((p) => p._id)))
        }
    }

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortBy(newSortBy)
            setSortOrder('desc')
        }
        fetchPendingProducts()
    }

    const getUrgencyLevel = (createdAt) => {
        const hoursDiff = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60)
        if (hoursDiff > 72) return { level: 'high', color: 'text-red-400 bg-red-500/10', text: 'URGENT' }
        if (hoursDiff > 48) return { level: 'medium', color: 'text-yellow-400 bg-yellow-500/10', text: 'Priority' }
        return { level: 'low', color: 'text-green-400 bg-green-500/10', text: 'Normal' }
    }

    const handleProductUpdate = (productId, updateData) => {
        setProducts((prev) => prev.map((p) => (p._id === productId ? { ...p, ...updateData } : p)))
        fetchPendingProducts()
    }

    const exportProductsData = (productsData) => {
        const csvContent = [
            ['Title', 'Seller', 'Category', 'Type', 'Price', 'Status', 'Verified', 'Tested', 'Submitted'],
            ...productsData.map((product) => [
                product.title || '',
                product.sellerId?.fullName || '',
                product.category || '',
                product.type || '',
                product.price || 0,
                product.status || '',
                product.isVerified ? 'Yes' : 'No',
                product.isTested ? 'Yes' : 'No',
                formatDate(product.createdAt)
            ])
        ]
            .map((row) => row.map((field) => `"${field}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-800 bg-[#141414]">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(600px 200px at 10% -20%, rgba(0,255,137,.08), transparent), radial-gradient(400px 150px at 90% -20%, rgba(255,192,80,.06), transparent)'
                    }}
                />
                <div className="relative p-4 sm:p-5 lg:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-lg flex-shrink-0"
                                style={{ backgroundColor: `${BRAND}1a` }}>
                                <Package
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                    style={{ color: BRAND }}
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Product Approval Center</h1>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1 lg:hidden">Review and approve products submitted by sellers</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto lg:max-w-sm">
                            <MiniKPI
                                label="Avg Time"
                                value={products.length ? '1.2d' : '0d'}
                                icon={
                                    <Clock
                                        className="w-3 h-3 sm:w-4 sm:h-4"
                                        style={{ color: BRAND }}
                                    />
                                }
                            />
                            <MiniKPI
                                label="Approval Rate"
                                value={products.length ? '94%' : '0%'}
                                icon={
                                    <TrendingUp
                                        className="w-3 h-3 sm:w-4 sm:h-4"
                                        style={{ color: AMBER }}
                                    />
                                }
                            />
                            <MiniKPI
                                label="Urgent"
                                value={counts.urgent ?? 0}
                                icon={
                                    <AlertCircle
                                        className="w-3 h-3 sm:w-4 sm:h-4"
                                        style={{ color: '#ff6b6b' }}
                                    />
                                }
                            />
                        </div>
                    </div>
                </div>

                <LegendBannerAlways statusConfig={statusConfig} />

                {/* Sticky Filter Bar */}
                <div className="sticky top-0 z-10 border-t border-gray-800 bg-[#121212]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
                    <div className="px-3 sm:px-4 lg:px-6 py-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            {/* Filter Tabs - Mobile First */}
                            <div className="relative -mx-3 sm:-mx-4 lg:-mx-6 w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)]">
                                <div className="overflow-x-auto px-3 sm:px-4 lg:px-6">
                                    <div
                                        className="inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap min-w-max"
                                        role="tablist"
                                        aria-label="Filter by status">
                                        <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />

                                        <FilterTab
                                            id="pending_both"
                                            label="Needs Review"
                                            active={activeStatusFilter}
                                            count={counts.pending_both}
                                            onSelect={(id) => {
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setActiveStatusFilter(id)
                                                fetchPendingProducts({ isTabChange: true })
                                            }}
                                        />

                                        <FilterTab
                                            id="pending_review"
                                            label="Submitted"
                                            icon={Clock}
                                            tone="amber"
                                            active={activeStatusFilter}
                                            count={counts.pending_review}
                                            onSelect={(id) => {
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setActiveStatusFilter(id)
                                                fetchPendingProducts({ isTabChange: true })
                                            }}
                                        />

                                        <FilterTab
                                            id="unverified"
                                            label="Unverified"
                                            icon={Shield}
                                            tone="red"
                                            active={activeStatusFilter}
                                            count={counts.unverified}
                                            onSelect={(id) => {
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setActiveStatusFilter(id)
                                                fetchPendingProducts({ isTabChange: true })
                                            }}
                                        />

                                        <FilterTab
                                            id="untested"
                                            label="Untested"
                                            icon={TestTube}
                                            tone="blue"
                                            active={activeStatusFilter}
                                            count={counts.untested}
                                            onSelect={(id) => {
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setActiveStatusFilter(id)
                                                fetchPendingProducts({ isTabChange: true })
                                            }}
                                        />

                                        <FilterTab
                                            id="ready_to_publish"
                                            label="Ready"
                                            icon={CheckCircle}
                                            tone="green"
                                            active={activeStatusFilter}
                                            count={counts.ready_to_publish}
                                            onSelect={(id) => {
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setActiveStatusFilter(id)
                                                fetchPendingProducts({ isTabChange: true })
                                            }}
                                        />

                                        <FilterTab
                                            id="urgent"
                                            label="Urgent"
                                            icon={AlertCircle}
                                            tone="red"
                                            active={activeStatusFilter}
                                            count={counts.urgent}
                                            onSelect={(id) => {
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setActiveStatusFilter(id)
                                                fetchPendingProducts({ isTabChange: true })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Search + Refresh */}
                            <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[300px] lg:min-w-[380px] flex-shrink-0">
                                <div className="relative flex-1 min-w-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search products, sellers…"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-9 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                                        aria-label="Search products"
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
                                    onClick={() => fetchPendingProducts({ isManualRefresh: true })}
                                    title="Refresh"
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#1b1b1b] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60 w-20 sm:w-auto flex-shrink-0">
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
                    Showing {filteredProducts.length} results for "{debouncedQuery}".
                </div>
            )}

            {/* Advanced Sorting & Filtering Controls */}
            <div className="bg-[#171717] border border-gray-800 rounded-xl p-3 sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Sort Controls */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <span className="text-sm text-gray-400 flex-shrink-0">Sort by:</span>
                        <div className="flex items-center gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="flex-1 sm:flex-none px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 min-w-0">
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
                                className="p-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0">
                                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Right: Action Controls */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <button
                            onClick={() => exportProductsData(filteredProducts)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>

                        {filteredProducts.length > 0 && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.size === filteredProducts.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-[#00FF89] bg-[#0f0f0f] border-gray-700 rounded focus:ring-[#00FF89]/50"
                                />
                                <span className="text-sm text-gray-400">Select All</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Products List */}
            <section
                aria-busy={loading}
                className="transition-opacity duration-200"
                style={{ opacity: listOpacity }}>
                {loading && tabSwitching ? (
                    <SkeletonList />
                ) : loading ? (
                    <Loader />
                ) : filteredProducts.length === 0 ? (
                    <EmptyState query={debouncedQuery} />
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onVerify={() => handleProductAction(product._id, 'verify')}
                                onTest={() => handleProductAction(product._id, 'test')}
                                onApprove={() => handleProductAction(product._id, 'approve')}
                                onViewDetails={() => {
                                    setSelectedProduct(product)
                                    setShowModal(true)
                                }}
                                onSelect={() => handleSelectProduct(product._id)}
                                isSelected={selectedProducts.has(product._id)}
                                urgency={getUrgencyLevel(product.createdAt)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Admin Product Modal */}
            <AdminProductModal
                product={selectedProduct}
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false)
                    setSelectedProduct(null)
                }}
                onProductUpdate={handleProductUpdate}
            />

            {/* Quick Actions Toolbar - Mobile Optimized */}
            {selectedProducts.size > 0 && (
                <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50">
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl px-3 sm:px-4 py-3 shadow-2xl">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                            <span className="text-xs sm:text-sm text-gray-300 text-center sm:text-left">
                                {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                <button
                                    onClick={() => handleBulkAction('verify')}
                                    disabled={bulkActionLoading}
                                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50">
                                    Verify All
                                </button>
                                <button
                                    onClick={() => handleBulkAction('test')}
                                    disabled={bulkActionLoading}
                                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
                                    Test All
                                </button>
                                <button
                                    onClick={() => handleBulkAction('approve')}
                                    disabled={bulkActionLoading}
                                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-[#00FF89] text-[#121212] rounded-lg text-xs sm:text-sm font-medium hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50">
                                    Approve All
                                </button>
                                <button
                                    onClick={() => setSelectedProducts(new Set())}
                                    className="p-1.5 text-gray-400 hover:text-white transition-colors flex-shrink-0">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Supporting Components
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
                : tone === 'red'
                  ? 'bg-[#2a1414] text-[#ff6b6b]'
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

function ProductCard({ product, onVerify, onTest, onApprove, onViewDetails, onSelect, isSelected, urgency }) {
    const getProductStatus = () => {
        if (product.status === 'pending_review') return 'pending_review'
        if (!product.isVerified) return 'unverified'
        if (!product.isTested) return 'untested'
        if (product.isVerified && product.isTested) return 'ready_to_publish'
        return 'pending_review'
    }

    const status = getProductStatus()
    const cfg = statusConfig[status] || statusConfig.pending_review

    const getPrimaryAction = () => {
        if (!product.isVerified) {
            return { label: 'Verify', icon: Shield, onClick: onVerify, color: 'bg-green-500 hover:bg-green-600' }
        }
        if (!product.isTested) {
            return { label: 'Test', icon: TestTube, onClick: onTest, color: 'bg-blue-500 hover:bg-blue-600' }
        }
        if (product.isVerified && product.isTested) {
            return { label: 'Approved', icon: CheckCircle, onClick: null, color: 'bg-[#00FF89] text-[#121212]' }
        }
        return { label: 'Review', icon: Eye, onClick: onViewDetails, color: 'bg-[#00FF89] hover:bg-[#00FF89]/90' }
    }

    const primaryAction = getPrimaryAction()

    return (
        <div className="rounded-xl border border-gray-800 bg-[#171717] overflow-hidden">
            <div className="p-3 sm:p-4 lg:p-5">
                <div className="flex flex-col gap-4">
                    {/* Mobile: Top Row with Thumbnail + Title + Status */}
                    <div className="flex items-start gap-3 sm:gap-4">
                        {/* Thumbnail with Checkbox */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={onSelect}
                                className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 z-10 w-3 h-3 rounded border-gray-500 text-[#00FF89] focus:ring-[#00FF89] focus:ring-1 bg-gray-800"
                            />
                            <OptimizedImage
                                src={product.thumbnail}
                                alt={product.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                onClick={onViewDetails}
                            />
                        </div>

                        {/* Title + Urgency + Status - Mobile Stacked */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                {/* Left: Title + Urgency */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start gap-2 flex-wrap">
                                        <h3
                                            className="text-base sm:text-lg font-semibold text-white cursor-pointer hover:text-[#00FF89] transition-colors line-clamp-2"
                                            onClick={onViewDetails}>
                                            {product.title}
                                        </h3>
                                        <div className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium border ${urgency.color} border-current/30 flex-shrink-0`}>
                                            {urgency.text}
                                        </div>
                                    </div>

                                    {/* Meta Info - Responsive Layout */}
                                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate max-w-[120px] sm:max-w-none">{product.sellerId?.fullName || 'Unknown Seller'}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3 text-[#FFC050] flex-shrink-0" />
                                            <span className="text-[#FFC050] font-semibold">{product.price === 0 ? 'Free' : `$${product.price}`}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3 flex-shrink-0" />
                                            <span className="text-xs">{formatDate(product.createdAt)}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Right: Status Chip - Mobile Full Width */}
                                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                                    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${cfg.chip} flex-shrink-0`}>
                                        <cfg.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span className="hidden xs:inline">{cfg.label}</span>
                                        <span className="xs:hidden">{cfg.label.split(' ')[0]}</span>
                                    </span>
                                    <InfoTip label={`${cfg.label} info`}>
                                        <p className="text-xs text-gray-200">{cfg.hint}</p>
                                    </InfoTip>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category & Type Tags */}
                    {(product.category || product.type) && (
                        <div className="flex items-center gap-2 flex-wrap -mt-2">
                            {product.category && (
                                <span className="px-2 py-0.5 text-[10px] rounded bg-[#0d1f19] text-[#00FF89]">{product.category}</span>
                            )}
                            {product.type && <span className="px-2 py-0.5 text-[10px] rounded bg-[#352a14] text-[#FFC050]">{product.type}</span>}
                        </div>
                    )}

                    {/* Status Indicators */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div
                            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${product.isVerified ? 'bg-[#00FF89]/20 text-[#00FF89]' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            <Shield className="w-3 h-3" />
                            <span>{product.isVerified ? 'Verified' : 'Unverified'}</span>
                        </div>
                        <div
                            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${product.isTested ? 'bg-[#00FF89]/20 text-[#00FF89]' : 'bg-blue-500/20 text-blue-400'}`}>
                            <TestTube className="w-3 h-3" />
                            <span>{product.isTested ? 'Tested' : 'Untested'}</span>
                        </div>
                    </div>

                    {/* Actions - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                        {/* Primary Action Row */}
                        <div className="flex items-center gap-2 flex-1 sm:flex-none">
                            {primaryAction.onClick && (
                                <button
                                    onClick={primaryAction.onClick}
                                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg font-medium text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 ${primaryAction.color} text-white`}>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <primaryAction.icon className="w-3.5 h-3.5" />
                                        <span>{primaryAction.label}</span>
                                    </div>
                                </button>
                            )}

                            {!product.isVerified || !product.isTested ? (
                                <button
                                    onClick={onApprove}
                                    className="flex-1 sm:flex-none px-3 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium text-xs hover:bg-[#00FF89]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60"
                                    title="Quick approve (verify + test)">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5" />
                                        <span className="hidden xs:inline">Quick Approve</span>
                                        <span className="xs:hidden">Approve</span>
                                    </div>
                                </button>
                            ) : null}

                            {/* View Details */}
                            <button
                                onClick={onViewDetails}
                                className="p-2 bg-[#0f0f0f] text-gray-400 rounded-lg hover:bg-[#1b1b1b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60 flex-shrink-0"
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

function InfoTip({ label = 'Info', children }) {
    const [open, setOpen] = useState(false)

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
                onClick={() => setOpen((v) => !v)}
                onBlur={() => setOpen(false)}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                <Info className="w-4 h-4" />
            </button>
            <div
                role="tooltip"
                className={`absolute z-50 w-64 sm:w-72 -right-1 top-full mt-2 origin-top-right rounded-lg border border-gray-800 bg-[#121212] p-3 shadow-xl transition ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {children}
            </div>
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

function SkeletonList() {
    return (
        <div className="space-y-3 sm:space-y-4">
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
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">{query ? 'No matching products' : 'No Pending Products'}</h3>
            <p className="text-sm text-gray-400 mt-1">{query ? 'Try a different search.' : 'All products have been processed.'}</p>
        </div>
    )
}

function LegendBannerAlways({ statusConfig }) {
    return (
        <div className="px-4 sm:px-6 pb-3">
            <div className="rounded-xl border border-sky-900/40 bg-gradient-to-br from-[#0b1220] via-[#0b1324] to-[#0e1b2a] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_30px_rgba(10,20,40,0.25)] w-full">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-white/5">
                    <Info className="w-4 h-4 text-sky-300" />
                    <span className="font-semibold text-sky-300">Product Approval Workflow</span>
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

                                {/* Arrow between states */}
                                {index < Object.entries(statusConfig).length - 1 && (
                                    <div className="flex items-center justify-center">
                                        <ArrowRight className="w-5 h-5 text-sky-400/60 flex-shrink-0" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 text-xs text-sky-100/60">
                        Flow: <span className="text-sky-200">Submitted → Verify Content → Test Functionality → Ready to Publish</span>
                    </div>
                </div>
            </div>
        </div>
    )
}


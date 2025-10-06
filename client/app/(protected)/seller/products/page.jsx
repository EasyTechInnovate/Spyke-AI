'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
    Plus,
    Package,
    Search,
    Filter,
    Trash2,
    Eye,
    FileJson,
    Archive,
    AlertCircle,
    Shield,
    TestTube,
    Clock,
    Star,
    Users,
    CheckCircle,
    RefreshCw,
    X,
    ChevronDown,
    ChevronUp,
    Settings,
    Download,
    SortAsc,
    SortDesc,
    DollarSign} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { productsAPI, sellerAPI } from '@/lib/api'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import ConfirmationModal from '@/components/shared/ui/ConfirmationModal'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
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
    draft: {
        color: 'text-[#FFC050]',
        chip: 'bg-[#352a14] text-[#FFC050]',
        label: 'Draft',
        icon: Clock,
        hint: 'Product is in draft mode. Submit for review to get it verified.'
    },
    pending_review: {
        color: 'text-[#7dd3fc]',
        chip: 'bg-[#0b2833] text-[#7dd3fc]',
        label: 'Under Review',
        icon: Eye,
        hint: 'Admin is reviewing your product for verification and testing.'
    },
    published: {
        color: 'text-[#00FF89]',
        chip: 'bg-[#113226] text-[#00FF89]',
        label: 'Published',
        icon: CheckCircle,
        hint: 'Product is live and available for purchase.'
    },
    archived: {
        color: 'text-[#ef4444]',
        chip: 'bg-[#2d1b1b] text-[#ef4444]',
        label: 'Archived',
        icon: Archive,
        hint: 'Product is archived and not visible to buyers.'
    }
}
export default function SellerProductsPage() {
    const { data: sellerProfile, loading: profileLoading } = useSellerProfile()
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [tabSwitching, setTabSwitching] = useState(false)
    const [listOpacity, setListOpacity] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedProducts, setSelectedProducts] = useState(new Set())
    const [showBulkActions, setShowBulkActions] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [sortBy, setSortBy] = useState('updatedAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const [advancedFilters, setAdvancedFilters] = useState({
        priceRange: '',
        category: '',
        type: '',
        verificationStatus: ''
    })
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'default',
        onConfirm: null,
        loading: false,
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    })
    const [stats, setStats] = useState({
        all: 0,
        draft: 0,
        pending_review: 0,
        published: 0,
        archived: 0,
        totalRevenue: 0,
        totalViews: 0,
        avgRating: 0
    })
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    })
    const latestReqIdRef = useRef(0)
    const cacheRef = useRef(new Map())
    const sortOptions = [
        { value: 'updatedAt', label: 'Last Updated' },
        { value: 'createdAt', label: 'Date Created' },
        { value: 'title', label: 'Product Name' },
        { value: 'price', label: 'Price' },
        { value: 'views', label: 'Views' },
        { value: 'sales', label: 'Sales' },
        { value: 'rating', label: 'Rating' }
    ]
    const isVerificationApproved = sellerProfile?.verificationStatus === 'approved'
    const isCommissionAccepted = sellerProfile?.commissionOffer?.status === 'accepted' && sellerProfile?.commissionOffer?.acceptedAt
    const isFullyApproved = isVerificationApproved && isCommissionAccepted
    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 300)
        return () => clearTimeout(id)
    }, [searchQuery])
    const fetchProducts = useCallback(
        async ({ isTabChange = false, isManualRefresh = false, silent = false } = {}) => {
            if (!isFullyApproved) return
            const key = `${filterStatus}:${pagination.currentPage}`
            if (isManualRefresh) setListOpacity(0.6)
            if (isTabChange) setTabSwitching(true)
            if (!silent) setLoading(true)
            if (cacheRef.current.has(key)) {
                const cached = cacheRef.current.get(key)
                setProducts(cached.products)
                setPagination(cached.pagination || pagination)
            }
            try {
                const reqId = ++latestReqIdRef.current
                const params = {
                    page: pagination.currentPage,
                    limit: 12,
                    sortBy,
                    sortOrder
                }
                if (filterStatus !== 'all') params.status = filterStatus
                if (advancedFilters.category) params.category = advancedFilters.category
                if (advancedFilters.type) params.type = advancedFilters.type
                if (advancedFilters.priceRange) params.priceRange = advancedFilters.priceRange
                const response = await productsAPI.getMyProducts(params)
                if (reqId !== latestReqIdRef.current) return 
                if (response.data) {
                    const productsData = response.data.products || []
                    const paginationData = response.data.pagination || {}
                    cacheRef.current.set(key, { products: productsData, pagination: paginationData })
                    setProducts(productsData)
                    setPagination(paginationData)
                    const newStats = {
                        all: productsData.length,
                        draft: productsData.filter((p) => p.status === 'draft').length,
                        pending_review: productsData.filter((p) => p.status === 'pending_review').length,
                        published: productsData.filter((p) => p.status === 'published').length,
                        archived: productsData.filter((p) => p.status === 'archived').length,
                        totalRevenue: productsData.reduce((sum, p) => sum + p.price * (p.sales || 0), 0),
                        totalViews: productsData.reduce((sum, p) => sum + (p.views || 0), 0),
                        avgRating:
                            productsData.length > 0 ? productsData.reduce((sum, p) => sum + (p.averageRating || 0), 0) / productsData.length : 0
                    }
                    setStats(newStats)
                }
            } catch (error) {
                console.error('Error fetching products:', error)
                showMessage('Failed to load products', 'error')
                setProducts([])
                setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 })
            } finally {
                setLoading(false)
                setTimeout(() => {
                    setTabSwitching(false)
                    setListOpacity(1)
                }, 120)
            }
        },
        [filterStatus, pagination.currentPage, isFullyApproved, sortBy, sortOrder, advancedFilters]
    )
    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])
    const filteredProducts = useMemo(() => {
        if (!debouncedQuery) return products
        return products.filter((product) => {
            const q = debouncedQuery
            return (
                (product?.title || '').toLowerCase().includes(q) ||
                (product?.shortDescription || '').toLowerCase().includes(q) ||
                (product?.category || '').toLowerCase().includes(q) ||
                (product?.type || '').toLowerCase().includes(q)
            )
        })
    }, [debouncedQuery, products])
    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortBy(newSortBy)
            setSortOrder('desc')
        }
        fetchProducts()
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
    const handleBulkAction = async (action) => {
        if (selectedProducts.size === 0) return
        setActionLoading(true)
        try {
            switch (action) {
                case 'publish':
                    await Promise.all(
                        [...selectedProducts].map((id) => {
                            const product = products.find((p) => p._id === id)
                            if (product?.isVerified && product?.isTested) {
                                return productsAPI.updateProduct(id, { status: 'published' })
                            }
                            return Promise.resolve()
                        })
                    )
                    showMessage('${selectedProducts.size} products published', 'success')
                    break
                case 'archive':
                    await Promise.all([...selectedProducts].map((id) => productsAPI.updateProduct(id, { status: 'archived' })))
                    showMessage('${selectedProducts.size} products archived', 'success')
                    break
                case 'delete':
                    await Promise.all([...selectedProducts].map((id) => productsAPI.deleteProduct(id)))
                    showMessage('${selectedProducts.size} products deleted', 'success')
                    break
                case 'export':
                    exportProductsData(filteredProducts.filter((p) => selectedProducts.has(p._id)))
                    showMessage('Products data exported', 'success')
                    break
            }
            setSelectedProducts(new Set())
            fetchProducts()
        } catch (error) {
            console.error('Bulk action failed:', error)
            showMessage('Bulk action failed', 'error')
        } finally {
            setActionLoading(false)
        }
    }
    const exportProductsData = (productsData) => {
        const csvContent = [
            ['Title', 'Status', 'Price', 'Views', 'Sales', 'Rating', 'Created', 'Updated'],
            ...productsData.map((product) => [
                product.title || '',
                product.status || '',
                product.price || 0,
                product.views || 0,
                product.sales || 0,
                product.averageRating || 0,
                formatDate(product.createdAt),
                formatDate(product.updatedAt)
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
    const handleDeleteProduct = async (productId, productTitle) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Product',
            message: `Are you sure you want to delete "${productTitle}"? This action cannot be undone.`,
            type: 'danger',
            confirmText: 'Delete Product',
            cancelText: 'Cancel',
            onConfirm: async () => {
                try {
                    setConfirmModal((prev) => ({ ...prev, loading: true }))
                    await productsAPI.deleteProduct(productId)
                    showMessage('Product deleted successfully', 'success')
                    fetchProducts()
                    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }))
                } catch (error) {
                    console.error('Error deleting product:', error)
                    showMessage('Failed to delete product', 'error')
                    setConfirmModal((prev) => ({ ...prev, loading: false }))
                }
            }
        })
    }
    const handlePublishProduct = async (productId, currentStatus, product) => {
        try {
            if (currentStatus !== 'published') {
                if (!product.isVerified || !product.isTested) {
                    let message = 'Cannot publish: Product needs '
                    const missing = []
                    if (!product.isVerified) missing.push('admin verification')
                    if (!product.isTested) missing.push('admin testing')
                    message += missing.join(' and ')
                    showMessage(message, 'error')
                    return
                }
            }
            const newStatus = currentStatus === 'published' ? 'draft' : 'published'
            await productsAPI.updateProduct(productId, { status: newStatus })
            showMessage(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`, 'success')
            fetchProducts()
        } catch (error) {
            console.error('Error updating product status:', error)
            if (error.message?.includes('verified') || error.message?.includes('tested')) {
                showMessage(error.message, 'error')
            } else {
                showMessage('Failed to update product status', 'error')
            }
        }
    }
    const handleSubmitForReview = async (productId, productTitle) => {
        setConfirmModal({
            isOpen: true,
            title: 'Submit for Review',
            message: `Are you sure you want to submit "${productTitle}" for admin review? This will notify administrators to verify and test your product.`,
            type: 'success',
            confirmText: 'Submit for Review',
            cancelText: 'Cancel',
            onConfirm: async () => {
                try {
                    setConfirmModal((prev) => ({ ...prev, loading: true }))
                    await sellerAPI.submitProductForReview(productId)
                    showMessage('Product submitted for review successfully! Admins will be notified.', 'success')
                    fetchProducts()
                    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }))
                } catch (error) {
                    console.error('Error submitting product for review:', error)
                    const errorMessage = error.response?.data?.message || error.message || 'Failed to submit product for review'
                    showMessage(errorMessage, 'error')
                    setConfirmModal((prev) => ({ ...prev, loading: false }))
                }
            }
        })
    }
    const showRestricted = !profileLoading && !isFullyApproved
    if (showRestricted) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}
                <div className="max-w-md w-full mx-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Products Access Restricted</h2>
                        <p className="text-gray-400 mb-6">You need to complete your seller approval process before you can manage products.</p>
                        {!isVerificationApproved && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                                <p className="text-amber-300 text-sm">⏳ Your documents are still being reviewed</p>
                            </div>
                        )}
                        {isVerificationApproved && !isCommissionAccepted && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                                <p className="text-blue-300 text-sm">💼 Please accept the commission offer to complete your approval</p>
                            </div>
                        )}
                        <Link
                            href="/seller/profile"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-[#121212] rounded-lg hover:bg-[#00FF89]/90 transition-colors font-semibold">
                            Complete Approval Process
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-blue-300 mb-1">Product Editing Guidelines</h3>
                        <p className="text-sm text-blue-200/80">
                            You can only edit products that are in <strong>Draft</strong> or <strong>Published</strong> status. 
                            Products under review cannot be modified until the review process is complete.
                        </p>
                    </div>
                </div>
            </div>

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
                                <Package
                                    className="w-6 h-6"
                                    style={{ color: BRAND }}
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">Product Dashboard</h1>
                                <p className="text-gray-400 mt-1">Manage and monitor your product portfolio</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto">
                            <MiniKPI
                                label="Published"
                                value={stats.published}
                                icon={
                                    <CheckCircle
                                        className="w-4 h-4"
                                        style={{ color: BRAND }}
                                    />
                                }
                            />
                            <MiniKPI
                                label="Revenue"
                                value={`$${stats.totalRevenue.toLocaleString()}`}
                                icon={
                                    <DollarSign
                                        className="w-4 h-4"
                                        style={{ color: AMBER }}
                                    />
                                }
                            />
                            <MiniKPI
                                label="Views"
                                value={stats.totalViews.toLocaleString()}
                                icon={
                                    <Eye
                                        className="w-4 h-4"
                                        style={{ color: AMBER }}
                                    />
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 px-5 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">Quick Actions:</span>
                            <Link
                                href="/seller/products/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg hover:bg-[#00FF89]/90 transition-colors font-medium">
                                <Plus className="w-4 h-4" />
                                <span>Create Product</span>
                            </Link>
                            <Link
                                href="/seller/products/addjson"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                                <FileJson className="w-4 h-4" />
                                <span>Import JSON</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => exportProductsData(filteredProducts)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                            <button
                                onClick={() => fetchProducts({ isManualRefresh: true })}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#1b1b1b] transition-colors text-sm">
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="sticky top-0 z-10 border-t border-gray-800 bg-[#121212]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
                    <div className="px-4 sm:px-6 py-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
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
                                            active={filterStatus}
                                            count={stats.all}
                                            onSelect={(id) => {
                                                setPagination((prev) => ({ ...prev, currentPage: 1 }))
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setFilterStatus(id)
                                                fetchProducts({ isTabChange: true })
                                            }}
                                        />
                                        <FilterTab
                                            id="draft"
                                            label="Draft"
                                            icon={Clock}
                                            tone="amber"
                                            active={filterStatus}
                                            count={stats.draft}
                                            onSelect={(id) => {
                                                setPagination((prev) => ({ ...prev, currentPage: 1 }))
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setFilterStatus(id)
                                                fetchProducts({ isTabChange: true })
                                            }}
                                        />
                                        <FilterTab
                                            id="pending_review"
                                            label="Review"
                                            icon={Eye}
                                            tone="blue"
                                            active={filterStatus}
                                            count={stats.pending_review}
                                            onSelect={(id) => {
                                                setPagination((prev) => ({ ...prev, currentPage: 1 }))
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setFilterStatus(id)
                                                fetchProducts({ isTabChange: true })
                                            }}
                                        />
                                        <FilterTab
                                            id="published"
                                            label="Published"
                                            icon={CheckCircle}
                                            tone="green"
                                            active={filterStatus}
                                            count={stats.published}
                                            onSelect={(id) => {
                                                setPagination((prev) => ({ ...prev, currentPage: 1 }))
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setFilterStatus(id)
                                                fetchProducts({ isTabChange: true })
                                            }}
                                        />
                                        <FilterTab
                                            id="archived"
                                            label="Archived"
                                            icon={Archive}
                                            tone="red"
                                            active={filterStatus}
                                            count={stats.archived}
                                            onSelect={(id) => {
                                                setPagination((prev) => ({ ...prev, currentPage: 1 }))
                                                setSearchQuery('')
                                                setListOpacity(0.75)
                                                setFilterStatus(id)
                                                fetchProducts({ isTabChange: true })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:min-w-[360px]">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-9 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
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
                {showAdvancedFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Price Range</label>
                                <select
                                    value={advancedFilters.priceRange}
                                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, priceRange: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    <option value="">All Prices</option>
                                    <option value="free">Free</option>
                                    <option value="under-20">Under $20</option>
                                    <option value="20-50">$20 - $50</option>
                                    <option value="50-100">$50 - $100</option>
                                    <option value="over-100">Over $100</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                                <select
                                    value={advancedFilters.category}
                                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    <option value="">All Categories</option>
                                    <option value="lead_generation">Lead Generation</option>
                                    <option value="content_creation">Content Creation</option>
                                    <option value="automation">Automation</option>
                                    <option value="analytics">Analytics</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Product Type</label>
                                <select
                                    value={advancedFilters.type}
                                    onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    <option value="">All Types</option>
                                    <option value="prompt">Prompts</option>
                                    <option value="automation">Automations</option>
                                    <option value="agent">AI Agents</option>
                                    <option value="template">Templates</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() =>
                                        setAdvancedFilters({
                                            priceRange: '',
                                            category: '',
                                            type: '',
                                            verificationStatus: ''
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
                {loading && tabSwitching ? (
                    <SkeletonList />
                ) : loading ? (
                    <Loader />
                ) : filteredProducts.length === 0 ? (
                    <EmptyState query={debouncedQuery} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onSelect={handleSelectProduct}
                                    isSelected={selectedProducts.has(product._id)}
                                    onDelete={() => handleDeleteProduct(product._id, product.title)}
                                    onPublish={() => handlePublishProduct(product._id, product.status, product)}
                                    onSubmitForReview={() => handleSubmitForReview(product._id, product.title)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>
            {pagination.totalPages > 1 && !debouncedQuery && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPagination((prev) => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                        disabled={pagination.currentPage === 1}
                        className="px-4 py-2 bg-[#141414] border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1b1b1b] transition-colors">
                        Previous
                    </button>
                    <span className="text-white px-4">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination((prev) => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-4 py-2 bg-[#141414] border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1b1b1b] transition-colors">
                        Next
                    </button>
                </div>
            )}
            {selectedProducts.size > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-300">
                                {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleBulkAction('publish')}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 bg-[#00FF89] text-[#121212] rounded-lg text-sm font-medium hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50">
                                    Publish
                                </button>
                                <button
                                    onClick={() => handleBulkAction('archive')}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50">
                                    Archive
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleBulkAction('export')}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                                    Export
                                </button>
                                <button
                                    onClick={() => setSelectedProducts(new Set())}
                                    className="p-1.5 text-gray-400 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                loading={confirmModal.loading}
            />
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
                : tone === 'red'
                  ? 'bg-[#2d1b1b] text-[#ef4444]'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-5">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 w-2/3 bg-white/10 rounded" />
                            <div className="h-3 w-1/2 bg-white/10 rounded" />
                            <div className="h-40 w-full bg-white/5 rounded" />
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
            <h3 className="text-lg font-semibold text-white">{query ? 'No matching products' : 'No Products Found'}</h3>
            <p className="text-sm text-gray-400 mt-1">
                {query ? 'Try adjusting your search or filters.' : 'Create your first product to get started.'}
            </p>
            {!query && (
                <Link
                    href="/seller/products/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-[#121212] rounded-lg hover:bg-[#00FF89]/90 transition-colors font-semibold mt-4">
                    <Plus className="w-4 h-4" />
                    Create Product
                </Link>
            )}
        </div>
    )
}
function ProductCard({ product, onSelect, isSelected, onDelete, onPublish, onSubmitForReview }) {
    const status = product.status || 'draft'
    const cfg = statusConfig[status] || statusConfig.draft
    const getVerificationStatusText = (product) => {
        if (product.isVerified && product.isTested) {
            return { text: 'Fully Approved', color: 'text-green-400', icon: Star }
        }
        if (product.isVerified && !product.isTested) {
            return { text: 'Verified, Testing Pending', color: 'text-blue-400', icon: TestTube }
        }
        if (!product.isVerified && product.isTested) {
            return { text: 'Tested, Verification Pending', color: 'text-yellow-400', icon: Shield }
        }
        return { text: 'Under Review', color: 'text-yellow-400', icon: Clock }
    }
    
    const verificationStatus = getVerificationStatusText(product)
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-gray-800 bg-[#171717] overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onSelect(product._id)}
                                className="w-4 h-4 text-[#00FF89] bg-[#0f0f0f] border-gray-700 rounded focus:ring-[#00FF89]/50"
                            />
                            <h3 className="text-lg font-semibold text-white truncate">{product.title}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{product.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{product.sales || 0} sales</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-medium text-white">{product.price === 0 ? 'Free' : `$${product.price}`}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.chip}`}>
                            <cfg.icon className="w-3.5 h-3.5" />
                            {cfg.label}
                        </span>
                    </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-1.5 ${product.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                            <Shield className="w-3 h-3" />
                            <span>{product.isVerified ? '✓ Verified' : '⏳ Pending'}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${product.isTested ? 'text-blue-400' : 'text-yellow-400'}`}>
                            <TestTube className="w-3 h-3" />
                            <span>{product.isTested ? '✓ Tested' : '⏳ Pending'}</span>
                        </div>
                    </div>
                    {product.isVerified && product.isTested && status === 'draft' && (
                        <div className="mt-2 text-center text-xs text-[#00FF89]">🚀 Ready to publish!</div>
                    )}
                </div>
                <div className="flex gap-2">
                    
                    {product.isVerified && product.isTested ? (
                        <button
                            onClick={onPublish}
                            className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                status === 'published' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}>
                            {status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                    ) : status === 'draft' ? (
                        <button
                            onClick={onSubmitForReview}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                            Submit Review
                        </button>
                    ) : (
                        <button
                            disabled
                            className="flex-1 px-3 py-2 bg-gray-600 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                            Under Review
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">Updated {formatDate(product.updatedAt)}</div>
            </div>
        </motion.div>
    )
}
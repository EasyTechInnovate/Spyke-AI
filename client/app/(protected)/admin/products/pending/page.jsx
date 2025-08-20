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
    Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import Link from 'next/link'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import AdminProductModal from '@/components/product/AdminProductModal'

export default function PendingProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('pending_both')
    const [selectedProducts, setSelectedProducts] = useState([])
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

    useEffect(() => {
        fetchPendingProducts()
    }, [filterStatus, sortBy, sortOrder])

    const fetchPendingProducts = async () => {
        try {
            setLoading(true)

            const params = {
                page: 1,
                limit: 50,
                sortBy,
                sortOrder
            }

            const response = await productsAPI.getProducts(params)

            if (response?.data?.products) {
                let allProducts = response.data.products

                // Calculate stats
                const pendingProducts = allProducts.filter((p) => !p.isVerified || !p.isTested)
                const urgentCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
                const urgentProducts = pendingProducts.filter((p) => new Date(p.createdAt) < urgentCutoff)

                setStats({
                    pending: pendingProducts.length,
                    urgent: urgentProducts.length,
                    verified: allProducts.filter((p) => p.isVerified).length,
                    tested: allProducts.filter((p) => p.isTested).length,
                    readyToPublish: allProducts.filter((p) => p.isVerified && p.isTested).length
                })

                // Apply filters
                let filteredProducts = allProducts
                switch (filterStatus) {
                    case 'unverified':
                        filteredProducts = allProducts.filter((p) => !p.isVerified)
                        break
                    case 'untested':
                        filteredProducts = allProducts.filter((p) => !p.isTested)
                        break
                    case 'pending_both':
                        filteredProducts = allProducts.filter((p) => !p.isVerified || !p.isTested)
                        break
                    case 'ready_to_publish':
                        filteredProducts = allProducts.filter((p) => p.isVerified && p.isTested)
                        break
                    case 'urgent':
                        filteredProducts = urgentProducts
                        break
                    default:
                        filteredProducts = pendingProducts
                        break
                }

                setProducts(filteredProducts)
            }
        } catch (error) {
            setError(error.message || 'Failed to load products')
            toast.error('Failed to load products. Please try again.')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const handleProductAction = async (productId, action, notes = '') => {
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
            toast.success(`Product ${action}d successfully`)
            fetchPendingProducts()
            setSelectedProducts((prev) => prev.filter((id) => id !== productId))
        } catch (error) {
            toast.error(`Failed to ${action} product`)
        }
    }

    const handleBulkAction = async (action) => {
        if (selectedProducts.length === 0) {
            toast.error('Please select products first')
            return
        }

        setBulkActionLoading(true)
        try {
            const promises = selectedProducts.map((productId) => handleProductAction(productId, action, `Bulk ${action}`))

            await Promise.all(promises)
            toast.success(`${selectedProducts.length} products updated successfully`)
            setSelectedProducts([])
        } catch (error) {
            toast.error('Failed to update products')
        } finally {
            setBulkActionLoading(false)
        }
    }

    const toggleProductSelection = (productId) => {
        setSelectedProducts((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
    }

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([])
        } else {
            setSelectedProducts(filteredProducts.map((p) => p._id))
        }
    }

    const getUrgencyLevel = (createdAt) => {
        const hoursDiff = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60)
        if (hoursDiff > 72) return { level: 'high', color: 'text-red-400 bg-red-500/10', text: 'URGENT' }
        if (hoursDiff > 48) return { level: 'medium', color: 'text-yellow-400 bg-yellow-500/10', text: 'Priority' }
        return { level: 'low', color: 'text-green-400 bg-green-500/10', text: 'Normal' }
    }

    const filteredProducts = products.filter(
        (product) =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.sellerId?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filterOptions = [
        { value: 'pending_both', label: 'Needs Review', count: stats.pending, color: 'text-yellow-400' },
        { value: 'urgent', label: 'Urgent (48h+)', count: stats.urgent, color: 'text-red-400' },
        { value: 'unverified', label: 'Unverified', count: products.filter((p) => !p.isVerified).length, color: 'text-orange-400' },
        { value: 'untested', label: 'Untested', count: products.filter((p) => !p.isTested).length, color: 'text-blue-400' },
        { value: 'ready_to_publish', label: 'Ready to Publish', count: stats.readyToPublish, color: 'text-green-400' },
        { value: 'all', label: 'All Products', count: products.length, color: 'text-gray-400' }
    ]

    const handleProductUpdate = (productId, updateData) => {
        setProducts((prev) => prev.map((p) => (p._id === productId ? { ...p, ...updateData } : p)))
        fetchPendingProducts() // Refresh to get updated stats
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#121212] text-[#00FF89] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-[#00FF89]">Error Loading Products</h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchPendingProducts}
                        className="px-6 py-2 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] font-medium rounded-lg transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#121212] text-[#00FF89]">
            {/* Enhanced Header with Brand Colors */}
            <div className="bg-gradient-to-r from-[#1f1f1f] via-[#2a2a2a] to-[#1f1f1f] border-b border-[#00FF89]/20">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#00FF89] mb-2">Product Approval Center</h1>
                            <p className="text-gray-400">Review and approve products submitted by sellers</p>
                        </div>
                        <button
                            onClick={fetchPendingProducts}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#00FF89]/30 rounded-lg transition-colors">
                            <RefreshCw className={`w-4 h-4 text-[#00FF89] ${loading ? 'animate-spin' : ''}`} />
                            <span className="text-[#00FF89] font-medium">Refresh</span>
                        </button>
                    </div>

                    {/* Enhanced Stats Dashboard with Brand Colors */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Pending Review', value: stats.pending, icon: Clock, gradient: 'from-yellow-500/20 to-orange-500/20', iconColor: 'text-yellow-400', textColor: 'text-yellow-400' },
                            { label: 'Urgent (48h+)', value: stats.urgent, icon: AlertCircle, gradient: 'from-red-500/20 to-pink-500/20', iconColor: 'text-red-400', textColor: 'text-red-400' },
                            { label: 'Verified', value: stats.verified, icon: Shield, gradient: 'from-[#00FF89]/20 to-green-500/20', iconColor: 'text-[#00FF89]', textColor: 'text-[#00FF89]' },
                            { label: 'Tested', value: stats.tested, icon: TestTube, gradient: 'from-blue-500/20 to-purple-500/20', iconColor: 'text-blue-400', textColor: 'text-blue-400' },
                            { label: 'Ready to Publish', value: stats.readyToPublish, icon: CheckCircle, gradient: 'from-[#00FF89]/30 to-emerald-500/30', iconColor: 'text-[#00FF89]', textColor: 'text-[#00FF89]' }
                        ].map((stat, index) => {
                            const Icon = stat.icon
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-4 rounded-lg border border-[#00FF89]/10 hover:border-[#00FF89]/30 transition-colors`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-[#1f1f1f]/50 border border-[#00FF89]/20`}>
                                            <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                        </div>
                                        <div>
                                            <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
                                            <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Enhanced Controls with Brand Colors */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00FF89]/60 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products, sellers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#1f1f1f] border border-[#00FF89]/30 rounded-lg text-[#00FF89] placeholder-gray-400 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-colors"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 bg-[#1f1f1f] border border-[#00FF89]/30 rounded-lg text-[#00FF89] focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 min-w-[200px] appearance-none cursor-pointer">
                            {filterOptions.map((option) => (
                                <option key={option.value} value={option.value} className="bg-[#1f1f1f] text-[#00FF89]">
                                    {option.label} ({option.count})
                                </option>
                            ))}
                        </select>
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00FF89]/60 w-5 h-5 pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-')
                                setSortBy(field)
                                setSortOrder(order)
                            }}
                            className="px-4 py-3 bg-[#1f1f1f] border border-[#00FF89]/30 rounded-lg text-[#00FF89] focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 min-w-[180px] appearance-none cursor-pointer">
                            <option value="createdAt-desc" className="bg-[#1f1f1f] text-[#00FF89]">Newest First</option>
                            <option value="createdAt-asc" className="bg-[#1f1f1f] text-[#00FF89]">Oldest First</option>
                            <option value="price-desc" className="bg-[#1f1f1f] text-[#00FF89]">Price: High to Low</option>
                            <option value="price-asc" className="bg-[#1f1f1f] text-[#00FF89]">Price: Low to High</option>
                            <option value="title-asc" className="bg-[#1f1f1f] text-[#00FF89]">Name: A to Z</option>
                        </select>
                        <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00FF89]/60 w-5 h-5 pointer-events-none" />
                    </div>
                </div>

                {/* Bulk Actions Bar with Brand Colors */}
                <AnimatePresence>
                    {selectedProducts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-gradient-to-r from-[#00FF89]/10 via-[#00FF89]/5 to-[#00FF89]/10 border border-[#00FF89]/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse"></div>
                                    <span className="text-[#00FF89] font-semibold">
                                        {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleBulkAction('verify')}
                                        disabled={bulkActionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors text-sm font-medium">
                                        <Shield className="w-4 h-4" />
                                        Verify All
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('test')}
                                        disabled={bulkActionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors text-sm font-medium">
                                        <TestTube className="w-4 h-4" />
                                        Mark Tested
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('approve')}
                                        disabled={bulkActionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#00FF89]/20 text-[#00FF89] hover:bg-[#00FF89]/30 border border-[#00FF89]/30 rounded-lg transition-colors text-sm font-medium">
                                        <Zap className="w-4 h-4" />
                                        Quick Approve
                                    </button>
                                    <button
                                        onClick={() => setSelectedProducts([])}
                                        className="px-4 py-2 bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 border border-gray-600/30 rounded-lg transition-colors text-sm font-medium">
                                        Clear Selection
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Products Grid with Enhanced Design */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="bg-[#1f1f1f] border border-[#00FF89]/10 rounded-xl p-6 animate-pulse">
                                <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
                                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                <div className="h-3 bg-gray-700 rounded mb-4"></div>
                                <div className="flex gap-2">
                                    <div className="h-8 bg-gray-700 rounded flex-1"></div>
                                    <div className="h-8 bg-gray-700 rounded flex-1"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] border border-[#00FF89]/20 rounded-2xl p-12 max-w-md mx-auto">
                            <Package className="w-16 h-16 text-[#00FF89]/60 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-[#00FF89] mb-2">No products found</h3>
                            <p className="text-gray-400">
                                {searchQuery ? 'Try adjusting your search terms' : 'No products match the current filter'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const urgency = getUrgencyLevel(product.createdAt)
                            const isSelected = selectedProducts.includes(product._id)

                            return (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] rounded-xl overflow-hidden border transition-all hover:shadow-xl hover:shadow-[#00FF89]/20 hover:-translate-y-1 ${
                                        isSelected
                                            ? 'border-[#00FF89] shadow-lg shadow-[#00FF89]/30'
                                            : 'border-[#00FF89]/20 hover:border-[#00FF89]/40'
                                    }`}>
                                    {/* Product Image */}
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleProductSelection(product._id)}
                                            className="absolute top-3 left-3 z-10 w-4 h-4 rounded border-[#00FF89]/50 text-[#00FF89] focus:ring-[#00FF89] focus:ring-2 bg-[#1f1f1f]"
                                        />
                                        <div className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${urgency.color} border border-current/30`}>
                                            {urgency.text}
                                        </div>
                                        <OptimizedImage
                                            src={product.thumbnail}
                                            alt={product.title}
                                            width={400}
                                            height={250}
                                            className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                            onClick={() => {
                                                setSelectedProduct(product)
                                                setShowModal(true)
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f]/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5">
                                        <h3 
                                            className="font-bold text-[#00FF89] text-lg mb-2 line-clamp-2 cursor-pointer hover:text-[#00FF89]/80 transition-colors"
                                            onClick={() => {
                                                setSelectedProduct(product)
                                                setShowModal(true)
                                            }}>
                                            {product.title}
                                        </h3>

                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.shortDescription}</p>

                                        {/* Product Stats */}
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3 text-[#FFC050]" />
                                                <span className="text-[#FFC050] font-semibold">
                                                    {product.price === 0 ? 'Free' : `$${product.price}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(product.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Seller Info */}
                                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400 bg-[#121212]/50 p-2 rounded-lg">
                                            <User className="w-4 h-4 text-[#00FF89]" />
                                            <span className="text-gray-300">{product.sellerId?.fullName || 'Unknown Seller'}</span>
                                        </div>

                                        {/* Status Indicators */}
                                        <div className="flex gap-2 mb-4">
                                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                                                product.isVerified 
                                                    ? 'bg-[#00FF89]/20 text-[#00FF89] border-[#00FF89]/30' 
                                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                            }`}>
                                                <Shield className="w-3 h-3" />
                                                {product.isVerified ? 'Verified' : 'Unverified'}
                                            </div>
                                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                                                product.isTested 
                                                    ? 'bg-[#00FF89]/20 text-[#00FF89] border-[#00FF89]/30' 
                                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                            }`}>
                                                <TestTube className="w-3 h-3" />
                                                {product.isTested ? 'Tested' : 'Untested'}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {!product.isVerified && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleProductAction(product._id, 'verify')
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all hover:scale-105 text-sm font-medium">
                                                    <Shield className="w-4 h-4" />
                                                    Verify
                                                </button>
                                            )}

                                            {!product.isTested && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleProductAction(product._id, 'test')
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all hover:scale-105 text-sm font-medium">
                                                    <TestTube className="w-4 h-4" />
                                                    Test
                                                </button>
                                            )}

                                            {(!product.isVerified || !product.isTested) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleProductAction(product._id, 'approve')
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#00FF89]/20 text-[#00FF89] hover:bg-[#00FF89]/30 border border-[#00FF89]/30 rounded-lg transition-all hover:scale-105 text-sm font-medium">
                                                    <Zap className="w-4 h-4" />
                                                    Quick Approve
                                                </button>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedProduct(product)
                                                    setShowModal(true)
                                                }}
                                                className="px-3 py-2 bg-[#1f1f1f]/80 text-[#00FF89] hover:bg-[#2a2a2a] border border-[#00FF89]/30 rounded-lg transition-all hover:scale-105 text-sm font-medium">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* Select All / Clear All with Brand Colors */}
                {!loading && filteredProducts.length > 0 && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={toggleSelectAll}
                            className="px-8 py-3 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#00FF89] border border-[#00FF89]/30 hover:border-[#00FF89] rounded-lg transition-all hover:scale-105 font-medium">
                            {selectedProducts.length === filteredProducts.length ? 'Clear All Selection' : 'Select All Products'}
                        </button>
                    </div>
                )}
            </div>

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
        </div>
    )
}

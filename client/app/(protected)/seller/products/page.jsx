'use client'

import { useState, useEffect } from 'react'
import {
    Plus,
    Package,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    FileJson,
    Send,
    Archive,
    AlertCircle,
    Shield,
    TestTube,
    Clock,
    TrendingUp,
    Star,
    Users,
    CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { productsAPI, sellerAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import ConfirmationModal from '@/components/shared/ui/ConfirmationModal'

export default function SellerProductsPage() {
    const router = useRouter()
    const { data: sellerProfile, loading: profileLoading } = useSellerProfile()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    // Confirmation modal state
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
        total: 0,
        published: 0,
        pending: 0,
        revenue: 0,
        views: 0
    })
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    })

    // Approval status flags
    const isVerificationApproved = sellerProfile?.verificationStatus === 'approved'
    const isCommissionAccepted = sellerProfile?.commissionOffer?.status === 'accepted' && sellerProfile?.commissionOffer?.acceptedAt
    const isFullyApproved = isVerificationApproved && isCommissionAccepted

    // Fetch products once approved
    useEffect(() => {
        if (isFullyApproved) {
            fetchProducts()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, pagination.currentPage, isFullyApproved])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const params = { page: pagination.currentPage, limit: 12 }
            if (filterStatus !== 'all') params.status = filterStatus
            const response = await productsAPI.getMyProducts(params)
            if (response.data) {
                const productsData = response.data.products || []
                setProducts(productsData)
                setPagination(response.data.pagination || pagination)

                // Calculate stats
                setStats({
                    total: productsData.length,
                    published: productsData.filter((p) => p.status === 'published').length,
                    pending: productsData.filter((p) => !p.isVerified || !p.isTested).length,
                    revenue: productsData.reduce((sum, p) => sum + p.price * (p.sales || 0), 0),
                    views: productsData.reduce((sum, p) => sum + (p.views || 0), 0)
                })
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
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
                    toast.success('Product deleted successfully')
                    fetchProducts()
                    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }))
                } catch (error) {
                    console.error('Error deleting product:', error)
                    toast.error('Failed to delete product')
                    setConfirmModal((prev) => ({ ...prev, loading: false }))
                }
            }
        })
    }

    const handlePublishProduct = async (productId, currentStatus, product) => {
        try {
            // Check if trying to publish
            if (currentStatus !== 'published') {
                // Check verification status before publishing
                if (!product.isVerified || !product.isTested) {
                    let message = 'Cannot publish: Product needs '
                    const missing = []
                    if (!product.isVerified) missing.push('admin verification')
                    if (!product.isTested) missing.push('admin testing')
                    message += missing.join(' and ')

                    toast.error(message)
                    return
                }
            }

            const newStatus = currentStatus === 'published' ? 'draft' : 'published'
            await productsAPI.updateProduct(productId, { status: newStatus })
            toast.success(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`)
            fetchProducts()
        } catch (error) {
            console.error('Error updating product status:', error)
            // Check if error is due to verification requirements
            if (error.message?.includes('verified') || error.message?.includes('tested')) {
                toast.error(error.message)
            } else {
                toast.error('Failed to update product status')
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
                    toast.success('Product submitted for review successfully! Admins will be notified.')
                    fetchProducts()
                    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }))
                } catch (error) {
                    console.error('Error submitting product for review:', error)
                    const errorMessage = error.response?.data?.message || error.message || 'Failed to submit product for review'
                    toast.error(errorMessage)
                    setConfirmModal((prev) => ({ ...prev, loading: false }))
                }
            }
        })
    }

    const getStatusBadge = (status, product) => {
        const statusConfig = {
            draft: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: 'Draft' },
            published: { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: 'Published' },
            archived: { color: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'Archived' },
            pending_review: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', text: 'Under Review' }
        }
        const config = statusConfig[status] || statusConfig.draft

        return (
            <div className="space-y-1">
                <span className={`px-2 py-1 text-xs rounded-full ${config.color} border font-medium`}>{config.text}</span>
                {/* Enhanced verification status indicators */}
                {(status === 'draft' || !product.isVerified || !product.isTested) && (
                    <div className="flex flex-col gap-1">
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded ${
                                product.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            <Shield className="w-3 h-3" />
                            {product.isVerified ? 'Verified' : 'Pending Verification'}
                        </div>
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded ${
                                product.isTested ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            <TestTube className="w-3 h-3" />
                            {product.isTested ? 'Tested' : 'Pending Testing'}
                        </div>
                    </div>
                )}
                {product.isVerified && product.isTested && status === 'draft' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-brand-primary/20 text-brand-primary">
                        <Star className="w-3 h-3" />
                        Ready to Publish
                    </div>
                )}
            </div>
        )
    }

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

    const filteredProducts = products.filter(
        (p) =>
            (p?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p?.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const showRestricted = !profileLoading && !isFullyApproved

    if (showRestricted) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
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
        <div className="min-h-screen bg-[#121212]">
            {/* Enhanced Page Header with Stats */}
            <div className="border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Product Dashboard</h1>
                            <p className="text-gray-400 mt-1">Manage and monitor your product portfolio</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/seller/products/addjson"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                                <FileJson className="w-5 h-5" />
                                <span className="font-medium hidden sm:inline">Import JSON</span>
                            </Link>
                            <Link
                                href="/seller/products/create"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00FF89] text-[#121212] rounded-lg hover:bg-[#00FF89]/90 transition-colors font-semibold shadow-lg shadow-[#00FF89]/20">
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">Add Product</span>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-primary/20 rounded-lg">
                                    <Package className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total Products</p>
                                    <p className="text-xl font-bold text-white">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Send className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Published</p>
                                    <p className="text-xl font-bold text-white">{stats.published}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Pending Review</p>
                                    <p className="text-xl font-bold text-white">{stats.pending}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total Revenue</p>
                                    <p className="text-xl font-bold text-white">${stats.revenue}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Eye className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total Views</p>
                                    <p className="text-xl font-bold text-white">{stats.views}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Filters and Search */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-brand-primary appearance-none pr-10">
                                <option value="all">All Products ({stats.total})</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published ({stats.published})</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid/List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Loading Skeletons */}
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
                                <div className="aspect-video bg-gray-800"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                                    <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                                        <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold text-white mb-3">No products found</h3>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            {searchQuery
                                ? 'Try adjusting your search terms or filter settings'
                                : 'Start building your product catalog by creating your first product'}
                        </p>
                        <Link
                            href="/seller/products/create"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-brand-primary-text rounded-lg hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20">
                            <Plus className="w-5 h-5" />
                            <span className="font-semibold">Create Your First Product</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredProducts.map((product) => {
                                const verificationStatus = getVerificationStatusText(product)
                                const StatusIcon = verificationStatus.icon

                                return (
                                    <motion.div
                                        key={product?._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 hover:shadow-xl transition-all group">
                                        <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                            {product?.thumbnail ? (
                                                <OptimizedImage
                                                    src={product?.thumbnail}
                                                    alt={product?.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-16 h-16 text-gray-600" />
                                                </div>
                                            )}

                                            {/* Actions menu - Made functional */}
                                            <div className="absolute top-3 right-3">
                                                <div className="relative group/menu">
                                                    <button className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors">
                                                        <MoreVertical className="w-4 h-4 text-white" />
                                                    </button>
                                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                                                        <Link
                                                            href={`/products/${product?.slug || product?._id || product?.id}`}
                                                            className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-b border-gray-700">
                                                            <Eye className="w-4 h-4" />
                                                            Preview Product
                                                        </Link>
                                                        <Link
                                                            href={`/seller/products/${product?.slug || product?._id || product?.id}/edit`}
                                                            className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-b border-gray-700">
                                                            <Edit2 className="w-4 h-4" />
                                                            Edit Product
                                                        </Link>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handlePublishProduct(product?._id, product?.status, product)
                                                            }}
                                                            disabled={product?.status !== 'published' && (!product?.isVerified || !product?.isTested)}
                                                            className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-700 w-full text-left transition-colors border-b border-gray-700 ${
                                                                product?.status === 'published'
                                                                    ? 'text-orange-400 hover:text-orange-300'
                                                                    : product?.isVerified && product?.isTested
                                                                      ? 'text-green-400 hover:text-green-300'
                                                                      : 'text-gray-500 cursor-not-allowed'
                                                            }`}>
                                                            {product?.status === 'published' ? (
                                                                <>
                                                                    <Archive className="w-4 h-4" />
                                                                    Unpublish
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Send className="w-4 h-4" />
                                                                    {product?.isVerified && product?.isTested
                                                                        ? 'Publish'
                                                                        : 'Publish (Pending Approval)'}
                                                                </>
                                                            )}
                                                        </button>

                                                        {/* Submit for Review button - only show for draft products that haven't been submitted yet */}
                                                        {product?.status === 'draft' && (!product?.isVerified || !product?.isTested) && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleSubmitForReview(product?._id, product?.title)
                                                                }}
                                                                className="flex items-center gap-2 px-4 py-3 text-blue-400 hover:bg-gray-700 hover:text-blue-300 w-full text-left transition-colors border-b border-gray-700">
                                                                <CheckCircle className="w-4 h-4" />
                                                                Submit for Review
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDeleteProduct(product?._id, product?.title)
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-gray-700 hover:text-red-300 w-full text-left transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete Product
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg" />

                                            {/* Quick action overlay */}
                                            <div className="absolute bottom-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                <Link
                                                    href={`/seller/products/${product?.slug || product?._id || product?.id}/edit`}
                                                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors">
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id, product?.title)}
                                                    className="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-600/80 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4 flex-1">
                                            <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-brand-primary transition-colors">
                                                {product?.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product?.shortDescription}</p>

                                            {/* Enhanced Product Stats */}
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>{product?.views || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{product?.sales || 0} sales</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4" />
                                                    <span>{product?.averageRating || 0}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-2xl font-bold text-brand-primary">
                                                    {product?.price === 0 ? 'Free' : `$${product?.price}`}
                                                </span>
                                                {product?.originalPrice && product?.originalPrice > product?.price && (
                                                    <span className="text-sm text-gray-500 line-through">${product?.originalPrice}</span>
                                                )}
                                            </div>

                                            {/* Enhanced Verification Status */}
                                            <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-700">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-300">Approval Status:</span>
                                                    <div className={`flex items-center gap-1 ${verificationStatus.color}`}>
                                                        <StatusIcon className="w-4 h-4" />
                                                        <span className="text-xs font-medium">{verificationStatus.text}</span>
                                                    </div>
                                                </div>

                                                {/* Progress indicators */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-400">Admin Verification</span>
                                                        <span className={product?.isVerified ? 'text-green-400' : 'text-yellow-400'}>
                                                            {product?.isVerified ? '✓ Complete' : '⏳ Pending'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-400">Quality Testing</span>
                                                        <span className={product?.isTested ? 'text-green-400' : 'text-yellow-400'}>
                                                            {product?.isTested ? '✓ Complete' : '⏳ Pending'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Ready to publish indicator */}
                                                {product?.isVerified && product?.isTested && product?.status === 'draft' && (
                                                    <div className="mt-2 p-2 bg-brand-primary/10 border border-brand-primary/20 rounded text-xs text-brand-primary text-center">
                                                        🚀 Ready to publish!
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/seller/products/${product?.slug || product?._id}/edit`}
                                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-center text-sm font-medium">
                                                    Edit
                                                </Link>

                                                {/* Conditional action button based on product status */}
                                                {product?.isVerified && product?.isTested ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handlePublishProduct(product?._id, product?.status, product)
                                                        }}
                                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                                                            product?.status === 'published'
                                                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                        }`}>
                                                        {product?.status === 'published' ? 'Unpublish' : 'Publish'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleSubmitForReview(product?._id, product?.title)
                                                        }}
                                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                                                        Submit for Review
                                                    </button>
                                                )}
                                            </div>

                                            {/* Helpful message for different product states */}
                                            {product?.isVerified && product?.isTested && product?.status === 'draft' && (
                                                <p className="text-xs text-green-400 mt-2 text-center">✓ Product approved and ready to publish</p>
                                            )}
                                            {product?.status === 'draft' && (!product?.isVerified || !product?.isTested) && (
                                                <p className="text-xs text-blue-400 mt-2 text-center">📤 Submit for admin review to get verified</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Enhanced Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-gray-800">
                        <div className="text-sm text-gray-400">
                            Showing {(pagination.currentPage - 1) * 12 + 1} to {Math.min(pagination.currentPage * 12, pagination.totalItems)} of{' '}
                            {pagination.totalItems} products
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                disabled={pagination.currentPage === 1}
                                className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const page = i + 1
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setPagination((prev) => ({ ...prev, currentPage: page }))}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                pagination.currentPage === page
                                                    ? 'bg-brand-primary text-black'
                                                    : 'bg-gray-900 border border-gray-800 text-white hover:bg-gray-800'
                                            }`}>
                                            {page}
                                        </button>
                                    )
                                })}
                            </div>

                            <button
                                onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
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


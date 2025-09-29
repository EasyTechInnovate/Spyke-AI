'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Search, Star, StarOff, Package, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { productsAPI } from '@/lib/api'
import Notification from '@/components/shared/Notification'
import Link from 'next/link'
const PLACEHOLDER_IMG = 'https://placehold.co/600x400/1f1f1f/808080?text=Product'
export default function AdminAllProductsPage() {
    const [notifications, setNotifications] = useState([])
    const pushNotification = useCallback((message, type = 'info', duration = 3000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        setNotifications((prev) => [...prev, { id, type, message, duration }])
    }, [])
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, [])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [pinnedIds, setPinnedIds] = useState(new Set())
    const [suggestions, setSuggestions] = useState([])
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(24)
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        itemsPerPage: 24,
        currentPage: 1
    })
    useEffect(() => {
        fetchProducts(1, limit)
        fetchPinned()
        fetchSuggestions()
    }, [])
    const handleImgError = (e) => {
        e.currentTarget.src = PLACEHOLDER_IMG
    }
    const fetchProducts = async (pageArg = page, limitArg = limit) => {
        try {
            setLoading(true)
            const response = await productsAPI.getAllProductsAdmin({
                page: pageArg,
                limit: limitArg,
                sortBy: 'sales',
                sortOrder: 'desc'
            })
            setProducts(response.data?.products || [])
            if (response.data?.pagination) {
                setPagination(response.data.pagination)
                setPage(response.data.pagination.currentPage || pageArg)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            pushNotification('Failed to load products', 'error')
        } finally {
            setLoading(false)
        }
    }
    const fetchPinned = async () => {
        try {
            const res = await productsAPI.getAdminFeaturedList({ status: 'active', limit: 200 })
            const ids = new Set((res.data || []).map((p) => p._id))
            setPinnedIds(ids)
        } catch (e) {
            console.error('Error fetching featured list:', e)
        }
    }
    const fetchSuggestions = async () => {
        try {
            setLoadingSuggestions(true)
            const res = await productsAPI.getFeaturedSuggestions({ limit: 12, minRating: 3.5, minReviews: 3 })
            setSuggestions(res.data || [])
        } catch (e) {
            console.error('Error fetching suggestions:', e)
        } finally {
            setLoadingSuggestions(false)
        }
    }
    const isFeatured = (id) => pinnedIds.has(id)
    const handleFeatureToggle = async (product, shouldFeature) => {
        try {
            await productsAPI.setProductFeatured(product._id, { isPinned: !!shouldFeature })
            pushNotification(shouldFeature ? 'Product marked as Featured' : 'Product removed from Featured', 'success')
            await fetchPinned()
        } catch (e) {
            console.error('Error updating featured:', e)
            pushNotification('Failed to update featured status', 'error')
        }
    }
    const filteredProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return products
        return products.filter((p) => (p.title || '').toLowerCase().includes(q) || (p.shortDescription || '').toLowerCase().includes(q))
    }, [products, searchQuery])
    return (
        <div className="space-y-6">
            <div className="fixed top-4 right-4 z-[1000] space-y-3">
                {notifications.map((n) => (
                    <Notification
                        key={n.id}
                        id={n.id}
                        type={n.type}
                        message={n.message}
                        duration={n.duration}
                        onClose={removeNotification}
                    />
                ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">All Products</h1>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full">{products.length} total</span>
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full">{pinnedIds.size} featured</span>
                    </div>
                </div>
                <p className="text-gray-400">Browse all products and feature/unfeature items</p>
                <div className="rounded-lg border border-gray-800 bg-gray-950 p-5 md:p-6 flex items-start gap-3 md:gap-4">
                    <div className="p-2.5 md:p-3 rounded-md bg-yellow-500/15 text-yellow-500">
                        <Star className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <div className="text-white font-semibold text-lg md:text-xl">How Featured works</div>
                        <ul className="mt-2 text-gray-300 space-y-1.5 text-base leading-relaxed list-disc list-inside">
                            <li>Featured items are highlighted on the homepage and Explore.</li>
                            <li>Click Feature to add a product; Unfeature to remove it.</li>
                            <li>
                                Use the Suggested to Feature section below for ranked recommendations (sales, rating, reviews, engagement, freshness).
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="pageSize"
                        className="text-sm text-gray-400">
                        Page size
                    </label>
                    <select
                        id="pageSize"
                        value={limit}
                        onChange={(e) => {
                            const newLimit = parseInt(e.target.value)
                            setLimit(newLimit)
                            fetchProducts(1, newLimit)
                        }}
                        className="px-2 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 text-sm">
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                    </select>
                    <button
                        onClick={() => {
                            fetchProducts(page, limit)
                            fetchPinned()
                        }}
                        className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white hover:bg-gray-800 inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                    <p className="text-gray-400">Try adjusting your search</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-gray-900 border rounded-xl overflow-hidden hover:border-gray-700 transition-all ${
                                isFeatured(product._id) ? 'border-yellow-500/50' : 'border-gray-800'
                            }`}>
                            <div className="relative h-48 bg-gray-800 overflow-hidden">
                                <img
                                    src={product.thumbnail || PLACEHOLDER_IMG}
                                    alt={product.title}
                                    className="object-cover w-full h-full block"
                                    loading="lazy"
                                    onError={handleImgError}
                                    referrerPolicy="no-referrer"
                                />
                                {isFeatured(product._id) && (
                                    <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-current" />
                                        Featured
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{product.title}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.shortDescription}</p>
                                <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-white font-semibold">{product.sales || 0}</div>
                                        <div className="text-gray-500 text-xs">Sales</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-semibold">{product.views || 0}</div>
                                        <div className="text-gray-500 text-xs">Views</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-semibold">{product.averageRating?.toFixed?.(1) || '0.0'}</div>
                                        <div className="text-gray-500 text-xs">Rating</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/products/${product.slug}`}
                                        target="_blank"
                                        className="flex-1 text-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm">
                                        View
                                    </Link>
                                    {isFeatured(product._id) ? (
                                        <button
                                            onClick={() => handleFeatureToggle(product, false)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 text-sm">
                                            <StarOff className="w-4 h-4" />
                                            Unfeature
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFeatureToggle(product, true)}
                                            disabled={product.status !== 'PUBLISHED'}
                                            title={product.status !== 'PUBLISHED' ? 'Only published products can be featured' : undefined}
                                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm ${
                                                product.status !== 'PUBLISHED'
                                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            }`}>
                                            <Star className="w-4 h-4" />
                                            Feature
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            <div className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300">
                <div>
                    Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalItems} items
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchProducts(1, limit)}
                        disabled={!pagination.hasPreviousPage}
                        className={`px-3 py-1.5 rounded-lg border ${pagination.hasPreviousPage ? 'border-gray-700 hover:bg-gray-800 text-gray-200' : 'border-gray-800 text-gray-500 cursor-not-allowed'}`}>
                        First
                    </button>
                    <button
                        onClick={() => fetchProducts(Math.max(1, page - 1), limit)}
                        disabled={!pagination.hasPreviousPage}
                        className={`px-3 py-1.5 rounded-lg border ${pagination.hasPreviousPage ? 'border-gray-700 hover:bg-gray-800 text-gray-200' : 'border-gray-800 text-gray-500 cursor-not-allowed'}`}>
                        Prev
                    </button>
                    <button
                        onClick={() => fetchProducts(Math.min(pagination.totalPages, page + 1), limit)}
                        disabled={!pagination.hasNextPage}
                        className={`px-3 py-1.5 rounded-lg border ${pagination.hasNextPage ? 'border-gray-700 hover:bg-gray-800 text-gray-200' : 'border-gray-800 text-gray-500 cursor-not-allowed'}`}>
                        Next
                    </button>
                    <button
                        onClick={() => fetchProducts(pagination.totalPages, limit)}
                        disabled={!pagination.hasNextPage}
                        className={`px-3 py-1.5 rounded-lg border ${pagination.hasNextPage ? 'border-gray-700 hover:bg-gray-800 text-gray-200' : 'border-gray-800 text-gray-500 cursor-not-allowed'}`}>
                        Last
                    </button>
                </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-white">Suggested to Feature</h2>
                    <button
                        onClick={fetchSuggestions}
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 inline-flex items-center gap-2 text-sm">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
                <p className="text-gray-400 mb-4">Algorithmic suggestions based on sales, rating, reviews, engagement and freshness</p>
                {loadingSuggestions ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No suggestions right now</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suggestions.map((product) => (
                            <div
                                key={product._id}
                                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                                <div className="relative h-40 bg-gray-800 overflow-hidden">
                                    <img
                                        src={product.thumbnail || PLACEHOLDER_IMG}
                                        alt={product.title}
                                        className="object-cover w-full h-full block"
                                        loading="lazy"
                                        onError={handleImgError}
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-white font-medium line-clamp-1">{product.title}</h3>
                                        <span className="text-xs text-gray-400">{(product.averageRating || 0).toFixed?.(1)}★</span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2 mt-1">{product.shortDescription}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <button
                                            onClick={() => handleFeatureToggle(product, true)}
                                            disabled={product.status !== 'PUBLISHED'}
                                            title={product.status !== 'PUBLISHED' ? 'Only published products can be featured' : undefined}
                                            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                                product.status !== 'PUBLISHED'
                                                    ? 'bg-yellow-500/10 text-yellow-700/70 cursor-not-allowed opacity-60'
                                                    : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                                            }`}>
                                            <Star className="w-4 h-4" />
                                            Feature
                                        </button>
                                        <Link
                                            href={`/products/${product.slug}`}
                                            target="_blank"
                                            className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 text-sm">
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
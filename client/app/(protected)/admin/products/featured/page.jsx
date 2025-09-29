'use client'
import { useState, useEffect, useCallback } from 'react'
import { Package, Search, Star, StarOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { productsAPI } from '@/lib/api'
import Link from 'next/link'
import Notification from '@/components/shared/Notification'

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/1f1f1f/808080?text=Product'

export default function FeaturedProductsPage() {
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

    useEffect(() => {
        fetchFeatured()
    }, [])

    const handleImgError = (e) => {
        e.currentTarget.src = PLACEHOLDER_IMG
    }

    const fetchFeatured = async () => {
        try {
            setLoading(true)
            const res = await productsAPI.getAdminFeaturedList({ status: 'active', limit: 200 })
            setProducts(res.data || [])
        } catch (error) {
            console.error('Error fetching featured products:', error)
            pushNotification('Failed to load featured products', 'error')
        } finally {
            setLoading(false)
        }
    }

    const unfeature = async (productId) => {
        try {
            await productsAPI.setProductFeatured(productId, { isPinned: false })
            pushNotification('Product removed from Featured', 'success')
            fetchFeatured()
        } catch (error) {
            console.error('Error unfeaturing product:', error)
            pushNotification('Failed to update featured status', 'error')
        }
    }

    const filteredProducts = products.filter(
        (product) =>
            (product.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            (product.shortDescription || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    )

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

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-white">Featured Products</h1>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium">{products.length} featured</span>
                </div>
                <p className="text-gray-400">Manage products featured on the homepage and Explore.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search featured products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-primary"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No featured products</h3>
                    <p className="text-gray-400">Feature products from the All Products page</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 border rounded-xl overflow-hidden hover:border-gray-700 transition-all border-yellow-500/50">
                            <div className="relative h-48 bg-gray-800 overflow-hidden">
                                <img
                                    src={product.thumbnail || PLACEHOLDER_IMG}
                                    alt={product.title}
                                    className="object-cover w-full h-full block"
                                    loading="lazy"
                                    onError={handleImgError}
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-current" />
                                    Featured
                                </div>
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
                                    <button
                                        onClick={() => unfeature(product._id)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 text-sm">
                                        <StarOff className="w-4 h-4" />
                                        Unfeature
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}


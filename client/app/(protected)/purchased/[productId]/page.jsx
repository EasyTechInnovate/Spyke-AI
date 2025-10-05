'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    User,
    Clock,
    Package,
    Settings,
    Wrench,
    Shield,
    MapPin,
    TrendingUp,
    PlayCircle,
    BookOpen,
    Target,
    Code,
    MessageSquare,
    ChevronRight,
    ChevronDown,
    ChevronLeft,
    Sparkles,
    Building,
    Tag,
    BadgeCheck,
    Star,
    Eye,
    Video,
    FileCode,
    FolderOpen,
    Crown,
    Copy,
    Check,
    ExternalLink
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { productsAPI, purchaseAPI } from '@/lib/api'
import Notification from '@/components/shared/Notification'

export default function PurchasedProductPage() {
    const [notifications, setNotifications] = useState([])
    const [product, setProduct] = useState(null)
    const [purchaseDetails, setPurchaseDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedSection, setExpandedSection] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [copiedPrompt, setCopiedPrompt] = useState(false)
    const params = useParams()
    const router = useRouter()
    const productSlug = params.productId
    const { isAuthenticated, loading: authLoading } = useAuth()

    const formatLabel = useCallback((val) => {
        if (!val) return ''
        if (typeof val === 'string') return val.replace(/_/g, ' ')
        if (Array.isArray(val)) {
            return val
                .map((v) => (typeof v === 'string' ? v : v?.name || ''))
                .filter(Boolean)
                .join(', ')
                .replace(/_/g, ' ')
        }
        if (typeof val === 'object') {
            const name = val.name ?? ''
            return String(name).replace(/_/g, ' ')
        }
        return String(val)
    }, [])

    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random()
        const newNotification = { id, message, type }
        setNotifications((prev) => [...prev, newNotification])
    }, [])

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            if (authLoading) {
                return
            }
            if (!isAuthenticated) {
                router.push('/signin')
                return
            }
            try {
                setLoading(true)
                setError(null)
                let productResponse
                try {
                    productResponse = await productsAPI.getProductBySlug(productSlug)
                } catch (slugError) {
                    try {
                        productResponse = await productsAPI.getProductById(productSlug)
                    } catch (idError) {
                        setError('Product not found')
                        return
                    }
                }
                if (!productResponse?.data) {
                    setError('Product not found')
                    return
                }
                setProduct(productResponse.data)
                const purchasesResponse = await purchaseAPI.getUserPurchases()
                const userPurchase = purchasesResponse.purchases?.find(
                    (p) => p.product?._id === productResponse.data._id || p.product?.slug === productSlug
                )
                if (!userPurchase) {
                    router.push(`/products/${productResponse.data.slug || productResponse.data._id}`)
                    return
                }
                setPurchaseDetails(userPurchase)
            } catch (err) {
                console.error('Error fetching data:', err)
                if (err.status === 404) {
                    setError('Product not found')
                } else if (err.status === 403) {
                    addNotification('You do not have access to this product', 'error')
                    router.push('/purchases')
                } else {
                    setError(err.message || 'Failed to load product')
                }
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [productSlug, isAuthenticated, router, addNotification, authLoading])

    const nextImage = () => {
        if (product.images && product.images.length > 0) {
            setSelectedImage((prev) => (prev + 1) % product.images.length)
        }
    }

    const prevImage = () => {
        if (product.images && product.images.length > 0) {
            setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
        }
    }

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedPrompt(true)
            setTimeout(() => setCopiedPrompt(false), 2000)
            addNotification('Copied to clipboard!', 'success')
        } catch (err) {
            console.error('Failed to copy:', err)
            addNotification('Failed to copy', 'error')
        }
    }

    // Check if product has premium content
    const isPremiumContent = product?.type === 'premium' || product?.premiumFeatures?.length > 0

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <div className="fixed inset-0 bg-black"></div>
                <div className="relative z-10">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <div className="pt-24 pb-16">
                            <div className="animate-pulse space-y-8">
                                <div className="h-8 bg-gray-800/50 rounded-xl w-1/4"></div>
                                <div className="grid lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="h-96 bg-gray-800/50 rounded-2xl"></div>
                                        <div className="h-32 bg-gray-800/50 rounded-2xl"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-64 bg-gray-800/50 rounded-2xl"></div>
                                        <div className="h-48 bg-gray-800/50 rounded-2xl"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="fixed inset-0 bg-black"></div>
                <div className="relative z-10 text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-gray-700/50">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">{error || 'Product not found'}</h1>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        The purchased product you're looking for doesn't exist or you don't have access to it.
                    </p>
                    <button
                        onClick={() => router.push('/library')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF89] hover:bg-[#00ee7d] rounded-xl text-black font-semibold transition-all mx-auto">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Library
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Simple Background */}
            <div className="fixed inset-0 bg-black"></div>

            {/* Notifications */}
            <div className="fixed top-25 right-6 z-[70] space-y-3">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <Notification
                            key={notification.id}
                            id={notification.id}
                            type={notification.type}
                            message={notification.message}
                            duration={4000}
                            onClose={removeNotification}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="flex items-center justify-between py-4">
                        <button
                            onClick={() => router.push('/library')}
                            className="group flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                            <span className="text-sm font-medium">Back to Library</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">
                                by{' '}
                                <span className="text-[#00FF89] font-medium">
                                    @{product?.sellerId?.username || product?.sellerId?.fullName || 'creator'}
                                </span>
                            </span>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-full">
                                <CheckCircle className="w-3.5 h-3.5 text-[#00FF89]" />
                                <span className="text-xs text-[#00FF89] font-semibold">Purchased</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="relative z-10 pb-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pt-8">
                    {/* Product Template Section - Prominently displayed at top */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8">
                        {/* Title and badges */}
                        <div className="mb-6">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {isPremiumContent && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-md text-yellow-400 text-xs font-semibold">
                                        <Crown className="w-3 h-3" />
                                        Premium
                                    </span>
                                )}
                                {product.category?.name && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-md text-[#00FF89] text-xs font-medium">
                                        {product.category.name}
                                    </span>
                                )}
                                {product.isVerified && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-md text-blue-400 text-xs font-medium">
                                        <BadgeCheck className="w-3 h-3" />
                                        Verified
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{product.title}</h1>
                            <p className="text-lg text-gray-400 leading-relaxed">{product.shortDescription || product.fullDescription}</p>
                        </div>

                        {/* Product Content/Template Box - Similar to Promptbase */}
                        {(product.fullDescription || product.documentation) && (
                            <div className="relative overflow-hidden rounded-2xl bg-gray-900/60 border border-gray-800 p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#00FF89]" />
                                        Product Details
                                    </h2>
                                    <button
                                        onClick={() => copyToClipboard(product.fullDescription || product.documentation)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-[#00FF89]/50 rounded-lg text-sm text-gray-300 hover:text-[#00FF89] transition-all">
                                        {copiedPrompt ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                <span>Copy details</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="bg-black/40 rounded-xl p-5 border border-gray-800/50">
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {product.fullDescription ||
                                            product.documentation ||
                                            'Full product details and instructions will be available here.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* High Quality Preview Grid - Similar to Promptbase */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Product Preview</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {product.images && product.images.length > 0 ? (
                                    product.images.map((image, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => setSelectedImage(index)}
                                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                                                selectedImage === index
                                                    ? 'border-[#00FF89] ring-2 ring-[#00FF89]/25'
                                                    : 'border-gray-700/50 hover:border-[#00FF89]/50'
                                            }`}>
                                            <img
                                                src={image}
                                                alt={`${product.title} preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>
                                    ))
                                ) : product.thumbnail ? (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#00FF89] ring-2 ring-[#00FF89]/25">
                                        <img
                                            src={product.thumbnail}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                ) : (
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-900/50 border-2 border-gray-700/50 flex items-center justify-center">
                                        <Package className="w-12 h-12 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Access Information Card */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-lg bg-[#00FF89]/10 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-[#00FF89]" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">Full Access</h3>
                                        <p className="text-sm text-gray-400">Lifetime license included</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF89]"></div>
                                        All files
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF89]"></div>
                                        Free updates
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF89]"></div>
                                        24/7 support
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF89]"></div>
                                        Commercial use
                                    </div>
                                </div>
                            </div>

                            {purchaseDetails && (
                                <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-5">
                                    <h3 className="text-base font-semibold text-white mb-4">Purchase Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Price paid</span>
                                            <span className="text-[#00FF89] font-bold text-lg">${product.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Date</span>
                                            <span className="text-white font-medium">
                                                {new Date(purchaseDetails.purchaseDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Order ID</span>
                                            <span className="text-white font-mono text-xs">#{purchaseDetails.purchaseId?.slice(-8) || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Status</span>
                                            <span className="flex items-center gap-1.5 text-green-400 font-medium">
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Additional Sections - Cleaner layout */}
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* What's Included */}
                            {(isPremiumContent || product.benefits || product.fileTypes) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        {isPremiumContent ? (
                                            <Crown className="w-5 h-5 text-yellow-400" />
                                        ) : (
                                            <Package className="w-5 h-5 text-[#00FF89]" />
                                        )}
                                        {isPremiumContent ? 'Premium Content Included' : "What's Included"}
                                    </h3>

                                    <div className="grid gap-3">
                                        {product.fileTypes && product.fileTypes.length > 0 && (
                                            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                                                <FileCode className="w-5 h-5 text-[#00FF89] mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="text-white font-medium text-sm mb-1">Source Files</div>
                                                    <div className="text-gray-400 text-xs">{product.fileTypes.join(', ')}</div>
                                                </div>
                                            </div>
                                        )}

                                        {product.documentation && (
                                            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                                                <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="text-white font-medium text-sm mb-1">Documentation</div>
                                                    <div className="text-gray-400 text-xs">Complete guides and instructions</div>
                                                </div>
                                            </div>
                                        )}

                                        {product.benefits &&
                                            product.benefits.slice(0, 4).map((benefit, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-[#00FF89] mt-0.5 flex-shrink-0" />
                                                    <div className="text-gray-300 text-sm">{benefit}</div>
                                                </div>
                                            ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Implementation Steps */}
                            {product.howItWorks && product.howItWorks.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Code className="w-5 h-5 text-[#00FF89]" />
                                        How to Use
                                    </h3>
                                    <div className="space-y-3">
                                        {product.howItWorks.map((step, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-[#00FF89] flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <p className="text-gray-300 text-sm leading-relaxed pt-1">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Technical Details */}
                            {product.toolsUsed && product.toolsUsed.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-[#00FF89]" />
                                        Tools Used
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {product.toolsUsed.map((tool, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 p-3 bg-black/20 rounded-lg">
                                                {tool.logo && (
                                                    <img
                                                        src={tool.logo}
                                                        alt={tool.name}
                                                        className="w-6 h-6 object-contain"
                                                    />
                                                )}
                                                <span className="text-white text-sm font-medium truncate">{tool.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Creator Card */}
                            {product.sellerId && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FF89] to-blue-500 flex items-center justify-center flex-shrink-0">
                                            <User className="w-6 h-6 text-black" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-semibold truncate">{product.sellerId.fullName || 'Creator'}</div>
                                            <div className="text-gray-400 text-sm">Product Creator</div>
                                        </div>
                                    </div>
                                    {product.sellerId.bio && <p className="text-gray-300 text-sm leading-relaxed mb-4">{product.sellerId.bio}</p>}
                                    {product.sellerId.stats && (
                                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-800">
                                            <div className="text-center">
                                                <div className="text-base font-bold text-[#00FF89]">{product.sellerId.stats.totalProducts || 0}</div>
                                                <div className="text-xs text-gray-400">Products</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-base font-bold text-[#00FF89]">{product.sellerId.stats.totalSales || 0}</div>
                                                <div className="text-xs text-gray-400">Sales</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-base font-bold text-yellow-400">
                                                        {product.sellerId.stats.averageRating || 5.0}
                                                    </span>
                                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                </div>
                                                <div className="text-xs text-gray-400">Rating</div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Support Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-[#00FF89]/5 border border-[#00FF89]/30 rounded-2xl p-5">
                                <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-[#00FF89]" />
                                    Need Help?
                                </h4>
                                <p className="text-gray-300 text-sm mb-4 leading-relaxed">Questions? We're here to help you succeed.</p>
                                <a
                                    href="https://wa.link/7uwiza"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-lg font-semibold text-sm transition-all">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                                    </svg>
                                    WhatsApp Support
                                </a>
                            </motion.div>

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2.5 py-1 bg-black/30 border border-gray-700/50 text-gray-300 rounded-md text-xs">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ExpandableSection({ id, title, icon: Icon, expanded, onToggle, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
            <button
                onClick={() => onToggle(expanded ? null : id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-black/20 transition-colors group">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black/20 group-hover:bg-[#00FF89]/10 rounded-xl flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5 text-[#00FF89]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-800">
                        <div className="p-6">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}


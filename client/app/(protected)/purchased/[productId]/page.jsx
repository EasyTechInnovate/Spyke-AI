'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Heart,
    Share2,
    Download,
    FileText,
    CheckCircle,
    User,
    Clock,
    Package,
    ExternalLink,
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
    Copy,
    ExternalLinkIcon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { productsAPI, purchaseAPI } from '@/lib/api'
function ShareButton({ product, onNotification }) {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const shareUrl = typeof window !== 'undefined' ? window.location.href.replace('/purchased/', '/products/') : ''
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            onNotification('Link copied to clipboard!', 'success')
            setTimeout(() => {
                setCopied(false)
                setIsOpen(false)
            }, 2000)
        } catch (err) {
            onNotification('Failed to copy link', 'error')
        }
    }
    const shareOptions = [
        {
            name: 'Copy Link',
            icon: Copy,
            action: handleCopyLink,
            color: 'text-white'
        }
    ]
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-600/30 w-full">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-2 shadow-2xl z-50">
                            <div className="space-y-1">
                                {shareOptions.map((option, index) => {
                                    const IconComponent = option.icon
                                    return (
                                        <button
                                            key={option.name}
                                            onClick={option.action}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-700/50 rounded-xl transition-colors group">
                                            <IconComponent className={`w-4 h-4 ${option.color} group-hover:scale-110 transition-transform`} />
                                            <span className="text-white text-sm font-medium">
                                                {option.name === 'Copy Link' && copied ? 'Copied!' : option.name}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
export default function PurchasedProductPage() {
    const [notifications, setNotifications] = useState([])
    const [product, setProduct] = useState(null)
    const [purchaseDetails, setPurchaseDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [expandedSection, setExpandedSection] = useState('overview')
    const [selectedImage, setSelectedImage] = useState(0)
    const [liked, setLiked] = useState(false)
    const [showCopied, setShowCopied] = useState(false)
    const params = useParams()
    const router = useRouter()
    const productSlug = params.productId
    const { user, isAuthenticated, loading: authLoading } = useAuth()
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
    const handleBack = useCallback(() => {
        router.push('/purchases')
    }, [router])
    const handleDownload = useCallback(async () => {
        try {
            if (product.files && product.files.length > 0) {
                addNotification('Downloading product files...', 'success')
                setExpandedSection('implementation')
                document.querySelector('#product-tabs')?.scrollIntoView({ behavior: 'smooth' })
            } else if (product.accessUrl) {
                window.open(product.accessUrl, '_blank')
                addNotification('Opening product access link...', 'info')
            } else {
                setExpandedSection('implementation')
                document.querySelector('#product-tabs')?.scrollIntoView({ behavior: 'smooth' })
                addNotification('View the implementation guide below to get started', 'info')
            }
        } catch (error) {
            addNotification('Failed to access product resources', 'error')
        }
    }, [product, addNotification])
    const handleShare = useCallback(async () => {
        const url = typeof window !== 'undefined' ? window.location.href.replace('/purchased/', '/products/') : ''
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.title,
                    text: product?.shortDescription,
                    url
                })
            } catch (err) {
            }
        } else if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url)
                setShowCopied(true)
                setTimeout(() => setShowCopied(false), 2000)
                addNotification('Link copied to clipboard!', 'success')
            } catch (err) {
                addNotification('Unable to copy link', 'error')
            }
        }
    }, [product, addNotification])
    const handleLike = useCallback(async () => {
        try {
            setLiked(!liked)
            await productsAPI.toggleFavorite(product._id, !liked)
            addNotification(liked ? 'Removed from favorites' : 'Added to favorites', 'success')
        } catch (error) {
            setLiked(liked)
            addNotification('Failed to update favorite', 'error')
        }
    }, [liked, product, addNotification])
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black via-slate-950 to-slate-950"></div>
                <div className="relative z-10">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <div className="pt-24 pb-16">
                            <div className="animate-pulse space-y-8">
                                <div className="h-8 bg-slate-800/50 rounded-xl w-1/4"></div>
                                <div className="grid lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="h-96 bg-slate-800/50 rounded-2xl"></div>
                                        <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-64 bg-slate-800/50 rounded-2xl"></div>
                                        <div className="h-48 bg-slate-800/50 rounded-2xl"></div>
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
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black via-slate-950 to-slate-950"></div>
                <div className="relative z-10 text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-slate-700/50">
                        <Package className="w-10 h-10 text-slate-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">{error || 'Product not found'}</h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        The purchased product you're looking for doesn't exist or you don't have access to it.
                    </p>
                    <button
                        onClick={() => router.push('/purchases')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 rounded-lg text-white font-medium transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Purchases
                    </button>
                </div>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black via-slate-950 to-slate-950"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#00FF89]/10 via-transparent to-transparent"></div>
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -100, scale: 0.9 }}
                        className="fixed top-6 right-6 z-50 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-2xl max-w-sm">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-black'
                                }`}
                            />
                            <p className="text-white text-sm font-medium">{notification.message}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div className="relative z-10">
                <div className="fixed top-0 left-0 right-0 z-[60] bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <div className="flex items-center gap-2 py-4">
                            <button
                                onClick={() => router.push('/library')}
                                className="group inline-flex items-center gap-2 px-4 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="text-base font-medium">Back to Library</span>
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                            <span className="text-base font-medium text-white truncate">{product?.title || 'Loading...'}</span>
                        </div>
                    </div>
                </div>
                <main className="pt-10 pb-20 relative z-10">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <div className="mb-6 lg:mb-8">
                            <button
                                onClick={() => router.push('/purchases')}
                                className="w-full max-w-xs bg-[#00FF89] hover:bg-[#00FF89]/90 text-black font-bold text-lg py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl">
                                <ArrowLeft className="w-5 h-5" />
                                <span>Back to Library</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/5 to-black/5"></div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00FF89]/10 to-transparent rounded-full blur-2xl"></div>
                                    <div className="relative z-10">
                                        <div className="mb-6 lg:mb-8 pt-4">
                                            <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl lg:rounded-2xl overflow-hidden relative group border border-slate-700/30">
                                                {product.thumbnail ? (
                                                    <img
                                                        src={product.thumbnail}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none'
                                                            e.target.nextSibling.style.display = 'flex'
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    className="w-full h-full flex items-center justify-center"
                                                    style={{ display: product.thumbnail ? 'none' : 'flex' }}>
                                                    <Package className="w-20 h-20 text-slate-600" />
                                                </div>
                                                {product.previewVideo && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <button
                                                            onClick={() => window.open(product.previewVideo, '_blank')}
                                                            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                                            <PlayCircle className="w-10 h-10 text-white" />
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-4 py-2 bg-black/60 backdrop-blur-sm text-white border border-white/20 rounded-xl text-sm font-semibold capitalize">
                                                        {product.type}
                                                    </span>
                                                </div>
                                            </div>
                                            {product.images && product.images.length > 0 && (
                                                <div className="flex gap-2 lg:gap-3 mt-3 lg:mt-4 overflow-x-auto pb-2 scrollbar-hide">
                                                    {product.images.slice(0, 6).map((image, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedImage(index)}
                                                            className={`w-16 h-16 lg:w-20 lg:h-20 rounded-lg lg:rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                                                                selectedImage === index
                                                                    ? 'border-emerald-400'
                                                                    : 'border-slate-600 hover:border-slate-500'
                                                            }`}>
                                                            <img
                                                                src={image}
                                                                alt={`${product.title} ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-4 lg:space-y-6">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                                                    <span className="px-2 py-1 lg:px-3 bg-black/10 text-white border border-black/20 rounded-lg text-xs lg:text-sm font-medium capitalize">
                                                        {product.category?.replace('_', ' ')}
                                                    </span>
                                                    <span className="px-2 py-1 lg:px-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs lg:text-sm font-medium capitalize">
                                                        {product.industry?.replace('_', ' ')}
                                                    </span>
                                                    {product.isVerified && (
                                                        <span className="px-2 py-1 lg:px-3 bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/20 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-1">
                                                            <Shield className="w-3 h-3" />
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 lg:mb-4 leading-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                                    {product.title}
                                                </h1>
                                                <p className="text-base lg:text-xl text-slate-300 leading-relaxed">
                                                    {product.shortDescription || product.fullDescription}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                                                <div className="text-center p-3 lg:p-4 bg-slate-700/30 rounded-xl lg:rounded-2xl border border-slate-600/30">
                                                    <div className="text-lg lg:text-2xl font-bold text-[#00FF89]">{product.views || 0}</div>
                                                    <div className="text-slate-400 text-xs lg:text-sm">Views</div>
                                                </div>
                                                <div className="text-center p-3 lg:p-4 bg-slate-700/30 rounded-xl lg:rounded-2xl border border-slate-600/30">
                                                    <div className="text-lg lg:text-2xl font-bold text-white">{product.sales || 0}</div>
                                                    <div className="text-slate-400 text-xs lg:text-sm">Sales</div>
                                                </div>
                                                <div className="text-center p-3 lg:p-4 bg-slate-700/30 rounded-xl lg:rounded-2xl border border-slate-600/30">
                                                    <div className="text-lg lg:text-2xl font-bold text-purple-400">
                                                        {product.averageRating > 0 ? `${product.averageRating}★` : 'New'}
                                                    </div>
                                                    <div className="text-slate-400 text-xs lg:text-sm">Rating</div>
                                                </div>
                                                <div className="text-center p-3 lg:p-4 bg-slate-700/30 rounded-xl lg:rounded-2xl border border-slate-600/30">
                                                    <div className="text-lg lg:text-2xl font-bold text-orange-400">
                                                        v{product.currentVersion || '1.0'}
                                                    </div>
                                                    <div className="text-slate-400 text-xs lg:text-sm">Version</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                <div className="space-y-3 lg:space-y-4">
                                    <ExpandableSection
                                        id="overview"
                                        title="What's Included"
                                        icon={BookOpen}
                                        expanded={expandedSection === 'overview'}
                                        onToggle={setExpandedSection}>
                                        <div className="space-y-6">
                                            <div className="prose prose-slate prose-invert max-w-none">
                                                <p className="text-slate-300 text-lg leading-relaxed">
                                                    {product.fullDescription || product.shortDescription || 'No detailed description available.'}
                                                </p>
                                            </div>
                                            {product.benefits && product.benefits.length > 0 && (
                                                <div>
                                                    <h4 className="text-xl font-semibold text-white mb-4">Key Benefits</h4>
                                                    <div className="grid gap-3">
                                                        {product.benefits.map((benefit, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                                                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                                <span className="text-slate-300">{benefit}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {product.useCaseExamples && product.useCaseExamples.length > 0 && (
                                                <div>
                                                    <h4 className="text-xl font-semibold text-white mb-4">Use Cases</h4>
                                                    <div className="grid gap-3">
                                                        {product.useCaseExamples.map((useCase, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-start gap-3 p-4 bg-black/5 border border-black/20 rounded-xl">
                                                                <Target className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                                                                <span className="text-slate-300">{useCase}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ExpandableSection>
                                    <ExpandableSection
                                        id="implementation"
                                        title="Implementation Guide"
                                        icon={Code}
                                        expanded={expandedSection === 'implementation'}
                                        onToggle={setExpandedSection}>
                                        <div className="space-y-6">
                                            {product.howItWorks && product.howItWorks.length > 0 ? (
                                                <div className="space-y-4">
                                                    {product.howItWorks.map((step, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex gap-4 p-6 bg-slate-700/30 rounded-2xl border border-slate-600/30">
                                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-lg font-semibold text-white mb-2">Step {index + 1}</h5>
                                                                <p className="text-slate-300">{step}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Settings className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                                    <p className="text-slate-400">Implementation guide will be available soon.</p>
                                                </div>
                                            )}
                                            {product.setupTime && (
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Clock className="w-5 h-5 text-emerald-400" />
                                                        <h5 className="text-lg font-semibold text-emerald-400">Setup Time</h5>
                                                    </div>
                                                    <p className="text-slate-300">
                                                        Estimated setup time:{' '}
                                                        <span className="font-semibold text-white">{product.setupTime.replace('_', ' ')}</span>
                                                    </p>
                                                </div>
                                            )}
                                            {product.outcome && product.outcome.length > 0 && (
                                                <div>
                                                    <h4 className="text-xl font-semibold text-white mb-4">Expected Outcomes</h4>
                                                    <div className="grid sm:grid-cols-2 gap-3">
                                                        {product.outcome.map((outcome, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                                                <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                                <span className="text-slate-300 text-sm">{outcome}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ExpandableSection>
                                    <ExpandableSection
                                        id="technical"
                                        title="Technical Specifications"
                                        icon={Wrench}
                                        expanded={expandedSection === 'technical'}
                                        onToggle={setExpandedSection}>
                                        <div className="space-y-6">
                                            {product.toolsUsed && product.toolsUsed.length > 0 && (
                                                <div>
                                                    <h4 className="text-xl font-semibold text-white mb-4">Tools & Technologies</h4>
                                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {product.toolsUsed.map((tool, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                                                                <img
                                                                    src={tool.logo}
                                                                    alt={tool.name}
                                                                    className="w-8 h-8 object-contain rounded"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none'
                                                                        e.target.nextSibling.style.display = 'flex'
                                                                    }}
                                                                />
                                                                <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center hidden">
                                                                    <Settings className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-white font-medium">{tool.name}</div>
                                                                    {tool.model && <div className="text-slate-400 text-xs">{tool.model}</div>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                                                    <div className="text-slate-400 text-sm mb-1">Target Audience</div>
                                                    <div className="text-white font-semibold">{product.targetAudience || 'General'}</div>
                                                </div>
                                                <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                                                    <div className="text-slate-400 text-sm mb-1">Industry</div>
                                                    <div className="text-white font-semibold capitalize">
                                                        {product.industry?.replace('_', ' ') || 'General'}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                                                    <div className="text-slate-400 text-sm mb-1">Version</div>
                                                    <div className="text-white font-semibold">v{product.currentVersion || '1.0.0'}</div>
                                                </div>
                                                <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                                                    <div className="text-slate-400 text-sm mb-1">Status</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                                        <span className="text-emerald-400 font-semibold">Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </ExpandableSection>
                                </div>
                            </div>
                            <div className="order-first lg:order-last lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-hidden">
                                <div className="space-y-4 lg:space-y-6 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm border border-emerald-500/20 rounded-2xl lg:rounded-3xl p-4 lg:p-6">
                                        <div className="text-center mb-4 lg:mb-6">
                                            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-500/20 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                                                <Download className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
                                            </div>
                                            <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">Ready to Use</h3>
                                            <p className="text-slate-400 text-sm lg:text-base">Access your purchased product instantly</p>
                                        </div>
                                        <div className="text-center mb-4 lg:mb-6 p-3 lg:p-4 bg-slate-800/50 rounded-xl lg:rounded-2xl border border-slate-700/50">
                                            <div className="text-2xl lg:text-3xl font-bold text-emerald-400 mb-1">${product.price}</div>
                                            <div className="text-slate-500 text-xs lg:text-sm mt-2">One-time purchase</div>
                                        </div>
                                        {purchaseDetails && (
                                            <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-slate-800/30 rounded-xl lg:rounded-2xl border border-slate-700/30">
                                                <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Purchase Date</span>
                                                        <span className="text-white font-medium">
                                                            {new Date(purchaseDetails.purchaseDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Order ID</span>
                                                        <span className="text-white font-medium">
                                                            #{purchaseDetails.purchaseId?.slice(-8) || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">License</span>
                                                        <span className="text-emerald-400 font-medium">Lifetime</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2 lg:gap-3">
                                                <button
                                                    onClick={handleLike}
                                                    className="px-3 py-2 lg:px-4 lg:py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg lg:rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-600/30">
                                                    <Heart className={`w-4 h-4 ${liked ? 'fill-current text-red-400' : ''}`} />
                                                    <span className="text-xs lg:text-sm">{liked ? 'Liked' : 'Like'}</span>
                                                </button>
                                                <ShareButton
                                                    product={product}
                                                    onNotification={addNotification}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                    {product.sellerId && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6">
                                            <h4 className="text-lg font-semibold text-white mb-4">Created by</h4>
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-black rounded-xl flex items-center justify-center">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-white font-semibold">{product.sellerId.fullName || 'Anonymous Seller'}</div>
                                                    <div className="text-slate-400 text-sm">Product Creator</div>
                                                    {product.sellerId.location?.country && (
                                                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{product.sellerId.location.country}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {product.sellerId.bio && (
                                                <p className="text-slate-300 text-sm mb-4 line-clamp-3">{product.sellerId.bio}</p>
                                            )}
                                            {product.sellerId.stats && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                                                        <div className="text-emerald-400 font-bold">{product.sellerId.stats.totalSales}</div>
                                                        <div className="text-slate-400 text-xs">Sales</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                                                        <div className="text-white font-bold">{product.sellerId.stats.averageRating}★</div>
                                                        <div className="text-slate-400 text-xs">Rating</div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6">
                                        <h4 className="text-lg font-semibold text-white mb-4">Need Help?</h4>
                                        <div className="space-y-3">
                                            <button className="w-full flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-colors text-left">
                                                <MessageSquare className="w-5 h-5 text-white" />
                                                <div>
                                                    <div className="text-white font-medium text-sm">Contact Support</div>
                                                    <div className="text-slate-400 text-xs">Get help with this product</div>
                                                </div>
                                            </button>
                                            <button className="w-full flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-colors text-left">
                                                <FileText className="w-5 h-5 text-emerald-400" />
                                                <div>
                                                    <div className="text-white font-medium text-sm">Documentation</div>
                                                    <div className="text-slate-400 text-xs">View user guides</div>
                                                </div>
                                            </button>
                                            <button className="w-full flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-colors text-left">
                                                <ExternalLinkIcon className="w-5 h-5 text-purple-400" />
                                                <div>
                                                    <div className="text-white font-medium text-sm">View Original</div>
                                                    <div className="text-slate-400 text-xs">See public product page</div>
                                                </div>
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
function ExpandableSection({ id, title, icon: Icon, expanded, onToggle, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden">
            <button
                onClick={() => onToggle(expanded ? null : id)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700/50 rounded-2xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                </div>
                <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-700/50">
                        <div className="p-6 pt-6 mt-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
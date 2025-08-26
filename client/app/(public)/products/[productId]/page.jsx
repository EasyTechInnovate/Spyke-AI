'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Share2, ShoppingCart, Download, ThumbsUp, BookOpen, Sparkles, Play, HelpCircle, BarChart3, Package } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { productsAPI, promocodeAPI } from '@/lib/api'
import { DESIGN_TOKENS, DSContainer, DSHeading, DSText, DSButton, DSLoadingState } from '@/lib/design-system'
import ProductOverview from '@/components/product/ProductOverview'
import ProductFeatures from '@/components/product/ProductFeatures'
import ProductHowItWorks from '@/components/product/ProductHowItWorks'
import ProductSpecs from '@/components/product/ProductSpecs'
import ProductFAQ from '@/components/product/ProductFAQ'
import { Header } from '@/components/shared/layout'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb'
import ProductHero from '@/components/product/ProductHero'

const PRODUCT_TABS = [
    {
        id: 'overview',
        label: 'Overview',
        icon: BookOpen,
        description: 'Product details and benefits',
        component: ProductOverview
    },
    {
        id: 'features',
        label: 'Features',
        icon: Sparkles,
        description: 'Key capabilities and highlights',
        component: ProductFeatures
    },
    {
        id: 'how-it-works',
        label: 'How It Works',
        icon: Play,
        description: 'Step-by-step process',
        component: ProductHowItWorks
    },
    {
        id: 'specs',
        label: 'Specifications',
        icon: BarChart3,
        description: 'Technical details',
        component: ProductSpecs
    },
    {
        id: 'faq',
        label: 'FAQ',
        icon: HelpCircle,
        description: 'Common questions',
        component: ProductFAQ
    }
]

// Helper function to safely convert any value to string
const safeToString = (value) => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
        if (value.country) return value.country
        if (value.timezone) return value.timezone
        if (value.name) return value.name
        return ''
    }
    return String(value)
}

// Safe data processing
const getSafeSellerData = (data) => {
    if (!data) return null

    return {
        ...data,
        fullName: safeToString(data.fullName) || 'Unknown Seller',
        username: safeToString(data.username) || 'user',
        bio: safeToString(data.bio) || '',
        location: safeToString(data.location) || '',
        timezone: safeToString(data.timezone) || '',
        website: safeToString(data.website) || '',
        email: safeToString(data.email) || '',
        stats: {
            ...data.stats,
            responseTime: safeToString(data.stats?.responseTime) || 'N/A',
            responseRate: safeToString(data.stats?.responseRate) || 'N/A'
        }
    }
}

export default function ProductPage() {
    // Inline notification state
    const [notification, setNotification] = useState(null)

    // Show inline notification messages
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }

    // Clear notification
    const clearNotification = () => setNotification(null)

    const params = useParams()
    const router = useRouter()
    const productSlug = params.productId
    const { isAuthenticated, requireAuth } = useAuth()
    const { addToCart, isInCart, loading: cartLoading } = useCart()

    // Core state
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [mounted, setMounted] = useState(false)

    // UI state
    const [selectedImage, setSelectedImage] = useState(0)
    const [liked, setLiked] = useState(false)
    const [upvoted, setUpvoted] = useState(false)
    const [isUpvoting, setIsUpvoting] = useState(false)
    const [showCopied, setShowCopied] = useState(false)
    const [showStickyBar, setShowStickyBar] = useState(false)

    // Tab state
    const [activeTab, setActiveTab] = useState('overview')

    // Data state
    const [relatedProducts, setRelatedProducts] = useState([])
    const [availablePromocodes, setAvailablePromocodes] = useState([])

    // Refs
    const ctaRef = useRef(null)

    // Computed values
    const discountPercentage = useMemo(() => {
        if (!product || product.originalPrice <= product.price) return 0
        return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    }, [product])

    const inCart = useMemo(() => {
        if (!mounted || !product || !isInCart || cartLoading) return false
        try {
            return isInCart(product._id) || isInCart(product.id)
        } catch (error) {
            return false
        }
    }, [mounted, product, isInCart, cartLoading])

    const savingsAmount = useMemo(() => {
        if (!product || !product.originalPrice) return 0
        return Math.round(product.originalPrice - product.price)
    }, [product])

    const hasPurchased = useMemo(() => {
        return product?.userAccess?.hasPurchased || false
    }, [product])

    const isOwner = useMemo(() => {
        return product?.userAccess?.isOwner || false
    }, [product])

    // Handle hydration and scroll effects
    useEffect(() => {
        setMounted(true)
    }, [])

    // Handle scroll for sticky bar
    useEffect(() => {
        if (!mounted || !ctaRef.current) return

        const handleScroll = () => {
            const ctaRect = ctaRef.current?.getBoundingClientRect()
            setShowStickyBar(ctaRect && ctaRect.bottom < 0)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [mounted])

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await productsAPI.getProductBySlug(productSlug)

                if (response && response.data) {
                    setProduct(response.data)

                    // Fetch related products
                    if (response.data._id) {
                        try {
                            const relatedResponse = await productsAPI.getRelatedProducts(response.data._id, 4)
                            if (relatedResponse && relatedResponse.data) {
                                setRelatedProducts(relatedResponse.data)
                            }
                        } catch (relatedError) {
                            console.warn('Failed to fetch related products:', relatedError)
                        }
                    }

                    // Fetch available promocodes
                    try {
                        const promoResponse = await promocodeAPI.getPublicPromocodes({
                            status: 'active',
                            limit: 5
                        })
                        if (promoResponse?.promocodes) {
                            const applicablePromos = promoResponse.promocodes.filter((promo) => {
                                if (!promo.applicableProducts || promo.applicableProducts.length === 0) {
                                    return true
                                }
                                return promo.applicableProducts.includes(response.data._id)
                            })
                            setAvailablePromocodes(applicablePromos)
                        }
                    } catch (promoError) {
                        console.warn('Failed to fetch promocodes:', promoError)
                    }
                } else {
                    console.error('No product data in response:', response)
                    setError('Product not found')
                }
            } catch (err) {
                console.error('Error fetching product:', err)
                if (err.status === 404) {
                    setError('Product not found')
                } else if (err.networkError) {
                    setError('Network error. Please check your connection.')
                } else {
                    setError(err.message || 'Failed to load product')
                }
            } finally {
                setLoading(false)
            }
        }

        if (productSlug) {
            fetchProduct()
        }
    }, [productSlug])

    // Event handlers
    const handleBack = useCallback(() => {
        router.back()
    }, [router])

    const handleAddToCart = useCallback(async () => {
        if (!product) return

        if (hasPurchased) {
            showMessage('You already own this product', 'info')
            return
        }
        if (isOwner) {
            showMessage("You can't add your own product to cart", 'info')
            return
        }

        const alreadyInCart = mounted && !cartLoading && isInCart && (isInCart(product._id) || isInCart(product.id))
        if (alreadyInCart) {
            showMessage('Product is already in cart', 'info')
            return
        }

        const cartProduct = {
            id: product._id,
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice,
            thumbnail: product.thumbnail,
            seller: product.sellerId,
            type: product.type,
            category: product.category,
            description: product.shortDescription || product.description,
            image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.thumbnail
        }

        try {
            await addToCart(cartProduct)
        } catch (error) {
            console.log('🚨 Unexpected error in handleAddToCart:', error)
            showMessage('Failed to add to cart', 'error')
        }
    }, [product, hasPurchased, isOwner, mounted, cartLoading, isInCart, addToCart, showMessage])

    const handleBuyNow = useCallback(async () => {
        if (hasPurchased) {
            showMessage('You already own this product', 'info')
            return
        }

        if (isOwner) {
            showMessage("You can't purchase your own product", 'info')
            return
        }

        if (product) {
            const alreadyInCart = mounted && !cartLoading && isInCart && (isInCart(product._id) || isInCart(product.id))

            if (!alreadyInCart) {
                const cartProduct = {
                    id: product._id,
                    title: product.title,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    thumbnail: product.thumbnail,
                    seller: product.sellerId,
                    type: product.type,
                    category: product.category,
                    description: product.shortDescription || product.description,
                    image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.thumbnail
                }

                try {
                    const success = await addToCart(cartProduct)
                    if (!success) return
                } catch (error) {
                    console.log('🚨 Unexpected error in handleBuyNow:', error)
                    showMessage('An unexpected error occurred', 'error')
                    return
                }
            }

            router.push('/checkout')
        }
    }, [product, addToCart, router, mounted, cartLoading, isInCart, hasPurchased, isOwner, showMessage])

    const handleLike = useCallback(async () => {
        if (!isAuthenticated) {
            requireAuth()
            return
        }

        try {
            setLiked(!liked)
            await productsAPI.toggleFavorite(product._id, !liked)
        } catch (error) {
            setLiked(liked)
            showMessage('Failed to update favorite', 'error')
        }
    }, [isAuthenticated, liked, product, requireAuth, showMessage])

    const handleUpvote = useCallback(async () => {
        if (!isAuthenticated) {
            requireAuth()
            return
        }

        if (!product || isUpvoting) return

        setIsUpvoting(true)
        const newUpvoted = !upvoted

        try {
            setUpvoted(newUpvoted)
            await productsAPI.toggleUpvote(product._id, { isUpvoted: newUpvoted })

            setProduct((prevProduct) => ({
                ...prevProduct,
                upvotes: newUpvoted ? (prevProduct.upvotes || 0) + 1 : Math.max(0, (prevProduct.upvotes || 0) - 1)
            }))

            showMessage(newUpvoted ? 'Upvoted!' : 'Removed upvote', 'success')
        } catch (error) {
            setUpvoted(!newUpvoted)
            showMessage('Failed to update upvote', 'error')
        } finally {
            setIsUpvoting(false)
        }
    }, [isAuthenticated, upvoted, product, requireAuth, isUpvoting, showMessage])

    const handleDownload = useCallback(async () => {
        if (!hasPurchased) {
            showMessage('You need to purchase this product first', 'error')
            return
        }

        try {
            router.push('/purchases')
            showMessage('Redirected to your purchases', 'success')
        } catch (error) {
            showMessage('Failed to access downloads', 'error')
        }
    }, [hasPurchased, router, showMessage])

    const handleShare = useCallback(async () => {
        if (!mounted) return

        const url = typeof window !== 'undefined' ? window.location.href : ''

        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.title,
                    text: product?.shortDescription,
                    url
                })
            } catch (err) {
                // Share cancelled
            }
        } else if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url)
                setShowCopied(true)
                setTimeout(() => setShowCopied(false), 2000)
                showMessage('Link copied to clipboard!', 'success')
            } catch (err) {
                showMessage('Unable to copy link', 'error')
            }
        } else {
            showMessage(`Share this link: ${url}`, 'info')
        }
    }, [mounted, product, showMessage])

    // Loading state
    if (loading) {
        return (
            <div
                className="min-h-screen"
                style={{ backgroundColor: DESIGN_TOKENS.colors.background.dark }}>
                {notification && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                        <InlineNotification
                            type={notification.type}
                            message={notification.message}
                            onDismiss={clearNotification}
                        />
                    </div>
                )}

                <Header />
                <DSContainer
                    maxWidth="hero"
                    padding="responsive">
                    <div
                        className="pt-20 pb-4 border-b"
                        style={{ borderColor: DESIGN_TOKENS.colors.background.elevated }}>
                        <DSLoadingState
                            type="skeleton"
                            width="16rem"
                            height="1.5rem"
                        />
                    </div>
                    <div className="py-8 lg:py-12">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                            <div className="space-y-4">
                                <DSLoadingState
                                    type="skeleton"
                                    width="100%"
                                    height="400px"
                                    className="rounded-2xl"
                                />
                                <div className="grid grid-cols-5 gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <DSLoadingState
                                            key={i}
                                            type="skeleton"
                                            width="100%"
                                            height="80px"
                                            className="rounded-lg"
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <DSLoadingState
                                        type="skeleton"
                                        width="8rem"
                                        height="2rem"
                                    />
                                    <DSLoadingState
                                        type="skeleton"
                                        width="75%"
                                        height="2.5rem"
                                    />
                                    <DSLoadingState
                                        type="skeleton"
                                        width="100%"
                                        height="1.5rem"
                                    />
                                </div>
                                <div
                                    className="rounded-2xl p-6 border space-y-4"
                                    style={{
                                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                        borderColor: DESIGN_TOKENS.colors.background.elevated
                                    }}>
                                    <DSLoadingState
                                        type="skeleton"
                                        width="10rem"
                                        height="3rem"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        {[...Array(4)].map((_, i) => (
                                            <DSLoadingState
                                                key={i}
                                                type="skeleton"
                                                width="100%"
                                                height="1rem"
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[...Array(2)].map((_, i) => (
                                            <DSLoadingState
                                                key={i}
                                                type="skeleton"
                                                width="100%"
                                                height="2.75rem"
                                                className="rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DSContainer>
            </div>
        )
    }

    // Error state
    if (error || !product) {
        return (
            <div
                className="min-h-screen"
                style={{ backgroundColor: DESIGN_TOKENS.colors.background.dark }}>
                <Header />
                <DSContainer
                    maxWidth="hero"
                    padding="responsive">
                    <div className="pt-24 pb-16 text-center">
                        <DSHeading
                            level={1}
                            className="mb-4"
                            style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                            {error || 'Product not found'}
                        </DSHeading>
                        <DSText
                            className="mb-8"
                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                            The product you're looking for doesn't exist.
                        </DSText>
                        <DSButton
                            variant="primary"
                            onClick={handleBack}>
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </DSButton>
                    </div>
                </DSContainer>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <div
                className="min-h-screen"
                style={{ backgroundColor: DESIGN_TOKENS.colors.background.dark, fontFamily: DESIGN_TOKENS.typography.fontFamily.body }}>
                {/* Fixed Inline Notification */}
                {notification && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                        <InlineNotification
                            type={notification.type}
                            message={notification.message}
                            onDismiss={clearNotification}
                        />
                    </div>
                )}

                <Header />

                <main className="relative">
                    {/* Breadcrumb Navigation */}
                    <ProductBreadcrumb product={product} />

                    {/* Product Hero Section - Use ProductHero component for all screen sizes */}
                    <section className="relative -mt-4">
                        <ProductHero
                            product={product}
                            selectedImage={selectedImage}
                            setSelectedImage={setSelectedImage}
                            liked={liked}
                            upvoted={upvoted}
                            isUpvoting={isUpvoting}
                            showCopied={showCopied}
                            hasPurchased={hasPurchased}
                            isOwner={isOwner}
                            inCart={inCart}
                            discountPercentage={discountPercentage}
                            savingsAmount={savingsAmount}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            onLike={handleLike}
                            onUpvote={handleUpvote}
                            onDownload={handleDownload}
                            onShare={handleShare}
                            ctaRef={ctaRef}
                        />
                    </section>

                    {/* Vertical Tabs Section */}
                    <section className="relative py-12 lg:py-16">
                        <DSContainer
                            maxWidth="hero"
                            padding="responsive">
                            
                            {/* Mobile: Simple Tab Navigation */}
                            <div className="lg:hidden mb-8">
                                <div className="flex overflow-x-auto gap-2 pb-2 mb-8">
                                    {PRODUCT_TABS.map((tab) => {
                                        const IconComponent = tab.icon
                                        const isActive = activeTab === tab.id

                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                                                    isActive
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                        : 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                                                }`}>
                                                <IconComponent className="w-4 h-4" />
                                                <span className="text-sm font-medium">{tab.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Mobile Content */}
                                <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="p-6">
                                            {(() => {
                                                const activeTabConfig = PRODUCT_TABS.find((tab) => tab.id === activeTab)
                                                const ComponentToRender = activeTabConfig?.component

                                                if (!ComponentToRender) {
                                                    return (
                                                        <div className="text-center py-12">
                                                            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                Content Coming Soon
                                                            </h3>
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                This section will be available soon.
                                                            </p>
                                                        </div>
                                                    )
                                                }

                                                return <ComponentToRender product={product} />
                                            })()}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Desktop: Clean Side-by-Side Layout */}
                            <div className="hidden lg:flex gap-12">
                                {/* Simple Tab Navigation */}
                                <div className="w-64 flex-shrink-0">
                                    <div className="sticky top-24 space-y-2">
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                                            Product Information
                                        </h3>
                                        
                                        <nav className="space-y-1">
                                            {PRODUCT_TABS.map((tab) => {
                                                const IconComponent = tab.icon
                                                const isActive = activeTab === tab.id

                                                return (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                                                            isActive
                                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                                                        }`}>
                                                        <IconComponent className="w-5 h-5" />
                                                        <div>
                                                            <div className="font-medium text-base">
                                                                {tab.label}
                                                            </div>
                                                            <div className="text-sm opacity-75 mt-0.5">
                                                                {tab.description}
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </nav>

                                        {/* Simple Stats */}
                                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="text-center py-2">
                                                    <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {product?.averageRating?.toFixed(1) || '5.0'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                                                </div>
                                                <div className="text-center py-2">
                                                    <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                                                        {product?.views || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
                                                </div>
                                                <div className="text-center py-2">
                                                    <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {product?.sales || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">Sales</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Clean Content Area */}
                                <div className="flex-1 min-w-0">
                                    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTab}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="p-8">
                                                {(() => {
                                                    const activeTabConfig = PRODUCT_TABS.find((tab) => tab.id === activeTab)
                                                    const ComponentToRender = activeTabConfig?.component

                                                    if (!ComponentToRender) {
                                                        return (
                                                            <div className="text-center py-12">
                                                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                                    <Package className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                                    Content Coming Soon
                                                                </h3>
                                                                <p className="text-gray-600 dark:text-gray-400">
                                                                    This section will be available soon.
                                                                </p>
                                                            </div>
                                                        )
                                                    }

                                                    return <ComponentToRender product={product} />
                                                })()}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </DSContainer>
                    </section>
                </main>

                {/* Sticky Purchase Bar */}
                <AnimatePresence>
                    {showStickyBar && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-t border-gray-700/50 shadow-2xl">
                            <div className="max-w-7xl mx-auto px-4 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                                            {product?.thumbnail ? (
                                                <img
                                                    src={product.thumbnail}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#00FF89]/20 to-[#FFC050]/20 flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-[#00FF89]" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white text-sm line-clamp-1">{product?.title}</div>
                                            <div className="text-2xl font-bold text-[#00FF89]">${product?.price || 0}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {hasPurchased ? (
                                            <DSButton
                                                variant="primary"
                                                onClick={handleDownload}
                                                className="px-6">
                                                <Download className="w-4 h-4" />
                                                Access Product
                                            </DSButton>
                                        ) : isOwner ? (
                                            <Link href="/seller/products">
                                                <DSButton
                                                    variant="primary"
                                                    className="px-6">
                                                    Manage Product
                                                </DSButton>
                                            </Link>
                                        ) : (
                                            <>
                                                <DSButton
                                                    variant="secondary"
                                                    onClick={handleAddToCart}
                                                    disabled={inCart}
                                                    className="px-6">
                                                    <ShoppingCart className="w-4 h-4" />
                                                    {inCart ? 'In Cart' : 'Add to Cart'}
                                                </DSButton>
                                                <DSButton
                                                    variant="primary"
                                                    onClick={handleBuyNow}
                                                    className="px-6">
                                                    Buy Now
                                                </DSButton>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    )
}


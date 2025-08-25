'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Share2, ShoppingCart, Download, ThumbsUp, BookOpen, Sparkles, Play, HelpCircle, BarChart3, Package } from 'lucide-react'
import Link from 'next/link'

// Hooks and utilities
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
import SellerProfileModal from '@/components/shared/SellerProfileModal'

// Tab configuration with icons and descriptions
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
    const [showSellerModal, setShowSellerModal] = useState(false)

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

                    {/* Product Hero Section - Restore Purchase Section */}
                    <section className="relative">
                        <DSContainer
                            maxWidth="hero"
                            padding="responsive"
                            className="relative z-10">
                            <div className="py-4 lg:py-8">
                                {/* Mobile Layout */}
                                <div className="lg:hidden space-y-6">
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
                                </div>

                                {/* Desktop Layout - 3 Column Grid */}
                                <div className="hidden lg:grid lg:grid-cols-12 gap-8">
                                    {/* Left: Product Images - 5 columns (smaller) */}
                                    <div className="lg:col-span-5">
                                        <div className="space-y-4">
                                            {/* Main Image */}
                                            <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-700/50">
                                                {product?.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[selectedImage] || product.thumbnail}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : product?.thumbnail ? (
                                                    <img
                                                        src={product.thumbnail}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-[#00FF89]/20 to-[#FFC050]/20 flex items-center justify-center">
                                                        <Package className="w-16 h-16 text-[#00FF89]" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Thumbnail Gallery */}
                                            {product?.images && product.images.length > 1 && (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {product.images.slice(0, 4).map((image, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedImage(index)}
                                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                                                selectedImage === index
                                                                    ? 'border-[#00FF89] ring-2 ring-[#00FF89]/30'
                                                                    : 'border-gray-700/50 hover:border-gray-600/50'
                                                            }`}>
                                                            <img
                                                                src={image}
                                                                alt={`${product.title} - Image ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Product Info & Purchase - 7 columns (larger) */}
                                    <div className="lg:col-span-7 space-y-6">
                                        {/* Product Header */}
                                        <div className="space-y-4">
                                            {/* Category & Badges */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                                    {product?.category?.replace('_', ' ')} • {product?.type}
                                                </span>
                                                {product?.isVerified && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800/50">
                                                        🔒 Verified
                                                    </span>
                                                )}
                                                {discountPercentage > 0 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-800/50">
                                                        {discountPercentage}% OFF
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <DSHeading
                                                level={1}
                                                className="text-3xl lg:text-4xl font-bold leading-tight"
                                                style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                {product?.title}
                                            </DSHeading>

                                            {/* Description */}
                                            <DSText
                                                className="text-lg leading-relaxed"
                                                style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                {product?.shortDescription}
                                            </DSText>
                                        </div>

                                        {/* PURCHASE SECTION - Prominent */}
                                        <div
                                            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl"
                                            ref={ctaRef}>
                                            {/* Pricing - Fixed to Same Line */}
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="relative">
                                                    <div
                                                        className="text-4xl font-black tracking-tight"
                                                        style={{ color: '#00FF89', textShadow: '0 0 20px rgba(0, 255, 137, 0.3)' }}>
                                                        ${Math.round(product?.price || 0)}
                                                    </div>
                                                    <div
                                                        className="absolute inset-0 -z-10 rounded-lg blur-xl opacity-20"
                                                        style={{ backgroundColor: '#00FF89' }}
                                                    />
                                                </div>
                                                {product?.originalPrice && product?.originalPrice > product?.price && (
                                                    <>
                                                        <div className="text-lg text-gray-400 line-through">${Math.round(product.originalPrice)}</div>
                                                        <div className="px-2 py-1 bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/50 text-xs font-medium rounded whitespace-nowrap">
                                                            Save ${Math.round(savingsAmount)}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* What's Included */}
                                            <div className="mb-6 p-4 bg-blue-900/10 rounded-lg border border-blue-800/20">
                                                <div className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
                                                    <Package className="w-4 h-4" />
                                                    What's Included:
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <span className="text-green-400">✓</span>
                                                        Instant Digital Delivery
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <span className="text-green-400">✓</span>
                                                        Full Documentation & Setup Guide
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <span className="text-green-400">✓</span>
                                                        24/7 Setup Support
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <span className="text-green-400">✓</span>
                                                        Free Updates & Improvements
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Purchase Buttons */}
                                            <div className="space-y-3">
                                                {hasPurchased ? (
                                                    <DSButton
                                                        variant="primary"
                                                        onClick={handleDownload}
                                                        className="w-full py-4 text-lg font-semibold">
                                                        <Download className="w-5 h-5" />
                                                        Access Your Product
                                                    </DSButton>
                                                ) : isOwner ? (
                                                    <Link href="/seller/products">
                                                        <DSButton
                                                            variant="primary"
                                                            className="w-full py-4 text-lg font-semibold">
                                                            Manage Product
                                                        </DSButton>
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <DSButton
                                                            variant="primary"
                                                            onClick={handleBuyNow}
                                                            className="w-full py-4 text-lg font-semibold">
                                                            Buy Now - Get Instant Access
                                                        </DSButton>
                                                        <DSButton
                                                            variant="secondary"
                                                            onClick={handleAddToCart}
                                                            disabled={inCart}
                                                            className="w-full py-3">
                                                            <ShoppingCart className="w-4 h-4" />
                                                            {inCart ? 'Already in Cart' : 'Add to Cart'}
                                                        </DSButton>
                                                    </>
                                                )}
                                            </div>

                                            {/* Trust Indicators */}
                                            <div className="mt-4 pt-4 border-t border-gray-700/50">
                                                <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-green-400">🛡️</span>
                                                        30-day guarantee
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-blue-400">⚡</span>
                                                        Instant download
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-purple-400">💬</span>
                                                        24/7 support
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-4 gap-4 py-4 bg-gray-900/30 rounded-xl border border-gray-700/50">
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-[#00FF89]">{product?.averageRating?.toFixed(1) || '5.0'}</div>
                                                <div className="text-xs text-gray-400">Rating</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-[#FFC050]">{product?.sales || 0}</div>
                                                <div className="text-xs text-gray-400">Sales</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-[#00FF89]">{product?.views || 0}</div>
                                                <div className="text-xs text-gray-400">Views</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-[#FFC050]">{product?.upvotes || 0}</div>
                                                <div className="text-xs text-gray-400">Upvotes</div>
                                            </div>
                                        </div>

                                        {/* Seller Info */}
                                        <div className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-xl border border-gray-700/50">
                                            <div className="w-12 h-12 bg-gradient-to-r from-[#00FF89] to-[#FFC050] rounded-full flex items-center justify-center text-black text-lg font-bold">
                                                {product?.sellerId?.fullName?.[0] || 'S'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-white">{product?.sellerId?.fullName || 'Anonymous Seller'}</div>
                                                <div className="text-sm text-gray-400">
                                                    {product?.sellerId?.stats?.totalProducts || 0} products •{' '}
                                                    {product?.sellerId?.stats?.totalSales || 0} sales
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowSellerModal(true)}
                                                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-sm text-gray-300 transition-colors">
                                                View Profile
                                            </button>
                                        </div>

                                        {/* Social Actions */}
                                        <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-700/50">
                                            <button
                                                onClick={handleUpvote}
                                                disabled={isUpvoting}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800/50 rounded-lg transition-colors">
                                                <ThumbsUp className={`w-5 h-5 ${upvoted ? 'text-[#00FF89]' : 'text-gray-400'}`} />
                                                <span className="text-sm text-gray-300">{product?.upvotes || 0}</span>
                                            </button>
                                            <button
                                                onClick={handleLike}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800/50 rounded-lg transition-colors">
                                                <Heart className={`w-5 h-5 ${liked ? 'text-red-400 fill-current' : 'text-gray-400'}`} />
                                                <span className="text-sm text-gray-300">{product?.favorites || 0}</span>
                                            </button>
                                            <button
                                                onClick={handleShare}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800/50 rounded-lg transition-colors relative">
                                                <Share2 className="w-5 h-5 text-gray-400" />
                                                <span className="text-sm text-gray-300">Share</span>
                                                {showCopied && (
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs rounded whitespace-nowrap">
                                                        Copied!
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DSContainer>
                    </section>

                    {/* Vertical Tabs Section */}
                    <section className="relative py-12 lg:py-16">
                        <DSContainer
                            maxWidth="hero"
                            padding="responsive">
                            {/* Mobile: Horizontal Tabs */}
                            <div className="lg:hidden mb-8">
                                <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                                    <div className="flex overflow-x-auto gap-2 pb-2">
                                        {PRODUCT_TABS.map((tab) => {
                                            const IconComponent = tab.icon
                                            const isActive = activeTab === tab.id

                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
                                                        isActive
                                                            ? 'bg-[#00FF89] text-black font-semibold'
                                                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                                                    }`}>
                                                    <IconComponent className="w-4 h-4" />
                                                    <span className="text-sm">{tab.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Mobile Content */}
                                <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
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
                                                            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                            <DSHeading
                                                                level={4}
                                                                className="mb-2 font-semibold"
                                                                style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                                Content Coming Soon
                                                            </DSHeading>
                                                            <DSText style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                                This section will be available soon.
                                                            </DSText>
                                                        </div>
                                                    )
                                                }

                                                return <ComponentToRender product={product} />
                                            })()}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Desktop: Vertical Tabs Layout */}
                            <div className="hidden lg:flex gap-8">
                                {/* Vertical Tab Navigation */}
                                <div className="w-80 flex-shrink-0">
                                    <div className="sticky top-24">
                                        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                                            <DSHeading
                                                level={4}
                                                className="mb-6 font-bold text-center"
                                                style={{ color: '#00FF89', fontSize: '1.25rem' }}>
                                                Product Details
                                            </DSHeading>

                                            <nav className="space-y-2">
                                                {PRODUCT_TABS.map((tab) => {
                                                    const IconComponent = tab.icon
                                                    const isActive = activeTab === tab.id

                                                    return (
                                                        <motion.button
                                                            key={tab.id}
                                                            onClick={() => setActiveTab(tab.id)}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left group ${
                                                                isActive
                                                                    ? 'bg-gradient-to-r from-[#00FF89]/20 to-[#FFC050]/20 border-2 border-[#00FF89]/50 shadow-lg'
                                                                    : 'bg-gray-800/30 border border-gray-700/50 hover:bg-gray-700/40 hover:border-gray-600/50'
                                                            }`}>
                                                            <div
                                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                                                    isActive
                                                                        ? 'bg-[#00FF89] text-black shadow-lg'
                                                                        : 'bg-gray-700/50 text-gray-300 group-hover:bg-gray-600/50'
                                                                }`}>
                                                                <IconComponent className="w-5 h-5" />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div
                                                                    className={`font-semibold text-sm transition-colors ${
                                                                        isActive ? 'text-[#00FF89]' : 'text-gray-200 group-hover:text-white'
                                                                    }`}>
                                                                    {tab.label}
                                                                </div>
                                                                <div
                                                                    className={`text-xs mt-0.5 transition-colors ${
                                                                        isActive ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'
                                                                    }`}>
                                                                    {tab.description}
                                                                </div>
                                                            </div>

                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="activeTabIndicator"
                                                                    className="w-1 h-8 bg-[#00FF89] rounded-full shadow-lg"
                                                                />
                                                            )}
                                                        </motion.button>
                                                    )
                                                })}
                                            </nav>

                                            {/* Tab Content Stats */}
                                            <div className="mt-6 pt-6 border-t border-gray-700/50">
                                                <div className="text-center space-y-2">
                                                    <DSText className="text-xs font-medium text-gray-400">Product Information</DSText>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-[#00FF89]">
                                                                {product?.averageRating?.toFixed(1) || '5.0'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">Rating</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-[#FFC050]">{product?.views || 0}</div>
                                                            <div className="text-xs text-gray-500">Views</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-lg font-bold text-[#00FF89]">{product?.sales || 0}</div>
                                                            <div className="text-xs text-gray-500">Sales</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tab Content Area */}
                                <div className="flex-1 min-w-0">
                                    <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
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
                                                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                                                                    <Package className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                                <DSHeading
                                                                    level={4}
                                                                    className="mb-2 font-semibold"
                                                                    style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                                    Content Coming Soon
                                                                </DSHeading>
                                                                <DSText style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                                    This section will be available soon.
                                                                </DSText>
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

                {/* Seller Profile Modal */}
                <SellerProfileModal
                    isOpen={showSellerModal}
                    onClose={() => setShowSellerModal(false)}
                    sellerId={product?.sellerId?._id || product?.sellerId?.id || product?.sellerId}
                    sellerName={product?.sellerId?.fullName || product?.sellerName}
                    sellerData={product?.sellerId ? getSafeSellerData(product.sellerId) : null}
                />

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

                {/* Mobile Tab Content */}
                <div className="lg:hidden">
                    <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden mx-4">
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
                                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-800/50 flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <DSHeading
                                                    level={4}
                                                    className="mb-2 font-semibold"
                                                    style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                    Content Coming Soon
                                                </DSHeading>
                                                <DSText style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                    This section will be available soon.
                                                </DSText>
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
        </ErrorBoundary>
    )
}



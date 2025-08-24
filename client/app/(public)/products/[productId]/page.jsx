'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import './styles.css'
import { DESIGN_TOKENS, DSButton, DSHeading, DSText, DSContainer, DSLoadingState } from '@/lib/design-system'
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb'
import ProductHero from '@/components/product/ProductHero'
import Header from '@/components/shared/layout/Header'
import SellerProfileModal from '@/components/shared/SellerProfileModal'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import InlineNotification from '@/components/shared/notifications/InlineNotification'

// Import hooks and utilities
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import productsAPI from '@/lib/api/products'
import { promocodeAPI } from '@/lib/api'

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
        return product.originalPrice - product.price
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
                style={{
                    backgroundColor: DESIGN_TOKENS.colors.background.dark,
                    fontFamily: DESIGN_TOKENS.typography.fontFamily.body
                }}>
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

                    {/* Mobile-First Responsive Layout */}
                    <section className="relative">
                        <DSContainer
                            maxWidth="hero"
                            padding="responsive"
                            className="relative z-10">
                            <div className="py-6">
                                {/* Mobile Layout (< lg) - Single Column Stack */}
                                <div className="lg:hidden space-y-6">
                                    {/* Mobile: Category badges and Title first */}
                                    <div className="space-y-4">
                                        {/* Category & Verification Badges */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-400">✓</span>
                                                <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                                    {product?.category?.replace('_', ' ')} • {product?.industry}
                                                </span>
                                            </div>
                                            {/* Show only most important badge on mobile */}
                                            {product?.isVerified && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800/50">
                                                    🔒 Verified
                                                </span>
                                            )}
                                        </div>

                                        {/* Mobile Title - Smaller */}
                                        <DSHeading
                                            level={1}
                                            className="text-xl font-bold leading-tight"
                                            style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                            {product?.title}
                                        </DSHeading>
                                    </div>

                                    {/* Mobile: Image Gallery */}
                                    <ProductHero
                                        product={product}
                                        selectedImage={selectedImage}
                                        setSelectedImage={setSelectedImage}
                                    />

                                    {/* Mobile: Price Section - Ultra-constrained container */}
                                    <div className="w-full max-w-full">
                                        <div className="border-2 border-green-500/30 rounded-lg p-2 bg-gray-900/40 backdrop-blur-sm sticky top-20 z-40 overflow-hidden">
                                            {/* Mobile price - Ultra responsive */}
                                            <div className="mb-2">
                                                <div className="flex items-start gap-2 w-full">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="relative inline-block">
                                                            <div 
                                                                className="text-2xl sm:text-3xl font-black tracking-tight leading-none truncate" 
                                                                style={{ 
                                                                    color: '#00FF89',
                                                                    textShadow: '0 0 10px rgba(0, 255, 137, 0.3)',
                                                                    fontWeight: '900'
                                                                }}>
                                                                ${product?.price || 0}
                                                            </div>
                                                            <div 
                                                                className="absolute inset-0 -z-10 rounded blur-lg opacity-15"
                                                                style={{ backgroundColor: '#00FF89' }}
                                                            />
                                                        </div>
                                                        {product?.originalPrice && product?.originalPrice > product?.price && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    ${product.originalPrice}
                                                                </span>
                                                                <span className="px-1 py-0.5 bg-red-900/30 text-red-300 text-xs font-bold rounded">
                                                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mobile: Critical info - Ultra compact */}
                                            <div className="mb-2 p-2 bg-blue-900/10 rounded border border-blue-800/20">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-green-400">🛡️</span>
                                                        <span className="text-green-300 font-medium truncate">Money-back guarantee</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-blue-400">⚡</span>
                                                        <span className="text-blue-300 font-medium truncate">Instant Digital Delivery</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-purple-400">💬</span>
                                                        <span className="text-purple-300 font-medium truncate">Setup Support Included</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mobile: Purchase buttons - Full width constrained */}
                                            <div className="space-y-2 w-full" ref={ctaRef}>
                                                {hasPurchased ? (
                                                    <button
                                                        onClick={handleDownload}
                                                        className="w-full py-3 text-black font-bold text-sm rounded-lg transition-all hover:opacity-90 shadow-lg truncate"
                                                        style={{ 
                                                            backgroundColor: '#00FF89',
                                                            boxShadow: '0 4px 20px rgba(0, 255, 137, 0.3)' 
                                                        }}>
                                                        🚀 Access Your Product
                                                    </button>
                                                ) : isOwner ? (
                                                    <Link href="/seller/products" className="block w-full">
                                                        <button className="w-full py-3 text-black font-bold text-sm rounded-lg transition-all hover:opacity-90 shadow-lg truncate"
                                                                style={{ 
                                                                    backgroundColor: '#00FF89',
                                                                    boxShadow: '0 4px 20px rgba(0, 255, 137, 0.3)' 
                                                                }}>
                                                            📊 Manage Product
                                                        </button>
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={handleBuyNow}
                                                        className="w-full py-3 text-black font-bold text-sm rounded-lg transition-all hover:opacity-90 shadow-lg relative overflow-hidden"
                                                        style={{ 
                                                            backgroundColor: '#00FF89', 
                                                            boxShadow: '0 4px 20px rgba(0, 255, 137, 0.3)' 
                                                        }}>
                                                        <span className="relative z-10 truncate px-2">💳 Buy Now - Get Instant Access</span>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-pulse" />
                                                    </button>
                                                )}
                                                
                                                {!isOwner && !hasPurchased && (
                                                    <button
                                                        onClick={handleAddToCart}
                                                        disabled={inCart}
                                                        className="w-full py-2.5 text-sm font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-2 truncate"
                                                        style={{ 
                                                            backgroundColor: 'transparent',
                                                            borderColor: inCart ? '#666' : '#00FF89',
                                                            color: inCart ? '#ccc' : '#00FF89'
                                                        }}>
                                                        {inCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Mobile: Small description - constrained */}
                                            <div className="text-xs text-center text-gray-500 mt-2 truncate px-2">
                                                Complete automation system with setup guide
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile: Stats Row - Horizontal scroll on very small screens */}
                                    <div className="overflow-x-auto">
                                        <div className="grid grid-cols-4 gap-3 py-3 min-w-max">
                                            <div className="text-center px-2">
                                                <div
                                                    className="text-base font-bold"
                                                    style={{ color: '#00FF89' }}>
                                                    {product?.averageRating?.toFixed(1) || '5.0'}
                                                </div>
                                                <div className="text-xs text-gray-400">Rating</div>
                                            </div>
                                            <div className="text-center px-2">
                                                <div
                                                    className="text-base font-bold"
                                                    style={{ color: '#00FF89' }}>
                                                    {product?.sales || 0}
                                                </div>
                                                <div className="text-xs text-gray-400">Sales</div>
                                            </div>
                                            <div className="text-center px-2">
                                                <div
                                                    className="text-base font-bold"
                                                    style={{ color: '#00FF89' }}>
                                                    {product?.views || 0}
                                                </div>
                                                <div className="text-xs text-gray-400">Views</div>
                                            </div>
                                            <div className="text-center px-2">
                                                <div
                                                    className="text-base font-bold"
                                                    style={{ color: '#00FF89' }}>
                                                    {product?.upvotes || 0}
                                                </div>
                                                <div className="text-xs text-gray-400">Upvotes</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile: Compact Key Features */}
                                    {product?.benefits && product.benefits.length > 0 && (
                                        <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-800/50">
                                            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                                <span className="text-xl">⚡</span>
                                                Key Features
                                            </h3>
                                            <div className="space-y-2">
                                                {product.benefits.slice(0, 4).map((benefit, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-2 text-sm">
                                                        <span
                                                            style={{ color: '#00FF89' }}
                                                            className="text-xs mt-1 flex-shrink-0">
                                                            ✓
                                                        </span>
                                                        <span className="text-gray-300">{benefit}</span>
                                                    </div>
                                                ))}
                                                {product.benefits.length > 4 && (
                                                    <div className="text-center mt-3">
                                                        <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                                                            +{product.benefits.length - 4} more features
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mobile: Seller Info - Compact */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg">
                                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-black text-sm font-bold">
                                            {product?.sellerId?.fullName?.[0] || 'S'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-200">{product?.sellerId?.fullName || 'Creator'}</div>
                                            <div className="text-xs text-gray-400">
                                                {product?.sellerId?.stats?.totalProducts || 0} products • {product?.sellerId?.stats?.totalSales || 0}{' '}
                                                sales
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile: Description */}
                                    <div className="space-y-3">
                                        <DSText className="text-sm leading-relaxed text-gray-300">{product?.shortDescription}</DSText>
                                        {product?.fullDescription && product.fullDescription !== product.shortDescription && (
                                            <DSText className="text-sm leading-relaxed text-gray-400">
                                                {product.fullDescription.slice(0, 100)}
                                                {product.fullDescription.length > 100 ? '...' : ''}
                                            </DSText>
                                        )}
                                    </div>

                                    {/* Mobile: Social Actions */}
                                    <div className="flex justify-center gap-6 py-4 border-t border-gray-800">
                                        <button
                                            onClick={handleUpvote}
                                            disabled={isUpvoting}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                                            <span className="text-gray-400 text-lg">👍</span>
                                            <span className="text-sm text-gray-400">{product?.upvotes || 0}</span>
                                        </button>
                                        <button
                                            onClick={handleLike}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                                            <span className="text-gray-400 text-lg">♥</span>
                                            <span className="text-sm text-gray-400">{product?.favorites || 0}</span>
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors relative">
                                            <span className="text-gray-400 text-lg">📤</span>
                                            <span className="text-sm text-gray-400">Share</span>
                                            {showCopied && (
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs rounded whitespace-nowrap">
                                                    Copied!
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Mobile: Tags - Limited */}
                                    {product?.tags && product.tags.length > 0 && (
                                        <div>
                                            <div className="flex flex-wrap gap-2">
                                                {product.tags.slice(0, 4).map((tag, index) => (
                                                    <Link
                                                        key={index}
                                                        href={`/explore?tag=${encodeURIComponent(tag)}`}>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-700/50">
                                                            #{tag}
                                                        </span>
                                                    </Link>
                                                ))}
                                                {product.tags.length > 4 && (
                                                    <span className="px-2 py-1 text-xs text-gray-500">+{product.tags.length - 4}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Layout (≥ lg) - Original Two Column Layout */}
                                <div className="hidden lg:block max-w-7xl mx-auto">
                                    <div className="grid lg:grid-cols-5 gap-8">
                                        {/* Left - Compact 3x3 Image Grid (60% width) */}
                                        <div className="lg:col-span-3">
                                            <ProductHero
                                                product={product}
                                                selectedImage={selectedImage}
                                                setSelectedImage={setSelectedImage}
                                            />

                                            {/* Fill the empty space below images with engaging content */}
                                            <div className="mt-8 space-y-6">
                                                {/* Key Features Preview */}
                                                {product?.benefits && product.benefits.length > 0 && (
                                                    <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800/50">
                                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                            <span className="text-2xl">⚡</span>
                                                            Key Features
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {product.benefits.slice(0, 6).map((benefit, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                                                                    <span
                                                                        style={{ color: '#00FF89' }}
                                                                        className="text-sm mt-0.5 flex-shrink-0">
                                                                        ✓
                                                                    </span>
                                                                    <span className="text-sm text-gray-300 leading-relaxed">{benefit}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {product.benefits.length > 6 && (
                                                            <div className="mt-4 text-center">
                                                                <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                                                                    +{product.benefits.length - 6} more features
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* How It Works Preview */}
                                                {product?.howItWorks && product.howItWorks.length > 0 && (
                                                    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-800/30">
                                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                            <span className="text-2xl">🔄</span>
                                                            How It Works
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {product.howItWorks.slice(0, 3).map((step, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-start gap-4">
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                                        {index + 1}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {product.howItWorks.length > 3 && (
                                                                <div className="text-center pt-2">
                                                                    <span className="text-sm text-blue-300 bg-blue-900/30 px-3 py-1 rounded-full">
                                                                        +{product.howItWorks.length - 3} more steps
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Requirements/Compatibility */}
                                                {(product?.requirements || product?.compatibility || product?.prerequisites) && (
                                                    <div className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 rounded-xl p-6 border border-orange-800/30">
                                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                            <span className="text-2xl">📋</span>
                                                            What You Need
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {product.requirements && (
                                                                <div className="flex items-start gap-3">
                                                                    <span className="text-orange-400 text-sm mt-0.5">•</span>
                                                                    <span className="text-sm text-gray-300">{product.requirements}</span>
                                                                </div>
                                                            )}
                                                            {product.compatibility && (
                                                                <div className="flex items-start gap-3">
                                                                    <span className="text-orange-400 text-sm mt-0.5">•</span>
                                                                    <span className="text-sm text-gray-300">{product.compatibility}</span>
                                                                </div>
                                                            )}
                                                            {product.prerequisites && (
                                                                <div className="flex items-start gap-3">
                                                                    <span className="text-orange-400 text-sm mt-0.5">•</span>
                                                                    <span className="text-sm text-gray-300">{product.prerequisites}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Quick Stats Visual */}
                                                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-800/30">
                                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                        <span className="text-2xl">📊</span>
                                                        Product Insights
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                                                            <div className="text-xl font-bold text-green-400">
                                                                {product?.setupTime?.includes('minutes')
                                                                    ? product.setupTime.split('_')[0] + ' min'
                                                                    : product?.setupTime?.replace('_', ' ') || 'Quick'}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-1">Setup Time</div>
                                                        </div>
                                                        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                                                            <div className="text-xl font-bold text-green-400">
                                                                {product?.difficulty || 'Beginner'}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-1">Difficulty</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Social Proof Section */}
                                                {(product?.testimonials || product?.reviews || product?.sales > 0) && (
                                                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-800/30">
                                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                            <span className="text-2xl">💬</span>
                                                            Customer Love
                                                        </h3>

                                                        {product?.testimonials && product.testimonials.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {product.testimonials.slice(0, 2).map((testimonial, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                                                        <p className="text-sm text-gray-300 mb-2 italic">"{testimonial.text}"</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                                {testimonial.author?.[0] || 'U'}
                                                                            </div>
                                                                            <span className="text-xs text-gray-400">
                                                                                {testimonial.author || 'Verified Customer'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <div className="text-3xl font-bold text-purple-400 mb-1">
                                                                    {product?.averageRating?.toFixed(1) || '5.0'}/5
                                                                </div>
                                                                <div className="text-sm text-gray-400">
                                                                    Based on {product?.totalReviews || product?.sales || 0} reviews
                                                                </div>
                                                                <div className="flex justify-center mt-2">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="text-yellow-400 text-lg">
                                                                            ★
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right - Product Info & Purchase (40% width) */}
                                        <div className="lg:col-span-2 space-y-5">
                                            {/* Category & Verification Badges */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">✓</span>
                                                    <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                                                        {product?.category?.replace('_', ' ')} • {product?.industry}
                                                    </span>
                                                </div>
                                                {/* Show only top 2 most important badges */}
                                                {product?.isVerified && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800/50">
                                                        🔒 Verified
                                                    </span>
                                                )}
                                                {product?.isTested && !product?.isVerified && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-800/50">
                                                        ✅ Tested
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title - Perfect Size */}
                                            <DSHeading
                                                level={1}
                                                className="text-2xl lg:text-3xl font-bold leading-tight mb-2"
                                                style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                {product?.title}
                                            </DSHeading>

                                            {/* PRICE SECTION - MOVED TO TOP FOR IMMEDIATE VISIBILITY */}
                                            <div className="border-2 border-green-500/30 rounded-lg p-4 bg-gray-900/40 backdrop-blur-sm">
                                                {/* What you get section - compact version */}
                                                {product?.benefits && product.benefits.length > 0 && (
                                                    <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-green-800/20">
                                                        <div className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-2">
                                                            <span style={{ color: '#00FF89' }}>📦</span>
                                                            What you get:
                                                        </div>
                                                        <ul className="space-y-1">
                                                            {product.benefits.slice(0, 3).map((benefit, index) => (
                                                                <li
                                                                    key={index}
                                                                    className="text-xs text-gray-300 flex items-start gap-2">
                                                                    <span
                                                                        style={{ color: '#00FF89' }}
                                                                        className="text-xs mt-0.5">
                                                                        ✓
                                                                    </span>
                                                                    <span>{benefit}</span>
                                                                </li>
                                                            ))}
                                                            {product.benefits.length > 3 && (
                                                                <li className="text-xs text-gray-500 ml-4">
                                                                    +{product.benefits.length - 3} more features
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Enhanced pricing with 2x larger size and visual emphasis */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-baseline gap-4">
                                                            <div className="relative">
                                                                <div
                                                                    className="text-5xl font-black tracking-tight"
                                                                    style={{
                                                                        color: '#00FF89',
                                                                        textShadow: '0 0 20px rgba(0, 255, 137, 0.3)',
                                                                        fontWeight: '900'
                                                                    }}>
                                                                    ${product?.price || 0}
                                                                </div>
                                                                {/* Price highlight background */}
                                                                <div
                                                                    className="absolute inset-0 -z-10 rounded-lg blur-xl opacity-20"
                                                                    style={{ backgroundColor: '#00FF89' }}
                                                                />
                                                            </div>
                                                            {product?.originalPrice && product?.originalPrice > product?.price && (
                                                                <div className="flex flex-col items-start gap-1">
                                                                    <div className="text-lg text-gray-400 line-through">${product.originalPrice}</div>
                                                                    <div className="px-2 py-1 bg-red-900/30 text-red-300 text-xs font-bold rounded">
                                                                        {Math.round(
                                                                            ((product.originalPrice - product.price) / product.originalPrice) * 100
                                                                        )}
                                                                        % OFF
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Critical information surfaced above purchase buttons */}
                                                <div className="space-y-2 mb-4 p-3 bg-blue-900/10 rounded-lg border border-blue-800/20">
                                                    {/* Guarantee/Return Policy */}
                                                    {product?.hasGuarantee && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-green-400 text-sm">🛡️</span>
                                                            <div>
                                                                <div className="text-xs font-medium text-green-300">
                                                                    {product.guaranteeText || 'Money-back guarantee'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Shipping Info */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-400 text-sm">⚡</span>
                                                        <div className="text-xs font-medium text-blue-300">Instant Digital Delivery</div>
                                                    </div>

                                                    {/* Support Info */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-purple-400 text-sm">💬</span>
                                                        <div className="text-xs font-medium text-purple-300">Setup Support Included</div>
                                                    </div>
                                                </div>

                                                {/* Purchase buttons */}
                                                <div
                                                    className="space-y-3"
                                                    ref={ctaRef}>
                                                    {hasPurchased ? (
                                                        <button
                                                            onClick={handleDownload}
                                                            className="w-full py-4 text-black font-bold text-lg rounded-lg transition-all hover:opacity-90 hover:scale-[0.99] shadow-xl"
                                                            style={{
                                                                backgroundColor: '#00FF89',
                                                                boxShadow: '0 8px 32px rgba(0, 255, 137, 0.4)'
                                                            }}>
                                                            🚀 Access Your Product
                                                        </button>
                                                    ) : isOwner ? (
                                                        <Link
                                                            href="/seller/products"
                                                            className="block">
                                                            <button
                                                                className="w-full py-4 text-black font-bold text-lg rounded-lg transition-all hover:opacity-90 hover:scale-[0.99] shadow-xl"
                                                                style={{
                                                                    backgroundColor: '#00FF89',
                                                                    boxShadow: '0 8px 32px rgba(0, 255, 137, 0.4)'
                                                                }}>
                                                                📊 Manage Product
                                                            </button>
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            onClick={handleBuyNow}
                                                            className="w-full py-4 text-black font-bold text-lg rounded-lg transition-all hover:opacity-90 hover:scale-[0.99] shadow-xl relative overflow-hidden"
                                                            style={{
                                                                backgroundColor: '#00FF89',
                                                                boxShadow: '0 8px 32px rgba(0, 255, 137, 0.4)'
                                                            }}>
                                                            <span className="relative z-10">💳 Buy Now - Get Instant Access</span>
                                                            {/* Animated background highlight */}
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-pulse" />
                                                        </button>
                                                    )}

                                                    {!isOwner && !hasPurchased && (
                                                        <button
                                                            onClick={handleAddToCart}
                                                            disabled={inCart}
                                                            className="w-full py-3 text-gray-300 text-sm font-medium rounded-lg transition-all hover:opacity-90 hover:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed border-2"
                                                            style={{
                                                                backgroundColor: inCart ? 'transparent' : 'transparent',
                                                                borderColor: inCart ? '#666' : '#00FF89',
                                                                color: inCart ? '#ccc' : '#00FF89'
                                                            }}>
                                                            {inCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="text-xs text-center text-gray-500 mt-3">
                                                    Complete automation system with setup guide & support
                                                </div>
                                            </div>

                                            {/* Setup Time & Target Audience */}
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">⏱️</span>
                                                    <span className="text-gray-300">Setup: {product?.setupTime?.replace('_', ' ') || 'Quick'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">🎯</span>
                                                    <span className="text-gray-300">v{product?.currentVersion}</span>
                                                </div>
                                            </div>

                                            {/* Enhanced Stats Row */}
                                            <div className="grid grid-cols-4 gap-4 py-3">
                                                <div className="text-center">
                                                    <div
                                                        className="text-lg font-bold"
                                                        style={{ color: '#00FF89' }}>
                                                        {product?.averageRating?.toFixed(1) || '5.0'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Rating</div>
                                                </div>
                                                <div className="text-center">
                                                    <div
                                                        className="text-lg font-bold"
                                                        style={{ color: '#00FF89' }}>
                                                        {product?.sales || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Sales</div>
                                                </div>
                                                <div className="text-center">
                                                    <div
                                                        className="text-lg font-bold"
                                                        style={{ color: '#00FF89' }}>
                                                        {product?.views || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Views</div>
                                                </div>
                                                <div className="text-center">
                                                    <div
                                                        className="text-lg font-bold"
                                                        style={{ color: '#00FF89' }}>
                                                        {product?.upvotes || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-400">Upvotes</div>
                                                </div>
                                            </div>

                                            {/* Seller Info - Enhanced */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg">
                                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-black text-sm font-bold">
                                                    {product?.sellerId?.fullName?.[0] || 'S'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-200 truncate">
                                                        {product?.sellerId?.fullName || 'Creator'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span>{product?.sellerId?.stats?.totalProducts || 0} products</span>
                                                        <span>•</span>
                                                        <span>{product?.sellerId?.stats?.totalSales || 0} sales</span>
                                                        {product?.sellerId?.customAutomationServices && (
                                                            <>
                                                                <span>•</span>
                                                                <span style={{ color: '#00FF89' }}>Custom services</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tools Used - Show the actual tools */}
                                            {product?.toolsUsed && product.toolsUsed.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium text-gray-300">Built with:</div>
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        {product.toolsUsed.map((tool, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                                                                <img
                                                                    src={tool.logo}
                                                                    alt={tool.name}
                                                                    className="w-4 h-4"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none'
                                                                    }}
                                                                />
                                                                <span className="text-xs font-medium text-gray-300">
                                                                    {tool.name}
                                                                    {tool.model && <span className="text-gray-500"> ({tool.model})</span>}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Target Audience */}
                                            {product?.targetAudience && (
                                                <div className="flex items-start gap-3 p-3 bg-blue-900/10 rounded-lg border border-blue-800/20">
                                                    <span className="text-blue-400 text-sm">👥</span>
                                                    <div>
                                                        <div className="text-sm font-medium text-blue-300 mb-1">Perfect for:</div>
                                                        <div className="text-sm text-gray-300 leading-relaxed">{product.targetAudience}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Description with proper spacing */}
                                            <div className="flex items-start gap-3 py-2">
                                                <span className="text-lg">💡</span>
                                                <div className="flex-1">
                                                    <DSText
                                                        className="text-sm leading-relaxed mb-3"
                                                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                        {product?.shortDescription}
                                                    </DSText>
                                                    {product?.fullDescription && product.fullDescription !== product.shortDescription && (
                                                        <DSText className="text-sm leading-relaxed text-gray-400">
                                                            {product.fullDescription.slice(0, 150)}
                                                            {product.fullDescription.length > 150 ? '...' : ''}
                                                        </DSText>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Social Actions */}
                                            <div className="flex justify-center gap-4 pt-4 border-t border-gray-800">
                                                <button
                                                    onClick={handleUpvote}
                                                    disabled={isUpvoting}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                                                    <span className="text-gray-400">👍</span>
                                                    <span className="text-xs text-gray-400">{product?.upvotes || 0}</span>
                                                </button>
                                                <button
                                                    onClick={handleLike}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                                                    <span className="text-gray-400">♥</span>
                                                    <span className="text-xs text-gray-400">{product?.favorites || 0}</span>
                                                </button>
                                                <button
                                                    onClick={handleShare}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors relative">
                                                    <span className="text-gray-400">📤</span>
                                                    <span className="text-xs text-gray-400">Share</span>
                                                    {showCopied && (
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs rounded whitespace-nowrap">
                                                            Copied!
                                                        </span>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Tags - Enhanced */}
                                            {product?.tags && product.tags.length > 0 && (
                                                <div className="pt-3 border-t border-gray-800">
                                                    <div className="flex flex-wrap gap-2">
                                                        {product.tags.slice(0, 6).map((tag, index) => (
                                                            <Link
                                                                key={index}
                                                                href={`/explore?tag=${encodeURIComponent(tag)}`}>
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800/50 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer border border-gray-700/50 hover:border-gray-600">
                                                                    #{tag}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                        {product.tags.length > 6 && (
                                                            <span className="px-2 py-1 text-xs text-gray-500">+{product.tags.length - 6}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DSContainer>
                    </section>
                </main>

                {/* Seller Profile Modal */}
                <SellerProfileModal
                    isOpen={showSellerModal}
                    onClose={() => {
                        setShowSellerModal(false)
                    }}
                    sellerId={product?.sellerId?._id || product?.sellerId?.id || product?.sellerId}
                    sellerName={product?.sellerId?.fullName || product?.sellerName}
                    sellerData={product?.sellerId ? getSafeSellerData(product.sellerId) : null}
                />
            </div>
        </ErrorBoundary>
    )
}


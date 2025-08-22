'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowLeft,
    Star,
    ShoppingCart,
    Heart,
    Share2,
    Shield,
    CheckCircle,
    Zap,
    Sparkles,
    Trophy,
    Home,
    ChevronRight,
    MessageSquare,
    Cpu,
    Rocket,
    Info,
    Download,
    Lock,
    RefreshCw,
    Package,
    Verified,
    ThumbsUp,
    Eye,
    FileText,
    Video,
    BookOpen,
    HelpCircle,
    AlertCircle,
    Target,
    Tag,
    ChevronDown,
    Copy,
    Crown
} from 'lucide-react'

// Import Design System Components
import {
    DESIGN_TOKENS,
    DSButton,
    DSHeading,
    DSText,
    DSContainer,
    DSStack,
    DSLoadingState,
    DSBadge
} from '@/lib/design-system'

import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import QuickReview from '@/components/product/QuickReview'
import ReviewsList from '@/components/product/ReviewsList'
import SellerProfileModal from '@/components/shared/SellerProfileModal'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import productsAPI from '@/lib/api/products'
import { promocodeAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { cn } from '@/lib/utils'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import InlineNotification from '@/components/shared/notifications/InlineNotification'

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
}

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

const scaleIn = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
}

// Product type badges with design system colors
const productTypeBadges = {
    prompt: {
        label: 'AI Prompt',
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        icon: Sparkles
    },
    automation: {
        label: 'Automation',
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: Cpu
    },
    agent: {
        label: 'AI Agent',
        color: `bg-[${DESIGN_TOKENS.colors.brand.primary}]/10 text-[${DESIGN_TOKENS.colors.brand.primary}] border-[${DESIGN_TOKENS.colors.brand.primary}]/20`,
        icon: Rocket
    },
    bundle: {
        label: 'Bundle',
        color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        icon: Package
    }
}

export default function ProductPage() {
    // Inline notification state
    const [notification, setNotification] = useState(null)

    // Show inline notification messages  
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000)
    }

    // Clear notification
    const clearNotification = () => setNotification(null)

    const params = useParams()
    const router = useRouter()
    const productSlug = params.productId
    const { isAuthenticated, requireAuth } = useAuth()
    const { addToCart, isInCart, loading: cartLoading } = useCart()

    // State
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [liked, setLiked] = useState(false)
    const [upvoted, setUpvoted] = useState(false)
    const [isUpvoting, setIsUpvoting] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [showCopied, setShowCopied] = useState(false)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [mounted, setMounted] = useState(false)
    const [showStickyBar, setShowStickyBar] = useState(false)
    const [showSellerModal, setShowSellerModal] = useState(false)
    const [expandedFaq, setExpandedFaq] = useState(null)
    const [viewCount, setViewCount] = useState(0)
    const [availablePromocodes, setAvailablePromocodes] = useState([])
    const [showPromocodes, setShowPromocodes] = useState(false)

    // Refs
    const heroRef = useRef(null)
    const ctaRef = useRef(null)

    // Computed values - moved before handlers that use them
    const discountPercentage = useMemo(() => {
        if (!product || product.originalPrice <= product.price) return 0
        return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    }, [product])

    const inCart = useMemo(() => {
        if (!mounted || !product || !isInCart || cartLoading) return false

        try {
            return isInCart(product._id) || isInCart(product.id)
        } catch (error) {
            // Error checking cart status
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

    // Handle hydration
    useEffect(() => {
        setMounted(true)
        // Simulate live view count
        const interval = setInterval(() => {
            setViewCount((prev) => prev + Math.floor(Math.random() * 3))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    // Preload images
    useEffect(() => {
        if (product?.images?.[0]) {
            const link = document.createElement('link')
            link.rel = 'preload'
            link.as = 'image'
            link.href = product.images[0]
            document.head.appendChild(link)
        }
    }, [product])

    // Handle scroll for sticky bar - improved threshold
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
                    setViewCount(response.data.views || 0)

                    // Fetch related products
                    if (response.data._id) {
                        try {
                            const relatedResponse = await productsAPI.getRelatedProducts(response.data._id, 4)
                            if (relatedResponse && relatedResponse.data) {
                                setRelatedProducts(relatedResponse.data)
                            }
                        } catch (relatedError) {
                            console.warn('Failed to fetch related products:', relatedError)
                            // Don't fail the whole page if related products fail
                        }
                    }

                    // Fetch available promocodes
                    try {
                        const promoResponse = await promocodeAPI.getPublicPromocodes({
                            status: 'active',
                            limit: 5
                        })
                        if (promoResponse?.promocodes) {
                            // Filter promocodes that apply to this product
                            const applicablePromos = promoResponse.promocodes.filter((promo) => {
                                // Check if promocode applies to all products
                                if (!promo.applicableProducts || promo.applicableProducts.length === 0) {
                                    return true
                                }
                                // Check if this product is in the applicable list
                                return promo.applicableProducts.includes(response.data._id)
                            })
                            setAvailablePromocodes(applicablePromos)
                        }
                    } catch (promoError) {
                        console.warn('Failed to fetch promocodes:', promoError)
                        // Don't fail the whole page if promocodes fail
                    }
                } else {
                    console.error('No product data in response:', response)
                    setError('Product not found')
                }
            } catch (err) {
                console.error('Error fetching product:', err)
                // Handle different types of errors
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

    // Handlers - now after computed values are defined
    const handleBack = useCallback(() => {
        router.back()
    }, [router])

    const handleAddToCart = useCallback(async () => {
        // Don't allow adding to cart if already purchased
        if (hasPurchased) {
            showMessage('You already own this product', 'info')
            return
        }

        if (isOwner) {
            showMessage("You can't add your own product to cart", 'info')
            return
        }

        // Allow both authenticated and guest users to add to cart
        if (product) {
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
                image: Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : product.thumbnail
            }

            const success = await addToCart(cartProduct)
            if (success) {
                showMessage('Added to cart', 'success')
            }
        }
    }, [product, addToCart, mounted, cartLoading, isInCart, hasPurchased, isOwner])

    const handleBuyNow = useCallback(async () => {
        // Don't allow buying if already purchased
        if (hasPurchased) {
            showMessage('You already own this product', 'info')
            return
        }

        if (isOwner) {
            showMessage("You can't purchase your own product", 'info')
            return
        }

        // Allow both authenticated and guest users to buy now
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
                    image: Array.isArray(product.images) && product.images.length > 0
                        ? product.images[0]
                        : product.thumbnail
                }

                const success = await addToCart(cartProduct)
                if (!success) {
                    // If adding to cart failed, don't navigate
                    return
                }
            }

            // Navigate to checkout after adding to cart
            router.push('/checkout')
        }
    }, [product, addToCart, router, mounted, cartLoading, isInCart, hasPurchased, isOwner])

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
            navigator.clipboard.writeText(url)
            setShowCopied(true)
            setTimeout(() => setShowCopied(false), 2000)
            showMessage('Link copied to clipboard!', 'success')
        }
    }, [mounted, product])

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
    }, [isAuthenticated, liked, product, requireAuth])

    const handleReviewSubmit = useCallback(
        async (reviewData) => {
            try {
                await productsAPI.addReview(product._id, reviewData)
                // Instead of refetching entire product, just update the reviews count locally
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    totalReviews: (prevProduct.totalReviews || 0) + 1,
                    averageRating: prevProduct.averageRating // Keep existing rating for now
                }))
                showMessage('Review submitted successfully!', 'success')
            } catch (error) {
                // Failed to submit review
                throw error
            }
        },
        [product?._id]
    )

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
            // Fix upvote API call - send proper request body structure
            await productsAPI.toggleUpvote(product._id, { isUpvoted: newUpvoted })
            
            // Instead of refetching entire product, just update upvotes locally
            setProduct(prevProduct => ({
                ...prevProduct,
                upvotes: newUpvoted 
                    ? (prevProduct.upvotes || 0) + 1 
                    : Math.max(0, (prevProduct.upvotes || 0) - 1)
            }))
            
            showMessage(newUpvoted ? 'Upvoted!' : 'Removed upvote', 'success')
        } catch (error) {
            // Failed to toggle upvote
            setUpvoted(!newUpvoted)
            showMessage('Failed to update upvote', 'error')
        } finally {
            setIsUpvoting(false)
        }
    }, [isAuthenticated, upvoted, product, requireAuth, isUpvoting])

    const handleDownload = useCallback(async () => {
        if (!hasPurchased) {
            showMessage('You need to purchase this product first', 'error')
            return
        }

        try {
            // Navigate to purchases page or implement download logic
            router.push('/purchases')
            showMessage('Redirected to your purchases', 'success')
        } catch (error) {
            showMessage('Failed to access downloads', 'error')
        }
    }, [hasPurchased, router])

    // Loading state with Design System skeleton
    if (loading) {
        return (
            <div 
                className="min-h-screen"
                style={{ backgroundColor: DESIGN_TOKENS.colors.background.dark }}
            >
                {/* Fixed Inline Notification Position */}
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
                <DSContainer maxWidth="hero" padding="responsive">
                    <div className="pt-20 pb-4 border-b" style={{ borderColor: DESIGN_TOKENS.colors.background.elevated }}>
                        <DSLoadingState type="skeleton" width="16rem" height="1.5rem" />
                    </div>
                    <div className="py-8 lg:py-12">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                            <div className="space-y-4">
                                <DSLoadingState type="skeleton" width="100%" height="400px" className="rounded-2xl" />
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
                                    <DSLoadingState type="skeleton" width="8rem" height="2rem" />
                                    <DSLoadingState type="skeleton" width="75%" height="2.5rem" />
                                    <DSLoadingState type="skeleton" width="100%" height="1.5rem" />
                                </div>
                                <div 
                                    className="rounded-2xl p-6 border space-y-4"
                                    style={{ 
                                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                        borderColor: DESIGN_TOKENS.colors.background.elevated 
                                    }}
                                >
                                    <DSLoadingState type="skeleton" width="10rem" height="3rem" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <DSLoadingState type="skeleton" width="100%" height="1rem" />
                                        <DSLoadingState type="skeleton" width="100%" height="1rem" />
                                        <DSLoadingState type="skeleton" width="100%" height="1rem" />
                                        <DSLoadingState type="skeleton" width="100%" height="1rem" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DSLoadingState type="skeleton" width="100%" height="2.75rem" className="rounded-lg" />
                                        <DSLoadingState type="skeleton" width="100%" height="2.75rem" className="rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DSContainer>
            </div>
        )
    }

    // Error state with Design System
    if (error || !product) {
        return (
            <div 
                className="min-h-screen"
                style={{ backgroundColor: DESIGN_TOKENS.colors.background.dark }}
            >
                <Header />
                <DSContainer maxWidth="hero" padding="responsive">
                    <div className="pt-24 pb-16 text-center">
                        <DSHeading level={1} className="mb-4" style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                            {error || 'Product not found'}
                        </DSHeading>
                        <DSText className="mb-8" style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                            The product you're looking for doesn't exist.
                        </DSText>
                        <DSButton
                            variant="primary"
                            onClick={handleBack}
                        >
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
                }}
            >
                {/* Fixed Inline Notification Position */}
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
                    <section className="pt-20 pb-4 border-b" style={{ borderColor: DESIGN_TOKENS.colors.background.elevated }}>
                        <DSContainer maxWidth="hero" padding="responsive">
                            <nav aria-label="Breadcrumb">
                                <ol className="flex items-center gap-2 text-sm">
                                    <li>
                                        <Link
                                            href="/"
                                            className="transition-colors flex items-center gap-1 hover:underline"
                                            style={{ 
                                                color: DESIGN_TOKENS.colors.text.secondary.dark,
                                            }}
                                        >
                                            <Home className="w-4 h-4" />
                                            Home
                                        </Link>
                                    </li>
                                    <ChevronRight className="w-4 h-4" style={{ color: DESIGN_TOKENS.colors.text.muted.dark }} />
                                    <li>
                                        <Link
                                            href="/explore"
                                            className="transition-colors hover:underline"
                                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                        >
                                            Products
                                        </Link>
                                    </li>
                                    <ChevronRight className="w-4 h-4" style={{ color: DESIGN_TOKENS.colors.text.muted.dark }} />
                                    <li>
                                        <Link
                                            href={`/explore?category=${product.category}`}
                                            className="transition-colors capitalize hover:underline"
                                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                        >
                                            {product.category?.replace('_', ' ')}
                                        </Link>
                                    </li>
                                    <ChevronRight className="w-4 h-4" style={{ color: DESIGN_TOKENS.colors.text.muted.dark }} />
                                    <li>
                                        <DSText
                                            className="font-medium truncate max-w-[200px]"
                                            style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}
                                            aria-current="page"
                                        >
                                            {product.title}
                                        </DSText>
                                    </li>
                                </ol>
                            </nav>
                        </DSContainer>
                    </section>

                    {/* Hero Section - Design System Implementation */}
                    <section
                        ref={heroRef}
                        className="relative py-8 lg:py-12"
                    >
                        {/* Background Effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div 
                                className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
                                style={{ backgroundColor: DESIGN_TOKENS.colors.brand.primary }}
                            />
                            <div 
                                className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
                                style={{ backgroundColor: DESIGN_TOKENS.colors.brand.secondary }}
                            />
                        </div>

                        <DSContainer maxWidth="hero" padding="responsive" className="relative z-10">
                            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                                {/* Product Gallery - Enhanced with DS */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Main Image with Enhanced UI */}
                                    <div 
                                        className="relative aspect-square rounded-2xl overflow-hidden group"
                                        style={{ backgroundColor: DESIGN_TOKENS.colors.background.card.dark }}
                                    >
                                        <OptimizedImage
                                            src={
                                                Array.isArray(product.images) && product.images.length > 0
                                                    ? product.images[selectedImage]
                                                    : product.thumbnail
                                            }
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            priority
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                                            quality={85}
                                            placeholder="blur"
                                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                        />

                                        {/* Floating Badges */}
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                            {/* Product Type */}
                                            {product.type && productTypeBadges[product.type] && (
                                                <motion.div
                                                    initial={{ y: -20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-md flex items-center gap-2',
                                                        productTypeBadges[product.type].color
                                                    )}
                                                >
                                                    {React.createElement(productTypeBadges[product.type].icon, { className: 'w-4 h-4' })}
                                                    {productTypeBadges[product.type].label}
                                                </motion.div>
                                            )}

                                            {/* Discount Badge */}
                                            {discountPercentage > 0 && (
                                                <DSBadge variant="primary" size="medium">
                                                    Save {discountPercentage}%
                                                </DSBadge>
                                            )}
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="absolute bottom-4 right-4 flex gap-2">
                                            {product.previewVideo && (
                                                <button
                                                    onClick={() => window.open(product.previewVideo, '_blank')}
                                                    className="p-2.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all"
                                                    aria-label="Watch preview video"
                                                >
                                                    <Video className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Thumbnail Gallery - Enhanced */}
                                    {Array.isArray(product.images) && product.images.length > 1 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                            {product.images.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(index)}
                                                    className={cn(
                                                        'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                                                        selectedImage === index
                                                            ? `border-[${DESIGN_TOKENS.colors.brand.primary}] ring-2`
                                                            : 'hover:border-gray-600'
                                                    )}
                                                    style={{
                                                        borderColor: selectedImage === index 
                                                            ? DESIGN_TOKENS.colors.brand.primary
                                                            : DESIGN_TOKENS.colors.background.elevated,
                                                        ringColor: selectedImage === index 
                                                            ? `${DESIGN_TOKENS.colors.brand.primary}20`
                                                            : 'transparent'
                                                    }}
                                                >
                                                    <Image
                                                        src={image}
                                                        alt={`${product.title} ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="80px"
                                                        quality={75}
                                                    />
                                                    {selectedImage === index && (
                                                        <div 
                                                            className="absolute inset-0"
                                                            style={{ backgroundColor: `${DESIGN_TOKENS.colors.brand.primary}10` }}
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Product Info - Design System Implementation */}
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Already Bought Banner */}
                                    {hasPurchased && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm"
                                        >
                                            <DSStack direction="row" gap="3" align="center">
                                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                                    <Crown className="w-5 h-5 text-green-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <DSHeading level={4} className="text-green-400 mb-1">
                                                        Already Purchased
                                                    </DSHeading>
                                                    <DSText size="sm" className="text-green-300/80">
                                                        You own this product. Access it from your purchases.
                                                    </DSText>
                                                </div>
                                                <DSButton
                                                    variant="secondary"
                                                    size="small"
                                                    onClick={handleDownload}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Access
                                                </DSButton>
                                            </DSStack>
                                        </motion.div>
                                    )}

                                    {/* Title & Category */}
                                    <div>
                                        <DSStack direction="row" gap="2" className="mb-3">
                                            <DSBadge variant="primary" size="medium">
                                                {product.category?.replace('_', ' ').charAt(0).toUpperCase() +
                                                    product.category?.slice(1).replace('_', ' ')}
                                            </DSBadge>
                                            {product.isVerified && (
                                                <DSBadge variant="secondary" size="medium">
                                                    <Verified className="w-3 h-3" />
                                                    Verified
                                                </DSBadge>
                                            )}
                                        </DSStack>

                                        <DSHeading 
                                            level={1} 
                                            variant="hero"
                                            className="mb-3"
                                            style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}
                                        >
                                            {product.title}
                                        </DSHeading>

                                        <DSText 
                                            size="lg" 
                                            className="leading-relaxed"
                                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                        >
                                            {product.shortDescription}
                                        </DSText>
                                    </div>

                                    {/* Price Section - Design System Card */}
                                    <div 
                                        className="backdrop-blur-sm rounded-2xl p-6 border"
                                        style={{ 
                                            backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                            borderColor: DESIGN_TOKENS.colors.background.elevated 
                                        }}
                                    >
                                        <DSStack direction="row" justify="space-between" align="flex-end" className="mb-4">
                                            <div>
                                                <DSStack direction="row" gap="3" align="baseline">
                                                    <DSHeading 
                                                        level={2} 
                                                        variant="display"
                                                        style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}
                                                    >
                                                        ${product.price}
                                                    </DSHeading>
                                                    {product.originalPrice > product.price && (
                                                        <>
                                                            <DSText 
                                                                size="xl" 
                                                                className="line-through"
                                                                style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}
                                                            >
                                                                ${product.originalPrice}
                                                            </DSText>
                                                            <DSText size="lg" className="font-medium text-green-400">
                                                                Save ${savingsAmount}
                                                            </DSText>
                                                        </>
                                                    )}
                                                </DSStack>
                                                {product.priceNote && (
                                                    <DSText 
                                                        size="sm" 
                                                        className="mt-1"
                                                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                    >
                                                        {product.priceNote}
                                                    </DSText>
                                                )}
                                            </div>

                                            {/* Urgency Indicators */}
                                            <div className="text-right">
                                                {product.stock && product.stock < 10 && (
                                                    <DSText size="sm" className="text-orange-400 font-medium flex items-center gap-1">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Only {product.stock} left
                                                    </DSText>
                                                )}
                                            </div>
                                        </DSStack>

                                        {/* Trust Indicators */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            {[
                                                { icon: Shield, text: "30-day money back", color: "text-green-400" },
                                                { icon: Zap, text: "Instant delivery", color: `text-[${DESIGN_TOKENS.colors.brand.primary}]` },
                                                { icon: RefreshCw, text: "Lifetime updates", color: "text-blue-400" },
                                                { icon: Lock, text: "Secure checkout", color: "text-purple-400" }
                                            ].map((item, index) => (
                                                <DSStack key={index} direction="row" gap="2" align="center">
                                                    <item.icon className={`w-4 h-4 ${item.color}`} />
                                                    <DSText 
                                                        size="sm"
                                                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                    >
                                                        {item.text}
                                                    </DSText>
                                                </DSStack>
                                            ))}
                                        </div>

                                        {/* CTA Buttons - Design System Implementation */}
                                        <div ref={ctaRef} className="space-y-3">
                                            {hasPurchased ? (
                                                <DSStack gap="3">
                                                    <DSButton
                                                        variant="primary"
                                                        size="large"
                                                        onClick={handleDownload}
                                                        className="w-full"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                        Access Your Product
                                                    </DSButton>
                                                    <DSText 
                                                        size="sm" 
                                                        className="text-center"
                                                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                    >
                                                        You already own this product
                                                    </DSText>
                                                </DSStack>
                                            ) : isOwner ? (
                                                <DSStack gap="3">
                                                    <Link href="/seller/products" className="w-full">
                                                        <DSButton
                                                            variant="primary"
                                                            size="large"
                                                            className="w-full"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                            Manage Your Product
                                                        </DSButton>
                                                    </Link>
                                                    <DSText 
                                                        size="sm" 
                                                        className="text-center"
                                                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                    >
                                                        This is your product
                                                    </DSText>
                                                </DSStack>
                                            ) : (
                                                <DSStack direction="row" gap="3">
                                                    <DSButton
                                                        variant="primary"
                                                        size="large"
                                                        onClick={handleBuyNow}
                                                        className="flex-1"
                                                        aria-label={`Buy ${product.title} now for $${product.price}`}
                                                    >
                                                        <Zap className="w-4 h-4" />
                                                        Buy Now
                                                    </DSButton>
                                                    <DSButton
                                                        variant="secondary"
                                                        size="large"
                                                        onClick={handleAddToCart}
                                                        disabled={inCart}
                                                        className="flex-1"
                                                    >
                                                        {inCart ? (
                                                            <>
                                                                <CheckCircle className="w-4 h-4" />
                                                                In Cart
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShoppingCart className="w-4 h-4" />
                                                                Add to Cart
                                                            </>
                                                        )}
                                                    </DSButton>
                                                </DSStack>
                                            )}

                                            {/* Social Actions */}
                                            <DSStack direction="row" gap="2">
                                                <button
                                                    onClick={handleUpvote}
                                                    disabled={isUpvoting}
                                                    className={cn(
                                                        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all border text-sm',
                                                        upvoted
                                                            ? `bg-[${DESIGN_TOKENS.colors.brand.primary}]/10 border-[${DESIGN_TOKENS.colors.brand.primary}]/20`
                                                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600',
                                                        isUpvoting && 'opacity-50 cursor-not-allowed'
                                                    )}
                                                    style={{
                                                        color: upvoted ? DESIGN_TOKENS.colors.brand.primary : undefined
                                                    }}
                                                    title="Upvote this product"
                                                >
                                                    <ThumbsUp className={cn('w-4 h-4', upvoted && 'fill-current')} />
                                                    {product.upvotes > 0 && <span className="font-medium">{product.upvotes}</span>}
                                                </button>

                                                <button
                                                    onClick={handleLike}
                                                    className={cn(
                                                        'p-2 rounded-lg transition-all border',
                                                        liked
                                                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-red-500 hover:border-gray-600'
                                                    )}
                                                    title="Save to favorites"
                                                >
                                                    <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
                                                </button>

                                                <button
                                                    onClick={handleShare}
                                                    className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white relative"
                                                    title="Share this product"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    {showCopied && (
                                                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-800 text-xs rounded-lg whitespace-nowrap shadow-lg">
                                                            Link copied!
                                                        </span>
                                                    )}
                                                </button>
                                            </DSStack>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            { 
                                                value: product.averageRating?.toFixed(1) || '0.0', 
                                                label: `${product.totalReviews || 0} reviews`,
                                                icon: <Star className="w-5 h-5 fill-current text-yellow-500" />
                                            },
                                            { value: product.sales || 0, label: 'Sales' },
                                            { value: product.views || 0, label: 'Views' },
                                            { value: '24/7', label: 'Support' }
                                        ].map((stat, index) => (
                                            <div key={index} className="text-center">
                                                <DSStack direction="row" justify="center" align="center" gap="1" className="mb-1">
                                                    {stat.icon}
                                                    <DSText 
                                                        size="lg" 
                                                        className="font-bold"
                                                        style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}
                                                    >
                                                        {stat.value}
                                                    </DSText>
                                                </DSStack>
                                                <DSText 
                                                    size="xs"
                                                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                >
                                                    {stat.label}
                                                </DSText>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Seller Info Card - Design System */}
                                    <div 
                                        className="backdrop-blur-sm rounded-xl p-4 border"
                                        style={{ 
                                            backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                            borderColor: DESIGN_TOKENS.colors.background.elevated 
                                        }}
                                    >
                                        <DSStack direction="row" justify="space-between" align="center">
                                            <DSStack direction="row" gap="3" align="center">
                                                <div className="relative">
                                                    <div 
                                                        className="w-12 h-12 rounded-full flex items-center justify-center"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.brand.primary}, ${DESIGN_TOKENS.colors.brand.secondary})`
                                                        }}
                                                    >
                                                        <DSText 
                                                            size="lg" 
                                                            className="font-bold"
                                                            style={{ color: DESIGN_TOKENS.colors.brand.primaryText }}
                                                        >
                                                            {product.sellerId?.fullName?.charAt(0) || 'S'}
                                                        </DSText>
                                                    </div>
                                                </div>
                                                <div>
                                                    <DSText 
                                                        className="font-semibold"
                                                        style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}
                                                    >
                                                        {product.sellerId?.fullName || 'Anonymous Seller'}
                                                    </DSText>
                                                    <DSStack direction="row" gap="3">
                                                        <DSStack direction="row" gap="1" align="center">
                                                            <Trophy className="w-3 h-3" />
                                                            <DSText 
                                                                size="xs"
                                                                style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                            >
                                                                {product.sellerId?.stats?.totalSales || 0}+ sales
                                                            </DSText>
                                                        </DSStack>
                                                        <DSStack direction="row" gap="1" align="center">
                                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                            <DSText 
                                                                size="xs"
                                                                style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                            >
                                                                {product.sellerId?.stats?.averageRating?.toFixed(1) || '0.0'}
                                                            </DSText>
                                                        </DSStack>
                                                    </DSStack>
                                                </div>
                                            </DSStack>
                                            <DSButton
                                                variant="secondary"
                                                size="small"
                                                onClick={() => setShowSellerModal(true)}
                                            >
                                                View Profile
                                            </DSButton>
                                        </DSStack>
                                    </div>
                                </motion.div>
                            </div>
                        </DSContainer>
                    </section>

                    {/* Product Details - Tabbed Content with Design System */}
                    <section 
                        className="py-12 border-t" 
                        style={{ borderColor: DESIGN_TOKENS.colors.background.elevated }}
                    >
                        <DSContainer maxWidth="hero" padding="responsive">
                            {/* Tab Navigation - Design System Implementation */}
                            <div className="mb-8">
                                <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                                    {[
                                        { id: 'overview', label: 'Overview', icon: Info },
                                        { id: 'features', label: 'Features', icon: Sparkles },
                                        { id: 'howitworks', label: 'How It Works', icon: Cpu },
                                        { id: 'reviews', label: 'Reviews', icon: MessageSquare, count: product.totalReviews },
                                        { id: 'faq', label: 'FAQ', icon: HelpCircle }
                                    ].map((tab) => (
                                        <DSButton
                                            key={tab.id}
                                            variant={activeTab === tab.id ? "primary" : "secondary"}
                                            size="medium"
                                            onClick={() => setActiveTab(tab.id)}
                                            className="whitespace-nowrap"
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                            {tab.count > 0 && (
                                                <span 
                                                    className="ml-1 px-2 py-0.5 rounded-full text-xs"
                                                    style={{ backgroundColor: `${DESIGN_TOKENS.colors.brand.primary}20` }}
                                                >
                                                    {tab.count}
                                                </span>
                                            )}
                                        </DSButton>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content - Complete Implementation with Design System */}
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        variants={fadeInUp}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                    >
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Description Card */}
                                            <div 
                                                className="backdrop-blur-sm rounded-xl p-6 border"
                                                style={{ 
                                                    backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                                    borderColor: DESIGN_TOKENS.colors.background.elevated 
                                                }}
                                            >
                                                <DSHeading level={3} className="mb-4">
                                                    <DSStack direction="row" gap="2" align="center">
                                                        <BookOpen className="w-5 h-5" style={{ color: DESIGN_TOKENS.colors.brand.primary }} />
                                                        <span style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>About This Product</span>
                                                    </DSStack>
                                                </DSHeading>
                                                <DSText 
                                                    className="leading-relaxed whitespace-pre-wrap"
                                                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                >
                                                    {product.fullDescription || product.shortDescription}
                                                </DSText>
                                            </div>

                                            {/* Key Benefits */}
                                            {product.benefits && product.benefits.length > 0 && (
                                                <div 
                                                    className="backdrop-blur-sm rounded-xl p-6 border"
                                                    style={{ 
                                                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                                        borderColor: DESIGN_TOKENS.colors.background.elevated 
                                                    }}
                                                >
                                                    <DSHeading level={3} className="mb-4">
                                                        <DSStack direction="row" gap="2" align="center">
                                                            <Target className="w-5 h-5" style={{ color: DESIGN_TOKENS.colors.brand.primary }} />
                                                            <span style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>Key Benefits</span>
                                                        </DSStack>
                                                    </DSHeading>
                                                    <DSStack gap="3">
                                                        {product.benefits.slice(0, 5).map((benefit, index) => (
                                                            <DSStack key={index} direction="row" gap="3" align="flex-start">
                                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                                <DSText style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                                    {benefit}
                                                                </DSText>
                                                            </DSStack>
                                                        ))}
                                                    </DSStack>
                                                </div>
                                            )}

                                            {/* What's Included */}
                                            <div 
                                                className="backdrop-blur-sm rounded-xl p-6 border"
                                                style={{ 
                                                    backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                                    borderColor: DESIGN_TOKENS.colors.background.elevated 
                                                }}
                                            >
                                                <DSHeading level={3} className="mb-4">
                                                    <DSStack direction="row" gap="2" align="center">
                                                        <Package className="w-5 h-5" style={{ color: DESIGN_TOKENS.colors.brand.primary }} />
                                                        <span style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>What's Included</span>
                                                    </DSStack>
                                                </DSHeading>
                                                <DSStack gap="2">
                                                    {[
                                                        { icon: Download, text: "Instant digital download" },
                                                        { icon: FileText, text: "Documentation & guides" },
                                                        { icon: RefreshCw, text: "Free lifetime updates" },
                                                        { icon: MessageSquare, text: "24/7 customer support" }
                                                    ].map((item, index) => (
                                                        <DSStack key={index} direction="row" gap="2" align="center">
                                                            <item.icon className="w-4 h-4" style={{ color: DESIGN_TOKENS.colors.text.muted.dark }} />
                                                            <DSText style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                                {item.text}
                                                            </DSText>
                                                        </DSStack>
                                                    ))}
                                                </DSStack>
                                            </div>

                                            {/* Product Details */}
                                            <div 
                                                className="backdrop-blur-sm rounded-xl p-6 border"
                                                style={{ 
                                                    backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                                    borderColor: DESIGN_TOKENS.colors.background.elevated 
                                                }}
                                            >
                                                <DSHeading level={3} className="mb-4">
                                                    <DSStack direction="row" gap="2" align="center">
                                                        <Info className="w-5 h-5" style={{ color: DESIGN_TOKENS.colors.brand.primary }} />
                                                        <span style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>Product Details</span>
                                                    </DSStack>
                                                </DSHeading>
                                                <DSStack gap="3">
                                                    {[
                                                        { label: "Category", value: product.category?.replace('_', ' ') },
                                                        { label: "Type", value: product.type },
                                                        { label: "Version", value: product.currentVersion || '1.0.0' },
                                                        { label: "Last Updated", value: new Date(product.updatedAt).toLocaleDateString() },
                                                        { label: "File Size", value: product.fileSize || '< 10MB' }
                                                    ].map((detail, index) => (
                                                        <DSStack key={index} direction="row" justify="space-between">
                                                            <DSText style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                                {detail.label}
                                                            </DSText>
                                                            <DSText 
                                                                className="capitalize"
                                                                style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                            >
                                                                {detail.value}
                                                            </DSText>
                                                        </DSStack>
                                                    ))}
                                                </DSStack>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {product.tags && product.tags.length > 0 && (
                                            <div className="mt-8">
                                                <DSHeading level={3} className="mb-4" style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                    Related Tags
                                                </DSHeading>
                                                <div className="flex flex-wrap gap-2">
                                                    {product.tags.map((tag, index) => (
                                                        <Link
                                                            key={index}
                                                            href={`/explore?tag=${encodeURIComponent(tag)}`}
                                                        >
                                                            <DSBadge variant="secondary" size="medium" className="hover:opacity-80 transition-opacity">
                                                                #{tag}
                                                            </DSBadge>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'features' && (
                                    <motion.div
                                        key="features"
                                        variants={stagger}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        {product.features?.map((feature, index) => (
                                            <motion.div
                                                key={index}
                                                variants={scaleIn}
                                                className="backdrop-blur-sm rounded-xl p-6 border transition-all group hover:shadow-lg"
                                                style={{ 
                                                    backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                                    borderColor: DESIGN_TOKENS.colors.background.elevated 
                                                }}
                                            >
                                                <div 
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                                                    style={{ 
                                                        backgroundColor: `${DESIGN_TOKENS.colors.brand.primary}10`
                                                    }}
                                                >
                                                    <Sparkles className="w-6 h-6" style={{ color: DESIGN_TOKENS.colors.brand.primary }} />
                                                </div>
                                                <DSHeading level={4} className="mb-2" style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                    {typeof feature === 'string' ? feature : feature.title}
                                                </DSHeading>
                                                {typeof feature !== 'string' && feature.description && (
                                                    <DSText size="sm" style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                        {feature.description}
                                                    </DSText>
                                                )}
                                            </motion.div>
                                        )) || (
                                            <div className="col-span-full text-center py-12">
                                                <DSText style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}>
                                                    No features listed yet.
                                                </DSText>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'howitworks' && (
                                    <motion.div
                                        key="howitworks"
                                        variants={fadeInUp}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="max-w-3xl"
                                    >
                                        {product.howItWorks && product.howItWorks.length > 0 ? (
                                            <div className="relative">
                                                {/* Timeline */}
                                                <div 
                                                    className="absolute left-6 top-0 bottom-0 w-0.5 opacity-50"
                                                    style={{
                                                        background: `linear-gradient(to bottom, ${DESIGN_TOKENS.colors.brand.primary}, ${DESIGN_TOKENS.colors.brand.primary}50, transparent)`
                                                    }}
                                                />

                                                <DSStack gap="6">
                                                    {product.howItWorks.map((step, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <DSStack direction="row" gap="4">
                                                                {/* Step Number */}
                                                                <div className="relative z-10">
                                                                    <div 
                                                                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg"
                                                                        style={{
                                                                            background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.brand.primary}, ${DESIGN_TOKENS.colors.brand.secondary})`,
                                                                            color: DESIGN_TOKENS.colors.brand.primaryText
                                                                        }}
                                                                    >
                                                                        {index + 1}
                                                                    </div>
                                                                </div>

                                                                {/* Step Content */}
                                                                <div 
                                                                    className="flex-1 backdrop-blur-sm rounded-xl p-5 border"
                                                                    style={{ 
                                                                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                                                        borderColor: DESIGN_TOKENS.colors.background.elevated 
                                                                    }}
                                                                >
                                                                    <DSHeading level={4} className="mb-2" style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                                        Step {index + 1}
                                                                    </DSHeading>
                                                                    <DSText style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                                        {step}
                                                                    </DSText>
                                                                </div>
                                                            </DSStack>
                                                        </motion.div>
                                                    ))}
                                                </DSStack>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <DSText style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}>
                                                    No process information available yet.
                                                </DSText>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'reviews' && (
                                    <motion.div
                                        key="reviews"
                                        variants={fadeInUp}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                    >
                                        {/* Quick Review for authenticated users */}
                                        {isAuthenticated && (
                                            <QuickReview
                                                productId={product._id}
                                                onReviewSubmit={handleReviewSubmit}
                                                className="mb-8"
                                            />
                                        )}

                                        {/* Reviews List */}
                                        <ReviewsList
                                            reviews={product.reviews || []}
                                            totalReviews={product.totalReviews || 0}
                                            averageRating={product.averageRating || 0}
                                            reviewStats={product.reviewStats || {}}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'faq' && (
                                    <motion.div
                                        key="faq"
                                        variants={stagger}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="max-w-3xl space-y-4"
                                    >
                                        {product.faqs && product.faqs.length > 0 ? (
                                            product.faqs.map((faq, index) => (
                                                <motion.div
                                                    key={index}
                                                    variants={fadeInUp}
                                                    className="backdrop-blur-sm rounded-xl border overflow-hidden"
                                                    style={{ 
                                                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                                        borderColor: DESIGN_TOKENS.colors.background.elevated 
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                                        className="w-full p-6 text-left flex items-start justify-between gap-4 hover:opacity-80 transition-opacity"
                                                    >
                                                        <DSStack direction="row" gap="3" align="flex-start" className="flex-1">
                                                            <HelpCircle 
                                                                className="w-5 h-5 flex-shrink-0 mt-0.5" 
                                                                style={{ color: DESIGN_TOKENS.colors.brand.primary }} 
                                                            />
                                                            <DSHeading level={4} style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                                {faq.question}
                                                            </DSHeading>
                                                        </DSStack>
                                                        <ChevronRight
                                                            className={cn(
                                                                'w-5 h-5 transition-transform',
                                                                expandedFaq === index && 'rotate-90'
                                                            )}
                                                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                        />
                                                    </button>
                                                    <AnimatePresence>
                                                        {expandedFaq === index && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="px-6 pb-6"
                                                            >
                                                                <DSText 
                                                                    className="pl-8"
                                                                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                                >
                                                                    {faq.answer}
                                                                </DSText>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <DSText style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}>
                                                    No FAQs available yet.
                                                </DSText>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Related Products Section */}
                            {relatedProducts.length > 0 && (
                                <div className="mt-16">
                                    <DSStack direction="row" justify="space-between" align="center" className="mb-8">
                                        <DSHeading level={2} style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                            You Might Also Like
                                        </DSHeading>
                                        <Link
                                            href={`/explore?category=${product.category}`}
                                            className="transition-colors hover:underline flex items-center gap-1"
                                            style={{ color: DESIGN_TOKENS.colors.brand.primary }}
                                        >
                                            View More
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </DSStack>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {relatedProducts.map((relatedProduct) => (
                                            <motion.div
                                                key={relatedProduct._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                whileHover={{ y: -5 }}
                                                className="group cursor-pointer"
                                                onClick={() => router.push(`/products/${relatedProduct.slug}`)}
                                            >
                                                <div 
                                                    className="rounded-xl overflow-hidden border transition-all h-full flex flex-col hover:shadow-lg"
                                                    style={{ 
                                                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                                        borderColor: DESIGN_TOKENS.colors.background.elevated 
                                                    }}
                                                >
                                                    <div className="aspect-video relative overflow-hidden" style={{ backgroundColor: DESIGN_TOKENS.colors.background.elevated }}>
                                                        <OptimizedImage
                                                            src={relatedProduct.thumbnail}
                                                            alt={relatedProduct.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                            quality={75}
                                                            loading="lazy"
                                                        />
                                                        {relatedProduct.discountPercentage > 0 && (
                                                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                                -{relatedProduct.discountPercentage}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <DSHeading 
                                                            level={3} 
                                                            className="mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity"
                                                            style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}
                                                        >
                                                            {relatedProduct.title}
                                                        </DSHeading>
                                                        <DSText 
                                                            size="sm" 
                                                            className="mb-3 line-clamp-2 flex-1"
                                                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}
                                                        >
                                                            {relatedProduct.shortDescription}
                                                        </DSText>
                                                        <DSStack direction="row" justify="space-between" align="center">
                                                            <div>
                                                                <DSText size="xl" className="font-bold" style={{ color: DESIGN_TOKENS.colors.brand.primary }}>
                                                                    ${relatedProduct.price}
                                                                </DSText>
                                                                {relatedProduct.originalPrice > relatedProduct.price && (
                                                                    <DSText 
                                                                        size="sm" 
                                                                        className="line-through ml-2"
                                                                        style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}
                                                                    >
                                                                        ${relatedProduct.originalPrice}
                                                                    </DSText>
                                                                )}
                                                            </div>
                                                            <DSStack direction="row" gap="1" align="center">
                                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                                <DSText size="sm" style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                                    {relatedProduct.averageRating?.toFixed(1) || '0.0'}
                                                                </DSText>
                                                            </DSStack>
                                                        </DSStack>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sticky Purchase Bar */}
                            <AnimatePresence>
                                {mounted && showStickyBar && (
                                    <motion.div
                                        initial={{ y: 100 }}
                                        animate={{ y: 0 }}
                                        exit={{ y: 100 }}
                                        className="fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t z-40 shadow-2xl"
                                        style={{ 
                                            backgroundColor: `${DESIGN_TOKENS.colors.background.card.dark}95`,
                                            borderColor: DESIGN_TOKENS.colors.background.elevated 
                                        }}
                                    >
                                        <DSContainer maxWidth="hero" padding="responsive">
                                            <div className="py-4">
                                                <DSStack direction="row" justify="space-between" align="center" gap="4">
                                                    <DSStack direction="row" gap="4" align="center">
                                                        <div className="w-12 h-12 relative rounded-lg overflow-hidden hidden sm:block" style={{ backgroundColor: DESIGN_TOKENS.colors.background.elevated }}>
                                                            <OptimizedImage
                                                                src={product.thumbnail}
                                                                alt={product.title}
                                                                fill
                                                                className="object-cover"
                                                                sizes="48px"
                                                                quality={75}
                                                            />
                                                        </div>
                                                        <div>
                                                            <DSHeading level={3} className="line-clamp-1" style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                                                {product.title}
                                                            </DSHeading>
                                                            <DSStack direction="row" gap="3" align="center">
                                                                <DSText size="2xl" className="font-bold" style={{ color: DESIGN_TOKENS.colors.brand.primary }}>
                                                                    ${product.price}
                                                                </DSText>
                                                                {product.originalPrice > product.price && (
                                                                    <DSText size="sm" className="line-through" style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}>
                                                                        ${product.originalPrice}
                                                                    </DSText>
                                                                )}
                                                                {product.averageRating > 0 && (
                                                                    <DSStack direction="row" gap="1" align="center">
                                                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                                        <DSText size="sm" style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                                            {product.averageRating.toFixed(1)}
                                                                        </DSText>
                                                                    </DSStack>
                                                                )}
                                                            </DSStack>
                                                        </div>
                                                    </DSStack>

                                                    <DSStack direction="row" gap="3" align="center">
                                                        {hasPurchased ? (
                                                            <DSButton
                                                                variant="primary"
                                                                onClick={handleDownload}
                                                            >
                                                                <Download className="w-5 h-5" />
                                                            </DSButton>
                                                        ) : isOwner ? (
                                                            <Link href="/seller/products">
                                                                <DSButton variant="primary">
                                                                    Manage
                                                                </DSButton>
                                                            </Link>
                                                        ) : (
                                                            <>
                                                                <DSButton
                                                                    variant="primary"
                                                                    onClick={handleBuyNow}
                                                                >
                                                                    Buy Now
                                                                </DSButton>
                                                                <DSButton
                                                                    variant="secondary"
                                                                    onClick={handleAddToCart}
                                                                    disabled={inCart}
                                                                >
                                                                    <ShoppingCart className="w-5 h-5" />
                                                                </DSButton>
                                                            </>
                                                        )}
                                                    </DSStack>
                                                </DSStack>
                                            </div>
                                        </DSContainer>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </DSContainer>
                    </section>
                </main>
            </div>
        </ErrorBoundary>
    )
}
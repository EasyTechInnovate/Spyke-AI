'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShoppingCart, BookOpen, Sparkles, Play, HelpCircle, BarChart3, Package, Star } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { productsAPI } from '@/lib/api'
import { DESIGN_TOKENS, DSContainer, DSHeading, DSText, DSButton, DSLoadingState } from '@/lib/design-system'
import ProductOverview from '@/components/product/ProductOverview'
import ProductFeatures from '@/components/product/ProductFeatures'
import ProductHowItWorks from '@/components/product/ProductHowItWorks'
import ProductSpecs from '@/components/product/ProductSpecs'
import ProductFAQ from '@/components/product/ProductFAQ'
import ProductReviews from '@/components/product/ProductReviews'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb'
import ProductHero from '@/components/product/ProductHero'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
import Notification from '@/components/shared/Notification'
import { track } from '@/lib/utils/analytics'
import { TRACKING_EVENTS, TRACKING_PROPERTIES } from '@/lib/constants/tracking'

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
        id: 'reviews',
        label: 'Reviews',
        icon: Star,
        description: 'Customer feedback and ratings',
        component: ProductReviews
    },
    {
        id: 'faq',
        label: 'FAQ',
        icon: HelpCircle,
        description: 'Common questions',
        component: ProductFAQ
    }
]
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
    const [notifications, setNotifications] = useState([])
    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random()
        const newNotification = { id, message, type }
        setNotifications((prev) => [...prev, newNotification])
    }, [])
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }, [])
    const params = useParams()
    const router = useRouter()
    const productSlug = params.productId
    const { isAuthenticated, requireAuth } = useAuth()
    const { addToCart, isInCart, loading: cartLoading } = useCart()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [mounted, setMounted] = useState(false)
    const [selectedImage, setSelectedImage] = useState(0)
    const [liked, setLiked] = useState(false)
    const [upvoted, setUpvoted] = useState(false)
    const [isUpvoting, setIsUpvoting] = useState(false)
    const [showCopied, setShowCopied] = useState(false)
    const [showStickyBar, setShowStickyBar] = useState(false)
    const [addingToCart, setAddingToCart] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [relatedProducts, setRelatedProducts] = useState([])
    const hasTrackedViewRef = useRef(false) // Use ref instead of state to avoid re-renders
    const ctaRef = useRef(null)
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
    useEffect(() => {
        setMounted(true)
    }, [])
    useEffect(() => {
        if (!mounted || !ctaRef.current) return
        const handleScroll = () => {
            const ctaRect = ctaRef.current?.getBoundingClientRect()
            setShowStickyBar(ctaRect && ctaRect.bottom < 0)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [mounted])
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await productsAPI.getProductBySlug(productSlug)
                if (response && response.data) {
                    const productData = response.data
                    setProduct(productData)
                    setLiked(productData.userInteractions?.isLiked || false)
                    setUpvoted(productData.userInteractions?.isUpvoted || false)

                    // Track product viewed event only once per product
                    if (!hasTrackedViewRef.current) {
                        track(TRACKING_EVENTS.PRODUCT_VIEWED, {
                            product_id: productData._id,
                            product_name: productData.title,
                            product_category: productData.category,
                            product_price: productData.price,
                            product_slug: productSlug
                        })
                        hasTrackedViewRef.current = true
                    }

                    if (productData._id) {
                        try {
                            const relatedResponse = await productsAPI.getRelatedProducts(productData._id, 4)
                            if (relatedResponse && relatedResponse.data) {
                                setRelatedProducts(relatedResponse.data)
                            }
                        } catch (relatedError) {
                            console.warn('Failed to fetch related products:', relatedError)
                        }
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
    const handleBack = useCallback(() => {
        router.back()
    }, [router])
    const handleAddToCart = useCallback(async () => {
        if (!product) return
        if (!isAuthenticated) {
            try {
                const redirectTo = typeof window !== 'undefined' ? window.location.pathname + window.location.search : `/products/${productSlug}`
                router.push(`/signin?redirect=${encodeURIComponent(redirectTo)}`)
            } catch (_) {
                router.push('/signin')
            }
            return
        }
        if (hasPurchased) {
            addNotification('You already own this product', 'info')
            return
        }
        if (isOwner) {
            addNotification("You can't add your own product to cart", 'info')
            return
        }
        const alreadyInCart = mounted && !cartLoading && isInCart && (isInCart(product._id) || isInCart(product.id))
        if (alreadyInCart) {
            addNotification('Product is already in cart', 'info')
            return
        }
        setAddingToCart(true)
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
            await new Promise((resolve) => setTimeout(resolve, 2000))

            const success = await addToCart(cartProduct)
            if (success) {
                addNotification(`"${product.title}" has been added to your cart!`, 'success')
                track(TRACKING_EVENTS.PRODUCT_ADDED_TO_CART, {
                    [TRACKING_PROPERTIES.PRODUCT_ID]: product._id,
                    [TRACKING_PROPERTIES.PRODUCT_NAME]: product.title,
                    [TRACKING_PROPERTIES.PRODUCT_CATEGORY]: product.category,
                    [TRACKING_PROPERTIES.PRODUCT_PRICE]: product.price
                })

                setTimeout(() => {
                    setAddingToCart(false)
                }, 500)
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
            } else {
                setAddingToCart(false)
            }
        } catch (error) {
            console.log('🚨 Unexpected error in handleAddToCart:', error)
            const errorMessage = error.message || 'Failed to add to cart. Please try again.'
            if (errorMessage.includes('already purchased')) {
                addNotification('You have already purchased this product', 'warning')
            } else if (errorMessage.includes('already in cart')) {
                addNotification('This product is already in your cart', 'info')
            } else if (errorMessage.includes('out of stock')) {
                addNotification('This product is currently out of stock', 'error')
            } else if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
                addNotification('Please sign in to add items to cart', 'warning')
            } else {
                addNotification(errorMessage, 'error')
            }
            setAddingToCart(false)
        }
    }, [product, hasPurchased, isOwner, mounted, cartLoading, isInCart, addToCart, addNotification, isAuthenticated, router, productSlug])
    const handleBuyNow = useCallback(async () => {
        if (!isAuthenticated) {
            try {
                const redirectTo = typeof window !== 'undefined' ? window.location.pathname + window.location.search : `/products/${productSlug}`
                router.push(`/signin?redirect=${encodeURIComponent(redirectTo)}`)
            } catch (_) {
                router.push('/signin')
            }
            return
        }
        if (hasPurchased) {
            addNotification('You have already purchased this product', 'info')
            return
        }
        if (isOwner) {
            addNotification("You can't purchase your own product", 'info')
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
                    console.log('🚨 Error in handleBuyNow addToCart:', error)
                    const errorMessage = error.message || 'Failed to add to cart'
                    if (errorMessage.includes('already purchased')) {
                        addNotification('You have already purchased this product', 'info')
                    } else if (errorMessage.includes('already in cart')) {
                        addNotification('This product is already in your cart', 'info')
                    } else if (errorMessage.includes('out of stock')) {
                        addNotification('This product is currently out of stock', 'error')
                    } else if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
                        addNotification('Please sign in to purchase', 'warning')
                    } else {
                        addNotification(errorMessage, 'error')
                    }
                    return
                }
            }
            router.push('/checkout')
        }
    }, [product, addToCart, router, mounted, cartLoading, isInCart, hasPurchased, isOwner, addNotification, isAuthenticated, productSlug])
    const handleLike = useCallback(async () => {
        if (!isAuthenticated) {
            requireAuth()
            return
        }

        if (!product?._id) {
            addNotification('Product not found', 'error')
            return
        }

        const newLiked = !liked
        const previousFavorites = product.favorites || 0

        try {
            setLiked(newLiked)
            setProduct((prevProduct) => ({
                ...prevProduct,
                favorites: newLiked ? previousFavorites + 1 : Math.max(0, previousFavorites - 1)
            }))

            // Make the API call - use isFavorited to match server expectation
            const response = await productsAPI.toggleFavorite(product._id, newLiked)

            // Update with actual response data if available
            if (response?.data) {
                setProduct((prevProduct) => ({
                    ...prevProduct,
                    favorites: response.data.favorites !== undefined ? response.data.favorites : prevProduct.favorites,
                    userInteractions: {
                        ...prevProduct.userInteractions,
                        isLiked: response.data.isLiked !== undefined ? response.data.isLiked : newLiked
                    }
                }))
                setLiked(response.data.isLiked !== undefined ? response.data.isLiked : newLiked)
            }

            addNotification(newLiked ? 'Added to favorites!' : 'Removed from favorites', 'success')
        } catch (error) {
            // Revert the optimistic update on error
            setLiked(liked)
            setProduct((prevProduct) => ({
                ...prevProduct,
                favorites: previousFavorites
            }))
            console.error('Failed to update favorite:', error)

            // More specific error messages
            if (error.status === 401) {
                addNotification('Please sign in to add favorites', 'error')
                requireAuth()
            } else if (error.status === 404) {
                addNotification('Product not found', 'error')
            } else {
                addNotification('Failed to update favorite. Please try again.', 'error')
            }
        }
    }, [isAuthenticated, liked, product, requireAuth, addNotification])
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
            addNotification(newUpvoted ? 'Upvoted!' : 'Removed upvote', 'success')
        } catch (error) {
            setUpvoted(!newUpvoted)
            addNotification('Failed to update upvote', 'error')
        } finally {
            setIsUpvoting(false)
        }
    }, [isAuthenticated, upvoted, product, requireAuth, isUpvoting, addNotification])
    const handleDownload = useCallback(async () => {
        try {
            router.push(`/products/${productSlug}/purchased`)
        } catch (error) {
            addNotification('Failed to access product', 'error')
        }
    }, [router, productSlug, addNotification])
    const handleProductUpdate = useCallback((updatedData) => {
        setProduct((prevProduct) => ({
            ...prevProduct,
            ...updatedData
        }))
    }, [])
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
            } catch (err) {}
        } else if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url)
                setShowCopied(true)
                setTimeout(() => setShowCopied(false), 2000)
                addNotification('Link copied to clipboard!', 'success')
            } catch (err) {
                addNotification('Unable to copy link', 'error')
            }
        } else {
            addNotification(`Share this link: ${url}`, 'info')
        }
    }, [mounted, product, addNotification])
    const handleReviewSubmit = useCallback(
        async (reviewData) => {
            if (!isAuthenticated) {
                requireAuth()
                return
            }
            if (!product?._id) {
                addNotification('Product not found', 'error')
                return
            }
            try {
                const response = await productsAPI.addReview(product._id, reviewData)
                if (response?.data) {
                    addNotification('Review submitted successfully!', 'success')
                    setProduct((prevProduct) => ({
                        ...prevProduct,
                        reviews: response.data.reviews || prevProduct.reviews,
                        averageRating: response.data.averageRating || prevProduct.averageRating,
                        totalReviews: response.data.totalReviews || prevProduct.totalReviews,
                        reviewStats: response.data.reviewStats || prevProduct.reviewStats
                    }))
                } else {
                    addNotification('Review submitted!', 'success')
                }
            } catch (error) {
                console.error('Error submitting review:', error)
                if (error.status === 400) {
                    addNotification(error.message || 'Invalid review data', 'error')
                } else if (error.status === 401) {
                    addNotification('Please log in to submit a review', 'error')
                    requireAuth()
                } else if (error.status === 403) {
                    addNotification('You are not allowed to review this product', 'error')
                } else if (error.status === 409) {
                    addNotification('You have already reviewed this product', 'error')
                } else {
                    addNotification(error.message || 'Failed to submit review. Please try again.', 'error')
                }
            }
        },
        [isAuthenticated, product, requireAuth, addNotification]
    )
    const handleNavigateToReviews = useCallback(() => {
        setActiveTab('reviews')
        const reviewsSection = document.querySelector('[data-tab="reviews"]') || document.querySelector('.reviews-section')
        if (reviewsSection) {
            reviewsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        } else {
            const tabsSection = document.querySelector('.lg\\:flex.gap-12')
            if (tabsSection) {
                tabsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }
        }
    }, [])
    if (loading) {
        return (
            <div
                className="min-h-screen"
                style={{ backgroundColor: DESIGN_TOKENS.colors.background.dark }}>
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                        <InlineNotification
                            type={notification.type}
                            message={notification.message}
                            onDismiss={() => removeNotification(notification.id)}
                        />
                    </div>
                ))}
                <DSContainer
                    maxWidth="hero"
                    padding="responsive">
                    <div
                        className="pb-4 border-b"
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
    if (error || !product) {
        return (
            <div
                className="min-h-screen"
                style={{ backgroundColor: DESIGN_TOKENS.colors.background.dark }}>
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
                <div className="fixed top-4 right-4 z-[9999] space-y-2 w-full max-w-sm pointer-events-none">
                    <AnimatePresence>
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="pointer-events-auto">
                                <Notification
                                    {...notification}
                                    onClose={removeNotification}
                                />
                            </div>
                        ))}
                    </AnimatePresence>
                </div>
                <main className="relative">
                    <ProductBreadcrumb product={product} />
                    <section className="relative">
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
                            addingToCart={addingToCart}
                            discountPercentage={discountPercentage}
                            savingsAmount={savingsAmount}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            onLike={handleLike}
                            onUpvote={handleUpvote}
                            onDownload={handleDownload}
                            onShare={handleShare}
                            onNavigateToReviews={handleNavigateToReviews}
                            ctaRef={ctaRef}
                        />
                    </section>
                    <section className="relative py-12 lg:py-16">
                        <DSContainer
                            maxWidth="hero"
                            padding="responsive">
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
                                                        ? 'bg-[#00FF89]/10 text-[#00FF89]'
                                                        : 'bg-black-100 dark:bg-black-800/50 text-black-600 dark:text-black-400 hover:bg-black-200 dark:hover:bg-black-800'
                                                }`}>
                                                <IconComponent className="w-4 h-4" />
                                                <span className="text-sm font-medium">{tab.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="bg-black dark:bg-black-800/50 rounded-xl">
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
                                                            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-black-100 dark:bg-black-800 flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-black-400" />
                                                            </div>
                                                            <h3 className="text-lg font-medium text-black-900 dark:text-white mb-2">
                                                                Content Coming Soon
                                                            </h3>
                                                            <p className="text-black-600 dark:text-black-400">This section will be available soon.</p>
                                                        </div>
                                                    )
                                                }
                                                if (activeTabConfig.id === 'reviews') {
                                                    return (
                                                        <ComponentToRender
                                                            product={product}
                                                            onProductUpdate={handleProductUpdate}
                                                        />
                                                    )
                                                }
                                                return <ComponentToRender product={product} />
                                            })()}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="hidden lg:flex gap-12">
                                <div className="w-64 flex-shrink-0">
                                    <div className="sticky top-24 space-y-6">
                                        <div className="relative bg-black overflow-hidden rounded-2xl">
                                            <div className="absolute inset-0">
                                                <div className="absolute inset-0 bg-black" />
                                                <motion.div
                                                    animate={{
                                                        rotate: [0, 360],
                                                        scale: [1, 1.1, 1]
                                                    }}
                                                    transition={{
                                                        duration: 30,
                                                        repeat: Infinity,
                                                        ease: 'linear'
                                                    }}
                                                    className="absolute top-1/4 right-1/4 w-32 h-32 bg-[#00FF89]/5 rounded-full blur-2xl"
                                                />
                                            </div>

                                            <div className="relative z-10 p-6">
                                                <div className="text-center mb-6">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-full mb-3">
                                                        <Package className="w-4 h-4 text-[#00FF89]" />
                                                        <span className="text-[#00FF89] font-medium text-sm">Product Information</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white">Navigate Sections</h3>
                                                </div>

                                                <nav className="space-y-2">
                                                    {PRODUCT_TABS.map((tab, index) => {
                                                        const IconComponent = tab.icon
                                                        const isActive = activeTab === tab.id
                                                        return (
                                                            <motion.button
                                                                key={tab.id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                                                                    isActive
                                                                        ? 'bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/30'
                                                                        : 'text-black-400 hover:bg-black-800/50 hover:text-white border border-transparent'
                                                                }`}>
                                                                <div
                                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                                                        isActive ? 'bg-[#00FF89]/20' : 'bg-black-800/50 group-hover:bg-[#00FF89]/10'
                                                                    }`}>
                                                                    <IconComponent
                                                                        className={`w-5 h-5 transition-colors ${
                                                                            isActive ? 'text-[#00FF89]' : 'text-black-400 group-hover:text-[#00FF89]'
                                                                        }`}
                                                                    />
                                                                </div>
                                                                <div className="text-left flex-1">
                                                                    <div
                                                                        className={`font-semibold text-sm transition-colors ${
                                                                            isActive ? 'text-[#00FF89]' : 'text-white group-hover:text-[#00FF89]'
                                                                        }`}>
                                                                        {tab.label}
                                                                    </div>
                                                                    <div
                                                                        className={`text-xs mt-0.5 transition-colors ${
                                                                            isActive ? 'text-[#00FF89]/70' : 'text-black-500'
                                                                        }`}>
                                                                        {tab.description}
                                                                    </div>
                                                                </div>
                                                            </motion.button>
                                                        )
                                                    })}
                                                </nav>
                                            </div>
                                        </div>

                                        <div className="relative bg-black overflow-hidden rounded-2xl">
                                            <div className="absolute inset-0">
                                                <div className="absolute inset-0 bg-black" />
                                                <motion.div
                                                    animate={{
                                                        rotate: [360, 0],
                                                        scale: [1, 1.2, 1]
                                                    }}
                                                    transition={{
                                                        duration: 25,
                                                        repeat: Infinity,
                                                        ease: 'linear'
                                                    }}
                                                    className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-[#00FF89]/3 rounded-full blur-2xl"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="bg-black dark:bg-black-800/50 rounded-xl">
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
                                                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-black-100 dark:bg-black-800 flex items-center justify-center">
                                                                    <Package className="w-6 h-6 text-black-400" />
                                                                </div>
                                                                <h3 className="text-lg font-medium text-black-900 dark:text-white mb-2">
                                                                    Content Coming Soon
                                                                </h3>
                                                                <p className="text-black-600 dark:text-black-400">
                                                                    This section will be available soon.
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    if (activeTabConfig.id === 'reviews') {
                                                        return (
                                                            <ComponentToRender
                                                                product={product}
                                                                onProductUpdate={handleProductUpdate}
                                                            />
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
                <AnimatePresence>
                    {showStickyBar && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-black-900/95 to-black-800/95 backdrop-blur-xl border-t border-black-700/50 shadow-2xl">
                            <div className="max-w-7xl mx-auto px-4 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black-800">
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


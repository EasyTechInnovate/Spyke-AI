'use client'

import { useState, memo, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Eye, ShoppingCart, CheckCircle, Sparkles, Loader2, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import SmoothProductCarousel from './featured/SmoothProductCarousel'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import toast from '@/lib/utils/toast'
import { useProducts } from '@/hooks/useProducts'
import { featuredProductsDummy } from '@/data/featuredProductsDummy'

// Import Design System Components
import { DSStack, DSHeading, DSText, DSButton, DSBadge, DSLoadingState } from '@/lib/design-system'

import InlineNotification from '@/components/shared/notifications/InlineNotification'

const getBadgeForProduct = (product) => {
    // Priority-based badge system - only return the highest priority badge
    if (product.sales > 100) return { text: 'Bestseller', variant: 'warning', priority: 1 }
    if (product.averageRating >= 4.8) return { text: 'Top Rated', variant: 'success', priority: 2 }
    if (product.isVerified && product.isTested) return { text: 'Verified', variant: 'primary', priority: 3 }
    if (product.views > 1000) return { text: 'Hot', variant: 'error', priority: 4 }
    if (product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) return { text: 'New', variant: 'primary', priority: 5 }
    return null
}

const formatPrice = (price) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price)
}

const getTypeDisplay = (type) => {
    const typeMap = {
        prompt: 'AI Prompt',
        automation: 'Automation',
        agent: 'AI Agent',
        bundle: 'Bundle'
    }
    return typeMap[type] || type
}

const FeaturedProducts = memo(function FeaturedProducts() {
    const router = useRouter()

    const {
        products: featuredProducts,
        loading: loadingFeatured,
        error: errorFeatured
    } = useProducts({
        sortBy: 'popularity',
        sortOrder: 'desc',
        limit: 8
    })

    const {
        products: popularProducts,
        loading: loadingPopular,
        error: errorPopular
    } = useProducts({
        sortBy: 'popularity',
        sortOrder: 'desc',
        limit: 8,
        verifiedOnly: 'true'
    })

    const sourceFeatured = featuredProducts || []
    const sourcePopular = popularProducts || []

    const products = useMemo(() => {
        if ((sourceFeatured?.length || 0) >= 4) return sourceFeatured

        const mapId = (p) => p._id || p.id || p.slug
        const merged = []
        const seen = new Set()

        for (const p of sourceFeatured || []) {
            const id = mapId(p)
            if (id && !seen.has(id)) {
                seen.add(id)
                merged.push(p)
            }
        }
        for (const p of sourcePopular || []) {
            const id = mapId(p)
            if (id && !seen.has(id)) {
                seen.add(id)
                merged.push(p)
            }
        }
        return merged
    }, [sourceFeatured, sourcePopular])

    const loading = loadingFeatured || (products.length < 4 && loadingPopular)
    const error = (errorFeatured || errorPopular) && products.length === 0

    const handleProductClick = (product) => {
        router.push(`/products/${product.slug || product.id || product._id}`)
    }

    return (
        <section className="relative overflow-hidden bg-[#121212]">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(600px 200px at 10% 50%, rgba(0,255,137,.04), transparent), radial-gradient(400px 150px at 90% 50%, rgba(255,192,80,.04), transparent)'
                    }}
                />
            </div>

            <div className="relative z-10 py-12 sm:py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12 sm:mb-16">
                        
                        <DSBadge
                            variant="primary"
                            icon={Sparkles}
                            className="mb-4 sm:mb-6">
                            Trending This Week
                        </DSBadge>

                        <DSHeading
                            level={2}
                            variant="hero"
                            className="mb-3 sm:mb-4">
                            <span style={{ color: 'white' }}>Featured Products</span>
                        </DSHeading>

                        <DSText
                            variant="subhero"
                            style={{ color: '#9ca3af' }}>
                            Handpicked AI tools and prompts loved by thousands of creators
                        </DSText>
                    </motion.div>

                    <div className="mb-8 sm:mb-12">
                        {loading ? (
                            <DSLoadingState
                                icon={Loader2}
                                message="Loading featured products..."
                                className="h-48 sm:h-64"
                            />
                        ) : error ? (
                            <div className="text-center py-8 sm:py-12">
                                <DSStack
                                    gap="medium"
                                    direction="column"
                                    align="center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                                        <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                                    </div>

                                    <DSText style={{ color: '#9ca3af' }}>Failed to load products</DSText>

                                    <Link href="/explore">
                                        <DSButton
                                            variant="primary"
                                            size="medium">
                                            Browse all products
                                            <ArrowRight className="w-4 h-4" />
                                        </DSButton>
                                    </Link>
                                </DSStack>
                            </div>
                        ) : products.length > 0 ? (
                            products.length === 1 ? (
                                <div className="flex justify-center">
                                    <div className="w-full max-w-xs">
                                        <ProductCard
                                            product={products[0]}
                                            onClick={() => handleProductClick(products[0])}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.slice(0, 8).map((product, index) => (
                                        <motion.div
                                            key={product._id || product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.05 }}
                                            className="w-full h-full">
                                            <ProductCard
                                                product={product}
                                                onClick={() => handleProductClick(product)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="text-center py-8 sm:py-12">
                                <DSStack
                                    gap="medium"
                                    direction="column"
                                    align="center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                                    </div>

                                    <DSText style={{ color: '#9ca3af' }}>No products available</DSText>

                                    <Link href="/explore">
                                        <DSButton
                                            variant="secondary"
                                            size="medium">
                                            Check back soon
                                            <ArrowRight className="w-4 h-4" />
                                        </DSButton>
                                    </Link>
                                </DSStack>
                            </div>
                        )}
                    </div>

                    {products.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-center">
                            <Link href="/explore">
                                <DSButton
                                    variant="primary"
                                    size="large"
                                    className="group">
                                    <span>View All Products</span>
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                </DSButton>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    )
})

function ProductCard({ product, onClick }) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imgSrc, setImgSrc] = useState(product.thumbnail)
    const { addToCart } = useCart()

    useEffect(() => {
        setImageLoaded(false)
        setImgSrc(product.thumbnail)
    }, [product])

    const badge = getBadgeForProduct(product)
    const discountPercentage =
        product.originalPrice && product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0

    return (
        <div className="group h-full">
            <div
                className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden hover:border-[#00FF89]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF89]/5 h-full flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:ring-offset-2 focus:ring-offset-[#121212]"
                onClick={(e) => {
                    if (e.target.closest('button')) {
                        return
                    }
                    onClick()
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (!e.target.closest('button')) {
                            onClick()
                        }
                    }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View product: ${product.title}`}>
                
                {/* Product Image */}
                <div className="relative aspect-[3/2] bg-gray-800 overflow-hidden">
                    {!imageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse" />}

                    <OptimizedImage
                        src={imgSrc}
                        alt={`${product.title} - ${getTypeDisplay(product.type)}`}
                        width={300}
                        height={200}
                        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-focus:scale-105 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                            setImageLoaded(true)
                            // Fallback to a placeholder
                            e.target.src = `https://placehold.co/300x200/171717/9ca3af?text=${encodeURIComponent(product.title.charAt(0))}`
                        }}
                        loading="lazy"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 group-focus:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100">
                        <DSStack direction="row" gap="small" align="center">
                            <Eye className="w-4 h-4 text-white" />
                            <DSText size="sm" style={{ color: 'white', fontWeight: 500 }}>
                                Quick View
                            </DSText>
                        </DSStack>
                    </div>

                    {/* Product Badge */}
                    {badge && (
                        <div className="absolute top-2 left-2 z-10">
                            <DSBadge variant={badge.variant} size="small" className="text-xs px-2 py-1 shadow-sm">
                                {badge.text}
                            </DSBadge>
                        </div>
                    )}

                    {/* Discount Badge - only show if no product badge to avoid overlap */}
                    {discountPercentage > 0 && !badge && (
                        <div className="absolute top-2 right-2 z-10">
                            <DSBadge variant="error" size="small" className="text-xs px-2 py-1 shadow-sm">
                                -{discountPercentage}%
                            </DSBadge>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col">
                    <DSStack direction="column" gap="small" className="h-full">
                        {/* Header */}
                        <DSStack direction="row" justify="between" align="center">
                            <DSText size="sm" style={{ color: '#00FF89', fontWeight: 600 }}>
                                {getTypeDisplay(product.type)}
                            </DSText>
                            <DSStack direction="row" gap="xsmall" align="center">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <DSText size="sm" style={{ color: 'white', fontWeight: 500 }}>
                                    {(product.averageRating || 0).toFixed(1)}
                                </DSText>
                                <DSText size="sm" style={{ color: '#6b7280' }}>
                                    ({product.totalReviews || 0})
                                </DSText>
                            </DSStack>
                        </DSStack>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#00FF89] transition-colors leading-tight">
                            {product.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-400 line-clamp-2 flex-1 leading-relaxed">
                            {product.shortDescription}
                        </p>

                        {/* Seller Info */}
                        <DSStack direction="row" gap="small" align="center">
                            <span className="text-xs text-gray-500">by</span>
                            <span className="text-xs text-gray-300 truncate">
                                {product.sellerId?.fullName || 'Anonymous Seller'}
                            </span>
                            {product.sellerId?.verification?.status === 'approved' && (
                                <CheckCircle className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                            )}
                        </DSStack>

                        {/* Price and Add to Cart */}
                        <DSStack direction="row" justify="between" align="center" className="mt-2">
                            <DSStack direction="row" gap="small" align="baseline">
                                <span className="text-lg font-bold text-[#00FF89]">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xs text-gray-500 line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </DSStack>

                            <DSButton
                                variant="primary"
                                size="small"
                                onClick={async (e) => {
                                    e.stopPropagation()
                                    e.preventDefault()

                                    const cartProduct = {
                                        id: product._id || product.id,
                                        title: product.title,
                                        price: product.price,
                                        thumbnail: imgSrc,
                                        shortDescription: product.shortDescription,
                                        type: product.type
                                    }

                                    try {
                                        await addToCart(cartProduct)
                                    } catch (error) {
                                        console.error('Error adding to cart:', error)
                                    }
                                }}
                                className="flex-shrink-0 !px-3 !py-2"
                                aria-label={`Add ${product.title} to cart`}>
                                <ShoppingCart className="w-4 h-4" />
                            </DSButton>
                        </DSStack>
                    </DSStack>
                </div>
            </div>
        </div>
    )
}

export default FeaturedProducts

'use client'

import { useState, memo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Eye, CheckCircle, Sparkles, Loader2, Activity, Heart, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import { useCart } from '@/hooks/useCart'
import { productsAPI } from '@/lib/api'

// Import Design System Components
import { DSStack, DSHeading, DSText, DSButton, DSBadge, DSLoadingState } from '@/lib/design-system'


// Use the same background effects as hero section
const BackgroundEffectsLight = dynamic(() => import('./hero/BackgroundEffectsLight'), {
    ssr: false,
    loading: () => null
})

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
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch featured products using the proper backend API
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const response = await productsAPI.getFeaturedProducts({
                    limit: 8,
                    minRating: 3.5
                })
                
                if (response?.data) {
                    setFeaturedProducts(response.data)
                } else {
                    setFeaturedProducts([])
                }
            } catch (err) {
                setError(err.message || 'Failed to load featured products')
                setFeaturedProducts([])
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedProducts()
    }, [])

    const handleProductClick = (product) => {
        router.push(`/products/${product.slug || product.id || product._id}`)
    }

    return (
        <section className="relative overflow-hidden bg-black">
            {/* Consistent Background Effects */}
            <BackgroundEffectsLight />

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
                            Featured Products
                        </DSBadge>

                        <DSHeading
                            level={2}
                            variant="hero"
                            className="mb-3 sm:mb-4">
                            <span style={{ color: 'white' }}>Handpicked AI Solutions</span>
                        </DSHeading>

                        <DSText
                            variant="subhero"
                            style={{ color: '#9ca3af' }}>
                            Discover verified AI tools and prompts chosen by our algorithm for quality and performance
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
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                                        <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                                    </div>

                                    <DSHeading level={3} className="text-white mb-2">
                                        Unable to Load Featured Products
                                    </DSHeading>

                                    <DSText style={{ color: '#9ca3af' }} className="mb-4">
                                        We're having trouble loading our featured products. Please try again or browse all products.
                                    </DSText>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <DSButton
                                            variant="primary"
                                            size="medium"
                                            onClick={() => window.location.reload()}>
                                            Try Again
                                        </DSButton>
                                        
                                        <Link href="/explore">
                                            <DSButton
                                                variant="secondary"
                                                size="medium">
                                                Browse All Products
                                                <ArrowRight className="w-4 h-4" />
                                            </DSButton>
                                        </Link>
                                    </div>
                                </DSStack>
                            </div>
                        ) : featuredProducts.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <DSStack
                                    gap="medium"
                                    direction="column"
                                    align="center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800/50 rounded-xl flex items-center justify-center border border-gray-700/50">
                                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                    </div>

                                    <DSHeading level={3} className="text-white mb-2">
                                        No Featured Products Available
                                    </DSHeading>

                                    <DSText style={{ color: '#9ca3af' }} className="mb-4">
                                        We're working on curating amazing products for you. Check out our full catalog in the meantime.
                                    </DSText>

                                    <Link href="/explore">
                                        <DSButton
                                            variant="primary"
                                            size="medium">
                                            Explore All Products
                                            <ArrowRight className="w-4 h-4" />
                                        </DSButton>
                                    </Link>
                                </DSStack>
                            </div>
                        ) : (
                            featuredProducts.length === 1 ? (
                                <div className="flex justify-center">
                                    <div className="w-full max-w-sm">
                                        <ProductCard
                                            product={featuredProducts[0]}
                                            onClick={() => handleProductClick(featuredProducts[0])}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {featuredProducts.slice(0, 8).map((product, index) => (
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
                        )}
                    </div>

                    {featuredProducts.length > 0 && (
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
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const { addToCart } = useCart()

    // Safe data extraction with fallbacks (matching ProductCardLite)
    const {
        _id: id,
        slug,
        title = 'Untitled Product',
        price = 0,
        discountPrice,
        originalPrice,
        rating: legacyRating = 0,
        reviewCount: legacyReviewCount = 0,
        image,
        thumbnail,
        images = [],
        category = 'general',
        type,
        industry,
        tags = [],
        seller = {},
        sellerId, // API shape
        sales = 0,
        isFeatured = false,
        isNew = false,
        createdAt,
        shortDescription,
        fullDescription,
        averageRating: productAverageRating,
        totalReviews: productTotalReviews
    } = product || {}

    // Normalized seller data (prefer explicit seller else sellerId)
    const sellerInfo = seller?.name || seller?.fullName ? seller : sellerId || {}
    const sellerDisplayName = sellerInfo.name || sellerInfo.fullName || ''
    const sellerVerified = sellerInfo.verified || sellerInfo.verification?.status === 'approved'

    // Ratings: product rating independent from seller rating
    const productRating =
        typeof productAverageRating === 'number' && productAverageRating > 0 ? productAverageRating : legacyRating > 0 ? legacyRating : 0

    const description = (shortDescription || product?.description || fullDescription || 'No description available').trim()

    // Use the first available image
    const productImage = image || thumbnail || images?.[0] || '/images/placeholder-product.svg'

    // Calculate discount percentage
    const actualDiscountPrice = discountPrice || (originalPrice && originalPrice > price ? price : null)
    const actualOriginalPrice = originalPrice || (discountPrice ? price : null)
    const discountPercentage = actualOriginalPrice && actualDiscountPrice && actualOriginalPrice > actualDiscountPrice ?
        Math.round(((actualOriginalPrice - actualDiscountPrice) / actualOriginalPrice) * 100) : 0

    // Format price display
    const formatPrice = (price) => {
        if (price === 0) return 'Free'
        return `$${price.toFixed(2)}`
    }

    // Check if product is new (within 30 days)
    const isNewProduct = isNew || (createdAt && new Date(createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

    const handleLike = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsLiked(!isLiked)
    }

    const handleAddToCart = async (e) => {
        e.stopPropagation()
        e.preventDefault()

        const cartProduct = {
            id: id,
            title: title,
            price: actualDiscountPrice || price,
            thumbnail: productImage,
            shortDescription: description,
            type: type
        }

        try {
            await addToCart(cartProduct)
        } catch (error) {
            console.error('Error adding to cart:', error)
        }
    }

    const microMeta = (
        <div className="flex items-center gap-3 text-[14px] md:text-[13px] font-medium text-gray-500 leading-tight">
            {sellerDisplayName ? (
                <span className="inline-flex items-center gap-1 max-w-[180px] truncate text-gray-300 text-[14px] md:text-[13px]">
                    {sellerVerified && <CheckCircle className="w-4 h-4 text-[#00FF89]" />}
                    <span className="truncate">{sellerDisplayName}</span>
                </span>
            ) : (
                <span className="text-gray-600">Unknown seller</span>
            )}
        </div>
    )

    // Derive display tags: real tags only
    const displayTags = tags.slice(0, 2)
    const extraTagCount = tags.length > 2 ? tags.length - 2 : 0

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 260 }}
            className="group bg-[#101010] border border-[#1d1d1d] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-all h-full">
            <div
                className="flex flex-col h-full cursor-pointer"
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
                aria-label={`View product: ${title}`}>

                <div className="relative aspect-[16/9] bg-[#1b1b1b] overflow-hidden">
                    {!imageError ? (
                        <OptimizedImage
                            src={productImage}
                            alt={title}
                            width={300}
                            height={200}
                            className={`w-full h-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setIsImageLoading(false)}
                            onError={() => {
                                setImageError(true)
                                setIsImageLoading(false)
                            }}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Eye className="w-10 h-10 text-gray-600" />
                        </div>
                    )}
                    {isImageLoading && <div className="absolute inset-0 bg-gray-700/30 animate-pulse" />}

                    {/* Subtle gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-60 pointer-events-none" />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isFeatured && (
                            <span className="px-3.5 py-1 rounded-full bg-black/55 backdrop-blur text-[14px] font-semibold tracking-wide text-[#00FF89] border border-[#00FF89]/30">
                                Featured
                            </span>
                        )}
                        {isNewProduct && (
                            <span className="px-3.5 py-1 rounded-full bg-black/55 backdrop-blur text-[14px] font-semibold tracking-wide text-blue-400 border border-blue-400/30">
                                New
                            </span>
                        )}
                        {discountPercentage > 0 && (
                            <span className="px-3.5 py-1 rounded-full bg-black/55 backdrop-blur text-[14px] font-semibold tracking-wide text-red-400 border border-red-400/30">
                                -{discountPercentage}%
                            </span>
                        )}
                    </div>

                    {/* Like & Cart */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleLike}
                            className="p-1.5 rounded-md bg-black/45 backdrop-blur hover:bg-black/65 transition">
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-200'}`} />
                        </button>

                    </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="mb-2">
                        <h3 className="font-semibold text-[18px] md:text-[18px] leading-snug text-white line-clamp-2 group-hover:text-[#00FF89] transition-colors">{title}</h3>
                        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-gray-300">
                            <span className="inline-flex items-center gap-1 bg-[#1a1a1a] border border-[#272727] px-2 py-0.5 rounded-md text-[11.5px] font-medium">
                                <Star className="w-3.5 h-3.5 text-yellow-400" />{productRating.toFixed(1)}
                            </span>
                            {productRating === 0 && isNewProduct && (
                                <span className="text-[11px] font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">New</span>
                            )}
                        </div>
                    </div>
                    <p className="text-[15px] md:text-[15px] text-gray-300 line-clamp-3 leading-relaxed mb-4">{description}</p>
                    {displayTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {displayTags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-full border border-[#272727] text-[10px] uppercase tracking-wide text-gray-400">
                                    {tag}
                                </span>
                            ))}
                            {extraTagCount > 0 && <span className="px-2 py-0.5 rounded-full border border-[#272727] text-[10px] text-gray-500">+{extraTagCount}</span>}
                        </div>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                        {microMeta}
                        <div className="text-right ml-4 flex items-center">
                            {actualDiscountPrice && actualOriginalPrice && actualOriginalPrice > actualDiscountPrice ? (
                                <div className="flex items-center justify-end gap-2 leading-none">
                                    <span className="text-xl md:text-lg font-bold text-[#00FF89] leading-none">{formatPrice(actualDiscountPrice)}</span>
                                    <span className="text-xs text-gray-500 line-through leading-none">{formatPrice(actualOriginalPrice)}</span>
                                </div>
                            ) : (
                                <span className="text-xl md:text-lg font-bold text-[#00FF89] leading-none">{formatPrice(price)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default FeaturedProducts

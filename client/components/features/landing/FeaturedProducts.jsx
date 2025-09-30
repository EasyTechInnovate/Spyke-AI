'use client'
import { useState, memo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Eye, CheckCircle, Sparkles, Loader2, Activity, Heart, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useCart } from '@/hooks/useCart'
import { productsAPI } from '@/lib/api'

const BackgroundEffectsLight = dynamic(() => import('./hero/BackgroundEffectsLight'), {
    ssr: false,
    loading: () => null
})
const getBadgeForProduct = (product) => {
    if (product.sales > 100) return { text: 'Bestseller', variant: 'warning', priority: 1 }
    if (product.averageRating >= 4.8) return { text: 'Top Rated', variant: 'success', priority: 2 }
    if (product.isVerified && product.isTested) return { text: 'Verified', variant: 'primary', priority: 3 }
    if (product.views > 1000) return { text: 'Hot', variant: 'error', priority: 4 }
    if (product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        return { text: 'New', variant: 'primary', priority: 5 }
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
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await productsAPI.getFeaturedHybrid({ status: 'active', limit: 8 })
                const list = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res?.data?.items)
                      ? res.data.items
                      : Array.isArray(res?.items)
                        ? res.items
                        : Array.isArray(res?.products)
                          ? res.products
                          : Array.isArray(res)
                            ? res
                            : []
                const items = list.map((p) => ({ ...p, isFeatured: true }))
                setFeaturedProducts(items)
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
            <BackgroundEffectsLight />
            <div className="relative z-10 py-12 sm:py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12 sm:mb-16">
                        <div className="flex flex-col items-center gap-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/20 text-sm font-medium mb-4 sm:mb-6">
                                <Sparkles className="w-4 h-4" />
                                Featured Products
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3 sm:mb-4">
                                <span style={{ color: 'white' }}>Handpicked AI Solutions</span>
                            </h2>
                            <p
                                className="text-lg sm:text-xl font-medium leading-relaxed"
                                style={{ color: '#9ca3af' }}>
                                Discover admin‑featured AI tools curated by our team for quality and performance
                            </p>
                        </div>
                    </motion.div>
                    <div className="mb-8 sm:mb-12">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-48 sm:h-64">
                                <Loader2 className="w-8 h-8 text-[#00FF89] animate-spin mb-4" />
                                <p className="text-gray-400 font-medium">Loading featured products...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                                        <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Unable to Load Featured Products</h3>
                                    <p className="text-gray-400 mb-4">
                                        We're having trouble loading our featured products. Please try again or browse all products.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF89] text-black font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-all duration-200"
                                            onClick={() => window.location.reload()}>
                                            Try Again
                                        </button>
                                        <Link href="/explore">
                                            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white bg-transparent hover:border-white/40 hover:bg-white/5 rounded-xl transition-all duration-200">
                                                Browse All Products
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : featuredProducts.length === 0 ? (
                            <div className="text-center py-16 sm:py-24">
                                <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                                    {/* Animated Icon Container */}
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="relative">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/5 rounded-3xl flex items-center justify-center border border-[#00FF89]/20 backdrop-blur-sm">
                                            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-[#00FF89]" />
                                        </div>
                                        {/* Floating particles */}
                                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#00FF89] rounded-full animate-ping opacity-75"></div>
                                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#00FF89]/60 rounded-full animate-pulse"></div>
                                    </motion.div>

                                    {/* Title and Description */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="space-y-4">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">No Featured Products Available</h3>
                                        <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                                            We're working on curating amazing products for you. Check out our full catalog in the meantime.
                                        </p>
                                    </motion.div>

                                    {/* Action Button */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.6 }}>
                                        <Link href="/explore">
                                            <button className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00FF89] to-[#00e67a] text-black font-bold rounded-2xl hover:from-[#00e67a] hover:to-[#00FF89] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#00FF89]/25 text-lg">
                                                Explore All Products
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                                            </button>
                                        </Link>
                                    </motion.div>

                                    {/* Additional Info */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.8 }}
                                        className="flex items-center gap-6 pt-6 border-t border-gray-800/50">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Sparkles className="w-4 h-4 text-[#00FF89]" />
                                            <span>AI-Powered Tools</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <CheckCircle className="w-4 h-4 text-[#00FF89]" />
                                            <span>Verified Quality</span>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        ) : featuredProducts.length === 1 ? (
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
                                <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#00FF89] text-black font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-all duration-200 text-lg">
                                    <span>View All Products</span>
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
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
        sellerId,
        sales = 0,
        isFeatured = false,
        isNew = false,
        createdAt,
        shortDescription,
        fullDescription,
        averageRating: productAverageRating,
        totalReviews: productTotalReviews
    } = product || {}

    // Determine seller profile: prefer populated sellerId object, fallback to seller
    const sellerProfile = sellerId && typeof sellerId === 'object' ? sellerId : seller && typeof seller === 'object' ? seller : null
    const sellerDisplayName = sellerProfile?.fullName || sellerProfile?.name || ''
    const sellerVerified = !!(sellerProfile?.verification?.status === 'approved' || sellerProfile?.isVerified || sellerProfile?.verified)

    const productRating =
        typeof productAverageRating === 'number' && productAverageRating > 0 ? productAverageRating : legacyRating > 0 ? legacyRating : 0
    const description = (shortDescription || product?.description || fullDescription || 'No description available').trim()
    const productImage = image || thumbnail || images?.[0] || '/images/placeholder-product.svg'
    const actualDiscountPrice = discountPrice || (originalPrice && originalPrice > price ? price : null)
    const actualOriginalPrice = originalPrice || (discountPrice ? price : null)
    const discountPercentage =
        actualOriginalPrice && actualDiscountPrice && actualOriginalPrice > actualDiscountPrice
            ? Math.round(((actualOriginalPrice - actualDiscountPrice) / actualOriginalPrice) * 100)
            : 0
    const formatPrice = (price) => {
        if (price === 0) return 'Free'
        return `$${price.toFixed(2)}`
    }
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
    const displayTags = tags.slice(0, 3) // Show up to 3 tags instead of 2
    const extraTagCount = tags.length > 3 ? tags.length - 3 : 0 // Adjust for 3 tags
    const handleImageLoad = () => {
        setIsImageLoading(false)
        setImageError(false)
    }
    const handleImageError = () => {
        setImageError(true)
        setIsImageLoading(false)
        console.warn('Featured product image failed to load:', productImage)
    }
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
                        <img
                            src={productImage}
                            alt={title}
                            className={`w-full h-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Eye className="w-10 h-10 text-gray-600" />
                        </div>
                    )}
                    {isImageLoading && <div className="absolute inset-0 bg-gray-700/30 animate-pulse" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-60 pointer-events-none" />
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
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleLike}
                            className="p-1.5 rounded-md bg-black/45 backdrop-blur hover:bg-black/65 transition">
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-200'}`} />
                        </button>
                    </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                    <div className="mb-2">
                        <h3 className="font-semibold text-[18px] md:text-[18px] leading-snug text-white line-clamp-2 group-hover:text-[#00FF89] transition-colors">
                            {title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-gray-300">
                            <span className="inline-flex items-center gap-1 bg-[#1a1a1a] border border-[#272727] px-2 py-0.5 rounded-md text-[11.5px] font-medium">
                                <Star className="w-3.5 h-3.5 text-yellow-400" />
                                {productRating.toFixed(1)}
                            </span>
                            {/* Removed redundant "New" tag from here since it already appears in image overlay */}
                        </div>
                    </div>
                    <p className="text-[15px] md:text-[15px] text-gray-300 line-clamp-3 leading-relaxed mb-4">{description}</p>
                    {displayTags.length > 0 && (
                        <div className="flex items-center gap-2 mb-4 overflow-hidden">
                            {displayTags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-gradient-to-r from-[#00FF89]/10 to-[#00FF89]/5 border border-[#00FF89]/20 text-[12px] font-medium tracking-wide text-[#00FF89] whitespace-nowrap flex-shrink-0">
                                    {tag}
                                </span>
                            ))}
                            {extraTagCount > 0 && (
                                <span className="px-2 py-1 rounded-full bg-gray-800/50 border border-gray-700/50 text-[11px] font-medium text-gray-400 whitespace-nowrap flex-shrink-0">
                                    +{extraTagCount}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                        {microMeta}
                        <div className="text-right ml-4 flex items-center">
                            {actualDiscountPrice && actualOriginalPrice && actualOriginalPrice > actualDiscountPrice ? (
                                <div className="flex items-center justify-end gap-2 leading-none">
                                    <span className="text-xl md:text-lg font-bold text-[#00FF89] leading-none">
                                        {formatPrice(actualDiscountPrice)}
                                    </span>
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


import { motion } from 'framer-motion'
import { Star, Heart, Eye, CheckCircle2 } from 'lucide-react'
import { useState, memo, useEffect } from 'react'
import Link from 'next/link'
const ProductCardLite = memo(function ProductCardLite({ product, viewMode = 'grid' }) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [imageLoadAttempts, setImageLoadAttempts] = useState(0)
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
    const sellerInfo = seller?.name || seller?.fullName ? seller : sellerId || {}
    const sellerDisplayName = sellerInfo.name || sellerInfo.fullName || ''
    const sellerVerified = sellerInfo.verified || sellerInfo.verification?.status === 'approved'
    const productRating =
        typeof productAverageRating === 'number' && productAverageRating > 0 ? productAverageRating : legacyRating > 0 ? legacyRating : 0
    const description = (shortDescription || product?.description || fullDescription || 'No description available').trim()
    const productUrl = `/products/${slug || id}`
    const getProductImage = () => {
        const imageSources = [
            image,
            thumbnail, 
            images?.[0],
            product?.featuredImage,
            product?.mainImage
        ].filter(Boolean) 
        for (const src of imageSources) {
            if (src && typeof src === 'string' && src.trim() !== '') {
                if (!src.includes('via.placeholder.com') && !src.includes('placeholder')) {
                    return src
                }
            }
        }
        return '/images/placeholder-product.svg'
    }
    const productImage = getProductImage()
    useEffect(() => {
    }, [id, title, productImage, isImageLoading, imageError, imageLoadAttempts])
    const handleImageLoad = () => {
        setIsImageLoading(false)
        setImageError(false)
    }
    const handleImageError = (error) => {
        const newAttempts = imageLoadAttempts + 1
        setImageError(true)
        setIsImageLoading(false)
        setImageLoadAttempts(newAttempts)
    }
    const actualDiscountPrice = discountPrice || (originalPrice && originalPrice > price ? price : null)
    const actualOriginalPrice = originalPrice || (discountPrice && discountPrice < price ? price : null)
    const discountPercentage = actualOriginalPrice && actualDiscountPrice && actualOriginalPrice > actualDiscountPrice ? 
        Math.round(((actualOriginalPrice - actualDiscountPrice) / actualOriginalPrice) * 100) : 0
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
    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }
    const microMeta = (
        <div className="flex items-center gap-3 text-[14px] md:text-[13px] font-medium text-gray-500 leading-tight">
            {sellerDisplayName ? (
                <span className="inline-flex items-center gap-1 max-w-[180px] truncate text-gray-300 text-[14px] md:text-[13px]">
                    {sellerVerified && <CheckCircle2 className="w-4 h-4 text-[#00FF89]" />}
                    <span className="truncate">{sellerDisplayName}</span>
                </span>
            ) : (
                <span className="text-gray-600">Unknown seller</span>
            )}
        </div>
    )
    const displayTags = tags.slice(0, 2)
    const extraTagCount = tags.length > 2 ? tags.length - 2 : 0
    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.25 }}
                className="bg-[#101010] border border-[#1d1d1d] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-all group">
                <Link
                    href={productUrl}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60 rounded-2xl">
                    <div className="flex flex-col md:flex-row p-4 md:p-7 gap-4 md:gap-7 w-full">
                        <div className="relative w-full md:w-36 h-48 md:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-[#1c1c1c]">
                            {!imageError ? (
                                <img
                                    src={productImage}
                                    alt={title}
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Eye className="w-7 h-7 text-gray-600" />
                                    <div className="absolute bottom-1 right-1 text-[8px] text-gray-500 bg-black/50 px-1 rounded">ERR</div>
                                </div>
                            )}
                            {isImageLoading && <div className="absolute inset-0 bg-gray-700/30 animate-pulse" />}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {isFeatured && (
                                    <span className="px-2.5 md:px-3.5 py-1 rounded-full bg-black/55 backdrop-blur text-[11px] md:text-[14px] font-semibold tracking-wide text-[#00FF89] border border-[#00FF89]/30">
                                        Featured
                                    </span>
                                )}
                                {discountPercentage > 0 && (
                                    <span className="px-2.5 md:px-3.5 py-1 rounded-full bg-black/55 backdrop-blur text-[11px] md:text-[14px] font-semibold tracking-wide text-red-400 border border-red-400/30">
                                        -{discountPercentage}%
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleLike}
                                className="absolute top-2 right-2 p-1.5 rounded-md bg-black/40 backdrop-blur hover:bg-black/60 transition">
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
                            </button>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                            <div className="mb-2">
                                <h3 className="text-[16px] md:text-[18px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#00FF89] transition-colors">
                                    {title}
                                </h3>
                                <div className="mt-1 flex items-center gap-1.5 text-[11px] md:text-[12px] text-gray-300">
                                    <span className="inline-flex items-center gap-1 bg-[#1a1a1a] border border-[#272727] px-2 py-0.5 rounded-md text-[11px] font-medium">
                                        <Star className="w-3.5 h-3.5 text-yellow-400" />
                                        {productRating.toFixed(1)}
                                    </span>
                                    {productRating === 0 && isNewProduct && (
                                        <span className="text-[10px] md:text-[11px] font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">New</span>
                                    )}
                                </div>
                            </div>
                            <p className="text-[13px] md:text-[14.5px] text-gray-300 line-clamp-3 md:line-clamp-3 mb-3 md:mb-4 leading-relaxed">
                                {description}
                            </p>
                            {displayTags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3 md:mb-4">
                                    {displayTags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 rounded-full border border-[#272727] text-[9px] md:text-[10px] uppercase tracking-wide text-gray-400">
                                            {tag}
                                        </span>
                                    ))}
                                    {extraTagCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full border border-[#272727] text-[9px] md:text-[10px] text-gray-500">
                                            +{extraTagCount}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="mt-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                                <div>{microMeta}</div>
                                <div className="text-left md:text-right md:ml-4 flex items-center">
                                    {actualDiscountPrice && actualOriginalPrice && actualDiscountPrice < actualOriginalPrice ? (
                                        <div className="flex items-center justify-end gap-2 leading-none">
                                            <span className="text-lg md:text-xl font-bold text-[#00FF89] leading-none">
                                                {formatPrice(actualDiscountPrice)}
                                            </span>
                                            <span className="text-xs md:text-xs text-gray-500 line-through leading-none">
                                                {formatPrice(actualOriginalPrice)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-lg md:text-xl font-bold text-[#00FF89] leading-none">{formatPrice(price)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        )
    }
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 260 }}
            className="group bg-[#101010] border border-[#1d1d1d] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-all">
            <Link
                href={productUrl}
                className="flex flex-col h-full">
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
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/70 px-2 py-1 rounded">
                                IMG ERROR (Attempt: {imageLoadAttempts})
                            </div>
                        </div>
                    )}
                    {isImageLoading && (
                        <div className="absolute inset-0 bg-gray-700/30 animate-pulse">
                            <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-black/70 px-2 py-1 rounded">
                                Loading...
                            </div>
                        </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isFeatured && (
                            <span className="px-2.5 py-1 rounded-full bg-black/55 backdrop-blur text-[11px] font-semibold tracking-wide text-[#00FF89] border border-[#00FF89]/30">
                                Featured
                            </span>
                        )}
                        {discountPercentage > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-black/55 backdrop-blur text-[11px] font-semibold tracking-wide text-red-400 border border-red-400/30">
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
                            {actualDiscountPrice && actualOriginalPrice && actualDiscountPrice < actualOriginalPrice ? (
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
            </Link>
        </motion.div>
    )
})
export default ProductCardLite
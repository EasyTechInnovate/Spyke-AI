import { motion } from 'framer-motion'
import { Star, Heart, ShoppingCart, Eye, CheckCircle2, ExternalLink, TrendingUp } from 'lucide-react'
import { useState, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const ProductCardLite = memo(function ProductCardLite({ product, viewMode = 'grid' }) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

    // Safe data extraction with fallbacks
    const {
        _id: id,
        slug,
        title = 'Untitled Product',
        description = 'No description available',
        price = 0,
        discountPrice,
        rating = 0,
        reviewCount = 0,
        image,
        images = [],
        category = 'general',
        tags = [],
        seller = {},
        sales = 0,
        isFeatured = false,
        isNew = false,
        createdAt
    } = product || {}

    // Use slug for navigation with fallback to id
    const productUrl = `/products/${slug || id}`

    // Use the first available image
    const productImage = image || images?.[0] || '/images/placeholder-product.jpg'

    // Calculate discount percentage
    const discountPercentage = discountPrice && price > discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0

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

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        // Add to cart logic here
    }

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0a0a0a] border border-[#2a2b3d] rounded-2xl overflow-hidden hover:border-[#00FF89]/30 transition-all duration-300 group">
                <Link
                    href={productUrl}
                    className="block">
                    <div className="flex p-6 gap-6">
                        {/* Image */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <div className="w-full h-full bg-[#2a2b3d] rounded-xl overflow-hidden">
                                {!imageError ? (
                                    <Image
                                        src={productImage}
                                        alt={title}
                                        fill
                                        className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                                            isImageLoading ? 'opacity-0' : 'opacity-100'
                                        }`}
                                        onLoad={() => setIsImageLoading(false)}
                                        onError={() => {
                                            setImageError(true)
                                            setIsImageLoading(false)
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#2a2b3d]">
                                        <Eye className="w-8 h-8 text-gray-500" />
                                    </div>
                                )}

                                {/* Loading skeleton */}
                                {isImageLoading && <div className="absolute inset-0 bg-gray-700 animate-pulse rounded-xl" />}

                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    {isFeatured && <span className="px-2 py-1 bg-[#00FF89] text-black text-xs font-bold rounded-full">Featured</span>}
                                    {isNewProduct && <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">New</span>}
                                    {discountPercentage > 0 && (
                                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">-{discountPercentage}%</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white group-hover:text-[#00FF89] transition-colors mb-1 truncate">
                                        {title}
                                    </h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{description}</p>

                                    {/* Tags */}
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {tags.slice(0, 3).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-[#2a2b3d] text-gray-300 text-xs rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                            {tags.length > 3 && (
                                                <span className="px-2 py-1 bg-[#2a2b3d] text-gray-400 text-xs rounded-full">+{tags.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={handleLike}
                                        className="p-2 rounded-lg bg-[#2a2b3d] hover:bg-[#3a3b4d] transition-colors">
                                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                    </button>
                                    <button
                                        onClick={handleAddToCart}
                                        className="p-2 rounded-lg bg-[#00FF89] hover:bg-[#00FF89]/90 text-black transition-colors">
                                        <ShoppingCart className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Bottom row */}
                            <div className="flex items-center justify-between">
                                {/* Rating & Reviews */}
                                <div className="flex items-center gap-4">
                                    {rating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${
                                                            i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-400">
                                                {rating.toFixed(1)} ({reviewCount})
                                            </span>
                                        </div>
                                    )}

                                    {/* Seller info */}
                                    {seller?.name && (
                                        <div className="flex items-center gap-1 text-sm text-gray-400">
                                            {seller.verified && <CheckCircle2 className="w-3 h-3 text-[#00FF89]" />}
                                            <span>{seller.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                    {discountPrice && discountPrice < price ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-[#00FF89]">{formatPrice(discountPrice)}</span>
                                            <span className="text-sm text-gray-400 line-through">{formatPrice(price)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-lg font-bold text-[#00FF89]">{formatPrice(price)}</span>
                                    )}
                                    {sales > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <TrendingUp className="w-3 h-3" />
                                            <span>{sales} sold</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        )
    }

    // Grid view (default)
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            className="bg-[#0a0a0a] border border-[#2a2b3d] rounded-2xl overflow-hidden hover:border-[#00FF89]/30 transition-all duration-300 group hover:shadow-xl hover:shadow-[#00FF89]/10">
            <Link
                href={productUrl}
                className="block">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    <div className="w-full h-full bg-[#2a2b3d]">
                        {!imageError ? (
                            <Image
                                src={productImage}
                                alt={title}
                                fill
                                className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                                    isImageLoading ? 'opacity-0' : 'opacity-100'
                                }`}
                                onLoad={() => setIsImageLoading(false)}
                                onError={() => {
                                    setImageError(true)
                                    setIsImageLoading(false)
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#2a2b3d]">
                                <Eye className="w-12 h-12 text-gray-500" />
                            </div>
                        )}

                        {/* Loading skeleton */}
                        {isImageLoading && <div className="absolute inset-0 bg-gray-700 animate-pulse" />}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {isFeatured && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="px-2 py-1 bg-[#00FF89] text-black text-xs font-bold rounded-full shadow-lg">
                                    Featured
                                </motion.span>
                            )}
                            {isNewProduct && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                                    New
                                </motion.span>
                            )}
                            {discountPercentage > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                                    -{discountPercentage}%
                                </motion.span>
                            )}
                        </div>

                        {/* Action buttons - appear on hover */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLike}
                                className="p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors">
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleAddToCart}
                                className="p-2 rounded-lg bg-[#00FF89]/90 hover:bg-[#00FF89] text-black transition-colors">
                                <ShoppingCart className="w-4 h-4" />
                            </motion.button>
                        </div>

                        {/* Quick view button - bottom overlay */}
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <button className="w-full py-2 bg-black/50 backdrop-blur-sm text-white text-sm font-medium rounded-lg hover:bg-black/70 transition-colors flex items-center justify-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                Quick View
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Title and Price */}
                    <div className="mb-3">
                        <h3 className="font-bold text-white group-hover:text-[#00FF89] transition-colors mb-1 line-clamp-2 leading-tight">{title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3 leading-relaxed">{description}</p>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-2">
                            {discountPrice && discountPrice < price ? (
                                <>
                                    <span className="text-xl font-bold text-[#00FF89]">{formatPrice(discountPrice)}</span>
                                    <span className="text-sm text-gray-400 line-through">{formatPrice(price)}</span>
                                </>
                            ) : (
                                <span className="text-xl font-bold text-[#00FF89]">{formatPrice(price)}</span>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {tags.slice(0, 2).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-[#2a2b3d] text-gray-300 text-xs rounded-full">
                                    {tag}
                                </span>
                            ))}
                            {tags.length > 2 && <span className="px-2 py-1 bg-[#2a2b3d] text-gray-400 text-xs rounded-full">+{tags.length - 2}</span>}
                        </div>
                    )}

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                        {/* Rating */}
                        {rating > 0 ? (
                            <div className="flex items-center gap-1">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-400">{rating.toFixed(1)}</span>
                                {reviewCount > 0 && <span className="text-sm text-gray-500">({reviewCount})</span>}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-500">No reviews yet</span>
                        )}

                        {/* Seller */}
                        {seller?.name && (
                            <div className="flex items-center gap-1">
                                {seller.verified && <CheckCircle2 className="w-3 h-3 text-[#00FF89]" />}
                                <span className="text-xs text-gray-400 truncate max-w-20">{seller.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Sales info */}
                    {sales > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <TrendingUp className="w-3 h-3" />
                            <span>{sales} sold</span>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    )
})

export default ProductCardLite

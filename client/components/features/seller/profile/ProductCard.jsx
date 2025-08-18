'use client'

import { Star, Eye, ShoppingCart, Heart } from 'lucide-react'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'

export default function ProductCard({ product, viewMode = 'grid', onClick }) {
    const {
        id,
        title,
        description,
        price,
        originalPrice,
        category,
        rating = 0,
        reviewCount = 0,
        sales = 0,
        images = [],
        tags = []
    } = product

    const discount = originalPrice && originalPrice > price 
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : null

    if (viewMode === 'list') {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-brand-primary/50 transition-all duration-200 cursor-pointer group">
                <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-800 rounded-lg overflow-hidden">
                        {images[0] ? (
                            <OptimizedImage
                                src={images[0]}
                                alt={title}
                                width={80}
                                height={80}
                                className="w-full h-full group-hover:scale-105 transition-transform duration-200"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-8 h-8 text-gray-500" />
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white text-lg mb-1 line-clamp-1 group-hover:text-brand-primary transition-colors">
                                    {title}
                                </h3>
                                {category && (
                                    <span className="text-sm text-gray-400">{category}</span>
                                )}
                            </div>
                            <div className="text-right ml-4">
                                <div className="flex items-center gap-2">
                                    {discount && (
                                        <span className="text-sm text-gray-400 line-through">
                                            ${originalPrice}
                                        </span>
                                    )}
                                    <span className="text-xl font-bold text-brand-primary">
                                        ${price}
                                    </span>
                                </div>
                                {discount && (
                                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                                        -{discount}%
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {description}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                                    <span>{rating.toFixed(1)} ({reviewCount})</span>
                                </div>
                                <div>{sales} sales</div>
                            </div>
                            
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onClick?.(product?.slug || product?._id || id)
                                }}
                                className="px-4 py-2 bg-brand-primary text-black rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div 
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-brand-primary/50 transition-all duration-200 cursor-pointer group"
            onClick={() => onClick?.(product?.slug || product?._id || id)}
        >
            {/* Product Image */}
            <div className="relative aspect-video bg-gray-800 overflow-hidden">
                {images[0] ? (
                    <img
                        src={images[0]}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-gray-500" />
                    </div>
                )}

                {/* Discount Badge */}
                {discount && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            -{discount}%
                        </span>
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        // Handle wishlist toggle
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Heart className="w-4 h-4" />
                </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <div className="mb-2">
                    {category && (
                        <span className="text-xs text-brand-primary font-medium uppercase tracking-wider">
                            {category}
                        </span>
                    )}
                </div>

                <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                    {title}
                </h3>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {description}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        <span>{rating.toFixed(1)}</span>
                        <span>({reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{sales} sales</span>
                    </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                    <div>
                        {discount && (
                            <span className="text-sm text-gray-400 line-through mr-2">
                                ${originalPrice}
                            </span>
                        )}
                        <span className="text-xl font-bold text-brand-primary">
                            ${price}
                        </span>
                    </div>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            // Handle add to cart
                        }}
                        className="px-4 py-2 bg-brand-primary text-black rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}
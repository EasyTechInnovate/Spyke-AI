import { Star, CheckCircle, ShoppingCart, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo, memo } from 'react'

const ProductCardLite = memo(function ProductCardLite({ product, viewMode = 'grid' }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const discountPercentage = useMemo(() => {
    return product.originalPrice && product.originalPrice > product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0
  }, [product.originalPrice, product.price])

  // Get product URL
  const productUrl = `/products/${product.slug || product._id}`

  // Get type display name
  const getTypeDisplay = (type) => {
    const typeMap = {
      prompt: 'AI Prompt',
      automation: 'Automation',
      agent: 'AI Agent',
      bundle: 'Bundle'
    }
    return typeMap[type] || type
  }

  if (viewMode === 'list') {
    return (
      <Link href={productUrl}>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-brand-primary/50 transition-all duration-300 cursor-pointer">
          <div className="flex gap-6">
            {/* Image */}
            <div className="relative w-48 h-32 bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden">
              <Image
                src={product.thumbnail || 'https://via.placeholder.com/400x300?text=Product'}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 192px"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {product.shortDescription || ''}
                  </p>
                </div>
                
                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-brand-primary">
                    {product.price === 0 ? 'Free' : `$${product.price}`}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                      <span className="text-green-400">
                        -{discountPercentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-white font-medium">{product.averageRating || 0}</span>
                    <span className="text-gray-500">({product.totalReviews || 0})</span>
                  </div>

                  {/* Seller */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">by</span>
                    <span className="text-gray-300">{product.sellerId?.fullName || 'Anonymous'}</span>
                    {product.sellerId?.verification?.status === 'approved' && (
                      <CheckCircle className="w-4 h-4 text-brand-primary" />
                    )}
                  </div>

                  {/* Type */}
                  <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs rounded">
                    {getTypeDisplay(product.type)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={productUrl}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 cursor-pointer group h-full">
        {/* Image */}
        <div className="relative h-48 bg-gray-800 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse" />
          )}
          <Image
            src={product.thumbnail || 'https://via.placeholder.com/400x300?text=Product'}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Badges */}
          {product.isVerified && product.isTested && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-brand-primary text-black text-sm font-semibold rounded-full z-10">
              Verified
            </div>
          )}
          
          {discountPercentage > 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full z-10">
              -{discountPercentage}%
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title and Description */}
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {product.shortDescription || ''}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-white font-medium">{product.averageRating || 0}</span>
            </div>
            <span className="text-gray-500 text-sm">
              ({product.totalReviews || 0} reviews)
            </span>
            {product.sales > 100 && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 text-sm">
                  {product.sales.toLocaleString()} sales
                </span>
              </>
            )}
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-700 rounded-full" />
            <span className="text-gray-400 text-sm">{product.sellerId?.fullName || 'Anonymous'}</span>
            {product.sellerId?.verification?.status === 'approved' && (
              <CheckCircle className="w-4 h-4 text-brand-primary" />
            )}
          </div>

          {/* Price and Type */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-brand-primary">
                  {product.price === 0 ? 'Free' : `$${product.price}`}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <span className="text-sm text-green-400">
                  Save {discountPercentage}%
                </span>
              )}
            </div>
            <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary text-sm rounded-full">
              {getTypeDisplay(product.type)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
})

export default ProductCardLite
import { motion } from 'framer-motion'
import { Star, CheckCircle, ShoppingCart, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import toast from '@/lib/utils/toast'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'

export default function ProductCard({ product, viewMode = 'grid' }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { requireAuth } = useAuth()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Allow both authenticated and guest users to add to cart
      const success = await addToCart(product)
      if (success) {
        toast.cart.addedToCart(product.title)
        track(ANALYTICS_EVENTS.CART.ITEM_ADDED, eventProperties.cart(product.id, 1, product.price))
      }
    } catch (error) {
      // Don't show error toast here - useCart already handles it
    }
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/products/${product.slug || product.id}`)
  }

  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product.slug || product.id}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-brand-primary/50 transition-all duration-300 cursor-pointer"
        >
          <div className="flex gap-6">
            {/* Image */}
            <div className="relative w-48 h-32 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl flex-shrink-0 overflow-hidden">
              <OptimizedImage
                src={product.image}
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
                    {product.description}
                  </p>
                </div>
                
                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-brand-primary">
                    ${product.price}
                  </div>
                  {product.originalPrice > product.price && (
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
                    <span className="text-white font-medium">{product.rating}</span>
                    <span className="text-gray-500">({product.reviewCount})</span>
                  </div>

                  {/* Seller */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">by</span>
                    <span className="text-gray-300">{product.seller.name}</span>
                    {product.seller.verified && (
                      <CheckCircle className="w-4 h-4 text-brand-primary" />
                    )}
                  </div>

                  {/* Category */}
                  <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs rounded">
                    {product.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuickView}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="px-4 py-2 bg-brand-primary text-brand-primary-text font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 cursor-pointer group"
      >
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-700 overflow-hidden">
          <OptimizedImage
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {product.featured && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-brand-primary text-black text-sm font-semibold rounded-full z-10">
              Featured
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={handleQuickView}
              className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-colors"
            >
              <Eye className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleAddToCart}
              className="p-3 bg-brand-primary hover:bg-brand-primary/90 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-brand-primary-text" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title and Description */}
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-white font-medium">{product.rating}</span>
            </div>
            <span className="text-gray-500 text-sm">
              ({product.reviewCount} reviews)
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
            <div className="relative w-6 h-6 bg-gray-700 rounded-full overflow-hidden">
              <OptimizedImage
                src={product.seller.avatar}
                alt={product.seller.name}
                fill
                className="object-cover"
                sizes="24px"
              />
            </div>
            <span className="text-gray-400 text-sm">{product.seller.name}</span>
            {product.seller.verified && (
              <CheckCircle className="w-4 h-4 text-brand-primary" />
            )}
          </div>

          {/* Price and Category */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-brand-primary">
                  ${product.price}
                </span>
                {product.originalPrice > product.price && (
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
              {product.category}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
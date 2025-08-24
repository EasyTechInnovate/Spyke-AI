import { motion } from 'framer-motion'
import { Star, CheckCircle, ShoppingCart, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import toast from '@/lib/utils/toast'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'

// Import Design System Components
import {
  DSStack,
  DSHeading,
  DSText,
  DSButton,
  DSBadge
} from '@/lib/design-system'

export default function ProductCard({ product, viewMode = 'grid' }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { requireAuth } = useAuth()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
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
  
  const formatPrice = (price) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Get product type color for consistent theming
  const getTypeColor = (type) => {
    const typeColors = {
      'AI Prompt': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Automation': 'bg-green-500/20 text-green-300 border-green-500/30',
      'AI Agent': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Bundle': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Template': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Course': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    }
    return typeColors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product.slug || product.id}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-300 cursor-pointer group">
          
          <DSStack direction="row" gap="medium" align="start">
            {/* Image */}
            <div className="relative w-48 h-32 bg-gray-800/50 rounded-xl flex-shrink-0 overflow-hidden">
              <OptimizedImage
                src={product.image || product.thumbnail}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 192px"
              />
              
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-lg border border-red-400/30">
                    -{discountPercentage}%
                  </span>
                </div>
              )}

              {/* Popular Badge */}
              {product.sales > 100 && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-brand-primary/90 backdrop-blur-sm text-black text-xs font-semibold rounded-lg">
                    Popular
                  </span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <DSStack direction="column" gap="small" className="flex-1">
              <DSStack direction="row" justify="between" align="start">
                <DSStack direction="column" gap="small" className="flex-1">
                  {/* Product Type Badge */}
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(product.category || product.type)}`}>
                    {product.category || product.type || 'Product'}
                  </span>

                  <DSHeading level={3} size="lg" className="group-hover:text-brand-primary transition-colors duration-300">
                    <span style={{ color: 'white' }}>{product.title}</span>
                  </DSHeading>
                  
                  <DSText size="sm" style={{ color: '#9ca3af' }} className="line-clamp-2">
                    {product.description || product.shortDescription}
                  </DSText>
                </DSStack>
                
                {/* Price */}
                <DSStack direction="column" align="end" className="flex-shrink-0">
                  <DSText size="xl" style={{ color: '#00FF89', fontWeight: 700 }}>
                    {formatPrice(product.price)}
                  </DSText>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <DSStack direction="row" gap="small" align="center">
                      <DSText size="sm" style={{ color: '#6b7280', textDecoration: 'line-through' }}>
                        {formatPrice(product.originalPrice)}
                      </DSText>
                    </DSStack>
                  )}
                </DSStack>
              </DSStack>

              <DSStack direction="row" justify="between" align="center">
                <DSStack direction="row" gap="medium" align="center">
                  {/* Rating */}
                  <DSStack direction="row" gap="xsmall" align="center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <DSText size="sm" style={{ color: 'white', fontWeight: 500 }}>
                      {(product.rating || product.averageRating || 0).toFixed(1)}
                    </DSText>
                    <DSText size="sm" style={{ color: '#6b7280' }}>
                      ({product.reviewCount || product.totalReviews || 0})
                    </DSText>
                  </DSStack>

                  {/* Seller */}
                  <DSStack direction="row" gap="small" align="center">
                    <div className="relative w-6 h-6 bg-gradient-to-br from-brand-primary/20 to-purple-500/20 rounded-full flex items-center justify-center overflow-hidden border border-gray-600/30">
                      <OptimizedImage
                        src={product.seller?.avatar || product.sellerId?.avatar || '/logo-icon.svg'}
                        alt={product.seller?.name || 'Seller'}
                        fill
                        className="object-cover"
                        sizes="24px"
                      />
                    </div>
                    <DSText size="sm" style={{ color: '#d1d5db' }}>
                      {product.seller?.name || product.sellerId?.fullName || 'Anonymous'}
                    </DSText>
                    {(product.seller?.verified || product.sellerId?.verification?.status === 'approved') && (
                      <CheckCircle className="w-4 h-4 text-brand-primary" />
                    )}
                  </DSStack>
                </DSStack>

                {/* Actions */}
                <DSStack direction="row" gap="small">
                  <button
                    onClick={handleQuickView}
                    className="p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-300 text-gray-300 hover:text-white">
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={handleAddToCart}
                    className="px-4 py-2 bg-brand-primary text-black font-semibold rounded-lg hover:bg-brand-primary/90 transition-all duration-300 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </DSStack>
              </DSStack>
            </DSStack>
          </DSStack>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/products/${product.slug || product.id}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden hover:border-brand-primary/50 hover:shadow-xl hover:shadow-brand-primary/10 transition-all duration-300 cursor-pointer group h-full flex flex-col">
        
        {/* Image */}
        <div className="relative aspect-[3/2] bg-gradient-to-br from-gray-800/50 to-gray-900/50 overflow-hidden">
          <OptimizedImage
            src={product.image || product.thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Featured Badge */}
          {(product.featured || product.isFeatured) && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-brand-primary/90 backdrop-blur-sm text-black text-xs font-bold rounded-lg">
                Featured
              </span>
            </div>
          )}
          
          {/* Discount Badge */}
          {discountPercentage > 0 && !product.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-lg border border-red-400/30">
                -{discountPercentage}%
              </span>
            </div>
          )}

          {/* Popular Badge */}
          {product.sales > 100 && !product.featured && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-lg border border-orange-400/30">
                Popular
              </span>
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              onClick={handleQuickView}
              className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 hover:scale-110 transition-all duration-300 text-white">
              <Eye className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleAddToCart}
              className="p-3 bg-brand-primary/90 backdrop-blur-sm border border-brand-primary/30 rounded-xl hover:bg-brand-primary hover:scale-110 transition-all duration-300 text-black">
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <DSStack direction="column" gap="small" className="h-full">
            {/* Type Badge and Rating */}
            <DSStack direction="row" justify="between" align="center">
              <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold border ${getTypeColor(product.category || product.type)}`}>
                {product.category || product.type || 'Product'}
              </span>
              
              <DSStack direction="row" gap="xsmall" align="center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <DSText size="sm" style={{ color: 'white', fontWeight: 500 }}>
                  {(product.rating || product.averageRating || 0).toFixed(1)}
                </DSText>
                <DSText size="sm" style={{ color: '#6b7280' }}>
                  ({product.reviewCount || product.totalReviews || 0})
                </DSText>
              </DSStack>
            </DSStack>

            {/* Title */}
            <DSHeading level={3} size="base" className="line-clamp-2 group-hover:text-brand-primary transition-colors duration-300">
              <span style={{ color: 'white' }}>{product.title}</span>
            </DSHeading>

            {/* Description */}
            <DSText size="sm" style={{ color: '#9ca3af' }} className="line-clamp-2 flex-1">
              {product.description || product.shortDescription}
            </DSText>

            {/* Seller Info */}
            <DSStack direction="row" gap="small" align="center">
              <div className="relative w-7 h-7 bg-gradient-to-br from-brand-primary/20 to-purple-500/20 rounded-full flex items-center justify-center overflow-hidden border border-gray-600/30">
                {product.seller?.avatar || product.sellerId?.avatar ? (
                  <OptimizedImage
                    src={product.seller?.avatar || product.sellerId?.avatar}
                    alt={product.seller?.name || 'Seller'}
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                ) : (
                  <span className="text-xs font-bold text-brand-primary">
                    {(product.seller?.name || product.sellerId?.fullName || 'A')[0]}
                  </span>
                )}
              </div>
              
              <DSText size="sm" style={{ color: '#9ca3af' }} className="truncate">
                {product.seller?.name || product.sellerId?.fullName || 'Anonymous Seller'}
              </DSText>
              
              {(product.seller?.verified || product.sellerId?.verification?.status === 'approved') && (
                <CheckCircle className="w-4 h-4 text-brand-primary flex-shrink-0" />
              )}
            </DSStack>

            {/* Price and Sales */}
            <DSStack direction="row" justify="between" align="center" className="mt-2">
              <DSStack direction="column" gap="xsmall">
                <DSStack direction="row" gap="small" align="baseline">
                  <DSText size="lg" style={{ color: '#00FF89', fontWeight: 700 }}>
                    {formatPrice(product.price)}
                  </DSText>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <DSText size="sm" style={{ color: '#6b7280', textDecoration: 'line-through' }}>
                      {formatPrice(product.originalPrice)}
                    </DSText>
                  )}
                </DSStack>
                
                {product.sales > 0 && (
                  <DSText size="xs" style={{ color: '#9ca3af' }}>
                    {product.sales.toLocaleString()} sales
                  </DSText>
                )}
              </DSStack>

              {/* Quick Add Button */}
              <button
                onClick={handleAddToCart}
                className="p-2 bg-brand-primary/10 border border-brand-primary/30 rounded-lg hover:bg-brand-primary/20 hover:border-brand-primary/50 transition-all duration-300 text-brand-primary group/btn">
                <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
              </button>
            </DSStack>
          </DSStack>
        </div>
      </motion.div>
    </Link>
  )
}
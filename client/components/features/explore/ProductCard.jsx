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

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product.slug || product.id}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-[#171717] border border-gray-800 rounded-xl p-6 hover:border-[#00FF89]/50 transition-all duration-200 cursor-pointer group">
          
          <DSStack direction="row" gap="medium" align="start">
            {/* Image */}
            <div className="relative w-48 h-32 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
              <OptimizedImage
                src={product.image || product.thumbnail}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 192px"
              />
              
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-2 right-2">
                  <DSBadge variant="error" size="small">
                    -{discountPercentage}%
                  </DSBadge>
                </div>
              )}
            </div>
            
            {/* Content */}
            <DSStack direction="column" gap="small" className="flex-1">
              <DSStack direction="row" justify="between" align="start">
                <DSStack direction="column" gap="small" className="flex-1">
                  <DSHeading level={3} size="lg" className="group-hover:text-[#00FF89] transition-colors">
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
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <DSText size="sm" style={{ color: 'white', fontWeight: 500 }}>
                      {(product.rating || product.averageRating || 0).toFixed(1)}
                    </DSText>
                    <DSText size="sm" style={{ color: '#6b7280' }}>
                      ({product.reviewCount || product.totalReviews || 0})
                    </DSText>
                  </DSStack>

                  {/* Seller */}
                  <DSStack direction="row" gap="small" align="center">
                    <DSText size="sm" style={{ color: '#6b7280' }}>by</DSText>
                    <DSText size="sm" style={{ color: '#d1d5db' }}>
                      {product.seller?.name || product.sellerId?.fullName || 'Anonymous'}
                    </DSText>
                    {(product.seller?.verified || product.sellerId?.verification?.status === 'approved') && (
                      <CheckCircle className="w-4 h-4 text-[#00FF89]" />
                    )}
                  </DSStack>

                  {/* Category */}
                  <DSBadge variant="primary" size="small">
                    {product.category || product.type}
                  </DSBadge>
                </DSStack>

                {/* Actions */}
                <DSStack direction="row" gap="small">
                  <DSButton
                    variant="secondary"
                    size="small"
                    onClick={handleQuickView}>
                    <Eye className="w-4 h-4" />
                  </DSButton>
                  
                  <DSButton
                    variant="primary"
                    size="small"
                    onClick={handleAddToCart}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </DSButton>
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
        whileHover={{ y: -2 }}
        className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden hover:border-[#00FF89]/50 transition-all duration-200 cursor-pointer group h-full flex flex-col">
        
        {/* Image */}
        <div className="relative aspect-[3/2] bg-gray-800 overflow-hidden">
          <OptimizedImage
            src={product.image || product.thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Featured Badge */}
          {(product.featured || product.isFeatured) && (
            <div className="absolute top-2 left-2">
              <DSBadge variant="primary" size="small">
                Featured
              </DSBadge>
            </div>
          )}
          
          {/* Discount Badge */}
          {discountPercentage > 0 && !product.featured && (
            <div className="absolute top-2 right-2">
              <DSBadge variant="error" size="small">
                -{discountPercentage}%
              </DSBadge>
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <DSButton
              variant="secondary"
              size="small"
              onClick={handleQuickView}
              className="!bg-white/10 !backdrop-blur-sm hover:!bg-white/20">
              <Eye className="w-4 h-4" />
            </DSButton>
            
            <DSButton
              variant="primary"
              size="small"
              onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4" />
            </DSButton>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <DSStack direction="column" gap="small" className="h-full">
            {/* Type Badge */}
            <DSStack direction="row" justify="between" align="center">
              <DSText size="sm" style={{ color: '#00FF89', fontWeight: 600 }}>
                {product.category || product.type || 'Product'}
              </DSText>
              
              <DSStack direction="row" gap="xsmall" align="center">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <DSText size="sm" style={{ color: 'white', fontWeight: 500 }}>
                  {(product.rating || product.averageRating || 0).toFixed(1)}
                </DSText>
                <DSText size="sm" style={{ color: '#6b7280' }}>
                  ({product.reviewCount || product.totalReviews || 0})
                </DSText>
              </DSStack>
            </DSStack>

            {/* Title */}
            <DSHeading level={3} size="base" className="line-clamp-2 group-hover:text-[#00FF89] transition-colors">
              <span style={{ color: 'white' }}>{product.title}</span>
            </DSHeading>

            {/* Description */}
            <DSText size="sm" style={{ color: '#9ca3af' }} className="line-clamp-2 flex-1">
              {product.description || product.shortDescription}
            </DSText>

            {/* Seller Info */}
            <DSStack direction="row" gap="small" align="center">
              <div className="relative w-6 h-6 bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                <OptimizedImage
                  src={product.seller?.avatar || product.sellerId?.avatar || '/logo-icon.svg'}
                  alt={product.seller?.name || 'Seller'}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
              
              <DSText size="sm" style={{ color: '#9ca3af' }} className="truncate">
                {product.seller?.name || product.sellerId?.fullName || 'Anonymous Seller'}
              </DSText>
              
              {(product.seller?.verified || product.sellerId?.verification?.status === 'approved') && (
                <CheckCircle className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
              )}
            </DSStack>

            {/* Price */}
            <DSStack direction="row" justify="between" align="center" className="mt-2">
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

              {/* Sales count or category badge */}
              {product.sales > 100 && (
                <DSText size="xs" style={{ color: '#9ca3af' }}>
                  {product.sales.toLocaleString()} sales
                </DSText>
              )}
            </DSStack>
          </DSStack>
        </div>
      </motion.div>
    </Link>
  )
}
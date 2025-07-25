'use client'

import { useState, memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Eye, ShoppingCart, CheckCircle, Sparkles, Loader2 } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SmoothProductCarousel from './featured/SmoothProductCarousel'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import toast from '@/lib/utils/toast'
import { useProducts } from '@/hooks/useProducts'
const getBadgeForProduct = (product) => {
  // Determine badge based on product metrics
  if (product.sales > 100) return 'Bestseller'
  if (product.views > 1000) return 'Hot'
  if (product.isVerified && product.isTested) return 'Verified'
  if (product.averageRating >= 4.8) return 'Top Rated'
  if (product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) return 'New'
  return null
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
  const { products, loading, error } = useProducts({
    sortBy: 'popularity',
    sortOrder: 'desc',
    limit: 7,
    verifiedOnly: 'true'
  })

  const handleProductClick = (slug) => {
    router.push(`/products/${slug}`)
  }

  return (
    <section className="relative overflow-hidden">
      {/* Seamless background transition from hero */}
      <div className="absolute inset-0 bg-black">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>
      
      <Container className="relative z-10 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-brand-primary">
                Trending This Week
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">
              Featured Products
            </h2>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
              Handpicked AI tools and prompts loved by thousands of creators
            </p>
          </motion.div>

          {/* Products Carousel */}
          <div className="mb-16">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Failed to load products</p>
                <Link
                  href="/explore"
                  className="text-brand-primary hover:text-brand-primary/80 transition-colors"
                >
                  Browse all products →
                </Link>
              </div>
            ) : products.length > 0 ? (
              products.length === 1 ? (
                // Center single product
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <ProductCard
                      product={products[0]}
                      onClick={() => handleProductClick(products[0].slug)}
                    />
                  </div>
                </div>
              ) : (
                // Show carousel for multiple products
                <SmoothProductCarousel 
                  autoPlay={true} 
                  interval={4000}
                  slidesToShow={Math.min(products.length, 4)}
                  slidesToScroll={1}
                  gap={24}
                  responsive={[
                    { breakpoint: 1280, settings: { slidesToShow: Math.min(products.length, 3) } },
                    { breakpoint: 768, settings: { slidesToShow: Math.min(products.length, 2) } },
                    { breakpoint: 640, settings: { slidesToShow: 1 } }
                  ]}
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      onClick={() => handleProductClick(product.slug)}
                    />
                  ))}
                </SmoothProductCarousel>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No products available</p>
                <Link
                  href="/explore"
                  className="text-brand-primary hover:text-brand-primary/80 transition-colors"
                >
                  Check back soon →
                </Link>
              </div>
            )}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-brand-primary-text font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 group font-body"
            >
              View All Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  )
})

function ProductCard({ product, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addToCart } = useCart()
  const { requireAuth } = useAuth()

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-yellow-500 text-black'
      case 'Hot':
        return 'bg-red-500 text-white'
      case 'New':
        return 'bg-[#00FF89] text-brand-primary-text'
      case 'Verified':
        return 'bg-brand-primary text-brand-primary-text'
      case 'Top Rated':
        return 'bg-purple-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const badge = getBadgeForProduct(product)
  const discountPercentage = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div
      className="group cursor-pointer h-full"
      onClick={onClick}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-200 hover:shadow-xl hover:shadow-brand-primary/10 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-gray-800 overflow-hidden">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse" />
          )}
          
          {/* Actual image */}
          <Image
            src={product.thumbnail || 'https://via.placeholder.com/400x300?text=Product+Image'}
            alt={product.title}
            width={400}
            height={300}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-2 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200">
              <Eye className="w-5 h-5" />
              <span className="font-medium font-body">Quick View</span>
            </div>
          </div>

          {/* Badge */}
          {badge && (
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getBadgeColor(badge)}`}>
                {badge}
              </span>
            </div>
          )}

          {/* Discount */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                -{discountPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Category & Rating */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-brand-primary">
              {getTypeDisplay(product.type)}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-white font-medium">{product.averageRating || 0}</span>
              <span className="text-sm text-gray-500">({product.totalReviews || 0})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors font-title">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1 font-body">
            {product.shortDescription}
          </p>

          {/* Bottom Section */}
          <div className="space-y-3">
            {/* Seller */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">by</span>
              <span className="text-sm text-gray-300">
                {product.sellerId?.fullName || 'Anonymous Seller'}
              </span>
              {product.sellerId?.verification?.status === 'approved' && (
                <CheckCircle className="w-4 h-4 text-brand-primary" />
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
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
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  requireAuth(() => {
                    const cartProduct = {
                      id: product._id || product.id,
                      title: product.title,
                      price: product.price,
                      thumbnail: product.thumbnail,
                      shortDescription: product.shortDescription,
                      type: product.type
                    }
                    if (addToCart(cartProduct)) {
                      toast.cart.addedToCart(product.title)
                    }
                  }, `/products/${product.slug}`)
                }}
                className="p-2 bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-5 h-5 text-brand-primary-text" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedProducts
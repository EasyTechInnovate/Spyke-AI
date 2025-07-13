'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Eye, ShoppingCart, CheckCircle, Sparkles } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import SmoothProductCarousel from './featured/SmoothProductCarousel'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import toast from '@/lib/utils/toast'

// Dummy product data with actual placeholder images
const FEATURED_PRODUCTS = [
  {
    id: 1,
    title: "Ultimate ChatGPT Prompt Collection",
    description: "200+ proven prompts for content creation, marketing, and business growth",
    price: 29.99,
    originalPrice: 49.99,
    rating: 4.9,
    reviews: 156,
    badge: "Bestseller",
    category: "AI Prompts",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    seller: {
      name: "PromptMaster Pro",
      verified: true
    }
  },
  {
    id: 2,
    title: "AI Automation Toolkit",
    description: "Complete automation scripts and workflows for business efficiency",
    price: 79.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviews: 98,
    badge: "Hot",
    category: "Tools",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=300&fit=crop",
    seller: {
      name: "AutomateAI",
      verified: true
    }
  },
  {
    id: 3,
    title: "Sales Copy Generator",
    description: "High-converting sales copy templates powered by AI",
    price: 49.99,
    originalPrice: 89.99,
    rating: 4.7,
    reviews: 234,
    badge: "New",
    category: "Templates",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
    seller: {
      name: "CopyGenius",
      verified: false
    }
  },
  {
    id: 4,
    title: "Content Creation Bundle",
    description: "Everything you need to create engaging content with AI",
    price: 99.99,
    originalPrice: 199.99,
    rating: 5.0,
    reviews: 67,
    badge: "Featured",
    category: "Bundles",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
    seller: {
      name: "ContentPro",
      verified: true
    }
  },
  {
    id: 5,
    title: "Advanced Midjourney Prompts",
    description: "Create stunning AI art with our curated prompt collection",
    price: 39.99,
    originalPrice: 69.99,
    rating: 4.9,
    reviews: 189,
    badge: "Bestseller",
    category: "AI Art",
    image: "https://images.unsplash.com/photo-1686633371045-062339154fc3?w=400&h=300&fit=crop",
    seller: {
      name: "ArtPrompts",
      verified: true
    }
  },
  {
    id: 6,
    title: "Business Strategy AI Assistant",
    description: "AI-powered business planning and strategy tools",
    price: 89.99,
    originalPrice: 149.99,
    rating: 4.6,
    reviews: 45,
    badge: "New",
    category: "Business",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    seller: {
      name: "StrategyAI",
      verified: false
    }
  },
  {
    id: 7,
    title: "Code Generation Toolkit",
    description: "Generate production-ready code with AI assistance",
    price: 69.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 267,
    badge: "Hot",
    category: "Development",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop",
    seller: {
      name: "CodeCraft AI",
      verified: true
    }
  },
  {
    id: 8,
    title: "Marketing Automation Suite",
    description: "Complete marketing automation with AI-driven insights",
    price: 129.99,
    originalPrice: 249.99,
    rating: 4.9,
    reviews: 123,
    badge: "Featured",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    seller: {
      name: "MarketingPro",
      verified: true
    }
  }
]

export default function FeaturedProducts() {
  const router = useRouter()

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`)
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
            <SmoothProductCarousel 
              autoPlay={true} 
              interval={4000}
              slidesToShow={4}
              slidesToScroll={1}
              gap={24}
              responsive={[
                { breakpoint: 1280, settings: { slidesToShow: 3 } },
                { breakpoint: 768, settings: { slidesToShow: 2 } },
                { breakpoint: 640, settings: { slidesToShow: 1 } }
              ]}
            >
              {FEATURED_PRODUCTS.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </SmoothProductCarousel>
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
}

function ProductCard({ product, index, onClick }) {
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
      case 'Featured':
        return 'bg-brand-primary text-brand-primary-text'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

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
            src={product.image}
            alt={product.title}
            width={400}
            height={300}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
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
          {product.badge && (
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getBadgeColor(product.badge)}`}>
                {product.badge}
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
              {product.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-white font-medium">{product.rating}</span>
              <span className="text-sm text-gray-500">({product.reviews})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors font-title">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1 font-body">
            {product.description}
          </p>

          {/* Bottom Section */}
          <div className="space-y-3">
            {/* Seller */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">by</span>
              <span className="text-sm text-gray-300">{product.seller.name}</span>
              {product.seller.verified && (
                <CheckCircle className="w-4 h-4 text-brand-primary" />
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
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
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  requireAuth(() => {
                    if (addToCart(product)) {
                      toast.cart.addedToCart(product.title)
                    }
                  }, `/products/${product.id}`)
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
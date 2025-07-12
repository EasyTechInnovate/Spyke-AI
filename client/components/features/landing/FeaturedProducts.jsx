'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Eye, ShoppingCart, Zap, Brain, Target, Lightbulb } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { useRouter } from 'next/navigation'

// Dummy product data
const FEATURED_PRODUCTS = [
  {
    id: 1,
    title: "Ultimate ChatGPT Prompt Collection",
    description: "200+ proven prompts for content creation, marketing, and business growth",
    price: 29.99,
    originalPrice: 49.99,
    rating: 4.9,
    reviews: 156,
    sales: 1240,
    category: "Marketing",
    tags: ["ChatGPT", "Content", "Marketing"],
    image: "/api/placeholder/300/200",
    seller: {
      name: "Alex Johnson",
      avatar: "/api/placeholder/40/40",
      verified: true
    },
    badge: "Bestseller",
    icon: Brain
  },
  {
    id: 2,
    title: "AI Email Marketing Automation",
    description: "Complete email sequences and templates that convert at 40%+ rates",
    price: 39.99,
    originalPrice: 69.99,
    rating: 4.8,
    reviews: 89,
    sales: 856,
    category: "Automation",
    tags: ["Email", "Automation", "Sales"],
    image: "/api/placeholder/300/200",
    seller: {
      name: "Sarah Chen",
      avatar: "/api/placeholder/40/40",
      verified: true
    },
    badge: "Hot",
    icon: Zap
  },
  {
    id: 3,
    title: "Social Media Content Scripts",
    description: "30-day content calendar with viral-ready scripts for all platforms",
    price: 19.99,
    originalPrice: 34.99,
    rating: 4.7,
    reviews: 203,
    sales: 2100,
    category: "Content",
    tags: ["Social Media", "Scripts", "Content"],
    image: "/api/placeholder/300/200",
    seller: {
      name: "Mike Rodriguez",
      avatar: "/api/placeholder/40/40",
      verified: false
    },
    badge: "New",
    icon: Target
  },
  {
    id: 4,
    title: "AI Business Plan Generator",
    description: "Step-by-step prompts to create professional business plans in minutes",
    price: 24.99,
    originalPrice: 39.99,
    rating: 4.9,
    reviews: 67,
    sales: 445,
    category: "Business",
    tags: ["Business", "Planning", "AI"],
    image: "/api/placeholder/300/200",
    seller: {
      name: "Emma Taylor",
      avatar: "/api/placeholder/40/40",
      verified: true
    },
    badge: "Featured",
    icon: Lightbulb
  }
]

export default function FeaturedProducts() {
  const router = useRouter()

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`)
  }

  const handleViewAll = () => {
    router.push('/explore')
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-primary/5 via-transparent to-transparent" />
      
      <Container className="relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-4">
              <Star className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-brand-primary">Featured Products</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Trending AI Tools & Prompts
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Discover the most popular and highest-rated products from our top creators
            </p>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
            {FEATURED_PRODUCTS.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <button
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-brand-primary/50 transition-all duration-300 group"
            >
              View All Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

function ProductCard({ product, index, onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = product.icon

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-yellow-500 text-black'
      case 'Hot':
        return 'bg-red-500 text-white'
      case 'New':
        return 'bg-green-500 text-white'
      case 'Featured':
        return 'bg-brand-primary text-black'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/10">
        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {/* Placeholder for product image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-16 h-16 text-brand-primary/50" />
          </div>
          
          {/* Overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="flex items-center gap-2 text-white">
              <Eye className="w-5 h-5" />
              <span className="font-medium">View Details</span>
            </div>
          </motion.div>

          {/* Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${getBadgeColor(product.badge)}`}>
              {product.badge}
            </span>
          </div>

          {/* Discount */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-lg">
                -{discountPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Category */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-lg">
              {product.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-400">{product.rating}</span>
              <span className="text-xs text-gray-500">({product.reviews})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Price & Seller */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-brand-primary">
                ${product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <ShoppingCart className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">{product.sales}</span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
            <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-black">
                {product.seller.name.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-400">{product.seller.name}</span>
            {product.seller.verified && (
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
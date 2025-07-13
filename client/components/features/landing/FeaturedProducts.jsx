'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Eye, ShoppingCart, CheckCircle } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
    sales: 1240,
    category: "Prompts",
    tags: ["ChatGPT", "Content", "Marketing"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    seller: {
      name: "Alex Johnson",
      avatar: "/api/placeholder/40/40",
      verified: true
    },
    badge: "Bestseller"
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
    category: "Tools",
    tags: ["Email", "Automation", "Sales"],
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=300&fit=crop",
    seller: {
      name: "Sarah Chen",
      avatar: "/api/placeholder/40/40",
      verified: true
    },
    badge: "Hot"
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
    category: "Templates",
    tags: ["Social Media", "Scripts", "Content"],
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
    seller: {
      name: "Mike Rodriguez",
      avatar: "/api/placeholder/40/40",
      verified: false
    },
    badge: "New"
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
    category: "Prompts",
    tags: ["Business", "Planning", "AI"],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
    seller: {
      name: "Emma Taylor",
      avatar: "/api/placeholder/40/40",
      verified: true
    },
    badge: "Featured"
  }
]

export default function FeaturedProducts() {
  const router = useRouter()

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`)
  }

  return (
    <section className="py-20 lg:py-24 bg-black relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent" />
      
      <Container className="relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-kumbh-sans">
              Featured Products
            </h2>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-inter">
              Discover the most popular AI tools and prompts from our community
            </p>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 group font-kumbh-sans"
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

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-yellow-500 text-black'
      case 'Hot':
        return 'bg-red-500 text-white'
      case 'New':
        return 'bg-[#00FF89] text-black'
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
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group cursor-pointer"
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
              <span className="font-medium font-inter">Quick View</span>
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
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors font-kumbh-sans">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1 font-inter">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-brand-primary font-kumbh-sans">
              ${product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">
                  {product.seller.name.charAt(0)}
                </span>
              </div>
              <span className="text-xs text-gray-400">{product.seller.name}</span>
              {product.seller.verified && (
                <CheckCircle className="w-3 h-3 text-brand-primary" />
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <ShoppingCart className="w-3 h-3" />
              <span className="text-xs">{product.sales.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
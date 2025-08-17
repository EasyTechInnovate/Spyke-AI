'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, Star, ShoppingCart, Heart, Share2, Shield,
  CheckCircle, Zap, Sparkles, Trophy, Home, ChevronRight,
  MessageSquare, Cpu,
  Rocket, Info, Download, Lock, RefreshCw,
  Package, Verified, ThumbsUp, Eye,
  FileText, Video, BookOpen, HelpCircle,
  AlertCircle, Target, Tag, ChevronDown, Copy
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import QuickReview from '@/components/product/QuickReview'
import ReviewsList from '@/components/product/ReviewsList'
import SellerProfileModal from '@/components/shared/SellerProfileModal'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import productsAPI from '@/lib/api/products'
import { promocodeAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { cn } from '@/lib/utils'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
}

// Product type badges with enhanced styling
const productTypeBadges = {
  prompt: { 
    label: 'AI Prompt', 
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Sparkles
  },
  automation: { 
    label: 'Automation', 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Cpu
  },
  agent: { 
    label: 'AI Agent', 
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    icon: Rocket
  },
  bundle: { 
    label: 'Bundle', 
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    icon: Package
  }
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productSlug = params.productId
  const { isAuthenticated, requireAuth } = useAuth()
  const { addToCart, isInCart, loading: cartLoading } = useCart()
  
  // State
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [liked, setLiked] = useState(false)
  const [upvoted, setUpvoted] = useState(false)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCopied, setShowCopied] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [mounted, setMounted] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [showSellerModal, setShowSellerModal] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [viewCount, setViewCount] = useState(0)
  const [availablePromocodes, setAvailablePromocodes] = useState([])
  const [showPromocodes, setShowPromocodes] = useState(false)
  
  // Refs
  const heroRef = useRef(null)
  const ctaRef = useRef(null)
  
  // Handle hydration
  useEffect(() => {
    setMounted(true)
    // Simulate live view count
    const interval = setInterval(() => {
      setViewCount(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])
  
  // Preload images
  useEffect(() => {
    if (product?.images?.[0]) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = product.images[0]
      document.head.appendChild(link)
    }
  }, [product])
  
  // Handle scroll for sticky bar - improved threshold
  useEffect(() => {
    if (!mounted || !ctaRef.current) return
    
    const handleScroll = () => {
      const ctaRect = ctaRef.current?.getBoundingClientRect()
      setShowStickyBar(ctaRect && ctaRect.bottom < 0)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching product with slug:', productSlug)
        const response = await productsAPI.getProductBySlug(productSlug)
        console.log('API Response:', response)
        
        if (response && response.data) {
          setProduct(response.data)
          setViewCount(response.data.views || 0)
          
          // Fetch related products
          if (response.data._id) {
            try {
              const relatedResponse = await productsAPI.getRelatedProducts(response.data._id, 4)
              if (relatedResponse && relatedResponse.data) {
                setRelatedProducts(relatedResponse.data)
              }
            } catch (relatedError) {
              console.warn('Failed to fetch related products:', relatedError)
              // Don't fail the whole page if related products fail
            }
          }
          
          // Fetch available promocodes
          try {
            const promoResponse = await promocodeAPI.getPublicPromocodes({ 
              status: 'active',
              limit: 5 
            })
            if (promoResponse?.promocodes) {
              // Filter promocodes that apply to this product
              const applicablePromos = promoResponse.promocodes.filter(promo => {
                // Check if promocode applies to all products
                if (!promo.applicableProducts || promo.applicableProducts.length === 0) {
                  return true
                }
                // Check if this product is in the applicable list
                return promo.applicableProducts.includes(response.data._id)
              })
              setAvailablePromocodes(applicablePromos)
            }
          } catch (promoError) {
            console.warn('Failed to fetch promocodes:', promoError)
            // Don't fail the whole page if promocodes fail
          }
        } else {
          console.error('No product data in response:', response)
          setError('Product not found')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        // Handle different types of errors
        if (err.status === 404) {
          setError('Product not found')
        } else if (err.networkError) {
          setError('Network error. Please check your connection.')
        } else {
          setError(err.message || 'Failed to load product')
        }
      } finally {
        setLoading(false)
      }
    }

    if (productSlug) {
      fetchProduct()
    }
  }, [productSlug])
  
  // Handlers
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleAddToCart = useCallback(async () => {
    // Allow both authenticated and guest users to add to cart
    if (product) {
      const alreadyInCart = mounted && !cartLoading && isInCart && 
        (isInCart(product._id) || isInCart(product.id))
      
      if (alreadyInCart) {
        toast.info('Product is already in cart')
        return
      }
      
      const cartProduct = {
        id: product._id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        thumbnail: product.thumbnail,
        seller: product.sellerId,
        type: product.type,
        category: product.category,
        description: product.shortDescription || product.description,
        image: product.images?.[0]?.url || product.thumbnail
      }
      
      const success = await addToCart(cartProduct)
      if (success) {
        toast.success('Added to cart')
      }
    }
  }, [product, addToCart, mounted, cartLoading, isInCart])

  const handleBuyNow = useCallback(async () => {
    // Allow both authenticated and guest users to buy now
    if (product) {
      const alreadyInCart = mounted && !cartLoading && isInCart && 
        (isInCart(product._id) || isInCart(product.id))
      
      if (!alreadyInCart) {
        const cartProduct = {
          id: product._id,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          thumbnail: product.thumbnail,
          seller: product.sellerId,
          type: product.type,
          category: product.category,
          description: product.shortDescription || product.description,
          image: product.images?.[0]?.url || product.thumbnail
        }
        
        const success = await addToCart(cartProduct)
        if (!success) {
          // If adding to cart failed, don't navigate
          return
        }
      }
      
      // Navigate to checkout after adding to cart
      router.push('/checkout')
    }
  }, [product, addToCart, router, mounted, cartLoading, isInCart])

  const handleShare = useCallback(async () => {
    if (!mounted) return
    
    const url = typeof window !== 'undefined' ? window.location.href : ''
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.shortDescription,
          url
        })
      } catch (err) {
        // Share cancelled
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
      toast.success('Link copied to clipboard!')
    }
  }, [mounted, product])

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }
    
    try {
      setLiked(!liked)
      await productsAPI.toggleFavorite(product._id, !liked)
    } catch (error) {
      setLiked(liked)
      toast.error('Failed to update favorite')
    }
  }, [isAuthenticated, liked, product, requireAuth])
  
  const handleReviewSubmit = useCallback(async (reviewData) => {
    try {
      await productsAPI.addReview(product._id, reviewData)
      // Instead of refetching entire product, just update the reviews count locally
      setProduct(prevProduct => ({
        ...prevProduct,
        totalReviews: (prevProduct.totalReviews || 0) + 1,
        averageRating: prevProduct.averageRating // Keep existing rating for now
      }))
      toast.success('Review submitted successfully!')
    } catch (error) {
      // Failed to submit review
      throw error
    }
  }, [product?._id])

  const handleUpvote = useCallback(async () => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }

    if (!product || isUpvoting) return

    setIsUpvoting(true)
    const newUpvoted = !upvoted

    try {
      setUpvoted(newUpvoted)
      await productsAPI.toggleUpvote(product._id, newUpvoted)
      
      // Instead of refetching entire product, just update upvotes locally
      setProduct(prevProduct => ({
        ...prevProduct,
        upvotes: newUpvoted 
          ? (prevProduct.upvotes || 0) + 1 
          : Math.max(0, (prevProduct.upvotes || 0) - 1)
      }))
      
      toast.success(newUpvoted ? 'Upvoted!' : 'Removed upvote')
    } catch (error) {
      // Failed to toggle upvote
      setUpvoted(!newUpvoted)
      toast.error('Failed to update upvote')
    } finally {
      setIsUpvoting(false)
    }
  }, [isAuthenticated, upvoted, product, requireAuth, isUpvoting])

  // Computed values
  const discountPercentage = useMemo(() => {
    if (!product || product.originalPrice <= product.price) return 0
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }, [product])
  
  const inCart = useMemo(() => {
    if (!mounted || !product || !isInCart || cartLoading) return false
    
    try {
      return isInCart(product._id) || isInCart(product.id)
    } catch (error) {
      // Error checking cart status
      return false
    }
  }, [mounted, product, isInCart, cartLoading])

  const savingsAmount = useMemo(() => {
    if (!product || !product.originalPrice) return 0
    return product.originalPrice - product.price
  }, [product])

  // Loading state with better skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <Container>
          <div className="pt-20 pb-4 border-b border-gray-900">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-800 rounded w-64" />
            </div>
          </div>
          <div className="py-8 lg:py-12">
            <div className="animate-pulse grid lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-800 rounded-2xl" />
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-800 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="h-8 bg-gray-800 rounded w-32" />
                  <div className="h-10 bg-gray-800 rounded w-3/4" />
                  <div className="h-6 bg-gray-800 rounded w-full" />
                </div>
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 space-y-4">
                  <div className="h-12 bg-gray-800 rounded w-40" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-4 bg-gray-800 rounded" />
                    <div className="h-4 bg-gray-800 rounded" />
                    <div className="h-4 bg-gray-800 rounded" />
                    <div className="h-4 bg-gray-800 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-11 bg-gray-800 rounded-lg" />
                    <div className="h-11 bg-gray-800 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <Container>
          <div className="pt-24 pb-16 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{error || 'Product not found'}</h1>
            <p className="text-gray-400 mb-8">The product you're looking for doesn't exist.</p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-primary-text rounded-xl font-semibold hover:bg-brand-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        <Header />
      
        <main className="relative">
          {/* Breadcrumb Navigation */}
          <section className="pt-20 pb-4 border-b border-gray-900">
            <Container>
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-sm">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      Home
                    </Link>
                  </li>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  <li>
                    <Link href="/explore" className="text-gray-400 hover:text-white transition-colors">
                      Products
                    </Link>
                  </li>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  <li>
                    <Link 
                      href={`/explore?category=${product.category}`} 
                      className="text-gray-400 hover:text-white transition-colors capitalize"
                    >
                      {product.category?.replace('_', ' ')}
                    </Link>
                  </li>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  <li>
                    <span className="text-white font-medium truncate max-w-[200px]" aria-current="page">
                      {product.title}
                    </span>
                  </li>
                </ol>
              </nav>
            </Container>
          </section>

          {/* Hero Section - Optimized Layout */}
          <section ref={heroRef} className="relative py-8 lg:py-12">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl" />
            </div>
            
            <Container className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Product Gallery - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Main Image with Enhanced UI */}
                  <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden group">
                    <OptimizedImage
                      src={product.images?.[selectedImage] || product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                      quality={85}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      {/* Product Type */}
                      {product.type && productTypeBadges[product.type] && (
                        <motion.div
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-md flex items-center gap-2",
                            productTypeBadges[product.type].color
                          )}
                        >
                          {React.createElement(productTypeBadges[product.type].icon, { className: "w-4 h-4" })}
                          {productTypeBadges[product.type].label}
                        </motion.div>
                      )}
                      
                      {/* Discount Badge */}
                      {discountPercentage > 0 && (
                        <motion.div
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
                        >
                          Save {discountPercentage}%
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      {product.previewVideo && (
                        <button
                          onClick={() => window.open(product.previewVideo, '_blank')}
                          className="p-2.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all"
                          aria-label="Watch preview video"
                        >
                          <Video className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Gallery - Enhanced */}
                  {product.images && product.images.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                            selectedImage === index 
                              ? "border-brand-primary ring-2 ring-brand-primary/20" 
                              : "border-gray-800 hover:border-gray-600"
                          )}
                        >
                          <Image
                            src={image}
                            alt={`${product.title} ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            quality={75}
                          />
                          {selectedImage === index && (
                            <div className="absolute inset-0 bg-brand-primary/10" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Product Info - Optimized for Conversion */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Title & Category */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium border border-brand-primary/20">
                        {product.category?.replace('_', ' ').charAt(0).toUpperCase() + product.category?.slice(1).replace('_', ' ')}
                      </span>
                      {product.isNew && (
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium border border-blue-500/20">
                          New
                        </span>
                      )}
                      {product.isBestseller && (
                        <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm font-medium border border-orange-500/20">
                          Bestseller
                        </span>
                      )}
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-title">
                      {product.title}
                    </h1>
                    
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </div>

                  {/* Price Section - Above the Fold */}
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-bold text-white">
                            ${product.price}
                          </span>
                          {product.originalPrice > product.price && (
                            <>
                              <span className="text-xl text-gray-500 line-through">
                                ${product.originalPrice}
                              </span>
                              <span className="text-green-400 font-medium">
                                Save ${savingsAmount}
                              </span>
                            </>
                          )}
                        </div>
                        {product.priceNote && (
                          <p className="text-sm text-gray-400 mt-1">{product.priceNote}</p>
                        )}
                      </div>
                      
                      {/* Urgency Indicators */}
                      <div className="text-right">
                        {product.stock && product.stock < 10 && (
                          <p className="text-orange-400 text-sm font-medium flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Only {product.stock} left
                          </p>
                        )}
                        {viewCount > 50 && (
                          <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                            <Eye className="w-4 h-4" />
                            {Math.floor(viewCount / 10)} viewing now
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Shield className="w-4 h-4 text-green-400" />
                        30-day money back
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Zap className="w-4 h-4 text-brand-primary" />
                        Instant delivery
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <RefreshCw className="w-4 h-4 text-blue-400" />
                        Lifetime updates
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Lock className="w-4 h-4 text-purple-400" />
                        Secure checkout
                      </div>
                    </div>
                    
                    {/* Available Promocodes */}
                    {availablePromocodes.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => setShowPromocodes(!showPromocodes)}
                          className="w-full flex items-center justify-between p-3 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/20 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#00FF89]" />
                            <span className="text-sm font-medium text-[#00FF89]">
                              {availablePromocodes.length} promo code{availablePromocodes.length > 1 ? 's' : ''} available
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-[#00FF89] transition-transform ${showPromocodes ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {showPromocodes && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 space-y-2">
                                {availablePromocodes.map((promo) => (
                                  <div
                                    key={promo._id}
                                    className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-bold text-white">{promo.code}</span>
                                          <span className="text-xs text-[#00FF89]">
                                            {promo.discountType === 'percentage' 
                                              ? `${promo.discountValue}% OFF`
                                              : `$${promo.discountValue} OFF`
                                            }
                                          </span>
                                        </div>
                                        {promo.description && (
                                          <p className="text-xs text-gray-400 mt-1">{promo.description}</p>
                                        )}
                                        {promo.minimumOrderAmount && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Min. order: ${promo.minimumOrderAmount}
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(promo.code)
                                          toast.success(`Code "${promo.code}" copied!`)
                                        }}
                                        className="p-2 hover:bg-gray-800 rounded transition-colors"
                                      >
                                        <Copy className="w-4 h-4 text-gray-400" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div ref={ctaRef} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleBuyNow}
                          className="py-2.5 px-5 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-text font-semibold rounded-lg transition-all shadow-sm hover:shadow-md text-sm flex items-center justify-center gap-2"
                          aria-label={`Buy ${product.title} now for $${product.price}`}
                        >
                          <Zap className="w-4 h-4" />
                          Buy Now
                        </button>
                        <button
                          onClick={handleAddToCart}
                          disabled={inCart}
                          className={cn(
                            "py-2.5 px-4 font-medium rounded-lg transition-all border flex items-center justify-center gap-2 text-sm",
                            inCart
                              ? "bg-gray-800/50 text-gray-400 cursor-not-allowed border-gray-700"
                              : "bg-transparent hover:bg-gray-800/50 text-white border-gray-700 hover:border-gray-600"
                          )}
                        >
                          {inCart ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              In Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="flex gap-2">
                          <button
                            onClick={handleUpvote}
                            disabled={isUpvoting}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all border text-sm",
                              upvoted
                                ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                                : "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-brand-primary hover:border-gray-600",
                              isUpvoting && "opacity-50 cursor-not-allowed"
                            )}
                            title="Upvote this product"
                          >
                            <ThumbsUp className={cn("w-4 h-4", upvoted && "fill-current")} />
                            {product.upvotes > 0 && <span className="font-medium">{product.upvotes}</span>}
                          </button>

                          <button
                            onClick={handleLike}
                            className={cn(
                              "p-2 rounded-lg transition-all border",
                              liked
                                ? "bg-red-500/10 border-red-500/20 text-red-500"
                                : "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-red-500 hover:border-gray-600"
                            )}
                            title="Save to favorites"
                          >
                            <Heart className={cn("w-4 h-4", liked && "fill-current")} />
                          </button>
                          
                          <button
                            onClick={handleShare}
                            className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white relative"
                            title="Share this product"
                          >
                            <Share2 className="w-4 h-4" />
                            {showCopied && (
                              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-800 text-xs rounded-lg whitespace-nowrap shadow-lg">
                                Link copied!
                              </span>
                            )}
                          </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold text-white">{product.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <p className="text-xs text-gray-400">{product.totalReviews || 0} reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-white mb-1">{product.sales || 0}</div>
                      <p className="text-xs text-gray-400">Sales</p>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-white mb-1">{product.views || 0}</div>
                      <p className="text-xs text-gray-400">Views</p>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-white mb-1">24/7</div>
                      <p className="text-xs text-gray-400">Support</p>
                    </div>
                  </div>

                  {/* Seller Info Card */}
                  <div
                    className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                            <span className="font-bold text-lg text-brand-primary-text">
                              {product.sellerId?.fullName?.charAt(0) || 'S'}
                            </span>
                          </div>
                          {product.sellerId?.verification?.status === 'approved' && (
                            <Verified className="w-4 h-4 text-blue-400 absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {product.sellerId?.fullName || 'Anonymous Seller'}
                            {product.sellerId?.badge && (
                              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-xs font-medium">
                                {product.sellerId.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              {product.sellerId?.totalSales || 0}+ sales
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              {product.sellerId?.averageRating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSellerModal(true)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Container>
          </section>

          {/* Product Details - Tabbed Content */}
          <section className="py-12 border-t border-gray-900">
            <Container>
              {/* Tab Navigation - Horizontal Scrollable */}
              <div className="mb-8">
                <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {[
                    { id: 'overview', label: 'Overview', icon: Info },
                    { id: 'features', label: 'Features', icon: Sparkles },
                    { id: 'howitworks', label: 'How It Works', icon: Cpu },
                    { id: 'reviews', label: 'Reviews', icon: MessageSquare, count: product.totalReviews },
                    { id: 'faq', label: 'FAQ', icon: HelpCircle }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2",
                        activeTab === tab.id
                          ? "bg-brand-primary text-brand-primary-text shadow-lg shadow-brand-primary/20"
                          : "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Description */}
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-brand-primary" />
                          About This Product
                        </h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {product.fullDescription || product.shortDescription}
                        </p>
                      </div>

                      {/* Key Benefits */}
                      {product.benefits && product.benefits.length > 0 && (
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-brand-primary" />
                            Key Benefits
                          </h3>
                          <ul className="space-y-3">
                            {product.benefits.slice(0, 5).map((benefit, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-300">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* What's Included */}
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-brand-primary" />
                          What's Included
                        </h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-gray-300">
                            <Download className="w-4 h-4 text-gray-500" />
                            Instant digital download
                          </li>
                          <li className="flex items-center gap-2 text-gray-300">
                            <FileText className="w-4 h-4 text-gray-500" />
                            Documentation & guides
                          </li>
                          <li className="flex items-center gap-2 text-gray-300">
                            <RefreshCw className="w-4 h-4 text-gray-500" />
                            Free lifetime updates
                          </li>
                          <li className="flex items-center gap-2 text-gray-300">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            24/7 customer support
                          </li>
                        </ul>
                      </div>

                      {/* Product Details */}
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-brand-primary" />
                          Product Details
                        </h3>
                        <dl className="space-y-3">
                          <div className="flex justify-between">
                            <dt className="text-gray-400">Category</dt>
                            <dd className="text-gray-300 capitalize">{product.category?.replace('_', ' ')}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-400">Type</dt>
                            <dd className="text-gray-300 capitalize">{product.type}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-400">Version</dt>
                            <dd className="text-gray-300">{product.currentVersion || '1.0.0'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-400">Last Updated</dt>
                            <dd className="text-gray-300">
                              {new Date(product.updatedAt).toLocaleDateString()}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-400">File Size</dt>
                            <dd className="text-gray-300">{product.fileSize || '< 10MB'}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Related Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <Link
                              key={index}
                              href={`/explore?tag=${encodeURIComponent(tag)}`}
                              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'features' && (
                  <motion.div
                    key="features"
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {product.features?.map((feature, index) => (
                      <motion.div
                        key={index}
                        variants={scaleIn}
                        className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-brand-primary/50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-primary/20 transition-colors">
                          <Sparkles className="w-6 h-6 text-brand-primary" />
                        </div>
                        <h4 className="font-semibold text-white mb-2">
                          {typeof feature === 'string' ? feature : feature.title}
                        </h4>
                        {typeof feature !== 'string' && feature.description && (
                          <p className="text-gray-400 text-sm">{feature.description}</p>
                        )}
                      </motion.div>
                    )) || (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">No features listed yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'howitworks' && (
                  <motion.div
                    key="howitworks"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="max-w-3xl"
                  >
                    {product.howItWorks && product.howItWorks.length > 0 ? (
                      <div className="relative">
                        {/* Timeline */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-primary via-brand-primary/50 to-transparent" />
                        
                        <div className="space-y-6">
                          {product.howItWorks.map((step, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative flex gap-4"
                            >
                              {/* Step Number */}
                              <div className="relative z-10">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-brand-primary-text font-bold shadow-lg">
                                  {index + 1}
                                </div>
                              </div>
                              
                              {/* Step Content */}
                              <div className="flex-1 bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800">
                                <h4 className="font-semibold text-white mb-2">Step {index + 1}</h4>
                                <p className="text-gray-300">{step}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No process information available yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {/* Quick Review for authenticated users */}
                    {isAuthenticated && (
                      <QuickReview
                        productId={product._id}
                        onReviewSubmit={handleReviewSubmit}
                        className="mb-8"
                      />
                    )}

                    {/* Reviews List */}
                    <ReviewsList
                      reviews={product.reviews || []}
                      totalReviews={product.totalReviews || 0}
                      averageRating={product.averageRating || 0}
                      reviewStats={product.reviewStats || {}}
                    />
                  </motion.div>
                )}

                {activeTab === 'faq' && (
                  <motion.div
                    key="faq"
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="max-w-3xl space-y-4"
                  >
                    {product.faqs && product.faqs.length > 0 ? (
                      product.faqs.map((faq, index) => (
                        <motion.div
                          key={index}
                          variants={fadeInUp}
                          className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                            className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <HelpCircle className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                              <h4 className="font-semibold text-white">{faq.question}</h4>
                            </div>
                            <ChevronRight 
                              className={cn(
                                "w-5 h-5 text-gray-400 transition-transform",
                                expandedFaq === index && "rotate-90"
                              )} 
                            />
                          </button>
                          <AnimatePresence>
                            {expandedFaq === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-6 pb-6"
                              >
                                <p className="text-gray-400 pl-8">{faq.answer}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No FAQs available yet.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Container>
          </section>

          {/* Related Products - Enhanced */}
          {relatedProducts.length > 0 && (
            <section className="py-16 border-t border-gray-900 bg-gray-950/50">
              <Container>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">You Might Also Like</h2>
                  <Link 
                    href={`/explore?category=${product.category}`}
                    className="text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1"
                  >
                    View More
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map(relatedProduct => (
                    <motion.div
                      key={relatedProduct._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                      className="group cursor-pointer"
                      onClick={() => router.push(`/products/${relatedProduct.slug}`)}
                    >
                      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-brand-primary/50 transition-all h-full flex flex-col">
                        <div className="aspect-video relative overflow-hidden bg-gray-800">
                          <OptimizedImage
                            src={relatedProduct.thumbnail}
                            alt={relatedProduct.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            quality={75}
                            loading="lazy"
                          />
                          {relatedProduct.discountPercentage > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                              -{relatedProduct.discountPercentage}%
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                            {relatedProduct.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-1">
                            {relatedProduct.shortDescription}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-brand-primary">
                                ${relatedProduct.price}
                              </span>
                              {relatedProduct.originalPrice > relatedProduct.price && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ${relatedProduct.originalPrice}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-400">
                                {relatedProduct.averageRating?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Container>
            </section>
          )}

          {/* Sticky Purchase Bar - Enhanced */}
          <AnimatePresence>
            {mounted && showStickyBar && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-40 shadow-2xl"
              >
                <Container>
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-800 hidden sm:block">
                        <OptimizedImage
                          src={product.thumbnail}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                          quality={75}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white line-clamp-1">{product.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-brand-primary">${product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                          {product.averageRating > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-gray-400">{product.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleBuyNow}
                        className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-text font-semibold rounded-xl transition-all shadow-lg shadow-brand-primary/20"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={handleAddToCart}
                        disabled={inCart}
                        className={cn(
                          "p-3 rounded-xl transition-colors",
                          inCart
                            ? "bg-gray-800 text-gray-500"
                            : "bg-gray-800 hover:bg-gray-700 text-white"
                        )}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Container>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Seller Profile Modal */}
        <SellerProfileModal
          isOpen={showSellerModal}
          onClose={() => setShowSellerModal(false)}
          sellerId={product?.sellerId?._id}
          sellerName={product?.sellerId?.fullName}
        />
      </div>
    </ErrorBoundary>
  )
}
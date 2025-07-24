'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  ArrowLeft, Star, ShoppingCart, Heart, Share2, Shield, Clock, Users,
  CheckCircle, Zap, Sparkles, Trophy,
  MessageSquare, ChevronRight, Code, Layers, Cpu, Award,
  Rocket, Info, Download, Copy, ExternalLink, Lock, RefreshCw,
  BarChart3, DollarSign, Package, Verified, ThumbsUp, Eye,
  Calendar, FileText, Video, BookOpen, HelpCircle, Send
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import QuickReview from '@/components/product/QuickReview'
import ReviewsList from '@/components/product/ReviewsList'
import SellerProfileModal from '@/components/shared/SellerProfileModal'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import productsAPI from '@/lib/api/products'
import toast from '@/lib/utils/toast'
import { cn } from '@/lib/utils'

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


// Product type badges
const productTypeBadges = {
  prompt: { label: 'AI Prompt', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  automation: { label: 'Automation', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  agent: { label: 'AI Agent', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  bundle: { label: 'Bundle', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' }
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productSlug = params.productId
  const { isAuthenticated, requireAuth } = useAuth()
  const { addToCart, isInCart } = useCart()
  
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
  const [showQuickReview, setShowQuickReview] = useState(false)
  const [showSellerModal, setShowSellerModal] = useState(false)
  
  // Refs
  const heroRef = useRef(null)
  
  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Handle scroll for sticky bar
  useEffect(() => {
    if (!mounted) return
    
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 600)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])
  

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await productsAPI.getProductBySlug(productSlug)
        if (response.success && response.data) {
          setProduct(response.data)
          
          // Fetch related products
          if (response.data._id) {
            const relatedResponse = await productsAPI.getRelatedProducts(response.data._id, 4)
            if (relatedResponse.success && relatedResponse.data) {
              setRelatedProducts(relatedResponse.data)
            }
          }
        } else {
          setError('Product not found')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product')
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

  const handleAddToCart = useCallback(() => {
    requireAuth(() => {
      if (product) {
        const cartProduct = {
          id: product._id,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          thumbnail: product.thumbnail,
          seller: product.sellerId,
          type: product.type
        }
        
        if (addToCart(cartProduct)) {
          toast.cart.addedToCart(product.title)
        }
      }
    })
  }, [product, addToCart, requireAuth])

  const handleBuyNow = useCallback(() => {
    requireAuth(() => {
      handleAddToCart()
      setTimeout(() => {
        router.push('/checkout')
      }, 500)
    })
  }, [handleAddToCart, router, requireAuth])

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
        console.log('Share cancelled')
      }
    } else if (navigator.clipboard) {
      // Fallback to clipboard
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
      setLiked(liked) // Revert on error
      toast.error('Failed to update favorite')
    }
  }, [isAuthenticated, liked, product, requireAuth])
  
  const handleReviewSubmit = useCallback(async (reviewData) => {
    // API call to submit review
    try {
      await productsAPI.addReview(product._id, reviewData)
      // Refresh product data to show new review
      const response = await productsAPI.getProductBySlug(productSlug)
      if (response.success && response.data) {
        setProduct(response.data)
      }
      toast.success('Review submitted successfully!')
    } catch (error) {
      console.error('Failed to submit review:', error)
      // Pass the error up to the component
      throw error
    }
  }, [product?._id, productSlug])

  const handleUpvote = useCallback(async () => {
    if (!isAuthenticated) {
      requireAuth()
      return
    }

    if (!product || isUpvoting) return

    setIsUpvoting(true)
    const newUpvoted = !upvoted

    try {
      // Optimistic update
      setUpvoted(newUpvoted)
      
      // API call
      await productsAPI.toggleUpvote(product._id, newUpvoted)
      
      // Refresh product data to get updated counts
      const response = await productsAPI.getProductBySlug(productSlug)
      if (response.success && response.data) {
        setProduct(response.data)
      }
      
      toast.success(newUpvoted ? 'Upvoted!' : 'Removed upvote')
    } catch (error) {
      console.error('Failed to toggle upvote:', error)
      setUpvoted(!newUpvoted) // Revert on error
      toast.error('Failed to update upvote')
    } finally {
      setIsUpvoting(false)
    }
  }, [isAuthenticated, upvoted, product, productSlug, requireAuth, isUpvoting])


  // Computed values
  const discountPercentage = useMemo(() => {
    if (!product || product.originalPrice <= product.price) return 0
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }, [product])
  
  const inCart = mounted && product ? isInCart(product._id) : false

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <Container>
          <div className="pt-24 pb-16">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-800 rounded w-32" />
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="aspect-square bg-gray-800 rounded-2xl" />
                <div className="space-y-4">
                  <div className="h-12 bg-gray-800 rounded w-3/4" />
                  <div className="h-6 bg-gray-800 rounded w-full" />
                  <div className="h-6 bg-gray-800 rounded w-2/3" />
                  <div className="h-24 bg-gray-800 rounded" />
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
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="relative">
        {/* Hero Section with Product Info */}
        <section 
          ref={heroRef}
          className="relative pt-24 pb-12 overflow-hidden"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl" />
          </div>
          
          <Container className="relative z-10">
            {/* Breadcrumb */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to products
            </motion.button>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Product Images */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                {/* Main Image */}
                <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden group">
                  <Image
                    src={product.images?.[selectedImage] || product.thumbnail || '/placeholder.jpg'}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                  />
                  
                  {/* Product Type Badge */}
                  {product.type && productTypeBadges[product.type] && (
                    <div className="absolute top-4 left-4">
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-sm",
                        productTypeBadges[product.type].color
                      )}>
                        {productTypeBadges[product.type].label}
                      </div>
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1.5 bg-red-500 text-white rounded-full text-sm font-bold">
                        -{discountPercentage}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                          selectedImage === index 
                            ? "border-brand-primary scale-105" 
                            : "border-gray-800 hover:border-gray-700"
                        )}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Preview Video */}
                {product.previewVideo && (
                  <div className="mt-4">
                    <button
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-brand-primary/50 transition-colors flex items-center justify-center gap-2 text-gray-300 hover:text-white"
                      onClick={() => {
                        // Open video in modal or new tab
                        window.open(product.previewVideo, '_blank')
                      }}
                    >
                      <Video className="w-5 h-5" />
                      Watch Preview Video
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Title & Category */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium border border-brand-primary/20">
                      {product.category?.replace('_', ' ').charAt(0).toUpperCase() + product.category?.slice(1).replace('_', ' ')}
                    </div>
                    {product.isVerified && (
                      <div className="flex items-center gap-1 text-blue-400 text-sm">
                        <Verified className="w-4 h-4" />
                        Verified
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-4xl font-bold text-white mb-4 font-title">
                    {product.title}
                  </h1>
                  
                  <p className="text-xl text-gray-400 leading-relaxed">
                    {product.shortDescription}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 py-4 border-y border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-5 h-5",
                            i < Math.floor(product.averageRating || 0)
                              ? "text-yellow-500 fill-current"
                              : "text-gray-700"
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-white">{product.averageRating?.toFixed(1) || '0.0'}</span>
                    <button
                      onClick={() => {
                        setActiveTab('reviews')
                        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="text-gray-500 hover:text-brand-primary transition-colors"
                    >
                      ({product.totalReviews || 0} {product.totalReviews === 1 ? 'review' : 'reviews'})
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{product.sales || 0} sales</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>{product.views || 0} views</span>
                  </div>
                  
                  {product.upvotes > 0 && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{product.upvotes} upvotes</span>
                    </div>
                  )}
                  
                  {product.totalReviews > 0 && (
                    <button
                      onClick={() => {
                        setActiveTab('reviews')
                        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Read Reviews</span>
                    </button>
                  )}
                  
                  {product.isVerified && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                  
                  {product.isTested && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <Shield className="w-4 h-4" />
                      <span>Tested</span>
                    </div>
                  )}
                </div>


                {/* Price & Actions */}
                <div className="space-y-4">
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-bold text-white">
                      ${product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="text-2xl text-gray-500 line-through mb-1">
                          ${product.originalPrice}
                        </span>
                        <span className="text-green-400 font-medium mb-1">
                          Save ${(product.originalPrice - product.price).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {/* Primary Actions - Always visible */}
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={handleBuyNow}
                        className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-text font-semibold rounded-xl transition-all transform hover:scale-[1.02] text-sm sm:text-base"
                      >
                        Buy Now
                      </button>
                      
                      <button
                        onClick={handleAddToCart}
                        disabled={inCart}
                        className={cn(
                          "flex-1 py-3 sm:py-4 px-4 sm:px-6 font-semibold rounded-xl transition-all transform hover:scale-[1.02] text-sm sm:text-base",
                          inCart
                            ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 hover:bg-gray-800 text-white border border-gray-800"
                        )}
                      >
                        {inCart ? (
                          <>
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Secondary Actions - All visible on mobile */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleUpvote}
                        disabled={isUpvoting}
                        className={cn(
                          "flex-1 sm:flex-initial p-3 sm:p-4 rounded-xl transition-all border flex items-center justify-center gap-2",
                          upvoted
                            ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                            : "bg-gray-900 border-gray-800 text-gray-400 hover:text-brand-primary",
                          isUpvoting && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <ThumbsUp className={cn("w-4 h-4 sm:w-5 sm:h-5", upvoted && "fill-current")} />
                        {product.upvoteCount > 0 && (
                          <span className="text-xs sm:text-sm font-medium">{product.upvoteCount}</span>
                        )}
                      </button>

                      <button
                        onClick={handleLike}
                        className={cn(
                          "flex-1 sm:flex-initial p-3 sm:p-4 rounded-xl transition-all border",
                          liked
                            ? "bg-red-500/10 border-red-500/20 text-red-500"
                            : "bg-gray-900 border-gray-800 text-gray-400 hover:text-red-500"
                        )}
                      >
                        <Heart className={cn("w-4 h-4 sm:w-5 sm:h-5", liked && "fill-current")} />
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="flex-1 sm:flex-initial p-3 sm:p-4 bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors border border-gray-800 text-gray-400 hover:text-white relative"
                      >
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        {showCopied && (
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs rounded">
                            Copied!
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Shield className="w-4 h-4 text-green-400" />
                      30-day money back
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Zap className="w-4 h-4 text-brand-primary" />
                      Instant download
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                      Free updates
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Lock className="w-4 h-4 text-purple-400" />
                      Secure checkout
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center">
                        <span className="font-bold text-lg text-brand-primary-text">
                          {product.sellerId?.fullName?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {product.sellerId?.fullName || 'Anonymous Seller'}
                          </span>
                          {product.sellerId?.verification?.status === 'approved' && (
                            <Verified className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{product.sellerId?.totalProducts || 0} products</span>
                          <span>•</span>
                          <span>{product.sellerId?.totalSales || 0} sales</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSellerModal(true)}
                      className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium whitespace-nowrap"
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Product Details Tabs */}
        <section id="reviews-section" className="py-12 border-t border-gray-900">
          <Container>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Vertical Tab Navigation - Desktop */}
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-8 space-y-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: Layers },
                    { id: 'features', label: 'Features', icon: Sparkles },
                    { id: 'howitworks', label: 'How It Works', icon: Cpu },
                    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                    { id: 'faq', label: 'FAQ', icon: HelpCircle }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full px-4 py-3 font-medium transition-all relative flex items-center gap-3 rounded-xl",
                        activeTab === tab.id
                          ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                          : "text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                      )}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-r"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Tab Navigation */}
              <div className="lg:hidden w-full">
                <div className="flex overflow-x-auto gap-2 pb-2 mb-6 -mx-4 px-4">
                  {[
                    { id: 'overview', label: 'Overview', icon: Layers },
                    { id: 'features', label: 'Features', icon: Sparkles },
                    { id: 'howitworks', label: 'How It Works', icon: Cpu },
                    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                    { id: 'faq', label: 'FAQ', icon: HelpCircle }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 text-sm",
                        activeTab === tab.id
                          ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                          : "bg-gray-900 text-gray-500 border border-gray-800"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-8"
                >
                  {/* Main Content */}
                  <div className="space-y-8">
                    {/* Description */}
                    <div className="prose prose-invert max-w-none">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">About This Product</h2>
                      <p className="text-sm sm:text-base text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {product.fullDescription || product.shortDescription}
                      </p>
                    </div>

                    {/* Key Benefits */}
                    {product.benefits && product.benefits.length > 0 && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Key Benefits</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {product.benefits.map((benefit, index) => (
                            <motion.div
                              key={index}
                              variants={fadeInUp}
                              className="flex items-start gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800"
                            >
                              <CheckCircle className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300">{benefit}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Use Cases */}
                    {product.useCaseExamples && product.useCaseExamples.length > 0 && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Use Cases</h3>
                        <div className="space-y-3">
                          {product.useCaseExamples.map((useCase, index) => (
                            <motion.div
                              key={index}
                              variants={fadeInUp}
                              className="flex items-start gap-3"
                            >
                              <Rocket className="w-5 h-5 text-brand-secondary flex-shrink-0 mt-0.5" />
                              <span className="text-gray-400">{useCase}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expected Outcomes */}
                    {product.outcome && product.outcome.length > 0 && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Expected Outcomes</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {product.outcome.map((outcome, index) => (
                            <motion.div
                              key={index}
                              variants={fadeInUp}
                              className="flex items-start gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800"
                            >
                              <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300">{outcome}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Target Audience */}
                    {product.targetAudience && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Target Audience</h3>
                        <p className="text-gray-400 p-4 bg-gray-900 rounded-xl border border-gray-800">
                          {product.targetAudience}
                        </p>
                      </div>
                    )}

                    {/* Tools Used */}
                    {product.toolsUsed && product.toolsUsed.length > 0 && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Tools & Technologies</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {product.toolsUsed.map((tool, index) => (
                            <a
                              key={index}
                              href={tool.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-brand-primary/50 transition-colors"
                            >
                              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-brand-primary font-bold">
                                {tool.logo ? (
                                  <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                  tool.name[0]
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-white">{tool.name}</div>
                                <div className="text-sm text-gray-500">{tool.model}</div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Product Details */}
                      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-brand-primary" />
                          Product Details
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2 text-gray-400">
                            <Layers className="w-4 h-4" />
                            Type: <span className="text-gray-300 capitalize">{product.type}</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            Setup Time: <span className="text-gray-300">{product.setupTime?.replace('_', ' ')}</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-400">
                            <Code className="w-4 h-4" />
                            Version: <span className="text-gray-300">{product.currentVersion || '1.0.0'}</span>
                          </li>
                          {product.hasRefundPolicy && (
                            <li className="flex items-center gap-2 text-green-400">
                              <Shield className="w-4 h-4" />
                              Refund Policy Available
                            </li>
                          )}
                          {product.hasGuarantee && (
                            <li className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              Satisfaction Guarantee
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Requirements */}
                      {product.requirements && (
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-400" />
                            Requirements
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {product.requirements}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-white mb-4">Related Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => router.push(`/explore?tag=${encodeURIComponent(tag)}`)}
                              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                      variants={fadeInUp}
                      className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-brand-primary" />
                      </div>
                      <h4 className="font-semibold text-white mb-2">{feature.title || feature}</h4>
                      {feature.description && (
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
                  className="max-w-3xl mx-auto"
                >
                  {product.howItWorks && product.howItWorks.length > 0 ? (
                    <div className="space-y-6">
                      {product.howItWorks.map((step, index) => (
                        <motion.div
                          key={index}
                          variants={fadeInUp}
                          className="flex gap-6"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-brand-primary-text font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 pt-2">
                            <p className="text-gray-300">{step}</p>
                          </div>
                        </motion.div>
                      ))}
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
                  className="max-w-4xl mx-auto"
                >
                  {/* Reviews Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Customer Reviews</h3>
                  </div>

                  {/* Quick Review - Always visible for authenticated users */}
                  {isAuthenticated && !showQuickReview && (
                    <QuickReview
                      productId={product._id}
                      onReviewSubmit={handleReviewSubmit}
                      className="mb-6"
                    />
                  )}

                  {/* Reviews List Component */}
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
                  className="max-w-3xl mx-auto space-y-4"
                >
                  {product.faqs && product.faqs.length > 0 ? (
                    product.faqs.map((faq, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        className="p-6 bg-gray-900 rounded-xl border border-gray-800"
                      >
                        <h4 className="font-semibold text-white mb-3 flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                          {faq.question}
                        </h4>
                        <p className="text-gray-400 ml-8">{faq.answer}</p>
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
              </div>
            </div>
          </Container>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 border-t border-gray-900">
            <Container>
              <h2 className="text-2xl font-bold text-white mb-8">You Might Also Like</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(relatedProduct => (
                  <motion.div
                    key={relatedProduct._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer"
                    onClick={() => router.push(`/products/${relatedProduct.slug}`)}
                  >
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all h-full flex flex-col">
                      <div className="aspect-video relative overflow-hidden bg-gray-800">
                        <Image
                          src={relatedProduct.thumbnail || '/placeholder.jpg'}
                          alt={relatedProduct.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                          {relatedProduct.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-1">
                          {relatedProduct.shortDescription}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-brand-primary">
                            ${relatedProduct.price}
                          </span>
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

        {/* Sticky Purchase Bar */}
        <AnimatePresence>
          {mounted && showStickyBar && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-40"
            >
              <Container>
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-800 hidden sm:block">
                      <Image
                        src={product.thumbnail || '/placeholder.jpg'}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white line-clamp-1">{product.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-brand-primary">${product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBuyNow}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-text font-semibold rounded-lg transition-colors"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={inCart}
                      className={cn(
                        "p-2.5 rounded-lg transition-colors",
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
  )
}
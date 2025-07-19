'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Shield, 
  Clock,
  Users,
  CheckCircle,
  Zap,
  Brain,
  Lightbulb,
  Sparkles,
  Trophy,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Code,
  Layers,
  Cpu,
  Award,
  Target,
  Rocket,
  Info
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import productsAPI from '@/lib/api/products'

// Lazy load heavy components
const AuthButton = dynamic(() => import('@/components/shared/ui/AuthButton'), {
  loading: () => <div className="h-12 bg-[var(--bg-card-dark)] animate-pulse rounded-xl" />
})
const AuthStatus = dynamic(() => import('@/components/shared/ui/AuthStatus'))

// Animation variants for better performance
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

// Category icons mapping
const categoryIcons = {
  'lead_generation': Zap,
  'content_creation': Brain,
  'automation': Target,
  'business': Lightbulb
}

// Loading skeleton component
const ProductSkeleton = () => (
  <div className="min-h-screen bg-[var(--bg-dark)]">
    <Header />
    <Container>
      <div className="pt-24 pb-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--bg-card-dark)] rounded w-1/4" />
          <div className="h-12 bg-[var(--bg-card-dark)] rounded w-3/4" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-video bg-[var(--bg-card-dark)] rounded-xl" />
            <div className="space-y-4">
              <div className="h-6 bg-[var(--bg-card-dark)] rounded w-1/2" />
              <div className="h-4 bg-[var(--bg-card-dark)] rounded w-full" />
              <div className="h-4 bg-[var(--bg-card-dark)] rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  </div>
)

// Error component
const ProductError = ({ error, onBack }) => (
  <div className="min-h-screen bg-[var(--bg-dark)]">
    <Header />
    <Container>
      <div className="pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">{error || 'Product Not Found'}</h1>
        <p className="text-[var(--text-secondary-dark)] mb-8">The product you're looking for doesn't exist or couldn't be loaded.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-[var(--brand-primary-text)] rounded-lg font-semibold hover:bg-[var(--brand-primary)]/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    </Container>
  </div>
)

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productSlug = params.productId
  const { isAuthenticated, user } = useAuth()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [inCart, setInCart] = useState(false)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await productsAPI.getProductBySlug(productSlug)
        if (response.success && response.data) {
          setProduct(response.data)
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

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleAddToCart = useCallback(async () => {
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
      const success = addToCart(cartProduct)
      
      if (success) {
        setInCart(true)
        setTimeout(() => {
          router.push('/cart')
        }, 500)
      }
    }
  }, [product, addToCart, router])

  const handleSellerClick = useCallback(() => {
    if (product?.sellerId?._id) {
      router.push(`/profile/${product.sellerId._id}`)
    }
  }, [product, router])

  const handleTagClick = useCallback((tag) => {
    router.push(`/products?tag=${encodeURIComponent(tag)}`)
  }, [router])

  const handleShare = useCallback(() => {
    if (navigator.share && product) {
      navigator.share({
        title: product.title,
        text: product.shortDescription,
        url: window.location.href
      })
    }
  }, [product])

  // Memoized values
  const Icon = useMemo(() => categoryIcons[product?.category] || Brain, [product?.category])
  const discountPercentage = useMemo(() => {
    if (!product || product.originalPrice <= product.price) return 0
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }, [product])

  // Tab content component - not memoized to avoid stale closures
  const TabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-8"
          >
            {/* Key Benefits Grid */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <LayoutGroup>
                  {product.benefits.map((benefit, index) => (
                    <motion.div
                      layout
                      key={`benefit-${index}`}
                      variants={scaleIn}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.05 }}
                      className="p-6 bg-gradient-to-br from-[var(--bg-card-dark)] to-[var(--bg-dark)] rounded-2xl border border-[var(--bg-card-dark)]/80 hover:border-[var(--brand-primary)]/50 transition-colors"
                    >
                      <CheckCircle className="w-8 h-8 text-[var(--brand-primary)] mb-3" />
                      <p className="text-white font-medium">{benefit}</p>
                    </motion.div>
                  ))}
                </LayoutGroup>
              </div>
            )}

            {/* Outcomes Section */}
            {product.outcome && product.outcome.length > 0 && (
              <motion.div 
                variants={fadeInUp}
                className="bg-gradient-to-r from-brand-primary/10 to-purple-500/10 rounded-3xl p-8"
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-[var(--brand-primary)]" />
                  Expected Outcomes
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {product.outcome.map((outcome, index) => (
                    <div key={`outcome-${index}`} className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0 mt-1" />
                      <p className="text-[var(--text-secondary-dark)]">{outcome}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Use Cases */}
            {product.useCaseExamples && product.useCaseExamples.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Perfect For</h3>
                <div className="space-y-3">
                  {product.useCaseExamples.map((useCase, index) => (
                    <motion.div 
                      key={`usecase-${index}`}
                      variants={fadeInUp}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 bg-[var(--bg-card-dark)]/50 rounded-xl hover:bg-[var(--bg-card-dark)] transition-colors"
                    >
                      <Rocket className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
                      <p className="text-[var(--text-secondary-dark)]">{useCase}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )
      
      case 'how-it-works':
        return (
          <motion.div
            key="how-it-works"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {product.howItWorks && product.howItWorks.length > 0 ? (
              <div className="relative">
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-brand-primary to-purple-500" />
                <div className="space-y-8">
                  {product.howItWorks.map((step, index) => (
                    <motion.div
                      key={`step-${index}`}
                      variants={fadeInUp}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-6"
                    >
                      <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-black border-2 border-[var(--brand-primary)] rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-[var(--brand-primary)]">{index + 1}</span>
                      </div>
                      <div className="flex-grow p-6 bg-[var(--bg-card-dark)]/50 rounded-2xl border border-[var(--bg-card-dark)] hover:border-[var(--bg-card-dark)]/80 transition-colors">
                        <p className="text-lg text-white">{step}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-secondary-dark)]">No process information available.</p>
            )}
          </motion.div>
        )
      
      case 'tools':
        return (
          <motion.div
            key="tools"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {product.toolsUsed && product.toolsUsed.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.toolsUsed.map((tool, index) => (
                  <motion.div
                    key={`tool-${index}`}
                    variants={scaleIn}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-gradient-to-br from-[var(--bg-card-dark)] to-[var(--bg-dark)] rounded-2xl border border-[var(--bg-card-dark)]/80 hover:border-[var(--brand-primary)]/50 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      {tool.logo && !tool.logo.includes('placeholder') ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                          <Image
                            src={tool.logo}
                            alt={tool.name}
                            width={48}
                            height={48}
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : tool.logo ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                          <img
                            src={tool.logo}
                            alt={tool.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-[var(--brand-primary)]/20 rounded-lg flex items-center justify-center">
                          <Code className="w-6 h-6 text-[var(--brand-primary)]" />
                        </div>
                      )}
                      <div className="flex-grow">
                        <h4 className="font-semibold text-white mb-1">{tool.name}</h4>
                        {tool.model && <p className="text-sm text-[var(--text-secondary-dark)] mb-2">{tool.model}</p>}
                        {tool.link && (
                          <a 
                            href={tool.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1"
                          >
                            Learn more
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-secondary-dark)]">No tools information available.</p>
            )}
          </motion.div>
        )
      
      case 'faq':
        return (
          <motion.div
            key="faq"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {product.faqs && product.faqs.length > 0 ? (
              <div className="space-y-4">
                {product.faqs.map((faq, index) => (
                  <motion.div
                    key={`faq-${index}`}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-[var(--bg-card-dark)]/50 rounded-2xl border border-[var(--bg-card-dark)] hover:border-[var(--bg-card-dark)]/80 transition-colors"
                  >
                    <h4 className="font-semibold text-white mb-3 flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </h4>
                    <p className="text-[var(--text-secondary-dark)] ml-8">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-secondary-dark)]">No FAQs available.</p>
            )}
          </motion.div>
        )
      
      default:
        return null
    }
  }

  if (loading) return <ProductSkeleton />
  if (!product || error) return <ProductError error={error} onBack={handleBack} />

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/5 via-transparent to-[var(--brand-secondary)]/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--brand-primary)]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--brand-secondary)]/10 rounded-full blur-3xl pointer-events-none" />
          
          <Container>
            <div className="relative py-12">
              {/* Back Navigation */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-[var(--text-secondary-dark)] hover:text-white transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to products
              </motion.button>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Product Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Category & Badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-sm font-medium rounded-full capitalize">
                      {product.category?.replace('_', ' ')}
                    </span>
                    {product.isVerified && (
                      <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {product.isTested && (
                      <span className="px-4 py-1.5 bg-green-500/20 text-green-400 text-sm font-medium rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Tested
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                    {product.title}
                  </h1>

                  {/* Description */}
                  <p className="text-xl text-[var(--text-secondary-dark)] mb-8 leading-relaxed">
                    {product.shortDescription}
                  </p>

                  {/* Rating & Stats */}
                  <div className="flex flex-wrap items-center gap-6 mb-8">
                    {product.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < Math.floor(product.averageRating) ? 'text-[var(--brand-secondary)] fill-current' : 'text-[var(--text-secondary-dark)]/60'}`} 
                            />
                          ))}
                        </div>
                        <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
                        <span className="text-[var(--text-secondary-dark)]">({product.totalReviews} reviews)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[var(--text-secondary-dark)]">
                      <Users className="w-4 h-4" />
                      <span>{product.sales || 0} sales</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary-dark)]">
                      <Clock className="w-4 h-4" />
                      <span>{product.setupTime?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="bg-[var(--bg-card-dark)]/50 rounded-2xl p-6 border border-[var(--bg-card-dark)] mb-8">
                    <div className="flex items-end gap-4 mb-4">
                      <span className="text-5xl font-bold text-white">${product.price}</span>
                      {product.originalPrice > product.price && (
                        <>
                          <span className="text-2xl text-[var(--text-secondary-dark)]/70 line-through mb-1">${product.originalPrice}</span>
                          <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-lg mb-1">
                            SAVE {discountPercentage}%
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Purchase Actions */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Suspense fallback={<div className="h-12 bg-[var(--bg-card-dark)] animate-pulse rounded-xl" />}>
                        <AuthButton
                          onClick={handleAddToCart}
                          disabled={inCart}
                          icon={ShoppingCart}
                          className="w-full py-4 text-base"
                          loadingText="Adding to Cart..."
                          requiresAuth={true}
                        >
                          {inCart ? 'Added to Cart!' : 'Add to Cart'}
                        </AuthButton>
                      </Suspense>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setLiked(!liked)}
                          className={`flex-1 py-4 border rounded-xl transition-colors flex items-center justify-center ${
                            liked 
                              ? 'border-red-500 text-red-500 bg-red-500/10' 
                              : 'border-[var(--bg-card-dark)]/80 text-[var(--text-secondary-dark)] hover:border-[var(--bg-card-dark)]/60'
                          }`}
                          aria-label={liked ? 'Unlike' : 'Like'}
                        >
                          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button 
                          onClick={handleShare}
                          className="flex-1 py-4 border border-[var(--bg-card-dark)]/80 text-[var(--text-secondary-dark)] rounded-xl hover:border-[var(--bg-card-dark)]/60 transition-colors flex items-center justify-center"
                          aria-label="Share"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex flex-wrap gap-4">
                    {product.hasRefundPolicy && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary-dark)]">
                        <Shield className="w-4 h-4 text-green-400" />
                        30-day money back
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary-dark)]">
                      <Zap className="w-4 h-4 text-[var(--brand-primary)]" />
                      Instant access
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary-dark)]">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Free updates
                    </div>
                  </div>
                </motion.div>

                {/* Product Visual */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="relative"
                >
                  <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                    {/* Main Image */}
                    <div className="aspect-square relative">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[selectedImage] || product.thumbnail} 
                          alt={product.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          priority
                          quality={90}
                        />
                      ) : product.thumbnail ? (
                        <Image
                          src={product.thumbnail} 
                          alt={product.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          priority
                          quality={90}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-48 h-48 text-[var(--brand-primary)]/20" />
                        </div>
                      )}
                    </div>
                    
                    {/* AI Badge */}
                    <div className="absolute top-6 right-6 bg-[var(--bg-dark)]/90 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 border border-[var(--brand-primary)]/20">
                      <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
                      <span className="text-sm font-medium text-[var(--brand-primary)]">AI-Powered</span>
                    </div>
                  </div>

                  {/* Image Thumbnails */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-3 mt-4 justify-center">
                      {product.images.map((image, index) => (
                        <button
                          key={`thumb-${index}`}
                          onClick={() => setSelectedImage(index)}
                          className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImage === index 
                              ? 'border-[var(--brand-primary)] scale-110' 
                              : 'border-[var(--bg-card-dark)]/80 hover:border-[var(--bg-card-dark)]/60'
                          }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <Image
                            src={image} 
                            alt={`${product.title} ${index + 1}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </Container>
        </section>

        {/* Sticky Tab Navigation */}
        <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-xl border-y border-[var(--bg-card-dark)]">
          <Container>
            <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4">
              {[
                { id: 'overview', label: 'Overview', icon: Layers },
                { id: 'how-it-works', label: 'How It Works', icon: Cpu },
                { id: 'tools', label: 'Tools & Tech', icon: Code },
                { id: 'faq', label: 'FAQs', icon: MessageSquare }
              ].map((tab) => {
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-4 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-[var(--text-secondary-dark)] hover:text-white'
                    }`}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)]"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </Container>
        </div>

        {/* Tab Content */}
        <Container>
          <div className="py-12">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  <TabContent />
                </AnimatePresence>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-36 space-y-6">
                  {/* Seller Info */}
                  {product.sellerId && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-[var(--bg-card-dark)] to-[var(--bg-dark)] rounded-2xl p-6 border border-[var(--bg-card-dark)]/80 cursor-pointer hover:border-[var(--brand-primary)]/50 transition-colors"
                      onClick={handleSellerClick}
                      role="button"
                      tabIndex={0}
                    >
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-[var(--brand-primary)]" />
                        About the Seller
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--brand-primary)] rounded-full flex items-center justify-center">
                          <span className="font-bold text-black text-lg">
                            {typeof product.sellerId === 'object' && product.sellerId.name 
                              ? product.sellerId.name.charAt(0) 
                              : 'S'
                            }
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {typeof product.sellerId === 'object' && product.sellerId.name 
                                ? product.sellerId.name 
                                : 'Seller'
                              }
                            </span>
                            {product.isVerified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-secondary-dark)]">View profile →</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Target Audience */}
                  {product.targetAudience && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-[var(--bg-card-dark)]/50 rounded-2xl p-6 border border-[var(--bg-card-dark)]"
                    >
                      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-[var(--brand-primary)]" />
                        Perfect For
                      </h3>
                      <p className="text-[var(--text-secondary-dark)]">{product.targetAudience}</p>
                    </motion.div>
                  )}

                  {/* Tags */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="font-semibold text-white mb-4">Related Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <button
                          key={`tag-${index}`}
                          onClick={() => handleTagClick(tag)}
                          className="px-3 py-1.5 bg-gray-800 text-[var(--text-secondary-dark)] text-sm rounded-lg hover:bg-[var(--bg-card-dark)]/70 hover:text-white transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Auth Status */}
                  <Suspense fallback={<div className="h-20 bg-[var(--bg-card-dark)] animate-pulse rounded-xl" />}>
                    <AuthStatus showDetails={true} className="w-full justify-center" />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
}
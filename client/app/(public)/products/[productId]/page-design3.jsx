'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  DollarSign,
  Award,
  Target,
  Rocket,
  BarChart3,
  Info,
  Play,
  Maximize2,
  Eye,
  ThumbsUp,
  ArrowUpRight,
  Gauge,
  Package,
  BookOpen
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import AuthButton from '@/components/shared/ui/AuthButton'
import AuthStatus from '@/components/shared/ui/AuthStatus'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import productsAPI from '@/lib/api/products'

export default function ProductPageDesign3() {
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
  const [activeFeature, setActiveFeature] = useState(0)

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

  const handleBack = () => {
    router.back()
  }

  const handleAddToCart = async () => {
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
  }

  const handleSellerClick = () => {
    if (product?.sellerId?._id) {
      router.push(`/profile/${product.sellerId._id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <Container>
          <div className="pt-24 pb-16">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-800 rounded w-1/4" />
              <div className="h-12 bg-gray-800 rounded w-3/4" />
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="aspect-video bg-gray-800 rounded-xl" />
                <div className="space-y-4">
                  <div className="h-6 bg-gray-800 rounded w-1/2" />
                  <div className="h-4 bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <Container>
          <div className="pt-24 pb-16 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{error || 'Product Not Found'}</h1>
            <p className="text-gray-400 mb-8">The product you're looking for doesn't exist or couldn't be loaded.</p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-black rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </Container>
      </div>
    )
  }

  const categoryIcons = {
    'lead_generation': Zap,
    'content_creation': Brain,
    'automation': Target,
    'business': Lightbulb
  }

  const Icon = categoryIcons[product.category] || Brain
  const discountPercentage = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section - Magazine Style */}
        <section className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          <Container>
            <div className="relative py-8">
              {/* Navigation */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-12"
              >
                <button
                  onClick={handleBack}
                  className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLiked(!liked)}
                    className={`p-3 rounded-full backdrop-blur-xl transition-all ${
                      liked 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/5 backdrop-blur-xl rounded-full text-gray-400 hover:bg-white/10 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Main Grid Layout */}
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column - Product Info */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-5"
                >
                  {/* Category & Status */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-brand-primary text-sm font-medium uppercase tracking-wider">
                      {product.category?.replace('_', ' ')}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">{product.type}</span>
                    {product.isVerified && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-blue-400 text-sm flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    {product.title}
                  </h1>

                  {/* Description */}
                  <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                    {product.shortDescription}
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="text-center p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl backdrop-blur-xl"
                    >
                      <Users className="w-6 h-6 text-brand-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{product.sales || 0}</div>
                      <div className="text-xs text-gray-500">Customers</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="text-center p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl backdrop-blur-xl"
                    >
                      <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{product.averageRating?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="text-center p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl backdrop-blur-xl"
                    >
                      <Clock className="w-6 h-6 text-brand-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{product.setupTime?.split('_')[1] || '30'}</div>
                      <div className="text-xs text-gray-500">Minutes</div>
                    </motion.div>
                  </div>

                  {/* Price Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative p-6 bg-gradient-to-br from-brand-primary/10 to-purple-500/10 rounded-3xl backdrop-blur-xl border border-brand-primary/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-5xl font-bold">${product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-2xl text-gray-500 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        {discountPercentage > 0 && (
                          <span className="inline-block mt-2 px-3 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded-full">
                            Save {discountPercentage}% Today
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">One-time purchase</div>
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <Shield className="w-3 h-3" />
                          30-day guarantee
                        </div>
                      </div>
                    </div>

                    <AuthButton
                      onClick={handleAddToCart}
                      disabled={inCart}
                      icon={ShoppingCart}
                      className="w-full py-4 text-lg font-semibold"
                      loadingText="Adding to Cart..."
                      requiresAuth={true}
                    >
                      {inCart ? 'Added to Cart!' : 'Get Instant Access'}
                    </AuthButton>

                    <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        Instant delivery
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Lifetime access
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right Column - Visual Content */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-7"
                >
                  {/* Main Image with Overlay Info */}
                  <div className="relative group">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900"
                    >
                      <div className="aspect-[4/3]">
                        {product.thumbnail ? (
                          <img 
                            src={product.thumbnail} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-48 h-48 text-brand-primary/20" />
                          </div>
                        )}
                      </div>
                      
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <div className="flex items-center gap-4">
                            {product.previewVideo && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center"
                              >
                                <Play className="w-6 h-6 text-white ml-1" />
                              </motion.button>
                            )}
                            <div>
                              <p className="text-white font-medium">Preview Available</p>
                              <p className="text-gray-300 text-sm">See it in action</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Floating Badge */}
                      <div className="absolute top-6 right-6">
                        <motion.div
                          initial={{ rotate: -10 }}
                          animate={{ rotate: 10 }}
                          transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                          className="bg-brand-primary text-black px-4 py-2 rounded-full font-bold text-sm"
                        >
                          AI-Powered
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Image Gallery */}
                    {product.images && product.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-3">
                        {product.images.slice(0, 4).map((image, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedImage(index)}
                            className={`relative aspect-square rounded-xl overflow-hidden ${
                              selectedImage === index 
                                ? 'ring-2 ring-brand-primary' 
                                : 'ring-1 ring-gray-700'
                            }`}
                          >
                            <img 
                              src={image} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 3 && product.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-medium">+{product.images.length - 4}</span>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section - Bento Grid */}
        <section className="py-20 relative">
          <Container>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold mb-12 text-center"
            >
              What Makes This Special
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Large Feature Card */}
              {product.benefits && product.benefits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="md:col-span-2 lg:row-span-2 p-8 bg-gradient-to-br from-brand-primary/10 to-purple-500/10 rounded-3xl backdrop-blur-xl border border-gray-800 group"
                >
                  <Sparkles className="w-12 h-12 text-brand-primary mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Key Benefits</h3>
                  <div className="space-y-4">
                    {product.benefits.slice(0, 3).map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-brand-primary" />
                        </div>
                        <p className="text-gray-300">{benefit}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tools Used */}
              {product.toolsUsed && product.toolsUsed.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-gray-900/50 rounded-3xl backdrop-blur-xl border border-gray-800"
                >
                  <Code className="w-10 h-10 text-brand-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">Built With</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.toolsUsed.map((tool, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-800 rounded-lg text-sm">
                        {tool.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Target Audience */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gray-900/50 rounded-3xl backdrop-blur-xl border border-gray-800"
              >
                <Target className="w-10 h-10 text-brand-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">Perfect For</h3>
                <p className="text-gray-400 text-sm">{product.targetAudience}</p>
              </motion.div>

              {/* Outcomes */}
              {product.outcome && product.outcome.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-gradient-to-br from-purple-500/10 to-brand-primary/10 rounded-3xl backdrop-blur-xl border border-gray-800"
                >
                  <Trophy className="w-10 h-10 text-brand-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">Expected Results</h3>
                  <p className="text-gray-300 text-sm">{product.outcome[0]}</p>
                </motion.div>
              )}
            </div>
          </Container>
        </section>

        {/* How It Works - Interactive Timeline */}
        {product.howItWorks && product.howItWorks.length > 0 && (
          <section className="py-20 bg-gray-900/20">
            <Container>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-12 text-center"
              >
                How It Works
              </motion.h2>

              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  {/* Progress Bar */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gray-800">
                    <motion.div 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${(activeFeature + 1) / product.howItWorks.length * 100}%` }}
                      className="w-full bg-gradient-to-b from-brand-primary to-purple-500"
                    />
                  </div>

                  {/* Steps */}
                  <div className="space-y-12">
                    {product.howItWorks.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        onViewportEnter={() => setActiveFeature(index)}
                        className={`relative flex items-center gap-8 ${
                          index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                        }`}
                      >
                        {/* Content */}
                        <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`inline-block p-6 bg-gray-900/80 rounded-2xl backdrop-blur-xl border ${
                              activeFeature >= index ? 'border-brand-primary/50' : 'border-gray-800'
                            }`}
                          >
                            <h3 className="text-xl font-bold mb-2">Step {index + 1}</h3>
                            <p className="text-gray-400">{step}</p>
                          </motion.div>
                        </div>

                        {/* Circle */}
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
                            activeFeature >= index 
                              ? 'bg-brand-primary text-black' 
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          <span className="text-2xl font-bold">{index + 1}</span>
                        </motion.div>

                        {/* Empty space for alignment */}
                        <div className="flex-1" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* FAQs & Additional Info */}
        <section className="py-20">
          <Container>
            <div className="grid lg:grid-cols-3 gap-12">
              {/* FAQs */}
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
                {product.faqs && product.faqs.length > 0 ? (
                  <div className="space-y-4">
                    {product.faqs.map((faq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <button className="w-full text-left p-6 bg-gray-900/30 hover:bg-gray-900/50 rounded-2xl transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:rotate-90 transition-transform" />
                          </div>
                          <p className="mt-3 text-gray-400">{faq.answer}</p>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No FAQs available yet.</p>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Seller Card */}
                {product.sellerId && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={handleSellerClick}
                    className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center">
                        <span className="text-xl font-bold text-black">
                          {typeof product.sellerId === 'object' && product.sellerId.name 
                            ? product.sellerId.name.charAt(0) 
                            : 'S'
                          }
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Created by</p>
                        <p className="text-gray-400">
                          {typeof product.sellerId === 'object' && product.sellerId.name 
                            ? product.sellerId.name 
                            : 'Seller'
                          }
                        </p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-brand-primary transition-colors" />
                    </div>
                    <p className="text-sm text-gray-400">View more products from this creator</p>
                  </motion.div>
                )}

                {/* Tags */}
                <div>
                  <h3 className="font-semibold mb-4">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/products?tag=${encodeURIComponent(tag)}`)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm transition-colors"
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Support */}
                <div className="p-6 bg-gray-900/50 rounded-2xl">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-primary" />
                    Need Help?
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Get support directly from the creator or community.
                  </p>
                  <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Floating Purchase Bar - Mobile */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-xl border-t border-gray-800 z-50"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold">${product.price}</p>
              {product.originalPrice > product.price && (
                <p className="text-sm text-gray-400 line-through">${product.originalPrice}</p>
              )}
            </div>
            <AuthButton
              onClick={handleAddToCart}
              disabled={inCart}
              icon={ShoppingCart}
              className="px-6 py-3"
              requiresAuth={true}
            >
              {inCart ? 'In Cart' : 'Add to Cart'}
            </AuthButton>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
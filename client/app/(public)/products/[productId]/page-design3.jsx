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
  BookOpen,
  Download,
  Globe,
  Lock,
  Smartphone,
  Monitor,
  Headphones,
  Calendar,
  MapPin,
  Tag
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
  const [showFullDescription, setShowFullDescription] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Header />
        <Container>
          <div className="pt-24 pb-16">
            <div className="animate-pulse space-y-8">
              {/* Navigation skeleton */}
              <div className="flex justify-between">
                <div className="h-10 bg-gray-800/60 rounded-xl w-20 backdrop-blur-xl" />
                <div className="flex gap-3">
                  <div className="h-12 w-12 bg-gray-800/60 rounded-2xl backdrop-blur-xl" />
                  <div className="h-12 w-12 bg-gray-800/60 rounded-2xl backdrop-blur-xl" />
                </div>
              </div>
              
              {/* Bento Grid skeleton */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Left column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="h-8 bg-gray-800/60 rounded-xl w-1/3 backdrop-blur-xl" />
                  <div className="h-20 bg-gray-800/60 rounded-2xl backdrop-blur-xl" />
                  <div className="h-32 bg-gray-800/60 rounded-3xl backdrop-blur-xl" />
                  <div className="h-48 bg-gray-800/60 rounded-3xl backdrop-blur-xl" />
                </div>
                
                {/* Right column */}
                <div className="lg:col-span-7">
                  <div className="aspect-[4/3] bg-gray-800/60 rounded-3xl backdrop-blur-xl" />
                </div>
              </div>
              
              {/* Features grid skeleton */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:row-span-2 h-80 bg-gray-800/60 rounded-3xl backdrop-blur-xl" />
                <div className="h-40 bg-gray-800/60 rounded-3xl backdrop-blur-xl" />
                <div className="h-40 bg-gray-800/60 rounded-3xl backdrop-blur-xl" />
                <div className="h-40 bg-gray-800/60 rounded-3xl backdrop-blur-xl" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Header />
        <Container>
          <div className="pt-24 pb-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto p-8 bg-gray-900/50 rounded-3xl backdrop-blur-xl border border-gray-800"
            >
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-600" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">{error || 'Product Not Found'}</h1>
              <p className="text-gray-400 mb-8">The product you're looking for doesn't exist or couldn't be loaded.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-black rounded-xl font-semibold hover:bg-brand-primary/90 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </motion.button>
            </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-x-hidden">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section - Modern Bento Layout */}
        <section className="relative py-8">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <Container>
            <div className="relative">
              {/* Navigation Bar */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-12 p-4 bg-black/20 backdrop-blur-2xl rounded-2xl border border-gray-800/50"
              >
                <motion.button
                  whileHover={{ x: -5 }}
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Products
                </motion.button>
                
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setLiked(!liked)}
                    className={`p-3 rounded-2xl backdrop-blur-xl transition-all ${
                      liked 
                        ? 'bg-red-500/20 text-red-400 scale-110' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Main Bento Grid */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Left Column - Product Information */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Header Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-2xl rounded-3xl border border-gray-700/50"
                  >
                    {/* Category & Status */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/20 text-brand-primary text-sm font-medium rounded-full">
                        <Icon className="w-4 h-4" />
                        {product.category?.replace('_', ' ')}
                      </div>
                      <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-full">{product.type}</span>
                      {product.isVerified && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {product.title}
                    </h1>

                    {/* Short Description */}
                    <p className="text-lg text-gray-400 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </motion.div>

                  {/* Quick Stats Grid */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    <motion.div 
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="p-4 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-2xl backdrop-blur-xl border border-brand-primary/20 text-center"
                    >
                      <Users className="w-6 h-6 text-brand-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{product.sales || 0}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Customers</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-2xl backdrop-blur-xl border border-yellow-500/20 text-center"
                    >
                      <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{product.averageRating?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Rating</div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl backdrop-blur-xl border border-purple-500/20 text-center"
                    >
                      <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{product.setupTime?.split('_')[1] || '30'}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Minutes</div>
                    </motion.div>
                  </motion.div>

                  {/* Seller Card */}
                  {product.sellerId && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={handleSellerClick}
                      className="p-6 bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-2xl rounded-2xl border border-gray-600/50 cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold group-hover:text-brand-primary transition-colors">
                            {product.sellerId.businessName || product.sellerId.name}
                          </h3>
                          <p className="text-sm text-gray-400">Product Creator</p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors" />
                      </div>
                    </motion.div>
                  )}

                  {/* Price Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative p-8 bg-gradient-to-br from-brand-primary/10 via-purple-500/5 to-brand-primary/10 rounded-3xl backdrop-blur-2xl border border-brand-primary/30 overflow-hidden"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-purple-500/5 animate-pulse" />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-5xl font-bold bg-gradient-to-r from-brand-primary to-white bg-clip-text text-transparent">
                              ${product.price}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-2xl text-gray-500 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                          {discountPercentage > 0 && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="inline-block px-4 py-2 bg-red-500/20 text-red-400 text-sm font-bold rounded-full"
                            >
                              Save {discountPercentage}% Today!
                            </motion.span>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-2">One-time purchase</div>
                          <div className="flex items-center gap-1 text-xs text-green-400">
                            <Shield className="w-4 h-4" />
                            30-day guarantee
                          </div>
                        </div>
                      </div>

                      <AuthButton
                        onClick={handleAddToCart}
                        disabled={inCart}
                        icon={inCart ? CheckCircle : ShoppingCart}
                        className="w-full py-4 text-lg font-bold mb-4 bg-brand-primary text-black hover:bg-brand-primary/90"
                        loadingText="Adding to Cart..."
                        requiresAuth={true}
                      >
                        {inCart ? 'Added to Cart!' : 'Get Instant Access'}
                      </AuthButton>

                      <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-400">
                        <div className="flex flex-col items-center gap-1">
                          <Zap className="w-4 h-4 text-brand-primary" />
                          <span>Instant</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Package className="w-4 h-4 text-brand-primary" />
                          <span>Lifetime</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <Download className="w-4 h-4 text-brand-primary" />
                          <span>All Files</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Visual Content */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-7"
                >
                  {/* Main Visual Card */}
                  <div className="relative group">
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50"
                    >
                      <div className="aspect-[4/3] relative">
                        {product.thumbnail ? (
                          <>
                            <img 
                              src={product.thumbnail} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary/10 to-purple-500/10">
                            <Icon className="w-48 h-48 text-brand-primary/30" />
                          </div>
                        )}
                      </div>
                      
                      {/* Interactive Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {product.previewVideo && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-16 h-16 bg-white/20 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20"
                                >
                                  <Play className="w-6 h-6 text-white ml-1" />
                                </motion.button>
                              )}
                              <div>
                                <p className="text-white font-semibold">Preview Available</p>
                                <p className="text-gray-300 text-sm">See it in action</p>
                              </div>
                            </div>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              className="p-3 bg-white/20 backdrop-blur-2xl rounded-2xl"
                            >
                              <Maximize2 className="w-5 h-5 text-white" />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Floating Elements */}
                      <div className="absolute top-6 left-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full text-white text-sm font-medium border border-white/20"
                        >
                          {product.type}
                        </motion.div>
                      </div>

                      <div className="absolute top-6 right-6">
                        <motion.div
                          initial={{ rotate: -15, scale: 0 }}
                          animate={{ rotate: 5, scale: 1 }}
                          transition={{ type: "spring", delay: 0.7 }}
                          className="px-4 py-2 bg-brand-primary text-black rounded-2xl font-bold text-sm shadow-xl"
                        >
                          AI-Powered ⚡
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Image Gallery */}
                    {product.images && product.images.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6 grid grid-cols-4 gap-4"
                      >
                        {product.images.slice(0, 4).map((image, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedImage(index)}
                            className={`relative aspect-square rounded-2xl overflow-hidden transition-all ${
                              selectedImage === index 
                                ? 'ring-3 ring-brand-primary shadow-lg shadow-brand-primary/25' 
                                : 'ring-1 ring-gray-600 hover:ring-gray-500'
                            }`}
                          >
                            <img 
                              src={image} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {index === 3 && product.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                                <span className="text-white font-bold text-lg">+{product.images.length - 4}</span>
                              </div>
                            )}
                            {selectedImage === index && (
                              <div className="absolute inset-0 bg-brand-primary/20 border-2 border-brand-primary rounded-2xl" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section - Advanced Bento Grid */}
        <section className="py-20 relative">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-brand-primary to-white bg-clip-text text-transparent">
                What Makes This Special
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Discover the powerful features and benefits that set this product apart
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Hero Feature Card */}
              {product.benefits && product.benefits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  className="md:col-span-2 lg:row-span-2 p-8 bg-gradient-to-br from-brand-primary/10 via-purple-500/5 to-brand-primary/5 rounded-3xl backdrop-blur-2xl border border-brand-primary/20 relative overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-brand-primary/20 rounded-3xl flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-brand-primary" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold mb-2">Key Benefits</h3>
                        <p className="text-gray-400">What you'll gain from this product</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {product.benefits.slice(0, 4).map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 10 }}
                          className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-5 h-5 text-brand-primary" />
                          </div>
                          <div>
                            <p className="text-gray-200 font-medium leading-relaxed">{benefit}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tools & Tech Stack */}
              {product.toolsUsed && product.toolsUsed.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-3xl backdrop-blur-2xl border border-gray-700/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <Code className="w-10 h-10 text-blue-400" />
                      <div>
                        <h3 className="text-xl font-bold">Tech Stack</h3>
                        <p className="text-sm text-gray-400">Built with modern tools</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {product.toolsUsed.slice(0, 6).map((tool, index) => (
                        <motion.span 
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                          className="px-3 py-2 bg-gray-800/80 rounded-xl text-sm font-medium border border-gray-600/50 hover:border-blue-400/50 transition-colors cursor-pointer"
                        >
                          {tool.name}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Target Audience */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-3xl backdrop-blur-2xl border border-purple-500/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-10 h-10 text-purple-400" />
                    <div>
                      <h3 className="text-xl font-bold">Perfect For</h3>
                      <p className="text-sm text-gray-400">Ideal users</p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{product.targetAudience}</p>
                </div>
              </motion.div>

              {/* Expected Results */}
              {product.outcome && product.outcome.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-3xl backdrop-blur-2xl border border-green-500/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="w-10 h-10 text-green-400" />
                      <div>
                        <h3 className="text-xl font-bold">Results</h3>
                        <p className="text-sm text-gray-400">What you'll achieve</p>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{product.outcome[0]}</p>
                  </div>
                </motion.div>
              )}

              {/* Setup Time */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-3xl backdrop-blur-2xl border border-orange-500/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
                
                <div className="relative text-center">
                  <Gauge className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Quick Setup</h3>
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    {product.setupTime?.split('_')[1] || '30'} min
                  </div>
                  <p className="text-sm text-gray-400">Average setup time</p>
                </div>
              </motion.div>

              {/* Pricing Highlight */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-brand-primary/15 to-brand-primary/5 rounded-3xl backdrop-blur-2xl border border-brand-primary/30 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl" />
                
                <div className="relative text-center">
                  <DollarSign className="w-12 h-12 text-brand-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Great Value</h3>
                  <div className="text-3xl font-bold text-brand-primary mb-1">${product.price}</div>
                  <p className="text-sm text-gray-400">One-time payment</p>
                  {discountPercentage > 0 && (
                    <div className="mt-2 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full inline-block">
                      {discountPercentage}% OFF
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* How It Works - Interactive Process */}
        {product.howItWorks && product.howItWorks.length > 0 && (
          <section className="py-20 bg-gradient-to-b from-gray-900/50 to-black relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            
            <Container>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-brand-primary to-white bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Simple steps to get started and achieve your goals
                </p>
              </motion.div>

              <div className="relative">
                {/* Connection Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-primary via-purple-500 to-brand-primary hidden lg:block" />
                
                <div className="space-y-12">
                  {product.howItWorks.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className={`grid lg:grid-cols-2 gap-8 items-center ${
                        index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                      }`}
                    >
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`relative ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                      >
                        <div className="p-8 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-2xl rounded-3xl border border-gray-700/50 relative overflow-hidden">
                          {/* Step number */}
                          <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-black font-bold text-xl">
                            {index + 1}
                          </div>
                          
                          <div className="flex items-start gap-6">
                            <div className="w-16 h-16 bg-brand-primary/20 rounded-3xl flex items-center justify-center flex-shrink-0">
                              {index === 0 && <Rocket className="w-8 h-8 text-brand-primary" />}
                              {index === 1 && <Layers className="w-8 h-8 text-brand-primary" />}
                              {index === 2 && <BarChart3 className="w-8 h-8 text-brand-primary" />}
                              {index >= 3 && <CheckCircle className="w-8 h-8 text-brand-primary" />}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-4">Step {index + 1}</h3>
                              <p className="text-gray-300 text-lg leading-relaxed">{step}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      
                      <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative aspect-square bg-gradient-to-br from-brand-primary/10 to-purple-500/10 rounded-3xl p-8 flex items-center justify-center"
                        >
                          <div className="text-8xl font-bold text-brand-primary/20">
                            {index + 1}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* Full Description Section */}
        {product.detailedDescription && (
          <section className="py-20">
            <Container>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <div className="p-8 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-2xl rounded-3xl border border-gray-700/50">
                  <div className="flex items-center gap-4 mb-6">
                    <BookOpen className="w-8 h-8 text-brand-primary" />
                    <h2 className="text-3xl font-bold">Detailed Overview</h2>
                  </div>
                  
                  <div className="prose prose-lg prose-gray max-w-none">
                    <div className={`text-gray-300 leading-relaxed ${!showFullDescription ? 'line-clamp-6' : ''}`}>
                      {product.detailedDescription}
                    </div>
                    
                    {product.detailedDescription.length > 500 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-4 px-6 py-3 bg-brand-primary/20 text-brand-primary rounded-xl font-semibold hover:bg-brand-primary/30 transition-colors"
                      >
                        {showFullDescription ? 'Show Less' : 'Read More'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </Container>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-purple-500/5 to-brand-primary/10" />
          <div className="absolute inset-0 bg-black/50" />
          
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative text-center max-w-3xl mx-auto"
            >
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-brand-primary to-white bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands of satisfied customers and transform your business today
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <AuthButton
                  onClick={handleAddToCart}
                  disabled={inCart}
                  icon={inCart ? CheckCircle : ShoppingCart}
                  className="px-8 py-4 text-lg font-bold bg-brand-primary text-black hover:bg-brand-primary/90"
                  requiresAuth={true}
                >
                  {inCart ? 'Added to Cart!' : `Get Access for $${product.price}`}
                </AuthButton>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  View More Products
                </motion.button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  30-day money-back guarantee
                </span>
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Secure payment
                </span>
                <span className="flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  24/7 support
                </span>
              </div>
            </motion.div>
          </Container>
        </section>
      </main>
    </div>
  )
}
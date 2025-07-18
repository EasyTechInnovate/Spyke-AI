'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Download, 
  Shield, 
  Clock,
  Users,
  CheckCircle,
  PlayCircle,
  FileText,
  Zap,
  Target,
  Brain,
  Lightbulb
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import AuthButton from '@/components/shared/ui/AuthButton'
import AuthStatus from '@/components/shared/ui/AuthStatus'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

// Dummy product data - in real app this would come from API
const DUMMY_PRODUCTS = {
  1: {
    id: 1,
    title: "Ultimate ChatGPT Prompt Collection",
    description: "Transform your ChatGPT experience with 200+ expertly crafted prompts designed for content creation, marketing, and business growth. This comprehensive collection includes prompts for blog writing, social media content, email marketing, sales copy, and strategic business planning.",
    longDescription: `This ultimate ChatGPT prompt collection is your gateway to unlocking the full potential of AI-powered content creation. Whether you're a marketer, entrepreneur, content creator, or business professional, these 200+ carefully curated prompts will help you generate high-quality content in minutes, not hours.

**What's Included:**
- 50+ Content Creation Prompts
- 40+ Marketing & Sales Prompts  
- 30+ Business Strategy Prompts
- 25+ Social Media Prompts
- 20+ Email Marketing Templates
- 15+ SEO Optimization Prompts
- 10+ Video Script Templates
- Bonus: Advanced Prompt Engineering Guide

Each prompt is designed to produce specific, actionable results and comes with usage examples and customization tips.`,
    price: 29.99,
    originalPrice: 49.99,
    rating: 4.9,
    reviews: 156,
    sales: 1240,
    category: "Marketing",
    tags: ["ChatGPT", "Content", "Marketing", "AI Prompts", "Business"],
    files: [
      { name: "ChatGPT_Prompts_Collection.pdf", size: "2.4 MB", type: "PDF" },
      { name: "Quick_Reference_Guide.pdf", size: "850 KB", type: "PDF" },
      { name: "Video_Tutorials.mp4", size: "45 MB", type: "Video" }
    ],
    seller: {
      id: "alex-johnson",
      name: "Alex Johnson",
      avatar: "/api/placeholder/60/60",
      verified: true,
      rating: 4.8,
      sales: 2540,
      description: "Digital marketing expert with 8+ years of experience helping businesses grow through AI-powered content strategies."
    },
    features: [
      "200+ Ready-to-use prompts",
      "Instant download",
      "Lifetime access",
      "Free updates",
      "Money-back guarantee",
      "Commercial license included"
    ],
    icon: Brain,
    images: [
      "/api/placeholder/600/400",
      "/api/placeholder/600/400", 
      "/api/placeholder/600/400"
    ],
    faqs: [
      {
        question: "What format are the prompts in?",
        answer: "All prompts are provided in PDF format for easy copying and pasting, plus we include a bonus video tutorial."
      },
      {
        question: "Can I use these for commercial purposes?",
        answer: "Yes! Commercial license is included, so you can use these prompts for client work and business purposes."
      },
      {
        question: "Do you provide updates?",
        answer: "Absolutely! You'll receive free lifetime updates as we add new prompts to the collection."
      }
    ]
  },
  2: {
    id: 2,
    title: "AI Email Marketing Automation", 
    description: "Complete email sequences and templates that convert at 40%+ rates. Includes welcome series, nurture campaigns, and sales funnels.",
    price: 39.99,
    originalPrice: 69.99,
    rating: 4.8,
    reviews: 89,
    sales: 856,
    category: "Automation",
    tags: ["Email", "Automation", "Sales", "Marketing"],
    icon: Zap,
    seller: {
      id: "sarah-chen",
      name: "Sarah Chen",
      verified: true
    }
  },
  3: {
    id: 3,
    title: "Social Media Content Scripts",
    description: "30-day content calendar with viral-ready scripts for all platforms including Instagram, TikTok, LinkedIn, and Twitter.",
    price: 19.99,
    originalPrice: 34.99,
    rating: 4.7,
    reviews: 203,
    sales: 2100,
    category: "Content",
    tags: ["Social Media", "Scripts", "Content"],
    icon: Target,
    seller: {
      id: "mike-rodriguez", 
      name: "Mike Rodriguez",
      verified: false
    }
  },
  4: {
    id: 4,
    title: "AI Business Plan Generator",
    description: "Step-by-step prompts to create professional business plans in minutes using AI assistance.",
    price: 24.99,
    originalPrice: 39.99,
    rating: 4.9,
    reviews: 67,
    sales: 445,
    category: "Business",
    tags: ["Business", "Planning", "AI"],
    icon: Lightbulb,
    seller: {
      id: "emma-taylor",
      name: "Emma Taylor", 
      verified: true
    }
  }
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = parseInt(params.productId)
  const { isAuthenticated, user } = useAuth()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [inCart, setInCart] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundProduct = DUMMY_PRODUCTS[productId]
      if (foundProduct) {
        setProduct(foundProduct)
      }
      setLoading(false)
    }, 500)
  }, [productId])

  const handleBack = () => {
    router.back()
  }

  const handleAddToCart = async () => {
    // This will be called only if user is authenticated (handled by AuthButton)
    if (product) {
      const success = addToCart(product)
      
      if (success) {
        setInCart(true)
        
        // Redirect to cart after a short delay
        setTimeout(() => {
          router.push('/cart')
        }, 500)
      }
    }
  }

  const handleSellerClick = () => {
    router.push(`/profile/${product.seller.id}`)
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

  if (!product) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <Container>
          <div className="pt-24 pb-16 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
            <p className="text-gray-400 mb-8">The product you're looking for doesn't exist.</p>
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

  const Icon = product.icon
  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <Container>
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-8"
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <span className="text-gray-600">/</span>
              <span className="text-gray-400">{product.category}</span>
              <span className="text-gray-600">/</span>
              <span className="text-white">{product.title}</span>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
              {/* Product Images */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                {/* Main Image */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <Icon className="w-32 h-32 text-brand-primary/50" />
                  {discountPercentage > 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
                        -{discountPercentage}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">About This Product</h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {product.longDescription || product.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  {product.features && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">What's Included</h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-brand-primary flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Files */}
                  {product.files && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Files Included</h3>
                      <div className="space-y-3">
                        {product.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-800">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-brand-primary" />
                              <div>
                                <p className="font-medium text-white">{file.name}</p>
                                <p className="text-sm text-gray-400">{file.type} • {file.size}</p>
                              </div>
                            </div>
                            <Download className="w-5 h-5 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Purchase Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="lg:sticky lg:top-8 space-y-4 lg:space-y-6">
                  {/* Product Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs font-medium rounded">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
                      </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
                    
                    <p className="text-gray-400 mb-6">{product.description}</p>
                  </div>

                  {/* Price */}
                  <div className="border-b border-gray-800 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-brand-primary">
                        ${product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-lg text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {product.sales} sales
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Instant access
                      </span>
                    </div>
                  </div>

                  {/* Auth Status */}
                  <AuthStatus showDetails={true} className="w-full justify-center" />

                  {/* Purchase Actions */}
                  <div className="space-y-3">
                    <AuthButton
                      onClick={handleAddToCart}
                      disabled={inCart}
                      icon={ShoppingCart}
                      className="w-full px-6 py-4 text-base"
                      loadingText="Adding to Cart..."
                      requiresAuth={true}
                    >
                      {inCart ? 'Added to Cart!' : 'Add to Cart'}
                    </AuthButton>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setLiked(!liked)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl transition-colors ${
                          liked 
                            ? 'border-red-500 text-red-500 bg-red-500/10' 
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                        {liked ? 'Liked' : 'Like'}
                      </button>
                      
                      <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-700 text-gray-400 rounded-xl hover:border-gray-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Guarantees */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-brand-primary" />
                      <span className="font-semibold">Purchase Protection</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>✓ 30-day money-back guarantee</li>
                      <li>✓ Instant download after purchase</li>
                      <li>✓ Lifetime access to files</li>
                      <li>✓ Free updates included</li>
                    </ul>
                  </div>

                  {/* Seller Info */}
                  <div 
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-brand-primary/50 transition-colors"
                    onClick={handleSellerClick}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                        <span className="font-bold text-black">
                          {product.seller.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{product.seller.name}</span>
                          {product.seller.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        {product.seller.rating && (
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{product.seller.rating}</span>
                            <span>• {product.seller.sales} sales</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {product.seller.description && (
                      <p className="text-sm text-gray-400">{product.seller.description}</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="font-semibold mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  )
}
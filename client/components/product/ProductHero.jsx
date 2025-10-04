'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import {
    Heart,
    Share2,
    ShoppingCart,
    Download,
    ThumbsUp,
    Play,
    Pause,
    Star,
    User,
    Shield,
    Zap,
    Clock,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Eye,
    TrendingUp,
    ExternalLink,
    MapPin,
    Award,
    Calendar,
    Package,
    Globe,
    Users,
    CheckCircle,
    Sparkles,
    Tag,
    Target,
    Building,
    Verified,
    BadgeCheck,
    Copy,
    ArrowUpRight,
    ChevronDown,
    Info,
    DollarSign,
    Percent,
    Timer
} from 'lucide-react'
const AnimatedCounter = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref)
    useEffect(() => {
        if (isInView && value) {
            let start = 0
            const end = parseInt(value.toString()) || 0
            if (start === end) return
            const timer = setInterval(() => {
                start += Math.ceil(end / (duration / 50))
                if (start > end) {
                    setCount(end)
                    clearInterval(timer)
                } else {
                    setCount(start)
                }
            }, 50)
            return () => clearInterval(timer)
        }
    }, [isInView, value, duration])
    return <span ref={ref}>{count}</span>
}
const StatCard = ({ icon: Icon, singular, plural, value, color = 'text-[#00FF89]', delay = 0 }) => {
    const label = value === 1 ? singular : plural
    return (
        <div
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-2 sm:gap-2.5 cursor-default select-none">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <div className="flex items-baseline leading-none whitespace-nowrap">
                <span className={`text-base sm:text-lg font-semibold ${color}`}>
                    <AnimatedCounter value={value} />
                </span>
                <span className="text-[13px] ml-1 text-gray-400 font-medium tracking-tight">{label}</span>
            </div>
        </div>
    )
}
const FeatureBadge = ({ icon: Icon, text, variant = 'default' }) => {
    const variants = {
        default: 'bg-[#00FF89]/10 border-[#00FF89]/30 text-[#00FF89]',
        verified: 'bg-green-500/10 border-green-500/30 text-green-400',
        tested: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        guarantee: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
    }
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${variants[variant]}`}>
            <Icon className="w-4 h-4" />
            <span>{text}</span>
        </div>
    )
}
export default function ProductHero({
    product,
    selectedImage,
    setSelectedImage,
    liked,
    upvoted,
    isUpvoting,
    showCopied,
    hasPurchased,
    isOwner,
    inCart,
    addingToCart,
    discountPercentage,
    savingsAmount,
    onAddToCart,
    onBuyNow,
    onLike,
    onUpvote,
    onDownload,
    onShare,
    ctaRef,
    onNavigateToReviews
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(selectedImage || 0)
    const [isImageFullscreen, setIsImageFullscreen] = useState(false)
    const [copiedText, setCopiedText] = useState('')
    const heroRef = useRef(null)
    const isInView = useInView(heroRef, { once: true })

    if (!product) return null

    const seller = product?.sellerId || null
    const sellerAvatar = seller?.avatar || seller?.profileImage || seller?.photoUrl || seller?.image || ''
    const sellerInitial = (seller?.fullName || seller?.name || 'S').charAt(0).toUpperCase()
    const [sellerImgFailed, setSellerImgFailed] = useState(false)

    const mediaItems = []
    if (product.thumbnail) {
        mediaItems.push({
            type: 'image',
            src: product.thumbnail,
            alt: `${product.title} - Thumbnail`
        })
    }
    if (product.images && Array.isArray(product.images)) {
        product.images.forEach((image, index) => {
            mediaItems.push({
                type: 'image',
                src: image,
                alt: `${product.title} - Image ${index + 1}`
            })
        })
    }

    const activeMedia = mediaItems[currentImageIndex] || mediaItems[0]
    const calculatedDiscount =
        product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
    const calculatedSavings = product.originalPrice && product.price ? product.originalPrice - product.price : 0

    const formatCurrency = (amount) => `$${(Number(amount) || 0).toFixed(2)}`

    const nextImage = () => {
        if (mediaItems.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)
        }
    }
    const prevImage = () => {
        if (mediaItems.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
        }
    }
    useEffect(() => {
        if (mediaItems.length > 1) {
            const interval = setInterval(() => {
                nextImage()
            }, 4000)
            return () => clearInterval(interval)
        }
    }, [mediaItems.length])

    const copyToClipboard = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedText(label)
            setTimeout(() => setCopiedText(''), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const getSetupTimeDisplay = (setupTime) => {
        if (!setupTime) return 'Quick Setup'
        return setupTime.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    }

    const getSellerProfileUrl = () => {
        const s = product?.sellerId
        if (!s) return null
        const id = s._id || s.id
        return id ? `/profile/${id}` : null
    }

    const whatsappUrl = 'https://wa.link/7uwiza'

    return (
        <div
            ref={heroRef}
            className="relative bg-black">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black" />
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl"
                />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="relative space-y-6">
                        <div className="relative group">
                            <div
                                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900/80 border border-gray-700/50 cursor-pointer"
                                onClick={() => setIsImageFullscreen(true)}>
                                {activeMedia?.src ? (
                                    <>
                                        <img
                                            src={activeMedia.src}
                                            alt={activeMedia.alt}
                                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 cursor-pointer"
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder-product.jpg'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="px-4 py-2 bg-black/80 backdrop-blur-sm rounded-lg border border-[#00FF89]/50">
                                                    <div className="flex items-center gap-2 text-[#00FF89]">
                                                        <Eye className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Click to enlarge</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                                {mediaItems.length > 1 && (
                                                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
                                                        <span className="text-white text-sm">
                                                            {currentImageIndex + 1} / {mediaItems.length}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <Package className="w-16 h-16 text-gray-500 mb-4" />
                                        <span className="text-gray-400">No image available</span>
                                    </div>
                                )}
                                {mediaItems.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                prevImage()
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 z-10">
                                            <ChevronLeft className="w-5 h-5 text-[#00FF89]" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                nextImage()
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 z-10">
                                            <ChevronRight className="w-5 h-5 text-[#00FF89]" />
                                        </button>
                                    </>
                                )}
                            </div>
                            {mediaItems.length > 1 && (
                                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                    {mediaItems.map((media, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                currentImageIndex === index
                                                    ? 'border-[#00FF89] ring-2 ring-[#00FF89]/25'
                                                    : 'border-gray-600 hover:border-[#00FF89]/50'
                                            }`}>
                                            <img
                                                src={media.src}
                                                alt={media.alt}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-2 pt-3 border-t border-gray-800/60 grid grid-cols-2 sm:grid-cols-4 gap-y-3 text-center">
                            <div className="px-2">
                                <div className="text-lg sm:text-xl font-bold text-[#00FF89]">
                                    <AnimatedCounter value={product.views || 0} />
                                </div>
                                <div className="text-xs sm:text-sm text-gray-400">Views</div>
                            </div>
                            <div className="px-2">
                                <div className="text-lg sm:text-xl font-bold text-[#00FF89]">
                                    <AnimatedCounter value={product.sales || 0} />
                                </div>
                                <div className="text-xs sm:text-sm text-gray-400">Sales</div>
                            </div>
                            <div className="px-2">
                                <div className="text-lg sm:text-xl font-bold text-[#00FF89]">
                                    <AnimatedCounter value={product.favorites || 0} />
                                </div>
                                <div className="text-xs sm:text-sm text-gray-400">Favorites</div>
                            </div>
                            <div className="px-2">
                                <div className="text-lg sm:text-xl font-bold text-[#00FF89]">
                                    <AnimatedCounter value={product.upvotes || 0} />
                                </div>
                                <div className="text-xs sm:text-sm text-gray-400">Upvotes</div>
                            </div>
                        </div>
                        {/* Small colourful banner just below the stats */}

                        {product.tags && product.tags.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-3 space-y-3">
                                <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.slice(0, 6).map((tag, index) => (
                                        <button
                                            key={index}
                                            onClick={() => copyToClipboard(tag, `Tag: ${tag}`)}
                                            className="px-2 py-1 bg-white/5 hover:bg-[#00FF89]/10 border border-gray-700 hover:border-[#00FF89]/30 text-gray-300 hover:text-[#00FF89] rounded text-xs transition-all duration-300 flex items-center gap-1">
                                            #{tag}
                                            {copiedText === `Tag: ${tag}` && <CheckCircle className="w-3 h-3 text-[#00FF89]" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <motion.a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500/10 text-[#00FF89] font-semibold py-2 px-3 shadow-sm hover:shadow border border-white/10 hover:opacity-95">
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                            </svg>
                            <span className="text-sm">Still have doubts? Contact us on WhatsApp</span>
                        </motion.a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                {product.category?.name && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-full">
                                        <Package className="w-3 h-3 text-[#00FF89]" />
                                        <span className="text-[#00FF89] font-medium text-xs">{product.category.name}</span>
                                    </motion.div>
                                )}
                                {product.industry?.name && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full">
                                        <Building className="w-3 h-3 text-blue-400" />
                                        <span className="text-blue-400 font-medium text-xs">{product.industry.name}</span>
                                    </motion.div>
                                )}
                                {product.type && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full">
                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                        <span className="text-purple-400 font-medium text-xs capitalize">{product.type}</span>
                                    </motion.div>
                                )}
                            </div>
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                                {product.title}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="text-base sm:text-lg text-gray-300 leading-relaxed">
                                {product.shortDescription}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="flex flex-wrap items-center gap-3">
                                {product.isVerified && (
                                    <FeatureBadge
                                        icon={BadgeCheck}
                                        text="Verified"
                                        variant="verified"
                                    />
                                )}
                                {product.isTested && (
                                    <FeatureBadge
                                        icon={CheckCircle}
                                        text="Tested"
                                        variant="tested"
                                    />
                                )}
                                {product.hasGuarantee && (
                                    <FeatureBadge
                                        icon={Shield}
                                        text="Guarantee"
                                        variant="guarantee"
                                    />
                                )}
                                <FeatureBadge
                                    icon={Timer}
                                    text={getSetupTimeDisplay(product.setupTime)}
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="flex flex-wrap items-center gap-6">
                                <button
                                    onClick={onNavigateToReviews}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                    i < Math.floor(product.averageRating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white font-semibold text-sm">{product.averageRating?.toFixed(1) || '5.0'}</span>
                                    <span className="text-gray-400 text-sm">({product.totalReviews || 0})</span>
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onUpvote}
                                        disabled={isUpvoting}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm ${
                                            upvoted
                                                ? 'bg-[#00FF89]/10 border-[#00FF89]/30 text-[#00FF89]'
                                                : 'bg-white/5 border-gray-700 text-gray-300 hover:bg-[#00FF89]/5 hover:border-[#00FF89]/20'
                                        }`}>
                                        <ThumbsUp className="w-4 h-4" />
                                        <span className="font-medium">{product.upvotes || 0}</span>
                                    </button>
                                    <button
                                        onClick={onLike}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm ${
                                            liked
                                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                                : 'bg-white/5 border-gray-700 text-gray-300 hover:bg-red-500/5 hover:border-red-500/20'
                                        }`}>
                                        <Heart className={`${liked ? 'fill-current' : ''} w-4 h-4`} />
                                        <span className="font-medium">{product.favorites || 0}</span>
                                    </button>
                                    <button
                                        onClick={onShare}
                                        className="relative flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-[#00FF89]/30 rounded-lg transition-all text-sm">
                                        <Share2 className="w-4 h-4 text-gray-300" />
                                        <span className="text-gray-300 font-medium">Share</span>
                                        {showCopied && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#00FF89] text-black text-xs rounded whitespace-nowrap">
                                                Copied!
                                            </motion.div>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                        <motion.div
                            ref={ctaRef}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 }}
                            className="relative overflow-hidden rounded-2xl p-8 bg-gray-900/50 border border-gray-700/50">
                            {calculatedDiscount > 0 && (
                                <div className="absolute top-4 right-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-black rounded-full">
                                        <Percent className="w-3 h-3" />
                                        <span className="font-bold text-xs">{calculatedDiscount}% OFF</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-baseline gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-black/20 flex items-center justify-center flex-shrink-0">
                                        <DollarSign className="w-4 h-4 text-[#00FF89]" />
                                    </div>
                                    <span className="text-3xl lg:text-4xl font-bold text-[#00FF89] leading-none">{product.price || 0}</span>
                                </div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="space-y-1">
                                        <div className="text-lg text-gray-400 line-through">{formatCurrency(product.originalPrice)}</div>
                                        <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium rounded-full">
                                            Save {formatCurrency(calculatedSavings)}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">Instant Access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">Lifetime Updates</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">24/7 Support</span>
                                </div>
                                {product.hasRefundPolicy && (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                                        <span className="text-gray-300 text-sm">Refund Policy</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                {hasPurchased ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onDownload}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-xl font-bold transition-all duration-300">
                                        <Download className="w-5 h-5" />
                                        Access Your Product
                                    </motion.button>
                                ) : isOwner ? (
                                    <Link href="/seller/products">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all duration-300">
                                            Manage Product
                                        </motion.button>
                                    </Link>
                                ) : (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onBuyNow}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-xl font-bold transition-all duration-300">
                                            <Zap className="w-5 h-5" />
                                            Buy Now - Instant Access
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onAddToCart}
                                            disabled={inCart || addingToCart}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-gray-600 hover:border-[#00FF89]/50 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <ShoppingCart className="w-5 h-5" />
                                            {addingToCart ? 'Adding to Cart...' : inCart ? 'Already in Cart' : 'Add to Cart'}
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                        {product.sellerId && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3 }}
                                className="relative overflow-hidden rounded-xl p-6 bg-gray-900/30 border border-gray-700/50">
                                <div className="flex items-start gap-3">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#00FF89]/20 flex-shrink-0">
                                        {sellerAvatar && !sellerImgFailed ? (
                                            <img
                                                src={sellerAvatar}
                                                alt={`${seller?.fullName || 'Seller'} avatar`}
                                                className="w-full h-full object-cover"
                                                onError={() => setSellerImgFailed(true)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-sm font-bold text-black">{sellerInitial}</span>
                                            </div>
                                        )}
                                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-[#00FF89]/40" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-base font-bold text-white">{product.sellerId.fullName}</h3>
                                                {product.sellerId.location?.country && (
                                                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                                                        <MapPin className="w-3 h-3" />
                                                        {product.sellerId.location.country}
                                                    </div>
                                                )}
                                            </div>
                                            {getSellerProfileUrl() ? (
                                                <Link
                                                    href={getSellerProfileUrl()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-gray-700/70 hover:border-[#00FF89]/40 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1">
                                                    View
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="px-3 py-1.5 rounded-full bg-white/10 border border-gray-700/70 text-white text-xs font-semibold opacity-50 cursor-not-allowed inline-flex items-center gap-1">
                                                    View
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        {product.sellerId.bio && (
                                            <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">{product.sellerId.bio}</p>
                                        )}
                                        <div className="grid grid-cols-3 gap-3 pt-2 border-top border-t border-gray-700/50">
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-[#00FF89]">{product.sellerId.stats?.totalProducts || 0}</div>
                                                <div className="text-xs text-gray-400">Products</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-[#00FF89]">{product.sellerId.stats?.totalSales || 0}</div>
                                                <div className="text-xs text-gray-400">Sales</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-[#00FF89] flex items-center justify-center gap-1">
                                                    {product.sellerId.stats?.averageRating || 5.0}
                                                    <Star className="w-3 h-3 text-[#00FF89] fill-current" />
                                                </div>
                                                <div className="text-xs text-gray-400">Rating</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
            <AnimatePresence>
                {isImageFullscreen && activeMedia?.src && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setIsImageFullscreen(false)}>
                        <button
                            onClick={() => setIsImageFullscreen(false)}
                            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors">
                            <span className="text-white text-2xl">×</span>
                        </button>
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            src={activeMedia.src}
                            alt={activeMedia.alt}
                            className="max-w-full max-h-full object-contain rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}


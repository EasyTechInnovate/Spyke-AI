'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    Heart,
    Share2,
    ShoppingCart,
    Download,
    ThumbsUp,
    Package,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize2,
    Star,
    User,
    Shield,
    Zap,
    Clock,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Eye,
    TrendingUp
} from 'lucide-react'

import { DESIGN_TOKENS, DSHeading, DSText, DSButton } from '@/lib/design-system'

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
    discountPercentage,
    savingsAmount,
    onAddToCart,
    onBuyNow,
    onLike,
    onUpvote,
    onDownload,
    onShare,
    ctaRef
}) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(selectedImage || 0)
    const [isImageFullscreen, setIsImageFullscreen] = useState(false)
    const videoRef = useRef(null)

    if (!product) return null

    // Prepare media items
    const mediaItems = []

    if (product.images && product.images.length > 0) {
        product.images.forEach((image, index) => {
            mediaItems.push({
                type: 'image',
                src: image,
                alt: `${product.title} - Image ${index + 1}`
            })
        })
    }

    if (product.previewVideo) {
        mediaItems.push({
            type: 'video',
            src: product.previewVideo,
            poster: product.images?.[0] || product.thumbnail,
            alt: `${product.title} - Preview Video`
        })
    }

    if (mediaItems.length === 0 && product.thumbnail) {
        mediaItems.push({
            type: 'image',
            src: product.thumbnail,
            alt: product.title
        })
    }

    const activeMedia = mediaItems[currentImageIndex] || mediaItems[0]

    // Auto-advance images
    useEffect(() => {
        if (mediaItems.length > 1 && activeMedia?.type === 'image') {
            const interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [mediaItems.length, activeMedia?.type])

    // Video controls
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,137,0.3)_0%,transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:60px_60px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
                    {/* LEFT SIDE - Media Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative">
                        {/* Main Media Display */}
                        <div className="relative group">
                            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full relative">
                                        {activeMedia?.type === 'video' ? (
                                            <div className="relative w-full h-full">
                                                <video
                                                    ref={videoRef}
                                                    src={activeMedia.src}
                                                    poster={activeMedia.poster}
                                                    className="w-full h-full object-cover"
                                                    muted={isMuted}
                                                    onPlay={() => setIsPlaying(true)}
                                                    onPause={() => setIsPlaying(false)}
                                                />

                                                {/* Video Controls Overlay */}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={togglePlayPause}
                                                            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                                            {isPlaying ? (
                                                                <Pause className="w-8 h-8 text-white" />
                                                            ) : (
                                                                <Play className="w-8 h-8 text-white ml-1" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={toggleMute}
                                                            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                                            {isMuted ? (
                                                                <VolumeX className="w-6 h-6 text-white" />
                                                            ) : (
                                                                <Volume2 className="w-6 h-6 text-white" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={activeMedia?.src || product.thumbnail || '/images/placeholder-product.jpg'}
                                                alt={activeMedia?.alt || product.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                                onError={(e) => {
                                                    e.target.src = product.thumbnail || '/images/placeholder-product.jpg'
                                                }}
                                            />
                                        )}

                                        {/* Fullscreen Button */}
                                        <button
                                            onClick={() => setIsImageFullscreen(true)}
                                            className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                                            <Maximize2 className="w-5 h-5 text-white" />
                                        </button>

                                        {/* Image Navigation */}
                                        {mediaItems.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60">
                                                    <ChevronLeft className="w-6 h-6 text-white" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60">
                                                    <ChevronRight className="w-6 h-6 text-white" />
                                                </button>
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Media Indicators */}
                            {mediaItems.length > 1 && (
                                <div className="flex justify-center mt-6 gap-2">
                                    {mediaItems.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                currentImageIndex === index ? 'bg-[#00FF89] w-8' : 'bg-gray-600 hover:bg-gray-500'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Floating Badges */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                {product.isVerified && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-200 text-sm font-medium">
                                        <Shield className="w-4 h-4" />
                                        Verified
                                    </span>
                                )}
                                {discountPercentage > 0 && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 text-sm font-bold">
                                        🔥 {discountPercentage}% OFF
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {mediaItems.length > 1 && (
                            <div className="grid grid-cols-5 gap-3 mt-6">
                                {mediaItems.slice(0, 5).map((media, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                            currentImageIndex === index
                                                ? 'border-[#00FF89] ring-2 ring-[#00FF89]/30 scale-105'
                                                : 'border-gray-700/50 hover:border-gray-600/70 hover:scale-102'
                                        }`}>
                                        <img
                                            src={media.type === 'video' ? media.poster : media.src}
                                            alt={media.alt}
                                            className="w-full h-full object-cover"
                                        />
                                        {media.type === 'video' && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <Play className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* RIGHT SIDE - Product Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-8">
                        {/* Product Header */}
                        <div className="space-y-4">
                            {/* Category Badge */}
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#00FF89]/10 border border-[#00FF89]/20 backdrop-blur-sm">
                                <span className="text-sm font-medium uppercase tracking-wide text-[#00FF89]">
                                    {product.category?.replace('_', ' ')} • {product.type}
                                </span>
                            </div>

                            {/* Title */}
                            <DSHeading
                                level={1}
                                className="text-4xl lg:text-5xl font-black leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                {product.title}
                            </DSHeading>

                            {/* Description */}
                            <DSText className="text-lg leading-relaxed text-gray-300">{product.shortDescription}</DSText>

                            {/* Stats Row */}
                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="font-semibold text-white">{product.averageRating?.toFixed(1) || '5.0'}</span>
                                    <span className="text-gray-400 text-sm">({product.reviews?.length || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[#00FF89]" />
                                    <span className="font-semibold text-white">{product.sales || 0}</span>
                                    <span className="text-gray-400 text-sm">sold</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-400" />
                                    <span className="font-semibold text-white">{product.views || 0}</span>
                                    <span className="text-gray-400 text-sm">views</span>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Card */}
                        <motion.div
                            ref={ctaRef}
                            className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                            {/* Glowing border effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00FF89]/20 via-transparent to-[#00FF89]/20 rounded-2xl blur-xl -z-10"></div>

                            {/* Pricing */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-5xl font-black text-[#00FF89] drop-shadow-lg">${Math.round(product.price || 0)}</div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <>
                                        <div className="text-xl text-gray-400 line-through">${Math.round(product.originalPrice)}</div>
                                        <div className="px-3 py-1 bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-bold rounded-full">
                                            Save ${Math.round(savingsAmount)}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Features List */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-[#00FF89]" />
                                    <span className="text-sm text-gray-300">Instant Access</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-[#00FF89]" />
                                    <span className="text-sm text-gray-300">30-Day Guarantee</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-5 h-5 text-[#00FF89]" />
                                    <span className="text-sm text-gray-300">24/7 Support</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-[#00FF89]" />
                                    <span className="text-sm text-gray-300">Lifetime Updates</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                {hasPurchased ? (
                                    <DSButton
                                        variant="primary"
                                        onClick={onDownload}
                                        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[#00FF89] to-[#00CC6A] hover:from-[#00CC6A] hover:to-[#00FF89] text-black shadow-lg transform hover:scale-105 transition-all">
                                        <Download className="w-5 h-5" />
                                        Access Your Product
                                    </DSButton>
                                ) : isOwner ? (
                                    <Link href="/seller/products">
                                        <DSButton
                                            variant="primary"
                                            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[#00FF89] to-[#00CC6A] hover:from-[#00CC6A] hover:to-[#00FF89] text-black shadow-lg transform hover:scale-105 transition-all">
                                            Manage Product
                                        </DSButton>
                                    </Link>
                                ) : (
                                    <>
                                        <DSButton
                                            variant="primary"
                                            onClick={onBuyNow}
                                            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[#00FF89] to-[#00CC6A] hover:from-[#00CC6A] hover:to-[#00FF89] text-black shadow-lg transform hover:scale-105 transition-all">
                                            🚀 Buy Now - Instant Access
                                        </DSButton>
                                        <DSButton
                                            variant="secondary"
                                            onClick={onAddToCart}
                                            disabled={inCart}
                                            className="w-full py-3 border-2 border-[#00FF89]/50 text-[#00FF89] hover:bg-[#00FF89]/10 hover:border-[#00FF89] disabled:opacity-50 font-semibold transition-all">
                                            <ShoppingCart className="w-5 h-5" />
                                            {inCart ? 'Already in Cart' : 'Add to Cart'}
                                        </DSButton>
                                    </>
                                )}
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-gray-700/50">
                                <div className="text-center">
                                    <div className="text-2xl">🛡️</div>
                                    <div className="text-xs text-gray-400">Secure</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl">⚡</div>
                                    <div className="text-xs text-gray-400">Instant</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl">💬</div>
                                    <div className="text-xs text-gray-400">Support</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Seller Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-4 p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                            <div className="w-14 h-14 bg-gradient-to-r from-[#00FF89] to-[#00CC6A] rounded-full flex items-center justify-center text-black text-xl font-bold shadow-lg">
                                {product.sellerId?.avatar ? (
                                    <img
                                        src={product.sellerId.avatar}
                                        alt={product.sellerId.fullName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-7 h-7" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-white text-lg">{product.sellerId?.fullName || 'Anonymous Seller'}</div>
                                <div className="text-sm text-gray-400">
                                    {product.sellerId?.stats?.totalProducts || 0} products • {product.sellerId?.stats?.totalSales || 0} sales
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${
                                                i < Math.floor(product.sellerId?.averageRating || 5)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Social Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center gap-6 py-4">
                            <button
                                onClick={onUpvote}
                                disabled={isUpvoting}
                                className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all transform hover:scale-105 border border-gray-700/50">
                                <ThumbsUp className={`w-5 h-5 ${upvoted ? 'text-[#00FF89]' : 'text-gray-400'}`} />
                                <span className="text-white font-medium">{product.upvotes || 0}</span>
                            </button>

                            <button
                                onClick={onLike}
                                className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all transform hover:scale-105 border border-gray-700/50">
                                <Heart className={`w-5 h-5 ${liked ? 'text-red-400 fill-current' : 'text-gray-400'}`} />
                                <span className="text-white font-medium">{product.favorites || 0}</span>
                            </button>

                            <button
                                onClick={onShare}
                                className="flex items-center gap-3 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all transform hover:scale-105 border border-gray-700/50 relative">
                                <Share2 className="w-5 h-5 text-gray-400" />
                                <span className="text-white font-medium">Share</span>
                                {showCopied && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black rounded-lg text-sm whitespace-nowrap">
                                        Copied!
                                    </motion.span>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Fullscreen Image Modal */}
            <AnimatePresence>
                {isImageFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setIsImageFullscreen(false)}>
                        <button
                            onClick={() => setIsImageFullscreen(false)}
                            className="absolute top-6 right-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-10">
                            <span className="text-white text-2xl">×</span>
                        </button>
                        <img
                            src={activeMedia?.src}
                            alt={activeMedia?.alt}
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}


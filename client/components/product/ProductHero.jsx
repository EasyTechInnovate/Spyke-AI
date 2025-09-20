'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import ProductPromoDisplay from '@/components/features/product/ProductPromoDisplay'
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
    ExternalLink
} from 'lucide-react'

// NEW: Central type badge color constants for easy theming
const TYPE_BADGE_STYLES = {
    // example custom types (extend as needed)
    prompt: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
    hiring: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
    // fallback / default (previous green style) with improved contrast on light mode
    default: { bg: 'bg-[#00FF89]/10', border: 'border-[#00FF89]/30', text: 'text-emerald-700 dark:text-[#00FF89]' }
}

// Accessible focus ring utility (can be abstracted later)
const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#121212]'

const getVideoEmbedInfo = (url) => {
    if (!url) return null

    // YouTube URL patterns
    const youtubeRegex =
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const youtubeMatch = url.match(youtubeRegex)

    if (youtubeMatch) {
        return {
            type: 'youtube',
            id: youtubeMatch[1],
            embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1`,
            thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
        }
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)/
    const vimeoMatch = url.match(vimeoRegex)

    if (vimeoMatch) {
        return {
            type: 'vimeo',
            id: vimeoMatch[1],
            embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1`,
            thumbnailUrl: null // Vimeo thumbnails require API call
        }
    }

    // Direct video file URLs
    if (url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i)) {
        return {
            type: 'direct',
            url: url,
            embedUrl: url,
            thumbnailUrl: null
        }
    }

    // Default to treating as direct video
    return {
        type: 'direct',
        url: url,
        embedUrl: url,
        thumbnailUrl: null
    }
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
    discountPercentage,
    savingsAmount,
    onAddToCart,
    onBuyNow,
    onLike,
    onUpvote,
    onDownload,
    onShare,
    ctaRef,
    onNavigateToReviews // Add new prop for navigation function
}) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(selectedImage || 0)
    const [isImageFullscreen, setIsImageFullscreen] = useState(false)
    const [videoError, setVideoError] = useState(false)
    const [showVideoModal, setShowVideoModal] = useState(false)
    const videoRef = useRef(null)
    const iframeRef = useRef(null)

    if (!product) return null

    // Get video embed information
    const videoInfo = product.previewVideo ? getVideoEmbedInfo(product.previewVideo) : null

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

    if (videoInfo) {
        mediaItems.push({
            type: 'video',
            src: product.previewVideo,
            poster: videoInfo.thumbnailUrl || product.images?.[0] || product.thumbnail,
            alt: `${product.title} - Preview Video`,
            videoInfo: videoInfo
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

    // Video controls for direct video files
    const togglePlayPause = () => {
        if (activeMedia?.videoInfo?.type === 'direct' && videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play().catch((error) => {
                    console.error('Video play failed:', error)
                    setVideoError(true)
                })
            }
            setIsPlaying(!isPlaying)
        } else if (activeMedia?.videoInfo?.type === 'youtube' || activeMedia?.videoInfo?.type === 'vimeo') {
            // For YouTube/Vimeo, open in modal
            setShowVideoModal(true)
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

    // Add handler for navigating to reviews
    const handleNavigateToReviews = () => {
        if (onNavigateToReviews) {
            onNavigateToReviews()
        }
    }

    return (
        <div className="bg-white dark:bg-[#121212]">
            <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Side - Media Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4">
                        {/* Main Media Display */}
                        <div
                            className="relative group"
                            role="region"
                            aria-roledescription="carousel"
                            aria-label={`${product.title} media gallery`}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowRight') {
                                    e.preventDefault()
                                    nextImage()
                                } else if (e.key === 'ArrowLeft') {
                                    e.preventDefault()
                                    prevImage()
                                } else if (e.key === 'Home') {
                                    e.preventDefault()
                                    setCurrentImageIndex(0)
                                } else if (e.key === 'End') {
                                    e.preventDefault()
                                    setCurrentImageIndex(mediaItems.length - 1)
                                }
                            }}>
                            <div
                                className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-80 sm:h-[520px] md:h-[640px] lg:h-[720px] bg-gray-100 dark:bg-[#1f1f1f] bg-center bg-cover"
                                style={{
                                    backgroundImage: `url(${(activeMedia?.type === 'image' ? activeMedia?.src : activeMedia?.poster) || product.thumbnail || ''})`
                                }}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full relative">
                                        {activeMedia?.type === 'video' ? (
                                            <div className="relative w-full h-full">
                                                {activeMedia?.videoInfo?.type === 'direct' ? (
                                                    <video
                                                        ref={videoRef}
                                                        src={activeMedia.src}
                                                        poster={activeMedia.poster}
                                                        className="absolute inset-0 w-full h-full object-contain object-center"
                                                        muted={isMuted}
                                                        playsInline
                                                        onPlay={() => setIsPlaying(true)}
                                                        onPause={() => setIsPlaying(false)}
                                                    />
                                                ) : (
                                                    <div
                                                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20"
                                                        onClick={() => setShowVideoModal(true)}>
                                                        <ExternalLink className="w-16 h-16 text-[#00FF89]" />
                                                    </div>
                                                )}

                                                {/* Simple Video Controls */}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={togglePlayPause}
                                                        className="w-16 h-16 bg-[#121212]/80 rounded-full flex items-center justify-center hover:bg-[#121212] transition-colors">
                                                        {isPlaying ? (
                                                            <Pause className="w-8 h-8 text-[#00FF89]" />
                                                        ) : (
                                                            <Play className="w-8 h-8 text-[#00FF89] ml-1" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={activeMedia?.src || product.thumbnail || '/images/placeholder-product.jpg'}
                                                alt={activeMedia?.alt || product.title}
                                                className="absolute inset-0 w-full h-full object-contain object-center"
                                                onError={(e) => {
                                                    e.target.src = product.thumbnail || '/images/placeholder-product.jpg'
                                                }}
                                            />
                                        )}

                                        {/* Simple Navigation */}
                                        {mediaItems.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    aria-label="Previous media"
                                                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1f1f1f]/90 rounded-full flex items-center justify-center transition-opacity hover:bg-white dark:hover:bg-[#1f1f1f] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 ${focusRing}`}>
                                                    <ChevronLeft className="w-5 h-5 text-[#121212] dark:text-[#00FF89]" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    aria-label="Next media"
                                                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1f1f1f]/90 rounded-full flex items-center justify-center transition-opacity hover:bg-white dark:hover:bg-[#1f1f1f] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 ${focusRing}`}>
                                                    <ChevronRight className="w-5 h-5 text-[#121212] dark:text-[#00FF89]" />
                                                </button>
                                            </>
                                        )}

                                        {/* Discount badge removed from media overlay to keep gallery clean. */}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Media Indicators */}
                            {mediaItems.length > 1 && (
                                <div
                                    className="flex justify-center mt-3 gap-2"
                                    role="tablist"
                                    aria-label="Media selection">
                                    {mediaItems.map((_, index) => (
                                        <button
                                            key={index}
                                            role="tab"
                                            aria-selected={currentImageIndex === index}
                                            aria-label={`Go to media ${index + 1} of ${mediaItems.length}`}
                                            aria-current={currentImageIndex === index ? 'true' : undefined}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-all ${focusRing} focus-visible:w-6 ${
                                                currentImageIndex === index
                                                    ? 'bg-[#00FF89] w-6'
                                                    : 'bg-[#6b7280] dark:bg-[#9ca3af] hover:bg-[#00FF89]/70'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {mediaItems.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {mediaItems.slice(0, 5).map((media, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                            currentImageIndex === index
                                                ? 'border-[#00FF89]'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-[#00FF89]/50'
                                        }`}>
                                        <img
                                            src={media.type === 'video' ? media.poster : media.src}
                                            alt={media.alt}
                                            className="w-full h-full object-cover"
                                        />
                                        {media.type === 'video' && (
                                            <div className="absolute inset-0 bg-[#121212]/30 flex items-center justify-center">
                                                <Play className="w-3 h-3 text-[#00FF89]" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Right Side - Product Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="space-y-6">
                        {/* Product Header */}
                        <div className="space-y-4">
                            {/* Category + Type Badges (split) */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Category Badge (improved contrast) */}
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#00FF89]/10 border border-[#00FF89]/30">
                                    <span className="text-sm font-medium text-emerald-700 dark:text-[#00FF89]">
                                        {product.category?.replace('_', ' ')}
                                    </span>
                                </div>
                                {/* Type Badge with color mapping */}
                                {(() => {
                                    const key = (product.type || '').toLowerCase()
                                    const style = TYPE_BADGE_STYLES[key] || TYPE_BADGE_STYLES.default
                                    return (
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full ${style.bg} border ${style.border}`}>
                                            <span className={`text-sm font-medium ${style.text}`}>{product.type}</span>
                                        </div>
                                    )
                                })()}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl lg:text-3xl font-bold text-[#121212] dark:text-[#00FF89] leading-tight">{product.title}</h1>

                            {/* Description */}
                            <p className="text-lg text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">{product.shortDescription}</p>

                            {/* Stats */}
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={handleNavigateToReviews}
                                    className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer group"
                                    title="View reviews">
                                    <Star className="w-4 h-4 text-[#FFC050] fill-current group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold text-[#121212] dark:text-[#00FF89] group-hover:underline">
                                        {product.averageRating?.toFixed(1) || '5.0'}
                                    </span>
                                    <span className="text-[#6b7280] dark:text-[#9ca3af] group-hover:underline">
                                        ({product.reviews?.length || 0} reviews)
                                    </span>
                                </button>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4 text-[#00FF89]" />
                                    <span className="font-semibold text-[#121212] dark:text-[#00FF89]">{product.sales || 0}</span>
                                    <span className="text-[#6b7280] dark:text-[#9ca3af]">sold</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4 text-[#00FF89]" />
                                    <span className="font-semibold text-[#121212] dark:text-[#00FF89]">{product.views || 0}</span>
                                    <span className="text-[#6b7280] dark:text-[#9ca3af]">views</span>
                                </div>
                            </div>

                            {/* Social Actions */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={onUpvote}
                                        disabled={isUpvoting}
                                        aria-pressed={!!upvoted}
                                        aria-label={upvoted ? 'Remove upvote' : 'Upvote product'}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${focusRing} ${
                                            upvoted
                                                ? 'bg-[#00FF89]/10 border-[#00FF89]/30 text-[#00FF89]'
                                                : 'bg-gray-50 dark:bg-[#1f1f1f] border-gray-200 dark:border-gray-700 text-[#6b7280] dark:text-[#9ca3af] hover:bg-[#00FF89]/5 hover:border-[#00FF89]/20'
                                        }`}>
                                        <ThumbsUp className="w-4 h-4" />
                                        <span className="font-medium text-sm">{product.upvotes || 0}</span>
                                    </button>

                                    <button
                                        onClick={onLike}
                                        aria-pressed={!!liked}
                                        aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${focusRing} ${
                                            liked
                                                ? 'bg-[#FFC050]/10 border-[#FFC050]/30 text-[#FFC050]'
                                                : 'bg-gray-50 dark:bg-[#1f1f1f] border-gray-200 dark:border-gray-700 text-[#6b7280] dark:text-[#9ca3af] hover:bg-[#FFC050]/5 hover:border-[#FFC050]/20'
                                        }`}>
                                        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                                        <span className="font-medium text-sm">{product.favorites || 0}</span>
                                    </button>
                                </div>

                                <button
                                    onClick={onShare}
                                    aria-label="Share product"
                                    className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#1f1f1f] hover:bg-[#00FF89]/10 hover:border-[#00FF89]/20 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 relative ${focusRing}`}>
                                    <Share2 className="w-4 h-4 text-[#121212] dark:text-[#00FF89]" />
                                    <span className="text-[#121212] dark:text-[#00FF89] font-medium text-sm">Share</span>
                                    {showCopied && (
                                        <motion.span
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#121212] dark:bg-[#00FF89] text-[#00FF89] dark:text-[#121212] rounded text-xs whitespace-nowrap">
                                            Copied!
                                        </motion.span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Pricing Card */}
                        <motion.div
                            ref={ctaRef}
                            className="relative bg-gray-50 dark:bg-[#1f1f1f] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            {/* Discount badge moved here for a cleaner layout */}
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 right-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFC050]/20 text-[#FFC050] text-sm font-medium border border-[#FFC050]/30">
                                        {discountPercentage}% OFF
                                    </span>
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="text-3xl font-bold text-[#00FF89]">${Math.round(product.price || 0)}</div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <>
                                        <div className="text-xl text-[#6b7280] dark:text-[#9ca3af] line-through">
                                            ${Math.round(product.originalPrice)}
                                        </div>
                                        <div className="px-2 py-1 bg-[#FFC050]/20 text-[#FFC050] text-sm font-medium rounded-full border border-[#FFC050]/30">
                                            Save ${Math.round(savingsAmount)}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Features List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#00FF89]" />
                                    <span className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Instant Access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[#00FF89]" />
                                    <span className="text-sm text-[#6b7280] dark:text-[#9ca3af]">30-Day Guarantee</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-[#00FF89]" />
                                    <span className="text-sm text-[#6b7280] dark:text-[#9ca3af]">24/7 Support</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#00FF89]" />
                                    <span className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Lifetime Updates</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {hasPurchased ? (
                                    <button
                                        onClick={onDownload}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] rounded-lg font-medium transition-colors">
                                        <Download className="w-4 h-4" />
                                        Access Your Product
                                    </button>
                                ) : isOwner ? (
                                    <Link href="/seller/products">
                                        <button className="w-full px-6 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] rounded-lg font-medium transition-colors">
                                            Manage Product
                                        </button>
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            onClick={onBuyNow}
                                            className="w-full px-6 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] rounded-lg font-medium transition-colors">
                                            Buy Now - Instant Access
                                        </button>
                                        <button
                                            onClick={onAddToCart}
                                            disabled={inCart}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-[#1f1f1f] hover:bg-[#00FF89]/10 text-[#121212] dark:text-[#00FF89] rounded-lg font-medium transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                            <ShoppingCart className="w-4 h-4" />
                                            {inCart ? 'Already in Cart' : 'Add to Cart'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Promocode Display */}
                        <ProductPromoDisplay 
                            product={product}
                        />

                        {/* Seller Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="w-12 h-12 bg-[#00FF89]/10 rounded-full flex items-center justify-center">
                                {product.sellerId?.avatar ? (
                                    <img
                                        src={product.sellerId.avatar}
                                        alt={product.sellerId.fullName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-6 h-6 text-[#00FF89]" />
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="font-medium text-[#121212] dark:text-[#00FF89]">
                                    {product.sellerId?.fullName || 'Anonymous Seller'}
                                </div>
                                <div className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                                    {product.sellerId?.stats?.totalProducts || 0} products • {product.sellerId?.stats?.totalSales || 0} sales
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${
                                                i < Math.floor(product.sellerId?.averageRating || 5)
                                                    ? 'text-[#FFC050] fill-current'
                                                    : 'text-[#6b7280] dark:text-[#9ca3af]'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <a
                                href={`/profile/${product.sellerId?.username || product.sellerId?._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gray-100 dark:bg-[#1f1f1f] hover:bg-[#00FF89]/10 hover:border-[#00FF89]/20 text-[#121212] dark:text-[#00FF89] rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700">
                                View Profile
                            </a>
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
                        className="fixed inset-0 z-50 bg-[#121212]/95 flex items-center justify-center p-4"
                        onClick={() => setIsImageFullscreen(false)}>
                        <button
                            onClick={() => setIsImageFullscreen(false)}
                            className="absolute top-6 right-6 w-10 h-10 bg-[#00FF89]/20 rounded-full flex items-center justify-center hover:bg-[#00FF89]/30 transition-colors">
                            <span className="text-[#00FF89] text-xl">×</span>
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

            {/* Video Modal */}
            <AnimatePresence>
                {showVideoModal && activeMedia?.videoInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#121212]/95 flex items-center justify-center p-4"
                        onClick={() => setShowVideoModal(false)}>
                        <button
                            onClick={() => setShowVideoModal(false)}
                            className="absolute top-6 right-6 w-10 h-10 bg-[#00FF89]/20 rounded-full flex items-center justify-center hover:bg-[#00FF89]/30 transition-colors">
                            <span className="text-[#00FF89] text-xl">×</span>
                        </button>
                        <iframe
                            ref={iframeRef}
                            src={activeMedia.videoInfo.embedUrl}
                            title="Video Player"
                            className="w-full max-w-4xl h-[70vh] rounded-lg"
                            frameBorder="0"
                            allow="autoplay; fullscreen"
                            allowFullScreen
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}


'use client'
import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, ThumbsUp, MoreVertical, Flag, CheckCircle, Calendar, MessageSquare, Camera, ChevronDown, ChevronUp, Filter, Eye } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/utils/date'
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
}
const RatingBar = memo(function RatingBar({ percentage, delay = 0 }) {
    const [width, setWidth] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    useEffect(() => {
        setWidth(0)
        setIsVisible(false)
        const visibilityTimer = setTimeout(() => {
            setIsVisible(true)
        }, 50)
        const widthTimer = setTimeout(
            () => {
                setWidth(percentage)
            },
            50 + delay * 100
        )
        return () => {
            clearTimeout(visibilityTimer)
            clearTimeout(widthTimer)
        }
    }, [percentage, delay])
    return (
        <div
            className="h-full bg-yellow-500 rounded-full transition-all duration-[800ms] ease-out group-hover:bg-yellow-400"
            style={{
                width: `${width}%`,
                opacity: isVisible ? 1 : 0,
                transition: 'width 800ms ease-out, opacity 200ms ease-out'
            }}
        />
    )
})
const ReviewCard = memo(function ReviewCard({ review, index, expandedReviews, showImages, onToggleReview, onToggleImages }) {
    const handleToggleReview = useCallback(() => {
        onToggleReview(review._id)
    }, [review._id, onToggleReview])
    const handleToggleImages = useCallback(() => {
        onToggleImages(review._id)
    }, [review._id, onToggleImages])
    return (
        <motion.div
            key={review._id || index}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="p-4 sm:p-6 bg-gray-900 rounded-lg sm:rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="flex items-start gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0 overflow-hidden">
                    {review.userId?.avatar ? (
                        <Image
                            src={review.userId.avatar}
                            alt={review.userId.name || 'User'}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        review.userId?.name?.[0]?.toUpperCase() || 'A'
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
                        <span className="font-medium text-white text-sm sm:text-base truncate">{review.userId?.name || 'Anonymous'}</span>
                        {review.isVerified && (
                            <span className="text-xs sm:text-sm text-[#00FF89] flex items-center gap-1 flex-shrink-0">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Verified</span>
                                <span className="xs:hidden">✓</span>
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn('w-4 h-4 sm:w-5 sm:h-5', i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-700')}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{formatDistanceToNow(review.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <button className="p-3 sm:p-2 hover:bg-gray-800 active:bg-gray-700 rounded-lg transition-colors touch-manipulation flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
            </div>
            {review.title && <h4 className="font-medium sm:font-semibold text-white mb-3 text-sm sm:text-base leading-tight">{review.title}</h4>}
            <div className="relative">
                <p
                    className={cn(
                        'text-gray-400 leading-relaxed text-sm sm:text-base mb-3',
                        !expandedReviews[review._id] && review.comment?.length > 150 && 'line-clamp-3 sm:line-clamp-4'
                    )}>
                    {review.comment}
                </p>
                {review.comment?.length > 150 && (
                    <button
                        onClick={handleToggleReview}
                        className="text-brand-primary text-sm hover:underline active:underline flex items-center gap-1 touch-manipulation min-h-[44px] py-2 -ml-2 pl-2 pr-4">
                        {expandedReviews[review._id] ? (
                            <>
                                Show less <ChevronUp className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Read more <ChevronDown className="w-4 h-4" />
                            </>
                        )}
                    </button>
                )}
            </div>
            {review.images && review.images.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={handleToggleImages}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white active:text-white transition-colors mb-3 touch-manipulation min-h-[44px] py-2 -ml-2 pl-2 pr-4">
                        <Camera className="w-4 h-4" />
                        <span>
                            {review.images.length} Photo{review.images.length !== 1 ? 's' : ''}
                        </span>
                        {showImages[review._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showImages[review._id] && (
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-2">
                            {review.images.map((image, idx) => (
                                <div
                                    key={idx}
                                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 touch-manipulation min-h-[100px] sm:min-h-[80px]">
                                    <Image
                                        src={image}
                                        alt={`Review image ${idx + 1}`}
                                        fill
                                        className="object-cover hover:scale-105 active:scale-105 transition-transform cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {review.helpfulCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                    <div className="flex items-center gap-4">
                        {review.helpfulCount > 0 && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <ThumbsUp className="w-4 h-4" />
                                <span className="text-sm">{review.helpfulCount} helpful</span>
                            </div>
                        )}
                    </div>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-gray-400 active:text-gray-400 transition-colors touch-manipulation text-sm min-h-[44px] py-2 px-3 -mx-3">
                        <Flag className="w-4 h-4" />
                        <span>Report</span>
                    </button>
                </div>
            )}
            {review.sellerResponse && (
                <div className="mt-4 p-4 sm:p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-brand-primary" />
                        <span className="text-sm font-medium text-white">Seller Response</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{review.sellerResponse}</p>
                </div>
            )}
        </motion.div>
    )
})
const ReviewsList = memo(function ReviewsList({ reviews = [], totalReviews = 0, averageRating = 0, reviewStats = {} }) {
    const [expandedReviews, setExpandedReviews] = useState({})
    const [sortBy, setSortBy] = useState('newest')
    const [filterRating, setFilterRating] = useState('all')
    const [showImages, setShowImages] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [reviewsPerPage] = useState(5) 
    const handleToggleReview = useCallback((reviewId) => {
        setExpandedReviews((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }))
    }, [])
    const handleToggleImages = useCallback((reviewId) => {
        setShowImages((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }))
    }, [])
    const handleSortChange = useCallback((e) => {
        setSortBy(e.target.value)
    }, [])
    const handleFilterRatingChange = useCallback((rating) => {
        setFilterRating(rating)
    }, [])
    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage)
    }, [])
    const calculatedStats = useMemo(() => {
        if (Object.keys(reviewStats).length > 0) return reviewStats
        const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        reviews.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) {
                stats[Math.floor(review.rating)]++
            }
        })
        return stats
    }, [reviews, reviewStats])
    const filteredAndSortedReviews = useMemo(() => {
        const filtered = filterRating === 'all' ? reviews : reviews.filter((review) => review.rating === parseInt(filterRating))
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt)
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt)
                case 'highest':
                    return b.rating - a.rating
                case 'lowest':
                    return a.rating - b.rating
                case 'helpful':
                    return (b.helpfulCount || 0) - (a.helpfulCount || 0)
                default:
                    return 0
            }
        })
    }, [reviews, sortBy, filterRating])
    const paginatedReviews = useMemo(() => {
        const startIndex = (currentPage - 1) * reviewsPerPage
        const endIndex = startIndex + reviewsPerPage
        return filteredAndSortedReviews.slice(startIndex, endIndex)
    }, [filteredAndSortedReviews, currentPage, reviewsPerPage])
    const totalPages = Math.ceil(filteredAndSortedReviews.length / reviewsPerPage)
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1
    useEffect(() => {
        setCurrentPage(1)
    }, [sortBy, filterRating])
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
                <div className="flex flex-col xs:flex-row xs:items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 text-xs sm:text-sm">
                            {filteredAndSortedReviews.length} of {reviews.length} reviews
                        </span>
                    </div>
                    {filterRating !== 'all' && (
                        <button
                            onClick={() => handleFilterRatingChange('all')}
                            className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs hover:bg-gray-700 active:bg-gray-600 transition-colors touch-manipulation min-h-[44px]">
                            Clear ({filterRating}★)
                        </button>
                    )}
                </div>
                <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="px-4 py-3 sm:px-4 sm:py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:border-brand-primary focus:outline-none touch-manipulation w-full xs:w-auto min-h-[48px] sm:min-h-[40px]">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                    <option value="helpful">Most Helpful</option>
                </select>
            </div>
            {paginatedReviews.length > 0 ? (
                <>
                    <div className="space-y-4 max-h-none sm:max-h-[800px] sm:overflow-y-auto sm:pr-2 sm:scrollbar-thin sm:scrollbar-thumb-gray-600 sm:scrollbar-track-gray-800">
                        {paginatedReviews.map((review, index) => (
                            <ReviewCard
                                key={review._id || index}
                                review={review}
                                index={index}
                                expandedReviews={expandedReviews}
                                showImages={showImages}
                                onToggleReview={handleToggleReview}
                                onToggleImages={handleToggleImages}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-800">
                            <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                                Page {currentPage} of {totalPages} • {paginatedReviews.length} reviews
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={!hasPrevPage}
                                    className="px-4 py-3 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[48px] min-w-[64px]">
                                    Prev
                                </button>
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                        let pageNum
                                        if (totalPages <= 3) {
                                            pageNum = i + 1
                                        } else if (currentPage <= 2) {
                                            pageNum = i + 1
                                        } else if (currentPage >= totalPages - 1) {
                                            pageNum = totalPages - 2 + i
                                        } else {
                                            pageNum = currentPage - 1 + i
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={cn(
                                                    'w-12 h-12 sm:w-10 sm:h-10 text-sm rounded-lg transition-colors touch-manipulation font-medium',
                                                    currentPage === pageNum
                                                        ? 'bg-brand-primary text-black'
                                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-600'
                                                )}>
                                                {pageNum}
                                            </button>
                                        )
                                    })}
                                </div>
                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={!hasNextPage}
                                    className="px-4 py-3 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[48px] min-w-[64px]">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 sm:py-16">
                    <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4 sm:mb-6" />
                    <p className="text-gray-500 mb-2 text-base sm:text-lg">No reviews yet</p>
                    <p className="text-sm sm:text-base text-gray-600">Be the first to share your experience!</p>
                </div>
            )}
        </div>
    )
})
export default ReviewsList
'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, ThumbsUp, MoreVertical, Flag, 
  CheckCircle, Calendar, MessageSquare, Camera,
  ChevronDown, ChevronUp, Filter, Eye
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/utils/date'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// Rating Bar Component
function RatingBar({ percentage, delay = 0 }) {
  const [width, setWidth] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Reset on percentage change
    setWidth(0)
    setIsVisible(false)
    
    // Small delay to ensure DOM is ready
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true)
    }, 50)
    
    // Animate width after visibility
    const widthTimer = setTimeout(() => {
      setWidth(percentage)
    }, 50 + (delay * 100))
    
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
}

export default function ReviewsList({ reviews = [], totalReviews = 0, averageRating = 0, reviewStats = {} }) {
  const [expandedReviews, setExpandedReviews] = useState({})
  const [sortBy, setSortBy] = useState('newest')
  const [filterRating, setFilterRating] = useState('all')
  const [showImages, setShowImages] = useState({})

  // Calculate review stats from reviews if not provided
  const calculatedStats = useMemo(() => {
    if (Object.keys(reviewStats).length > 0) return reviewStats
    
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        stats[Math.floor(review.rating)]++
      }
    })
    return stats
  }, [reviews, reviewStats])

  // Sort reviews
  const sortedReviews = useMemo(() => {
    const filtered = filterRating === 'all' 
      ? reviews 
      : reviews.filter(review => review.rating === parseInt(filterRating))
    
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

  const toggleReview = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  const toggleImages = (reviewId) => {
    setShowImages(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="text-center mb-6 md:mb-0">
            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-6 h-6",
                    i < Math.floor(averageRating)
                      ? "text-yellow-500 fill-current"
                      : "text-gray-700"
                  )}
                />
              ))}
            </div>
            <p className="text-gray-400">
              Based on {totalReviews || reviews.length} {(totalReviews || reviews.length) === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = calculatedStats[rating] || 0
              const actualTotal = totalReviews || reviews.length
              const percentage = actualTotal > 0 ? (count / actualTotal) * 100 : 0
              
              return (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating.toString() ? 'all' : rating.toString())}
                  className={cn(
                    "w-full flex items-center gap-3 group transition-all cursor-pointer",
                    filterRating === rating.toString() && "scale-105"
                  )}
                >
                  <span className="text-sm text-gray-400 w-12">{rating} star</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative group-hover:bg-gray-700 transition-colors">
                    <RatingBar percentage={percentage} delay={5 - rating} />
                  </div>
                  <span className={cn(
                    "text-sm w-12 text-right transition-all",
                    filterRating === rating.toString() ? "text-brand-primary font-semibold" : "text-gray-400 group-hover:text-gray-300 group-hover:underline"
                  )}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-gray-400" />
          {filterRating !== 'all' && (
            <button
              onClick={() => setFilterRating('all')}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Clear filter ({filterRating} star)
            </button>
          )}
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 sm:px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-xs sm:text-sm focus:border-brand-primary focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      {sortedReviews.length > 0 ? (
        <div className="space-y-4">
          {sortedReviews.map((review, index) => (
            <motion.div
              key={review._id || index}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="p-4 sm:p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* User Avatar */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                    {review.user?.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                      <span className="font-medium sm:font-semibold text-white text-sm sm:text-base">
                        {review.user?.name || 'Anonymous'}
                      </span>
                      {review.verified && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">Verified Purchase</span>
                          <span className="sm:hidden">Verified</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(review.createdAt)}
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < review.rating
                                ? "text-yellow-500 fill-current"
                                : "text-gray-700"
                            )}
                          />
                        ))}
                      </div>
                      {review.viewCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {review.viewCount} views
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Review Title */}
              {review.title && (
                <h4 className="font-semibold text-white mb-2">{review.title}</h4>
              )}

              {/* Review Content */}
              <div className="relative">
                <p className={cn(
                  "text-gray-400 leading-relaxed",
                  !expandedReviews[review._id] && review.comment?.length > 200 && "line-clamp-3"
                )}>
                  {review.comment}
                </p>
                
                {review.comment?.length > 200 && (
                  <button
                    onClick={() => toggleReview(review._id)}
                    className="mt-2 text-brand-primary text-sm hover:underline flex items-center gap-1"
                  >
                    {expandedReviews[review._id] ? (
                      <>Show less <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Read more <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleImages(review._id)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3"
                  >
                    <Camera className="w-4 h-4" />
                    {review.images.length} {review.images.length === 1 ? 'Photo' : 'Photos'}
                    {showImages[review._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showImages[review._id] && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {review.images.map((image, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                          <Image
                            src={image}
                            alt={`Review image ${idx + 1}`}
                            fill
                            className="object-cover hover:scale-110 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Review Actions */}
              {(review.helpfulCount > 0 || review.viewCount > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {review.helpfulCount > 0 && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{review.helpfulCount} found this helpful</span>
                      </div>
                    )}
                  </div>
                  
                  <button className="flex items-center gap-2 text-gray-500 hover:text-gray-400 transition-colors">
                    <Flag className="w-4 h-4" />
                    <span className="text-sm">Report</span>
                  </button>
                </div>
              )}

              {/* Seller Response */}
              {review.sellerResponse && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm font-medium text-white">Seller Response</span>
                  </div>
                  <p className="text-sm text-gray-400">{review.sellerResponse}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No reviews yet</p>
          <p className="text-sm text-gray-600">Be the first to share your experience!</p>
        </div>
      )}
    </div>
  )
}
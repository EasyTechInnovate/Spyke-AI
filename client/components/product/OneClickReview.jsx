'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from '@/lib/utils/toast'

export default function OneClickReview({ 
  productId,
  productTitle,
  onReviewSubmit,
  onClose,
  className 
}) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState('')

  const handleRatingClick = useCallback(async (value) => {
    setRating(value)
    
    // If 5 stars, submit immediately
    if (value === 5 && !showComment) {
      setIsSubmitting(true)
      try {
        await onReviewSubmit({
          rating: value,
          comment: 'Excellent product!',
          title: 'Excellent!'
        })
        toast.success('Thanks for your 5-star review!')
        onClose?.()
      } catch (error) {
        const errorMessage = error.message || error.response?.data?.message || 'Failed to submit review'
        toast.error(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // For less than 5 stars, show comment field
      setShowComment(true)
    }
  }, [showComment, onReviewSubmit, onClose])

  const handleSubmit = useCallback(async () => {
    if (!rating || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onReviewSubmit({
        rating,
        comment: comment.trim() || `${rating}-star rating`,
        title: comment.trim().slice(0, 50) || `${rating} stars`
      })
      toast.success('Review submitted!')
      onClose?.()
    } catch (error) {
      const errorMessage = error.message || error.response?.data?.message || 'Failed to submit review'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [rating, comment, onReviewSubmit, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Quick Review</h3>
          <p className="text-sm text-gray-400 line-clamp-1">{productTitle}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* One-click star rating */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-gray-800 rounded-full p-2 gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={isSubmitting}
              className="p-2 transition-all disabled:opacity-50"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-all",
                  (hoveredRating || rating) >= value
                    ? "text-yellow-500 fill-current drop-shadow-glow"
                    : "text-gray-600"
                )}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Helper text */}
      {!showComment && !isSubmitting && (
        <p className="text-center text-sm text-gray-500">
          Tap to rate • 5 stars = instant submit
        </p>
      )}

      {/* Optional comment for < 5 stars */}
      <AnimatePresence>
        {showComment && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-700">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What could be better? (optional)"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors resize-none"
                rows={2}
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "w-full mt-3 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                  isSubmitting
                    ? "bg-gray-700 text-gray-500"
                    : "bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90"
                )}
              >
                Submit {rating}-Star Review
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.5));
        }
      `}</style>
    </motion.div>
  )
}
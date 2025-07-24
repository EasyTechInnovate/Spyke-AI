'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from '@/lib/utils/toast'

export default function QuickReview({ 
  productId,
  onReviewSubmit,
  className 
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef(null)

  const handleRatingClick = useCallback((value) => {
    setRating(value)
    setIsExpanded(true)
    // Focus input after animation
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (rating === 0 || !comment.trim() || comment.trim().length < 10) return
    
    setIsSubmitting(true)
    
    try {
      await onReviewSubmit({
        rating,
        comment: comment.trim(),
        title: comment.slice(0, 50).trim()
      })
      
      // Success animation then reset
      toast.success('Thanks for your review!')
      setTimeout(() => {
        setRating(0)
        setComment('')
        setIsExpanded(false)
      }, 1000)
    } catch (error) {
      // Show the actual error message from API
      const errorMessage = error.message || error.response?.data?.message || 'Failed to submit review'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [rating, comment, onReviewSubmit])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  return (
    <motion.div
      className={cn(
        "bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-800 transition-all",
        isExpanded && "bg-gray-900 border-brand-primary/30",
        className
      )}
      animate={{ 
        backgroundColor: isExpanded ? 'rgb(17 24 39)' : 'rgb(17 24 39 / 0.5)'
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Minimal header */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-gray-400">Rate this product</p>
          
          {/* Inline Stars */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingClick(value)}
                className="p-1 transition-all hover:scale-125 focus:scale-125 focus:outline-none"
              >
                <Star
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    rating >= value
                      ? "text-yellow-500 fill-current drop-shadow-glow"
                      : "text-gray-600 hover:text-gray-500"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Expandable Input */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Why ${rating <= 2 ? 'only' : ''} ${rating} star${rating === 1 ? '' : 's'}?`}
                  className="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-all"
                  maxLength={200}
                />
                
                {/* Floating submit button */}
                <AnimatePresence>
                  {comment.trim().length >= 10 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all",
                        isSubmitting
                          ? "bg-gray-700"
                          : "bg-brand-primary hover:bg-brand-primary/90 hover:scale-110"
                      )}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <Send className="w-4 h-4 text-brand-primary-text" />
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Character count */}
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Press Enter to submit
                </span>
                <span className={cn(
                  "text-xs transition-colors",
                  comment.length < 10 
                    ? "text-gray-600" 
                    : comment.length > 180 
                      ? "text-yellow-600" 
                      : "text-gray-500"
                )}>
                  {comment.length}/200
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <style jsx>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.4));
        }
      `}</style>
    </motion.div>
  )
}
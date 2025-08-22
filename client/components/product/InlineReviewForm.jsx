'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from '@/lib/utils/toast'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function InlineReviewForm({ 
  productId,
  onReviewSubmit,
  onCancel,
  className
}) {
    // Inline notification state
    const [notification, setNotification] = useState(null)

    // Show inline notification messages  
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000)
    }

    // Clear notification
    const clearNotification = () => setNotification(null)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (rating === 0 || !comment.trim()) return
    
    setIsSubmitting(true)
    
    try {
      await onReviewSubmit({
        rating,
        comment: comment.trim(),
        title: comment.slice(0, 50).trim()
      })
      
      // Reset form
      setRating(0)
      setComment('')
      showMessage('Review submitted!', 'success')
    } catch (error) {
      // Show the actual error message from API
      const errorMessage = error.message || error.response?.data?.message || 'Failed to submit review'
      showMessage(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [rating, comment, onReviewSubmit])

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gray-900 rounded-xl p-4 sm:p-6 border transition-all",
        isFocused ? "border-brand-primary/50 shadow-lg shadow-brand-primary/10" : "border-gray-800",
        className
      )}
      onSubmit={handleSubmit}
    >
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-medium text-white text-sm sm:text-base">Write a Review</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Compact Star Rating */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-6 h-6 transition-colors",
                  rating >= value
                    ? "text-yellow-500 fill-current"
                    : "text-gray-700"
                )}
              />
            </button>
          ))}
        </div>
        <AnimatePresence>
          {rating > 0 && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sm text-gray-400"
            >
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Compact Comment Field */}
      <div className="relative">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Share your thoughts..."
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm sm:text-base text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors resize-none pr-12"
          rows={3}
          maxLength={300}
        />
        
        {/* Submit Button - Floating */}
        <AnimatePresence>
          {(rating > 0 && comment.trim().length > 10) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "absolute bottom-2 right-2 p-2 rounded-lg transition-all",
                isSubmitting
                  ? "bg-gray-700 text-gray-500"
                  : "bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          {comment.length}/300 characters
        </span>
        {rating > 0 && comment.length < 10 && comment.length > 0 && (
          <span className="text-xs text-yellow-600">
            {10 - comment.length} more characters needed
          </span>
        )}
      </div>
    </motion.form>
  )
}
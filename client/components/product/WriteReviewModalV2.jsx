'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Camera, X, Send, Loader2 } from 'lucide-react'
import Modal from '@/components/shared/ui/Modal'
import { cn } from '@/lib/utils'
import toast from '@/lib/utils/toast'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
// Star rating descriptions
const ratingDescriptions = {
  1: 'Poor',
  2: 'Fair', 
  3: 'Good',
  4: 'Great',
  5: 'Excellent'
}

export default function WriteReviewModalV2({ 
  isOpen, 
  onClose, 
  productTitle,
  productId,
  onReviewSubmit 
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
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)

  // Auto-expand textarea
  const adjustTextareaHeight = useCallback((textarea) => {
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  // Generate title from comment (first 50 chars or first sentence)
  const generateTitle = useCallback((text) => {
    if (!text) return ''
    const firstSentence = text.match(/^[^.!?]+[.!?]/)?.[0] || text
    return firstSentence.slice(0, 50).trim() + (firstSentence.length > 50 ? '...' : '')
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      // Shake animation on stars
      const starsContainer = document.getElementById('stars-container')
      starsContainer?.classList.add('animate-shake')
      setTimeout(() => starsContainer?.classList.remove('animate-shake'), 500)
      return
    }
    
    if (!comment.trim() || comment.trim().length < 10) {
      showMessage('Please write at least 10 characters', 'error')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const reviewData = {
        rating,
        comment: comment.trim(),
        title: generateTitle(comment),
        wouldRecommend: rating >= 4, // Auto-recommend for 4+ stars
        images: images.map(img => img.file)
      }
      
      await onReviewSubmit(reviewData)
      
      // Reset form
      setRating(0)
      setComment('')
      setImages([])
      setShowImageUpload(false)
      
      onClose()
    } catch (error) {
      // Show the actual error message from API
      const errorMessage = error.message || error.response?.data?.message || 'Failed to submit review'
      showMessage(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [rating, comment, images, generateTitle, onReviewSubmit, onClose])

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.slice(0, 3 - images.length) // Max 3 images
    
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    
    setImages([...images, ...newImages])
  }, [images])

  const removeImage = useCallback((index) => {
    const newImages = [...images]
    URL.revokeObjectURL(newImages[index].preview)
    newImages.splice(index, 1)
    setImages(newImages)
  }, [images])

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className="max-w-md"
      showCloseButton={false}
    >
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            
      <form onSubmit={handleSubmit} className="relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex-1 mr-2">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Write a Review</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-1">{productTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Rating */}
        <div className="mb-4 sm:mb-6">
          <div 
            id="stars-container"
            className="flex items-center justify-center gap-1 sm:gap-2"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-all hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 transition-all",
                    (hoveredRating || rating) >= value
                      ? "text-yellow-500 fill-current"
                      : "text-gray-700 stroke-[1.5]"
                  )}
                />
              </button>
            ))}
          </div>
          
          {/* Rating text */}
          <AnimatePresence mode="wait">
            {(rating > 0 || hoveredRating > 0) && (
              <motion.p
                key={hoveredRating || rating}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-center mt-2 text-sm font-medium text-gray-300"
              >
                {ratingDescriptions[hoveredRating || rating]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value)
              adjustTextareaHeight(e.target)
            }}
            onFocus={(e) => adjustTextareaHeight(e.target)}
            placeholder="Share your experience with this product..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors resize-none min-h-[80px] sm:min-h-[100px]"
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              onClick={() => setShowImageUpload(!showImageUpload)}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                images.length > 0 
                  ? "text-brand-primary" 
                  : "text-gray-500 hover:text-gray-400"
              )}
            >
              <Camera className="w-4 h-4" />
              {images.length > 0 ? `${images.length} photo${images.length > 1 ? 's' : ''}` : 'Add photos'}
            </button>
            <span className="text-xs text-gray-500">
              {comment.length}/500
            </span>
          </div>
        </div>

        {/* Image Upload (Progressive) */}
        <AnimatePresence>
          {showImageUpload && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex gap-2">
                {/* Image Previews */}
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                
                {/* Add Image Button */}
                {images.length < 3 && (
                  <label className="w-20 h-20 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Camera className="w-6 h-6 text-gray-600" />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Up to 3 photos</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          className={cn(
            "w-full py-3 sm:py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base mt-4",
            isSubmitting || rating === 0 || comment.trim().length < 10
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90 sm:transform sm:hover:scale-[1.02]"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Review
            </>
          )}
        </button>
      </form>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </Modal>
  )
}
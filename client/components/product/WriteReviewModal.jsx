'use client'

import { useState, useCallback } from 'react'
import { Star, Upload, X } from 'lucide-react'
import Modal from '@/components/shared/ui/Modal'
import { cn } from '@/lib/utils'
import toast from '@/lib/utils/toast'

export default function WriteReviewModal({ 
  isOpen, 
  onClose, 
  productTitle,
  productId,
  onReviewSubmit 
}) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [review, setReview] = useState('')
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recommend, setRecommend] = useState(true)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    if (!title.trim()) {
      toast.error('Please add a title for your review')
      return
    }
    
    if (!review.trim() || review.length < 20) {
      toast.error('Please write at least 20 characters for your review')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const reviewData = {
        rating,
        comment: review.trim(),
        title: title.trim(),
        wouldRecommend: recommend
      }
      
      await onReviewSubmit(reviewData)
      
      // Reset form
      setRating(0)
      setTitle('')
      setReview('')
      setImages([])
      setRecommend(true)
      
      toast.success('Review submitted successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [rating, title, review, recommend, images, productId, onReviewSubmit, onClose])

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })
    
    if (images.length + validFiles.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    
    // Create preview URLs
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Write a Review"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Reviewing</p>
          <p className="font-medium text-white">{productTitle}</p>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    (hoveredRating || rating) >= star
                      ? "text-yellow-500 fill-current"
                      : "text-gray-600"
                  )}
                />
              </button>
            ))}
            <span className="ml-3 text-gray-400">
              {rating > 0 && (
                <>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Review Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
            maxLength={100}
          />
          <p className="mt-1 text-xs text-gray-500">{title.length}/100</p>
        </div>

        {/* Review Content */}
        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-300 mb-2">
            Your Review *
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell others what you think about this product. What did you like or dislike?"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors resize-none"
            rows={5}
            maxLength={1000}
          />
          <p className="mt-1 text-xs text-gray-500">{review.length}/1000 (min 20 characters)</p>
        </div>

        {/* Would Recommend */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Would you recommend this product?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="recommend"
                value="yes"
                checked={recommend === true}
                onChange={() => setRecommend(true)}
                className="mr-2 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-gray-300">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="recommend"
                value="no"
                checked={recommend === false}
                onChange={() => setRecommend(false)}
                className="mr-2 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-gray-300">No</span>
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Add Photos (Optional)
          </label>
          
          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {images.length < 5 && (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-gray-600 transition-colors">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Click to upload images</p>
                <p className="text-xs text-gray-500 mt-1">Max 5 images, 5MB each</p>
              </div>
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "flex-1 px-6 py-3 bg-brand-primary text-brand-primary-text font-semibold rounded-xl transition-all",
              isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-brand-primary/90"
            )}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
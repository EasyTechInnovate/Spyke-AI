'use client'

import React, { useState, useCallback, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, Loader2, Camera, X, Edit3, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReviewValidation } from '@/hooks/useReviewValidation'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
import Modal from '@/components/shared/ui/Modal'

const VARIANTS = {
    quickReview: {
        type: 'quickReview',
        showTitle: false,
        showImages: false,
        showRecommendation: false,
        inline: true,
        expandable: true,
        submitOnEnter: true
    },
    inlineForm: {
        type: 'inlineForm',
        showTitle: false,
        showImages: false,
        showRecommendation: false,
        inline: true,
        expandable: false,
        submitOnEnter: false
    },
    fullModal: {
        type: 'fullModal',
        showTitle: true,
        showImages: true,
        showRecommendation: true,
        inline: false,
        expandable: false,
        submitOnEnter: false,
        modal: true
    },
    modernModal: {
        type: 'modernModal',
        showTitle: false,
        showImages: true,
        showRecommendation: false,
        inline: false,
        expandable: false,
        submitOnEnter: false,
        modal: true,
        autoTitle: true
    },
    oneClick: {
        type: 'oneClick',
        showTitle: false,
        showImages: false,
        showRecommendation: false,
        inline: true,
        expandable: false,
        submitOnEnter: false,
        instantSubmit: true
    }
}

// Memoized Star Rating Component
const StarRating = memo(function StarRating({ 
    rating, 
    hoveredRating, 
    size = 'md', 
    isSubmitting, 
    onRatingClick, 
    onMouseEnter, 
    onMouseLeave 
}) {
    const sizeClasses = {
        sm: 'w-5 h-5 sm:w-6 sm:h-6',
        md: 'w-6 h-6 sm:w-7 sm:h-7',
        lg: 'w-8 h-8 sm:w-9 sm:h-9',
        xl: 'w-10 h-10 sm:w-12 sm:h-12'
    }

    // Mobile-friendly touch target sizes (minimum 44px)
    const touchClasses = {
        sm: 'p-2.5 sm:p-2',
        md: 'p-3 sm:p-2.5',
        lg: 'p-3.5 sm:p-3',
        xl: 'p-4 sm:p-3.5'
    }

    const getRatingDescription = (rating) => {
        const descriptions = {
            1: 'Poor',
            2: 'Fair', 
            3: 'Good',
            4: 'Great',
            5: 'Excellent'
        }
        return descriptions[rating] || ''
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div
                className="flex items-center justify-center gap-1 sm:gap-1"
                onMouseLeave={onMouseLeave}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onRatingClick(value)}
                        onMouseEnter={() => onMouseEnter(value)}
                        disabled={isSubmitting}
                        className={cn(
                            `${touchClasses[size]} transition-all hover:scale-110 focus:scale-110 focus:outline-none disabled:opacity-50 touch-manipulation active:scale-95 min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center`,
                            'rounded-full hover:bg-gray-800/50'
                        )}>
                        <Star
                            className={cn(
                                `${sizeClasses[size]} transition-colors duration-200`,
                                (hoveredRating || rating) >= value ? 'text-yellow-500 fill-current drop-shadow-glow' : 'text-gray-600'
                            )}
                        />
                    </button>
                ))}
            </div>

            {(rating > 0 || hoveredRating > 0) && (
                <span className="text-sm sm:text-base text-gray-400 select-none text-center sm:text-left font-medium">
                    {getRatingDescription(hoveredRating || rating)}
                </span>
            )}
        </div>
    )
})

// Memoized Image Upload Component
const ImageUpload = memo(function ImageUpload({ 
    images, 
    showImageUpload, 
    requirements, 
    onImageUpload, 
    onRemoveImage, 
    onToggleImageUpload 
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <button
                    type="button"
                    onClick={onToggleImageUpload}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 touch-manipulation min-h-[44px] py-2 -mx-2 px-2">
                    <Camera className="w-4 h-4" />
                    {images.length > 0 ? `${images.length} photo${images.length > 1 ? 's' : ''}` : 'Add photos'}
                </button>
            </div>

            <AnimatePresence>
                {showImageUpload && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
                            {images.map((img, index) => (
                                <div
                                    key={index}
                                    className="relative group flex-shrink-0">
                                    <img
                                        src={img.preview}
                                        alt={`Upload ${index + 1}`}
                                        className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onRemoveImage(index)}
                                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center">
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}

                            {images.length < (requirements.images?.maxCount || 5) && (
                                <label className="w-24 h-24 sm:w-20 sm:h-20 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-600 transition-colors flex-shrink-0 touch-manipulation">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={onImageUpload}
                                        className="hidden"
                                    />
                                    <Camera className="w-6 h-6 text-gray-600" />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            Up to {requirements.images?.maxCount || 5} photos, {Math.round((requirements.images?.maxSize || 5242880) / 1048576)}MB each
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
})

// Memoized Confirmation Dialog
const ConfirmationDialog = memo(function ConfirmationDialog({ 
    isOpen, 
    rating, 
    isSubmitting, 
    onClose, 
    onConfirm 
}) {
    if (!isOpen) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 max-w-sm w-full border border-gray-700"
                onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Submit {rating}-Star Rating?</h3>
                    <p className="text-gray-400 text-sm mb-6">
                        You can submit just your star rating without a written review. You can always add a comment later.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors touch-manipulation min-h-[48px]">
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 touch-manipulation min-h-[48px]">
                            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
})

// Main UnifiedReviewForm component with memoization
const UnifiedReviewForm = memo(function UnifiedReviewForm({
    // Core props
    productId,
    productTitle,
    onReviewSubmit,
    onClose,
    onCancel,

    // Variant selection
    variant = 'quickReview', // quickReview, inlineForm, fullModal, modernModal, oneClick

    // Modal props (when modal variant)
    isOpen = false,

    // Customization
    className,
    placeholder,
    showHeader = true,

    // Override variant settings
    customConfig = {}
}) {
    // Merge variant config with custom overrides
    const config = { ...VARIANTS[variant], ...customConfig }

    // Centralized validation
    const {
        validate,
        validateField,
        prepareForSubmission,
        errors,
        hasErrors,
        clearFieldError,
        getFieldCharacterCount,
        getValidationRequirements,
        parseError
    } = useReviewValidation(config.type)

    // Component state
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [title, setTitle] = useState('')
    const [wouldRecommend, setWouldRecommend] = useState(true)
    const [images, setImages] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isExpanded, setIsExpanded] = useState(!config.expandable)
    const [showImageUpload, setShowImageUpload] = useState(false)
    const [notification, setNotification] = useState(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const inputRef = useRef(null)
    const textareaRef = useRef(null)

    // Get validation requirements
    const requirements = getValidationRequirements()

    // Memoized callbacks to prevent unnecessary re-renders
    const showMessage = useCallback((message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }, [])

    const clearNotification = useCallback(() => setNotification(null), [])

    const generateTitle = useCallback((text) => {
        if (!text) return ''
        const firstSentence = text.match(/^[^.!?]+[.!?]/)?.[0] || text
        return firstSentence.slice(0, 50).trim() + (firstSentence.length > 50 ? '...' : '')
    }, [])

    const handleRatingClick = useCallback(
        async (value) => {
            setRating(value)
            clearFieldError('rating')
            validateField('rating', value, { rating: value, comment, title })

            // One-click instant submit for 5 stars
            if (config.instantSubmit && value === 5) {
                setIsSubmitting(true)
                try {
                    await onReviewSubmit({
                        rating: value,
                        comment: 'Excellent product!',
                        title: 'Excellent!'
                    })
                    showMessage('Thanks for your 5-star review!', 'success')
                    onClose?.()
                } catch (error) {
                    const errorMessage = parseError(error)
                    showMessage(errorMessage, 'error')
                } finally {
                    setIsSubmitting(false)
                }
                return
            }

            // Expand for expandable variants
            if (config.expandable) {
                setIsExpanded(true)
                setTimeout(() => {
                    inputRef.current?.focus() || textareaRef.current?.focus()
                }, 300)
            }
        },
        [config.instantSubmit, config.expandable, comment, title, onReviewSubmit, onClose, validateField, clearFieldError, parseError, showMessage]
    )

    const handleStarMouseEnter = useCallback((value) => {
        setHoveredRating(value)
    }, [])

    const handleStarMouseLeave = useCallback(() => {
        setHoveredRating(0)
    }, [])

    const handleCommentChange = useCallback(
        (e) => {
            const value = e.target.value
            setComment(value)
            clearFieldError('comment')
            validateField('comment', value, { rating, comment: value, title })

            // Auto-generate title if enabled
            if (config.autoTitle && value.length > 10) {
                setTitle(generateTitle(value))
            }
        },
        [rating, title, config.autoTitle, generateTitle, validateField, clearFieldError]
    )

    const handleTitleChange = useCallback(
        (e) => {
            const value = e.target.value
            setTitle(value)
            clearFieldError('title')
            validateField('title', value, { rating, comment, title: value })
        },
        [rating, comment, validateField, clearFieldError]
    )

    const handleImageUpload = useCallback(
        (e) => {
            const files = Array.from(e.target.files || [])
            const maxImages = requirements.images?.maxCount || 5
            const validFiles = files.slice(0, maxImages - images.length)

            const newImages = validFiles.map((file) => ({
                file,
                preview: URL.createObjectURL(file)
            }))

            setImages(prev => [...prev, ...newImages])
        },
        [images, requirements.images]
    )

    const handleRemoveImage = useCallback(
        (index) => {
            setImages(prev => {
                const newImages = [...prev]
                URL.revokeObjectURL(newImages[index].preview)
                newImages.splice(index, 1)
                return newImages
            })
        },
        []
    )

    const handleToggleImageUpload = useCallback(() => {
        setShowImageUpload(prev => !prev)
    }, [])

    const handleSubmitWithoutComment = useCallback(async () => {
        if (rating === 0) {
            showMessage('Please select a rating first', 'error')
            return
        }

        const reviewData = {
            rating,
            comment: '', // Empty comment
            ...(config.showTitle && { title: `${rating}-star rating` }),
            ...(config.showRecommendation && { wouldRecommend: rating >= 4 }),
            ...(config.showImages && { images: [] })
        }

        setIsSubmitting(true)
        try {
            await onReviewSubmit(reviewData)
            showMessage('Thanks for your review!', 'success')
            setTimeout(() => {
                setRating(0)
                setComment('')
                setTitle('')
                setImages([])
                setIsExpanded(!config.expandable)
                setShowImageUpload(false)
                onClose?.()
            }, 1000)
        } catch (error) {
            const errorMessage = parseError(error)
            showMessage(errorMessage, 'error')
        } finally {
            setIsSubmitting(false)
        }
    }, [rating, config, onReviewSubmit, onClose, parseError, showMessage])

    const handleQuickSubmit = useCallback(() => {
        if (rating === 0) {
            showMessage('Please select a rating first', 'error')
            return
        }
        setShowConfirmDialog(true)
    }, [rating, showMessage])

    const handleConfirmDialogClose = useCallback(() => {
        setShowConfirmDialog(false)
    }, [])

    const handleConfirmDialogConfirm = useCallback(() => {
        setShowConfirmDialog(false)
        handleSubmitWithoutComment()
    }, [handleSubmitWithoutComment])

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault()

            // If no comment and this is quick review, show popup
            if (config.expandable && variant === 'quickReview' && comment.trim().length === 0 && rating > 0) {
                handleQuickSubmit()
                return
            }

            const reviewData = {
                rating,
                comment: comment.trim(),
                ...(config.showTitle && { title: title.trim() }),
                ...(config.showRecommendation && { wouldRecommend }),
                ...(config.showImages && { images: images.map((img) => img.file) })
            }

            // Add auto-generated title if needed
            if (config.autoTitle && !reviewData.title && comment.trim()) {
                reviewData.title = generateTitle(comment)
            }

            // For empty comments, add a default title
            if (!reviewData.title && !comment.trim()) {
                reviewData.title = `${rating}-star rating`
            }

            // Use centralized validation
            const { isValid, sanitizedData, errors: validationErrors } = prepareForSubmission(reviewData)

            if (!isValid) {
                const firstError = Object.values(validationErrors)[0]
                showMessage(firstError, 'error')
                return
            }

            setIsSubmitting(true)

            try {
                await onReviewSubmit(sanitizedData)

                // Success - reset form
                showMessage('Thanks for your review!', 'success')
                setTimeout(() => {
                    setRating(0)
                    setComment('')
                    setTitle('')
                    setImages([])
                    setIsExpanded(!config.expandable)
                    setShowImageUpload(false)
                    onClose?.()
                }, 1000)
            } catch (error) {
                const errorMessage = parseError(error)
                showMessage(errorMessage, 'error')
            } finally {
                setIsSubmitting(false)
            }
        },
        [
            rating,
            comment,
            title,
            wouldRecommend,
            images,
            config,
            variant,
            onReviewSubmit,
            onClose,
            prepareForSubmission,
            parseError,
            showMessage,
            generateTitle,
            handleQuickSubmit
        ]
    )

    const handleKeyDown = useCallback(
        (e) => {
            if (config.submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
            }
        },
        [config.submitOnEnter, handleSubmit]
    )

    // Cleanup effect
    useEffect(() => {
        return () => {
            images.forEach((img) => URL.revokeObjectURL(img.preview))
        }
    }, [images])

    // Get character count info
    const commentCharInfo = getFieldCharacterCount(comment, 'comment')
    const titleCharInfo = config.showTitle ? getFieldCharacterCount(title, 'title') : null

    // Main form content
    const renderFormContent = () => (
        <div>
            {/* Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            {/* Header - Mobile Optimized */}
            {showHeader && !config.modal && (
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4 mb-6 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-white truncate">Share Your Experience</h3>
                            <p className="text-xs sm:text-sm text-gray-400 hidden xs:block">Help others make informed decisions</p>
                        </div>
                    </div>
                    {config.expandable && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center justify-center gap-2 px-4 py-3 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-medium transition-colors text-sm sm:text-base w-full xs:w-auto touch-manipulation min-h-[48px] sm:min-h-[40px]">
                            <Edit3 className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Write Review</span>
                            <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="p-3 hover:bg-gray-800 active:bg-gray-700 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-4">
                {/* Product info for modals */}
                {config.modal && productTitle && (
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500">Reviewing</p>
                        <p className="font-medium text-white line-clamp-1 text-base">{productTitle}</p>
                    </div>
                )}

                {/* Rating - Mobile Optimized */}
                <div className={cn(
                    'text-center',
                    config.expandable && !isExpanded && 'flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4'
                )}>
                    {config.expandable && !isExpanded && (
                        <p className="text-sm sm:text-base text-gray-400 order-1 xs:order-none">Rate this product</p>
                    )}
                    <div className="order-2 xs:order-none">
                        <StarRating
                            rating={rating}
                            hoveredRating={hoveredRating}
                            size={config.modal ? 'lg' : 'md'}
                            isSubmitting={isSubmitting}
                            onRatingClick={handleRatingClick}
                            onMouseEnter={handleStarMouseEnter}
                            onMouseLeave={handleStarMouseLeave}
                        />
                    </div>
                    {errors.rating && <p className="text-xs text-red-400 mt-2 order-3">{errors.rating}</p>}
                </div>

                {/* Expandable content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="overflow-hidden space-y-5 sm:space-y-4">
                            
                            {/* Title (if enabled) */}
                            {config.showTitle && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Review Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={handleTitleChange}
                                        placeholder="Summarize your experience"
                                        className={cn(
                                            'w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors min-h-[48px] touch-manipulation',
                                            errors.title ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'
                                        )}
                                        maxLength={requirements.title?.maxLength || 100}
                                    />
                                    {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                                    {titleCharInfo && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {titleCharInfo.current}/{titleCharInfo.max}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Comment - Mobile Optimized */}
                            <div>
                                <div className="relative">
                                    {config.expandable && variant === 'quickReview' ? (
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={comment}
                                            onChange={handleCommentChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder={placeholder || `Why ${rating <= 2 ? 'only' : ''} ${rating} star${rating === 1 ? '' : 's'}?`}
                                            className={cn(
                                                'w-full pl-4 pr-14 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors min-h-[48px] touch-manipulation',
                                                errors.comment ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'
                                            )}
                                            maxLength={requirements.comment?.maxLength || 500}
                                        />
                                    ) : (
                                        <textarea
                                            ref={textareaRef}
                                            value={comment}
                                            onChange={handleCommentChange}
                                            placeholder={placeholder || 'Share your experience with this product...'}
                                            className={cn(
                                                'w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors resize-none touch-manipulation',
                                                errors.comment ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'
                                            )}
                                            rows={config.modal ? 4 : 3}
                                            maxLength={requirements.comment?.maxLength || 500}
                                        />
                                    )}

                                    {/* Floating submit button for quick review - Better mobile positioning */}
                                    {config.expandable && variant === 'quickReview' && commentCharInfo.isValid && (
                                        <AnimatePresence>
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0 }}
                                                type="submit"
                                                disabled={isSubmitting || hasErrors}
                                                className={cn(
                                                    'absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center',
                                                    isSubmitting || hasErrors ? 'bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-110'
                                                )}>
                                                {isSubmitting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                ) : (
                                                    <Send className="w-4 h-4 text-white" />
                                                )}
                                            </motion.button>
                                        </AnimatePresence>
                                    )}
                                </div>

                                {errors.comment && <p className="text-xs text-red-400 mt-1">{errors.comment}</p>}

                                <div className="flex justify-between items-center mt-2 text-xs">
                                    {config.submitOnEnter && <span className="text-gray-500">Press Enter to submit</span>}
                                    <span
                                        className={cn(
                                            'transition-colors',
                                            !commentCharInfo.isValid
                                                ? 'text-red-400'
                                                : commentCharInfo.isNearLimit
                                                  ? 'text-yellow-600'
                                                  : 'text-gray-500'
                                        )}>
                                        {commentCharInfo.current}/{commentCharInfo.max}
                                    </span>
                                </div>
                            </div>

                            {/* Recommendation (if enabled) - Mobile Optimized */}
                            {config.showRecommendation && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Would you recommend this product?</label>
                                    <div className="flex gap-6">
                                        {[
                                            { value: true, label: 'Yes' },
                                            { value: false, label: 'No' }
                                        ].map((option) => (
                                            <label
                                                key={String(option.value)}
                                                className="flex items-center cursor-pointer touch-manipulation min-h-[44px] py-2">
                                                <input
                                                    type="radio"
                                                    name="recommend"
                                                    checked={wouldRecommend === option.value}
                                                    onChange={() => setWouldRecommend(option.value)}
                                                    className="mr-3 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                                                />
                                                <span className="text-gray-300 text-sm sm:text-base">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image upload (if enabled) */}
                            {config.showImages && (
                                <ImageUpload
                                    images={images}
                                    showImageUpload={showImageUpload}
                                    requirements={requirements}
                                    onImageUpload={handleImageUpload}
                                    onRemoveImage={handleRemoveImage}
                                    onToggleImageUpload={handleToggleImageUpload}
                                />
                            )}

                            {/* Submit button (for non-quick variants) - Mobile Optimized */}
                            {!config.submitOnEnter && (
                                <div className="space-y-3">
                                    {/* Main submit button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || rating === 0}
                                        className={cn(
                                            'w-full py-4 sm:py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-base touch-manipulation',
                                            isSubmitting || rating === 0
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        )}>
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

                                    {/* Quick submit without comment option */}
                                    {rating > 0 && comment.trim().length === 0 && (
                                        <button
                                            type="button"
                                            onClick={handleQuickSubmit}
                                            disabled={isSubmitting}
                                            className="w-full py-3 text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 touch-manipulation min-h-[44px]">
                                            Submit {rating}-star rating without comment
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    )

    // Modal variant
    if (config.modal) {
        return (
            <>
                <Modal
                    isOpen={isOpen}
                    onClose={onClose}
                    size={variant === 'modernModal' ? 'sm' : 'md'}
                    className={variant === 'modernModal' ? 'max-w-md' : ''}
                    showCloseButton={variant !== 'modernModal'}>
                    {renderFormContent()}
                </Modal>
                <ConfirmationDialog
                    isOpen={showConfirmDialog}
                    rating={rating}
                    isSubmitting={isSubmitting}
                    onClose={handleConfirmDialogClose}
                    onConfirm={handleConfirmDialogConfirm}
                />
            </>
        )
    }

    // Inline variant
    return (
        <>
            <motion.div
                className={cn(
                    'bg-gray-900 rounded-2xl border border-gray-800 transition-all',
                    config.expandable && isExpanded && 'border-emerald-500/30',
                    className
                )}
                animate={{
                    backgroundColor: config.expandable && isExpanded ? 'rgb(17 24 39)' : 'rgb(17 24 39 / 0.9)'
                }}>
                <div className="p-4 sm:p-6">{renderFormContent()}</div>
            </motion.div>
            <ConfirmationDialog
                isOpen={showConfirmDialog}
                rating={rating}
                isSubmitting={isSubmitting}
                onClose={handleConfirmDialogClose}
                onConfirm={handleConfirmDialogConfirm}
            />
            
            <style jsx>{`
                .drop-shadow-glow {
                    filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.4));
                }
            `}</style>
        </>
    )
})

export default UnifiedReviewForm


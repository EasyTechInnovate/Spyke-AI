'use client'

/**
 * Centralized Review Validation System
 *
 * This module provides consistent validation rules and functions for all review components.
 * It ensures that all review forms follow the same validation logic as the backend.
 */

// ===== VALIDATION CONSTANTS =====

export const REVIEW_VALIDATION_RULES = {
    // Rating validation
    rating: {
        min: 1,
        max: 5,
        required: true
    },

    // Comment validation
    comment: {
        minLength: 10,
        maxLength: 500,
        required: false // Backend allows optional comments
    },

    // Title validation (frontend only)
    title: {
        minLength: 5,
        maxLength: 100,
        required: false // Optional for most components
    },

    // Image validation
    images: {
        maxCount: 5,
        maxSize: 5 * 1024 * 1024, // 5MB in bytes
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        required: false
    }
}

// Error messages that match the backend - Fixed circular reference issue
export const REVIEW_ERROR_MESSAGES = {
    rating: {
        required: 'Please select a rating',
        min: 'Rating must be at least 1 star',
        max: 'Rating cannot exceed 5 stars',
        invalid: 'Rating must be between 1 and 5'
    },

    comment: {
        minLength: 'Comment must be at least 10 characters',
        maxLength: 'Comment must be less than 500 characters',
        whitespace: 'Comment cannot be empty or contain only spaces'
    },

    title: {
        minLength: 'Title must be at least 5 characters',
        maxLength: 'Title cannot exceed 100 characters',
        whitespace: 'Title cannot be empty or contain only spaces'
    },

    images: {
        maxCount: 'Maximum 5 images allowed',
        maxSize: 'Image size cannot exceed 5MB',
        invalidType: 'Only JPEG, PNG, WebP and GIF images are allowed',
        uploadFailed: 'Failed to upload image. Please try again.'
    },

    // Generic messages
    generic: {
        required: 'This field is required',
        invalid: 'Invalid input provided',
        networkError: 'Network error. Please check your connection and try again.',
        serverError: 'Server error. Please try again later.',
        unknownError: 'An unexpected error occurred. Please try again.'
    }
}

// Component-specific validation configurations
export const COMPONENT_VALIDATION_CONFIGS = {
    // For QuickReview component
    quickReview: {
        rating: { ...REVIEW_VALIDATION_RULES.rating, required: true },
        comment: { ...REVIEW_VALIDATION_RULES.comment, required: true, minLength: 10 },
        title: { required: false }
    },

    // For InlineReviewForm component
    inlineReview: {
        rating: { ...REVIEW_VALIDATION_RULES.rating, required: true },
        comment: { ...REVIEW_VALIDATION_RULES.comment, required: true, minLength: 10 },
        title: { required: false }
    },

    // For WriteReviewModal component
    fullReview: {
        rating: { ...REVIEW_VALIDATION_RULES.rating, required: true },
        comment: { ...REVIEW_VALIDATION_RULES.comment, required: true, minLength: 15 },
        title: { ...REVIEW_VALIDATION_RULES.title, required: true, minLength: 5 },
        images: REVIEW_VALIDATION_RULES.images
    },

    // For WriteReviewModalV2 component
    modernReview: {
        rating: { ...REVIEW_VALIDATION_RULES.rating, required: true },
        comment: { ...REVIEW_VALIDATION_RULES.comment, required: true, minLength: 10 },
        title: { required: false },
        images: { ...REVIEW_VALIDATION_RULES.images, maxCount: 3 }
    },

    // For OneClickReview component
    oneClickReview: {
        rating: { ...REVIEW_VALIDATION_RULES.rating, required: true },
        comment: { ...REVIEW_VALIDATION_RULES.comment, required: false },
        title: { required: false }
    }
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Validates a rating value
 * @param {number} rating - The rating to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateRating = (rating) => {
    // Handle undefined, null, or 0 ratings
    if (rating === undefined || rating === null || rating === 0 || rating === '') {
        return REVIEW_ERROR_MESSAGES.rating.required
    }

    const numRating = Number(rating)

    // Check if it's a valid number
    if (isNaN(numRating) || !isFinite(numRating)) {
        return REVIEW_ERROR_MESSAGES.rating.invalid
    }

    // Check range
    if (numRating < REVIEW_VALIDATION_RULES.rating.min) {
        return REVIEW_ERROR_MESSAGES.rating.min
    }

    if (numRating > REVIEW_VALIDATION_RULES.rating.max) {
        return REVIEW_ERROR_MESSAGES.rating.max
    }

    // Check if it's a whole number (ratings should be 1,2,3,4,5)
    if (!Number.isInteger(numRating)) {
        return REVIEW_ERROR_MESSAGES.rating.invalid
    }

    return null
}

/**
 * Validates a comment string
 * @param {string} comment - The comment to validate
 * @param {object} rules - Validation rules for the comment
 * @returns {string|null} Error message or null if valid
 */
export const validateComment = (comment, rules = REVIEW_VALIDATION_RULES.comment) => {
    // Ensure rules has required properties
    const safeRules = {
        required: false,
        minLength: 10,
        maxLength: 500,
        ...rules
    }

    // If comment is not required and empty, it's valid
    if (!safeRules.required && (!comment || !comment.trim())) {
        return null
    }

    // If comment is required but empty
    if (safeRules.required && (!comment || !comment.trim())) {
        return REVIEW_ERROR_MESSAGES.comment.whitespace
    }

    const trimmedComment = comment?.trim() || ''

    // Check minimum length (only if comment is provided or required)
    if ((safeRules.required || trimmedComment.length > 0) && trimmedComment.length < safeRules.minLength) {
        return `Comment must be at least ${safeRules.minLength} characters`
    }

    // Check maximum length
    if (trimmedComment.length > safeRules.maxLength) {
        return `Comment must be less than ${safeRules.maxLength} characters`
    }

    return null
}

/**
 * Validates a title string
 * @param {string} title - The title to validate
 * @param {object} rules - Validation rules for the title
 * @returns {string|null} Error message or null if valid
 */
export const validateTitle = (title, rules = REVIEW_VALIDATION_RULES.title) => {
    // Ensure rules has required properties
    const safeRules = {
        required: false,
        minLength: 5,
        maxLength: 100,
        ...rules
    }

    // If title is not required and empty, it's valid
    if (!safeRules.required && (!title || !title.trim())) {
        return null
    }

    // If title is required but empty
    if (safeRules.required && (!title || !title.trim())) {
        return REVIEW_ERROR_MESSAGES.title.whitespace
    }

    const trimmedTitle = title?.trim() || ''

    // Check minimum length (only if title is provided or required)
    if ((safeRules.required || trimmedTitle.length > 0) && trimmedTitle.length < safeRules.minLength) {
        return `Title must be at least ${safeRules.minLength} characters`
    }

    // Check maximum length
    if (trimmedTitle.length > safeRules.maxLength) {
        return `Title cannot exceed ${safeRules.maxLength} characters`
    }

    return null
}

/**
 * Validates an image file
 * @param {File} file - The image file to validate
 * @param {object} rules - Validation rules for images
 * @returns {string|null} Error message or null if valid
 */
export const validateImage = (file, rules = REVIEW_VALIDATION_RULES.images) => {
    if (!file) return null

    // Ensure it's actually a File object
    if (!(file instanceof File)) {
        return 'Invalid file object'
    }

    // Check file type
    if (!rules.allowedTypes.includes(file.type)) {
        return REVIEW_ERROR_MESSAGES.images.invalidType
    }

    // Check file size
    if (file.size > rules.maxSize) {
        return REVIEW_ERROR_MESSAGES.images.maxSize
    }

    // Check for empty files
    if (file.size === 0) {
        return 'Image file is empty'
    }

    return null
}

/**
 * Validates an array of image files
 * @param {File[]} images - Array of image files to validate
 * @param {object} rules - Validation rules for images
 * @returns {string|null} Error message or null if valid
 */
export const validateImages = (images = [], rules = REVIEW_VALIDATION_RULES.images) => {
    // Ensure images is an array
    if (!Array.isArray(images)) {
        return 'Images must be provided as an array'
    }

    // Check count limit
    if (images.length > rules.maxCount) {
        return `Maximum ${rules.maxCount} images allowed`
    }

    // Validate each image
    for (let i = 0; i < images.length; i++) {
        const imageError = validateImage(images[i], rules)
        if (imageError) {
            return `Image ${i + 1}: ${imageError}`
        }
    }

    return null
}

/**
 * Comprehensive review validation function
 * @param {object} reviewData - The review data to validate
 * @param {string} componentType - The type of component (quickReview, fullReview, etc.)
 * @returns {object} Object containing validation errors
 */
export const validateReview = (reviewData, componentType = 'quickReview') => {
    const rules = COMPONENT_VALIDATION_CONFIGS[componentType] || COMPONENT_VALIDATION_CONFIGS.quickReview
    const errors = {}

    // Ensure reviewData is an object
    if (!reviewData || typeof reviewData !== 'object') {
        return { general: 'Invalid review data provided' }
    }

    // Validate rating
    const ratingError = validateRating(reviewData.rating)
    if (ratingError) {
        errors.rating = ratingError
    }

    // Validate comment
    const commentError = validateComment(reviewData.comment, rules.comment)
    if (commentError) {
        errors.comment = commentError
    }

    // Validate title (if applicable)
    if (rules.title && rules.title.required !== false) {
        const titleError = validateTitle(reviewData.title, rules.title)
        if (titleError) {
            errors.title = titleError
        }
    }

    // Validate images (if applicable)
    if (rules.images && reviewData.images) {
        const imagesError = validateImages(reviewData.images, rules.images)
        if (imagesError) {
            errors.images = imagesError
        }
    }

    return errors
}

/**
 * Checks if review data is valid for a specific component
 * @param {object} reviewData - The review data to validate
 * @param {string} componentType - The type of component
 * @returns {boolean} Whether the review data is valid
 */
export const isReviewValid = (reviewData, componentType = 'quickReview') => {
    const errors = validateReview(reviewData, componentType)
    return Object.keys(errors).length === 0
}

/**
 * Formats validation error for display
 * @param {string} error - The error message
 * @param {string} field - The field name that has the error
 * @returns {object} Formatted error object for UI display
 */
export const formatValidationError = (error, field) => {
    return {
        message: error,
        field,
        type: 'validation',
        timestamp: Date.now()
    }
}

/**
 * Utility function to sanitize review data before submission
 * @param {object} reviewData - The review data to sanitize
 * @returns {object} Sanitized review data
 */
export const sanitizeReviewData = (reviewData) => {
    if (!reviewData || typeof reviewData !== 'object') {
        return {}
    }

    const sanitized = {}

    // Sanitize rating
    if (reviewData.rating !== undefined && reviewData.rating !== null && reviewData.rating !== '') {
        const numRating = Number(reviewData.rating)
        if (!isNaN(numRating) && isFinite(numRating)) {
            sanitized.rating = Math.round(Math.max(1, Math.min(5, numRating)))
        }
    }

    // Sanitize comment
    if (reviewData.comment && typeof reviewData.comment === 'string') {
        const trimmedComment = reviewData.comment.trim()
        if (trimmedComment.length > 0) {
            sanitized.comment = trimmedComment
        }
    }

    // Sanitize title
    if (reviewData.title && typeof reviewData.title === 'string') {
        const trimmedTitle = reviewData.title.trim()
        if (trimmedTitle.length > 0) {
            sanitized.title = trimmedTitle
        }
    }

    // Handle boolean fields
    if (reviewData.wouldRecommend !== undefined) {
        sanitized.wouldRecommend = Boolean(reviewData.wouldRecommend)
    }

    // Handle images (File objects don't need sanitization but we can filter them)
    if (reviewData.images && Array.isArray(reviewData.images)) {
        const validImages = reviewData.images.filter((img) => img instanceof File && img.size > 0)
        if (validImages.length > 0) {
            sanitized.images = validImages
        }
    }

    return sanitized
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generates a title from comment text (for auto-generation)
 * @param {string} comment - The comment text
 * @param {number} maxLength - Maximum title length
 * @returns {string} Generated title
 */
export const generateTitleFromComment = (comment, maxLength = 50) => {
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
        return ''
    }

    const trimmedComment = comment.trim()

    // Try to find the first sentence
    const firstSentence = trimmedComment.match(/^[^.!?]+[.!?]/)?.[0]

    if (firstSentence && firstSentence.length <= maxLength) {
        return firstSentence.replace(/[.!?]+$/, '').trim()
    }

    // Fall back to truncating at word boundary
    if (trimmedComment.length <= maxLength) {
        return trimmedComment
    }

    const truncated = trimmedComment.slice(0, maxLength)
    const lastSpaceIndex = truncated.lastIndexOf(' ')

    if (lastSpaceIndex > maxLength * 0.7) {
        // If we can keep at least 70% of the text
        return truncated.slice(0, lastSpaceIndex).trim() + '...'
    }

    return truncated.trim() + '...'
}

/**
 * Gets character count information for UI display
 * @param {string} text - The text to count
 * @param {object} rules - The validation rules containing min/max lengths
 * @returns {object} Character count information
 */
export const getCharacterCount = (text = '', rules = {}) => {
    // Provide defaults if rules are missing
    const safeRules = {
        minLength: 0,
        maxLength: 500,
        ...rules
    }

    const length = typeof text === 'string' ? text.length : 0
    const remaining = safeRules.maxLength - length
    const needed = Math.max(0, safeRules.minLength - length)

    return {
        current: length,
        max: safeRules.maxLength,
        min: safeRules.minLength,
        remaining,
        needed,
        isValid: length >= safeRules.minLength && length <= safeRules.maxLength,
        showWarning: remaining < 50 && remaining > 0,
        showError: remaining < 0 || needed > 0
    }
}

/**
 * Parses API error response and returns user-friendly message
 * @param {object} error - The API error object
 * @returns {string} User-friendly error message
 */
export const parseApiError = (error) => {
    // Handle null/undefined errors
    if (!error) {
        return REVIEW_ERROR_MESSAGES.generic.unknownError
    }

    // Handle network errors
    if (!error.response) {
        return REVIEW_ERROR_MESSAGES.generic.networkError
    }

    // Handle validation errors from backend
    if (error.response.status === 400 || error.response.status === 422) {
        const message = error.response.data?.message
        if (message && typeof message === 'string') {
            // Map backend validation messages to user-friendly ones
            if (message.includes('Rating must be')) {
                return REVIEW_ERROR_MESSAGES.rating.invalid
            }
            if (message.includes('Comment must be')) {
                return REVIEW_ERROR_MESSAGES.comment.minLength
            }
            return message
        }
    }

    // Handle server errors
    if (error.response.status >= 500) {
        return REVIEW_ERROR_MESSAGES.generic.serverError
    }

    // Handle other known errors
    const knownMessages = {
        CANNOT_REVIEW_OWN_PRODUCT: 'You cannot review your own product',
        ALREADY_REVIEWED: 'You have already reviewed this product',
        PRODUCT_NOT_FOUND: 'Product not found'
    }

    const errorCode = error.response.data?.code || error.response.data?.message
    if (errorCode && knownMessages[errorCode]) {
        return knownMessages[errorCode]
    }

    // Default fallback
    return error.response.data?.message || REVIEW_ERROR_MESSAGES.generic.unknownError
}

// Default export
export default {
    REVIEW_VALIDATION_RULES,
    REVIEW_ERROR_MESSAGES,
    COMPONENT_VALIDATION_CONFIGS,
    validateRating,
    validateComment,
    validateTitle,
    validateImage,
    validateImages,
    validateReview,
    isReviewValid,
    formatValidationError,
    sanitizeReviewData,
    generateTitleFromComment,
    getCharacterCount,
    parseApiError
}

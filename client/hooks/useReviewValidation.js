'use client'

import { useState, useCallback, useMemo } from 'react'
import {
    validateReview,
    isReviewValid,
    sanitizeReviewData,
    parseApiError,
    COMPONENT_VALIDATION_CONFIGS,
    REVIEW_VALIDATION_RULES,
    getCharacterCount,
    generateTitleFromComment
} from '@/lib/validation/reviewValidation'

/**
 * Custom hook for review validation and form management
 * Provides consistent validation logic across all review components
 */
export const useReviewValidation = (componentType = 'quickReview') => {
    const [errors, setErrors] = useState({})
    const [isValidating, setIsValidating] = useState(false)

    // Get validation rules for the specific component
    const validationRules = useMemo(() => {
        return COMPONENT_VALIDATION_CONFIGS[componentType] || COMPONENT_VALIDATION_CONFIGS.quickReview
    }, [componentType])

    /**
     * Validates review data and updates error state
     * @param {object} reviewData - Review data to validate
     * @returns {boolean} Whether the data is valid
     */
    const validate = useCallback(
        (reviewData) => {
            setIsValidating(true)

            const validationErrors = validateReview(reviewData, componentType)
            setErrors(validationErrors)

            setIsValidating(false)
            return Object.keys(validationErrors).length === 0
        },
        [componentType]
    )

    /**
     * Validates a single field and updates its error state
     * @param {string} fieldName - Name of the field to validate
     * @param {any} value - Value to validate
     * @param {object} reviewData - Complete review data for context
     */
    const validateField = useCallback(
        (fieldName, value, reviewData = {}) => {
            const tempData = { ...reviewData, [fieldName]: value }
            const validationErrors = validateReview(tempData, componentType)

            setErrors((prev) => ({
                ...prev,
                [fieldName]: validationErrors[fieldName] || null
            }))

            return !validationErrors[fieldName]
        },
        [componentType]
    )

    /**
     * Clears error for a specific field
     * @param {string} fieldName - Name of the field to clear error for
     */
    const clearFieldError = useCallback((fieldName) => {
        setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
        })
    }, [])

    /**
     * Clears all validation errors
     */
    const clearAllErrors = useCallback(() => {
        setErrors({})
    }, [])

    /**
     * Gets character count information for text fields
     * @param {string} text - Text to analyze
     * @param {string} fieldType - Type of field (comment, title)
     * @returns {object} Character count information
     */
    const getFieldCharacterCount = useCallback(
        (text, fieldType) => {
            const rules = validationRules[fieldType] || REVIEW_VALIDATION_RULES[fieldType]
            return getCharacterCount(text, rules)
        },
        [validationRules]
    )

    /**
     * Sanitizes and validates review data before submission
     * @param {object} reviewData - Raw review data
     * @returns {object} { isValid, sanitizedData, errors }
     */
    const prepareForSubmission = useCallback(
        (reviewData) => {
            const sanitizedData = sanitizeReviewData(reviewData)
            const validationErrors = validateReview(sanitizedData, componentType)
            const isValid = Object.keys(validationErrors).length === 0

            setErrors(validationErrors)

            return {
                isValid,
                sanitizedData,
                errors: validationErrors
            }
        },
        [componentType]
    )

    /**
     * Parses API error and returns user-friendly message
     * @param {object} apiError - Error from API call
     * @returns {string} User-friendly error message
     */
    const parseError = useCallback((apiError) => {
        return parseApiError(apiError)
    }, [])

    /**
     * Generates title from comment (for components that auto-generate titles)
     * @param {string} comment - Comment text
     * @returns {string} Generated title
     */
    const generateTitle = useCallback((comment) => {
        return generateTitleFromComment(comment)
    }, [])

    /**
     * Checks if a specific field is valid
     * @param {string} fieldName - Name of the field
     * @returns {boolean} Whether the field is valid (no error)
     */
    const isFieldValid = useCallback(
        (fieldName) => {
            return !errors[fieldName]
        },
        [errors]
    )

    /**
     * Gets error message for a specific field
     * @param {string} fieldName - Name of the field
     * @returns {string|null} Error message or null
     */
    const getFieldError = useCallback(
        (fieldName) => {
            return errors[fieldName] || null
        },
        [errors]
    )

    /**
     * Checks if the form has any errors
     * @returns {boolean} Whether the form has validation errors
     */
    const hasErrors = useMemo(() => {
        return Object.keys(errors).length > 0
    }, [errors])

    /**
     * Gets validation requirements for display
     * @returns {object} Validation requirements for each field
     */
    const getValidationRequirements = useCallback(() => {
        return {
            rating: {
                required: validationRules.rating?.required || false,
                min: validationRules.rating?.min || 1,
                max: validationRules.rating?.max || 5
            },
            comment: {
                required: validationRules.comment?.required || false,
                minLength: validationRules.comment?.minLength || 10,
                maxLength: validationRules.comment?.maxLength || 500
            },
            title: {
                required: validationRules.title?.required || false,
                minLength: validationRules.title?.minLength || 5,
                maxLength: validationRules.title?.maxLength || 100
            },
            images: {
                required: validationRules.images?.required || false,
                maxCount: validationRules.images?.maxCount || 5,
                maxSize: validationRules.images?.maxSize || 5242880, // 5MB
                allowedTypes: validationRules.images?.allowedTypes || ['image/jpeg', 'image/png']
            }
        }
    }, [validationRules])

    /**
     * Real-time validation for input changes
     * @param {string} fieldName - Name of the field
     * @param {any} value - New value
     * @param {object} fullData - Complete form data
     * @returns {boolean} Whether the field is valid
     */
    const validateOnChange = useCallback(
        (fieldName, value, fullData = {}) => {
            // Debounce validation for performance
            const timeoutId = setTimeout(() => {
                validateField(fieldName, value, fullData)
            }, 300)

            return () => clearTimeout(timeoutId)
        },
        [validateField]
    )

    return {
        // Validation functions
        validate,
        validateField,
        validateOnChange,
        prepareForSubmission,

        // Error management
        errors,
        hasErrors,
        isValidating,
        clearFieldError,
        clearAllErrors,
        getFieldError,
        isFieldValid,
        parseError,

        // Utility functions
        getFieldCharacterCount,
        generateTitle,
        getValidationRequirements,

        // Configuration
        validationRules,
        componentType
    }
}

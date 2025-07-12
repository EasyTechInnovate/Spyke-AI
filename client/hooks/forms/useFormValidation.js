'use client'

import { useState, useCallback } from 'react'

/**
 * @typedef {Object} ValidationRule
 * @property {RegExp} [pattern] - Regex pattern to match
 * @property {string} [message] - Error message
 * @property {number} [minLength] - Minimum length
 * @property {number} [maxLength] - Maximum length
 * @property {number} [minItems] - Minimum items (for arrays)
 * @property {number} [maxItems] - Maximum items (for arrays)
 * @property {boolean} [required] - Whether field is required
 */

/**
 * @typedef {Object} FieldConfig
 * @property {string} label - Field label
 * @property {string} type - Field type
 * @property {boolean} [required] - Whether field is required
 * @property {ValidationRule} [validation] - Validation rules
 * @property {Object} [fields] - Nested fields (for groups)
 */

/**
 * Custom hook for form validation
 * @param {Object.<string, FieldConfig>} fieldConfigs - Field configurations
 * @param {Object} formData - Current form data
 * @returns {Object} Validation utilities
 */
export function useFormValidation(fieldConfigs, formData) {
    const [errors, setErrors] = useState({})

    /**
     * Validate a single field
     * @param {string} fieldName - Field name
     * @param {any} value - Field value
     * @param {FieldConfig} fieldConfig - Field configuration
     * @returns {string|null} Error message or null
     */
    const validateField = useCallback((_, value, fieldConfig) => {
        if (!fieldConfig) return null

        const { validation, required, label } = fieldConfig

        // Required field validation
        if (required) {
            if (Array.isArray(value) && value.length === 0) {
                return `${label} is required`
            }
            if (!value || (typeof value === 'string' && !value.trim())) {
                return `${label} is required`
            }
        }

        // Skip further validation if no value and not required
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return null
        }

        if (!validation) return null

        // Pattern validation
        if (validation.pattern && typeof value === 'string') {
            if (!validation.pattern.test(value)) {
                return validation.message || `${label} is invalid`
            }
        }

        // Length validation for strings
        if (typeof value === 'string') {
            if (validation.minLength && value.length < validation.minLength) {
                return `${label} should be at least ${validation.minLength} characters`
            }
            if (validation.maxLength && value.length > validation.maxLength) {
                return `${label} should not exceed ${validation.maxLength} characters`
            }
        }

        // Array validation
        if (Array.isArray(value)) {
            if (validation.minItems && value.length < validation.minItems) {
                return validation.message || `Select at least ${validation.minItems} ${label.toLowerCase()}`
            }
            if (validation.maxItems && value.length > validation.maxItems) {
                return `Maximum ${validation.maxItems} ${label.toLowerCase()} allowed`
            }

            // Validate each item in array
            if (validation.pattern) {
                const invalidItems = value.filter(item => !validation.pattern.test(item))
                if (invalidItems.length > 0) {
                    return validation.message || `Invalid items in ${label}`
                }
            }
        }

        return null
    }, [])

    /**
     * Validate multiple fields
     * @param {string[]} fieldNames - Field names to validate
     * @returns {Object} Errors object
     */
    const validateFields = useCallback((fieldNames) => {
        const newErrors = {}

        fieldNames.forEach(fieldName => {
            const fieldConfig = fieldConfigs[fieldName]
            if (!fieldConfig) return

            let value = formData[fieldName]

            // Handle nested fields (e.g., 'location.country')
            if (fieldName.includes('.')) {
                const parts = fieldName.split('.')
                value = parts.reduce((obj, key) => obj?.[key], formData)
            }

            // Handle group fields or fields with nested structure
            if (fieldConfig.type === 'group' || (fieldConfig.fields && typeof fieldConfig.fields === 'object')) {
                // For fields like 'location' that have sub-fields
                Object.keys(fieldConfig.fields || {}).forEach(subFieldName => {
                    const fullFieldName = `${fieldName}.${subFieldName}`
                    const subFieldConfig = fieldConfig.fields[subFieldName]
                    const subValue = formData[fieldName]?.[subFieldName]
                    
                    // Check if field should be shown based on showIf condition
                    const shouldShow = !subFieldConfig.showIf || subFieldConfig.showIf(formData)
                    
                    // Only validate if field is shown and has required or validation rules
                    if (shouldShow && (subFieldConfig.required || subFieldConfig.validation)) {
                        const error = validateField(fullFieldName, subValue, subFieldConfig)
                        if (error) {
                            newErrors[fullFieldName] = error
                        }
                    }
                })
            } else {
                const error = validateField(fieldName, value, fieldConfig)
                if (error) {
                    newErrors[fieldName] = error
                }
            }
        })

        setErrors(newErrors)
        return newErrors
    }, [fieldConfigs, formData, validateField])

    /**
     * Validate a single field and update errors
     * @param {string} fieldName - Field name
     * @returns {boolean} Whether field is valid
     */
    const validateSingleField = useCallback((fieldName) => {
        const fieldConfig = fieldConfigs[fieldName]
        if (!fieldConfig) return true

        let value = formData[fieldName]
        if (fieldName.includes('.')) {
            const parts = fieldName.split('.')
            value = parts.reduce((obj, key) => obj?.[key], formData)
        }

        const error = validateField(fieldName, value, fieldConfig)
        
        setErrors(prev => ({
            ...prev,
            [fieldName]: error || ''
        }))

        return !error
    }, [fieldConfigs, formData, validateField])

    /**
     * Clear error for a specific field
     * @param {string} fieldName - Field name
     */
    const clearError = useCallback((fieldName) => {
        setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
        })
    }, [])

    /**
     * Clear all errors
     */
    const clearAllErrors = useCallback(() => {
        setErrors({})
    }, [])

    /**
     * Check if form is valid
     * @param {string[]} [fieldNames] - Optional fields to check
     * @returns {boolean} Whether form is valid
     */
    const isValid = useCallback((fieldNames) => {
        const fieldsToCheck = fieldNames || Object.keys(fieldConfigs)
        const validationErrors = validateFields(fieldsToCheck)
        return Object.keys(validationErrors).length === 0
    }, [fieldConfigs, validateFields])

    return {
        errors,
        setErrors,
        validateField,
        validateFields,
        validateSingleField,
        clearError,
        clearAllErrors,
        isValid
    }
}
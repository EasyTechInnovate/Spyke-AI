import { SELLER_VALIDATION_RULES, PAYOUT_VALIDATION_RULES, STEP_FIELD_MAPPING } from '../validation/sellerValidation'

// Helper function to get nested values from object
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Helper function to set nested values in object
export const setNestedValue = (obj, path, value) => {
    const keys = path.split('.')
    const lastKey = keys.pop()
    const target = keys.reduce((current, key) => {
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {}
        }
        return current[key]
    }, obj)
    target[lastKey] = value
    return obj
}

const isValidUrl = (str) => {
    try {
        const url = new URL(str)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

export const validateField = (fieldName, value, formData = {}) => {
    const rule = SELLER_VALIDATION_RULES[fieldName]
    if (!rule) return null

    let actualValue = fieldName.includes('.') 
        ? getNestedValue(formData, fieldName) || value
        : value

    if (typeof actualValue === 'string') {
        if (rule.toLowerCase) {
            actualValue = actualValue.toLowerCase()
        }
        if (rule.trim) {
            actualValue = actualValue.trim()
        }
    }

    if (rule.required) {
        if (rule.type === 'array') {
            if (!actualValue || !Array.isArray(actualValue) || actualValue.length === 0) {
                return rule.message.required || rule.message.minItems
            }
        } else if (rule.type === 'boolean') {
            if (typeof actualValue !== 'boolean') {
                return rule.message.required
            }
        } else {
            if (!actualValue || actualValue === '') {
                return rule.message.required
            }
        }
    }

    if (!actualValue && !rule.required) return null

    if (typeof actualValue === 'string') {
        if (rule.minLength && actualValue.length < rule.minLength) {
            return rule.message.minLength
        }
        if (rule.maxLength && actualValue.length > rule.maxLength) {
            return rule.message.maxLength
        }

        // URL validation - use exact backend .url() validation
        if (rule.isUrl && !isValidUrl(actualValue)) {
            return rule.message.pattern
        }
        
        // Pattern validation for non-URL fields
        if (!rule.isUrl && rule.pattern && !rule.pattern.test(actualValue)) {
            return rule.message.pattern
        }
    }

    // Array validations
    if (rule.type === 'array' && Array.isArray(actualValue)) {
        if (rule.minItems && actualValue.length < rule.minItems) {
            return rule.message.minItems
        }
        if (rule.maxItems && actualValue.length > rule.maxItems) {
            return rule.message.maxItems
        }
        
        // Validate each item in array (for portfolio links with URL validation)
        if (rule.itemIsUrl) {
            for (const item of actualValue) {
                if (typeof item === 'string' && !isValidUrl(item)) {
                    return rule.message.itemPattern
                }
            }
        } else if (rule.itemPattern) {
            for (const item of actualValue) {
                if (typeof item === 'string' && !rule.itemPattern.test(item)) {
                    return rule.message.itemPattern
                }
            }
        }
    }

    // Boolean validations
    if (rule.type === 'boolean' && rule.mustBeTrue && actualValue !== true) {
        return rule.message.mustBeTrue
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(actualValue)) {
        return rule.message.enum
    }

    return null
}

// Validate payout fields based on selected method (mirrors backend superRefine)
export const validatePayoutFields = (payoutMethod, formData) => {
    const errors = {}
    const rules = PAYOUT_VALIDATION_RULES[payoutMethod]
    
    if (!rules) return errors

    Object.keys(rules).forEach(fieldName => {
        let fieldValue = getNestedValue(formData, fieldName)
        const rule = rules[fieldName]
        
        // Apply transformations
        if (fieldValue && typeof fieldValue === 'string') {
            if (rule.toLowerCase) {
                fieldValue = fieldValue.toLowerCase()
            }
            if (rule.trim) {
                fieldValue = fieldValue.trim()
            }
        }
        
        // Check if required field is missing
        if (rule.required && (!fieldValue || fieldValue === '')) {
            errors[fieldName] = rule.message.required
            return
        }
        
        // Check URL validation for email fields (backend uses .email() which is stricter)
        if (fieldValue && rule.pattern && !rule.pattern.test(fieldValue)) {
            errors[fieldName] = rule.message.pattern
        }
        
        // Check minimum length
        if (fieldValue && rule.minLength && fieldValue.length < rule.minLength) {
            errors[fieldName] = rule.message.minLength
        }
    })

    return errors
}

// Validate specific step (used by form navigation)
export const validateStep = (step, formData) => {
    const errors = {}
    
    const fieldsToValidate = STEP_FIELD_MAPPING[step] || []

    fieldsToValidate.forEach(fieldName => {
        const error = validateField(fieldName, getNestedValue(formData, fieldName), formData)
        if (error) {
            errors[fieldName] = error
        }
    })

    // Add conditional payout validation for step 3
    if (step === 3 && formData.payoutInfo?.method) {
        const payoutErrors = validatePayoutFields(formData.payoutInfo.method, formData)
        Object.assign(errors, payoutErrors)
    }

    return errors
}

// Validate all fields for final submission
export const validateAllFields = (formData) => {
    const errors = {}
    
    // Validate all basic fields
    Object.keys(SELLER_VALIDATION_RULES).forEach(fieldName => {
        const error = validateField(fieldName, getNestedValue(formData, fieldName), formData)
        if (error) {
            errors[fieldName] = error
        }
    })

    // Add conditional payout validation
    if (formData.payoutInfo?.method) {
        const payoutErrors = validatePayoutFields(formData.payoutInfo.method, formData)
        Object.assign(errors, payoutErrors)
    }

    return errors
}

// Check if form data is valid (no errors)
export const isFormValid = (formData) => {
    const errors = validateAllFields(formData)
    return Object.keys(errors).length === 0
}

// Get validation status for a field
export const getFieldValidationStatus = (fieldName, value, formData = {}) => {
    const error = validateField(fieldName, value, formData)
    return {
        isValid: !error,
        error: error,
        message: error
    }
}

// Debounce function for real-time validation
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}
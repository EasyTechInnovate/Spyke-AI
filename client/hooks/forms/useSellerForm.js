'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import sellerAPI from '@/lib/api/seller'
import { useFormValidation } from './useFormValidation'
import { formFields, defaultFormValues, formSteps } from '@/lib/config/forms/SellerFormConfig'

/**
 * Custom hook for seller form management
 * @returns {Object} Form management utilities
 */
export function useSellerForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [formData, setFormData] = useState(defaultFormValues)

    const {
        errors,
        setErrors,
        validateFields,
        clearError,
        isValid
    } = useFormValidation(formFields, formData)

    // Initialize form data with user email
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            if (user.emailAddress) {
                setFormData(prev => ({
                    ...prev,
                    payoutInfo: {
                        ...prev.payoutInfo,
                        paypalEmail: user.emailAddress
                    }
                }))
            }
        }
    }, [])

    /**
     * Handle input change
     * @param {Event} e - Change event
     */
    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target

        if (name.includes('.')) {
            const [parent, child] = name.split('.')
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }))
        }

        // Clear error when user starts typing
        if (errors[name]) {
            clearError(name)
        }
    }, [errors, clearError])

    /**
     * Handle social handle change
     * @param {string} platform - Social platform
     * @param {string} value - Handle value
     */
    const handleSocialHandleChange = useCallback((platform, value) => {
        setFormData(prev => ({
            ...prev,
            socialHandles: {
                ...prev.socialHandles,
                [platform]: value
            }
        }))
    }, [])

    /**
     * Add tag to array field
     * @param {string} fieldName - Field name
     * @param {string} value - Tag value
     */
    const addTag = useCallback((fieldName, value) => {
        if (!value.trim() || formData[fieldName].includes(value.trim())) {
            return
        }

        const field = formFields[fieldName]
        if (field.maxItems && formData[fieldName].length >= field.maxItems) {
            toast.error(`Maximum ${field.maxItems} items allowed`)
            return
        }

        setFormData(prev => ({
            ...prev,
            [fieldName]: [...prev[fieldName], value.trim()]
        }))
    }, [formData])

    /**
     * Remove tag from array field
     * @param {string} fieldName - Field name
     * @param {string} value - Tag value
     */
    const removeTag = useCallback((fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: prev[fieldName].filter(item => item !== value)
        }))
    }, [])

    /**
     * Add portfolio link
     * @param {string} link - Portfolio link
     */
    const addPortfolioLink = useCallback((link) => {
        const field = formFields.portfolioLinks
        if (!link.trim() || formData.portfolioLinks.includes(link.trim())) {
            return
        }

        if (field.maxItems && formData.portfolioLinks.length >= field.maxItems) {
            toast.error(`Maximum ${field.maxItems} portfolio links allowed`)
            return
        }

        // Validate URL
        if (field.validation && !field.validation.pattern.test(link.trim())) {
            toast.error(field.validation.message)
            return
        }

        setFormData(prev => ({
            ...prev,
            portfolioLinks: [...prev.portfolioLinks, link.trim()]
        }))
    }, [formData])

    /**
     * Remove portfolio link
     * @param {string} link - Portfolio link
     */
    const removePortfolioLink = useCallback((link) => {
        setFormData(prev => ({
            ...prev,
            portfolioLinks: prev.portfolioLinks.filter(l => l !== link)
        }))
    }, [])

    /**
     * Validate current step
     * @param {number} step - Step number
     * @returns {boolean} Whether step is valid
     */
    const validateStep = useCallback((step) => {
        const stepConfig = formSteps.find(s => s.id === step)
        if (!stepConfig) return true

        const stepErrors = validateFields(stepConfig.fields)
        
        // Show validation errors to user
        if (Object.keys(stepErrors).length > 0) {
            const firstError = Object.values(stepErrors)[0]
            toast.error(firstError || 'Please fill in all required fields')
        }
        
        return Object.keys(stepErrors).length === 0
    }, [validateFields])

    /**
     * Submit form
     * @param {Object} data - Form data
     */
    const handleSubmit = useCallback(async (data) => {
        setLoading(true)
        setSubmitError('')

        try {
            const response = await sellerAPI.createProfile(data)

            if (response.success || response.statusCode === 201) {
                // Update user role in localStorage
                if (typeof window !== 'undefined') {
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                    currentUser.roles = ['user', 'seller']
                    currentUser.sellerId = response.data?.id
                    localStorage.setItem('user', JSON.stringify(currentUser))
                }

                toast.success(response.message || '🎉 Welcome to our seller community!')
                
                setTimeout(() => {
                    router.push('/seller/dashboard')
                }, 1000)
            } else {
                throw new Error(response.message || 'Failed to create seller profile')
            }
        } catch (error) {
            console.error('API Error:', error)
            const errorMessage = error.message || 'Failed to create seller profile'
            toast.error(errorMessage)
            setSubmitError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [router])

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        loading,
        submitError,
        handleInputChange,
        handleSocialHandleChange,
        addTag,
        removeTag,
        addPortfolioLink,
        removePortfolioLink,
        validateStep,
        handleSubmit
    }
}
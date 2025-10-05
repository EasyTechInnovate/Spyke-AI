'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from '@/lib/utils/toast'
import sellerAPI from '@/lib/api/seller'
import { formFields, defaultFormValues, formSteps, timezones, countries } from '@/lib/config/forms/SellerFormConfig'
import { 
    validateField, 
    validateStep, 
    validateAllFields, 
    validatePayoutFields,
    debounce,
    setNestedValue 
} from '@/lib/utils/validationUtils'
import confetti from 'canvas-confetti'

export function useSellerForm() {
    const [notification, setNotification] = useState(null)
    const [imageUploading, setImageUploading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const showMessage = (message, type = 'info', duration = 4000) => {
        setNotification({ id: Date.now(), message, type, duration })
    }

    const dismissNotification = useCallback((id) => setNotification(null), [])

    const [loading, setLoading] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [formData, setFormData] = useState(defaultFormValues)
    const [errors, setErrors] = useState({})
    const [hasStartedForm, setHasStartedForm] = useState(false)

    // Debounced validation function
    const debouncedValidation = useCallback(
        debounce((fieldName, value, currentFormData) => {
            const error = validateField(fieldName, value, currentFormData)
            setErrors(prev => {
                const newErrors = { ...prev }
                if (error) {
                    newErrors[fieldName] = error
                } else {
                    delete newErrors[fieldName]
                }
                return newErrors
            })
        }, 300),
        []
    )

    // Clear specific error
    const clearError = useCallback((fieldName) => {
        setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
        })
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.emailAddress) {
            setFormData((prev) => ({
                ...prev,
                email: prev.email || user.emailAddress,
                payoutInfo: {
                    ...prev.payoutInfo,
                    paypalEmail: prev.payoutInfo.paypalEmail || user.emailAddress
                }
            }))
        }
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        setFormData((prev) => {
            let changed = false
            const next = { ...prev }
            if (!prev.location.timezone) {
                const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
                const tzValues = timezones.map((t) => t.value)
                const alias = { 'Etc/UTC': 'UTC', 'Etc/GMT': 'UTC', GMT: 'UTC', 'Asia/Calcutta': 'Asia/Kolkata' }
                let chosen = null
                if (detected && tzValues.includes(detected)) chosen = detected
                else if (detected && alias[detected] && tzValues.includes(alias[detected])) chosen = alias[detected]
                if (!chosen && detected) {
                    const now = new Date()
                    const offsetMinutes = -now.getTimezoneOffset()
                    const offsetLookup = timezones.reduce((acc, tz) => {
                        const sign = tz.offset.startsWith('-') ? -1 : 1
                        const [h, m] = tz.offset.replace('+', '').replace('-', '').split(':').map(Number)
                        const total = sign * (h * 60 + m)
                        ;(acc[total] = acc[total] || []).push(tz.value)
                        return acc
                    }, {})
                    if (offsetLookup[offsetMinutes]?.length) chosen = offsetLookup[offsetMinutes][0]
                }
                if (chosen) {
                    next.location = { ...next.location, timezone: chosen }
                    changed = true
                }
            }
            if (!prev.location.country) {
                const lang = navigator.language || ''
                const region = (lang.split('-')[1] || '').toUpperCase()
                const regionMap = {
                    US: 'US/CA',
                    CA: 'US/CA',
                    GB: 'UK',
                    UK: 'UK',
                    IN: 'India',
                    AU: 'Australia',
                    DE: 'Germany',
                    FR: 'France',
                    ES: 'Spain',
                    IT: 'Italy',
                    NL: 'Netherlands',
                    SG: 'Singapore',
                    AE: 'UAE',
                    BR: 'Brazil'
                }
                const mapped = regionMap[region]
                if (mapped && countries.some((c) => c.value === mapped)) {
                    next.location = { ...next.location, country: mapped }
                    changed = true
                }
            }
            return changed ? next : prev
        })
    }, [])

    const confettiFiredRef = useRef(false)
    const triggerSellerConfetti = useCallback(() => {
        if (confettiFiredRef.current) return
        confettiFiredRef.current = true
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
    }, [])

    const normalizeImageValue = (val) => {
        if (!val) return ''
        if (typeof val === 'string') return val
        if (typeof val === 'object') {
            return val.url || val.fileUrl || val.secure_url || val.data?.url || val.data?.fileUrl || ''
        }
        return ''
    }

    // Enhanced input change handler with exact validation
    const handleInputChange = useCallback(
        (e) => {
            const { name, value, type, checked } = e.target
            if (!hasStartedForm) setHasStartedForm(true)
            
            const newValue = type === 'checkbox' ? checked : value
            
            setFormData((prev) => {
                const updated = { ...prev }
                
                if (name.includes('.')) {
                    // Handle nested fields like location.country
                    setNestedValue(updated, name, newValue)
                } else {
                    const finalValue = name === 'sellerBanner' 
                        ? normalizeImageValue(newValue) 
                        : newValue
                    updated[name] = finalValue
                }
                
                // Trigger real-time validation for the field
                if (type === 'checkbox' || type === 'select-one') {
                    // Immediate validation for checkboxes and selects
                    setTimeout(() => {
                        const error = validateField(name, newValue, updated)
                        setErrors(prev => {
                            const newErrors = { ...prev }
                            if (error) {
                                newErrors[name] = error
                            } else {
                                delete newErrors[name]
                            }
                            return newErrors
                        })
                    }, 0)
                } else {
                    // Debounced validation for text inputs
                    debouncedValidation(name, newValue, updated)
                }
                
                return updated
            })
        },
        [hasStartedForm, debouncedValidation]
    )

    const handleSocialHandleChange = useCallback((platform, value) => {
        const fieldName = `socialHandles.${platform}`
        setFormData((prev) => ({ 
            ...prev, 
            socialHandles: { ...prev.socialHandles, [platform]: value } 
        }))
        
        // Validate social handle
        debouncedValidation(fieldName, value, formData)
    }, [debouncedValidation, formData])

    const addTag = useCallback(
        (fieldName, value) => {
            if (!value.trim()) return
            
            setFormData((prev) => {
                const currentTags = prev[fieldName] || []
                if (currentTags.includes(value.trim())) return prev
                
                const newTags = [...currentTags, value.trim()]
                
                // Validate immediately
                setTimeout(() => {
                    const error = validateField(fieldName, newTags, { ...prev, [fieldName]: newTags })
                    setErrors(prevErrors => {
                        const newErrors = { ...prevErrors }
                        if (error) {
                            newErrors[fieldName] = error
                        } else {
                            delete newErrors[fieldName]
                        }
                        return newErrors
                    })
                }, 0)
                
                return {
                    ...prev,
                    [fieldName]: newTags
                }
            })
        },
        []
    )

    const removeTag = useCallback((fieldName, value) => {
        setFormData((prev) => {
            const newTags = (prev[fieldName] || []).filter(tag => tag !== value)
            
            // Validate immediately
            setTimeout(() => {
                const error = validateField(fieldName, newTags, { ...prev, [fieldName]: newTags })
                setErrors(prevErrors => {
                    const newErrors = { ...prevErrors }
                    if (error) {
                        newErrors[fieldName] = error
                    } else {
                        delete newErrors[fieldName]
                    }
                    return newErrors
                })
            }, 0)
            
            return {
                ...prev,
                [fieldName]: newTags
            }
        })
    }, [])

    const addPortfolioLink = useCallback(
        (link) => {
            if (!link.trim()) return
            
            setFormData((prev) => {
                const currentLinks = prev.portfolioLinks || []
                if (currentLinks.includes(link.trim())) return prev
                
                const newLinks = [...currentLinks, link.trim()]
                
                // Validate immediately with exact backend rules
                setTimeout(() => {
                    const error = validateField('portfolioLinks', newLinks, { ...prev, portfolioLinks: newLinks })
                    setErrors(prevErrors => {
                        const newErrors = { ...prevErrors }
                        if (error) {
                            newErrors.portfolioLinks = error
                        } else {
                            delete newErrors.portfolioLinks
                        }
                        return newErrors
                    })
                }, 0)
                
                return {
                    ...prev,
                    portfolioLinks: newLinks
                }
            })
        },
        []
    )

    const removePortfolioLink = useCallback((link) => {
        setFormData((prev) => {
            const newLinks = (prev.portfolioLinks || []).filter(l => l !== link)
            
            // Clear errors if no links remain
            if (newLinks.length === 0) {
                setErrors(prevErrors => {
                    const newErrors = { ...prevErrors }
                    delete newErrors.portfolioLinks
                    return newErrors
                })
            }
            
            return {
                ...prev,
                portfolioLinks: newLinks
            }
        })
    }, [])

    // Enhanced step validation matching backend exactly
    const validateStepEnhanced = useCallback(
        (step) => {
            const stepErrors = validateStep(step, formData)
            
            setErrors(prev => ({
                ...prev,
                ...stepErrors
            }))
            
            return Object.keys(stepErrors).length === 0
        },
        [formData]
    )

    // Enhanced form submission with complete backend matching validation
    const handleSubmit = useCallback(
        async (data) => {
            setLoading(true)
            setSubmitError('')

            try {
                // Final validation matching backend exactly
                const allErrors = validateAllFields(formData)
                
                if (Object.keys(allErrors).length > 0) {
                    setErrors(allErrors)
                    setLoading(false)
                    return
                }

                // Clear all errors
                setErrors({})

                const payoutMethod = data.payoutInfo?.method

                const payoutInfo = (() => {
                    if (payoutMethod === 'bank')
                        return {
                            method: 'bank',
                            bankDetails: {
                                accountHolderName: data.payoutInfo.accountHolderName?.trim(),
                                accountNumber: data.payoutInfo.accountNumber?.trim(),
                                routingNumber: data.payoutInfo.routingNumber?.trim(),
                                bankName: data.payoutInfo.bankName?.trim(),
                                swiftCode: data.payoutInfo.swiftCode?.trim() || null
                            }
                        }
                    if (payoutMethod === 'paypal') return { method: 'paypal', paypalEmail: data.payoutInfo.paypalEmail?.trim() }
                    if (payoutMethod === 'stripe') return { method: 'stripe', stripeAccountId: data.payoutInfo.stripeAccountId?.trim() }
                    if (payoutMethod === 'wise') return { method: 'wise', wiseEmail: data.payoutInfo.wiseEmail?.trim() }
                    return { method: payoutMethod }
                })()

                const payload = {
                    fullName: data.fullName.trim(),
                    email: data.email.trim(),
                    websiteUrl: data.websiteUrl?.trim() || null,
                    bio: data.bio.trim(),
                    niches: data.niches,
                    toolsSpecialization: data.toolsSpecialization,
                    location: { country: data.location.country, timezone: data.location.timezone },
                    sellerBanner: normalizeImageValue(data.sellerBanner)?.trim() || null,
                    socialHandles: data.socialHandles,
                    customAutomationServices: !!data.customAutomationServices,
                    portfolioLinks: data.portfolioLinks?.length ? data.portfolioLinks : [],
                    payoutInfo,
                    revenueShareAgreement: { accepted: !!data.revenueShareAgreement?.accepted }
                }

                const response = await sellerAPI.createProfile(payload)
                const body = response?.data ?? response
                const profileData = body?.data ?? body
                const sellerId = profileData?.id
                const verificationStatus = profileData?.verification?.status

                if (sellerId && verificationStatus === 'pending') {
                    if (typeof window !== 'undefined') {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                        const existingRoles = Array.isArray(currentUser.roles) ? currentUser.roles : []
                        if (!existingRoles.includes('seller')) existingRoles.push('seller')
                        currentUser.roles = existingRoles
                        currentUser.sellerId = sellerId
                        localStorage.setItem('user', JSON.stringify(currentUser))
                    }
                    
                    setIsSuccess(true)
                    
                    setTimeout(() => {
                        triggerSellerConfetti()
                    }, 100)
                } else {
                    throw new Error('Profile creation failed')
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to create seller profile'
                try {
                    toast.seller.profileError(errorMessage)
                } catch {}
                setSubmitError(errorMessage)
            } finally {
                setLoading(false)
            }
        },
        [formData, triggerSellerConfetti]
    )

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        loading,
        submitError,
        notification,
        dismissNotification,
        imageUploading,
        setImageUploading,
        isSuccess,
        handleInputChange,
        handleSocialHandleChange,
        addTag,
        removeTag,
        addPortfolioLink,
        removePortfolioLink,
        validateStep: validateStepEnhanced,
        handleSubmit,
        clearError
    }
}


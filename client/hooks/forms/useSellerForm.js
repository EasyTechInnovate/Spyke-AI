'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from '@/lib/utils/toast'
import sellerAPI from '@/lib/api/seller'
import { useFormValidation } from './useFormValidation'
import { formFields, defaultFormValues, formSteps, timezones, countries } from '@/lib/config/forms/SellerFormConfig'
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
    const [hasStartedForm, setHasStartedForm] = useState(false)

    const { errors, setErrors, validateFields, clearError } = useFormValidation(formFields, formData)

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

    const handleInputChange = useCallback(
        (e) => {
            const { name, value, type, checked } = e.target
            if (!hasStartedForm) setHasStartedForm(true)
            if (name.includes('.')) {
                const [parent, child] = name.split('.')
                setFormData((prev) => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: type === 'checkbox' ? checked : value
                    }
                }))
                if (errors[`${parent}.${child}`]) clearError(`${parent}.${child}`)
            } else {
                const nextValue =
                    name === 'sellerBanner' ? normalizeImageValue(type === 'checkbox' ? checked : value) : type === 'checkbox' ? checked : value
                setFormData((prev) => ({ ...prev, [name]: nextValue }))
                if (errors[name]) clearError(name)
            }
        },
        [errors, clearError, hasStartedForm]
    )

    const handleSocialHandleChange = useCallback((platform, value) => {
        setFormData((prev) => ({ ...prev, socialHandles: { ...prev.socialHandles, [platform]: value } }))
    }, [])

    const addTag = useCallback(
        (fieldName, value) => {
            if (!value.trim() || formData[fieldName].includes(value.trim())) return
            const field = formFields[fieldName]
            if (field.maxItems && formData[fieldName].length >= field.maxItems) {
                toast.validation.maxItems(fieldName, field.maxItems)
                return
            }
            setFormData((prev) => ({ ...prev, [fieldName]: [...prev[fieldName], value.trim()] }))
        },
        [formData]
    )

    const removeTag = useCallback((fieldName, value) => {
        setFormData((prev) => ({ ...prev, [fieldName]: prev[fieldName].filter((v) => v !== value) }))
    }, [])

    const addPortfolioLink = useCallback(
        (link) => {
            const field = formFields.portfolioLinks
            if (!link.trim() || formData.portfolioLinks.includes(link.trim())) return
            if (field.maxItems && formData.portfolioLinks.length >= field.maxItems) {
                toast.validation.maxItems('portfolio links', field.maxItems)
                return
            }
            if (field.validation && !field.validation.pattern.test(link.trim())) {
                toast.validation.invalid('URL format')
                return
            }
            setFormData((prev) => ({ ...prev, portfolioLinks: [...prev.portfolioLinks, link.trim()] }))
        },
        [formData]
    )

    const removePortfolioLink = useCallback((link) => {
        setFormData((prev) => ({ ...prev, portfolioLinks: prev.portfolioLinks.filter((l) => l !== link) }))
    }, [])

    const validateStep = useCallback(
        (step) => {
            const stepConfig = formSteps.find((s) => s.id === step)
            if (!stepConfig) return true
            const stepErrors = validateFields(stepConfig.fields)
            if (step === 3 && !formData.revenueShareAgreement?.accepted) {
                stepErrors['revenueShareAgreement.accepted'] = 'You must accept the revenue share agreement'
            }
            // Don't show notification here - let the form handle it
            return Object.keys(stepErrors).length === 0
        },
        [validateFields, formData.revenueShareAgreement]
    )

    const handleSubmit = useCallback(
        async (data) => {
            setLoading(true)
            setSubmitError('')

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

            try {
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
                    
                    // Set success state to hide form and show confetti
                    setIsSuccess(true)
                    
                    // Fire confetti only after successful API response and localStorage update
                    setTimeout(() => {
                        triggerSellerConfetti()
                        // Removed the showMessage call - no notification on success
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
        [triggerSellerConfetti]
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
        validateStep,
        handleSubmit
    }
}


'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, AlertCircle, Loader2, Plus, X, ChevronRight, Search } from 'lucide-react'
import Header from '@/components/layout/Header'
import Container from '@/components/layout/Container'
import sellerAPI from '@/lib/api/seller'
import { formSteps, formFields, defaultFormValues, timezones, countries, popularNiches, popularTools } from './SellerFormConfig'

export default function BecomeSellerPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [errors, setErrors] = useState({})
    const [formData, setFormData] = useState(defaultFormValues)

    // Search states for searchable selects
    const [countrySearch, setCountrySearch] = useState('')
    const [timezoneSearch, setTimezoneSearch] = useState('')

    // Tag input states
    const [nicheInput, setNicheInput] = useState('')
    const [toolInput, setToolInput] = useState('')
    const [portfolioInput, setPortfolioInput] = useState('')

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.emailAddress) {
            // Pre-fill paypal email but let user change business email
            setFormData((prev) => ({
                ...prev,
                payoutInfo: {
                    ...prev.payoutInfo,
                    paypalEmail: user.emailAddress
                }
            }))
        }
    }, [])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target

        if (name.includes('.')) {
            const [parent, child] = name.split('.')
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }))
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    const handleSocialHandleChange = (platform, value) => {
        setFormData((prev) => ({
            ...prev,
            socialHandles: {
                ...prev.socialHandles,
                [platform]: value
            }
        }))
    }

    const addTag = (type, value) => {
        if (value.trim() && !formData[type].includes(value.trim())) {
            const field = formFields[type]
            if (field.maxItems && formData[type].length >= field.maxItems) {
                toast.error(`Maximum ${field.maxItems} items allowed`)
                return
            }

            setFormData((prev) => ({
                ...prev,
                [type]: [...prev[type], value.trim()]
            }))

            if (type === 'niches') setNicheInput('')
            else if (type === 'toolsSpecialization') setToolInput('')
        }
    }

    const removeTag = (type, value) => {
        setFormData((prev) => ({
            ...prev,
            [type]: prev[type].filter((item) => item !== value)
        }))
    }

    const addPortfolioLink = () => {
        const field = formFields.portfolioLinks
        if (portfolioInput.trim() && !formData.portfolioLinks.includes(portfolioInput.trim())) {
            if (field.maxItems && formData.portfolioLinks.length >= field.maxItems) {
                toast.error(`Maximum ${field.maxItems} portfolio links allowed`)
                return
            }

            // Validate URL
            if (field.validation && !field.validation.pattern.test(portfolioInput.trim())) {
                toast.error(field.validation.message)
                return
            }

            setFormData((prev) => ({
                ...prev,
                portfolioLinks: [...prev.portfolioLinks, portfolioInput.trim()]
            }))
            setPortfolioInput('')
        }
    }

    const removePortfolioLink = (link) => {
        setFormData((prev) => ({
            ...prev,
            portfolioLinks: prev.portfolioLinks.filter((l) => l !== link)
        }))
    }

    const validateField = (fieldName, value, fieldConfig) => {
        if (!fieldConfig.validation) return null

        const { validation } = fieldConfig

        if (fieldConfig.required && !value) {
            return `${fieldConfig.label} is required`
        }

        if (validation.pattern && value && !validation.pattern.test(value)) {
            return validation.message
        }

        if (validation.minLength && value.length < validation.minLength) {
            return `${fieldConfig.label} should be at least ${validation.minLength} characters`
        }

        if (validation.maxLength && value.length > validation.maxLength) {
            return `${fieldConfig.label} should not exceed ${validation.maxLength} characters`
        }

        if (validation.minItems && value.length < validation.minItems) {
            return validation.message
        }

        return null
    }
    const validateStep = (step) => {
        const newErrors = {}
        const stepConfig = formSteps.find((s) => s.id === step)

        console.log(`Validating step ${step}`)

        stepConfig.fields.forEach((fieldName) => {
            const fieldConfig = formFields[fieldName]
            const value = formData[fieldName]

            if (fieldConfig.type === 'group') {
                // Group validation logic (unchanged)
                // ...
            } else if (fieldConfig.type === 'list' || Array.isArray(value)) {
                // Special handling for array fields like portfolioLinks
                if (fieldConfig.required && (!value || value.length === 0)) {
                    newErrors[fieldName] = `${fieldConfig.label} is required`
                } else if (value && value.length > 0 && fieldConfig.validation) {
                    // Validate each item in the array
                    const invalidItems = value.filter((item) => {
                        if (fieldConfig.validation.pattern) {
                            return !fieldConfig.validation.pattern.test(item)
                        }
                        return false
                    })

                    if (invalidItems.length > 0) {
                        newErrors[fieldName] = fieldConfig.validation.message || `Invalid items in ${fieldConfig.label}`
                    }
                }
                // Skip validation if array is empty and field is not required
            } else {
                // Regular field validation
                if (fieldConfig.required && (!value || (Array.isArray(value) && value.length === 0))) {
                    newErrors[fieldName] = `${fieldConfig.label} is required`
                } else if (value) {
                    const error = validateField(fieldName, value, fieldConfig)
                    if (error) {
                        newErrors[fieldName] = error
                    }
                }
            }
        })

        console.log('Validation errors:', newErrors)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, formSteps.length))
        }
    }

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('=== FORM SUBMISSION DEBUG ===')

        if (!validateStep(3)) {
            return
        }

        // Set loading to true BEFORE the try block
        setLoading(true)
        console.log('Loading set to true')

        try {
            console.log('Starting API call...')
            const response = await sellerAPI.createProfile(formData)
            console.log('API Response:', response)

            // Check for success - the response structure shows success: true
            if (response.success || response.statusCode === 201) {
                // Update user role in localStorage
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                currentUser.roles = ['user', 'seller']
                currentUser.sellerId = response.data?.id // Save seller ID
                localStorage.setItem('user', JSON.stringify(currentUser))

                // Show success message
                toast.success(response.message || '🎉 Welcome to our seller community!')

                // Small delay to show the success message
                setTimeout(() => {
                    router.push('/seller/dashboard')
                }, 1000)
            } else {
                throw new Error(response.message || 'Failed to create seller profile')
            }
        } catch (error) {
            console.error('API Error:', error)
            toast.error(error.message || 'Failed to create seller profile')
            setErrors({ submit: error.message || 'Something went wrong. Please try again.' })
        } finally {
            // Always set loading to false
            setLoading(false)
            console.log('Loading set to false')
        }
    }

    // Filter functions for searchable selects
    const filteredCountries = countries.filter((country) => country.label.toLowerCase().includes(countrySearch.toLowerCase()))

    const filteredTimezones = timezones.filter(
        (tz) => tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) || tz.offset.includes(timezoneSearch)
    )

    return (
        <>
            <Header />

            {/* Hero Section */}
            <section className="relative bg-black pt-24 pb-16">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/20"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>
                </div>
                <Container className="relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-kumbh-sans font-bold mb-6 text-white">
                            Turn Your <span className="text-brand-primary">Expertise</span> Into Income
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-300">
                            Join thousands of automation experts selling their tools and workflows
                        </p>
                        <div className="flex flex-wrap gap-8 justify-center text-lg">
                            <div className="flex items-center gap-2">
                                <Check className="w-6 h-6 text-brand-primary" />
                                <span className="text-gray-300">No upfront costs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-6 h-6 text-brand-primary" />
                                <span className="text-gray-300">Keep 80% of sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-6 h-6 text-brand-primary" />
                                <span className="text-gray-300">Instant payouts</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Benefits & Success Stories sections remain the same */}

            {/* Form Section */}
            <section className="py-16 bg-black border-t border-gray-800">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        {/* Progress Bar */}

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                {formSteps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className="flex items-center flex-1">
                                        <div className={`flex items-center ${currentStep >= step.id ? 'text-brand-primary' : 'text-gray-600'}`}>
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                                    currentStep >= step.id ? 'bg-brand-primary text-black' : 'bg-gray-800 text-gray-400'
                                                }`}>
                                                {step.id}
                                            </div>
                                            <span className="ml-2 hidden sm:inline font-kumbh-sans">{step.title}</span>
                                        </div>
                                        {index < formSteps.length - 1 && (
                                            <div className={`flex-1 h-1 mx-4 ${currentStep > step.id ? 'bg-brand-primary' : 'bg-gray-800'}`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                            {errors.submit && (
                                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <span className="text-red-400">{errors.submit}</span>
                                </div>
                            )}

                            {/* Step 1: Basic Information */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-kumbh-sans font-semibold mb-6 text-white">{formSteps[0].subtitle}</h3>

                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">{formFields.fullName.label} *</label>
                                        <input
                                            type={formFields.fullName.type}
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all text-white placeholder-gray-500 ${
                                                errors.fullName ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                            placeholder={formFields.fullName.placeholder}
                                        />
                                        {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>}
                                    </div>

                                    {/* Business Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">{formFields.email.label} *</label>
                                        <input
                                            type={formFields.email.type}
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all text-white placeholder-gray-500 ${
                                                errors.email ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                            placeholder={formFields.email.placeholder}
                                        />
                                        {formFields.email.helperText && <p className="mt-1 text-sm text-gray-500">{formFields.email.helperText}</p>}
                                        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                                    </div>

                                    {/* Website URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">{formFields.websiteUrl.label}</label>
                                        <input
                                            type={formFields.websiteUrl.type}
                                            name="websiteUrl"
                                            value={formData.websiteUrl}
                                            onChange={handleInputChange}
                                            data-gramm="false" // Add this
                                            data-gramm_editor="false" // Add this
                                            data-enable-grammarly="false" // Add this
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all text-white placeholder-gray-500"
                                            placeholder={formFields.websiteUrl.placeholder}
                                        />
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {formFields.bio.label} *{' '}
                                            <span className="text-gray-500 font-normal">
                                                ({formData.bio.length}/{formFields.bio.maxLength})
                                            </span>
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows={formFields.bio.rows}
                                            maxLength={formFields.bio.maxLength}
                                            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all resize-none text-white placeholder-gray-500 ${
                                                errors.bio ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                            placeholder={formFields.bio.placeholder}
                                        />
                                        {errors.bio && <p className="mt-1 text-sm text-red-400">{errors.bio}</p>}
                                    </div>

                                    {/* Profile Banner */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">{formFields.sellerBanner.label}</label>
                                        <input
                                            type={formFields.sellerBanner.type}
                                            name="sellerBanner"
                                            value={formData.sellerBanner}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all text-white placeholder-gray-500"
                                            placeholder={formFields.sellerBanner.placeholder}
                                        />
                                        {formFields.sellerBanner.helperText && (
                                            <p className="mt-1 text-sm text-gray-500">{formFields.sellerBanner.helperText}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Expertise */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-kumbh-sans font-semibold mb-6 text-white">{formSteps[1].subtitle}</h3>

                                    {/* Niches */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {formFields.niches.label} *{' '}
                                            <span className="text-gray-500 font-normal">({formFields.niches.helperText})</span>
                                        </label>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={nicheInput}
                                                onChange={(e) => setNicheInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('niches', nicheInput))}
                                                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white placeholder-gray-500"
                                                placeholder={formFields.niches.placeholder}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addTag('niches', nicheInput)}
                                                className="px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors">
                                                Add
                                            </button>
                                        </div>

                                        {/* Selected niches */}
                                        {formData.niches.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {formData.niches.map((niche) => (
                                                    <span
                                                        key={niche}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-sm">
                                                        {niche}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag('niches', niche)}
                                                            className="hover:text-white">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Popular niches */}
                                        <div className="flex flex-wrap gap-2">
                                            {popularNiches
                                                .filter((n) => !formData.niches.includes(n))
                                                .slice(0, 10)
                                                .map((niche) => (
                                                    <button
                                                        key={niche}
                                                        type="button"
                                                        onClick={() => addTag('niches', niche)}
                                                        className="px-3 py-1 border border-gray-700 rounded-full text-sm text-gray-300 hover:border-brand-primary hover:text-brand-primary transition-colors">
                                                        <Plus className="w-3 h-3 inline mr-1" />
                                                        {niche}
                                                    </button>
                                                ))}
                                        </div>
                                        {errors.niches && <p className="mt-1 text-sm text-red-400">{errors.niches}</p>}
                                    </div>

                                    {/* Tools */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {formFields.toolsSpecialization.label} *{' '}
                                            <span className="text-gray-500 font-normal">({formFields.toolsSpecialization.helperText})</span>
                                        </label>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={toolInput}
                                                onChange={(e) => setToolInput(e.target.value)}
                                                onKeyPress={(e) =>
                                                    e.key === 'Enter' && (e.preventDefault(), addTag('toolsSpecialization', toolInput))
                                                }
                                                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white placeholder-gray-500"
                                                placeholder={formFields.toolsSpecialization.placeholder}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addTag('toolsSpecialization', toolInput)}
                                                className="px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors">
                                                Add
                                            </button>
                                        </div>

                                        {/* Selected tools */}
                                        {formData.toolsSpecialization.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {formData.toolsSpecialization.map((tool) => (
                                                    <span
                                                        key={tool}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-sm">
                                                        {tool}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag('toolsSpecialization', tool)}
                                                            className="hover:text-white">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Popular tools */}
                                        <div className="flex flex-wrap gap-2">
                                            {popularTools
                                                .filter((t) => !formData.toolsSpecialization.includes(t))
                                                .slice(0, 15)
                                                .map((tool) => (
                                                    <button
                                                        key={tool}
                                                        type="button"
                                                        onClick={() => addTag('toolsSpecialization', tool)}
                                                        className="px-3 py-1 border border-gray-700 rounded-full text-sm text-gray-300 hover:border-brand-primary hover:text-brand-primary transition-colors">
                                                        <Plus className="w-3 h-3 inline mr-1" />
                                                        {tool}
                                                    </button>
                                                ))}
                                        </div>
                                        {errors.toolsSpecialization && <p className="mt-1 text-sm text-red-400">{errors.toolsSpecialization}</p>}
                                    </div>

                                    {/* Custom Services */}
                                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="customAutomationServices"
                                                checked={formData.customAutomationServices}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-brand-primary bg-gray-800 border-gray-600 rounded focus:ring-brand-primary focus:ring-2"
                                            />
                                            <div>
                                                <span className="font-medium text-white">{formFields.customAutomationServices.label}</span>
                                                <p className="text-sm text-gray-400">{formFields.customAutomationServices.helperText}</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Details */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-kumbh-sans font-semibold mb-6 text-white">{formSteps[2].subtitle}</h3>

                                    {/* Location */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Country */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {formFields.location.country.label} *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="location.country"
                                                    value={formData.location.country}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white appearance-none ${
                                                        errors['location.country'] ? 'border-red-500' : 'border-gray-700'
                                                    }`}>
                                                    <option
                                                        value=""
                                                        className="bg-gray-800">
                                                        Select country
                                                    </option>
                                                    {countries.map((country) => (
                                                        <option
                                                            key={country.value}
                                                            value={country.value}
                                                            className="bg-gray-800">
                                                            {country.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                                            </div>
                                            {errors['location.country'] && <p className="mt-1 text-sm text-red-400">{errors['location.country']}</p>}
                                        </div>

                                        {/* Timezone with Search */}
                                        {/* Timezone with Search - FIXED VERSION */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {formFields.location.timezone.label} *
                                            </label>

                                            {/* If no timezone selected, show search */}
                                            {!formData.location.timezone ? (
                                                <div className="relative">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                        <input
                                                            type="text"
                                                            value={timezoneSearch}
                                                            onChange={(e) => setTimezoneSearch(e.target.value)}
                                                            className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white placeholder-gray-500 ${
                                                                errors['location.timezone'] ? 'border-red-500' : 'border-gray-700'
                                                            }`}
                                                            placeholder="Search timezone..."
                                                        />
                                                    </div>

                                                    {/* Show dropdown only when searching */}
                                                    {timezoneSearch && (
                                                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                            {filteredTimezones.length > 0 ? (
                                                                filteredTimezones.map((tz) => (
                                                                    <button
                                                                        key={tz.value}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            console.log('Selected timezone:', tz.value)
                                                                            setFormData((prev) => ({
                                                                                ...prev,
                                                                                location: { ...prev.location, timezone: tz.value }
                                                                            }))
                                                                            setTimezoneSearch('')
                                                                            // Clear error
                                                                            if (errors['location.timezone']) {
                                                                                setErrors((prev) => ({ ...prev, 'location.timezone': '' }))
                                                                            }
                                                                        }}
                                                                        className="w-full px-4 py-2 text-left hover:bg-gray-700 text-white text-sm">
                                                                        {tz.label} <span className="text-gray-400">({tz.offset})</span>
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="px-4 py-2 text-gray-400 text-sm">No timezones found</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Show selected timezone with option to change */
                                                <div>
                                                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg">
                                                        <span className="flex-1 text-white">
                                                            {timezones.find((tz) => tz.value === formData.location.timezone)?.label}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    location: { ...prev.location, timezone: '' }
                                                                }))
                                                            }}
                                                            className="text-gray-400 hover:text-white">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {errors['location.timezone'] && (
                                                <p className="mt-1 text-sm text-red-400">{errors['location.timezone']}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Social Media */}
                                    <div>
                                        <h4 className="text-lg font-medium text-white mb-4">Social Media (Optional)</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <input
                                                type="url"
                                                value={formData.socialHandles.linkedin}
                                                onChange={(e) => handleSocialHandleChange('linkedin', e.target.value)}
                                                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white placeholder-gray-500"
                                                placeholder="LinkedIn URL"
                                            />
                                            <input
                                                type="url"
                                                value={formData.socialHandles.twitter}
                                                onChange={(e) => handleSocialHandleChange('twitter', e.target.value)}
                                                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white placeholder-gray-500"
                                                placeholder="Twitter URL"
                                            />
                                            <input
                                                type="url"
                                                value={formData.socialHandles.instagram}
                                                onChange={(e) => handleSocialHandleChange('instagram', e.target.value)}
                                                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white placeholder-gray-500"
                                                placeholder="Instagram URL"
                                            />
                                            <input
                                                type="url"
                                                value={formData.socialHandles.youtube}
                                                onChange={(e) => handleSocialHandleChange('youtube', e.target.value)}
                                                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white placeholder-gray-500"
                                                placeholder="YouTube URL"
                                            />
                                        </div>
                                    </div>

                                    {/* Portfolio Links */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {formFields.portfolioLinks.label} (Optional)
                                        </label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={portfolioInput}
                                                    onChange={(e) => setPortfolioInput(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioLink())}
                                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white placeholder-gray-500"
                                                    placeholder={formFields.portfolioLinks.placeholder}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addPortfolioLink}
                                                    className="px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors">
                                                    Add
                                                </button>
                                            </div>

                                            {formData.portfolioLinks.length > 0 && (
                                                <div className="space-y-2">
                                                    {formData.portfolioLinks.map((link, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                                                            <span className="flex-1 text-sm text-gray-300 truncate">{link}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removePortfolioLink(link)}
                                                                className="text-red-400 hover:text-red-300">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payout Information */}
                                    <div className="bg-brand-primary/10 p-6 rounded-lg border border-brand-primary/30">
                                        <h4 className="text-lg font-medium text-white mb-4">Payout Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    {formFields.payoutInfo.fields.method.label}
                                                </label>
                                                <select
                                                    name="payoutInfo.method"
                                                    value={formData.payoutInfo.method}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white">
                                                    {formFields.payoutInfo.fields.method.options.map((option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                            disabled={option.disabled}
                                                            className="bg-gray-800">
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {formData.payoutInfo.method === 'paypal' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        {formFields.payoutInfo.fields.paypalEmail.label} *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="payoutInfo.paypalEmail"
                                                        value={formData.payoutInfo.paypalEmail}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-white placeholder-gray-500 ${
                                                            errors['payoutInfo.paypalEmail'] ? 'border-red-500' : 'border-gray-700'
                                                        }`}
                                                        placeholder={formFields.payoutInfo.fields.paypalEmail.placeholder}
                                                    />
                                                    {errors['payoutInfo.paypalEmail'] && (
                                                        <p className="mt-1 text-sm text-red-400">{errors['payoutInfo.paypalEmail']}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                        </form>
                        <div className="flex justify-between mt-8">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-colors">
                                    Previous
                                </button>
                            )}

                            <div className={`${currentStep === 1 ? 'ml-auto' : ''}`}>
                                {currentStep < formSteps.length ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2">
                                        Next
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (!loading) {
                                                // Prevent multiple clicks
                                                handleSubmit(e)
                                            }
                                        }}
                                        className={`inline-flex items-center px-8 py-3 bg-brand-primary text-black font-semibold rounded-lg transition-all duration-300 ${
                                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-primary/90 cursor-pointer'
                                        }`}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Creating Profile...
                                            </>
                                        ) : (
                                            <>
                                                Create Seller Profile
                                                <Check className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    )
}


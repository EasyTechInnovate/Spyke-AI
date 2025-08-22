'use client'

import { useState } from 'react'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Save, AlertCircle, Clock, Rocket, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { useSellerProfile } from '@/hooks/useSellerProfile'
// NEW: import shared constants & components
import { FORM_STEPS, TOTAL_STEPS } from '@/components/product/create/constants'
import ProgressSteps from '@/components/product/create/ProgressSteps'
// NEW: import step components
import Step1Basics from '@/components/product/create/steps/Step1Basics'
import Step2Details from '@/components/product/create/steps/Step2Details'
import Step3Technical from '@/components/product/create/steps/Step3Technical'
import Step4Premium from '@/components/product/create/steps/Step4Premium'
import Step5MediaPrice from '@/components/product/create/steps/Step5MediaPrice'
import Step6Launch from '@/components/product/create/steps/Step6Launch'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function CreateProductPage() {
    // Inline notification state
    const [notification, setNotification] = useState(null)

    // Show inline notification messages  
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000)
    }

    // Clear notification
    const clearNotification = () => setNotification(null)

    const router = useRouter()
    const { data: sellerProfile, loading: profileLoading } = useSellerProfile()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        type: '',
        category: '',
        industry: '',
        shortDescription: '',
        fullDescription: '',
        targetAudience: '',
        benefits: [''],
        useCaseExamples: [''],
        howItWorks: [''],
        outcome: [''],
        toolsUsed: [],
        setupTime: '',
        deliveryMethod: 'link',
        embedLink: '',
        premiumContent: {
            promptText: '',
            promptInstructions: '',
            automationInstructions: '',
            automationFiles: [],
            agentConfiguration: '',
            agentFiles: [],
            detailedHowItWorks: [''],
            configurationExamples: [],
            resultExamples: [],
            videoTutorials: [],
            supportDocuments: [],
            bonusContent: []
        },
        price: '',
        originalPrice: '',
        thumbnail: '',
        images: [],
        previewVideo: '',
        tags: [],
        searchKeywords: [],
        estimatedHoursSaved: '',
        metricsImpacted: '',
        frequencyOfUse: 'ongoing',
        hasAffiliateTools: false,
        expectedSupport: '',
        faqs: [{ question: '', answer: '' }]
    })

    const isVerificationApproved = sellerProfile?.verificationStatus === 'approved'
    const isCommissionAccepted = sellerProfile?.commissionOffer?.status === 'accepted' && sellerProfile?.commissionOffer?.acceptedAt
    const isFullyApproved = isVerificationApproved && isCommissionAccepted

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Handle array field changes
    const handleArrayFieldChange = (field, index, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item))
        }))
    }

    // Add array field item
    const addArrayFieldItem = (field, defaultValue = '') => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }))
    }

    // Remove array field item
    const removeArrayFieldItem = (field, index) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }))
    }

    // Handle FAQ changes
    const handleFaqChange = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            faqs: prev.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
        }))
    }

    // Handle premium content changes
    const handlePremiumContentChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            premiumContent: {
                ...prev.premiumContent,
                [field]: value
            }
        }))
    }

    // Handle premium content array changes
    const handlePremiumContentArrayChange = (field, index, value) => {
        setFormData((prev) => ({
            ...prev,
            premiumContent: {
                ...prev.premiumContent,
                [field]: prev.premiumContent[field].map((item, i) => (i === index ? value : item))
            }
        }))
    }

    // Add premium content array item
    const addPremiumContentArrayItem = (field, defaultValue = '') => {
        setFormData((prev) => ({
            ...prev,
            premiumContent: {
                ...prev.premiumContent,
                [field]: [...prev.premiumContent[field], defaultValue]
            }
        }))
    }

    // Remove premium content array item
    const removePremiumContentArrayItem = (field, index) => {
        setFormData((prev) => ({
            ...prev,
            premiumContent: {
                ...prev.premiumContent,
                [field]: prev.premiumContent[field].filter((_, i) => i !== index)
            }
        }))
    }

    // Enhanced validation with better UX
    const validateStep = (step) => {
        switch (step) {
            case 1:
                return (
                    formData.title && formData.type && formData.category && formData.industry && formData.shortDescription && formData.fullDescription
                )
            case 2:
                return formData.targetAudience && formData.benefits[0] && formData.useCaseExamples[0]
            case 3:
                return formData.toolsUsed.length > 0 && formData.setupTime
            case 4:
                if (formData.type === 'prompt') {
                    return !!(formData.premiumContent.promptText || formData.premiumContent.promptInstructions)
                } else if (formData.type === 'automation') {
                    return !!(formData.premiumContent.automationInstructions || formData.premiumContent.automationFiles.length)
                } else if (formData.type === 'agent') {
                    return !!(formData.premiumContent.agentConfiguration || formData.premiumContent.agentFiles.length)
                }
                return true
            case 5:
                return formData.price && formData.thumbnail
            case 6:
                return true
            default:
                return false
        }
    }

    // Handle form submission
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)
            // Clean premium content
            const pc = formData.premiumContent || {}
            const cleanedPremium = {}
            const addIf = (key, val) => {
                if (val !== undefined && val !== null && (Array.isArray(val) ? val.length : typeof val === 'string' ? val.trim() : true))
                    cleanedPremium[key] = val
            }
            addIf('promptText', pc.promptText?.trim())
            addIf('promptInstructions', pc.promptInstructions?.trim())
            addIf('automationInstructions', pc.automationInstructions?.trim())
            addIf(
                'automationFiles',
                (pc.automationFiles || []).filter((f) => f && (f.name || f.url))
            )
            addIf('agentConfiguration', pc.agentConfiguration?.trim())
            addIf(
                'agentFiles',
                (pc.agentFiles || []).filter((f) => f && (f.name || f.url))
            )
            addIf(
                'detailedHowItWorks',
                (pc.detailedHowItWorks || []).filter((s) => s && s.trim())
            )
            addIf(
                'configurationExamples',
                (pc.configurationExamples || []).filter((e) => e && (e.title || e.code))
            )
            addIf(
                'resultExamples',
                (pc.resultExamples || []).filter((r) => r && (r.title || r.example))
            )
            addIf(
                'videoTutorials',
                (pc.videoTutorials || []).filter((v) => v && (v.title || v.url))
            )
            addIf(
                'supportDocuments',
                (pc.supportDocuments || []).filter((d) => d && (d.title || d.url))
            )
            addIf(
                'bonusContent',
                (pc.bonusContent || []).filter((b) => b && (b.title || b.url))
            )
            const productData = {
                ...formData,
                benefits: formData.benefits.filter((b) => b),
                useCaseExamples: formData.useCaseExamples.filter((u) => u),
                howItWorks: formData.howItWorks.filter((h) => h),
                outcome: formData.outcome.filter((o) => o),
                images: formData.images.filter((i) => i),
                tags: formData.tags.filter((t) => t),
                searchKeywords: formData.searchKeywords.filter((k) => k),
                faqs: formData.faqs.filter((f) => f.question && f.answer),
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                toolsUsed: formData.toolsUsed.map((tool) => {
                    const cleanTool = { name: tool.name }
                    if (tool.logo?.trim()) cleanTool.logo = tool.logo
                    if (tool.model?.trim()) cleanTool.model = tool.model
                    if (tool.link?.trim()) cleanTool.link = tool.link
                    return cleanTool
                }),
                premiumContent: Object.keys(cleanedPremium).length ? cleanedPremium : undefined
            }
            const response = await productsAPI.createProduct(productData)
            if (response.data) {
                showMessage('Product created successfully!', 'success')
                router.push('/seller/products')
            }
        } catch (error) {
            console.error('Error creating product:', error)
            showMessage(error.message || 'Failed to create product', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Navigate between steps with enhanced UX
    const goToStep = (step) => {
        if (step < currentStep || validateStep(currentStep)) {
            setCurrentStep(step)
        } else {
            const missingFields = []
            switch (currentStep) {
                case 1:
                    if (!formData.title) missingFields.push('Product Title')
                    if (!formData.type) missingFields.push('Product Type')
                    if (!formData.category) missingFields.push('Category')
                    if (!formData.industry) missingFields.push('Industry')
                    if (!formData.shortDescription) missingFields.push('Short Description')
                    if (!formData.fullDescription) missingFields.push('Full Description')
                    break
                case 2:
                    if (!formData.targetAudience) missingFields.push('Target Audience')
                    if (!formData.benefits[0]) missingFields.push('Benefit')
                    if (!formData.useCaseExamples[0]) missingFields.push('Use Case')
                    break
                case 3:
                    if (!formData.toolsUsed.length) missingFields.push('Tools Used')
                    if (!formData.setupTime) missingFields.push('Setup Time')
                    break
                case 4:
                    if (!validateStep(4)) missingFields.push('Some Premium Content')
                    break
                case 5:
                    if (!formData.price) missingFields.push('Price')
                    if (!formData.thumbnail) missingFields.push('Thumbnail Image')
                    break
                default:
                    break
            }
            if (missingFields.length) showMessage(`Please complete: ${missingFields.join(', ', 'error')}`)
        }
    }

    // Show loading while checking profile
    if (profileLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-2 border-[#00FF89] border-t-transparent rounded-full"
                />
            </div>
        )
    }

    // Enhanced restricted access UI
    if (!isFullyApproved) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg w-full">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-white" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-white mb-3">Almost Ready!</h2>
                        <p className="text-gray-400 mb-8">Complete your seller approval to start creating amazing products.</p>

                        <div className="space-y-3 mb-8">
                            {!isVerificationApproved && (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-amber-400" />
                                        <p className="text-amber-300 text-sm">Documents under review</p>
                                    </div>
                                </motion.div>
                            )}

                            {isVerificationApproved && !isCommissionAccepted && (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-blue-400" />
                                        <p className="text-blue-300 text-sm">Accept commission offer to proceed</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <Link
                            href="/seller/profile"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00FF89] to-emerald-500 text-black rounded-xl hover:shadow-lg hover:shadow-[#00FF89]/25 transition-all duration-300 font-semibold">
                            <Rocket className="w-5 h-5" />
                            Complete Setup
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    // Render current step component
    const renderCurrentStep = () => {
        const stepProps = {
            formData,
            handleInputChange,
            handleArrayFieldChange,
            addArrayFieldItem,
            removeArrayFieldItem,
            handleFaqChange,
            handlePremiumContentChange,
            handlePremiumContentArrayChange,
            addPremiumContentArrayItem,
            removePremiumContentArrayItem
        }

        switch (currentStep) {
            case 1:
                return <Step1Basics {...stepProps} />
            case 2:
                return <Step2Details {...stepProps} />
            case 3:
                return <Step3Technical {...stepProps} />
            case 4:
                return <Step4Premium {...stepProps} />
            case 5:
                return <Step5MediaPrice {...stepProps} />
            case 6:
                return <Step6Launch {...stepProps} />
            default:
                return <Step1Basics {...stepProps} />
        }
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/seller/products"
                                className="p-3 hover:bg-gray-800 rounded-xl transition-all duration-300 group">
                                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Create New Product</h1>
                                <p className="text-sm text-gray-400">Share your expertise with the world</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/seller/products')}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg">
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={currentStep === TOTAL_STEPS ? handleSubmit : () => goToStep(currentStep + 1)}
                                disabled={isSubmitting || (currentStep === TOTAL_STEPS && !validateStep(5))}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FF89] to-emerald-500 text-black rounded-xl hover:shadow-lg hover:shadow-[#00FF89]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold">
                                {isSubmitting ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        {currentStep === TOTAL_STEPS ? <Save className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                        {currentStep === TOTAL_STEPS ? 'Create Product' : 'Save & Continue'}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Progress Steps */}
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-b border-gray-700 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ProgressSteps
                        currentStep={currentStep}
                        steps={FORM_STEPS}
                        onStepClick={goToStep}
                    />
                </div>
            </div>

            {/* Enhanced Form Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-3xl p-8 lg:p-12 shadow-2xl backdrop-blur-sm">
                        {renderCurrentStep()}
                    </motion.div>
                </AnimatePresence>

                {/* Enhanced Navigation */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between mt-12">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                        className="inline-flex items-center gap-3 px-8 py-4 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl border border-gray-700 hover:border-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                        Previous
                    </motion.button>

                    {currentStep < TOTAL_STEPS ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => goToStep(currentStep + 1)}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00FF89] to-emerald-500 text-black rounded-xl hover:shadow-lg hover:shadow-[#00FF89]/25 transition-all duration-300 font-semibold">
                            Continue
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={isSubmitting || !validateStep(5)}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold">
                            {isSubmitting ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-5 h-5" />
                                    Launch Product
                                </>
                            )}
                        </motion.button>
                    )}
                </motion.div>
            </div>
        </div>
    )
}


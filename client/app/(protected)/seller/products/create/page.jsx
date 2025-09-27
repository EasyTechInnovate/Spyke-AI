'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Save, Eye, Edit3, RotateCcw, CheckCircle, AlertCircle, AlertTriangle, X, Info } from 'lucide-react'
import { useProductCreateStore, useProductCreateSelectors } from '@/store/productCreate'
import { STEP_HELPERS } from '@/lib/constants/productCreate'
import { productsAPI } from '@/lib/api'
import { useNotifications } from '@/hooks/useNotifications'
import Step1Basic from './steps/Step1Basic'
import Step2Details from './steps/Step2Details'
import Step3Technical from './steps/Step3Technical'
import Step4Premium from './steps/Step4Premium'
import Step5MediaPricing from './steps/Step5MediaPricing'
import Step6Launch from './steps/Step6Launch'
import LivePreview from './components/LivePreview'
import HelperRail from './components/HelperRail'
import ReviewSubmit from './components/ReviewSubmit'
const STEP_COMPONENTS = {
    1: Step1Basic,
    2: Step2Details,
    3: Step3Technical,
    4: Step4Premium,
    5: Step5MediaPricing,
    6: Step6Launch
}
export default function ProductCreatePage() {
    const router = useRouter()
    const [mode, setMode] = useState('form') 
    const [showReview, setShowReview] = useState(false)
    const [notification, setNotification] = useState(null)
    const [showResetConfirm, setShowResetConfirm] = useState(false)
    const currentStep = useProductCreateStore(useProductCreateSelectors.currentStep)
    const isDirty = useProductCreateStore(useProductCreateSelectors.isDirty)
    const lastSaved = useProductCreateStore(useProductCreateSelectors.lastSaved)
    const isSubmitting = useProductCreateStore(useProductCreateSelectors.isSubmitting)
    const completionPercentage = useProductCreateStore(useProductCreateSelectors.completionPercentage)
    const errors = useProductCreateStore((state) => state.errors)
    const setStep = useProductCreateStore((state) => state.setStep)
    const nextStep = useProductCreateStore((state) => state.nextStep)
    const prevStep = useProductCreateStore((state) => state.prevStep)
    const validateStep = useProductCreateStore((state) => state.validateStep)
    const markStepComplete = useProductCreateStore((state) => state.markStepComplete)
    const save = useProductCreateStore((state) => state.save)
    const reset = useProductCreateStore((state) => state.reset)
    const toApiPayload = useProductCreateStore((state) => state.toApiPayload)
    const setSubmitting = useProductCreateStore((state) => state.setSubmitting)
    const { showSuccess, showError, showInfo } = useNotifications()
    const handleStepClick = useCallback((targetStep) => {
        if (targetStep <= currentStep) {
            setStep(targetStep)
            return
        }
        let canNavigate = true
        let blockingStep = null
        for (let step = 1; step < targetStep; step++) {
            if (!validateStep(step)) {
                canNavigate = false
                blockingStep = step
                break
            }
        }
        if (canNavigate) {
            setStep(targetStep)
        } else {
            const stepNames = {
                1: 'Basic Information',
                2: 'Product Details',
                3: 'Technical Setup',
                4: 'Premium Content',
                5: 'Media & Pricing',
                6: 'Final Details'
            }
            showError(`Please complete Step ${blockingStep}: ${stepNames[blockingStep]} before proceeding to Step ${targetStep}`)
        }
    }, [currentStep, validateStep, setStep, showError])
    useEffect(() => {
        requestAnimationFrame(() => {
            document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
            window.scrollTo({ top: 0, behavior: 'smooth' })
            const mainContent = document.querySelector('.min-h-screen')
            if (mainContent) {
                mainContent.scrollTop = 0
            }
        })
    }, [currentStep, showReview, mode])
    const handleNext = useCallback(() => {
        const isValid = validateStep(currentStep)
        if (isValid) {
            markStepComplete(currentStep)
            if (currentStep < 6) {
                nextStep()
            } else {
                setShowReview(true)
            }
        } else {
            showError('Please fix the errors before proceeding')
        }
    }, [currentStep, validateStep, markStepComplete, nextStep, showError])
    const handlePrev = useCallback(() => {
        if (currentStep > 1) {
            prevStep()
        }
    }, [currentStep, prevStep])
    const handleSave = useCallback(() => {
        save()
        showSuccess('Progress saved automatically')
    }, [save, showSuccess])
    const handleReset = useCallback(() => {
        setShowResetConfirm(true)
    }, [])
    const confirmReset = useCallback(() => {
        reset()
        setShowResetConfirm(false)
        showInfo('Form reset successfully')
    }, [reset, showInfo])
    const handleSubmit = useCallback(async () => {
        try {
            setSubmitting(true)
            let allValid = true
            for (let step = 1; step <= 6; step++) {
                if (!validateStep(step)) {
                    allValid = false
                }
            }
            if (!allValid) {
                showError('Please fix all errors before submitting')
                return
            }
            const payload = toApiPayload()
            if (payload.thumbnail instanceof File) {
                showError('Please provide image URLs instead of files for now')
                return
            }
            const response = await productsAPI.createProduct(payload)
            if (response.data) {
                showSuccess('Product created successfully!')
                setTimeout(() => {
                    router.push('/seller/products')
                }, 2000)
                reset()
            }
        } catch (error) {
            console.error('Submission error:', error)
            if (error.response?.data) {
                const errorData = error.response.data
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    errorData.errors.forEach((err) => {
                        const fieldName = err.field ? err.field.charAt(0).toUpperCase() + err.field.slice(1) : 'Field'
                        showError(`${fieldName}: ${err.message}`)
                    })
                    if (errorData.message) {
                        showError(errorData.message)
                    }
                } else if (errorData.message) {
                    showError(errorData.message)
                } else {
                    showError('Failed to create product')
                }
            } else if (error.message) {
                showError(error.message)
            } else {
                showError('Failed to create product')
            }
        } finally {
            setSubmitting(false)
        }
    }, [validateStep, toApiPayload, showError, showSuccess, router, reset, setSubmitting])
    const CurrentStepComponent = STEP_COMPONENTS[currentStep]
    const stepInfo = STEP_HELPERS[currentStep] || {}
    const hasStepErrors = Object.keys(errors).some((key) => {
        const stepFields = {
            1: ['title', 'type', 'category', 'industry', 'shortDescription', 'fullDescription'],
            2: ['howItWorks'],
            3: ['toolsUsed', 'toolsConfiguration', 'setupTimeEstimate'],
            4: [],
            5: ['thumbnailImage', 'additionalImages', 'productTags'],
            6: ['supportAndMaintenance', 'faq']
        }
        return stepFields[currentStep]?.includes(key)
    })
    useEffect(() => {
        requestAnimationFrame(() => {
            document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
            window.scrollTo({ top: 0, behavior: 'smooth' })
            const mainContent = document.querySelector('.min-h-screen')
            if (mainContent) {
                mainContent.scrollTop = 0
            }
        })
    }, [currentStep, showReview, mode])
    return (
        <div>
            <div className="border-b border-gray-700 bg-gray-900/95 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                            <div className="flex items-center justify-center sm:justify-start">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    {[1, 2, 3, 4, 5, 6].map((step, index) => (
                                        <div
                                            key={step}
                                            className="flex items-center">
                                            <button
                                                onClick={() => handleStepClick(step)}
                                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 hover:scale-105 ${step === currentStep
                                                    ? 'border-[#00FF89] bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/30'
                                                    : step < currentStep
                                                        ? 'border-[#00FF89] bg-[#00FF89]/20 text-[#00FF89] hover:bg-[#00FF89]/30'
                                                        : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500 hover:bg-gray-700/70'
                                                    }`}>
                                                {step < currentStep ? (
                                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                ) : (
                                                    <span className="text-xs">{step}</span>
                                                )}
                                            </button>
                                            {index < 5 && (
                                                <div
                                                    className={`w-3 sm:w-4 h-0.5 mx-1 sm:mx-1.5 transition-all duration-300 ${step < currentStep ? 'bg-[#00FF89]' : 'bg-gray-600'
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                                        <span className="text-white font-semibold text-base sm:text-lg">
                                            Step {currentStep}: {stepInfo.title}
                                        </span>
                                        <span className="text-gray-400 text-sm">({currentStep}/6)</span>
                                        {hasStepErrors && (
                                            <div className="flex items-center">
                                                <AlertCircle className="w-4 h-4 text-red-400 ml-1" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start mt-1">
                                    <div className="text-sm text-[#00FF89] font-medium">{completionPercentage}% complete</div>
                                    <div className="ml-3 w-16 sm:w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#00FF89] transition-all duration-500 ease-out rounded-full"
                                            style={{ width: `${completionPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="flex items-center bg-gray-800/70 rounded-xl p-1 border border-gray-700">
                                <button
                                    onClick={() => setMode('form')}
                                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2 ${mode === 'form'
                                        ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/20'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700/70'
                                        }`}>
                                    <Edit3 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Form Mode</span>
                                    <span className="sm:hidden">Form</span>
                                </button>
                                <button
                                    onClick={() => setMode('preview')}
                                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2 ${mode === 'preview'
                                        ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/20'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700/70'
                                        }`}>
                                    <Eye className="w-4 h-4" />
                                    <span className="hidden sm:inline">Live Preview</span>
                                    <span className="sm:hidden">Preview</span>
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleSave}
                                    className="p-2 text-gray-400 hover:text-[#00FF89] hover:bg-gray-800/70 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-600"
                                    title="Save Progress">
                                    <Save className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800/70 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-600"
                                    title="Reset Form">
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <div className="hidden lg:block text-xs text-gray-400 ml-2 px-2 py-1 bg-gray-800/50 rounded border border-gray-700">
                                    {lastSaved
                                        ? `Saved ${new Date(lastSaved).toLocaleTimeString()}`
                                        : isDirty
                                            ? 'Unsaved changes'
                                            : 'All changes saved'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-6">
                        <div className="flex-1 max-w-4xl">
                            <AnimatePresence mode="wait">
                                {showReview ? (
                                    <ReviewSubmit
                                        key="review"
                                        onSubmit={handleSubmit}
                                        onBack={() => setShowReview(false)}
                                        isSubmitting={isSubmitting}
                                    />
                                ) : mode === 'form' ? (
                                    <motion.div
                                        key={`step-${currentStep}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700 relative z-10">
                                        <div className="p-6 sm:p-8">
                                            <div className="mb-6">
                                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{stepInfo.title}</h1>
                                                {stepInfo.tips && (
                                                    <ul className="text-sm sm:text-base text-gray-300 space-y-2">
                                                        {stepInfo.tips.map((tip, index) => (
                                                            <li
                                                                key={index}
                                                                className="flex items-start space-x-3">
                                                                <div className="w-1.5 h-1.5 bg-[#00FF89] rounded-full mt-2.5 flex-shrink-0"></div>
                                                                <span>{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <CurrentStepComponent />
                                            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-700 gap-4">
                                                <button
                                                    onClick={handlePrev}
                                                    disabled={currentStep === 1}
                                                    className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-800 rounded-lg">
                                                    <ArrowLeft className="w-4 h-4" />
                                                    <span>Previous</span>
                                                </button>
                                                <motion.button
                                                    onClick={handleNext}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`flex items-center space-x-3 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${hasStepErrors
                                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                                        : 'bg-[#00FF89] hover:bg-[#00FF89]/90 text-black shadow-lg shadow-[#00FF89]/20'
                                                        }`}>
                                                    <span>{currentStep === 6 ? 'Review & Submit' : 'Continue'}</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="preview"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}>
                                        <LivePreview />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="hidden lg:block w-80 flex-shrink-0">
                            <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
                                <HelperRail currentStep={currentStep} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {showResetConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowResetConfirm(false)}>
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-red-500/30 shadow-2xl max-w-md w-full mx-4">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="p-8">
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="w-8 h-8 text-red-400" />
                                        </div>
                                        <div className="absolute inset-0 w-16 h-16 bg-red-500/20 rounded-full animate-ping" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white text-center mb-3">Reset All Progress?</h3>
                                <div className="text-center mb-8">
                                    <p className="text-gray-300 text-base leading-relaxed mb-4">
                                        This will permanently delete all your progress and cannot be undone.
                                    </p>
                                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-red-200">
                                                <p className="font-medium mb-1">You will lose:</p>
                                                <ul className="space-y-1 text-red-300">
                                                    <li>• All form data and inputs</li>
                                                    <li>• Step completion progress</li>
                                                    <li>• Uploaded images and files</li>
                                                    <li>• Auto-saved drafts</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowResetConfirm(false)}
                                        className="flex-1 px-6 py-3 border border-gray-600 text-white rounded-xl hover:bg-gray-800/50 transition-all duration-200 font-medium text-base">
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={confirmReset}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 font-semibold text-base shadow-lg shadow-red-500/25">
                                        Reset Everything
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
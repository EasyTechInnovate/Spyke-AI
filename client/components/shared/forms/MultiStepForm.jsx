'use client'
import React, { useState, useCallback, useMemo, useRef } from 'react'
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import StepIndicator from './StepIndicator'
export default function MultiStepForm({
    steps,
    formData,
    onSubmit,
    errors = {},
    loading = false,
    submitError,
    onStepChange,
    validateStep,
    children,
    className = '',
    submitButtonText = 'Submit',
    submitButtonIcon,
    showStepIndicator = true,
    compactStepIndicator = false,
    imageUploading = false
}) {
    const [currentStep, setCurrentStep] = useState(1)
    const formRef = useRef(null)

    const stepsCount = steps?.length || 0

    const isLastStep = useMemo(() => currentStep === stepsCount, [currentStep, stepsCount])
    const currentStepConfig = useMemo(() => (Array.isArray(steps) ? steps.find((s) => s.id === currentStep) : undefined), [steps, currentStep])

    const scrollToTop = useCallback(() => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            })
        }
    }, [])

    const handleNextStep = useCallback(async () => {
        // Don't allow navigation if image is uploading on step 1
        if (currentStep === 1 && imageUploading) {
            return
        }

        // Don't allow navigation if sellerBanner is empty on step 1 (now required)
        if (currentStep === 1 && !formData?.sellerBanner?.trim()) {
            return
        }

        // For navigation between steps, don't show validation errors
        if (validateStep) {
            const isValid = await validateStep(currentStep)
            if (!isValid) return // Just prevent navigation, don't show errors
        }
        if (stepsCount === 0) return
        const nextStep = Math.min(currentStep + 1, stepsCount)
        setCurrentStep(nextStep)
        onStepChange?.(nextStep)
        
        // Scroll to top after step change
        setTimeout(scrollToTop, 100)
    }, [validateStep, currentStep, stepsCount, onStepChange, imageUploading, scrollToTop, formData?.sellerBanner])

    const handlePrevStep = useCallback(() => {
        if (stepsCount === 0) return
        const prevStep = Math.max(currentStep - 1, 1)
        setCurrentStep(prevStep)
        onStepChange?.(prevStep)
        
        // Scroll to top after step change
        setTimeout(scrollToTop, 100)
    }, [currentStep, stepsCount, onStepChange, scrollToTop])

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!isLastStep) return
            
            // Only show validation errors on actual form submission
            if (validateStep) {
                const isValid = await validateStep(currentStep)
                if (!isValid) {
                    // Show validation error only on submit attempt
                    const stepConfig = steps.find((s) => s.id === currentStep)
                    if (stepConfig && currentStep === 3) {
                        // Check specifically for revenue share agreement
                        if (!formData?.revenueShareAgreement?.accepted) {
                            // This will trigger the error notification component
                            return
                        }
                    }
                    return
                }
            }
            
            if (onSubmit) await onSubmit(formData)
        },
        [isLastStep, validateStep, currentStep, onSubmit, formData, steps]
    )

    // Show validation errors only for current step and only if there are errors
    const showValidationError = isLastStep && currentStep === 3 && !formData?.revenueShareAgreement?.accepted

    // Check if Next button should be disabled
    const isNextDisabled = loading || 
        (currentStep === 1 && imageUploading) || 
        (currentStep === 1 && !formData?.sellerBanner?.trim())

    return (
        <div className={`max-w-3xl mx-auto ${className}`} ref={formRef}>
            {showStepIndicator && (
                <StepIndicator
                    steps={Array.isArray(steps) ? steps : []}
                    currentStep={currentStep}
                    compact={compactStepIndicator}
                />
            )}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                {submitError && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-red-400">{submitError}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {currentStepConfig?.subtitle && (
                        <h3 className="text-2xl font-kumbh-sans font-semibold mb-6 text-white">{currentStepConfig.subtitle}</h3>
                    )}
                    {typeof children === 'function' ? children({ currentStep, currentStepConfig, errors }) : children}

                    <div className="flex justify-between mt-8">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Previous
                            </button>
                        )}
                        <div className={`${currentStep === 1 ? 'ml-auto' : ''}`}>
                            {!isLastStep ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    disabled={isNextDisabled}
                                    className={`px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}>
                                    {currentStep === 1 && imageUploading ? (
                                        <>
                                           <Loader2 className="w-5 h-5 animate-spin" />
                                           Uploading...
                                        </>
                                    ) : currentStep === 1 && !formData?.sellerBanner?.trim() ? (
                                        <>
                                            Next
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`inline-flex items-center px-8 py-3 bg-brand-primary text-black font-semibold rounded-lg transition-all duration-300 ${
                                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-primary/90 cursor-pointer'
                                    }`}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {submitButtonText}
                                            {submitButtonIcon && <span className="ml-2">{submitButtonIcon}</span>}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}


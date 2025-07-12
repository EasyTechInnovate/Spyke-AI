'use client'

import React, { useState } from 'react'
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import StepIndicator from './StepIndicator'

/**
 * @typedef {Object} FormStep
 * @property {number} id - Step ID
 * @property {string} title - Step title
 * @property {string} [subtitle] - Step subtitle
 * @property {string[]} fields - Fields in this step
 */

/**
 * @typedef {Object} MultiStepFormProps
 * @property {FormStep[]} steps - Form steps configuration
 * @property {Object} formData - Current form data
 * @property {function} onSubmit - Form submission handler
 * @property {Object} [errors={}] - Form errors
 * @property {boolean} [loading=false] - Loading state
 * @property {string} [submitError] - Submit error message
 * @property {function} [onStepChange] - Step change handler
 * @property {function} [validateStep] - Step validation function
 * @property {React.ReactNode} children - Form content render function
 * @property {string} [className] - Additional CSS classes
 * @property {string} [submitButtonText='Submit'] - Submit button text
 * @property {React.ReactNode} [submitButtonIcon] - Submit button icon
 * @property {boolean} [showStepIndicator=true] - Whether to show step indicator
 * @property {boolean} [compactStepIndicator=false] - Use compact step indicator
 */

/**
 * Reusable multi-step form component
 * @param {MultiStepFormProps} props
 */
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
    compactStepIndicator = false
}) {
    const [currentStep, setCurrentStep] = useState(1)

    const handleNextStep = async () => {
        if (validateStep) {
            const isValid = await validateStep(currentStep)
            if (!isValid) return
        }

        const nextStep = Math.min(currentStep + 1, steps.length)
        setCurrentStep(nextStep)
        onStepChange?.(nextStep)
    }

    const handlePrevStep = () => {
        const prevStep = Math.max(currentStep - 1, 1)
        setCurrentStep(prevStep)
        onStepChange?.(prevStep)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        // Only proceed if this is the last step
        if (!isLastStep) {
            return
        }
        
        if (validateStep) {
            const isValid = await validateStep(currentStep)
            if (!isValid) {
                return
            }
        }

        await onSubmit(formData)
    }

    const isLastStep = currentStep === steps.length
    const currentStepConfig = steps.find(s => s.id === currentStep)

    return (
        <div className={`max-w-3xl mx-auto ${className}`}>
            {showStepIndicator && (
                <StepIndicator
                    steps={steps}
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
                        <h3 className="text-2xl font-kumbh-sans font-semibold mb-6 text-white">
                            {currentStepConfig.subtitle}
                        </h3>
                    )}

                    {typeof children === 'function' 
                        ? children({ currentStep, currentStepConfig, errors })
                        : children
                    }
                </form>

                <div className="flex justify-between mt-8">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handlePrevStep}
                            disabled={loading}
                            className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                    )}

                    <div className={`${currentStep === 1 ? 'ml-auto' : ''}`}>
                        {!isLastStep ? (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                disabled={loading}
                                className="px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className={`inline-flex items-center px-8 py-3 bg-brand-primary text-black font-semibold rounded-lg transition-all duration-300 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-primary/90 cursor-pointer'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {submitButtonText}
                                        {submitButtonIcon && (
                                            <span className="ml-2">{submitButtonIcon}</span>
                                        )}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
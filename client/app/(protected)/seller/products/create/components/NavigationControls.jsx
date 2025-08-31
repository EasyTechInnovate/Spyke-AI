'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Eye, Save, CheckCircle } from 'lucide-react'
import { useProductCreateStore, useProductCreateSelectors } from '@/store/productCreate'

export default function NavigationControls({ currentStep, onStepChange, onTogglePreview, showPreview }) {
  const [isSaving, setIsSaving] = useState(false)
  
  const saveProgress = useProductCreateStore(state => state.saveProgress)
  const validateStep = useProductCreateStore(state => state.validateStep)
  const isValid = useProductCreateStore(useProductCreateSelectors.isValid)
  const isDirty = useProductCreateStore(useProductCreateSelectors.isDirty)
  
  const TOTAL_STEPS = 6
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === TOTAL_STEPS

  const handlePrevStep = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1)
    }
  }

  const handleNextStep = () => {
    // Validate current step before proceeding
    const stepErrors = validateStep(currentStep)
    
    if (Object.keys(stepErrors).length === 0) {
      if (isLastStep) {
        // Navigate to review
        onStepChange('review')
      } else {
        onStepChange(currentStep + 1)
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveProgress()
      // Show success feedback
      const button = document.querySelector('[data-save-button]')
      if (button) {
        button.style.background = '#00FF89'
        button.style.color = 'black'
        setTimeout(() => {
          button.style.background = ''
          button.style.color = ''
        }, 1000)
      }
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getNextButtonText = () => {
    if (isLastStep) return 'Review & Submit'
    return `Continue to Step ${currentStep + 1}`
  }

  const getStepValidation = (step) => {
    const errors = validateStep(step)
    return Object.keys(errors).length === 0
  }

  return (
    <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Previous Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevStep}
            disabled={isFirstStep}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isFirstStep
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Step Indicators */}
          <div className="hidden md:flex items-center space-x-2">
            {[1, 2, 3, 4, 5, 6].map((step) => {
              const isCurrentStep = step === currentStep
              const isCompleted = getStepValidation(step) && step < currentStep
              const isPassed = step < currentStep
              
              return (
                <button
                  key={step}
                  onClick={() => onStepChange(step)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isCurrentStep
                      ? 'bg-[#00FF89] text-black'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : isPassed
                      ? 'bg-gray-600 text-gray-300'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : step}
                </button>
              )
            })}
          </div>
        </div>

        {/* Center: Save & Preview Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            data-save-button
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all ${
              isDirty
                ? 'border-[#00FF89]/50 text-[#00FF89] hover:bg-[#00FF89]/10'
                : 'border-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
          </button>

          <button
            onClick={onTogglePreview}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all ${
              showPreview
                ? 'border-[#00FF89] bg-[#00FF89]/10 text-[#00FF89]'
                : 'border-gray-600 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </span>
          </button>
        </div>

        {/* Right: Next Button */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-xs text-gray-400">
            Step {currentStep} of {TOTAL_STEPS}
          </div>
          
          <motion.button
            onClick={handleNextStep}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isLastStep && !isValid
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#00FF89] text-black hover:bg-[#00FF89]/90 hover:shadow-lg'
            }`}
            disabled={isLastStep && !isValid}
          >
            <span>{getNextButtonText()}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden mt-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === currentStep
                    ? 'bg-[#00FF89]'
                    : step < currentStep
                    ? 'bg-green-600'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-2">
            {currentStep}/{TOTAL_STEPS}
          </span>
        </div>
      </div>
    </div>
  )
}
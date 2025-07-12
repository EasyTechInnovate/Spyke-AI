'use client'

import React from 'react'

/**
 * @typedef {Object} Step
 * @property {number} id - Step ID
 * @property {string} title - Step title
 * @property {string} [subtitle] - Step subtitle
 */

/**
 * @typedef {Object} StepIndicatorProps
 * @property {Step[]} steps - Array of steps
 * @property {number} currentStep - Current active step
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [showLabels=true] - Whether to show step labels
 * @property {boolean} [compact=false] - Use compact mode for mobile
 */

/**
 * Reusable step indicator component for multi-step forms
 * @param {StepIndicatorProps} props
 */
export default function StepIndicator({
    steps,
    currentStep,
    className = '',
    showLabels = true,
    compact = false
}) {
    return (
        <div className={`mb-8 ${className}`}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = currentStep >= step.id
                    const isCompleted = currentStep > step.id
                    const isLast = index === steps.length - 1

                    return (
                        <div
                            key={step.id}
                            className="flex items-center flex-1"
                        >
                            <div className={`flex items-center ${isActive ? 'text-brand-primary' : 'text-gray-600'}`}>
                                <div
                                    className={`
                                        flex items-center justify-center font-semibold transition-all duration-300
                                        ${compact ? 'w-8 h-8 text-sm' : 'w-10 h-10'}
                                        ${isActive 
                                            ? 'bg-brand-primary text-black' 
                                            : 'bg-gray-800 text-gray-400'
                                        }
                                        ${isCompleted ? 'ring-2 ring-brand-primary/50' : ''}
                                        rounded-full
                                    `}
                                >
                                    {isCompleted ? (
                                        <svg
                                            className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                
                                {showLabels && !compact && (
                                    <div className="ml-3 hidden sm:block">
                                        <p className="font-kumbh-sans font-medium">
                                            {step.title}
                                        </p>
                                        {step.subtitle && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {step.subtitle}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {!isLast && (
                                <div
                                    className={`
                                        flex-1 h-1 mx-2 sm:mx-4 transition-all duration-300
                                        ${currentStep > step.id 
                                            ? 'bg-brand-primary' 
                                            : 'bg-gray-800'
                                        }
                                    `}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
            
            {showLabels && compact && (
                <div className="mt-3 text-center sm:hidden">
                    <p className="font-kumbh-sans font-medium text-brand-primary">
                        {steps.find(s => s.id === currentStep)?.title}
                    </p>
                    {steps.find(s => s.id === currentStep)?.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            {steps.find(s => s.id === currentStep)?.subtitle}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
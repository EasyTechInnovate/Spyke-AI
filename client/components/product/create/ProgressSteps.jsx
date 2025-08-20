import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Settings } from 'lucide-react'

const ProgressSteps = ({ currentStep, steps, onStepClick }) => (
    <div className="relative">
        {/* Desktop Progress */}
        <div className="hidden lg:flex items-center justify-between">
            {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = step.id < currentStep
                const isAccessible = step.id <= currentStep

                return (
                    <div
                        key={step.id}
                        className="flex items-center">
                        <motion.button
                            onClick={() => isAccessible && onStepClick(step.id)}
                            className={`
                relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300
                ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                ${isActive ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-[#00FF89]/30' : ''}
              `}
                            whileHover={isAccessible ? { scale: 1.05 } : {}}
                            whileTap={isAccessible ? { scale: 0.95 } : {}}>
                            <div
                                className={`
                relative w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                ${
                    isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                        : isActive
                          ? `bg-gradient-to-br ${step.color} text-white shadow-lg`
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                }
              `}>
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>{step.title}</p>
                                <p className="text-xs text-gray-500">{step.description}</p>
                            </div>
                        </motion.button>

                        {index < steps.length - 1 && (
                            <div
                                className={`
                w-16 h-1 mx-4 rounded-full transition-all duration-500
                ${step.id < currentStep ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-800'}
              `}
                            />
                        )}
                    </div>
                )
            })}
        </div>

        {/* Mobile Progress */}
        <div className="lg:hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`
            w-10 h-10 rounded-full flex items-center justify-center
            bg-gradient-to-br ${steps[currentStep - 1]?.color || 'from-gray-500 to-gray-600'}
          `}>
                        {React.createElement(steps[currentStep - 1]?.icon || Settings, { className: 'w-5 h-5 text-white' })}
                    </div>
                    <div>
                        <h3 className="text-white font-medium">{steps[currentStep - 1]?.title}</h3>
                        <p className="text-sm text-gray-400">{steps[currentStep - 1]?.description}</p>
                    </div>
                </div>
                <div className="text-sm text-gray-400">
                    {currentStep}/{steps.length}
                </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-[#00FF89] to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
            </div>
        </div>
    </div>
)

export default ProgressSteps


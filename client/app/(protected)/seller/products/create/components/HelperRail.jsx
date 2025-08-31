'use client'

import { motion } from 'framer-motion'
import { Lightbulb, AlertCircle, CheckCircle, Clock, Target, Zap, ArrowRight, BookOpen, TrendingUp } from 'lucide-react'
import { useProductCreateStore, useProductCreateSelectors } from '@/store/productCreate'
import { STEP_HELPERS, VALIDATION_LIMITS } from '@/lib/constants/productCreate'

export default function HelperRail({ currentStep }) {
    const errors = useProductCreateStore((state) => state.errors)
    const isDirty = useProductCreateStore(useProductCreateSelectors.isDirty)
    const lastSaved = useProductCreateStore(useProductCreateSelectors.lastSaved)
    const completionPercentage = useProductCreateStore(useProductCreateSelectors.completionPercentage)

    // Get relevant state for smart suggestions
    const title = useProductCreateStore((state) => state.title)
    const type = useProductCreateStore((state) => state.type)
    const shortDescription = useProductCreateStore((state) => state.shortDescription)
    const howItWorks = useProductCreateStore((state) => state.howItWorks)
    const toolsUsed = useProductCreateStore((state) => state.toolsUsed)
    const productTags = useProductCreateStore((state) => state.productTags)
    const thumbnailImage = useProductCreateStore((state) => state.thumbnailImage)
    const supportAndMaintenance = useProductCreateStore((state) => state.supportAndMaintenance)
    const faq = useProductCreateStore((state) => state.faq)

    const stepInfo = STEP_HELPERS[currentStep] || {}

    // Get active errors for current step
    const getActiveErrors = () => {
        return Object.entries(errors)
            .map(([field, message]) => ({
                field: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
                message
            }))
            .slice(0, 3) // Show max 3 errors to keep it clean
    }

    // Get smart suggestions based on current step and state
    const getSmartSuggestions = () => {
        const suggestions = []

        switch (currentStep) {
            case 1:
                if (!title && !shortDescription) {
                    suggestions.push({
                        type: 'tip',
                        title: 'Start with Your Core Value',
                        message: 'Focus on the main problem your product solves',
                        icon: Target
                    })
                } else if (title && title.length < 20) {
                    suggestions.push({
                        type: 'tip',
                        title: 'Enhance Your Title',
                        message: 'Consider adding the key benefit or outcome',
                        icon: TrendingUp
                    })
                }

                if (type && !shortDescription) {
                    suggestions.push({
                        type: 'next',
                        title: 'Describe Your Solution',
                        message: 'Write a compelling short description',
                        icon: ArrowRight
                    })
                }
                break

            case 2:
                const validSteps = howItWorks.filter((step) => step.title?.trim() && step.detail?.trim()).length
                if (validSteps === 0) {
                    suggestions.push({
                        type: 'tip',
                        title: 'Map Your Process',
                        message: 'Break down your solution into clear steps',
                        icon: BookOpen
                    })
                } else if (validSteps < 3) {
                    suggestions.push({
                        type: 'progress',
                        title: `${validSteps}/3 Steps Complete`,
                        message: 'Add more detail to complete this section',
                        icon: CheckCircle
                    })
                }
                break

            case 3:
                if (toolsUsed.length === 0) {
                    suggestions.push({
                        type: 'tip',
                        title: 'Tools Build Trust',
                        message: 'Show buyers what platforms you use',
                        icon: Zap
                    })
                } else if (toolsUsed.length >= 1) {
                    suggestions.push({
                        type: 'success',
                        title: 'Great Tool Selection',
                        message: `${toolsUsed.length} tools configured`,
                        icon: CheckCircle
                    })
                }
                break

            case 5:
                if (!thumbnailImage) {
                    suggestions.push({
                        type: 'tip',
                        title: 'Visuals Drive Sales',
                        message: 'Products with images get 3x more engagement',
                        icon: TrendingUp
                    })
                }

                if (productTags.length < 3) {
                    suggestions.push({
                        type: 'tip',
                        title: 'Boost Discoverability',
                        message: 'Add relevant tags to help buyers find you',
                        icon: Target
                    })
                }
                break

            case 6:
                const validFaqs = faq.filter((item) => item.question?.trim() && item.answer?.trim()).length
                if (!supportAndMaintenance) {
                    suggestions.push({
                        type: 'tip',
                        title: 'Build Buyer Confidence',
                        message: 'Describe your support process clearly',
                        icon: CheckCircle
                    })
                } else if (validFaqs === 0) {
                    suggestions.push({
                        type: 'tip',
                        title: 'Address Common Questions',
                        message: 'Use suggested FAQs to get started',
                        icon: BookOpen
                    })
                }
                break
        }

        return suggestions.slice(0, 2) // Keep it focused
    }

    const activeErrors = getActiveErrors()
    const smartSuggestions = getSmartSuggestions()
    const hasErrors = activeErrors.length > 0

    // Get progress status
    const getProgressStatus = () => {
        if (hasErrors) return { color: 'text-amber-400', bg: 'bg-amber-400/10', text: 'Needs attention' }
        if (completionPercentage >= 80) return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', text: 'Looking great!' }
        if (completionPercentage >= 50) return { color: 'text-blue-400', bg: 'bg-blue-400/10', text: 'Good progress' }
        return { color: 'text-gray-400', bg: 'bg-gray-400/10', text: 'Getting started' }
    }

    const progressStatus = getProgressStatus()

    return (
        <div className="space-y-6 sticky top-24">
            {/* Progress Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Target className="w-5 h-5 text-[#00FF89]" />
                        <span>Progress</span>
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${progressStatus.bg} ${progressStatus.color}`}>
                        {progressStatus.text}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Step {currentStep} of 6</span>
                        <span className="text-lg font-bold text-white">{completionPercentage}%</span>
                    </div>

                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-2 bg-gradient-to-r from-[#00FF89] to-emerald-400 rounded-full"
                            style={{ width: `${completionPercentage}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{isDirty ? 'Saving...' : lastSaved ? 'Saved' : 'Draft'}</span>
                        </div>
                        <span>{stepInfo.title}</span>
                    </div>
                </div>
            </motion.div>

            {/* Errors - Clean & Focused */}
            {hasErrors && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-red-950/80 to-red-900/60 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-red-100">Quick Fixes</h3>
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">{activeErrors.length}</span>
                    </div>

                    <div className="space-y-3">
                        {activeErrors.map((error, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-3 p-3 bg-red-900/30 rounded-xl">
                                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-red-100">{error.field}</p>
                                    <p className="text-xs text-red-300 mt-1">{error.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-950/80 to-indigo-900/60 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-blue-100">Smart Suggestions</h3>
                    </div>

                    <div className="space-y-3">
                        {smartSuggestions.map((suggestion, index) => {
                            const Icon = suggestion.icon
                            const colors = {
                                tip: 'bg-blue-900/40 text-blue-200',
                                success: 'bg-emerald-900/40 text-emerald-200',
                                progress: 'bg-amber-900/40 text-amber-200',
                                next: 'bg-indigo-900/40 text-indigo-200'
                            }

                            return (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl ${colors[suggestion.type]}`}>
                                    <div className="flex items-start space-x-3">
                                        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-80" />
                                        <div>
                                            <h4 className="font-medium text-sm">{suggestion.title}</h4>
                                            <p className="text-sm mt-1 opacity-90">{suggestion.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* Step Guidance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center space-x-2 mb-4">
                    <BookOpen className="w-5 h-5 text-[#00FF89]" />
                    <h3 className="text-lg font-semibold text-white">Step Guide</h3>
                </div>

                {stepInfo.tips && (
                    <div className="space-y-3">
                        {stepInfo.tips.slice(0, 3).map((tip, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-xl">
                                <div className="w-1.5 h-1.5 bg-[#00FF89] rounded-full mt-2 flex-shrink-0" />
                                <p className="text-sm text-gray-300">{tip}</p>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Pro Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-emerald-950/80 to-teal-900/60 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6">
                <div className="flex items-center space-x-2 mb-4">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-emerald-100">Pro Tips</h3>
                </div>

                <div className="space-y-2">
                    {currentStep === 1 && (
                        <div className="space-y-2">
                            <p className="text-sm text-emerald-200">• Use benefit-focused titles that solve problems</p>
                            <p className="text-sm text-emerald-200">• Include your target audience when relevant</p>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-2">
                            <p className="text-sm text-emerald-200">• Use specific outcomes with numbers</p>
                            <p className="text-sm text-emerald-200">• Include action verbs in your steps</p>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-2">
                            <p className="text-sm text-emerald-200">• List tools in order of importance</p>
                            <p className="text-sm text-emerald-200">• Be transparent about complexity</p>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-2">
                            <p className="text-sm text-emerald-200">• High-quality images increase sales 3x</p>
                            <p className="text-sm text-emerald-200">• Use searchable, descriptive tags</p>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-2">
                            <p className="text-sm text-emerald-200">• Address common buyer objections</p>
                            <p className="text-sm text-emerald-200">• Be specific about response times</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}


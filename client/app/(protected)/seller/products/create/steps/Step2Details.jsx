'use client'
import { motion } from 'framer-motion'
import { useState, useCallback, useMemo } from 'react'
import { Plus, X, GripVertical, Lightbulb, HelpCircle, Save, Check, Target, TrendingUp, Users, Settings, ArrowRight } from 'lucide-react'
import { useProductCreateStore } from '@/store/productCreate'
import { VALIDATION_LIMITS } from '@/lib/constants/productCreate'
const FIELD_HELP = {
    targetAudience: {
        title: "Target Audience Guide",
        content: "Define who will benefit most from your product. Be specific about company size, role, or industry.",
        examples: ["Small SaaS companies (10-50 employees)", "Marketing managers in e-commerce", "Freelance consultants"]
    },
    keyBenefits: {
        title: "Key Benefits Tips",
        content: "Focus on specific, measurable outcomes. What problems does your product solve?",
        examples: ["Save 15 hours per week on manual data entry", "Increase lead conversion by 40%", "Reduce customer support tickets by 60%"]
    },
    useCaseExamples: {
        title: "Use Case Examples",
        content: "Provide real-world scenarios where your product adds value. Be specific and relatable.",
        examples: ["Qualifying leads from website contact forms", "Automating follow-up emails for webinar attendees", "Creating personalized proposals for sales prospects"]
    },
    howItWorks: {
        title: "How It Works Guide",
        content: "Break down your product into clear, actionable steps. Keep each step focused on one main action.",
        examples: ["Connect your CRM", "Set up automation rules", "Monitor results dashboard"]
    },
    expectedOutcomes: {
        title: "Expected Outcomes",
        content: "Share realistic results customers can expect. Use specific metrics when possible.",
        examples: ["40% increase in qualified leads", "Reduce response time from 24 hours to 2 hours", "Save $2,000 monthly on manual processes"]
    }
}
const getEnhancedErrorMessage = (field, error) => {
    const errorMap = {
        targetAudience: {
            'required': 'Target audience helps customers understand if your product is right for them.',
            'minLength': 'Add more detail about who your ideal customer is.',
            'maxLength': 'Keep target audience concise and focused on key characteristics.'
        },
        keyBenefits: {
            'required': 'Key benefits help customers understand your product\'s value proposition.',
            'minItems': 'Add at least 2-3 key benefits to showcase your product\'s value.',
            'maxItems': `Maximum ${VALIDATION_LIMITS.BENEFITS_MAX} benefits allowed for clarity.`
        },
        useCaseExamples: {
            'required': 'Use case examples help customers see how they might use your product.',
            'minItems': 'Add 2-3 specific use cases to help customers relate to your product.',
            'maxItems': `Maximum ${VALIDATION_LIMITS.USE_CASES_MAX} use cases to keep focused.`
        },
        howItWorks: {
            'required': 'How it works is required to help customers understand your product process.',
            'minSteps': `Add at least ${VALIDATION_LIMITS.HOW_IT_WORKS_MIN_STEPS} detailed steps explaining your product workflow.`,
            'incomplete': 'Each step needs both a title and detailed explanation.'
        },
        expectedOutcomes: {
            'required': 'Expected outcomes help set realistic expectations for customers.',
            'minItems': 'Add 2-3 specific outcomes customers can expect.',
            'maxItems': 'Keep outcomes focused on the most important results.'
        }
    }
    return errorMap[field]?.[error] || error
}
const Tooltip = ({ content, examples, children }) => {
    const [isVisible, setIsVisible] = useState(false)
    return (
        <div className="relative inline-block">
            <button
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-[#00FF89] transition-colors">
                <HelpCircle className="w-4 h-4" />
            </button>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-50 left-0 top-full mt-2 w-80 p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
                    <h4 className="text-base font-semibold text-[#00FF89] mb-2">{content.title}</h4>
                    <p className="text-lg text-gray-300 mb-3">{content.content}</p>
                    {examples && examples.length > 0 && (
                        <div>
                            <p className="text-base text-gray-400 mb-2">Examples:</p>
                            <ul className="space-y-1">
                                {examples.map((example, index) => (
                                    <li key={index} className="text-base text-gray-300 bg-gray-700 px-2 py-1 rounded">
                                        {example}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}
const AutoSaveIndicator = () => {
    const lastSaved = useProductCreateStore((state) => state.lastSaved)
    const isDirty = useProductCreateStore((state) => state.isDirty)
    const [showSaved, setShowSaved] = useState(false)
    const status = useMemo(() => {
        if (isDirty) return { icon: Save, text: 'Unsaved changes', color: 'text-yellow-400' }
        if (lastSaved) {
            if (!showSaved) setShowSaved(true)
            setTimeout(() => setShowSaved(false), 2000)
            return { icon: Check, text: 'All changes saved', color: 'text-[#00FF89]' }
        }
        return { icon: Save, text: 'Auto-save enabled', color: 'text-gray-400' }
    }, [lastSaved, isDirty, showSaved])
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 text-base bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
            <status.icon className={`w-3 h-3 ${status.color}`} />
            <span className={status.color}>{status.text}</span>
        </motion.div>
    )
}
export default function Step2Details() {
    const targetAudience = useProductCreateStore((state) => state.targetAudience)
    const keyBenefits = useProductCreateStore((state) => state.keyBenefits)
    const useCaseExamples = useProductCreateStore((state) => state.useCaseExamples)
    const howItWorks = useProductCreateStore((state) => state.howItWorks)
    const expectedOutcomes = useProductCreateStore((state) => state.expectedOutcomes)
    const errors = useProductCreateStore((state) => state.errors)
    const touchedFields = useProductCreateStore((state) => state.touchedFields)
    const setField = useProductCreateStore((state) => state.setField)
    const addToArray = useProductCreateStore((state) => state.addToArray)
    const removeFromArray = useProductCreateStore((state) => state.removeFromArray)
    const updateArrayItem = useProductCreateStore((state) => state.updateArrayItem)
    const markFieldTouched = useProductCreateStore((state) => state.markFieldTouched)
    const validateTouchedFields = useProductCreateStore((state) => state.validateTouchedFields)
    const addHowItWorksStep = () => {
        addToArray('howItWorks', { title: '', detail: '' })
    }
    const removeHowItWorksStep = (index) => {
        if (howItWorks.length > 1) {
            removeFromArray('howItWorks', index)
        }
    }
    const updateHowItWorksStep = (index, field, value) => {
        const updatedStep = { ...howItWorks[index], [field]: value }
        updateArrayItem('howItWorks', index, updatedStep)
    }
    const handleFieldBlur = (fieldName) => {
        markFieldTouched(fieldName)
        validateTouchedFields()
    }
    const showError = (fieldName) => {
        return touchedFields[fieldName] && errors[fieldName]
    }
    const validHowItWorksSteps = howItWorks.filter((step) => step.title.trim() && step.detail.trim()).length
    return (
        <div className="space-y-10">
            <div className="flex justify-end">
                <AutoSaveIndicator />
            </div>
            <div className="text-center pb-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-semibold text-white mb-2">Product Details & Process</h2>
                <p className="text-lg text-gray-400">Help customers understand your product's value and how it works</p>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label htmlFor="targetAudience" className="block text-lg font-semibold text-white">
                        Target Audience
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.targetAudience} examples={FIELD_HELP.targetAudience.examples} />
                </div>
                <input
                    id="targetAudience"
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setField('targetAudience', e.target.value)}
                    onBlur={() => handleFieldBlur('targetAudience')}
                    placeholder="e.g., SaaS companies, marketing agencies, small business owners"
                    className={`w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${showError('targetAudience') ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                        }`}
                />
                {showError('targetAudience') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('targetAudience', errors.targetAudience)}
                    </div>
                )}
            </motion.div>
            <div className="border-l-4 border-[#00FF89]/30 pl-6 py-4 bg-gray-800/20 rounded-r-lg">
                <p className="text-base text-gray-300">
                    <Target className="w-4 h-4 inline mr-2" />
                    <span className="font-medium">Pro tip:</span> Specific target audiences help customers self-identify if your product is right for them
                </p>
            </div>
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-base text-gray-400 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Benefits & Use Cases</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">
                        Key Benefits
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.keyBenefits} examples={FIELD_HELP.keyBenefits.examples} />
                </div>
                <div className="space-y-3">
                    {keyBenefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={benefit}
                                onChange={(e) => updateArrayItem('keyBenefits', index, e.target.value)}
                                onBlur={() => handleFieldBlur('keyBenefits')}
                                placeholder="e.g., Save 10+ hours per week on manual tasks"
                                className="flex-1 px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                            />
                            <button
                                onClick={() => removeFromArray('keyBenefits', index)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                    {keyBenefits.length < VALIDATION_LIMITS.BENEFITS_MAX && (
                        <button
                            onClick={() => addToArray('keyBenefits', '')}
                            className="flex items-center space-x-2 px-5 py-3 text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all">
                            <Plus className="w-5 h-5" />
                            <span className="text-lg font-medium">Add Benefit</span>
                        </button>
                    )}
                </div>
                {showError('keyBenefits') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('keyBenefits', errors.keyBenefits)}
                    </div>
                )}
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">
                        Use Case Examples
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.useCaseExamples} examples={FIELD_HELP.useCaseExamples.examples} />
                </div>
                <div className="space-y-3">
                    {useCaseExamples.map((useCase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={useCase}
                                onChange={(e) => updateArrayItem('useCaseExamples', index, e.target.value)}
                                onBlur={() => handleFieldBlur('useCaseExamples')}
                                placeholder="e.g., Qualifying leads from website contact forms"
                                className="flex-1 px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                            />
                            <button
                                onClick={() => removeFromArray('useCaseExamples', index)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                    {useCaseExamples.length < VALIDATION_LIMITS.USE_CASES_MAX && (
                        <button
                            onClick={() => addToArray('useCaseExamples', '')}
                            className="flex items-center space-x-2 px-5 py-3 text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all">
                            <Plus className="w-5 h-5" />
                            <span className="text-lg font-medium">Add Use Case</span>
                        </button>
                    )}
                </div>
                {showError('useCaseExamples') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('useCaseExamples', errors.useCaseExamples)}
                    </div>
                )}
            </motion.div>
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-base text-gray-400 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Process Flow</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <label className="block text-lg font-semibold text-white">
                            How it Works *
                        </label>
                        <Tooltip content={FIELD_HELP.howItWorks} examples={FIELD_HELP.howItWorks.examples} />
                    </div>
                    <div className="text-base text-gray-400">
                        {validHowItWorksSteps}/{VALIDATION_LIMITS.HOW_IT_WORKS_MIN_STEPS} minimum steps
                        {validHowItWorksSteps >= VALIDATION_LIMITS.HOW_IT_WORKS_MIN_STEPS && (
                            <span className="text-[#00FF89] ml-2">✓ Complete</span>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    {howItWorks.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-5 bg-gray-800/50 border rounded-xl ${errors.howItWorks ? 'border-red-500/50' : 'border-gray-700'}`}>
                            <div className="flex items-start space-x-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-[#00FF89] text-black rounded-full font-bold text-lg mt-1 flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <input
                                        type="text"
                                        value={step.title}
                                        onChange={(e) => updateHowItWorksStep(index, 'title', e.target.value)}
                                        onBlur={() => handleFieldBlur('howItWorks')}
                                        placeholder={`Step ${index + 1} title (e.g., "Connect your tools")`}
                                        className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                                    />
                                    <textarea
                                        value={step.detail}
                                        onChange={(e) => updateHowItWorksStep(index, 'detail', e.target.value)}
                                        onBlur={() => handleFieldBlur('howItWorks')}
                                        placeholder={`Detailed explanation of step ${index + 1}`}
                                        rows={3}
                                        className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none"
                                    />
                                </div>
                                {howItWorks.length > 1 && (
                                    <button
                                        onClick={() => removeHowItWorksStep(index)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
                <button
                    onClick={addHowItWorksStep}
                    className="flex items-center space-x-2 px-5 py-3 text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all">
                    <Plus className="w-5 h-5" />
                    <span className="text-lg font-medium">Add Step</span>
                </button>
                {showError('howItWorks') && (
                    <div className="text-base text-red-400 flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4" />
                        <span>{getEnhancedErrorMessage('howItWorks', errors.howItWorks)}</span>
                    </div>
                )}
            </motion.div>
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-base text-gray-400 flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>Expected Results</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">
                        Expected Outcomes
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.expectedOutcomes} examples={FIELD_HELP.expectedOutcomes.examples} />
                </div>
                <div className="space-y-3">
                    {expectedOutcomes.map((outcome, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={outcome}
                                onChange={(e) => updateArrayItem('expectedOutcomes', index, e.target.value)}
                                onBlur={() => handleFieldBlur('expectedOutcomes')}
                                placeholder="e.g., 40% increase in lead conversion rate"
                                className="flex-1 px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                            />
                            <button
                                onClick={() => removeFromArray('expectedOutcomes', index)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                    <button
                        onClick={() => addToArray('expectedOutcomes', '')}
                        className="flex items-center space-x-2 px-5 py-3 text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all">
                        <Plus className="w-5 h-5" />
                        <span className="text-lg font-medium">Add Outcome</span>
                    </button>
                </div>
                {showError('expectedOutcomes') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('expectedOutcomes', errors.expectedOutcomes)}
                    </div>
                )}
            </motion.div>
            {validHowItWorksSteps >= VALIDATION_LIMITS.HOW_IT_WORKS_MIN_STEPS && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 p-5 bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse"></div>
                        <h4 className="text-lg font-semibold text-[#00FF89]">How it Works Preview</h4>
                    </div>
                    <div className="space-y-4">
                        {howItWorks
                            .filter((step) => step.title.trim() && step.detail.trim())
                            .map((step, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-4">
                                    <div className="flex items-center justify-center w-8 h-8 bg-[#00FF89] text-black rounded-full font-bold text-base flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h5 className="text-lg font-semibold text-white">{step.title}</h5>
                                        <p className="text-lg text-gray-400 mt-1">{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
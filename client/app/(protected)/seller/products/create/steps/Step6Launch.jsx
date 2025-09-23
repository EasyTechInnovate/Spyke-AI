'use client'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { Plus, X, HelpCircle, Save, Check, MessageSquare, Shield, Users, BookOpen, Info } from 'lucide-react'
import { useProductCreateStore } from '@/store/productCreate'
import { VALIDATION_LIMITS } from '@/lib/constants/productCreate'
const FIELD_HELP = {
    supportAndMaintenance: {
        title: "Support & Maintenance Guide",
        content: "Explain what kind of support customers can expect after purchase. Be clear about response times and channels.",
        examples: ["24/7 email support with 24-hour response", "Weekly updates and bug fixes", "Access to community forum and documentation"]
    },
    faq: {
        title: "FAQ Strategy",
        content: "Answer the most common questions customers ask before buying. Focus on concerns about implementation, results, and support.",
        examples: ["How long does setup take?", "What if it doesn't work with my CRM?", "Do I need technical skills?"]
    },
    targetAudience: {
        title: "Target Audience Guide",
        content: "Be specific about who will benefit most from your product. This helps customers self-qualify.",
        examples: ["Small business owners with 10-50 employees", "Marketing agencies handling lead generation", "SaaS companies needing user onboarding automation"]
    },
    keyBenefits: {
        title: "Key Benefits Tips",
        content: "Focus on outcomes and results rather than features. What specific problems does your product solve?",
        examples: ["Reduces lead qualification time by 80%", "Increases conversion rates by 40%", "Saves 10+ hours per week on manual tasks"]
    },
    useCaseExamples: {
        title: "Use Case Examples",
        content: "Provide concrete scenarios where your product adds value. Make it easy for customers to see themselves using it.",
        examples: ["E-commerce store automating abandoned cart recovery", "Real estate agency qualifying leads from Facebook ads"]
    },
    expectedOutcomes: {
        title: "Expected Outcomes Guide",
        content: "Set realistic expectations about what customers can achieve. Include timelines and measurable results.",
        examples: ["See first results within 24 hours of setup", "Typically increase qualified leads by 50% in first month"]
    }
}
const getEnhancedErrorMessage = (field, error) => {
    const errorMap = {
        supportAndMaintenance: {
            'required': 'Let customers know what support they can expect after purchase.',
            'minLength': 'Provide more details about your support offerings and maintenance policy.',
            'maxLength': 'Keep support information concise and focused on key points.'
        },
        faq: {
            'required': 'Add frequently asked questions to address common customer concerns.',
            'minItems': 'Include at least 3-5 FAQ items to cover the most important questions.',
            'maxItems': `Maximum ${VALIDATION_LIMITS.FAQ_MAX} FAQ items to keep the section focused.`
        },
        targetAudience: {
            'minLength': 'Be more specific about who your ideal customers are.',
            'maxLength': 'Keep target audience description focused and concise.'
        },
        keyBenefits: {
            'minItems': 'Add at least 3-5 key benefits to show the value of your product.',
            'maxItems': 'Focus on the most important benefits to avoid overwhelming customers.'
        }
    }
    return errorMap[field]?.[error] || error
}
const Tooltip = ({ content, examples }) => {
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
                    <h4 className="text-sm font-semibold text-[#00FF89] mb-2">{content.title}</h4>
                    <p className="text-sm text-gray-300 mb-3">{content.content}</p>
                    {examples && examples.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-400 mb-2">Examples:</p>
                            <ul className="space-y-1">
                                {examples.map((example, index) => (
                                    <li key={index} className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
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
            className="flex items-center space-x-2 text-xs bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
            <status.icon className={`w-3 h-3 ${status.color}`} />
            <span className={status.color}>{status.text}</span>
        </motion.div>
    )
}
export default function Step6FinalDetails() {
    const targetAudience = useProductCreateStore((state) => state.targetAudience)
    const keyBenefits = useProductCreateStore((state) => state.keyBenefits)
    const useCaseExamples = useProductCreateStore((state) => state.useCaseExamples)
    const expectedOutcomes = useProductCreateStore((state) => state.expectedOutcomes)
    const supportAndMaintenance = useProductCreateStore((state) => state.supportAndMaintenance)
    const faq = useProductCreateStore((state) => state.faq)
    const errors = useProductCreateStore((state) => state.errors)
    const touchedFields = useProductCreateStore((state) => state.touchedFields)
    const setField = useProductCreateStore((state) => state.setField)
    const addToArray = useProductCreateStore((state) => state.addToArray)
    const removeFromArray = useProductCreateStore((state) => state.removeFromArray)
    const updateArrayItem = useProductCreateStore((state) => state.updateArrayItem)
    const markFieldTouched = useProductCreateStore((state) => state.markFieldTouched)
    const validateTouchedFields = useProductCreateStore((state) => state.validateTouchedFields)
    const handleFieldBlur = (fieldName) => {
        markFieldTouched(fieldName)
        validateTouchedFields()
    }
    const showError = (fieldName) => {
        return touchedFields[fieldName] && errors[fieldName]
    }
    return (
        <div className="space-y-10">
            <div className="flex justify-end">
                <AutoSaveIndicator />
            </div>
            <div className="text-center pb-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-semibold text-white mb-2">Final Details & Support</h2>
                <p className="text-lg text-gray-400">Complete your product with essential details and customer support information</p>
            </div>
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-base text-gray-400 flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Customer Information</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
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
                <p className="text-base text-gray-400 mb-4">Describe who will benefit most from your product</p>
                <textarea
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setField('targetAudience', e.target.value)}
                    onBlur={() => handleFieldBlur('targetAudience')}
                    placeholder="e.g., Small business owners with 10-50 employees who want to automate their lead qualification process..."
                    rows={4}
                    className={`w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${showError('targetAudience')
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                        }`}
                />
                {showError('targetAudience') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('targetAudience', errors.targetAudience)}
                    </div>
                )}
            </motion.div>
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
                <p className="text-base text-gray-400 mb-4">List the main benefits customers will get from your product</p>
                <div className="space-y-4">
                    {keyBenefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-[#00FF89] text-black rounded-full font-bold text-lg mt-2 flex-shrink-0">
                                {index + 1}
                            </div>
                            <textarea
                                value={benefit}
                                onChange={(e) => updateArrayItem('keyBenefits', index, e.target.value)}
                                placeholder={`Key benefit ${index + 1}...`}
                                rows={2}
                                className="flex-1 px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none"
                            />
                            <button
                                onClick={() => removeFromArray('keyBenefits', index)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                    <button
                        onClick={() => addToArray('keyBenefits', '')}
                        className="flex items-center space-x-2 px-5 py-3 text-lg text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all">
                        <Plus className="w-5 h-5" />
                        <span>Add Key Benefit</span>
                    </button>
                </div>
                {showError('keyBenefits') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('keyBenefits', errors.keyBenefits)}
                    </div>
                )}
            </motion.div>
            <div className="border-l-4 border-[#00FF89]/30 pl-6 py-4 bg-gray-800/20 rounded-r-lg">
                <p className="text-base text-gray-300">
                    <Info className="w-4 h-4 inline mr-2" />
                    <span className="font-medium">Pro tip:</span> Focus on specific, measurable benefits that customers care about most
                </p>
            </div>
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
                <p className="text-base text-gray-400 mb-4">Provide real-world scenarios where your product adds value</p>
                <div className="space-y-4">
                    {useCaseExamples.map((useCase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-[#00FF89] text-black rounded-full font-bold text-lg mt-2 flex-shrink-0">
                                {index + 1}
                            </div>
                            <textarea
                                value={useCase}
                                onChange={(e) => updateArrayItem('useCaseExamples', index, e.target.value)}
                                placeholder={`Use case example ${index + 1}...`}
                                rows={3}
                                className="flex-1 px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none"
                            />
                            <button
                                onClick={() => removeFromArray('useCaseExamples', index)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                    <button
                        onClick={() => addToArray('useCaseExamples', '')}
                        className="flex items-center space-x-2 px-5 py-3 text-lg text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all">
                        <Plus className="w-5 h-5" />
                        <span>Add Use Case Example</span>
                    </button>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">
                        Expected Outcomes
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.expectedOutcomes} examples={FIELD_HELP.expectedOutcomes.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">Set realistic expectations about what customers can achieve</p>
                <div className="space-y-4">
                    {expectedOutcomes.map((outcome, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-[#00FF89] text-black rounded-full font-bold text-lg mt-2 flex-shrink-0">
                                {index + 1}
                            </div>
                            <textarea
                                value={outcome}
                                onChange={(e) => updateArrayItem('expectedOutcomes', index, e.target.value)}
                                placeholder={`Expected outcome ${index + 1}...`}
                                rows={2}
                                className="flex-1 px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none"
                            />
                            <button
                                onClick={() => removeFromArray('expectedOutcomes', index)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors mt-2">
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                    <button
                        onClick={() => addToArray('expectedOutcomes', '')}
                        className="flex items-center space-x-2 px-5 py-3 text-lg text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all">
                        <Plus className="w-5 h-5" />
                        <span>Add Expected Outcome</span>
                    </button>
                </div>
            </motion.div>
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-base text-gray-400 flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Support & Maintenance</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label htmlFor="supportAndMaintenance" className="block text-lg font-semibold text-white">
                        Support & Maintenance *
                    </label>
                    <Tooltip content={FIELD_HELP.supportAndMaintenance} examples={FIELD_HELP.supportAndMaintenance.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">Explain what support customers can expect after purchase</p>
                <textarea
                    id="supportAndMaintenance"
                    value={supportAndMaintenance}
                    onChange={(e) => setField('supportAndMaintenance', e.target.value)}
                    onBlur={() => handleFieldBlur('supportAndMaintenance')}
                    placeholder="e.g., 24/7 email support with 24-hour response time. Weekly updates and bug fixes included. Access to private community forum and comprehensive documentation."
                    rows={5}
                    className={`w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${showError('supportAndMaintenance')
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                        }`}
                />
                {showError('supportAndMaintenance') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('supportAndMaintenance', errors.supportAndMaintenance)}
                    </div>
                )}
            </motion.div>
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-base text-gray-400 flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Frequently Asked Questions</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">Frequently Asked Questions *</label>
                    <Tooltip content={FIELD_HELP.faq} examples={FIELD_HELP.faq.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">
                    Answer common customer questions (max {VALIDATION_LIMITS.FAQ_MAX})
                </p>
                <div className="space-y-6">
                    {faq.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-[#00FF89] flex items-center space-x-2">
                                    <MessageSquare className="w-5 h-5" />
                                    <span>FAQ #{index + 1}</span>
                                </h4>
                                <button
                                    onClick={() => removeFromArray('faq', index)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-lg font-semibold text-white mb-2">Question</label>
                                    <input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) =>
                                            updateArrayItem('faq', index, { ...item, question: e.target.value })
                                        }
                                        placeholder="What is your question?"
                                        className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-lg font-semibold text-white mb-2">Answer</label>
                                    <textarea
                                        value={item.answer}
                                        onChange={(e) =>
                                            updateArrayItem('faq', index, { ...item, answer: e.target.value })
                                        }
                                        placeholder="Provide a detailed answer..."
                                        rows={4}
                                        className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {faq.length < VALIDATION_LIMITS.FAQ_MAX && (
                        <button
                            onClick={() => addToArray('faq', { question: '', answer: '' })}
                            className="flex items-center space-x-2 px-5 py-3 text-lg text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all w-full">
                            <Plus className="w-5 h-5" />
                            <span>Add FAQ Item ({faq.length}/{VALIDATION_LIMITS.FAQ_MAX})</span>
                        </button>
                    )}
                </div>
                {showError('faq') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('faq', errors.faq)}
                    </div>
                )}
            </motion.div>
            {(targetAudience || keyBenefits.length > 0 || supportAndMaintenance || faq.length > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="p-5 bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse"></div>
                        <h4 className="text-lg font-semibold text-[#00FF89]">Final Details Summary</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-lg">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#00FF89] mb-1">
                                {targetAudience ? '✓' : '-'}
                            </div>
                            <div className="text-gray-400">Target Audience</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#00FF89] mb-1">{keyBenefits.length}</div>
                            <div className="text-gray-400">Key Benefits</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#00FF89] mb-1">
                                {supportAndMaintenance ? '✓' : '-'}
                            </div>
                            <div className="text-gray-400">Support Info</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#00FF89] mb-1">{faq.filter(f => f.question && f.answer).length}</div>
                            <div className="text-gray-400">FAQ Items</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
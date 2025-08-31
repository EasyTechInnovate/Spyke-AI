'use client'

import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { Plus, X, FileText, Code, Settings, HelpCircle, Save, Check, Sparkles, Package, File } from 'lucide-react'
import { useProductCreateStore } from '@/store/productCreate'

// Enhanced tooltips with contextual help
const FIELD_HELP = {
    promptText: {
        title: "Prompt Text Guide",
        content: "Provide the exact prompt users will copy and use. Make it clear, actionable, and well-structured.",
        examples: ["Act as a [role] and help me [specific task]", "Analyze the following data and provide insights on [specific area]"]
    },
    promptInstructions: {
        title: "Prompt Instructions",
        content: "Explain how to use the prompt effectively, including context and best practices.",
        examples: ["Replace [variables] with your specific information", "Use this prompt after gathering customer data"]
    },
    automationInstructions: {
        title: "Automation Setup Guide",
        content: "Provide clear, step-by-step instructions for setting up the automation workflow.",
        examples: ["1. Connect your CRM to Zapier", "2. Create a new automation with the trigger 'New Lead'"]
    },
    agentConfiguration: {
        title: "Agent Configuration",
        content: "Provide JSON configuration for AI agents, including model settings and behavior parameters.",
        examples: ["Include model type, temperature, max tokens, and system prompts"]
    },
    detailedSteps: {
        title: "Detailed Steps",
        content: "Break down complex processes into clear, actionable steps with specific instructions.",
        examples: ["Step 1: Open your automation platform", "Step 2: Create a new workflow"]
    },
    fileAttachments: {
        title: "File Attachments",
        content: "Upload supporting files that enhance your product's value. Include templates, configs, and examples.",
        examples: ["Zapier automation templates", "Sample data files", "Configuration examples"]
    }
}

// Enhanced error messages
const getEnhancedErrorMessage = (field, error) => {
    const errorMap = {
        promptText: {
            'minLength': 'Add more detail to make the prompt useful and actionable.',
            'maxLength': 'Keep the prompt concise for better usability.'
        },
        promptInstructions: {
            'minLength': 'Provide clear instructions on how to use the prompt effectively.',
            'maxLength': 'Keep instructions focused and easy to follow.'
        },
        automationInstructions: {
            'minLength': 'Add detailed setup steps to help users implement the automation.',
            'maxLength': 'Break down complex instructions into smaller, manageable steps.'
        },
        detailedHowItWorks: {
            'minItems': 'Add at least 3 detailed steps to provide comprehensive guidance.',
            'maxItems': 'Too many steps can overwhelm users. Focus on the essential ones.'
        }
    }

    return errorMap[field]?.[error] || error
}

// Tooltip component (reused from Step1)
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
                    <h4 className="text-base font-semibold text-[#00FF89] mb-2">{content.title}</h4>
                    <p className="text-base text-gray-300 mb-3">{content.content}</p>
                    {examples && examples.length > 0 && (
                        <div>
                            <p className="text-lg text-gray-400 mb-2">Examples:</p>
                            <ul className="space-y-1">
                                {examples.map((example, index) => (
                                    <li key={index} className="text-lg text-gray-300 bg-gray-700 px-2 py-1 rounded">
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

// Auto-save indicator (reused from Step1)
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

export default function Step4Premium() {
    const premiumContent = useProductCreateStore((state) => state.premiumContent)
    const productType = useProductCreateStore((state) => state.type)
    const errors = useProductCreateStore((state) => state.errors)
    const touchedFields = useProductCreateStore((state) => state.touchedFields)

    const setField = useProductCreateStore((state) => state.setField)
    const addToArray = useProductCreateStore((state) => state.addToArray)
    const removeFromArray = useProductCreateStore((state) => state.removeFromArray)
    const updateArrayItem = useProductCreateStore((state) => state.updateArrayItem)
    const markFieldTouched = useProductCreateStore((state) => state.markFieldTouched)
    const validateTouchedFields = useProductCreateStore((state) => state.validateTouchedFields)

    const updatePremiumField = (field, value) => {
        setField(`premiumContent.${field}`, value)
    }

    const handleFieldBlur = (fieldName) => {
        markFieldTouched(fieldName)
        validateTouchedFields()
    }

    const showError = (fieldName) => {
        return touchedFields[fieldName] && errors[fieldName]
    }

    return (
        <div className="space-y-10">
            {/* Auto-save indicator */}
            <div className="flex justify-end">
                <AutoSaveIndicator />
            </div>

            {/* Visual break - Welcome section */}
            <div className="text-center pb-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-semibold text-white mb-2">Premium Content & Assets</h2>
                <p className="text-lg text-gray-400">Add valuable content that customers receive after purchase</p>
            </div>

            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l-4 border-[#00FF89]/30 pl-6 py-4 bg-gray-800/20 rounded-r-lg">
                <p className="text-base text-gray-300">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    <span className="font-medium">Premium Content:</span> All fields are optional but can significantly increase your product's value
                </p>
            </motion.div>

            {/* Content Section */}
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-lg text-gray-400 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Content & Instructions</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Prompt Text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label htmlFor="promptText" className="block text-lg font-semibold text-white">
                        Prompt Text
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.promptText} examples={FIELD_HELP.promptText.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">Enter the actual prompt that users will copy and use</p>
                <textarea
                    id="promptText"
                    value={premiumContent.promptText || ''}
                    onChange={(e) => updatePremiumField('promptText', e.target.value)}
                    onBlur={() => handleFieldBlur('promptText')}
                    placeholder="Enter the actual prompt that users will copy and use..."
                    rows={6}
                    className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none font-mono"
                />
                {showError('promptText') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('promptText', errors.promptText)}
                    </div>
                )}
            </motion.div>

            {/* Prompt Instructions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label htmlFor="promptInstructions" className="block text-lg font-semibold text-white">
                        Prompt Instructions
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.promptInstructions} examples={FIELD_HELP.promptInstructions.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">Detailed instructions on how to use this prompt effectively</p>
                <textarea
                    id="promptInstructions"
                    value={premiumContent.promptInstructions || ''}
                    onChange={(e) => updatePremiumField('promptInstructions', e.target.value)}
                    onBlur={() => handleFieldBlur('promptInstructions')}
                    placeholder="Detailed instructions on how to use this prompt effectively..."
                    rows={4}
                    className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none"
                />
                {showError('promptInstructions') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('promptInstructions', errors.promptInstructions)}
                    </div>
                )}
            </motion.div>

            {/* Automation Instructions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label htmlFor="automationInstructions" className="block text-lg font-semibold text-white">
                        Automation Instructions
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.automationInstructions} examples={FIELD_HELP.automationInstructions.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">Step-by-step setup instructions for the automation</p>
                <textarea
                    id="automationInstructions"
                    value={premiumContent.automationInstructions || ''}
                    onChange={(e) => updatePremiumField('automationInstructions', e.target.value)}
                    onBlur={() => handleFieldBlur('automationInstructions')}
                    placeholder="Step-by-step setup instructions for the automation..."
                    rows={5}
                    className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none"
                />
                {showError('automationInstructions') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('automationInstructions', errors.automationInstructions)}
                    </div>
                )}
            </motion.div>

            {/* Configuration Section */}
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-lg text-gray-400 flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>Technical Configuration</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Agent Configuration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label htmlFor="agentConfiguration" className="block text-lg font-semibold text-white">
                        Agent Configuration
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.agentConfiguration} examples={FIELD_HELP.agentConfiguration.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">JSON configuration for AI agent settings and behavior</p>
                <textarea
                    id="agentConfiguration"
                    value={premiumContent.agentConfiguration || ''}
                    onChange={(e) => updatePremiumField('agentConfiguration', e.target.value)}
                    onBlur={() => handleFieldBlur('agentConfiguration')}
                    placeholder={`{
  "agent_config": {
    "name": "YourAgent",
    "description": "Agent description",
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000,
    "system_prompt": "You are a specialized AI agent...",
    "tools": [
      {
        "name": "tool_name",
        "description": "tool description",
        "parameters": {}
      }
    ],
    "workflow": [
      {
        "step": 1,
        "action": "analyze_input",
        "description": "Process user input"
      }
    ]
  }
}`}
                    rows={8}
                    className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none font-mono"
                />
            </motion.div>

            {/* Process Section */}
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-lg text-gray-400 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Detailed Process</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Detailed How it Works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">
                        Detailed How it Works Steps
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </label>
                    <Tooltip content={FIELD_HELP.detailedSteps} examples={FIELD_HELP.detailedSteps.examples} />
                </div>
                <p className="text-base text-gray-400 mb-4">Provide step-by-step detailed instructions for your product</p>
                <div className="space-y-4">
                    {(premiumContent.detailedHowItWorks?.length > 0 ? premiumContent.detailedHowItWorks : ['']).map((step, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-[#00FF89] text-black rounded-full font-bold text-lg mt-1 flex-shrink-0">
                                {index + 1}
                            </div>
                            <textarea
                                value={step}
                                onChange={(e) => {
                                    if (premiumContent.detailedHowItWorks?.length > 0) {
                                        updateArrayItem('premiumContent.detailedHowItWorks', index, e.target.value)
                                    } else {
                                        addToArray('premiumContent.detailedHowItWorks', e.target.value)
                                    }
                                }}
                                placeholder={`Detailed step ${index + 1} description...`}
                                rows={3}
                                className="flex-1 px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none"
                            />
                            {premiumContent.detailedHowItWorks?.length > 0 && (
                                <button
                                    onClick={() => removeFromArray('premiumContent.detailedHowItWorks', index)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors mt-1">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={() => addToArray('premiumContent.detailedHowItWorks', '')}
                        className="flex items-center space-x-2 px-5 py-3 text-lg text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all">
                        <Plus className="w-5 h-5" />
                        <span>Add Detailed Step</span>
                    </button>
                </div>
            </motion.div>

            {/* File Attachments Section */}
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-lg text-gray-400 flex items-center space-x-2">
                    <File className="w-4 h-4" />
                    <span>File Attachments</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* File Attachments */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-white">
                        File Attachments
                        <span className="text-gray-400 text-base ml-2">(Optional)</span>
                    </h3>
                    <Tooltip content={FIELD_HELP.fileAttachments} examples={FIELD_HELP.fileAttachments.examples} />
                </div>
                <p className="text-base text-gray-400 mb-6">Upload additional files that buyers will receive with their purchase</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Automation Files */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">Automation Files</label>
                        <div className="space-y-4">
                            {premiumContent.automationFiles?.map((file, index) => (
                                <div key={index} className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={file.name || ''}
                                            onChange={(e) => {
                                                const updatedFile = { ...file, name: e.target.value }
                                                updateArrayItem('premiumContent.automationFiles', index, updatedFile)
                                            }}
                                            placeholder="File name"
                                            className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                                        />
                                        <input
                                            type="url"
                                            value={file.url || ''}
                                            onChange={(e) => {
                                                const updatedFile = { ...file, url: e.target.value }
                                                updateArrayItem('premiumContent.automationFiles', index, updatedFile)
                                            }}
                                            placeholder="File URL"
                                            className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                                        />
                                        <div className="flex items-center justify-between">
                                            <select
                                                value={file.type || 'json'}
                                                onChange={(e) => {
                                                    const updatedFile = { ...file, type: e.target.value }
                                                    updateArrayItem('premiumContent.automationFiles', index, updatedFile)
                                                }}
                                                className="px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all">
                                                <option value="json">JSON</option>
                                                <option value="csv">CSV</option>
                                                <option value="xml">XML</option>
                                                <option value="txt">TXT</option>
                                                <option value="zip">ZIP</option>
                                            </select>
                                            <button
                                                onClick={() => removeFromArray('premiumContent.automationFiles', index)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => addToArray('premiumContent.automationFiles', { name: '', url: '', type: 'json' })}
                                className="flex items-center space-x-2 px-5 py-3 text-lg text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all w-full">
                                <Plus className="w-5 h-5" />
                                <span>Add Automation File</span>
                            </button>
                        </div>
                    </div>

                    {/* Agent Files */}
                    <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">Agent Files</label>
                        <div className="space-y-4">
                            {premiumContent.agentFiles?.map((file, index) => (
                                <div key={index} className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={file.name || ''}
                                            onChange={(e) => {
                                                const updatedFile = { ...file, name: e.target.value }
                                                updateArrayItem('premiumContent.agentFiles', index, updatedFile)
                                            }}
                                            placeholder="File name"
                                            className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                                        />
                                        <input
                                            type="url"
                                            value={file.url || ''}
                                            onChange={(e) => {
                                                const updatedFile = { ...file, url: e.target.value }
                                                updateArrayItem('premiumContent.agentFiles', index, updatedFile)
                                            }}
                                            placeholder="File URL"
                                            className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all"
                                        />
                                        <div className="flex items-center justify-between">
                                            <select
                                                value={file.type || 'py'}
                                                onChange={(e) => {
                                                    const updatedFile = { ...file, type: e.target.value }
                                                    updateArrayItem('premiumContent.agentFiles', index, updatedFile)
                                                }}
                                                className="px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all">
                                                <option value="py">Python</option>
                                                <option value="js">JavaScript</option>
                                                <option value="json">JSON</option>
                                                <option value="zip">ZIP</option>
                                            </select>
                                            <button
                                                onClick={() => removeFromArray('premiumContent.agentFiles', index)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => addToArray('premiumContent.agentFiles', { name: '', url: '', type: 'py' })}
                                className="flex items-center space-x-2 px-5 py-3 text-lg text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/10 transition-all w-full">
                                <Plus className="w-5 h-5" />
                                <span>Add Agent File</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Content Preview */}
            {Object.values(premiumContent || {}).some((value) => (Array.isArray(value) ? value.length > 0 : value)) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="p-5 bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse"></div>
                        <h4 className="text-lg font-semibold text-[#00FF89]">Premium Content Summary</h4>
                    </div>
                    <div className="space-y-2 text-lg">
                        {premiumContent.promptText && <div className="text-gray-300">✓ Prompt text provided</div>}
                        {premiumContent.promptInstructions && <div className="text-gray-300">✓ Prompt instructions included</div>}
                        {premiumContent.automationInstructions && <div className="text-gray-300">✓ Automation setup instructions</div>}
                        {premiumContent.agentConfiguration && <div className="text-gray-300">✓ Agent configuration details</div>}
                        {premiumContent.detailedHowItWorks?.length > 0 && (
                            <div className="text-gray-300">✓ {premiumContent.detailedHowItWorks.length} detailed steps</div>
                        )}
                        {premiumContent.automationFiles?.length > 0 && (
                            <div className="text-gray-300">✓ {premiumContent.automationFiles.length} automation files</div>
                        )}
                        {premiumContent.agentFiles?.length > 0 && (
                            <div className="text-gray-300">✓ {premiumContent.agentFiles.length} agent files</div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    )
}

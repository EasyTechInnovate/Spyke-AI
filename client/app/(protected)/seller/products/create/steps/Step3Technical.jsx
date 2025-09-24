'use client'
import { motion } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import {
    Bot,
    Zap,
    Workflow,
    Database,
    Globe,
    MessageSquare,
    Users,
    Mail,
    Target,
    Cloud,
    Phone,
    Settings,
    Clock,
    CheckCircle,
    X,
    HelpCircle,
    Save,
    Check,
    Cpu,
    Wrench
} from 'lucide-react'
import { useProductCreateStore } from '@/store/productCreate'
import { SETUP_TIMES } from '@/lib/constants/productCreate'
import { toolAPI } from '@/lib/api/toolsNiche'
import CustomSelect from '@/components/shared/CustomSelect'
const FIELD_HELP = {
    toolsUsed: {
        title: 'Tools & Platforms Guide',
        content: 'Select the specific tools your product uses. Choose tools that your customers are likely familiar with.',
        examples: ['ChatGPT for AI processing', 'Zapier for automation', 'HubSpot for CRM integration']
    },
    toolsConfiguration: {
        title: 'Integration Description',
        content: 'Explain how all selected tools work together in your solution. Be specific about the workflow.',
        examples: ['ChatGPT processes incoming leads → Zapier triggers automation → HubSpot stores qualified prospects']
    },
    setupTimeEstimate: {
        title: 'Setup Time Guide',
        content: "Be realistic about setup time. Consider your target audience's technical expertise.",
        examples: ['Under 1 hour: Simple integrations', '1-3 hours: Multiple tool setup', '3+ hours: Complex workflows']
    }
}
const getEnhancedErrorMessage = (field, error) => {
    const errorMap = {
        toolsUsed: {
            required: 'Select at least one tool to show customers what your product uses.',
            minItems: 'Add at least 2-3 tools to demonstrate the integration value.',
            maxItems: 'Too many tools can overwhelm customers. Focus on the essential ones.'
        },
        toolsConfiguration: {
            required: 'Explain how your selected tools work together. This helps customers understand the workflow.',
            minLength: 'Add more detail about the tool integration process.',
            maxLength: 'Keep the description focused and concise for better readability.'
        },
        setupTimeEstimate: {
            required: 'Setup time helps customers plan their implementation. Choose the most realistic estimate.'
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
                    <h4 className="text-lg font-semibold text-[#00FF89] mb-2">{content.title}</h4>
                    <p className="text-lg text-gray-300 mb-3">{content.content}</p>
                    {examples && examples.length > 0 && (
                        <div>
                            <p className="text-base text-gray-400 mb-2">Examples:</p>
                            <ul className="space-y-1">
                                {examples.map((example, index) => (
                                    <li
                                        key={index}
                                        className="text-base text-gray-300 bg-gray-700 px-2 py-1 rounded">
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
export default function Step3Technical() {
    const [tools, setTools] = useState([])
    const [loadingTools, setLoadingTools] = useState(true)
    const [toolsError, setToolsError] = useState(null)

    const toolsUsed = useProductCreateStore((state) => state.toolsUsed)
    const toolsConfiguration = useProductCreateStore((state) => state.toolsConfiguration)
    const setupTimeEstimate = useProductCreateStore((state) => state.setupTimeEstimate)
    const errors = useProductCreateStore((state) => state.errors)
    const touchedFields = useProductCreateStore((state) => state.touchedFields)
    const setField = useProductCreateStore((state) => state.setField)
    const markFieldTouched = useProductCreateStore((state) => state.markFieldTouched)
    const validateTouchedFields = useProductCreateStore((state) => state.validateTouchedFields)

    useEffect(() => {
        const fetchTools = async () => {
            try {
                setLoadingTools(true)
                setToolsError(null)
                const response = await toolAPI.getTools({ isActive: 'true' })
                const toolsData = response?.data?.tools || response?.tools || response?.data || []

                const formattedTools = Array.isArray(toolsData)
                    ? toolsData.map((tool) => ({
                          value: tool.name.toUpperCase().replace(/\s+/g, '_'),
                          label: tool.name,
                          icon: Wrench,
                          description: tool.description
                      }))
                    : []

                setTools(formattedTools)
            } catch (error) {
                console.error('Error fetching tools:', error)
                setToolsError('Failed to load tools. Please try again.')
                setTools([])
            } finally {
                setLoadingTools(false)
            }
        }

        fetchTools()
    }, [])

    const handleFieldBlur = (fieldName) => {
        markFieldTouched(fieldName)
        validateTouchedFields()
    }

    const showError = (fieldName) => {
        return touchedFields[fieldName] && errors[fieldName]
    }

    const handleToolSelection = (selectedValues) => {
        const selectedTools = selectedValues.map((value) => {
            const tool = tools.find((t) => t.value === value)
            return {
                name: tool.label,
                value: tool.value,
                configuration: ''
            }
        })
        setField('toolsUsed', selectedTools)
        handleFieldBlur('toolsUsed')
    }

    const updateToolConfiguration = (toolValue, configuration) => {
        const updated = toolsUsed.map((tool) => (tool.value === toolValue ? { ...tool, configuration } : tool))
        setField('toolsUsed', updated)
    }

    const selectedToolValues = toolsUsed.map((tool) => tool.value)

    return (
        <div className="space-y-10">
            <div className="flex justify-end">
                <AutoSaveIndicator />
            </div>

            <div className="text-center pb-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-semibold text-white mb-2">Technical Setup & Tools</h2>
                <p className="text-lg text-gray-400">Define the tools and technical requirements for your product</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <label className="block text-lg font-semibold text-white">Tools and Platforms Used *</label>
                        <Tooltip
                            content={FIELD_HELP.toolsUsed}
                            examples={FIELD_HELP.toolsUsed.examples}
                        />
                    </div>
                    <div className="text-base text-gray-400">{toolsUsed.length} selected</div>
                </div>

                {loadingTools ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF89]"></div>
                        <span className="ml-3 text-gray-400">Loading tools...</span>
                    </div>
                ) : toolsError ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400">{toolsError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm text-red-300 hover:text-red-200 underline">
                            Retry
                        </button>
                    </div>
                ) : tools.length === 0 ? (
                    <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
                        <p className="text-gray-400">No tools available. Please contact support.</p>
                    </div>
                ) : (
                    <CustomSelect
                        value={selectedToolValues}
                        onChange={handleToolSelection}
                        options={tools}
                        placeholder="Select the tools your product uses..."
                        multiple={true}
                        searchable={true}
                        showSelectedCount={true}
                        allowClear={true}
                        error={showError('toolsUsed')}
                        onBlur={() => handleFieldBlur('toolsUsed')}
                        maxHeight="max-h-80"
                    />
                )}

                {showError('toolsUsed') && <div className="text-base text-red-400">{getEnhancedErrorMessage('toolsUsed', errors.toolsUsed)}</div>}

                {toolsUsed.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        {toolsUsed.map((tool) => {
                            const toolData = tools.find((t) => t.value === tool.value)
                            const IconComponent = toolData?.icon || Wrench
                            return (
                                <div
                                    key={tool.value}
                                    className="flex items-center gap-2 p-2 bg-[#00FF89]/10 rounded-lg">
                                    <IconComponent className="w-4 h-4 text-[#00FF89]" />
                                    <span className="text-sm text-white truncate">{tool.name}</span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </motion.div>

            <div className="border-l-4 border-[#00FF89]/30 pl-6 py-4 bg-gray-800/20 rounded-r-lg">
                <p className="text-base text-gray-300">
                    <Cpu className="w-4 h-4 inline mr-2" />
                    <span className="font-medium">Pro tip:</span> Select tools your target audience is familiar with for easier adoption
                </p>
            </div>

            {toolsUsed.length > 0 && (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4">
                        <div className="flex items-center my-8">
                            <div className="flex-1 border-t border-gray-700"></div>
                            <div className="px-4 text-base text-gray-400 flex items-center space-x-2">
                                <Wrench className="w-4 h-4" />
                                <span>Individual Tool Setup</span>
                            </div>
                            <div className="flex-1 border-t border-gray-700"></div>
                        </div>
                        <div className="space-y-4">
                            {toolsUsed.map((tool, index) => {
                                const toolData = tools.find((t) => t.value === tool.value)
                                const IconComponent = toolData?.icon || Wrench
                                return (
                                    <motion.div
                                        key={tool.value}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <IconComponent className="w-6 h-6 text-[#00FF89]" />
                                                <h4 className="text-lg font-semibold text-white">{tool.name}</h4>
                                            </div>
                                        </div>
                                        <textarea
                                            value={tool.configuration || ''}
                                            onChange={(e) => updateToolConfiguration(tool.value, e.target.value)}
                                            placeholder={`Describe how ${tool.name} is configured and used in your solution...`}
                                            rows={3}
                                            className="w-full px-5 py-4 text-lg bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89] transition-all resize-none"
                                        />
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                </>
            )}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label
                        htmlFor="toolsConfiguration"
                        className="block text-lg font-semibold text-white">
                        Overall Integration Description *
                    </label>
                    <Tooltip
                        content={FIELD_HELP.toolsConfiguration}
                        examples={FIELD_HELP.toolsConfiguration.examples}
                    />
                </div>
                <p className="text-base text-gray-400">Describe how all the selected tools work together in your solution</p>
                <textarea
                    id="toolsConfiguration"
                    value={toolsConfiguration}
                    onChange={(e) => setField('toolsConfiguration', e.target.value)}
                    onBlur={() => handleFieldBlur('toolsConfiguration')}
                    placeholder="e.g., ChatGPT processes incoming leads, Zapier triggers the automation, and HubSpot stores the qualified prospects with custom properties for follow-up."
                    rows={5}
                    className={`w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                        showError('toolsConfiguration')
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                    }`}
                />
                {showError('toolsConfiguration') && (
                    <div className="text-base text-red-400">{getEnhancedErrorMessage('toolsConfiguration', errors.toolsConfiguration)}</div>
                )}
            </motion.div>
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-base text-gray-400 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Implementation Time</span>
                </div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">Setup Time Estimate *</label>
                    <Tooltip
                        content={FIELD_HELP.setupTimeEstimate}
                        examples={FIELD_HELP.setupTimeEstimate.examples}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SETUP_TIMES.map((time) => (
                        <motion.button
                            key={time.value}
                            type="button"
                            onClick={() => {
                                setField('setupTimeEstimate', time.value)
                                handleFieldBlur('setupTimeEstimate')
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-5 rounded-lg border-2 text-left transition-all ${
                                setupTimeEstimate === time.value
                                    ? 'border-[#00FF89] bg-[#00FF89]/10 shadow-lg shadow-[#00FF89]/10'
                                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                            }`}>
                            <div className="flex items-center space-x-3">
                                <Clock className="w-6 h-6 text-[#00FF89]" />
                                <div className="flex-1">
                                    <div className="text-lg font-semibold text-white">{time.label}</div>
                                    <div className="text-lg text-gray-400 mt-1">{time.description}</div>
                                </div>
                                {setupTimeEstimate === time.value && <CheckCircle className="w-6 h-6 text-[#00FF89]" />}
                            </div>
                        </motion.button>
                    ))}
                </div>
                {showError('setupTimeEstimate') && (
                    <div className="text-base text-red-400">{getEnhancedErrorMessage('setupTimeEstimate', errors.setupTimeEstimate)}</div>
                )}
            </motion.div>
            {(toolsUsed.length > 0 || toolsConfiguration || setupTimeEstimate) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-5 bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse"></div>
                        <h4 className="text-lg font-semibold text-[#00FF89]">Technical Summary</h4>
                    </div>
                    <div className="space-y-3">
                        {toolsUsed.length > 0 && (
                            <div>
                                <span className="text-base text-gray-400">Selected Tools: </span>
                                <span className="text-lg text-white">{toolsUsed.map((t) => t.name).join(', ')}</span>
                            </div>
                        )}
                        {setupTimeEstimate && (
                            <div>
                                <span className="text-base text-gray-400">Setup Time: </span>
                                <span className="text-lg text-white">{SETUP_TIMES.find((t) => t.value === setupTimeEstimate)?.label}</span>
                            </div>
                        )}
                        {toolsConfiguration && (
                            <div>
                                <div className="text-base text-gray-400 mb-1">Integration:</div>
                                <p className="text-lg text-white whitespace-pre-wrap">{toolsConfiguration}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    )
}

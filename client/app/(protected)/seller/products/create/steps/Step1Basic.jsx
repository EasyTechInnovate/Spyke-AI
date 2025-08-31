'use client'

import { motion } from 'framer-motion'
import { useState, useCallback, useMemo } from 'react'
import { HelpCircle, Save, Check, Loader2, Package } from 'lucide-react'
import { useProductCreateStore } from '@/store/productCreate'
import { PRODUCT_TYPES, CATEGORIES, INDUSTRIES, VALIDATION_LIMITS } from '@/lib/constants/productCreate'

// Lazy load icons for better performance
const iconMap = {
    Bot: () => import('lucide-react').then(m => m.Bot),
    Zap: () => import('lucide-react').then(m => m.Zap),
    Rocket: () => import('lucide-react').then(m => m.Rocket),
    Target: () => import('lucide-react').then(m => m.Target),
    Users: () => import('lucide-react').then(m => m.Users),
    Phone: () => import('lucide-react').then(m => m.Phone),
    ShoppingCart: () => import('lucide-react').then(m => m.ShoppingCart),
    PenTool: () => import('lucide-react').then(m => m.PenTool),
    Headphones: () => import('lucide-react').then(m => m.Headphones),
    Briefcase: () => import('lucide-react').then(m => m.Briefcase),
    TrendingUp: () => import('lucide-react').then(m => m.TrendingUp),
    BarChart3: () => import('lucide-react').then(m => m.BarChart3),
    Trophy: () => import('lucide-react').then(m => m.Trophy),
    Home: () => import('lucide-react').then(m => m.Home),
    ShoppingBag: () => import('lucide-react').then(m => m.ShoppingBag),
    Monitor: () => import('lucide-react').then(m => m.Monitor),
    Store: () => import('lucide-react').then(m => m.Store),
    Heart: () => import('lucide-react').then(m => m.Heart),
    GraduationCap: () => import('lucide-react').then(m => m.GraduationCap),
    DollarSign: () => import('lucide-react').then(m => m.DollarSign),
    Cpu: () => import('lucide-react').then(m => m.Cpu),
    Clipboard: () => import('lucide-react').then(m => m.Clipboard)
}

const FIELD_HELP = {
    title: {
        title: "Product Title Tips",
        content: "Keep it clear, specific, and under 60 characters. Include the main benefit and target audience.",
        examples: ["AI Email Automation for E-commerce", "Lead Generation Bot for Real Estate"]
    },
    type: {
        title: "Choose Your Product Type",
        content: "Select the format that best describes your product. This affects how customers discover and use it.",
        examples: []
    },
    category: {
        title: "Product Category",
        content: "Choose the primary category that best fits your product's main function.",
        examples: []
    },
    industry: {
        title: "Target Industry",
        content: "Select the industry your product serves best. This helps with discoverability.",
        examples: []
    },
    shortDescription: {
        title: "Short Description Guide",
        content: "Write a compelling 1-2 sentence summary. This appears in search results and product cards.",
        examples: ["Automate your lead generation with AI-powered email sequences that convert 40% better."]
    },
    fullDescription: {
        title: "Detailed Description",
        content: "Explain what your product does, how it works, and the specific benefits. Use bullet points for clarity.",
        examples: []
    }
}

const getEnhancedErrorMessage = (field, error) => {
    const errorMap = {
        title: {
            'required': 'Product title is required. Try: "AI Tool for [Target Audience]"',
            'minLength': 'Title too short. Add more detail about what your product does.',
            'maxLength': 'Title too long. Keep it under 60 characters for better readability.'
        },
        type: {
            'required': 'Please select a product type. This helps customers understand your offering.'
        },
        category: {
            'required': 'Category selection helps customers find your product. Choose the closest match.'
        },
        industry: {
            'required': 'Target industry helps with discoverability. Select your primary market.'
        },
        shortDescription: {
            'required': 'Short description is required for product listings and search results.',
            'minLength': 'Add more detail. Explain the main benefit in 1-2 sentences.',
            'maxLength': 'Too long for a short description. Keep key benefits concise.'
        },
        fullDescription: {
            'required': 'Detailed description helps customers understand your product value.',
            'minLength': 'Add more detail. Explain features, benefits, and how it works.',
            'maxLength': 'Description is too long. Focus on key benefits and features.'
        }
    }

    return errorMap[field]?.[error] || error
}

// Tooltip component
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
                    <p className="text-base text-gray-300 mb-3">{content.content}</p>
                    {examples.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Examples:</p>
                            <ul className="space-y-1">
                                {examples.map((example, index) => (
                                    <li key={index} className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
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

// Auto-save indicator
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
            className="flex items-center space-x-2 text-sm bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
            <status.icon className={`w-3 h-3 ${status.color}`} />
            <span className={status.color}>{status.text}</span>
        </motion.div>
    )
}

export default function Step1Basic() {
    const title = useProductCreateStore((state) => state.title)
    const type = useProductCreateStore((state) => state.type)
    const category = useProductCreateStore((state) => state.category)
    const industry = useProductCreateStore((state) => state.industry)
    const shortDescription = useProductCreateStore((state) => state.shortDescription)
    const fullDescription = useProductCreateStore((state) => state.fullDescription)
    const errors = useProductCreateStore((state) => state.errors)
    const touchedFields = useProductCreateStore((state) => state.touchedFields)

    const setField = useProductCreateStore((state) => state.setField)
    const markFieldTouched = useProductCreateStore((state) => state.markFieldTouched)
    const validateTouchedFields = useProductCreateStore((state) => state.validateTouchedFields)
    const applySuggestions = useProductCreateStore((state) => state.applySuggestions)

    const [loadedIcons, setLoadedIcons] = useState({})

    // Lazy load icons
    const loadIcon = useCallback(async (iconName) => {
        if (loadedIcons[iconName]) return loadedIcons[iconName]

        try {
            const iconLoader = iconMap[iconName]
            if (iconLoader) {
                const IconComponent = await iconLoader()
                setLoadedIcons(prev => ({ ...prev, [iconName]: IconComponent }))
                return IconComponent
            }
        } catch (error) {
            console.warn(`Failed to load icon: ${iconName}`)
        }
        return Package
    }, [loadedIcons])

    const handleTypeChange = (newType) => {
        setField('type', newType)
        applySuggestions(newType, category)
    }

    const handleCategoryChange = (newCategory) => {
        setField('category', newCategory)
        applySuggestions(type, newCategory)
    }

    const handleFieldBlur = (fieldName) => {
        markFieldTouched(fieldName)
        validateTouchedFields()
    }

    const showError = (fieldName) => {
        return touchedFields[fieldName] && errors[fieldName]
    }

    const renderIcon = (iconName, className = "w-12 h-12") => {
        const IconComponent = loadedIcons[iconName] || Package
        return <IconComponent className={className} />
    }

    return (
        <div className="space-y-10">
            <div className="flex justify-end">
                <AutoSaveIndicator />
            </div>

            <div className="text-center pb-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-semibold text-white mb-2">Let's Create Your Product</h2>
                <p className="text-lg text-gray-400">Start with the basics - we'll guide you through each step</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label htmlFor="title" className="block text-lg font-semibold text-white">
                        Product Title *
                    </label>
                    <Tooltip content={FIELD_HELP.title} examples={FIELD_HELP.title.examples} />
                </div>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setField('title', e.target.value)}
                    onBlur={() => handleFieldBlur('title')}
                    placeholder="e.g., AI Lead Generation Automation for SaaS Companies"
                    className={`w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${showError('title') ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                        }`}
                    maxLength={VALIDATION_LIMITS.TITLE.MAX}
                />
                <div className="flex justify-between items-center">
                    <div className="text-base text-red-400">
                        {showError('title') ? getEnhancedErrorMessage('title', errors.title) : ''}
                    </div>
                    <div className="text-base text-gray-500">
                        {title.length}/{VALIDATION_LIMITS.TITLE.MAX}
                    </div>
                </div>
            </motion.div>

            {/* Visual break */}
            <div className="border-l-4 border-[#00FF89]/30 pl-6 py-4 bg-gray-800/20 rounded-r-lg">
                <p className="text-base text-gray-300">
                    💡 <span className="font-medium">Pro tip:</span> Great product titles include the main benefit and target audience
                </p>
            </div>

            {/* Product Type */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4">
                <div className="flex items-center space-x-2">
                    <label className="block text-lg font-semibold text-white">Product Type *</label>
                    <Tooltip content={FIELD_HELP.type} examples={FIELD_HELP.type.examples} />
                </div>

                {/* Enhanced mobile-first grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {PRODUCT_TYPES.map((productType) => (
                        <motion.button
                            key={productType.value}
                            type="button"
                            onClick={() => {
                                handleTypeChange(productType.value)
                                markFieldTouched('type')
                                validateTouchedFields()
                                loadIcon(productType.icon) // Pre-load icon
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`p-4 sm:p-5 rounded-lg border-2 text-left transition-all ${type === productType.value
                                ? 'border-[#00FF89] bg-[#00FF89]/10 shadow-lg shadow-[#00FF89]/10'
                                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                                }`}>
                            {/* Mobile-optimized layout */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                                <div className="text-[#00FF89] flex-shrink-0">
                                    {renderIcon(productType.icon, "w-10 h-10 sm:w-12 sm:h-12")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg sm:text-xl font-semibold text-white">{productType.label}</h3>
                                    <p className="text-base sm:text-lg text-gray-400 mt-1 sm:mt-2 line-clamp-2">{productType.description}</p>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                                        {productType.features.slice(0, 3).map((feature, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-700 text-sm sm:text-base text-gray-300 rounded-full">
                                                {feature}
                                            </span>
                                        ))}
                                        {productType.features.length > 3 && (
                                            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-600 text-sm sm:text-base text-gray-400 rounded-full">
                                                +{productType.features.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
                {showError('type') && (
                    <div className="text-base text-red-400">
                        {getEnhancedErrorMessage('type', errors.type)}
                    </div>
                )}
            </motion.div>

            {/* Visual break */}
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-base text-gray-400">Targeting & Categories</div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Category and Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="category" className="block text-lg font-semibold text-white">
                            Category *
                        </label>
                        <Tooltip content={FIELD_HELP.category} examples={FIELD_HELP.category.examples} />
                    </div>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => {
                            handleCategoryChange(e.target.value)
                            markFieldTouched('category')
                            validateTouchedFields()
                        }}
                        onBlur={() => handleFieldBlur('category')}
                        className={`w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all appearance-none ${showError('category')
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                            }`}>
                        <option value="">Select a category</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                    {showError('category') && (
                        <div className="text-base text-red-400">
                            {getEnhancedErrorMessage('category', errors.category)}
                        </div>
                    )}
                </motion.div>

                {/* Industry */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="industry" className="block text-lg font-semibold text-white">
                            Industry *
                        </label>
                        <Tooltip content={FIELD_HELP.industry} examples={FIELD_HELP.industry.examples} />
                    </div>
                    <select
                        id="industry"
                        value={industry}
                        onChange={(e) => {
                            setField('industry', e.target.value)
                            markFieldTouched('industry')
                            validateTouchedFields()
                        }}
                        onBlur={() => handleFieldBlur('industry')}
                        className={`w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all appearance-none ${showError('industry')
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                            }`}>
                        <option value="">Select an industry</option>
                        {INDUSTRIES.map((ind) => (
                            <option key={ind.value} value={ind.value}>
                                {ind.label}
                            </option>
                        ))}
                    </select>
                    {showError('industry') && (
                        <div className="text-base text-red-400">
                            {getEnhancedErrorMessage('industry', errors.industry)}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Visual break */}
            <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-700"></div>
                <div className="px-4 text-base text-gray-400">Product Descriptions</div>
                <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Short Description */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label htmlFor="shortDescription" className="block text-lg font-semibold text-white">
                        Short Description *
                    </label>
                    <Tooltip content={FIELD_HELP.shortDescription} examples={FIELD_HELP.shortDescription.examples} />
                </div>
                <textarea
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setField('shortDescription', e.target.value)}
                    onBlur={() => handleFieldBlur('shortDescription')}
                    placeholder="Brief, compelling description that appears in search results and product cards"
                    rows={3}
                    maxLength={VALIDATION_LIMITS.SHORT_DESCRIPTION.MAX}
                    className={`w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${showError('shortDescription')
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                        }`}
                />
                <div className="flex justify-between items-center">
                    <div className="text-base text-red-400">
                        {showError('shortDescription') ? getEnhancedErrorMessage('shortDescription', errors.shortDescription) : ''}
                    </div>
                    <div className="text-base text-gray-500">
                        {shortDescription.length}/{VALIDATION_LIMITS.SHORT_DESCRIPTION.MAX}
                    </div>
                </div>
            </motion.div>

            {/* Full Description */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3">
                <div className="flex items-center space-x-2">
                    <label htmlFor="fullDescription" className="block text-lg font-semibold text-white">
                        Full Description *
                    </label>
                    <Tooltip content={FIELD_HELP.fullDescription} examples={FIELD_HELP.fullDescription.examples} />
                </div>
                <textarea
                    id="fullDescription"
                    value={fullDescription}
                    onChange={(e) => setField('fullDescription', e.target.value)}
                    onBlur={() => handleFieldBlur('fullDescription')}
                    placeholder="Detailed description explaining what your product does, how it works, and the value it provides. This appears on the product detail page."
                    rows={8}
                    maxLength={VALIDATION_LIMITS.FULL_DESCRIPTION.MAX}
                    className={`w-full px-5 py-4 text-lg bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${showError('fullDescription')
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-gray-600 focus:ring-[#00FF89]/50 focus:border-[#00FF89]'
                        }`}
                />
                <div className="flex justify-between items-center">
                    <div className="text-base text-red-400">
                        {showError('fullDescription') ? getEnhancedErrorMessage('fullDescription', errors.fullDescription) : ''}
                    </div>
                    <div className="text-base text-gray-500">
                        {fullDescription.length}/{VALIDATION_LIMITS.FULL_DESCRIPTION.MAX}
                    </div>
                </div>
            </motion.div>

            {/* Real-time Preview Card */}
            {(title || shortDescription) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 p-5 bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse"></div>
                        <h4 className="text-lg font-semibold text-[#00FF89]">Live Preview</h4>
                    </div>
                    <div className="bg-gray-900 p-5 rounded-lg border border-gray-700">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 rounded-lg flex items-center justify-center text-[#00FF89] flex-shrink-0">
                                {type ? renderIcon(PRODUCT_TYPES.find((t) => t.value === type)?.icon, "w-6 h-6 sm:w-8 sm:h-8") : renderIcon('Package', "w-6 h-6 sm:w-8 sm:h-8")}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className="text-xl font-semibold text-white line-clamp-1">{title || 'Your Product Title'}</h5>
                                <p className="text-lg text-gray-400 mt-2 line-clamp-2">
                                    {shortDescription || 'Your short description will appear here'}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    {type && (
                                        <span className="px-3 py-1 bg-[#00FF89]/20 text-[#00FF89] text-base font-medium rounded-full">
                                            {PRODUCT_TYPES.find((t) => t.value === type)?.label}
                                        </span>
                                    )}
                                    {category && (
                                        <span className="px-3 py-1 bg-gray-700 text-gray-300 text-base font-medium rounded-full">
                                            {CATEGORIES.find((c) => c.value === category)?.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

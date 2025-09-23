'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, Edit3, Send, ArrowLeft, Eye, AlertCircle, Loader2, Sparkles, Trophy, Zap, Star, HelpCircle, Info, Clock, Save, Check } from 'lucide-react'
import { useProductCreateStore } from '@/store/productCreate'
import { productsAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
const ERROR_HELP = {
    title: "Product title is required for listing your product in the marketplace",
    type: "Select whether your product is an automation, template, or consultation",
    category: "Choose the most relevant category to help customers find your product",
    industry: "Select the industry that best matches your target customers",
    shortDescription: "A brief summary that appears in product listings and search results",
    fullDescription: "Detailed explanation of what your product does and how it works",
    howItWorks: "At least 3 clear steps showing customers how to use your product",
    toolsUsed: "List the tools and platforms your product integrates with",
    toolsConfiguration: "Explain how customers should set up the required tools",
    setupTimeEstimate: "Give customers realistic expectations for implementation time",
    thumbnailImage: "A compelling image that represents your product professionally",
    additionalImages: "Show different aspects of your product with 2-3 quality images",
    productTags: "Add searchable keywords to help customers discover your product",
    supportAndMaintenance: "Explain what support customers can expect after purchase",
    faq: "Answer common questions customers ask before buying"
}
const Tooltip = ({ content }) => {
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
                    className="absolute z-50 right-0 top-full mt-2 w-64 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
                    <p className="text-sm text-gray-300">{content}</p>
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
const ConfettiParticle = ({ delay }) => (
    <motion.div
        className="absolute w-2 h-2 rounded-full"
        style={{
            background: `hsl(${Math.random() * 360}, 70%, 60%)`,
            left: `${Math.random() * 100}%`
        }}
        initial={{ y: -20, opacity: 1, scale: 1 }}
        animate={{
            y: window.innerHeight + 20,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 360
        }}
        transition={{
            duration: 3 + Math.random() * 2,
            delay,
            ease: 'easeOut'
        }}
    />
)
const SuccessModal = ({ isOpen, productTitle, onClose, onViewProducts }) => {
    const [confetti, setConfetti] = useState([])
    useEffect(() => {
        if (isOpen) {
            const particles = []
            for (let i = 0; i < 50; i++) {
                particles.push({ id: i, delay: Math.random() * 2 })
            }
            setConfetti(particles)
            const timer = setTimeout(() => {
                onViewProducts()
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [isOpen, onViewProducts])
    if (!isOpen) return null
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            {confetti.map((particle) => (
                <ConfettiParticle
                    key={particle.id}
                    delay={particle.delay}
                />
            ))}
            <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 50 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-[#00FF89]/30 p-8 max-w-md w-full text-center shadow-2xl">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 15, stiffness: 300 }}
                    className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FF89] to-[#00CC6A] rounded-full animate-pulse" />
                    <div className="relative bg-[#00FF89] rounded-full w-full h-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-black" />
                    </div>
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-[#00FF89] rounded-full"
                            style={{
                                top: `${20 + Math.sin((i * 60 * Math.PI) / 180) * 40}px`,
                                left: `${20 + Math.cos((i * 60 * Math.PI) / 180) * 40}px`
                            }}
                            animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 2,
                                delay: 0.5 + i * 0.1,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                        />
                    ))}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <Trophy className="w-8 h-8 text-[#00FF89]" />
                        Congratulations!
                    </h2>
                    <p className="text-gray-300 mb-1">Your product has been created successfully!</p>
                    <p className="text-[#00FF89] font-semibold text-base">"{productTitle}"</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex justify-center items-center gap-4 my-6 p-4 bg-black/20 rounded-lg">
                    <div className="text-center">
                        <div className="flex items-center justify-center text-[#00FF89] mb-1">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div className="text-sm text-gray-400">Ready for Review</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center text-[#00FF89] mb-1">
                            <Star className="w-5 h-5" />
                        </div>
                        <div className="text-sm text-gray-400">High Quality</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center text-[#00FF89] mb-1">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="text-sm text-gray-400">Professional</div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0 }}
                    className="space-y-3">
                    <p className="text-gray-400 text-sm">Taking you to Product page where you submit your product for review</p>
                    <div className="flex gap-3 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors">
                            Stay Here
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onViewProducts}
                            className="flex-1 px-4 py-2 bg-[#00FF89] text-black rounded-lg hover:bg-[#00FF89]/90 transition-colors font-medium">
                            View Products
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
export default function ReviewSubmit({ onBackToStep }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [changedFields, setChangedFields] = useState([])
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [createdProductTitle, setCreatedProductTitle] = useState('')
    const state = useProductCreateStore()
    const validateStep = useProductCreateStore((state) => state.validateStep)
    const toApiPayload = useProductCreateStore((state) => state.toApiPayload)
    const reset = useProductCreateStore((state) => state.reset)
    const validationSummary = useMemo(() => {
        const criticalFields = ['title', 'type', 'category', 'industry', 'shortDescription', 'fullDescription', 'supportAndMaintenance']
        const mediaFields = ['thumbnailImage', 'additionalImages', 'productTags']
        const processFields = ['howItWorks', 'toolsUsed', 'toolsConfiguration', 'setupTimeEstimate']
        const supportFields = ['faq']
        const checkFields = (fields) => fields.filter(field => {
            switch (field) {
                case 'howItWorks':
                    return state.howItWorks.filter(s => s.title.trim() && s.detail.trim()).length < 3
                case 'additionalImages':
                    return state.additionalImages.length === 0
                case 'productTags':
                    return state.productTags.length === 0
                case 'toolsUsed':
                    return state.toolsUsed.length === 0
                case 'faq':
                    return state.faq.filter(f => f.question.trim() && f.answer.trim()).length === 0
                default:
                    return !state[field]?.toString().trim()
            }
        })
        const critical = checkFields(criticalFields)
        const media = checkFields(mediaFields)
        const process = checkFields(processFields)
        const support = checkFields(supportFields)
        const total = critical.length + media.length + process.length + support.length
        const isComplete = total === 0
        return { critical, media, process, support, total, isComplete }
    }, [state])
    const handleSubmit = async () => {
        setIsSubmitting(true)
        setSubmitError('')
        try {
            let allValid = true
            for (let step of [1, 2, 3, 5, 6]) {
                if (!validateStep(step)) {
                    allValid = false
                }
            }
            if (!allValid) {
                throw new Error('Please fix all validation errors before submitting')
            }
            const payload = toApiPayload()
            if (payload.thumbnail instanceof File) {
                throw new Error('Please provide image URLs instead of files for now')
            }
            const response = await productsAPI.createProduct(payload)
            if (response?.data) {
                localStorage.removeItem('spyke-product-create')
                setCreatedProductTitle(state.title)
                setShowSuccessModal(true)
                reset()
            } else {
                throw new Error('Failed to create product - no data returned')
            }
        } catch (error) {
            console.error('Submission error:', error)
            setSubmitError(error.message || 'Failed to create product')
        } finally {
            setIsSubmitting(false)
        }
    }
    const handleViewProducts = () => {
        setShowSuccessModal(false)
        router.push('/seller/products')
    }
    const handleCloseSuccess = () => {
        setShowSuccessModal(false)
    }
    const jumpToField = (fieldName) => {
        const fieldToStep = {
            title: 1,
            type: 1,
            category: 1,
            industry: 1,
            shortDescription: 1,
            fullDescription: 1,
            howItWorks: 2,
            toolsUsed: 3,
            toolsConfiguration: 3,
            setupTimeEstimate: 3,
            thumbnailImage: 5,
            additionalImages: 5,
            productTags: 5,
            supportAndMaintenance: 6,
            faq: 6
        }
        const step = fieldToStep[fieldName]
        if (step && onBackToStep) {
            onBackToStep(step)
        }
    }
    return (
        <div className="space-y-8">
            <SuccessModal
                isOpen={showSuccessModal}
                productTitle={createdProductTitle}
                onClose={handleCloseSuccess}
                onViewProducts={handleViewProducts}
            />
            <div className="flex justify-end">
                <AutoSaveIndicator />
            </div>
            <div className="text-center pb-6 border-b border-gray-700/50">
                <h1 className="text-3xl font-bold text-white mb-4">Review & Submit</h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-base">
                    Review your product details and submit for publication. You can make changes by jumping to specific sections.
                </p>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Readiness Check</h2>
                    <div className="flex items-center space-x-2">
                        {validationSummary.isComplete ? (
                            <CheckCircle className="w-6 h-6 text-[#00FF89]" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                        )}
                        <span className="text-base font-medium text-white">
                            {validationSummary.isComplete ? 'Ready to Submit!' : `${validationSummary.total} items need attention`}
                        </span>
                    </div>
                </div>
                {validationSummary.isComplete ? (
                    <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-lg p-4">
                        <div className="flex items-center text-[#00FF89] mb-2">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="font-semibold text-base">All Requirements Met</span>
                        </div>
                        <p className="text-[#00FF89]/80 text-sm">
                            Your product is complete and ready for submission. Our team will review it within 24-48 hours.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {validationSummary.critical.length > 0 && (
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center text-red-300">
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        <span className="font-semibold text-base">Required Information</span>
                                    </div>
                                    <span className="text-sm bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                                        {validationSummary.critical.length} missing
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {validationSummary.critical.map((field) => (
                                        <div key={field} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center">
                                                <span className="text-red-200 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                                                <Tooltip content={ERROR_HELP[field]} />
                                            </div>
                                            <button
                                                onClick={() => jumpToField(field)}
                                                className="text-red-400 hover:text-red-300 underline">
                                                Fix →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {validationSummary.media.length > 0 && (
                            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center text-amber-300">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        <span className="font-semibold text-base">Media & Tags</span>
                                    </div>
                                    <span className="text-sm bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                                        {validationSummary.media.length} needed
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {validationSummary.media.map((field) => (
                                        <div key={field} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center">
                                                <span className="text-amber-200 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                                                <Tooltip content={ERROR_HELP[field]} />
                                            </div>
                                            <button
                                                onClick={() => jumpToField(field)}
                                                className="text-amber-400 hover:text-amber-300 underline">
                                                Add →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {validationSummary.process.length > 0 && (
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center text-blue-300">
                                        <Info className="w-5 h-5 mr-2" />
                                        <span className="font-semibold text-base">Process Details</span>
                                    </div>
                                    <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                        {validationSummary.process.length} missing
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {validationSummary.process.map((field) => (
                                        <div key={field} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center">
                                                <span className="text-blue-200 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                                                <Tooltip content={ERROR_HELP[field]} />
                                            </div>
                                            <button
                                                onClick={() => jumpToField(field)}
                                                className="text-blue-400 hover:text-blue-300 underline">
                                                Complete →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#00FF89] mb-1">
                        {state.howItWorks.filter(s => s.title && s.detail).length}
                    </div>
                    <div className="text-sm text-gray-400">Process Steps</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#00FF89] mb-1">{state.toolsUsed.length}</div>
                    <div className="text-sm text-gray-400">Tools Used</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#00FF89] mb-1">{state.productTags.length}</div>
                    <div className="text-sm text-gray-400">Tags Added</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#00FF89] mb-1">
                        {state.faq.filter(f => f.question && f.answer).length}
                    </div>
                    <div className="text-sm text-gray-400">FAQ Items</div>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-[#00FF89]" />
                    <span>Product Overview</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-400">Product Title</span>
                            <p className="text-white font-medium text-base">{state.title || 'Not set'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-400">Category & Type</span>
                            <p className="text-white text-base">
                                {state.category?.replace('_', ' ') || 'Not set'} • {state.type || 'Not set'}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-400">Setup Time</span>
                            <p className="text-white text-base flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-[#00FF89]" />
                                <span>{state.setupTimeEstimate || 'Not specified'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-400">Industry Focus</span>
                            <p className="text-white text-base">{state.industry?.replace('_', ' ') || 'Not set'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-400">Support Level</span>
                            <p className="text-white text-base">
                                {state.supportAndMaintenance ? 'Included' : 'Not specified'}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-400">Pricing</span>
                            <p className="text-white text-base font-semibold">
                                {state.price ? `$${state.price}` : 'Not set'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
            {submitError && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-red-300">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium text-base">Submission Failed</span>
                    </div>
                    <p className="text-red-200 mt-2 text-base">{submitError}</p>
                </motion.div>
            )}
            <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => onBackToStep?.(6)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors text-base">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Edit</span>
                    </button>
                    <button
                        onClick={() => onBackToStep?.(6)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors text-base">
                        <Eye className="w-4 h-4" />
                        <span>Continue Editing</span>
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    {state.lastSaved && (
                        <div className="text-sm text-gray-400">
                            Last saved: {new Date(state.lastSaved).toLocaleTimeString()}
                        </div>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={!validationSummary.isComplete || isSubmitting}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all text-base ${
                            validationSummary.isComplete && !isSubmitting
                                ? 'bg-[#00FF89] text-black hover:bg-[#00FF89]/90 hover:scale-105'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Submit Product</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="text-center text-sm text-gray-500 border-t border-gray-700 pt-4">
                <p>By submitting, you agree to our terms of service. Your product will be reviewed before going live.</p>
            </div>
        </div>
    )
}
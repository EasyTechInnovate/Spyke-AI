'use client'
import { motion } from 'framer-motion'
import { Star, Play, Download, Eye, Tag, Clock, Users, Zap } from 'lucide-react'
import { useProductCreateStore } from '@/store/productCreate'
import { PRODUCT_TYPES, CATEGORIES, INDUSTRIES, PRICING_STRATEGIES, SETUP_TIMES } from '@/lib/constants/productCreate'
export default function LivePreview() {
    const state = useProductCreateStore()
    const getProductTypeInfo = () => PRODUCT_TYPES.find((t) => t.value === state.type)
    const getCategoryInfo = () => CATEGORIES.find((c) => c.value === state.category)
    const getIndustryInfo = () => INDUSTRIES.find((i) => i.value === state.industry)
    const getPricingInfo = () => PRICING_STRATEGIES.find((s) => s.value === state.pricingStrategy)
    const getSetupTimeInfo = () => SETUP_TIMES.find((t) => t.value === state.setupTimeEstimate)
    const productTypeInfo = getProductTypeInfo()
    const categoryInfo = getCategoryInfo()
    const industryInfo = getIndustryInfo()
    const pricingInfo = getPricingInfo()
    const setupTimeInfo = getSetupTimeInfo()
    const validHowItWorksSteps = state.howItWorks.filter((step) => step.title.trim() && step.detail.trim())
    const validFAQs = state.faq.filter((faq) => faq.question.trim() && faq.answer.trim())
    return (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex items-center space-x-2 text-[#00FF89]">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Live Preview</span>
                    <span className="text-xs bg-[#00FF89]/20 px-2 py-1 rounded-full">Real-time</span>
                </div>
            </div>
            <div className="p-6 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4">
                    <div className="flex items-start space-x-4">
                        <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            {state.thumbnailImage ? (
                                typeof state.thumbnailImage === 'string' ? (
                                    <img
                                        src={state.thumbnailImage}
                                        alt="Product thumbnail"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="text-sm text-gray-400 text-center">
                                        <div className="text-2xl mb-1">📸</div>
                                        <div>Preview</div>
                                    </div>
                                )
                            ) : (
                                <div className="text-gray-500 text-center">
                                    <div className="text-2xl mb-1">{productTypeInfo?.icon || '📦'}</div>
                                    <div className="text-xs">No Image</div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-white mb-2">{state.title || 'Your Product Title'}</h1>
                            <p className="text-gray-300 text-base mb-3">{state.shortDescription || 'Your short description will appear here...'}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {productTypeInfo && (
                                    <span className="px-3 py-1 bg-[#00FF89]/20 text-[#00FF89] rounded-full text-xs">
                                        {productTypeInfo.icon} {productTypeInfo.label}
                                    </span>
                                )}
                                {categoryInfo && (
                                    <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                                        {categoryInfo.icon} {categoryInfo.label}
                                    </span>
                                )}
                                {industryInfo && (
                                    <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                                        {industryInfo.icon} {industryInfo.label}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-4 text-base text-gray-400">
                                <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span>New Product</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>0 sales</span>
                                </div>
                                {setupTimeInfo && (
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{setupTimeInfo.label}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
                {state.productTags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-2">
                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                            <Tag className="w-4 h-4" />
                            <span>Tags</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {state.productTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}
                {state.fullDescription && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">About This Product</h3>
                        <p className="text-gray-300 text-base whitespace-pre-wrap leading-relaxed">{state.fullDescription}</p>
                    </motion.div>
                )}
                {validHowItWorksSteps.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-[#00FF89]" />
                            <span>How It Works</span>
                        </h3>
                        <div className="space-y-4">
                            {validHowItWorksSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-4">
                                    <div className="flex items-center justify-center w-8 h-8 bg-[#00FF89] text-black rounded-full font-bold text-sm flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white mb-1">{step.title}</h4>
                                        <p className="text-gray-300 text-base">{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
                {state.keyBenefits.filter((b) => b.trim()).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Key Benefits</h3>
                        <ul className="space-y-2">
                            {state.keyBenefits
                                .filter((b) => b.trim())
                                .map((benefit, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start space-x-2 text-gray-300 text-base">
                                        <span className="text-[#00FF89] mt-1">✓</span>
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                        </ul>
                    </motion.div>
                )}
                {(state.toolsUsed.length > 0 || state.toolsConfiguration) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Technical Details</h3>
                        <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
                            {state.toolsUsed.length > 0 && (
                                <div>
                                    <h4 className="text-base font-medium text-white mb-2">Required Tools</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {state.toolsUsed.map((tool, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm flex items-center space-x-1">
                                                <span>{tool.logo}</span>
                                                <span>{tool.name}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {state.toolsConfiguration && (
                                <div>
                                    <h4 className="text-base font-medium text-white mb-2">Configuration</h4>
                                    <p className="text-gray-300 text-base">{state.toolsConfiguration}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
                {(state.additionalImages.length > 0 || state.previewVideo) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Gallery</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {state.previewVideo && (
                                <div className="col-span-2 md:col-span-3">
                                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                                        <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-400 text-base">Preview Video</p>
                                    </div>
                                </div>
                            )}
                            {state.additionalImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-800 rounded-lg p-4 text-center">
                                    {typeof image === 'string' ? (
                                        <img
                                            src={image}
                                            alt={`Gallery image ${index + 1}`}
                                            className="w-full h-24 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="h-24 flex items-center justify-center">
                                            <div className="text-gray-400 text-base">Image {index + 1}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
                {pricingInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Pricing</h3>
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{pricingInfo.icon}</span>
                                <div>
                                    <h4 className="font-medium text-white">{pricingInfo.label}</h4>
                                    <p className="text-gray-300 text-base">{pricingInfo.description}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {validFAQs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
                        <div className="space-y-3">
                            {validFAQs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-800/50 p-4 rounded-lg">
                                    <h4 className="font-medium text-white mb-2">{faq.question}</h4>
                                    <p className="text-gray-300 text-base">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
                {state.supportAndMaintenance && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">Support & Maintenance</h3>
                        <p className="text-gray-300 text-base whitespace-pre-wrap">{state.supportAndMaintenance}</p>
                    </motion.div>
                )}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-700">
                    <button className="flex-1 bg-[#00FF89] text-black font-medium py-3 px-6 rounded-lg hover:bg-[#00FF89]/90 transition-colors text-base">
                        Purchase Now
                    </button>
                    <button className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors text-base">
                        View Details
                    </button>
                    <button className="p-3 border border-gray-600 text-gray-400 rounded-lg hover:text-white hover:bg-gray-800 transition-colors self-center sm:self-auto">
                        <Download className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
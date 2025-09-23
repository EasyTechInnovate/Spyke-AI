'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
export default function ProductOverview({ product }) {
    if (!product) return null
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3">
                <h2 className="text-xl font-medium text-[#121212] dark:text-[#00FF89]">
                    Product Overview
                </h2>
                <p className="text-base text-[#6b7280] dark:text-[#9ca3af]">
                    Everything you need to know about this product
                </p>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="prose prose-gray dark:prose-invert max-w-none">
                <div className="text-lg leading-relaxed text-[#6b7280] dark:text-[#9ca3af] whitespace-pre-line">
                    {product.fullDescription || product.shortDescription || 'No description available.'}
                </div>
            </motion.div>
            {product.benefits && product.benefits.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4">
                    <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89] mb-6">
                        Key Benefits
                    </h3>
                    <div className="grid gap-3">
                        {product.benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index + 0.3 }}
                                className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg">
                                <div className="flex-shrink-0 w-5 h-5 bg-[#00FF89] rounded-full flex items-center justify-center mt-0.5">
                                    <Check className="w-3 h-3 text-[#121212]" />
                                </div>
                                <span className="text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                                    {benefit}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
            {product.useCaseExamples && product.useCaseExamples.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4">
                    <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89] mb-6">
                        Use Cases
                    </h3>
                    <div className="grid gap-3">
                        {product.useCaseExamples.map((useCase, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index + 0.5 }}
                                className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg">
                                <div className="flex-shrink-0 w-5 h-5 bg-[#00FF89] rounded-full flex items-center justify-center mt-0.5">
                                    <Check className="w-3 h-3 text-[#121212]" />
                                </div>
                                <span className="text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                                    {useCase}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-[#00FF89]/5 dark:bg-[#00FF89]/10 rounded-lg p-6 border border-[#00FF89]/20 dark:border-[#00FF89]/30">
                <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89] mb-4">
                    What's Included
                </h3>
                <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-[#00FF89]" />
                        <span className="text-[#6b7280] dark:text-[#9ca3af]">Complete automation setup</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-[#00FF89]" />
                        <span className="text-[#6b7280] dark:text-[#9ca3af]">Step-by-step implementation guide</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-[#00FF89]" />
                        <span className="text-[#6b7280] dark:text-[#9ca3af]">24/7 customer support</span>
                    </div>
                    {product.hasGuarantee && (
                        <div className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-[#00FF89]" />
                            <span className="text-[#6b7280] dark:text-[#9ca3af]">
                                {product.guaranteeText || '30-day money-back guarantee'}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-[#00FF89]" />
                        <span className="text-[#6b7280] dark:text-[#9ca3af]">Lifetime updates (v{product.currentVersion})</span>
                    </div>
                </div>
            </motion.div>
            {product.toolsUsed && product.toolsUsed.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-4">
                    <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89] mb-6">
                        Tools & Technologies
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.toolsUsed.map((tool, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * index + 0.8 }}
                                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f1f1f]/80 transition-colors">
                                <img 
                                    src={tool.logo} 
                                    alt={tool.name}
                                    className="w-8 h-8 object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                                <div>
                                    <div className="font-medium text-[#121212] dark:text-[#00FF89] text-sm">
                                        {tool.name}
                                    </div>
                                    {tool.model && (
                                        <div className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                                            {tool.model}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
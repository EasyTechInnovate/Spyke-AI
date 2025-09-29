'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Check, Package, Star, Clock, Shield, Download, Zap, Target, CheckCircle, Sparkles, ExternalLink } from 'lucide-react'
export default function ProductOverview({ product }) {
    if (!product) return null
    return (
        <div className="relative bg-black">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black" />
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl"
                />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-full">
                        <Package className="w-4 h-4 text-[#00FF89]" />
                        <span className="text-[#00FF89] font-medium text-sm">Product Overview</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Everything you need to know about this product</h2>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative overflow-hidden rounded-2xl p-8 bg-black/50 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-6 h-6 text-[#00FF89]" />
                        <h3 className="text-2xl font-bold text-white">About This Product</h3>
                    </div>
                    <div className="text-lg leading-relaxed text-gray-300 whitespace-pre-line">
                        {product.fullDescription || product.shortDescription || 'No description available.'}
                    </div>
                </motion.div>
                {product.benefits && product.benefits.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Star className="w-6 h-6 text-[#00FF89]" />
                            <h3 className="text-2xl font-bold text-white">Key Benefits</h3>
                        </div>
                        <div className="grid gap-4">
                            {product.benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index + 0.3 }}
                                    className="flex items-start gap-4 p-6 bg-black/50 border border-gray-700/50 hover:border-[#00FF89]/30 rounded-xl transition-all group">
                                    <div className="flex-shrink-0 w-8 h-8 bg-[#00FF89] rounded-full flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">
                                        <Check className="w-5 h-5 text-black" />
                                    </div>
                                    <span className="text-gray-300 leading-relaxed text-lg">{benefit}</span>
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
                        className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Target className="w-6 h-6 text-[#00FF89]" />
                            <h3 className="text-2xl font-bold text-white">Use Cases</h3>
                        </div>
                        <div className="grid gap-4">
                            {product.useCaseExamples.map((useCase, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index + 0.5 }}
                                    className="flex items-start gap-4 p-6 bg-black/50 border border-gray-700/50 hover:border-[#00FF89]/30 rounded-xl transition-all group">
                                    <div className="flex-shrink-0 w-8 h-8 bg-[#00FF89] rounded-full flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">
                                        <Check className="w-5 h-5 text-black" />
                                    </div>
                                    <span className="text-gray-300 leading-relaxed text-lg">{useCase}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative overflow-hidden rounded-2xl p-8 bg-black/50 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <Package className="w-6 h-6 text-[#00FF89]" />
                        <h3 className="text-2xl font-bold text-white">What's Included</h3>
                    </div>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-gray-700/50 rounded-xl hover:border-[#00FF89]/30 transition-all">
                            <CheckCircle className="w-6 h-6 text-[#00FF89] flex-shrink-0" />
                            <span className="text-gray-300 text-lg">Complete automation setup</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-gray-700/50 rounded-xl hover:border-[#00FF89]/30 transition-all">
                            <CheckCircle className="w-6 h-6 text-[#00FF89] flex-shrink-0" />
                            <span className="text-gray-300 text-lg">Step-by-step implementation guide</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-gray-700/50 rounded-xl hover:border-[#00FF89]/30 transition-all">
                            <CheckCircle className="w-6 h-6 text-[#00FF89] flex-shrink-0" />
                            <span className="text-gray-300 text-lg">24/7 customer support</span>
                        </div>
                        {product.hasGuarantee && (
                            <div className="flex items-center gap-4 p-4 bg-white/5 border border-gray-700/50 rounded-xl hover:border-[#00FF89]/30 transition-all">
                                <Shield className="w-6 h-6 text-[#00FF89] flex-shrink-0" />
                                <span className="text-gray-300 text-lg">{product.guaranteeText || '30-day money-back guarantee'}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-gray-700/50 rounded-xl hover:border-[#00FF89]/30 transition-all">
                            <Download className="w-6 h-6 text-[#00FF89] flex-shrink-0" />
                            <span className="text-gray-300 text-lg">Lifetime updates (v{product.currentVersion || '1.0'})</span>
                        </div>
                    </div>
                </motion.div>
                {product.toolsUsed && product.toolsUsed.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-[#00FF89]" />
                            <h3 className="text-2xl font-bold text-white">Tools & Technologies</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {product.toolsUsed.map((tool, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * index + 0.8 }}
                                    className="flex items-center gap-4 p-4 bg-black/50 border border-gray-700/50 hover:border-[#00FF89]/30 hover:bg-black/70 rounded-xl transition-all group cursor-pointer">
                                    <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00FF89]/20 transition-colors">
                                        <span className="text-[#00FF89] font-bold text-lg">{tool.name?.charAt(0).toUpperCase() || 'T'}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-white text-base group-hover:text-[#00FF89] transition-colors">{tool.name}</div>
                                        {tool.model && <div className="text-sm text-gray-400">{tool.model}</div>}
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
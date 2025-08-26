'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Star, Rocket, Shield, Target, CheckCircle, ArrowRight } from 'lucide-react'

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
}

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
}

// Feature icons for better visual variety
const featureIcons = [Sparkles, Zap, Star, Rocket, Shield, Target]

export default function ProductFeatures({ product }) {
    // Use real benefits data from API instead of features
    const features = product?.benefits || []

    if (features.length === 0) {
        return (
            <div className="text-center py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto">
                    <div className="w-12 h-12 mx-auto mb-4 bg-[#00FF89]/10 rounded-xl flex items-center justify-center border border-[#00FF89]/20">
                        <Star className="w-6 h-6 text-[#00FF89]" />
                    </div>
                    <h4 className="text-lg font-medium text-[#121212] dark:text-[#00FF89] mb-3">
                        Features Coming Soon
                    </h4>
                    <p className="text-[#6b7280] dark:text-[#9ca3af] text-sm leading-relaxed">
                        Key features and highlights will be available when ready.
                    </p>
                </motion.div>
            </div>
        )
    }

    // Limit to 6 features to prevent overflow
    const displayFeatures = features.slice(0, 6)

    return (
        <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-3xl mx-auto space-y-8">
            
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3">
                
                <h2 className="text-xl font-medium text-[#121212] dark:text-[#00FF89]">
                    Key Benefits
                </h2>
                
                <p className="text-base text-[#6b7280] dark:text-[#9ca3af]">
                    Discover what makes {product?.title || 'this product'} stand out
                </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayFeatures.map((feature, index) => {
                    const IconComponent = featureIcons[index % featureIcons.length]
                    
                    return (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            whileHover={{ 
                                y: -4,
                                transition: { type: "spring", stiffness: 300, damping: 20 }
                            }}
                            className="group bg-gray-50 dark:bg-[#1f1f1f] rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#1f1f1f]/80 transition-all hover:shadow-lg hover:border-[#00FF89]/20">
                            
                            {/* Feature Icon & Content */}
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-[#00FF89]/10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-[#00FF89]/20">
                                    <IconComponent className="w-5 h-5 text-[#00FF89]" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-large text-[#121212] dark:text-[#00FF89] text-base leading-tight">
                                            Benefit {index + 1}
                                        </h3>
                                        <CheckCircle className="w-4 h-4 text-[#00FF89] opacity-60 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    
                                    <p className="text-[#6b7280] dark:text-[#9ca3af] text-lg leading-relaxed">
                                        {feature}
                                    </p>
                                </div>
                            </div>

                            {/* Subtle Progress Indicator */}
                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeInOut" }}
                                        className="h-full bg-[#00FF89] rounded-full"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Show More Indicator */}
            {features.length > 6 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-center">
                    
                    <div className="inline-flex items-center gap-3 px-4 py-3 bg-[#00FF89]/5 dark:bg-[#00FF89]/10 rounded-lg border border-[#00FF89]/20 dark:border-[#00FF89]/30">
                        <div className="w-6 h-6 bg-[#00FF89] rounded-lg flex items-center justify-center">
                            <Star className="w-3.5 h-3.5 text-[#121212]" />
                        </div>
                        <span className="font-medium text-[#00FF89] text-sm">
                            +{features.length - 6} more benefits available
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Additional Use Cases Section */}
            {product?.useCaseExamples && product.useCaseExamples.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="bg-[#00FF89]/5 dark:bg-[#00FF89]/10 rounded-lg p-6 border border-[#00FF89]/20 dark:border-[#00FF89]/30">
                    
                    <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89] mb-4">
                        Perfect For
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {product.useCaseExamples.slice(0, 4).map((useCase, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <ArrowRight className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                                <span className="text-[#6b7280] dark:text-[#9ca3af] text-sm">
                                    {useCase}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
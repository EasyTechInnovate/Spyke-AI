'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Play, ArrowRight, CheckCircle } from 'lucide-react'

import { DESIGN_TOKENS, DSHeading, DSText, DSStack } from '@/lib/design-system'

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
}

export default function ProductHowItWorks({ product }) {
    if (!product?.howItWorks || product.howItWorks.length === 0) {
        return (
            <div className="text-center py-8">
                <div 
                    className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#00FF8920' }}>
                    <Play className="w-5 h-5" style={{ color: '#00FF89' }} />
                </div>
                <DSHeading level={4} className="mb-2" style={{ color: DESIGN_TOKENS.colors.text.primary.dark, fontSize: '1.1rem' }}>
                    Process Coming Soon
                </DSHeading>
                <DSText style={{ color: DESIGN_TOKENS.colors.text.muted.dark, fontSize: '0.875rem' }}>
                    Step-by-step instructions will be available when ready.
                </DSText>
            </div>
        )
    }

    // Limit to 5 steps to prevent overflow
    const steps = product.howItWorks.slice(0, 5)

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-3xl mx-auto">
            <div className="relative">
                {/* Compact Timeline Design */}
                <div className="hidden md:block absolute left-5 top-0 bottom-0 w-px rounded-full"
                     style={{ backgroundColor: '#00FF8930' }} />

                <DSStack gap="4">
                    {steps.map((step, index) => {
                        const isEven = index % 2 === 0
                        const accentColor = isEven ? '#00FF89' : '#FFC050'
                        
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex gap-3 items-start">
                                
                                {/* Step Number - Compact */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-sm border-2 transition-all hover:scale-105"
                                        style={{
                                            backgroundColor: accentColor,
                                            color: isEven ? '#121212' : '#FFFFFF',
                                            borderColor: DESIGN_TOKENS.colors.background.dark
                                        }}>
                                        <span className="text-sm font-bold">{index + 1}</span>
                                    </div>
                                </div>

                                {/* Step Content Card - Compact */}
                                <div
                                    className="flex-1 group backdrop-blur-sm rounded-lg p-4 border transition-all hover:shadow-md hover:-translate-y-0.5"
                                    style={{
                                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                        borderColor: `${accentColor}30`
                                    }}>
                                    <div className="flex items-start justify-between mb-2">
                                        <DSHeading
                                            level={5}
                                            className="group-hover:translate-x-0.5 transition-transform font-semibold"
                                            style={{ color: accentColor, fontSize: '0.95rem' }}>
                                            Step {index + 1}
                                        </DSHeading>
                                        {index < steps.length - 1 && (
                                            <ArrowRight 
                                                className="w-4 h-4 opacity-40 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all"
                                                style={{ color: accentColor }}
                                            />
                                        )}
                                    </div>
                                    <DSText 
                                        className="leading-relaxed"
                                        style={{ 
                                            color: DESIGN_TOKENS.colors.text.secondary.dark, 
                                            fontSize: '0.875rem',
                                            lineHeight: '1.4'
                                        }}>
                                        {step.slice(0, 200)}{step.length > 200 ? '...' : ''}
                                    </DSText>
                                    
                                    {/* Compact Progress Indicator */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <div 
                                            className="flex-1 h-1 rounded-full"
                                            style={{ backgroundColor: `${accentColor}20` }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((index + 1) / steps.length) * 100}%` }}
                                                transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: accentColor }}
                                            />
                                        </div>
                                        <DSText 
                                            className="text-xs font-medium"
                                            style={{ color: accentColor }}>
                                            {Math.round(((index + 1) / steps.length) * 100)}%
                                        </DSText>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </DSStack>

                {/* Show more indicator if needed */}
                {product.howItWorks.length > 5 && (
                    <div className="mt-4 text-center">
                        <div 
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm"
                            style={{
                                backgroundColor: '#00FF8915',
                                borderColor: '#00FF8940',
                                color: '#00FF89'
                            }}>
                            <span>+{product.howItWorks.length - 5} more steps available</span>
                        </div>
                    </div>
                )}

                {/* Completion Badge - Compact */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: steps.length * 0.1 + 0.3 }}
                    className="flex justify-center mt-4">
                    <div 
                        className="flex items-center gap-2 px-4 py-2 rounded-full border font-medium"
                        style={{
                            backgroundColor: '#00FF8915',
                            borderColor: '#00FF8940',
                            color: '#00FF89',
                            fontSize: '0.875rem'
                        }}>
                        <CheckCircle className="w-4 h-4" />
                        <span>Ready to get started!</span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
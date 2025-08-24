'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Star, Rocket, Shield, Target, CheckCircle, ArrowRight } from 'lucide-react'

import { DESIGN_TOKENS, DSHeading, DSText } from '@/lib/design-system'

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
}

const scaleIn = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 }
}

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
}

// Feature icons for better visual variety
const featureIcons = [Sparkles, Zap, Star, Rocket, Shield, Target]

export default function ProductFeatures({ product }) {
    if (!product?.features || product.features.length === 0) {
        return (
            <div className="text-center py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto">
                    <div 
                        className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center border"
                        style={{ 
                            backgroundColor: '#00FF8920',
                            borderColor: '#00FF8940'
                        }}>
                        <Star className="w-6 h-6" style={{ color: '#00FF89' }} />
                    </div>
                    <DSHeading level={4} className="mb-3 font-bold" style={{ color: '#00FF89', fontSize: '1.2rem' }}>
                        Features Coming Soon
                    </DSHeading>
                    <DSText style={{ color: DESIGN_TOKENS.colors.text.secondary.dark, fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Key features and highlights will be available when ready.
                    </DSText>
                </motion.div>
            </div>
        )
    }

    // Limit to 6 features to prevent overflow - organized in responsive grid
    const features = product.features.slice(0, 6)

    return (
        <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-6xl mx-auto">
            
            {/* Enhanced Header with Better Typography */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: '#00FF89' }}>
                        <Star className="w-5 h-5 text-black" />
                    </div>
                    <DSHeading 
                        level={3} 
                        className="font-bold tracking-tight"
                        style={{ 
                            color: '#00FF89', 
                            fontSize: '1.5rem',
                            lineHeight: '1.3'
                        }}>
                        Key Features
                    </DSHeading>
                </div>
                <DSText 
                    className="max-w-2xl mx-auto text-pretty"
                    style={{ 
                        color: DESIGN_TOKENS.colors.text.secondary.dark,
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                    }}>
                    Discover what makes this product stand out with these carefully crafted features
                </DSText>
            </div>

            {/* Optimized Responsive Grid - No Overflow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => {
                    const isEven = index % 2 === 0
                    const accentColor = isEven ? '#00FF89' : '#FFC050'
                    
                    return (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            whileHover={{ 
                                y: -8,
                                transition: { type: "spring", stiffness: 300, damping: 20 }
                            }}
                            className="group backdrop-blur-sm rounded-xl p-5 border transition-all hover:shadow-lg"
                            style={{
                                backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                borderColor: `${accentColor}40`
                            }}>
                            
                            {/* Enhanced Feature Icon */}
                            <div className="flex items-start gap-4 mb-4">
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                                    style={{ 
                                        backgroundColor: `${accentColor}20`,
                                        border: `2px solid ${accentColor}30`
                                    }}>
                                    <Star className="w-5 h-5" style={{ color: accentColor }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DSHeading
                                        level={4}
                                        className="mb-2 font-bold tracking-tight group-hover:translate-x-0.5 transition-transform"
                                        style={{ 
                                            color: accentColor, 
                                            fontSize: '1.1rem',
                                            lineHeight: '1.3'
                                        }}>
                                        {feature.name || `Feature ${index + 1}`}
                                    </DSHeading>
                                </div>
                            </div>

                            {/* Enhanced Feature Description - No Overflow */}
                            <DSText
                                className="leading-relaxed text-pretty mb-4"
                                style={{ 
                                    color: DESIGN_TOKENS.colors.text.secondary.dark, 
                                    fontSize: '0.875rem',
                                    lineHeight: '1.6'
                                }}>
                                {(feature.description || feature)?.slice(0, 120)}
                                {(feature.description || feature)?.length > 120 ? '...' : ''}
                            </DSText>

                            {/* Enhanced Interactive Elements */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all group-hover:scale-110"
                                        style={{ backgroundColor: `${accentColor}15` }}>
                                        <CheckCircle className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                    </div>
                                    <DSText 
                                        className="text-xs font-semibold"
                                        style={{ color: accentColor }}>
                                        Available
                                    </DSText>
                                </div>
                                
                                <button 
                                    className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:scale-110"
                                    style={{ backgroundColor: `${accentColor}15` }}>
                                    <ArrowRight className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                </button>
                            </div>

                            {/* Enhanced Subtle Progress Bar */}
                            <div className="mt-4 pt-3 border-t border-opacity-20" style={{ borderColor: accentColor }}>
                                <div 
                                    className="h-1 rounded-full overflow-hidden"
                                    style={{ backgroundColor: `${accentColor}15` }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeInOut" }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Show More Indicator - No Overflow */}
            {product.features.length > 6 && (
                <div className="mt-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border"
                        style={{
                            backgroundColor: '#00FF8915',
                            borderColor: '#00FF8940'
                        }}>
                        <div 
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: '#00FF89' }}>
                            <Star className="w-3.5 h-3.5 text-black" />
                        </div>
                        <DSText 
                            className="font-semibold"
                            style={{ color: '#00FF89', fontSize: '0.9rem' }}>
                            +{product.features.length - 6} more features available
                        </DSText>
                    </motion.div>
                </div>
            )}
        </motion.div>
    )
}
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { 
    ArrowRight, 
    Download, 
    Settings, 
    Zap, 
    Play, 
    CheckCircle, 
    Brain, 
    Route, 
    Database, 
    Users, 
    BarChart,
    Clock,
    Target,
    Sparkles,
    Package,
    Shield,
    Timer
} from 'lucide-react'

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.15
        }
    }
}

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 }
}

const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
}

export default function ProductHowItWorks({ product }) {
    const getIconForStep = (stepText, index) => {
        const text = stepText.toLowerCase()
        if (text.includes('submit') || text.includes('ticket')) return Users
        if (text.includes('chatgpt') || text.includes('ai') || text.includes('analyzes')) return Brain
        if (text.includes('knowledge') || text.includes('database') || text.includes('checks')) return Database
        if (text.includes('route') || text.includes('escalat')) return Route
        if (text.includes('log') || text.includes('analyz') || text.includes('improv')) return BarChart
        const fallbackIcons = [Users, Brain, Database, Route, BarChart, Download, Settings, Zap]
        return fallbackIcons[index] || Play
    }

    const steps = product?.howItWorks?.length > 0 
        ? product.howItWorks.map((step, index) => ({
            title: `Step ${index + 1}`,
            description: step,
            icon: getIconForStep(step, index)
        }))
        : [
            {
                title: 'Purchase & Download',
                description: 'Complete your secure purchase and get instant access to download all files, resources, and documentation.',
                icon: Download
            },
            {
                title: 'Setup & Installation',
                description: 'Follow our comprehensive step-by-step guide to set up the product in your environment with ease.',
                icon: Settings
            },
            {
                title: 'Start Using',
                description: 'Begin using the product immediately with our detailed documentation and expert support.',
                icon: Zap
            }
        ]

    if (steps.length === 0) {
        return (
            <div className="relative bg-black overflow-hidden">
                <div className="absolute inset-0">
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                        className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#00FF89]/3 rounded-full blur-3xl"
                    />
                </div>
                <div className="relative z-10 text-center py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-lg mx-auto">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/5 rounded-2xl flex items-center justify-center border border-[#00FF89]/20 backdrop-blur-sm">
                                <Play className="w-10 h-10 text-[#00FF89]" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#00FF89] rounded-full animate-ping opacity-75"></div>
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#00FF89]/60 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Process Details Coming Soon
                        </h3>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Detailed workflow and implementation steps are being prepared.
                        </p>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative bg-black overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 35,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    className="absolute top-1/4 right-1/3 w-96 h-96 bg-[#00FF89]/4 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        rotate: [360, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 28,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        rotate: [0, 180, 360],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{
                        duration: 40,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/2 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-12">
                    
                    {/* Header */}
                    <motion.div 
                        variants={fadeInUp}
                        className="text-center space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#00FF89]/10 border border-[#00FF89]/20">
                            <Play className="w-5 h-5 text-[#00FF89]" />
                            <span className="text-[#00FF89] font-semibold text-sm">Implementation Guide</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                            How It <span className="text-[#00FF89]">Works</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            {product?.targetAudience 
                                ? `Perfect for ${product.targetAudience.toLowerCase()} - follow these simple steps to get started` 
                                : 'Follow these simple steps to implement and start using this powerful solution'}
                        </p>
                    </motion.div>

                    {/* Steps */}
                    <motion.div 
                        variants={stagger}
                        className="space-y-8">
                        {steps.map((step, index) => {
                            const IconComponent = step.icon
                            const isLast = index === steps.length - 1
                            
                            return (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className="group relative">
                                    <div className="flex items-start gap-6 lg:gap-8">
                                        {/* Step Number & Line */}
                                        <div className="flex-shrink-0 relative">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#00FF89] to-[#00e67a] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#00FF89]/25">
                                                <span className="text-black font-bold text-xl">{index + 1}</span>
                                            </div>
                                            {!isLast && (
                                                <div className="absolute top-16 left-1/2 w-px h-16 bg-gradient-to-b from-[#00FF89]/50 to-[#00FF89]/10 -translate-x-px" />
                                            )}
                                        </div>

                                        {/* Content Card */}
                                        <div className="flex-1 relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/10 via-transparent to-blue-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                            <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-[#00FF89]/30 rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-[#00FF89]/10">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 group-hover:text-[#00FF89] transition-colors">
                                                            {step.title}
                                                        </h3>
                                                        <p className="text-gray-300 leading-relaxed text-lg">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-6">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/5 rounded-xl flex items-center justify-center border border-[#00FF89]/20 transition-all duration-300 group-hover:scale-110 group-hover:border-[#00FF89]/40">
                                                            <IconComponent className="w-6 h-6 text-[#00FF89]" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-6 pt-4 border-t border-gray-700/50">
                                                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '100%' }}
                                                            transition={{ 
                                                                delay: index * 0.3 + 0.8, 
                                                                duration: 1.2, 
                                                                ease: "easeOut" 
                                                            }}
                                                            className="h-full bg-gradient-to-r from-[#00FF89] to-[#00e67a] rounded-full"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Hover Arrow */}
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileHover={{ opacity: 1, x: 0 }}
                                                    className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00FF89]/20 border border-[#00FF89]/30 rounded-full">
                                                        <span className="text-[#00FF89] text-xs font-medium">
                                                            {isLast ? 'Complete' : 'Next Step'}
                                                        </span>
                                                        {isLast ? <CheckCircle className="w-3 h-3 text-[#00FF89]" /> : <ArrowRight className="w-3 h-3 text-[#00FF89]" />}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>

                    {/* Setup Time & Outcomes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Setup Time */}
                        {product?.setupTime && (
                            <motion.div
                                variants={scaleIn}
                                transition={{ delay: 1.2 }}
                                className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/5 via-transparent to-blue-500/5 rounded-2xl blur-xl" />
                                <div className="relative bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/5 rounded-xl flex items-center justify-center border border-[#00FF89]/20">
                                            <Timer className="w-6 h-6 text-[#00FF89]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Quick Setup</h3>
                                            <p className="text-[#00FF89] font-semibold">
                                                {product.setupTime.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-400">
                                        Get up and running quickly with our streamlined setup process
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Expected Outcomes */}
                        {product?.outcome && product.outcome.length > 0 && (
                            <motion.div
                                variants={scaleIn}
                                transition={{ delay: 1.4 }}
                                className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/5 via-transparent to-purple-500/5 rounded-2xl blur-xl" />
                                <div className="relative bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/5 rounded-xl flex items-center justify-center border border-[#00FF89]/20">
                                            <Target className="w-6 h-6 text-[#00FF89]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Expected Outcomes</h3>
                                            <p className="text-gray-400 text-sm">What you'll achieve</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {product.outcome.slice(0, 3).map((outcome, index) => (
                                            <motion.div 
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1.6 + index * 0.1 }}
                                                className="flex items-center gap-3">
                                                <CheckCircle className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                                                <span className="text-gray-300 text-sm">
                                                    {outcome}
                                                </span>
                                            </motion.div>
                                        ))}
                                        {product.outcome.length > 3 && (
                                            <div className="text-[#00FF89] text-sm font-medium">
                                                +{product.outcome.length - 3} more benefits
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
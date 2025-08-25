'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Cpu, 
    Zap, 
    Database, 
    Clock, 
    Target, 
    Star, 
    TrendingUp,
    Shield,
    Layers,
    Sparkles,
    ChevronRight,
    Info,
    CheckCircle,
    AlertTriangle,
    Rocket
} from 'lucide-react'

const specIcons = {
    performance: Zap,
    accuracy: Target,
    speed: Rocket,
    compatibility: Shield,
    complexity: Layers,
    features: Sparkles,
    rating: Star,
    usage: TrendingUp,
    data: Database,
    processing: Cpu,
    time: Clock,
    default: Info
}

const specColors = {
    performance: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    accuracy: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    speed: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    compatibility: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    complexity: 'from-red-500/20 to-orange-500/20 border-red-500/30',
    features: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
    rating: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    usage: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    data: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
    processing: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    time: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    default: 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
}

export default function ProductSpecs({ product }) {
    const [selectedSpec, setSelectedSpec] = useState(null)
    const [hoveredSpec, setHoveredSpec] = useState(null)

    // Enhanced specs with detailed information
    const specs = [
        {
            id: 'type',
            label: 'Product Type',
            value: product?.type || 'AI Tool',
            type: 'features',
            description: 'Category and classification of this AI product',
            details: `This is a ${product?.type || 'AI Tool'} designed for enhanced productivity and automation.`
        },
        {
            id: 'performance',
            label: 'Performance Score',
            value: '9.5/10',
            type: 'performance',
            description: 'Overall performance rating based on user feedback',
            details: 'High-performance AI system with optimized algorithms for maximum efficiency.'
        },
        {
            id: 'accuracy',
            label: 'Accuracy Rate',
            value: '98.5%',
            type: 'accuracy',
            description: 'Success rate in delivering expected results',
            details: 'Consistently delivers accurate results with minimal error rates.'
        },
        {
            id: 'speed',
            label: 'Processing Speed',
            value: '< 2s',
            type: 'speed',
            description: 'Average response time for processing requests',
            details: 'Lightning-fast processing with sub-2 second response times.'
        },
        {
            id: 'compatibility',
            label: 'Platform Support',
            value: 'Universal',
            type: 'compatibility',
            description: 'Compatible platforms and integrations',
            details: 'Works seamlessly across all major platforms and systems.'
        },
        {
            id: 'complexity',
            label: 'Complexity Level',
            value: product?.difficulty || 'Intermediate',
            type: 'complexity',
            description: 'Required skill level for optimal usage',
            details: 'Designed for users with intermediate technical knowledge.'
        },
        {
            id: 'features',
            label: 'Key Features',
            value: `${product?.features?.length || 5}+ Features`,
            type: 'features',
            description: 'Number of included features and capabilities',
            details: 'Comprehensive feature set covering all essential use cases.'
        },
        {
            id: 'rating',
            label: 'User Rating',
            value: `${product?.rating || 4.8}/5.0`,
            type: 'rating',
            description: 'Average user satisfaction rating',
            details: 'Highly rated by users for quality and effectiveness.'
        }
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-bold text-white mb-4"
                >
                    Technical Specifications
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-gray-400 text-lg max-w-2xl mx-auto"
                >
                    Detailed technical information and performance metrics
                </motion.p>
            </div>

            {/* Specs Grid - Bento Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {specs.map((spec, index) => {
                    const IconComponent = specIcons[spec.type] || specIcons.default
                    const colorClass = specColors[spec.type] || specColors.default
                    const isSelected = selectedSpec === spec.id
                    const isHovered = hoveredSpec === spec.id

                    return (
                        <motion.div
                            key={spec.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className={`relative group cursor-pointer ${
                                index === 0 || index === 3 ? 'md:col-span-2' : ''
                            }`}
                            onMouseEnter={() => setHoveredSpec(spec.id)}
                            onMouseLeave={() => setHoveredSpec(null)}
                            onClick={() => setSelectedSpec(isSelected ? null : spec.id)}
                        >
                            <div className={`
                                relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-500
                                bg-gradient-to-br ${colorClass}
                                ${isHovered ? 'transform scale-105 shadow-2xl' : 'shadow-lg'}
                                ${isSelected ? 'ring-2 ring-white/30' : ''}
                            `}>
                                {/* Background Pattern */}
                                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
                                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-white/10 backdrop-blur">
                                                <IconComponent className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-white text-sm">
                                                {spec.label}
                                            </h3>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isHovered ? 90 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ChevronRight className="w-4 h-4 text-white/60" />
                                        </motion.div>
                                    </div>

                                    {/* Value */}
                                    <div className="mb-3">
                                        <div className="text-2xl font-bold text-white mb-1">
                                            {spec.value}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">
                                            {spec.description}
                                        </p>
                                    </div>

                                    {/* Progress Bar for Performance Metrics */}
                                    {(spec.type === 'performance' || spec.type === 'accuracy') && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-white/60 mb-2">
                                                <span>Performance</span>
                                                <span>{spec.value}</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${parseFloat(spec.value) * 10}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-white/5 rounded-2xl backdrop-blur-sm flex items-center justify-center"
                                            >
                                                <div className="text-center p-4">
                                                    <Info className="w-8 h-8 text-white/80 mx-auto mb-2" />
                                                    <p className="text-sm text-white/90 font-medium">
                                                        Click for details
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Detailed View Modal */}
            <AnimatePresence>
                {selectedSpec && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedSpec(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {(() => {
                                const spec = specs.find(s => s.id === selectedSpec)
                                const IconComponent = specIcons[spec?.type] || specIcons.default
                                const colorClass = specColors[spec?.type] || specColors.default

                                return (
                                    <div className="text-center">
                                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colorClass} mb-6`}>
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {spec?.label}
                                        </h3>
                                        
                                        <div className="text-3xl font-bold text-white mb-4">
                                            {spec?.value}
                                        </div>
                                        
                                        <p className="text-gray-300 leading-relaxed mb-6">
                                            {spec?.details}
                                        </p>

                                        <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="text-sm font-medium">Verified Specification</span>
                                        </div>

                                        <button
                                            onClick={() => setSelectedSpec(null)}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
                                        >
                                            Close Details
                                        </button>
                                    </div>
                                )
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Summary Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 rounded-2xl p-6 border border-white/10 backdrop-blur-xl"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400 mb-1">98.5%</div>
                        <div className="text-sm text-gray-400">Success Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1"> 2s</div>
                        <div className="text-sm text-gray-400">Avg. Response</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400 mb-1">24/7</div>
                        <div className="text-sm text-gray-400">Availability</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">99.9%</div>
                        <div className="text-sm text-gray-400">Uptime</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
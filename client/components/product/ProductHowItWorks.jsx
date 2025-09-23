'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Settings, Zap, Play, CheckCircle, Brain, Route, Database, Users, BarChart } from 'lucide-react'
export default function ProductHowItWorks({ product }) {
    const getIconForStep = (stepText, index) => {
        const text = stepText.toLowerCase()
        if (text.includes('submit') || text.includes('ticket')) return Users
        if (text.includes('chatgpt') || text.includes('ai') || text.includes('analyzes')) return Brain
        if (text.includes('knowledge') || text.includes('database') || text.includes('checks')) return Database
        if (text.includes('route') || text.includes('escalat')) return Route
        if (text.includes('log') || text.includes('analyz') || text.includes('improv')) return BarChart
        const fallbackIcons = [Users, Brain, Database, Route, BarChart]
        return fallbackIcons[index] || Zap
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
                description: 'Complete your purchase and get instant access to download all files and resources.',
                icon: Download
            },
            {
                title: 'Setup & Installation',
                description: 'Follow our step-by-step guide to set up the product in your environment.',
                icon: Settings
            },
            {
                title: 'Start Using',
                description: 'Begin using the product immediately with our comprehensive documentation.',
                icon: Zap
            }
        ]
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3">
                <h2 className="text-xl font-medium text-[#121212] dark:text-[#00FF89]">
                    How It Works
                </h2>
                <p className="text-base text-[#6b7280] dark:text-[#9ca3af]">
                    {product?.targetAudience ? `Perfect for ${product.targetAudience.toLowerCase()}` : 'Simple steps to get started with this product'}
                </p>
            </motion.div>
            <div className="space-y-6">
                {steps.map((step, index) => {
                    const IconComponent = step.icon
                    const isLast = index === steps.length - 1
                    return (
                        <div key={index} className="relative">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.1 }}
                                className="flex items-start gap-4">
                                <div className="flex-shrink-0 relative">
                                    <div className="w-12 h-12 bg-[#00FF89] rounded-full flex items-center justify-center">
                                        <span className="text-[#121212] font-bold text-sm">{index + 1}</span>
                                    </div>
                                    {!isLast && (
                                        <div className="absolute top-12 left-1/2 w-px h-6 bg-[#00FF89]/30 -translate-x-px" />
                                    )}
                                </div>
                                <div className="flex-1 pb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89] mb-2">
                                                {step.title}
                                            </h3>
                                            <p className="text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 w-10 h-10 bg-[#00FF89]/10 rounded-lg flex items-center justify-center">
                                            <IconComponent className="w-5 h-5 text-[#00FF89]" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                })}
            </div>
            {product?.setupTime && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#00FF89]/5 dark:bg-[#00FF89]/10 rounded-lg p-4 border border-[#00FF89]/20 dark:border-[#00FF89]/30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#00FF89]/10 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-[#00FF89]" />
                        </div>
                        <div>
                            <div className="font-medium text-[#121212] dark:text-[#00FF89] text-sm">
                                Quick Setup
                            </div>
                            <div className="text-[#6b7280] dark:text-[#9ca3af] text-sm">
                                Setup time: {product.setupTime.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            {product?.outcome && product.outcome.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#00FF89]/5 dark:bg-[#00FF89]/10 rounded-lg p-6 border border-[#00FF89]/20 dark:border-[#00FF89]/30">
                    <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89] mb-4">
                        Expected Outcomes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {product.outcome.map((outcome, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                                <span className="text-[#6b7280] dark:text-[#9ca3af] text-sm">
                                    {outcome}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center pt-4">
                <div className="inline-flex items-center gap-2 text-[#00FF89] font-medium">
                    <span>Ready to get started?</span>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </motion.div>
        </div>
    )
}
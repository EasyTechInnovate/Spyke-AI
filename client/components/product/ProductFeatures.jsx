'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { 
    Sparkles, 
    Zap, 
    Star, 
    Rocket, 
    Shield, 
    Target, 
    CheckCircle, 
    ArrowRight, 
    Package,
    Award,
    Timer,
    Globe,
    Users,
    TrendingUp,
    Eye,
    Heart,
    ThumbsUp
} from 'lucide-react'
const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
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
const featureIcons = [
    Sparkles, Zap, Star, Rocket, Shield, Target, 
    Package, Award, Timer, Globe, Users, TrendingUp
]
export default function ProductFeatures({ product }) {
    const features = product?.benefits || []
    if (features.length === 0) {
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
                                <Star className="w-10 h-10 text-[#00FF89]" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#00FF89] rounded-full animate-ping opacity-75"></div>
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#00FF89]/60 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Features Coming Soon
                        </h3>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Exciting features and benefits are being prepared for this amazing product.
                        </p>
                    </motion.div>
                </div>
            </div>
        )
    }
    const displayFeatures = features.slice(0, 6)
    return (
        <div className="relative bg-black overflow-hidden">
            <div className="absolute inset-0">
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
                    className="absolute top-1/4 right-1/3 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        rotate: [360, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl"
                />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-12">
                    <motion.div 
                        variants={fadeInUp}
                        className="text-center space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#00FF89]/10 border border-[#00FF89]/20">
                            <Sparkles className="w-5 h-5 text-[#00FF89]" />
                            <span className="text-[#00FF89] font-semibold text-sm">Key Features</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                            What Makes This <span className="text-[#00FF89]">Special</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Discover the powerful features that make {product?.title || 'this product'} stand out from the competition
                        </p>
                    </motion.div>
                    <motion.div 
                        variants={stagger}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayFeatures.map((feature, index) => {
                            const IconComponent = featureIcons[index % featureIcons.length]
                            return (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    whileHover={{ 
                                        y: -8,
                                        transition: { type: "spring", stiffness: 300, damping: 20 }
                                    }}
                                    className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/20 via-transparent to-blue-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                    <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-[#00FF89]/30 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-[#00FF89]/10">
                                        <div className="relative mb-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/5 rounded-xl flex items-center justify-center border border-[#00FF89]/20 transition-all duration-300 group-hover:scale-110 group-hover:border-[#00FF89]/40">
                                                <IconComponent className="w-8 h-8 text-[#00FF89]" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00FF89] text-black rounded-full flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-[#00FF89] transition-colors">
                                                    Feature #{index + 1}
                                                </h3>
                                                <CheckCircle className="w-5 h-5 text-[#00FF89] opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                                            </div>
                                            <p className="text-gray-300 leading-relaxed text-lg">
                                                {feature}
                                            </p>
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-gray-700/50">
                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ 
                                                        delay: index * 0.2 + 0.8, 
                                                        duration: 1.2, 
                                                        ease: "easeOut" 
                                                    }}
                                                    className="h-full bg-gradient-to-r from-[#00FF89] to-[#00e67a] rounded-full"
                                                />
                                            </div>
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            whileHover={{ opacity: 1, x: 0 }}
                                            className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00FF89]/20 border border-[#00FF89]/30 rounded-full">
                                                <span className="text-[#00FF89] text-xs font-medium">Learn More</span>
                                                <ArrowRight className="w-3 h-3 text-[#00FF89]" />
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                    {features.length > 6 && (
                        <motion.div
                            variants={scaleIn}
                            transition={{ delay: 1.2 }}
                            className="text-center">
                            <div className="relative inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-[#00FF89]/10 via-[#00FF89]/5 to-transparent border border-[#00FF89]/20 rounded-2xl backdrop-blur-sm">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#00FF89] to-[#00e67a] rounded-xl flex items-center justify-center">
                                    <Star className="w-5 h-5 text-black" />
                                </div>
                                <div>
                                    <span className="block font-bold text-[#00FF89] text-lg">
                                        +{features.length - 6} More Amazing Features
                                    </span>
                                    <span className="block text-gray-400 text-sm">
                                        Discover additional benefits when you get this product
                                    </span>
                                </div>
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00FF89] rounded-full animate-ping"></div>
                                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#00FF89]/60 rounded-full animate-pulse"></div>
                            </div>
                        </motion.div>
                    )}
                    {product?.useCaseExamples && product.useCaseExamples.length > 0 && (
                        <motion.div
                            variants={fadeInUp}
                            transition={{ delay: 1.4 }}
                            className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/5 via-transparent to-blue-500/5 rounded-3xl blur-2xl" />
                            <div className="relative bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#00FF89]/10 border border-[#00FF89]/20 mb-4">
                                        <Target className="w-4 h-4 text-[#00FF89]" />
                                        <span className="text-[#00FF89] font-medium text-sm">Perfect For</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        Ideal Use Cases
                                    </h3>
                                    <p className="text-gray-400">
                                        See how this product can transform your workflow
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {product.useCaseExamples.slice(0, 4).map((useCase, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.6 + index * 0.1 }}
                                            className="group flex items-center gap-3 p-4 bg-white/5 hover:bg-[#00FF89]/5 border border-gray-700/50 hover:border-[#00FF89]/30 rounded-xl transition-all duration-300">
                                            <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <ArrowRight className="w-4 h-4 text-[#00FF89]" />
                                            </div>
                                            <span className="text-gray-300 group-hover:text-white transition-colors font-medium">
                                                {useCase}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
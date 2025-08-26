'use client'

import React from 'react'
import { motion } from 'framer-motion'
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
    Info,
    Eye,
    Heart,
    ThumbsUp,
    Package,
    Users,
    Calendar
} from 'lucide-react'

export default function ProductSpecs({ product }) {
    if (!product) return null

    // Build specs from actual API data
    const specs = [
        {
            label: 'Product Type',
            value: product.type?.charAt(0).toUpperCase() + product.type?.slice(1) || 'AI Tool',
            icon: Sparkles
        },
        {
            label: 'Category',
            value: product.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified',
            icon: Layers
        },
        {
            label: 'Industry',
            value: product.industry?.toUpperCase() || 'General',
            icon: Target
        },
        {
            label: 'Setup Time',
            value: product.setupTime?.replace('_', ' ') || 'Not specified',
            icon: Clock
        },
        {
            label: 'Current Version',
            value: `v${product.currentVersion}` || 'v1.0.0',
            icon: Package
        },
        {
            label: 'Views',
            value: product.views?.toLocaleString() || '0',
            icon: Eye
        },
        {
            label: 'Sales',
            value: product.sales?.toLocaleString() || '0',
            icon: TrendingUp
        },
        {
            label: 'User Rating',
            value: product.averageRating > 0 ? `${product.averageRating}/5.0` : 'New Product',
            icon: Star
        }
    ]

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3">
                
                <h2 className="text-xl font-medium text-[#121212] dark:text-[#00FF89]">
                    Technical Specifications
                </h2>
                
                <p className="text-base text-[#6b7280] dark:text-[#9ca3af]">
                    Detailed technical information and performance metrics
                </p>
            </motion.div>

            {/* Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {specs.map((spec, index) => {
                    const IconComponent = spec.icon
                    
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.1 }}
                            className="bg-gray-50 dark:bg-[#1f1f1f] rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-[#1f1f1f]/80 transition-colors">
                            
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-[#00FF89]/10 rounded-lg flex items-center justify-center">
                                    <IconComponent className="w-5 h-5 text-[#00FF89]" />
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="font-medium text-[#121212] dark:text-[#00FF89] mb-1">
                                        {spec.label}
                                    </h3>
                                    <p className="text-lg font-semibold text-[#6b7280] dark:text-[#9ca3af]">
                                        {spec.value}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Tools & Technologies */}
            {product.toolsUsed && product.toolsUsed.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="space-y-4">
                    
                    <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89]">
                        Technologies Used
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.toolsUsed.map((tool, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * index + 1.0 }}
                                className="bg-gray-50 dark:bg-[#1f1f1f] rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-[#1f1f1f]/80 transition-colors">
                                
                                <div className="flex items-center gap-3">
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
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Performance Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-[#00FF89]/5 dark:bg-[#00FF89]/10 rounded-lg p-6 border border-[#00FF89]/20 dark:border-[#00FF89]/30">
                
                <div className="text-center space-y-4">
                    <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89]">
                        Product Statistics
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-[#00FF89]">{product.views || 0}</div>
                            <div className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Views</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-[#00FF89]">{product.sales || 0}</div>
                            <div className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Sales</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-[#00FF89]">{product.upvotes || 0}</div>
                            <div className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Upvotes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-[#00FF89]">{product.favorites || 0}</div>
                            <div className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Favorites</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Verification Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className={`p-4 rounded-lg border ${
                        product.isVerified 
                            ? 'bg-[#00FF89]/5 dark:bg-[#00FF89]/10 border-[#00FF89]/20 dark:border-[#00FF89]/30'
                            : 'bg-gray-50 dark:bg-[#1f1f1f] border-gray-200 dark:border-gray-700'
                    }`}>
                    
                    <div className="flex items-center gap-3">
                        <Shield className={`w-5 h-5 ${product.isVerified ? 'text-[#00FF89]' : 'text-[#6b7280] dark:text-[#9ca3af]'}`} />
                        <div>
                            <div className="font-medium text-[#121212] dark:text-[#00FF89] text-sm">
                                Verification Status
                            </div>
                            <div className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                                {product.isVerified ? 'Verified Product' : 'Pending Verification'}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Testing Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className={`p-4 rounded-lg border ${
                        product.isTested 
                            ? 'bg-[#00FF89]/5 dark:bg-[#00FF89]/10 border-[#00FF89]/20 dark:border-[#00FF89]/30'
                            : 'bg-gray-50 dark:bg-[#1f1f1f] border-gray-200 dark:border-gray-700'
                    }`}>
                    
                    <div className="flex items-center gap-3">
                        <Zap className={`w-5 h-5 ${product.isTested ? 'text-[#00FF89]' : 'text-[#6b7280] dark:text-[#9ca3af]'}`} />
                        <div>
                            <div className="font-medium text-[#121212] dark:text-[#00FF89] text-sm">
                                Testing Status
                            </div>
                            <div className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
                                {product.isTested ? 'Fully Tested' : 'Testing in Progress'}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
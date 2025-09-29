'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, Zap, Database, Clock, Target, Star, TrendingUp, Shield, Layers, Sparkles, Eye, Package, Users, Calendar } from 'lucide-react'

export default function ProductSpecs({ product }) {
    if (!product) return null

    const specs = [
        {
            label: 'Product Type',
            value: product.type?.charAt(0).toUpperCase() + product.type?.slice(1) || 'AI Tool',
            icon: Sparkles
        },
        {
            label: 'Category',
            value: product.category?.name || 'Not specified',
            icon: Layers
        },
        {
            label: 'Industry',
            value: product.industry?.name || 'General',
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

    const statusItems = [
        {
            label: 'Verification Status',
            value: product.isVerified ? 'Verified' : 'Pending',
            icon: Shield,
            active: product.isVerified
        },
        {
            label: 'Testing Status',
            value: product.isTested ? 'Tested' : 'In Progress',
            icon: Zap,
            active: product.isTested
        }
    ]

    return (
        <div className="w-full space-y-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent">
                    Technical Specifications
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Detailed technical information and performance metrics for this product
                </p>
            </motion.div>

            {/* Main Specs Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specs.map((spec, index) => {
                    const IconComponent = spec.icon
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                            className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <div className="relative p-6 rounded-2xl bg-black/90 border border-green-500/20 backdrop-blur-sm hover:border-green-400/40 transition-all duration-300 shadow-xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-900/50 to-black border border-green-500/30 flex items-center justify-center group-hover:from-green-800/60 group-hover:border-green-400/50 transition-all duration-300 shadow-lg">
                                        <IconComponent className="w-6 h-6 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-400 mb-2">{spec.label}</p>
                                        <p className="text-lg font-semibold text-white truncate">{spec.value}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Technologies Section */}
            {product.toolsUsed && product.toolsUsed.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent mb-2">
                            Technologies Used
                        </h3>
                        <p className="text-gray-400 leading-relaxed">Built with modern tools and frameworks for optimal performance</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {product.toolsUsed
                            .sort((a, b) => a.name?.localeCompare(b.name) || 0)
                            .map((tool, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.05 * index + 0.5 }}
                                    className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                    <div className="relative p-4 rounded-xl bg-black/90 border border-green-500/20 backdrop-blur-sm hover:border-green-400/40 transition-all duration-300 shadow-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-900/50 to-black border border-green-500/30 flex items-center justify-center group-hover:from-green-800/60 group-hover:border-green-400/50 transition-all duration-300 shadow-lg">
                                                <span className="text-sm font-semibold text-green-400 group-hover:text-green-300 transition-colors duration-300">
                                                    {tool.name?.charAt(0).toUpperCase() || 'T'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-white text-sm truncate">{tool.name}</div>
                                                {tool.model && <div className="text-xs text-gray-400 truncate">{tool.model}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </motion.div>
            )}

            {/* Status Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6">
                <div className="text-center">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent mb-2">
                        Product Status
                    </h3>
                    <p className="text-gray-400 leading-relaxed">Current verification and testing status</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {statusItems.map((item, index) => {
                        const IconComponent = item.icon
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.65 + index * 0.1 }}
                                className="group relative">
                                <div
                                    className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                                        item.active
                                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20'
                                            : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'
                                    }`}></div>
                                <div
                                    className={`relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 shadow-xl ${
                                        item.active
                                            ? 'bg-black/95 border-green-400/40 hover:border-green-300/60'
                                            : 'bg-black/90 border-green-500/20 hover:border-green-400/40'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                                                item.active
                                                    ? 'bg-gradient-to-br from-green-600/80 to-green-800/80 border border-green-400/50 group-hover:from-green-500/90 group-hover:to-green-700/90'
                                                    : 'bg-gradient-to-br from-green-900/50 to-black border border-green-500/30 group-hover:from-green-800/60 group-hover:border-green-400/50'
                                            }`}>
                                            <IconComponent
                                                className={`w-6 h-6 transition-colors duration-300 ${
                                                    item.active ? 'text-white' : 'text-green-400 group-hover:text-green-300'
                                                }`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-400 mb-2">{item.label}</p>
                                            <p className={`text-lg font-semibold ${item.active ? 'text-green-300' : 'text-white'}`}>{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}


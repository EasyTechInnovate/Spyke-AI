'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
    BookOpen, 
    Target, 
    Package, 
    Info, 
    Download, 
    FileText, 
    RefreshCw, 
    MessageSquare,
    CheckCircle,
    Clock,
    Shield,
    Tag,
    Star
} from 'lucide-react'

import { DESIGN_TOKENS, DSHeading, DSText, DSStack, DSBadge } from '@/lib/design-system'

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
}

export default function ProductOverview({ product }) {
    if (!product) return null

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-4xl mx-auto space-y-8">
            
            {/* Main Description - Minimalist */}
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00FF89]/10 border border-[#00FF89]/20 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-[#00FF89]" />
                </div>
                
                <DSHeading 
                    level={2} 
                    className="font-bold"
                    style={{ color: '#00FF89', fontSize: '2rem' }}>
                    About This Product
                </DSHeading>
                
                <DSText
                    className="text-lg leading-relaxed max-w-3xl mx-auto"
                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                    {product.fullDescription || product.shortDescription}
                </DSText>
            </div>

            {/* Key Information Grid - Clean & Minimal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Benefits Section */}
                {product.benefits && product.benefits.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#00FF89]/10 flex items-center justify-center">
                                <Star className="w-4 h-4 text-[#00FF89]" />
                            </div>
                            <DSHeading 
                                level={3} 
                                className="font-semibold"
                                style={{ color: '#00FF89', fontSize: '1.25rem' }}>
                                Key Benefits
                            </DSHeading>
                        </div>
                        
                        <div className="space-y-4">
                            {product.benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 group">
                                    <div className="w-6 h-6 rounded-full bg-[#00FF89]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="w-3 h-3 text-[#00FF89]" />
                                    </div>
                                    <DSText 
                                        className="text-sm leading-relaxed group-hover:text-white transition-colors"
                                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                        {benefit}
                                    </DSText>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Details */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00FF89]/10 flex items-center justify-center">
                            <Info className="w-4 h-4 text-[#00FF89]" />
                        </div>
                        <DSHeading 
                            level={3} 
                            className="font-semibold"
                            style={{ color: '#00FF89', fontSize: '1.25rem' }}>
                            Details
                        </DSHeading>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            { 
                                label: 'Category', 
                                value: product.category?.replace('_', ' ').charAt(0).toUpperCase() + 
                                       product.category?.slice(1).replace('_', ' '),
                                icon: Target
                            },
                            { 
                                label: 'Type', 
                                value: product.type?.charAt(0).toUpperCase() + product.type?.slice(1),
                                icon: Package
                            },
                            { 
                                label: 'Version', 
                                value: product.currentVersion || '1.0.0',
                                icon: Shield
                            },
                            { 
                                label: 'Last Updated', 
                                value: new Date(product.updatedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                }),
                                icon: Clock
                            }
                        ].map((detail, index) => (
                            <motion.div 
                                key={index} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className="flex items-center justify-between py-3 border-b border-gray-800/50 last:border-b-0 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-[#00FF89]/10 flex items-center justify-center">
                                        <detail.icon className="w-3 h-3 text-[#00FF89]" />
                                    </div>
                                    <DSText 
                                        className="text-sm font-medium"
                                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                        {detail.label}
                                    </DSText>
                                </div>
                                <DSText 
                                    className="text-sm font-semibold group-hover:text-[#00FF89] transition-colors"
                                    style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                    {detail.value}
                                </DSText>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* What's Included - Full Width */}
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[#00FF89]/10 border border-[#00FF89]/20 flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-[#00FF89]" />
                    </div>
                    <DSHeading 
                        level={3} 
                        className="font-semibold"
                        style={{ color: '#00FF89', fontSize: '1.5rem' }}>
                        What You Get
                    </DSHeading>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Download, text: 'Instant Download', desc: 'Get immediate access' },
                        { icon: FileText, text: 'Documentation', desc: 'Complete setup guide' },
                        { icon: RefreshCw, text: 'Free Updates', desc: 'Lifetime improvements' },
                        { icon: MessageSquare, text: '24/7 Support', desc: 'Always here to help' }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="text-center space-y-3 p-6 rounded-xl border border-gray-800/50 hover:border-[#00FF89]/30 transition-all group hover:bg-[#00FF89]/5">
                            <div className="w-12 h-12 mx-auto rounded-xl bg-[#00FF89]/10 flex items-center justify-center group-hover:bg-[#00FF89]/20 transition-colors">
                                <item.icon className="w-6 h-6 text-[#00FF89]" />
                            </div>
                            <div>
                                <DSText 
                                    className="font-semibold mb-1"
                                    style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                    {item.text}
                                </DSText>
                                <DSText 
                                    className="text-sm"
                                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                    {item.desc}
                                </DSText>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tags - Minimalist */}
            {product.tags?.length > 0 && (
                <div className="space-y-4">
                    <div className="text-center">
                        <DSHeading 
                            level={4} 
                            className="font-medium"
                            style={{ color: '#00FF89', fontSize: '1.125rem' }}>
                            Related Topics
                        </DSHeading>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        {product.tags.map((tag, index) => (
                            <Link
                                key={index}
                                href={`/explore?tag=${encodeURIComponent(tag)}`}>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border border-[#00FF89]/20 hover:border-[#00FF89]/50 hover:bg-[#00FF89]/10 transition-all cursor-pointer"
                                    style={{ color: '#00FF89' }}>
                                    #{tag}
                                </motion.span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )
}
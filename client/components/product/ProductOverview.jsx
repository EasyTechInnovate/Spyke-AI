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
    Tag
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
            className="max-w-5xl mx-auto">
            
            {/* Optimized Single-Row Layout - No Overflow */}
            <div className="space-y-4">
                
                {/* Main Description - Enhanced Typography */}
                <div
                    className="backdrop-blur-sm rounded-xl p-5 border transition-all hover:shadow-md"
                    style={{
                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                        borderColor: '#00FF8940'
                    }}>
                    <div className="flex items-start gap-4">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105"
                            style={{ backgroundColor: '#00FF89' }}>
                            <BookOpen className="w-5 h-5 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DSHeading 
                                level={3} 
                                className="mb-3 font-bold tracking-tight" 
                                style={{ 
                                    color: '#00FF89', 
                                    fontSize: '1.25rem',
                                    lineHeight: '1.3'
                                }}>
                                About This Product
                            </DSHeading>
                            <DSText
                                className="leading-relaxed text-pretty"
                                style={{ 
                                    color: DESIGN_TOKENS.colors.text.secondary.dark, 
                                    fontSize: '0.9rem', 
                                    lineHeight: '1.6'
                                }}>
                                {(product.fullDescription || product.shortDescription)?.slice(0, 280)}
                                {(product.fullDescription || product.shortDescription)?.length > 280 ? '...' : ''}
                            </DSText>
                        </div>
                    </div>
                </div>

                {/* Enhanced Three-Column Grid - Responsive & No Overflow */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Benefits - Enhanced */}
                    {product.benefits && product.benefits.length > 0 && (
                        <div
                            className="backdrop-blur-sm rounded-xl p-4 border transition-all hover:shadow-md hover:-translate-y-1"
                            style={{
                                backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                borderColor: '#FFC05040'
                            }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                                    style={{ backgroundColor: '#FFC050' }}>
                                    <Target className="w-4 h-4 text-white" />
                                </div>
                                <DSHeading 
                                    level={4} 
                                    className="font-bold tracking-tight"
                                    style={{ 
                                        color: '#FFC050', 
                                        fontSize: '1rem',
                                        lineHeight: '1.2'
                                    }}>
                                    Key Benefits
                                </DSHeading>
                            </div>
                            <div className="space-y-2.5 max-h-32 overflow-y-auto scrollbar-thin">
                                {product.benefits.slice(0, 4).map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-2.5">
                                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#00FF89' }} />
                                        <DSText 
                                            className="text-sm leading-tight text-pretty"
                                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                            {benefit.slice(0, 70)}{benefit.length > 70 ? '...' : ''}
                                        </DSText>
                                    </div>
                                ))}
                                {product.benefits.length > 4 && (
                                    <DSText 
                                        className="text-xs text-center pt-2 font-medium" 
                                        style={{ color: '#FFC050' }}>
                                        +{product.benefits.length - 4} more benefits
                                    </DSText>
                                )}
                            </div>
                        </div>
                    )}

                    {/* What's Included - Enhanced */}
                    <div
                        className="backdrop-blur-sm rounded-xl p-4 border transition-all hover:shadow-md hover:-translate-y-1"
                        style={{
                            backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                            borderColor: '#00FF8940'
                        }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                                style={{ backgroundColor: '#00FF89' }}>
                                <Package className="w-4 h-4 text-black" />
                            </div>
                            <DSHeading 
                                level={4} 
                                className="font-bold tracking-tight"
                                style={{ 
                                    color: '#00FF89', 
                                    fontSize: '1rem',
                                    lineHeight: '1.2'
                                }}>
                                What's Included
                            </DSHeading>
                        </div>
                        <div className="space-y-3">
                            {[
                                { icon: Download, text: 'Instant Download', color: '#00FF89' },
                                { icon: FileText, text: 'Full Documentation', color: '#FFC050' },
                                { icon: RefreshCw, text: 'Free Updates', color: '#00FF89' },
                                { icon: MessageSquare, text: '24/7 Support', color: '#FFC050' }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3 group">
                                    <div 
                                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all group-hover:scale-110"
                                        style={{ backgroundColor: `${item.color}20` }}>
                                        <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                                    </div>
                                    <DSText 
                                        className="text-sm font-medium group-hover:translate-x-0.5 transition-transform" 
                                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                        {item.text}
                                    </DSText>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Details - Enhanced */}
                    <div
                        className="backdrop-blur-sm rounded-xl p-4 border transition-all hover:shadow-md hover:-translate-y-1"
                        style={{
                            backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                            borderColor: '#FFC05040'
                        }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                                style={{ backgroundColor: '#FFC050' }}>
                                <Info className="w-4 h-4 text-white" />
                            </div>
                            <DSHeading 
                                level={4} 
                                className="font-bold tracking-tight"
                                style={{ 
                                    color: '#FFC050', 
                                    fontSize: '1rem',
                                    lineHeight: '1.2'
                                }}>
                                Product Details
                            </DSHeading>
                        </div>
                        
                        <div className="space-y-3">
                            {[
                                { 
                                    label: 'Category', 
                                    value: product.category?.replace('_', ' ').charAt(0).toUpperCase() + 
                                           product.category?.slice(1).replace('_', ' '),
                                    icon: Target,
                                    color: '#00FF89'
                                },
                                { 
                                    label: 'Version', 
                                    value: product.currentVersion || '1.0.0',
                                    icon: Shield,
                                    color: '#FFC050'
                                },
                                { 
                                    label: 'Last Updated', 
                                    value: new Date(product.updatedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }),
                                    icon: Clock,
                                    color: '#00FF89'
                                }
                            ].map((detail, index) => (
                                <div key={index} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <detail.icon className="w-3.5 h-3.5" style={{ color: detail.color }} />
                                        <DSText 
                                            className="text-sm font-medium" 
                                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                            {detail.label}
                                        </DSText>
                                    </div>
                                    <DSText 
                                        className="text-sm font-bold group-hover:scale-105 transition-transform" 
                                        style={{ color: detail.color }}>
                                        {detail.value}
                                    </DSText>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Compact Tags */}
                        {product.tags?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-opacity-20" style={{ borderColor: '#FFC050' }}>
                                <DSText 
                                    className="text-xs font-medium mb-2" 
                                    style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}>
                                    Tags
                                </DSText>
                                <div className="flex flex-wrap gap-1.5">
                                    {product.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: '#FFC05020',
                                                color: '#FFC050',
                                                border: '1px solid #FFC05030'
                                            }}>
                                            <Tag className="w-2.5 h-2.5 mr-1" />
                                            {tag.slice(0, 8)}
                                        </span>
                                    ))}
                                    {product.tags.length > 3 && (
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                                            style={{
                                                backgroundColor: '#FFC05015',
                                                color: '#FFC050'
                                            }}>
                                            +{product.tags.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
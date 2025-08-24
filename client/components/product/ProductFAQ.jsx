'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, Crown, ThumbsUp, MessageSquare, Plus, CheckCircle, Mail, FileText } from 'lucide-react'

import { DESIGN_TOKENS, DSButton, DSHeading, DSText, DSStack, DSBadge } from '@/lib/design-system'

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
}

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
}

export default function ProductFAQ({ product }) {
    const [openItems, setOpenItems] = useState(new Set())

    // Create default FAQs if none provided - limit to prevent overflow
    const defaultFAQs = [
        {
            question: 'How do I get started?',
            answer: 'After purchase, you\'ll receive instant access to download files and detailed setup instructions.'
        },
        {
            question: 'Is support included?',
            answer: 'Yes, we provide comprehensive support via email and documentation to help you succeed.'
        },
        {
            question: 'What file formats are included?',
            answer: 'You\'ll receive all source files in their original formats plus documentation and guides.'
        },
        {
            question: 'Are updates free?',
            answer: 'Yes, all future updates and improvements are included at no additional cost.'
        }
    ]

    const faqs = product?.faqs?.slice(0, 6) || defaultFAQs.slice(0, 4)

    const toggleItem = useCallback((index) => {
        setOpenItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(index)) {
                newSet.delete(index)
            } else {
                newSet.add(index)
            }
            return newSet
        })
    }, [])

    return (
        <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-4xl mx-auto">
            
            {/* Enhanced Header with Better Typography */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: '#FFC050' }}>
                        <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                    <DSHeading 
                        level={3} 
                        className="font-bold tracking-tight"
                        style={{ 
                            color: '#FFC050', 
                            fontSize: '1.5rem',
                            lineHeight: '1.3'
                        }}>
                        Frequently Asked Questions
                    </DSHeading>
                </div>
                <DSText 
                    className="max-w-2xl mx-auto text-pretty"
                    style={{ 
                        color: DESIGN_TOKENS.colors.text.secondary.dark,
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                    }}>
                    Find quick answers to common questions about this product
                </DSText>
            </div>

            {/* Optimized FAQ List - No Overflow, Enhanced Typography */}
            <div className="space-y-3">
                {faqs.map((faq, index) => {
                    const isOpen = openItems.has(index)
                    const accentColor = index % 2 === 0 ? '#00FF89' : '#FFC050'
                    
                    return (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            className="backdrop-blur-sm rounded-xl border transition-all hover:shadow-md"
                            style={{
                                backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                borderColor: isOpen ? accentColor + '60' : accentColor + '30'
                            }}>
                            
                            {/* Enhanced FAQ Question Button */}
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-full flex items-center justify-between p-5 text-left transition-all hover:bg-opacity-50"
                                style={{ backgroundColor: isOpen ? accentColor + '10' : 'transparent' }}>
                                
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div 
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                                        style={{ 
                                            backgroundColor: accentColor + '20',
                                            transform: isOpen ? 'scale(1.1)' : 'scale(1)'
                                        }}>
                                        <HelpCircle className="w-4 h-4" style={{ color: accentColor }} />
                                    </div>
                                    
                                    <DSHeading
                                        level={4}
                                        className="font-bold tracking-tight pr-4 text-pretty"
                                        style={{ 
                                            color: isOpen ? accentColor : DESIGN_TOKENS.colors.text.primary.dark,
                                            fontSize: '1rem',
                                            lineHeight: '1.4'
                                        }}>
                                        {faq.question}
                                    </DSHeading>
                                </div>
                                
                                {/* Enhanced Toggle Icon */}
                                <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                    style={{ backgroundColor: accentColor + '15' }}>
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}>
                                        <ChevronDown className="w-4 h-4" style={{ color: accentColor }} />
                                    </motion.div>
                                </div>
                            </button>

                            {/* Enhanced FAQ Answer with Better Typography */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden">
                                        <div className="px-5 pb-5">
                                            <div 
                                                className="border-t pt-4 pl-12"
                                                style={{ borderColor: accentColor + '20' }}>
                                                <DSText
                                                    className="leading-relaxed text-pretty"
                                                    style={{ 
                                                        color: DESIGN_TOKENS.colors.text.secondary.dark,
                                                        fontSize: '0.9rem',
                                                        lineHeight: '1.6'
                                                    }}>
                                                    {faq.answer}
                                                </DSText>
                                                
                                                {/* Enhanced Helpful Indicator */}
                                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-opacity-20" style={{ borderColor: accentColor }}>
                                                    <div 
                                                        className="w-5 h-5 rounded-md flex items-center justify-center"
                                                        style={{ backgroundColor: accentColor + '20' }}>
                                                        <CheckCircle className="w-3 h-3" style={{ color: accentColor }} />
                                                    </div>
                                                    <DSText 
                                                        className="text-xs font-medium"
                                                        style={{ color: accentColor }}>
                                                        Hope this helps!
                                                    </DSText>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}
            </div>

            {/* Enhanced Contact Support Section - No Overflow */}
            <motion.div
                variants={fadeInUp}
                className="mt-8 text-center">
                <div 
                    className="backdrop-blur-sm rounded-xl p-6 border"
                    style={{
                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                        borderColor: '#00FF8940'
                    }}>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: '#00FF89' }}>
                            <MessageSquare className="w-5 h-5 text-black" />
                        </div>
                        <DSHeading 
                            level={4} 
                            className="font-bold"
                            style={{ 
                                color: '#00FF89', 
                                fontSize: '1.1rem',
                                lineHeight: '1.3'
                            }}>
                            Still Have Questions?
                        </DSHeading>
                    </div>
                    
                    <DSText 
                        className="mb-5 text-pretty"
                        style={{ 
                            color: DESIGN_TOKENS.colors.text.secondary.dark,
                            fontSize: '0.9rem',
                            lineHeight: '1.5'
                        }}>
                        Can't find what you're looking for? Our support team is here to help you succeed.
                    </DSText>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-md"
                            style={{
                                backgroundColor: '#00FF89',
                                color: '#000',
                            }}>
                            <Mail className="w-4 h-4" />
                            Contact Support
                        </button>
                        
                        <button
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium border transition-all hover:scale-105"
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: '#FFC050',
                                color: '#FFC050'
                            }}>
                            <FileText className="w-4 h-4" />
                            View Documentation
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Show More FAQs Indicator */}
            {product?.faqs && product.faqs.length > 6 && (
                <div className="mt-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border"
                        style={{
                            backgroundColor: '#FFC05015',
                            borderColor: '#FFC05040'
                        }}>
                        <div 
                            className="w-5 h-5 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: '#FFC050' }}>
                            <HelpCircle className="w-3 h-3 text-white" />
                        </div>
                        <DSText 
                            className="font-semibold text-sm"
                            style={{ color: '#FFC050' }}>
                            +{product.faqs.length - 6} more questions available
                        </DSText>
                    </motion.div>
                </div>
            )}
        </motion.div>
    )
}
'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, MessageSquare, Mail, FileText } from 'lucide-react'

export default function ProductFAQ({ product }) {
    const [openItems, setOpenItems] = useState(new Set())

    // Use real FAQ data from API
    const faqs = product?.faqs && product.faqs.length > 0 
        ? product.faqs.filter(faq => !faq.isPremium) // Only show non-premium FAQs
        : [
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
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3">
                <h2 className="text-xl font-medium text-[#121212] dark:text-[#00FF89]">Frequently Asked Questions</h2>

                <p className="text-base text-[#6b7280] dark:text-[#9ca3af]">
                    Find answers to common questions about {product?.title || 'this product'}
                </p>
            </motion.div>

            {/* FAQ List */}
            <div className="space-y-4">
                {faqs.map((faq, index) => {
                    const isOpen = openItems.has(index)

                    return (
                        <motion.div
                            key={faq._id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.1 }}
                            className="bg-gray-50 dark:bg-[#1f1f1f] rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#1f1f1f]/80 transition-colors">
                            {/* Question Button */}
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-full flex items-center justify-between p-6 text-left">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="flex-shrink-0 w-8 h-8 bg-[#00FF89]/10 rounded-lg flex items-center justify-center">
                                        <HelpCircle className="w-4 h-4 text-[#00FF89]" />
                                    </div>

                                    <h3 className="font-medium text-[#121212] dark:text-[#00FF89] text-left leading-relaxed">{faq.question}</h3>
                                </div>

                                <div className="flex-shrink-0 ml-4">
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}>
                                        <ChevronDown className="w-5 h-5 text-[#6b7280] dark:text-[#9ca3af]" />
                                    </motion.div>
                                </div>
                            </button>

                            {/* Answer */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden">
                                        <div className="px-6 pb-6">
                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 ml-12">
                                                <p className="text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">{faq.answer}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}
            </div>

            {/* Guarantee Section */}
            {product?.hasGuarantee && product?.guaranteeText && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[#00FF89]/5 dark:bg-[#00FF89]/10 rounded-lg p-6 border border-[#00FF89]/20 dark:border-[#00FF89]/30">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#00FF89]/10 rounded-lg flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-[#00FF89]" />
                        </div>
                        <div>
                            <h3 className="font-medium text-[#121212] dark:text-[#00FF89] mb-2">Money-Back Guarantee</h3>
                            <p className="text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">{product.guaranteeText}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Contact Support */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center">
                <div className="bg-[#00FF89]/5 dark:bg-[#00FF89]/10 rounded-lg p-6 border border-[#00FF89]/20 dark:border-[#00FF89]/30">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#00FF89]/10 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-[#00FF89]" />
                        </div>
                        <h3 className="text-lg font-medium text-[#121212] dark:text-[#00FF89]">Still Have Questions?</h3>
                    </div>

                    <p className="text-[#6b7280] dark:text-[#9ca3af] mb-6 leading-relaxed">
                        Can't find what you're looking for? {product?.sellerId?.fullName || 'Our team'} is here to help you succeed.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] rounded-lg font-medium transition-colors"
                            disabled={true}>
                            <Mail className="w-4 h-4" />
                            Contact {product?.sellerId?.fullName?.split(' ')[0] || 'Support'}
                        </button>

                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:bg-[#1f1f1f]/80 text-[#121212] dark:text-[#00FF89] rounded-lg font-medium transition-colors border border-gray-200 dark:border-gray-700">
                            <FileText className="w-4 h-4" />
                            Documentation
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Premium FAQs Indicator */}
            {product?.faqs && product.faqs.some((faq) => faq.isPremium) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFC050]/10 text-[#FFC050] rounded-lg border border-[#FFC050]/30">
                        <span className="text-sm font-medium">Additional premium FAQs available after purchase</span>
                    </div>
                </motion.div>
            )}
        </div>
    )

}
'use client'
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, MessageSquare, Mail, FileText } from 'lucide-react'

export default function ProductFAQ({ product }) {
    const [openItems, setOpenItems] = useState(new Set())

    const faqs =
        product?.faqs && product.faqs.length > 0
            ? product.faqs.filter((faq) => !faq.isPremium)
            : [
                  {
                      question: 'How do I get started?',
                      answer: "After purchase, you'll receive instant access to download files and detailed setup instructions."
                  },
                  {
                      question: 'Is support included?',
                      answer: 'Yes, we provide comprehensive support via email and documentation to help you succeed.'
                  },
                  {
                      question: 'What file formats are included?',
                      answer: "You'll receive all source files in their original formats plus documentation and guides."
                  },
                  {
                      question: 'Are updates free?',
                      answer: 'Yes, all future updates and improvements are included at no additional cost.'
                  }
              ]

    const toggleItem = useCallback((index) => {
        setOpenItems((prev) => {
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
        <div className="relative bg-black">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black" />
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
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-full">
                        <HelpCircle className="w-4 h-4 text-[#00FF89]" />
                        <span className="text-[#00FF89] font-medium text-sm">Frequently Asked Questions</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Get your questions answered</h2>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Find answers to common questions about {product?.title || 'this product'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-4xl mx-auto space-y-6">
                    {faqs.map((faq, index) => {
                        const isOpen = openItems.has(index)
                        return (
                            <motion.div
                                key={faq._id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className="relative overflow-hidden rounded-2xl bg-gray-900/50 border border-gray-700/50 hover:border-[#00FF89]/30 transition-all">
                                <button
                                    onClick={() => toggleItem(index)}
                                    className="w-full flex items-center justify-between p-6 sm:p-8 text-left group">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="flex-shrink-0 w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center group-hover:bg-[#00FF89]/20 transition-colors">
                                            <HelpCircle className="w-6 h-6 text-[#00FF89]" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white text-left leading-relaxed group-hover:text-[#00FF89] transition-colors">
                                            {faq.question}
                                        </h3>
                                    </div>
                                    <div className="flex-shrink-0 ml-6">
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center group-hover:bg-[#00FF89]/10 transition-colors">
                                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
                                        </motion.div>
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden">
                                            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                                                <div className="border-t border-gray-700/50 pt-6 ml-16">
                                                    <p className="text-lg text-gray-300 leading-relaxed">{faq.answer}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {product?.hasGuarantee && product?.guaranteeText && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="relative overflow-hidden rounded-2xl p-8 bg-[#00FF89]/5 border border-[#00FF89]/30">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-[#00FF89]/20 rounded-xl flex items-center justify-center">
                                <HelpCircle className="w-6 h-6 text-[#00FF89]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-3">Money-Back Guarantee</h3>
                                <p className="text-lg text-gray-300 leading-relaxed">{product.guaranteeText}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {product?.faqs && product.faqs.some((faq) => faq.isPremium) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/30">
                            <FileText className="w-5 h-5" />
                            <span className="font-medium text-lg">Additional premium FAQs available after purchase</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

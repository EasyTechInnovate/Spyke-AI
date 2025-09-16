'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Copy, CheckCircle, Clock, Percent, DollarSign } from 'lucide-react'
import { promocodeAPI } from '@/lib/api'

export default function ProductPromoDisplay({ productId, productCategory }) {
    const [promocodes, setPromocodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [copiedCode, setCopiedCode] = useState(null)

    useEffect(() => {
        if (productId) {
            fetchApplicablePromocodes()
        }
    }, [productId, productCategory])

    const fetchApplicablePromocodes = async () => {
        try {
            setLoading(true)
            const response = await promocodeAPI.getPublicPromocodes({
                status: 'active',
                limit: 10
            })
            
            if (response?.promocodes) {
                // Filter promocodes that apply to this product
                const applicablePromos = response.promocodes.filter((promo) => {
                    // Global promocodes apply to all products
                    if (promo.isGlobal) return true
                    
                    // Check if product is in applicable products list
                    if (promo.applicableProducts && promo.applicableProducts.length > 0) {
                        return promo.applicableProducts.includes(productId)
                    }
                    
                    // Check if product category is in applicable categories
                    if (promo.applicableCategories && promo.applicableCategories.length > 0) {
                        return promo.applicableCategories.includes(productCategory)
                    }
                    
                    // If no specific restrictions, it applies to all products
                    return (!promo.applicableProducts || promo.applicableProducts.length === 0) &&
                           (!promo.applicableCategories || promo.applicableCategories.length === 0)
                })
                
                setPromocodes(applicablePromos.slice(0, 3)) // Show max 3 promocodes
            }
        } catch (error) {
            console.error('Failed to fetch promocodes:', error)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const formatDiscount = (promocode) => {
        if (promocode.discountType === 'percentage') {
            return `${promocode.discountValue}% OFF`
        }
        return `$${promocode.discountValue} OFF`
    }

    const getDaysRemaining = (validUntil) => {
        if (!validUntil) return null
        const days = Math.ceil((new Date(validUntil) - new Date()) / (1000 * 60 * 60 * 24))
        return days > 0 ? days : 0
    }

    if (loading) {
        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-[#00FF89]" />
                    <h3 className="text-sm font-medium text-gray-300">Available Offers</h3>
                </div>
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-gray-800/50 rounded-lg p-3 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (promocodes.length === 0) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[#00FF89]" />
                <h3 className="text-sm font-medium text-gray-300">Available Offers</h3>
            </div>
            
            <div className="space-y-2">
                <AnimatePresence>
                    {promocodes.map((promocode, index) => {
                        const daysRemaining = getDaysRemaining(promocode.validUntil)
                        
                        return (
                            <motion.div
                                key={promocode._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-r from-[#00FF89]/10 to-[#FFC050]/10 border border-[#00FF89]/30 rounded-lg p-3 hover:border-[#00FF89]/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {promocode.discountType === 'percentage' ? (
                                                <Percent className="w-4 h-4 text-[#00FF89]" />
                                            ) : (
                                                <DollarSign className="w-4 h-4 text-[#00FF89]" />
                                            )}
                                            <span className="font-bold text-[#00FF89] text-sm">
                                                {formatDiscount(promocode)}
                                            </span>
                                            {daysRemaining !== null && daysRemaining <= 7 && (
                                                <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{daysRemaining}d left</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">Use code:</span>
                                            <code className="bg-black/30 px-2 py-1 rounded text-xs font-mono text-white">
                                                {promocode.code}
                                            </code>
                                        </div>
                                        
                                        {promocode.description && (
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                                {promocode.description}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <button
                                        onClick={() => copyToClipboard(promocode.code)}
                                        className={`p-2 rounded-lg transition-all ${
                                            copiedCode === promocode.code
                                                ? 'bg-[#00FF89] text-black'
                                                : 'bg-white/10 text-gray-300 hover:bg-[#00FF89]/20 hover:text-[#00FF89]'
                                        }`}
                                        title="Copy code"
                                    >
                                        {copiedCode === promocode.code ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
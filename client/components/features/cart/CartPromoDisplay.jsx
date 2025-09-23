'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Copy, CheckCircle, Clock, Percent, DollarSign, Sparkles, ChevronDown, ChevronUp, Zap, Gift } from 'lucide-react'
import { promocodeAPI } from '@/lib/api'
export default function CartPromoDisplay({ 
    cartItems, 
    onApplyPromo, 
    currentPromocode,
    promoLoading 
}) {
    const [promocodes, setPromocodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [copiedCode, setCopiedCode] = useState(null)
    const [applyingPromo, setApplyingPromo] = useState(null)
    const [showAll, setShowAll] = useState(false)
    const [bestDeal, setBestDeal] = useState(null)
    const MAX_INITIAL_DISPLAY = 3
    useEffect(() => {
        if (cartItems?.length > 0) {
            fetchSmartPromocodes()
        } else {
            setPromocodes([])
            setBestDeal(null)
            setLoading(false)
        }
    }, [cartItems])
    const fetchSmartPromocodes = async () => {
        try {
            setLoading(true)
            const cartProductIds = cartItems.map(item => item.productId?._id || item.productId || item.id).filter(Boolean)
            if (cartProductIds.length === 0) {
                setPromocodes([])
                setBestDeal(null)
                return
            }
            const response = await fetch(`/api/v1/promocode/applicable?productIds=${cartProductIds.join(',')}`)
            const data = await response.json()
            if (data.success && data.data.applicablePromocodes) {
                const allApplicable = [
                    ...data.data.applicablePromocodes.global,
                    ...data.data.applicablePromocodes.productSpecific,
                    ...data.data.applicablePromocodes.categorySpecific,
                    ...data.data.applicablePromocodes.industrySpecific
                ]
                const sortedPromos = allApplicable.sort((a, b) => {
                    const aValue = calculatePotentialSavings(a)
                    const bValue = calculatePotentialSavings(b)
                    return bValue - aValue
                })
                setPromocodes(sortedPromos)
                setBestDeal(sortedPromos[0] || null)
            }
        } catch (error) {
            console.error('Failed to fetch smart promocodes:', error)
            setPromocodes([])
            setBestDeal(null)
        } finally {
            setLoading(false)
        }
    }
    const calculatePotentialSavings = (promocode) => {
        const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0)
        if (cartTotal < (promocode.minimumOrderAmount || 0)) return 0
        if (promocode.discountType === 'percentage') {
            let discount = (cartTotal * promocode.discountValue) / 100
            if (promocode.maxDiscountAmount) {
                discount = Math.min(discount, promocode.maxDiscountAmount)
            }
            return discount
        }
        return Math.min(promocode.discountValue, cartTotal)
    }
    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }
    const handleApplyPromo = async (promocode) => {
        if (applyingPromo || currentPromocode) return
        setApplyingPromo(promocode.code)
        try {
            await onApplyPromo(promocode.code)
        } catch (error) {
            console.error('Failed to apply promo:', error)
        } finally {
            setApplyingPromo(null)
        }
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
    const promosToShow = showAll ? promocodes : promocodes.slice(0, MAX_INITIAL_DISPLAY)
    const hasMorePromos = promocodes.length > MAX_INITIAL_DISPLAY
    if (loading) {
        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#00FF89]" />
                    <h3 className="text-sm font-medium text-gray-300">Finding Best Deals</h3>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
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
        return (
            <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">No special offers available for your cart items</span>
                </div>
            </div>
        )
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            {bestDeal && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 p-4 bg-gradient-to-r from-[#00FF89]/20 to-[#FFC050]/20 border border-[#00FF89]/50 rounded-xl"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-[#00FF89]" />
                        <span className="font-bold text-[#00FF89]">Best Deal Available</span>
                        <Gift className="w-4 h-4 text-[#FFC050]" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white text-lg">
                                    Save ${calculatePotentialSavings(bestDeal).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-300">with {bestDeal.code}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-1">{bestDeal.description}</p>
                        </div>
                        <button
                            onClick={() => handleApplyPromo(bestDeal)}
                            disabled={applyingPromo || currentPromocode}
                            className="px-4 py-2 bg-[#00FF89] text-black rounded-lg font-bold hover:bg-[#00FF89]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {applyingPromo === bestDeal.code ? 'Applying...' : 'Apply Now'}
                        </button>
                    </div>
                </motion.div>
            )}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00FF89]" />
                    <h3 className="text-sm font-medium text-gray-300">Smart Offers for Your Cart</h3>
                    <span className="text-xs text-gray-500">({promocodes.length} found)</span>
                </div>
                {hasMorePromos && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-1 text-xs text-[#00FF89] hover:text-[#00DD78] transition-colors"
                    >
                        {showAll ? (
                            <>
                                Show less
                                <ChevronUp className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                View all {promocodes.length}
                                <ChevronDown className="w-3 h-3" />
                            </>
                        )}
                    </button>
                )}
            </div>
            <div className="space-y-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={showAll ? 'expanded' : 'collapsed'}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="space-y-2 overflow-hidden"
                        style={{ maxHeight: showAll ? '400px' : 'auto' }}
                    >
                        <div className={showAll ? 'overflow-y-auto space-y-2 max-h-80' : 'space-y-2'}>
                            {promosToShow.map((promocode, index) => {
                                const daysRemaining = getDaysRemaining(promocode.validUntil)
                                const isCurrentlyApplied = currentPromocode?.code === promocode.code
                                const isApplying = applyingPromo === promocode.code
                                const potentialSavings = calculatePotentialSavings(promocode)
                                const isBestDeal = bestDeal && promocode.code === bestDeal.code
                                return (
                                    <motion.div
                                        key={promocode._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: showAll ? 0 : index * 0.1 }}
                                        className={`border rounded-lg p-3 transition-all ${
                                            isCurrentlyApplied 
                                                ? 'border-[#00FF89] bg-[#00FF89]/20' 
                                                : isBestDeal
                                                ? 'border-[#FFC050]/50 bg-gradient-to-r from-[#00FF89]/5 to-[#FFC050]/5'
                                                : 'border-[#00FF89]/30 hover:border-[#00FF89]/50 bg-gray-800/30'
                                        }`}
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
                                                    {potentialSavings > 0 && (
                                                        <span className="text-xs bg-[#FFC050]/20 text-[#FFC050] px-2 py-0.5 rounded-full">
                                                            Save ${potentialSavings.toFixed(2)}
                                                        </span>
                                                    )}
                                                    {daysRemaining !== null && daysRemaining <= 7 && (
                                                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{daysRemaining}d left</span>
                                                        </div>
                                                    )}
                                                    {isCurrentlyApplied && (
                                                        <span className="text-xs bg-[#00FF89] text-black px-2 py-0.5 rounded-full font-medium">
                                                            Applied
                                                        </span>
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
                                            <div className="flex items-center gap-2">
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
                                                {!isCurrentlyApplied && (
                                                    <button
                                                        onClick={() => handleApplyPromo(promocode)}
                                                        disabled={isApplying || currentPromocode}
                                                        className="px-3 py-2 bg-[#00FF89] text-black rounded-lg text-xs font-medium hover:bg-[#00FF89]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[60px]"
                                                    >
                                                        {isApplying ? 'Applying...' : 'Apply'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            {!showAll && hasMorePromos && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-2 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                    <p className="text-xs text-gray-400 text-center">
                        Showing top {MAX_INITIAL_DISPLAY} offers • {promocodes.length - MAX_INITIAL_DISPLAY} more available
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}
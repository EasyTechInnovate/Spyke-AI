'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Copy, CheckCircle, Clock, Percent, DollarSign, Sparkles, ChevronDown, ChevronUp, Zap, Gift, ExternalLink } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { promocodeAPI } from '@/lib/api'
export default function ProductPromoDisplay({ product }) {
    const [promocodes, setPromocodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [copiedCode, setCopiedCode] = useState(null)
    const [showAll, setShowAll] = useState(false)
    const [bestDeal, setBestDeal] = useState(null)
    const { addToCart } = useCart()
    const MAX_INITIAL_DISPLAY = 2
    useEffect(() => {
        if (product?._id) {
            fetchProductPromocodes()
        }
    }, [product])
    const fetchProductPromocodes = async () => {
        try {
            setLoading(true)
            const response = await promocodeAPI.getApplicablePromocodes(product._id)
            console.log('📊 Promocode API response:', response)
            if (response) {
                const allApplicable = [
                    ...(response.data.applicablePromocodes.global || []),
                    ...(response.data.applicablePromocodes.productSpecific || []),
                    ...(response.data.applicablePromocodes.categorySpecific || []),
                    ...(response.data.applicablePromocodes.industrySpecific || [])
                ]
                const validPromocodes = allApplicable.filter(promo => {
                    const productPrice = product?.price || 0
                    const minimumRequired = promo.minimumOrderAmount || 0
                    const isValid = productPrice >= minimumRequired
                    console.log(`✅ Promo ${promo.code}: price=${productPrice}, minimum=${minimumRequired}, valid=${isValid}`)
                    return isValid
                })
                const sortedPromos = validPromocodes.sort((a, b) => {
                    const aValue = calculatePotentialSavings(a)
                    const bValue = calculatePotentialSavings(b)
                    return bValue - aValue
                })
                setPromocodes(sortedPromos)
                setBestDeal(sortedPromos[0] || null)
            } else {
                setPromocodes([])
                setBestDeal(null)
            }
        } catch (error) {
            setPromocodes([])
            setBestDeal(null)
        } finally {
            setLoading(false)
        }
    }
    const calculatePotentialSavings = (promocode) => {
        const productPrice = product?.price || 0
        if (productPrice < (promocode.minimumOrderAmount || 0)) return 0
        if (promocode.discountType === 'percentage') {
            let discount = (productPrice * promocode.discountValue) / 100
            if (promocode.maxDiscountAmount) {
                discount = Math.min(discount, promocode.maxDiscountAmount)
            }
            return discount
        }
        return Math.min(promocode.discountValue, productPrice)
    }
    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }
    const handleAddToCartWithPromo = async (promocode) => {
        try {
            await addToCart(product, 1, promocode.code)
        } catch (error) {
            console.error('Failed to add to cart with promo:', error)
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
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-[#00FF89]" />
                    <h3 className="text-lg font-medium text-white">Loading Offers...</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    if (promocodes.length === 0) {
        return (
            <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-[#00FF89]" />
                    <h3 className="text-lg font-medium text-white">Special Offers</h3>
                </div>
                <div className="text-center py-6">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                            <Tag className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">No special offers available for this product right now</p>
                            <p className="text-gray-500 text-xs mt-1">Check back later for new deals!</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6"
        >
            {bestDeal && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-gradient-to-r from-[#00FF89]/20 to-[#FFC050]/20 border border-[#00FF89]/50 rounded-xl"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-[#00FF89]" />
                        <span className="font-bold text-[#00FF89]">Best Deal for This Product</span>
                        <Gift className="w-4 h-4 text-[#FFC050]" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-white text-xl">
                                Save ${calculatePotentialSavings(bestDeal).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-300">with {bestDeal.code}</span>
                        </div>
                        <p className="text-sm text-gray-400">{bestDeal.description}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => copyToClipboard(bestDeal.code)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                    copiedCode === bestDeal.code
                                        ? 'bg-[#00FF89] text-black'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {copiedCode === bestDeal.code ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy {bestDeal.code}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleAddToCartWithPromo(bestDeal)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#00FF89] text-black rounded-lg font-medium hover:bg-[#00FF89]/90 transition-all"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Add to Cart with Deal
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#00FF89]" />
                    <h3 className="text-lg font-medium text-white">Available Offers</h3>
                    <span className="text-sm text-gray-500">({promocodes.length})</span>
                </div>
                {hasMorePromos && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-1 text-sm text-[#00FF89] hover:text-[#00DD78] transition-colors"
                    >
                        {showAll ? (
                            <>
                                Show less
                                <ChevronUp className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                View all
                                <ChevronDown className="w-4 h-4" />
                            </>
                        )}
                    </button>
                )}
            </div>
            <div className="space-y-3">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={showAll ? 'expanded' : 'collapsed'}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="space-y-3 overflow-hidden"
                    >
                        {promosToShow.map((promocode, index) => {
                            const daysRemaining = getDaysRemaining(promocode.validUntil)
                            const potentialSavings = calculatePotentialSavings(promocode)
                            const isBestDeal = bestDeal && promocode.code === bestDeal.code
                            return (
                                <motion.div
                                    key={promocode._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: showAll ? 0 : index * 0.1 }}
                                    className={`border rounded-xl p-4 transition-all ${
                                        isBestDeal
                                            ? 'border-[#FFC050]/50 bg-gradient-to-r from-[#00FF89]/5 to-[#FFC050]/5'
                                            : 'border-gray-700 bg-gray-800/50 hover:border-[#00FF89]/50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {promocode.discountType === 'percentage' ? (
                                                    <Percent className="w-4 h-4 text-[#00FF89]" />
                                                ) : (
                                                    <DollarSign className="w-4 h-4 text-[#00FF89]" />
                                                )}
                                                <span className="font-bold text-[#00FF89]">
                                                    {formatDiscount(promocode)}
                                                </span>
                                                {potentialSavings > 0 && (
                                                    <span className="text-xs bg-[#FFC050]/20 text-[#FFC050] px-2 py-1 rounded-full">
                                                        Save ${potentialSavings.toFixed(2)}
                                                    </span>
                                                )}
                                                {daysRemaining !== null && daysRemaining <= 7 && (
                                                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{daysRemaining}d left</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm text-gray-400">Code:</span>
                                                <code className="bg-black/50 px-2 py-1 rounded text-sm font-mono text-white">
                                                    {promocode.code}
                                                </code>
                                            </div>
                                            {promocode.description && (
                                                <p className="text-sm text-gray-400 mb-3">
                                                    {promocode.description}
                                                </p>
                                            )}
                                            {promocode.minimumOrderAmount && (
                                                <p className="text-xs text-gray-500">
                                                    Minimum order: ${promocode.minimumOrderAmount}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4">
                                            <button
                                                onClick={() => copyToClipboard(promocode.code)}
                                                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                                    copiedCode === promocode.code
                                                        ? 'bg-[#00FF89] text-black'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                            >
                                                {copiedCode === promocode.code ? 'Copied!' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={() => handleAddToCartWithPromo(promocode)}
                                                className="px-3 py-2 bg-[#00FF89] text-black rounded-lg text-sm font-medium hover:bg-[#00FF89]/90 transition-all"
                                            >
                                                Use Deal
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
            {!showAll && hasMorePromos && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                >
                    <p className="text-sm text-gray-400 text-center">
                        {promocodes.length - MAX_INITIAL_DISPLAY} more offer{promocodes.length - MAX_INITIAL_DISPLAY !== 1 ? 's' : ''} available
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}
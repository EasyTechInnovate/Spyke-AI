'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Copy, CheckCircle, Clock, Percent, DollarSign, ChevronDown, ChevronUp, Zap, Gift, ExternalLink, Star } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { promocodeAPI } from '@/lib/api'

export default function ProductPromoDisplay({ product }) {
    const [promocodes, setPromocodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [copiedCode, setCopiedCode] = useState(null)
    const [showAllOffers, setShowAllOffers] = useState(false)
    const [bestDeal, setBestDeal] = useState(null)
    const { addToCart } = useCart()
    
    // Show only top 3 offers initially, with option to see more
    const TOP_OFFERS_COUNT = 3

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
                    ...(response.applicablePromocodes.global || []),
                    ...(response.applicablePromocodes.productSpecific || []),
                    ...(response.applicablePromocodes.categorySpecific || []),
                    ...(response.applicablePromocodes.industrySpecific || [])
                ]
                
                // Filter valid promocodes based on product price and minimum order
                const validPromocodes = allApplicable.filter(promo => {
                    const productPrice = product?.price || 0
                    const minimumRequired = promo.minimumOrderAmount || 0
                    return productPrice >= minimumRequired
                })
                
                // Sort by potential savings (highest first)
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

    // Get offers to display (best deal + top others, excluding the best deal from the list)
    const otherOffers = promocodes.slice(1) // Exclude the best deal
    const offersToShow = showAllOffers ? otherOffers : otherOffers.slice(0, TOP_OFFERS_COUNT - 1)
    const hasMoreOffers = otherOffers.length > TOP_OFFERS_COUNT - 1

    if (loading) {
        return (
            <div className="bg-black border border-gray-800 rounded-lg p-4">
                <h3 className="text-[#00FF89] font-medium mb-3">Loading Offers...</h3>
                <div className="space-y-2">
                    <div className="bg-gray-900 rounded p-3 animate-pulse">
                        <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (promocodes.length === 0) {
        return null // Don't show anything if no promocodes
    }

    return (
        <div className="bg-black border border-gray-800 rounded-lg p-4">
            <h3 className="text-[#00FF89] font-medium mb-4">Available Offers</h3>
            
            {/* Only show the best deal */}
            {bestDeal && (
                <div className="bg-black border border-[#00FF89] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-[#00FF89] text-black px-2 py-1 rounded text-xs font-bold">
                            BEST DEAL
                        </div>
                        <span className="text-[#00FF89] font-bold">
                            Save ${calculatePotentialSavings(bestDeal).toFixed(2)}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                        <code className="bg-gray-900 text-[#00FF89] px-3 py-1 rounded font-mono text-sm">
                            {bestDeal.code}
                        </code>
                        <span className="text-[#00FF89] text-sm">
                            {formatDiscount(bestDeal)}
                        </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{bestDeal.description}</p>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => copyToClipboard(bestDeal.code)}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                copiedCode === bestDeal.code
                                    ? 'bg-[#00FF89] text-black'
                                    : 'bg-gray-800 text-[#00FF89] hover:bg-gray-700'
                            }`}
                        >
                            {copiedCode === bestDeal.code ? 'Copied!' : 'Copy Code'}
                        </button>
                        <button
                            onClick={() => handleAddToCartWithPromo(bestDeal)}
                            className="px-4 py-2 bg-[#00FF89] text-black rounded text-sm font-medium hover:bg-green-400 transition-colors"
                        >
                            Apply Deal
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
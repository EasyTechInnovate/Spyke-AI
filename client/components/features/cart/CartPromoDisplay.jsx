'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Copy, CheckCircle, Clock, Percent, DollarSign, Sparkles, Zap, Gift, X, Shield } from 'lucide-react'
import { promocodeAPI } from '@/lib/api'

export default function CartPromoDisplay({ cartItems, onApplyPromo, currentPromocode }) {
    // Data
    const [promocodes, setPromocodes] = useState([])
    const [bestDeal, setBestDeal] = useState(null)
    // UI state
    const [loading, setLoading] = useState(true)
    const [applyingPromo, setApplyingPromo] = useState(null)
    const [copiedCode, setCopiedCode] = useState(null)
    const [showModal, setShowModal] = useState(false)

    // Fetch smart promos when cart changes
    useEffect(() => {
        if (cartItems?.length) fetchSmartPromocodes()
        else {
            setPromocodes([])
            setBestDeal(null)
            setLoading(false)
        }
    }, [cartItems])

    async function fetchSmartPromocodes() {
        try {
            setLoading(true)
            const ids = cartItems.map((i) => i.productId?._id || i.productId || i.id).filter(Boolean)
            if (!ids.length) {
                setPromocodes([])
                setBestDeal(null)
                return
            }
            const res = await promocodeAPI.getApplicablePromocodes(ids.join(','))
            if (res) {
                const all = [
                    ...(res.applicablePromocodes.global || []),
                    ...(res.applicablePromocodes.productSpecific || []),
                    ...(res.applicablePromocodes.categorySpecific || []),
                    ...(res.applicablePromocodes.industrySpecific || [])
                ]
                const sorted = all.sort((a, b) => calculatePotentialSavings(b) - calculatePotentialSavings(a))
                setPromocodes(sorted)
                setBestDeal(sorted[0] || null)
            } else {
                setPromocodes([])
                setBestDeal(null)
            }
        } catch (e) {
            console.error('Failed to fetch smart promocodes:', e)
            setPromocodes([])
            setBestDeal(null)
        } finally {
            setLoading(false)
        }
    }

    // Helpers
    function calculatePotentialSavings(promocode) {
        const cartTotal = cartItems.reduce((s, i) => s + (i.price || 0), 0)
        if (cartTotal < (promocode.minimumOrderAmount || 0)) return 0
        if (promocode.discountType === 'percentage') {
            let discount = (cartTotal * promocode.discountValue) / 100
            if (promocode.maxDiscountAmount) discount = Math.min(discount, promocode.maxDiscountAmount)
            return discount
        }
        return Math.min(promocode.discountValue, cartTotal)
    }
    function formatDiscount(p) {
        return p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `$${p.discountValue} OFF`
    }
    function getDaysRemaining(validUntil) {
        if (!validUntil) return null
        const days = Math.ceil((new Date(validUntil) - new Date()) / (1000 * 60 * 60 * 24))
        return days > 0 ? days : 0
    }
    function copyToClipboard(code) {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 1800)
    }
    async function handleApply(promocode) {
        if (applyingPromo || currentPromocode) return
        setApplyingPromo(promocode.code)
        try {
            await onApplyPromo(promocode.code)
        } catch (e) {
            console.error(e)
        } finally {
            setApplyingPromo(null)
        }
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#00FF89]" />
                    <h3 className="text-sm font-medium text-gray-300">Finding Best Deals</h3>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-gray-800/50 rounded-lg p-3 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-700 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Empty state
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

    // Main summary view
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4">
                {bestDeal && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 relative overflow-hidden rounded-xl border border-[#00FF89]/50 bg-gradient-to-br from-gray-800/60 via-gray-800/30 to-gray-900/40 backdrop-blur-sm">
                        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_70%)]" />
                        <div className="p-4 flex flex-col gap-3 relative">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-[#00FF89]/15 border border-[#00FF89]/30">
                                    <Zap className="w-4 h-4 text-[#00FF89]" />
                                </div>
                                <span className="text-sm font-semibold text-[#00FF89] tracking-wide">Best Deal Found</span>
                                {bestDeal.validUntil && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900/70 border border-gray-700 text-gray-300">
                                        {getDaysRemaining(bestDeal.validUntil)}d left
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex-1 min-w-[180px]">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <span className="text-lg font-bold text-white">Save ${calculatePotentialSavings(bestDeal).toFixed(2)}</span>
                                        <code className="text-xs font-mono bg-[#00FF89]/10 text-[#00FF89] px-2 py-1 rounded-md border border-[#00FF89]/30">
                                            {bestDeal.code}
                                        </code>
                                        <span className="text-xs text-gray-400">{formatDiscount(bestDeal)}</span>
                                    </div>
                                    {bestDeal.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{bestDeal.description}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => copyToClipboard(bestDeal.code)}
                                        aria-label="Copy best deal code"
                                        className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors border border-[#00FF89]/40 ${copiedCode === bestDeal.code ? 'bg-[#00FF89] text-black' : 'bg-gray-900/60 text-[#00FF89] hover:bg-[#00FF89]/20'}`}>
                                        {copiedCode === bestDeal.code ? 'Copied' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={() => handleApply(bestDeal)}
                                        disabled={applyingPromo || currentPromocode}
                                        className="px-4 py-2 bg-[#00FF89] text-black rounded-lg text-xs font-bold hover:bg-[#00FF89]/90 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {applyingPromo === bestDeal.code ? 'Applying...' : currentPromocode ? 'Applied' : 'Apply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {promocodes.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {promocodes.slice(1, 4).map((p) => (
                            <div
                                key={p._id}
                                className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-700/60 bg-gray-800/40 hover:border-[#00FF89]/50 transition-all">
                                {p.discountType === 'percentage' ? (
                                    <Percent className="w-3 h-3 text-[#00FF89]" />
                                ) : (
                                    <DollarSign className="w-3 h-3 text-[#00FF89]" />
                                )}
                                <span className="text-[11px] text-gray-300 font-medium">{formatDiscount(p)}</span>
                                {calculatePotentialSavings(p) > 0 && (
                                    <span className="text-[10px] text-[#00FF89] font-semibold">${calculatePotentialSavings(p).toFixed(0)}</span>
                                )}
                            </div>
                        ))}
                        {promocodes.length > 4 && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-[11px] px-2 py-1 rounded-full bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/30 hover:bg-[#00FF89]/20 transition">
                                + {promocodes.length - 4} more
                            </button>
                        )}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg text-gray-400">
                        <Sparkles className="w-4 h-4 text-[#00FF89]" />
                        <span>
                            {promocodes.length} offer{promocodes.length > 1 ? 's' : ''} found
                        </span>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        aria-haspopup="dialog"
                        aria-expanded={showModal}
                        className="text-md font-semibold text-[#00FF89] hover:text-[#00DD78] transition-colors">
                        See all
                    </button>
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 z-[90] flex items-start md:items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="All available promocodes">
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ y: 30, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                            className="relative w-full max-w-2xl bg-[#0d0d0e] border border-gray-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                            {/* Redesigned Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800/70 bg-[linear-gradient(120deg,#0d1012,#12151a_55%,#0d1012)]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-[#00FF89]/15 border border-[#00FF89]/30">
                                        <Zap className="w-4 h-4 text-[#00FF89]" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-white tracking-wide">All Offers</h2>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-wider">{promocodes.length} Available</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    aria-label="Close promocode modal"
                                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="overflow-y-auto p-6 space-y-6 pb-8">
                                {bestDeal && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded-md bg-[#00FF89] text-black text-[11px] font-bold tracking-wide shadow">
                                                BEST
                                            </span>
                                            <span className="text-xs text-gray-300">Top savings suggestion</span>
                                        </div>
                                        {renderPromoRow(bestDeal, true, true)}
                                    </div>
                                )}
                                <div className="grid gap-4">
                                    {promocodes
                                        .filter((p) => !bestDeal || p.code !== bestDeal.code)
                                        .map((p) => (
                                            <div key={p._id}>{renderPromoRow(p, false)}</div>
                                        ))}
                                    {promocodes.filter((p) => !bestDeal || p.code !== bestDeal.code).length === 0 && (
                                        <div className="text-center text-sm text-gray-500 py-12">No additional offers.</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )

    // Row renderer (added minimal flag to avoid nested borders on BEST)
    function renderPromoRow(promo, highlight, minimal = false) {
        const days = getDaysRemaining(promo.validUntil)
        const applied = currentPromocode?.code === promo.code
        const savings = calculatePotentialSavings(promo)
        const applying = applyingPromo === promo.code
        const baseClasses = minimal
            ? applied
                ? 'border-[#00FF89] bg-[#00FF89]/15'
                : highlight
                  ? 'border-[#00FF89]/60 bg-gray-900/50'
                  : 'border-gray-700 hover:border-[#00FF89]/40 bg-gray-900/40'
            : applied
              ? 'border-[#00FF89] bg-[#00FF89]/15'
              : highlight
                ? 'border-[#00FF89]/60 bg-gray-900/60'
                : 'border-gray-700 hover:border-[#00FF89]/40 bg-gray-900/40'
        return (
            <div className={`group relative rounded-lg border p-4 transition-colors overflow-hidden ${baseClasses}`}>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                            className={`mt-0.5 p-2 rounded-lg border ${promo.discountType === 'percentage' ? 'border-[#00FF89]/40 bg-[#00FF89]/10' : 'border-orange-400/40 bg-orange-400/10'}`}>
                            {promo.discountType === 'percentage' ? (
                                <Percent className="w-4 h-4 text-[#00FF89]" />
                            ) : (
                                <DollarSign className="w-4 h-4 text-orange-400" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <code
                                    className={`text-xs font-mono tracking-wide px-2 py-1 rounded border ${applied ? 'bg-[#00FF89] text-black border-[#00FF89]' : 'bg-black/40 text-[#00FF89] border-[#00FF89]/40'}`}>
                                    {promo.code}
                                </code>
                                <span className="text-xs text-gray-400">{formatDiscount(promo)}</span>
                                {savings > 0 && <span className="text-[11px] font-semibold text-[#00FF89]">Save ${savings.toFixed(2)}</span>}
                                {promo.minimumOrderAmount && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                        Min ${promo.minimumOrderAmount}
                                    </span>
                                )}
                                {promo.maxDiscountAmount && promo.discountType === 'percentage' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                        Cap ${promo.maxDiscountAmount}
                                    </span>
                                )}
                                {days !== null && (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded border ${days <= 2 ? 'bg-red-500/10 text-red-400 border-red-500/30' : days <= 7 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                        {days}d left
                                    </span>
                                )}
                                {applied && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00FF89] text-black font-semibold">Applied</span>}
                            </div>
                            {promo.description && <p className="text-[11px] text-gray-400 line-clamp-2 md:line-clamp-1">{promo.description}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => copyToClipboard(promo.code)}
                            aria-label={`Copy code ${promo.code}`}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${copiedCode === promo.code ? 'bg-[#00FF89] text-black border-[#00FF89]' : 'bg-gray-900/60 text-gray-300 border-gray-700 hover:border-[#00FF89]/40 hover:text-[#00FF89]'}`}>
                            {copiedCode === promo.code ? 'Copied' : 'Copy'}
                        </button>
                        {!applied && (
                            <button
                                onClick={() => handleApply(promo)}
                                disabled={applying || currentPromocode}
                                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#00FF89] text-black hover:bg-[#00FF89]/90 disabled:opacity-50 disabled:cursor-not-allowed">
                                {applying ? 'Applying...' : 'Apply'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}


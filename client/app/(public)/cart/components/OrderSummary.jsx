'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, CreditCard, CheckCircle, ChevronDown, ChevronUp, Info, Copy } from 'lucide-react'
import AuthButton from '@/components/shared/ui/AuthButton'
import { formatCurrency, formatPromoDisplay } from '../utils'
import { CHECKOUT_FEATURES } from '../constants'
import { toast } from 'sonner'

export default function OrderSummary({
    subtotal,
    totalSavings,
    discount,
    total,
    promoCode,
    setPromoCode,
    promocodeData,
    promoLoading,
    promoError,
    handleApplyPromo,
    handleRemovePromo,
    handleCheckout
}) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div className="lg:col-span-1">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0f0f10] border border-gray-800 rounded-2xl p-6 lg:sticky lg:top-8"
                role="region"
                aria-label="Order summary"
            >
                {/* New Header: prominent title, total, and inline promo */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white">Order Summary</h2>
                        <p className="text-sm text-gray-400 mt-1">Review your items and proceed to checkout</p>
                    </div>

                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-sm text-gray-400">Total</span>
                        <span className="text-2xl font-extrabold text-[#00FF89]">{formatCurrency(total)}</span>
                        {promocodeData && (
                            <span className="text-xs text-gray-400 mt-1">Promo: {promocodeData.code}</span>
                        )}
                    </div>
                </div>

                {/* Inline promo on larger screens, collapses on mobile */}
                <div className="mb-4">
                    <div className="flex gap-2">
                        <input
                            aria-label="Promo code"
                            type="text"
                            value={promoCode}
                            onChange={(e) => setIsExpanded(true) || setPromoCode(e.target.value)}
                            placeholder="Have a promo code?"
                            disabled={!!promocodeData}
                            className="flex-1 px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent disabled:opacity-50"
                        />
                        <button
                            onClick={handleApplyPromo}
                            disabled={!promoCode || !!promocodeData || promoLoading}
                            className="px-4 py-2 bg-[#00FF89] text-black rounded-lg font-semibold hover:bg-[#00FF89]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-disabled={!promoCode || !!promocodeData || promoLoading}
                        >
                            {promoLoading ? 'Applying...' : promocodeData ? 'Applied' : 'Apply'}
                        </button>
                    </div>
                    {promoError && <p className="text-xs text-red-400 mt-2">{promoError}</p>}
                </div>

                {/* Content: price breakdown */}
                {isExpanded && (
                    <>
                        <PriceBreakdown
                            subtotal={subtotal}
                            totalSavings={totalSavings}
                            promocodeData={promocodeData}
                            discount={discount}
                            total={total}
                            onRemovePromo={handleRemovePromo}
                        />

                        {/* Checkout CTA */}
                        <div className="mt-4">
                            <button
                                onClick={handleCheckout}
                                className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 bg-[#00FF89] text-black font-bold rounded-xl hover:bg-[#00FF89]/95 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/40"
                                aria-label="Proceed to checkout"
                            >
                                <CreditCard className="w-5 h-5" />
                                Proceed to Checkout
                            </button>
                        </div>

                        {/* Mobile compact total (visible on small screens) */}
                        <div className="lg:hidden mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-400">Total</div>
                            <div className="text-lg font-extrabold text-[#00FF89]">{formatCurrency(total)}</div>
                        </div>

                        {/* Security & Features */}
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <SecurityBadge />
                            <CheckoutFeatures />
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    )
}

// Sub-components
function OrderSummaryHeader({ isExpanded, setIsExpanded, total, promocodeData }) {
    return (
        <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between lg:cursor-default mb-6"
        >
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <div className="flex items-center gap-2">
                {!isExpanded && (
                    <div className="lg:hidden flex items-center gap-3">
                        {promocodeData && (
                            <PromoCodeBadge promocodeData={promocodeData} />
                        )}
                        <span className="text-[#00FF89] font-semibold">
                            {formatCurrency(total)}
                        </span>
                    </div>
                )}
                <div className="lg:hidden">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>
        </button>
    )
}

function PriceBreakdown({ subtotal, totalSavings, promocodeData, discount, total, onRemovePromo }) {
    return (
        <div className="space-y-3 mb-6">
            {/* Subtotal */}
            <PriceRow label="Subtotal" amount={subtotal} />
            
            {/* Savings */}
            {totalSavings > 0 && (
                <PriceRow 
                    label="Total Savings" 
                    amount={-totalSavings} 
                    highlight="success" 
                />
            )}

            {/* Promo Discount */}
            {promocodeData && discount > 0 && (
                <PromoDiscountRow
                    promocodeData={promocodeData}
                    discount={discount}
                    onRemove={onRemovePromo}
                />
            )}

            {/* Total */}
            <div className="border-t border-gray-700 pt-3">
                <PriceRow 
                    label="Total" 
                    amount={total} 
                    size="large" 
                    highlight="primary" 
                />
            </div>
        </div>
    )
}

function PriceRow({ label, amount, size = 'normal', highlight = null }) {
    const sizeClasses = size === 'large' ? 'text-lg font-semibold' : ''
    const colorClasses = {
        primary: 'text-[#00FF89]',
        success: 'text-[#00FF89]',
        null: 'text-gray-300'
    }[highlight]

    return (
        <div className={`flex justify-between ${sizeClasses} ${colorClasses}`}>
            <span>{label}</span>
            <span>{formatCurrency(Math.abs(amount))}</span>
        </div>
    )
}

function PromoDiscountRow({ promocodeData, discount, onRemove }) {
    const [copied, setCopied] = useState(false)
    
    const handleCopy = () => {
        navigator.clipboard.writeText(promocodeData.code)
        setCopied(true)
        toast.success('Promo code copied!')
        setTimeout(() => setCopied(false), 2000)
    }
    
    return (
        <div className="p-3 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-lg">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#00FF89]">Promo Applied:</span>
                        <div className="flex items-center gap-1 bg-[#121212] px-2 py-1 rounded">
                            <span className="font-bold text-[#00FF89]">{promocodeData.code}</span>
                            <button
                                onClick={handleCopy}
                                className="ml-1 p-1 hover:bg-[#00FF89]/20 rounded transition-colors"
                                title="Copy code"
                            >
                                {copied ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-[#00FF89]" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-[#00FF89]" />
                                )}
                            </button>
                        </div>
                        <span className="text-sm text-[#00FF89]">
                            ({formatPromoDisplay(promocodeData)})
                        </span>
                    </div>
                    <button
                        onClick={onRemove}
                        className="text-xs text-gray-400 hover:text-red-400 mt-1 transition-colors"
                    >
                        Remove promo code
                    </button>
                </div>
                <span className="font-semibold text-[#00FF89]">{formatCurrency(-discount)}</span>
            </div>
        </div>
    )
}

function PromoCodeSection({ 
    promoCode, 
    setPromoCode, 
    promocodeData, 
    promoLoading, 
    promoError, 
    onApply, 
    onRemove 
}) {
    return (
        <div className="mb-6">
            <PromoCodeHeader />
            <PromoCodeInput
                value={promoCode}
                onChange={setPromoCode}
                disabled={!!promocodeData}
                onApply={onApply}
                isLoading={promoLoading}
                hasPromo={!!promocodeData}
            />
            {promocodeData && (
                <PromoCodeSuccess
                    promocodeData={promocodeData}
                    onRemove={onRemove}
                />
            )}
            {promoError && (
                <p className="text-xs text-red-400 mt-1">{promoError}</p>
            )}
        </div>
    )
}

function PromoCodeHeader() {
    return (
        <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-400">
                Promo Code
            </label>
            <div className="group relative">
                <Info className="w-4 h-4 text-gray-500 hover:text-gray-400" />
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-[#1f1f1f] text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Enter a valid promo code to get discount on your order
                </div>
            </div>
        </div>
    )
}

function PromoCodeInput({ value, onChange, disabled, onApply, isLoading, hasPromo }) {
    return (
        <div className="flex gap-2">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter code"
                disabled={disabled}
                className="flex-1 px-4 py-2 bg-[#1f1f1f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent disabled:opacity-50"
            />
            <button
                onClick={onApply}
                disabled={!value || disabled || isLoading}
                className="px-4 py-2 bg-[#1f1f1f] border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 hover:border-[#00FF89]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isLoading && (
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
                {hasPromo ? 'Applied' : 'Apply'}
            </button>
        </div>
    )
}

function PromoCodeSuccess({ promocodeData, onRemove }) {
    const [copied, setCopied] = useState(false)
    
    const handleCopy = () => {
        navigator.clipboard.writeText(promocodeData.code)
        setCopied(true)
        toast.success('Promo code copied!')
        setTimeout(() => setCopied(false), 2000)
    }
    
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-lg"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <CheckCircle className="w-5 h-5 text-[#00FF89] flex-shrink-0" />
                    <div className="flex-1">
                        <span className="text-sm text-[#00FF89] font-semibold">
                            Code Applied Successfully!
                        </span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <div className="flex items-center gap-1 bg-[#121212] px-2 py-0.5 rounded">
                                <span className="text-xs font-bold text-[#00FF89]">{promocodeData.code}</span>
                                <button
                                    onClick={handleCopy}
                                    className="ml-1 p-0.5 hover:bg-[#00FF89]/20 rounded transition-colors"
                                    title="Copy code"
                                >
                                    {copied ? (
                                        <CheckCircle className="w-3 h-3 text-[#00FF89]" />
                                    ) : (
                                        <Copy className="w-3 h-3 text-gray-400 hover:text-[#00FF89]" />
                                    )}
                                </button>
                            </div>
                            <span className="text-xs text-gray-400">
                                {formatPromoDisplay(promocodeData)}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onRemove}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-400/10 flex-shrink-0"
                >
                    Remove
                </button>
            </div>
        </motion.div>
    )
}

function PromoCodeBadge({ promocodeData }) {
    return (
        <span className="text-xs text-[#00FF89] bg-[#00FF89]/10 px-2 py-1 rounded">
            {promocodeData.code} ({formatPromoDisplay(promocodeData)})
        </span>
    )
}

function SecurityBadge() {
    return (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Secure checkout powered by Stripe</span>
        </div>
    )
}

function CheckoutFeatures() {
    return (
        <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
            {CHECKOUT_FEATURES.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#FFC050] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-400">{feature.text}</span>
                </div>
            ))}
        </div>
    )
}
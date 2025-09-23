'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, CreditCard, CheckCircle, Copy } from 'lucide-react'
import { formatCurrency, formatPromoDisplay } from '../utils'
import { CHECKOUT_FEATURES } from '../constants'
import CartPromoDisplay from '@/components/features/cart/CartPromoDisplay'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function OrderSummary({
    subtotal,
    totalSavings,
    discount,
    total,
    promocodeData,
    promoLoading,
    promoError,
    handleApplyPromo,
    handleRemovePromo,
    handleCheckout,
    cartItems
}) {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const numericSubtotal = typeof subtotal === 'number' ? subtotal : parseFloat(subtotal) || 0
    const numericTotalSavings = typeof totalSavings === 'number' ? totalSavings : parseFloat(totalSavings) || 0
    const numericDiscount = typeof discount === 'number' ? discount : parseFloat(discount) || 0
    const numericTotal = typeof total === 'number' ? total : parseFloat(total) || 0
    return (
        <div className="lg:col-span-1">
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0f0f10] border border-gray-800 rounded-2xl p-6 lg:sticky lg:top-8"
                role="region"
                aria-label="Order summary">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white">Order Summary</h2>
                        <p className="text-sm text-gray-400 mt-1">Review your items and proceed to checkout</p>
                    </div>
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-sm text-gray-400">Total</span>
                        <span className="text-2xl font-extrabold text-[#00FF89]">{formatCurrency(numericTotal)}</span>
                        {promocodeData && <span className="text-xs text-gray-400 mt-1">Promo: {promocodeData.code}</span>}
                    </div>
                </div>
                {!promocodeData && (
                    <div className="max-h-80 overflow-hidden">
                        <CartPromoDisplay
                            cartItems={cartItems}
                            onApplyPromo={handleApplyPromo}
                            currentPromocode={promocodeData}
                            promoLoading={promoLoading}
                        />
                    </div>
                )}
                <div className="space-y-3 py-4 border-t border-gray-700">
                    <PriceRow
                        label="Subtotal"
                        amount={numericSubtotal}
                    />
                    {numericTotalSavings > 0 && (
                        <PriceRow
                            label="Item Savings"
                            amount={-numericTotalSavings}
                            highlight="savings"
                        />
                    )}
                    {promocodeData && numericDiscount > 0 && (
                        <PromoDiscountRow
                            promocodeData={promocodeData}
                            discount={numericDiscount}
                            onRemove={handleRemovePromo}
                        />
                    )}
                    <div className="pt-3 border-t border-gray-700">
                        <PriceRow
                            label="Total"
                            amount={numericTotal}
                            size="large"
                            highlight="total"
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleCheckout}
                        className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 bg-[#00FF89] text-black font-bold rounded-xl hover:bg-[#00FF89]/95 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/40"
                        aria-label="Proceed to checkout">
                        <CreditCard className="w-5 h-5" />
                        Proceed to Checkout
                    </button>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700">
                    <SecurityBadge />
                    <CheckoutFeatures />
                </div>
            </motion.div>
        </div>
    )
}
function PriceRow({ label, amount, size = 'normal', highlight = null }) {
    const sizeClasses = size === 'large' ? 'text-lg font-semibold' : ''
    const colorClasses =
        {
            savings: 'text-[#00FF89]',
            total: 'text-[#00FF89]',
            null: 'text-gray-300'
        }[highlight] || 'text-gray-300'
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
        if (promocodeData?.code) {
            navigator.clipboard.writeText(promocodeData.code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }
    if (!promocodeData || discount <= 0) {
        return null
    }
    return (
        <div className="p-3 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-lg">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#00FF89]">Promo Applied:</span>
                        {promocodeData.code && (
                            <div className="flex items-center gap-1 bg-[#121212] px-2 py-1 rounded">
                                <span className="font-bold text-[#00FF89]">{promocodeData.code}</span>
                                <button
                                    onClick={handleCopy}
                                    className="ml-1 p-1 hover:bg-[#00FF89]/20 rounded transition-colors"
                                    title="Copy code">
                                    {copied ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-[#00FF89]" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-[#00FF89]" />
                                    )}
                                </button>
                            </div>
                        )}
                        <span className="text-sm text-[#00FF89]">({formatPromoDisplay(promocodeData)})</span>
                    </div>
                    <button
                        onClick={onRemove}
                        className="text-xs text-gray-400 hover:text-red-400 mt-1 transition-colors">
                        Remove promo code
                    </button>
                </div>
                <span className="font-semibold text-[#00FF89]">{formatCurrency(-discount)}</span>
            </div>
        </div>
    )
}
function SecurityBadge() {
    return (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Shield className="w-4 h-4 text-[#00FF89]" />
            <span>Secure SSL Checkout</span>
        </div>
    )
}
function CheckoutFeatures() {
    return (
        <div className="space-y-2">
            {CHECKOUT_FEATURES.map((feature, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3 text-[#00FF89]" />
                    <span>{feature.text}</span>
                </div>
            ))}
        </div>
    )
}
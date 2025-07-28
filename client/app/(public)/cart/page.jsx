'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Clock } from 'lucide-react'

// Hooks
import { useCart } from '@/hooks/useCart'
import { useTrackEvent } from '@/hooks/useTrackEvent'

// Components
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import CartItem from './components/CartItem'
import OrderSummary from './components/OrderSummary'
import EmptyCart from './components/EmptyCart'
import CartLoading from './components/CartLoading'

// Utils & Constants
import { 
    calculateSubtotal, 
    calculateTotalSavings, 
    calculatePromoDiscount, 
    calculateTotal,
    formatCurrency,
    getItemId 
} from './utils'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'

export default function CartPage() {
    const router = useRouter()
    const track = useTrackEvent()
    const { 
        cartItems, 
        cartData, 
        loading, 
        updateQuantity: updateCartQuantity, 
        removeFromCart, 
        applyPromocode, 
        removePromocode 
    } = useCart()

    // Local state for promo code handling
    const [promoCode, setPromoCode] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)
    const [promoError, setPromoError] = useState('')

    // Track cart view on mount
    useEffect(() => {
        track(ANALYTICS_EVENTS.CART.VIEWED, eventProperties.cart())
    }, [track])

    // Memoized calculations
    const calculations = useMemo(() => {
        const subtotal = calculateSubtotal(cartItems)
        const totalSavings = calculateTotalSavings(cartItems)
        const discount = calculatePromoDiscount(cartData, subtotal)
        const total = calculateTotal(cartData, subtotal, discount)

        return { subtotal, totalSavings, discount, total }
    }, [cartItems, cartData])

    // Handlers
    const handleUpdateQuantity = useCallback((itemId, newQuantity) => {
        if (newQuantity < 1) return
        
        const item = cartItems.find(i => getItemId(i) === itemId)
        track(ANALYTICS_EVENTS.CART.QUANTITY_UPDATED, {
            ...eventProperties.cart(itemId, newQuantity, item?.price),
            itemTitle: item?.title,
            oldQuantity: item?.quantity,
            action: newQuantity > item?.quantity ? 'increase' : 'decrease'
        })
        
        updateCartQuantity(itemId, newQuantity)
    }, [cartItems, track, updateCartQuantity])

    const handleRemoveItem = useCallback((itemId) => {
        const item = cartItems.find(i => getItemId(i) === itemId)
        track(ANALYTICS_EVENTS.CART.ITEM_REMOVED, {
            ...eventProperties.cart(itemId, item?.quantity, item?.price),
            itemTitle: item?.title
        })
        removeFromCart(itemId)
    }, [cartItems, track, removeFromCart])

    const handleApplyPromo = useCallback(async () => {
        if (!promoCode.trim()) return
        
        setPromoLoading(true)
        setPromoError('')
        
        try {
            await applyPromocode(promoCode.trim())
            setPromoCode('')
        } catch (error) {
            setPromoError(error.message || 'Invalid promo code')
        } finally {
            setPromoLoading(false)
        }
    }, [promoCode, applyPromocode])
    
    const handleRemovePromo = useCallback(async () => {
        try {
            await removePromocode()
            setPromoError('')
        } catch (error) {
            // Error removing promocode
        }
    }, [removePromocode])

    const handleCheckout = useCallback(async () => {
        track(ANALYTICS_EVENTS.CART.CHECKOUT_CLICKED, {
            ...eventProperties.cart(),
            itemsCount: cartItems.length,
            totalAmount: calculations.total
        })
        router.push('/checkout')
    }, [cartItems.length, calculations.total, track, router])

    // Render states
    if (loading) {
        return <CartLoading />
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#121212]">
                <Header />
                <Container>
                    <div className="pt-24 pb-16">
                        <EmptyCart />
                    </div>
                </Container>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <Header />
            
            <main className="pt-24 pb-16">
                <Container>
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <CartHeader 
                            itemCount={cartItems.length} 
                            total={calculations.total}
                            totalSavings={calculations.totalSavings}
                        />

                        {/* Main Content */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {cartItems.map((item, index) => (
                                    <CartItem
                                        key={getItemId(item)}
                                        item={item}
                                        index={index}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                    />
                                ))}
                            </div>

                            {/* Order Summary */}
                            <OrderSummary
                                {...calculations}
                                promoCode={promoCode}
                                setPromoCode={setPromoCode}
                                promocodeData={cartData?.appliedPromocode || cartData?.promocode}
                                promoLoading={promoLoading}
                                promoError={promoError}
                                handleApplyPromo={handleApplyPromo}
                                handleRemovePromo={handleRemovePromo}
                                handleCheckout={handleCheckout}
                            />
                        </div>
                        
                        {/* Additional Sections */}
                        <RelatedProductsSection />
                        <ContinueShoppingLink />
                    </div>
                </Container>
            </main>
        </div>
    )
}

// Sub-components
function CartHeader({ itemCount, total, totalSavings }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                        Shopping Cart
                    </h1>
                    <p className="text-gray-400">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="px-4 py-2 bg-[#1f1f1f] rounded-lg border border-gray-800">
                        <span className="text-gray-400">Total: </span>
                        <span className="text-[#00FF89] font-semibold">
                            {formatCurrency(total)}
                        </span>
                    </div>
                    {totalSavings > 0 && (
                        <div className="px-4 py-2 bg-[#00FF89]/10 text-[#00FF89] rounded-lg border border-[#00FF89]/20">
                            You save {formatCurrency(totalSavings)}!
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function RelatedProductsSection() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FFC050]" />
                    You might also like
                </h3>
                <Link href="/explore" className="text-sm text-[#FFC050] hover:underline">
                    View all
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center text-gray-500 col-span-full py-8 bg-[#1f1f1f] rounded-xl border border-gray-800">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm">Related products coming soon</p>
                </div>
            </div>
        </motion.div>
    )
}

function ContinueShoppingLink() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
        >
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
            </Link>
        </motion.div>
    )
}
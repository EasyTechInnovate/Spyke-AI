'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Clock, ShoppingBag, Package, TrendingUp, Star, Shield, Zap } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import Container from '@/components/shared/layout/Container'
import CartItem from './components/CartItem'
import OrderSummary from './components/OrderSummary'
import EmptyCart from './components/EmptyCart'
import CartLoading from './components/CartLoading'
import { calculateSubtotal, calculateTotalSavings, calculatePromoDiscount, calculateTotal, formatCurrency, getItemId } from './utils'
export default function CartPage() {
    const router = useRouter()
    const { cartItems, cartData, loading, updateQuantity: updateCartQuantity, removeFromCart, applyPromocode, removePromocode } = useCart()
    const [promoCode, setPromoCode] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)
    const [promoError, setPromoError] = useState('')
    const calculations = useMemo(() => {
        const subtotal = calculateSubtotal(cartItems)
        const totalSavings = calculateTotalSavings(cartItems)
        const discount = calculatePromoDiscount(cartData, subtotal)
        const total = calculateTotal(cartData, subtotal, discount)
        return { subtotal, totalSavings, discount, total }
    }, [cartItems, cartData])
    const handleUpdateQuantity = useCallback(
        (itemId, newQuantity) => {
            if (newQuantity < 1) return
            updateCartQuantity(itemId, newQuantity)
        },
        [updateCartQuantity]
    )
    const handleRemoveItem = useCallback(
        (itemId) => {
            removeFromCart(itemId)
        },
        [removeFromCart]
    )
    const handleApplyPromo = useCallback(async (code) => {
        const codeToApply = code || promoCode?.trim()
        if (!codeToApply) return
        setPromoLoading(true)
        setPromoError('')
        try {
            await applyPromocode(codeToApply)
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
        }
    }, [removePromocode])
    const handleCheckout = useCallback(async () => {
        router.push('/checkout')
    }, [router])
    if (loading) {
        return <CartLoading />
    }
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#121212]">
                <Container>
                    <div className="pt-10 pb-16">
                        <EmptyCart />
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#121212] to-[#1A1A1A] text-white">
            <main className="pt-10 pb-16">
                <Container>
                    <div className="max-w-7xl mx-auto">
                        <CartHeader
                            itemCount={cartItems.length}
                            total={calculations.total}
                            totalSavings={calculations.totalSavings}
                        />
                        
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Cart Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-gradient-to-r from-[#00FF89]/10 to-[#00FF89]/5 border border-[#00FF89]/20 rounded-xl p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#00FF89]/20 rounded-lg">
                                                <ShoppingBag className="w-5 h-5 text-[#00FF89]" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Items in Cart</p>
                                                <p className="text-lg font-bold text-white">{cartItems.length}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-gradient-to-r from-blue-500/10 to-blue-400/5 border border-blue-400/20 rounded-xl p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-400/20 rounded-lg">
                                                <Package className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Digital Products</p>
                                                <p className="text-lg font-bold text-white">{cartItems.length}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {calculations.totalSavings > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 border border-yellow-400/20 rounded-xl p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-yellow-400/20 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Total Savings</p>
                                                    <p className="text-lg font-bold text-white">{formatCurrency(calculations.totalSavings)}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Trust Indicators */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 mb-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-[#00FF89]" />
                                                <span className="text-sm text-gray-300">Secure Checkout</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-yellow-400" />
                                                <span className="text-sm text-gray-300">Premium Quality</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Cart Items */}
                                <div className="space-y-4">
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

                                {/* Additional Info Section */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-gradient-to-r from-gray-800/40 to-gray-700/20 border border-gray-600/30 rounded-xl p-6 mt-6"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-[#00FF89]" />
                                        What's Next?
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-[#00FF89]/20 rounded-lg mt-1">
                                                <Package className="w-4 h-4 text-[#00FF89]" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white mb-1">Instant Access</h4>
                                                <p className="text-sm text-gray-400">Get immediate access after the payment</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-400/20 rounded-lg mt-1">
                                                <Shield className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white mb-1">Professional Support</h4>
                                                <p className="text-sm text-gray-400">Get help from our expert team.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

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
                                cartItems={cartItems}
                            />
                        </div>
                        <RelatedProductsSection />
                        <ContinueShoppingLink />
                    </div>
                </Container>
            </main>
        </div>
    )
}
function CartHeader({ itemCount, total, totalSavings }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Shopping Cart
                    </h1>
                    <p className="text-gray-400">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg">
                        <span className="text-gray-400">Total: </span>
                        <span className="text-brand-primary font-semibold">{formatCurrency(total)}</span>
                    </div>
                    {totalSavings > 0 && (
                        <div className="px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-lg border border-brand-primary/20 backdrop-blur-sm shadow-lg">
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
            className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-accent" />
                    You might also like
                </h3>
                <Link
                    href="/explore"
                    className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors">
                    View all
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center text-gray-500 col-span-full py-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg">
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
            className="mt-8 text-center">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
            </Link>
        </motion.div>
    )
}
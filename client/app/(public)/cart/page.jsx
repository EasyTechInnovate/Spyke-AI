'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft,
  Shield,
  CreditCard,
  Tag,
  X,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import AuthButton from '@/components/shared/ui/AuthButton'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'

export default function CartPage() {
    const router = useRouter()
    const { user } = useAuth()
    const track = useTrackEvent()
    const { cartItems, loading, updateQuantity: updateCartQuantity, removeFromCart } = useCart()
    const [promoCode, setPromoCode] = useState('')
    const [promoApplied, setPromoApplied] = useState(false)
    const [promoDiscount, setPromoDiscount] = useState(0)

    useEffect(() => {
        track(ANALYTICS_EVENTS.CART.VIEWED, eventProperties.cart())
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <Container>
                    <div className="pt-24 pb-16">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF89] mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading your cart...</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalSavings = cartItems.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0)
    const discount = promoApplied ? subtotal * promoDiscount : 0
    const total = subtotal - discount

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return
        
        const item = cartItems.find(i => i.id === itemId)
        track(ANALYTICS_EVENTS.CART.QUANTITY_UPDATED, {
            ...eventProperties.cart(itemId, newQuantity, item?.price),
            itemTitle: item?.title,
            oldQuantity: item?.quantity,
            action: newQuantity > item?.quantity ? 'increase' : 'decrease'
        })
        
        updateCartQuantity(itemId, newQuantity)
    }

    const removeItem = (itemId) => {
        const item = cartItems.find(i => i.id === itemId)
        track(ANALYTICS_EVENTS.CART.ITEM_REMOVED, {
            ...eventProperties.cart(itemId, item?.quantity, item?.price),
            itemTitle: item?.title
        })
        removeFromCart(itemId)
    }

    const handleApplyPromo = () => {
        // Dummy promo code logic
        if (promoCode.toUpperCase() === 'SAVE10') {
            setPromoApplied(true)
            setPromoDiscount(0.1) // 10% discount
        } else if (promoCode.toUpperCase() === 'SAVE20') {
            setPromoApplied(true)
            setPromoDiscount(0.2) // 20% discount
        } else {
            alert('Invalid promo code')
        }
    }

    const handleCheckout = async () => {
        track(ANALYTICS_EVENTS.CART.CHECKOUT_CLICKED, {
            ...eventProperties.cart(),
            itemsCount: cartItems.length,
            totalAmount: total
        })
        // Simulate checkout process
        setTimeout(() => {
            router.push('/checkout')
        }, 1000)
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-black">
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
        <div className="min-h-screen bg-black text-white">
            <Header />
            
            <main className="pt-24 pb-16">
                <Container>
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Shopping Cart</h1>
                            <p className="text-gray-400">
                                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {cartItems.map((item, index) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        onUpdateQuantity={updateQuantity}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </div>

                            {/* Order Summary */}
                            <OrderSummary
                                subtotal={subtotal}
                                totalSavings={totalSavings}
                                discount={discount}
                                total={total}
                                promoCode={promoCode}
                                setPromoCode={setPromoCode}
                                promoApplied={promoApplied}
                                promoDiscount={promoDiscount}
                                handleApplyPromo={handleApplyPromo}
                                handleCheckout={handleCheckout}
                            />
                        </div>

                        {/* Continue Shopping */}
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
                    </div>
                </Container>
            </main>
        </div>
    )
}

function EmptyCart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
        >
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-8">
                Looks like you haven't added any items to your cart yet. 
                Start exploring our marketplace to find amazing AI tools and prompts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
                >
                    Explore Products
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-gray-600 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>
        </motion.div>
    )
}

function OrderSummary({ 
    subtotal, 
    totalSavings, 
    discount, 
    total, 
    promoCode, 
    setPromoCode, 
    promoApplied, 
    promoDiscount,
    handleApplyPromo, 
    handleCheckout 
}) {
    return (
        <div className="lg:col-span-1">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:sticky lg:top-8"
            >
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-300">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {totalSavings > 0 && (
                        <div className="flex justify-between text-green-400">
                            <span>Total Savings</span>
                            <span>-${totalSavings.toFixed(2)}</span>
                        </div>
                    )}
                    {promoApplied && (
                        <div className="flex justify-between text-brand-primary">
                            <span>Promo Discount ({(promoDiscount * 100)}%)</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="border-t border-gray-700 pt-3">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span className="text-brand-primary">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Promo Code
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Enter code"
                            disabled={promoApplied}
                            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-50"
                        />
                        <button
                            onClick={handleApplyPromo}
                            disabled={!promoCode || promoApplied}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {promoApplied ? 'Applied' : 'Apply'}
                        </button>
                    </div>
                    {!promoApplied && (
                        <p className="text-xs text-gray-500 mt-1">
                            Try: SAVE10 or SAVE20
                        </p>
                    )}
                </div>

                {/* Checkout Button */}
                <AuthButton
                    onClick={handleCheckout}
                    icon={CreditCard}
                    className="w-full mb-4"
                    loadingText="Processing..."
                >
                    Proceed to Checkout
                </AuthButton>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout powered by Stripe</span>
                </div>

                {/* Guarantees */}
                <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">Instant download after purchase</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">Lifetime access to all files</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

function CartItem({ item, index, onUpdateQuantity, onRemove }) {
    const router = useRouter()
    const [removing, setRemoving] = useState(false)

    const handleRemove = () => {
        setRemoving(true)
        setTimeout(() => {
            onRemove(item.id)
        }, 300)
    }

    const discountPercentage = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: removing ? 0 : 1, x: removing ? -20 : 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6"
        >
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="w-full sm:w-32 h-24 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-600" />
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-3">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h3 
                                className="font-semibold text-white hover:text-brand-primary cursor-pointer transition-colors"
                                onClick={() => router.push(`/products/${item.productId}`)}
                            >
                                {item.title}
                            </h3>
                            <button
                                onClick={handleRemove}
                                className="text-gray-400 hover:text-red-400 transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-gray-400">
                            Seller: <span className="text-gray-300">{item.seller.name}</span>
                        </span>
                        <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs rounded">
                            {item.category}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-brand-primary">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                {item.originalPrice > item.price && (
                                    <span className="text-sm text-gray-500 line-through">
                                        ${(item.originalPrice * item.quantity).toFixed(2)}
                                    </span>
                                )}
                            </div>
                            {discountPercentage > 0 && (
                                <span className="text-xs text-green-400">
                                    Save {discountPercentage}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
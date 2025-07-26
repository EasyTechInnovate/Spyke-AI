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
  Package,
  Trash2,
  Heart,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  Sparkles
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import AuthButton from '@/components/shared/ui/AuthButton'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import Image from 'next/image'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'

export default function CartPage() {
    const router = useRouter()
    const { user } = useAuth()
    const track = useTrackEvent()
    const { cartItems, cartData, loading, updateQuantity: updateCartQuantity, removeFromCart, applyPromocode, removePromocode } = useCart()
    const [promoCode, setPromoCode] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)
    const [promoError, setPromoError] = useState('')

    useEffect(() => {
        track(ANALYTICS_EVENTS.CART.VIEWED, eventProperties.cart())
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212]">
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
    
    // Calculate discount from promocode
    const calculateDiscount = () => {
        if (cartData?.promocode) {
            const promo = cartData.promocode
            if (promo.discountType === 'percentage') {
                return subtotal * (promo.discountValue / 100)
            } else {
                return Math.min(promo.discountValue, subtotal)
            }
        }
        return 0
    }
    
    const discount = calculateDiscount()
    const total = subtotal - discount

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return
        
        const item = cartItems.find(i => (i._id || i.id || i.productId) === itemId)
        track(ANALYTICS_EVENTS.CART.QUANTITY_UPDATED, {
            ...eventProperties.cart(itemId, newQuantity, item?.price),
            itemTitle: item?.title,
            oldQuantity: item?.quantity,
            action: newQuantity > item?.quantity ? 'increase' : 'decrease'
        })
        
        updateCartQuantity(itemId, newQuantity)
    }

    const removeItem = (itemId) => {
        const item = cartItems.find(i => (i._id || i.id || i.productId) === itemId)
        track(ANALYTICS_EVENTS.CART.ITEM_REMOVED, {
            ...eventProperties.cart(itemId, item?.quantity, item?.price),
            itemTitle: item?.title
        })
        removeFromCart(itemId)
    }

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return
        
        setPromoLoading(true)
        setPromoError('')
        
        try {
            await applyPromocode(promoCode.trim())
            // Clear the input on success
            setPromoCode('')
        } catch (error) {
            setPromoError(error.message || 'Invalid promo code')
        } finally {
            setPromoLoading(false)
        }
    }
    
    const handleRemovePromo = async () => {
        try {
            await removePromocode()
            setPromoError('')
        } catch (error) {
            console.error('Error removing promocode:', error)
        }
    }

    const handleCheckout = async () => {
        track(ANALYTICS_EVENTS.CART.CHECKOUT_CLICKED, {
            ...eventProperties.cart(),
            itemsCount: cartItems.length,
            totalAmount: total
        })
        // Navigate immediately to checkout
        router.push('/checkout')
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
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Shopping Cart</h1>
                                    <p className="text-gray-400">
                                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="px-4 py-2 bg-[#1f1f1f] rounded-lg border border-gray-800">
                                        <span className="text-gray-400">Total: </span>
                                        <span className="text-[#00FF89] font-semibold">${total.toFixed(2)}</span>
                                    </div>
                                    {totalSavings > 0 && (
                                        <div className="px-4 py-2 bg-[#00FF89]/10 text-[#00FF89] rounded-lg border border-[#00FF89]/20">
                                            You save ${totalSavings.toFixed(2)}!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {cartItems.map((item, index) => (
                                    <CartItem
                                        key={item._id || item.id || `cart-item-${index}`}
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
                                promocodeData={cartData?.promocode}
                                promoLoading={promoLoading}
                                promoError={promoError}
                                handleApplyPromo={handleApplyPromo}
                                handleRemovePromo={handleRemovePromo}
                                handleCheckout={handleCheckout}
                            />
                        </div>
                        
                        {/* Related Products Suggestion */}
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
                                {/* Placeholder for related products */}
                                <div className="text-center text-gray-500 col-span-full py-8 bg-[#1f1f1f] rounded-xl border border-gray-800">
                                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                    <p className="text-sm">Related products coming soon</p>
                                </div>
                            </div>
                        </motion.div>

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
            <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/20 to-transparent rounded-full blur-xl" />
                <div className="relative w-full h-full bg-[#1f1f1f] rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-gray-500" />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Discover amazing AI tools, prompts, and automations to supercharge your workflow. 
                Start exploring our marketplace now!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF89] text-[#121212] font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-colors"
                >
                    Explore Products
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-[#00FF89]/50 hover:text-white transition-colors"
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
                className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6 lg:sticky lg:top-8"
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between lg:cursor-default mb-6"
                >
                    <h2 className="text-xl font-semibold">Order Summary</h2>
                    <div className="flex items-center gap-2">
                        {!isExpanded && (
                            <span className="lg:hidden text-[#00FF89] font-semibold">
                                ${total.toFixed(2)}
                            </span>
                        )}
                        <div className="lg:hidden">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </button>
                
                <div className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-300">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {totalSavings > 0 && (
                        <div className="flex justify-between text-[#00FF89]">
                            <span>Total Savings</span>
                            <span>-${totalSavings.toFixed(2)}</span>
                        </div>
                    )}
                    {promocodeData && (
                        <div className="flex justify-between text-[#00FF89]">
                            <span>
                                Promo Discount 
                                {promocodeData.discountType === 'percentage' 
                                    ? `(${promocodeData.discountValue}%)` 
                                    : ''}
                            </span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="border-t border-gray-700 pt-3">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span className="text-[#00FF89]">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">
                            Promo Code
                        </label>
                        <button className="group relative">
                            <Info className="w-4 h-4 text-gray-500 hover:text-gray-400" />
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-[#1f1f1f] text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Enter a valid promo code to get discount on your order
                            </div>
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Enter code"
                            disabled={!!promocodeData}
                            className="flex-1 px-4 py-2 bg-[#1f1f1f] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent disabled:opacity-50"
                        />
                        <button
                            onClick={handleApplyPromo}
                            disabled={!promoCode || !!promocodeData || promoLoading}
                            className="px-4 py-2 bg-[#1f1f1f] border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 hover:border-[#00FF89]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {promoLoading && <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
                            {promocodeData ? 'Applied' : 'Apply'}
                        </button>
                    </div>
                    {promocodeData && (
                        <div className="mt-2 p-2 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-[#00FF89]" />
                                    <span className="text-sm text-[#00FF89] font-medium">{promocodeData.code}</span>
                                </div>
                                <button
                                    onClick={handleRemovePromo}
                                    className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                    {promoError && (
                        <p className="text-xs text-red-400 mt-1">
                            {promoError}
                        </p>
                    )}
                </div>

                {/* Checkout Button */}
                <AuthButton
                    onClick={handleCheckout}
                    icon={CreditCard}
                    className="w-full mb-4"
                    loadingText="Processing..."
                    requiresAuth={false}
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
                        <CheckCircle className="w-4 h-4 text-[#FFC050] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#FFC050] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">Instant download after purchase</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#FFC050] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">Lifetime access to all files</span>
                    </div>
                </div>
                </div>
            </motion.div>
        </div>
    )
}

function CartItem({ item, index, onUpdateQuantity, onRemove }) {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [removing, setRemoving] = useState(false)

    const handleRemove = () => {
        setRemoving(true)
        setTimeout(() => {
            onRemove(item._id || item.id || item.productId)
        }, 300)
    }

    const discountPercentage = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: removing ? 0 : 1, x: removing ? -20 : 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6"
        >
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="w-full sm:w-32 h-32 sm:h-24 bg-[#1f1f1f] rounded-lg flex-shrink-0 overflow-hidden group relative">
                    {item.image || item.thumbnail ? (
                        <Image
                            src={item.image || item.thumbnail}
                            alt={item.title}
                            width={128}
                            height={96}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1f1f1f] to-gray-800 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-600" />
                        </div>
                    )}
                    {discountPercentage > 0 && (
                        <div className="absolute top-2 right-2 bg-[#FFC050] text-[#121212] text-xs px-2 py-1 rounded-full font-medium">
                            -{discountPercentage}%
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-3">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h3 
                                className="font-semibold text-white hover:text-[#00FF89] cursor-pointer transition-colors"
                                onClick={() => router.push(`/products/${item.productId}`)}
                            >
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {/* Save for later */}}
                                    className="text-gray-400 hover:text-[#00FF89] transition-colors p-1.5 rounded-lg hover:bg-[#1f1f1f]"
                                    aria-label="Save for later"
                                >
                                    <Heart className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleRemove}
                                    className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-[#1f1f1f]"
                                    aria-label="Remove from cart"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-gray-400">
                            Seller: <span className="text-gray-300">{item.seller?.name || 'Unknown Seller'}</span>
                        </span>
                        <span className="px-2 py-1 bg-[#00FF89]/20 text-[#00FF89] text-xs rounded">
                            {item.category}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Quantity Controls */}
                        {isAuthenticated ? (
                            <div className="text-sm text-gray-400">
                                Quantity: {item.quantity || 1}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onUpdateQuantity(item._id || item.id || item.productId, item.quantity - 1)}
                                    className="w-10 h-10 bg-[#1f1f1f] hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={item.quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-16 text-center font-medium bg-[#1f1f1f] rounded-lg py-2">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item._id || item.id || item.productId, item.quantity + 1)}
                                    className="w-10 h-10 bg-[#1f1f1f] hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                                    aria-label="Increase quantity"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Price */}
                        <div className="text-right">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-[#00FF89]">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                                {item.originalPrice > item.price && (
                                    <span className="text-sm text-gray-500 line-through">
                                        ${(item.originalPrice * item.quantity).toFixed(2)}
                                    </span>
                                )}
                            </div>
                            {discountPercentage > 0 && (
                                <span className="text-xs text-[#00FF89]">
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
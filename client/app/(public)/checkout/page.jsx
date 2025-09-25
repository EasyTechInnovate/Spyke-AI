'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Shield,
    Lock,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Package,
    Tag,
    Loader2,
    Wallet,
    Bitcoin,
    Zap,
    ChevronDown,
    ChevronUp,
    Trash2,
    Plus,
    Minus
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { useCart } from '@/hooks/useCart'
import { paymentAPI, cartAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function CheckoutPage() {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { cartItems, cartData, loading: cartLoading, clearCart, removeFromCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [initialLoad, setInitialLoad] = useState(true)
    const [hasCheckedCart, setHasCheckedCart] = useState(false)
    const [skipCartRedirect, setSkipCartRedirect] = useState(false)
    const [step, setStep] = useState(1) 
    const [paymentMethod, setPaymentMethod] = useState('manual')
    useEffect(() => {
        if (!cartLoading) {
            setInitialLoad(false)
            setHasCheckedCart(true)
        }
    }, [cartLoading])
    useEffect(() => {
        if (hasCheckedCart && !cartLoading && !initialLoad && !isAuthenticated) {
            router.push('/auth/signup?redirect=/checkout')
            return
        }
        const timer = setTimeout(() => {
            if (hasCheckedCart && !cartLoading && !initialLoad && !skipCartRedirect && cartItems.length === 0) {
                router.push('/cart')
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [cartItems.length, cartLoading, hasCheckedCart, initialLoad, router, skipCartRedirect, isAuthenticated])
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = cartData.appliedPromocode
        ? cartData.appliedPromocode.discountType === 'percentage'
            ? subtotal * (cartData.appliedPromocode.discountValue / 100)
            : cartData.appliedPromocode.discountValue || cartData.appliedPromocode.discountAmount
        : 0
    const total = Math.max(0, subtotal - discount)
    const handleRemoveItem = async (itemId) => {
        try {
            await removeFromCart(itemId)
            showMessage('Item removed from cart', 'success')
        } catch (error) {
            showMessage('Failed to remove item', 'error')
        }
    }
    const handlePaymentMethodChange = async (newPaymentMethod) => {
        setPaymentMethod(newPaymentMethod)
    }
    const handleNextStep = async () => {
        if (step === 1) {
            setStep(2)
        }
    }
    const handlePreviousStep = () => {
        if (step > 1) setStep(step - 1)
    }
    const handleCheckout = async () => {
        setLoading(true)
        try {
            // Only allow Stripe payments
            if (paymentMethod !== 'stripe') {
                throw new Error('Only Stripe payments are supported')
            }

            const baseUrl = window.location.origin
            const successUrl = `${baseUrl}/checkout/success`
            const cancelUrl = `${baseUrl}/checkout`

            const result = await paymentAPI.createCheckoutSession(successUrl, cancelUrl)
            
            if (!result?.url) {
                throw new Error('Failed to create checkout session')
            }

            window.location.href = result.url
            
        } catch (error) {
            showMessage(error.message || 'Payment failed. Please try again.', 'error')
        } finally {
            setLoading(false)
        }
    }
    const completeCheckout = async (purchaseId, method) => {
        const successData = {
            orderId: purchaseId,
            isManual: method === 'manual',
            orderDetails: {
                items: cartItems.map((item) => ({
                    id: item._id || item.id,
                    title: (item.productId || item).title,
                    price: (item.productId || item).price,
                    type: (item.productId || item).type,
                    thumbnail: (item.productId || item).thumbnail
                })),
                subtotal: subtotal,
                discount: discount,
                total: total,
                paymentMethod: method,
                appliedPromocode: cartData.appliedPromocode
            }
        }
        setSkipCartRedirect(true)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('lastOrderDetails', JSON.stringify(successData))
        }
        const successUrl = `/checkout/success?orderId=${purchaseId}&manual=${method === 'manual'}&total=${total}&items=${cartItems.length}`
        router.push(successUrl)
        await clearCart()
        setSkipCartRedirect(false)
        showMessage('Order completed successfully!', 'success')
    }
    if (cartLoading || !hasCheckedCart) {
        return (
            <div className="min-h-screen bg-black">
                {notification && (
                    <InlineNotification
                        type={notification.type}
                        message={notification.message}
                        onDismiss={clearNotification}
                    />
                )}
                <Container>
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
                            <p className="text-gray-400">Loading checkout...</p>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-black">
            {notification && (
                <div className="fixed top-4 right-4 z-50">
                    <InlineNotification
                        type={notification.type}
                        message={notification.message}
                        onDismiss={clearNotification}
                    />
                </div>
            )}
            <main className="pt-16 pb-24">
                <Container>
                    <div className="max-w-3xl mx-auto mb-8">
                        <div className="flex items-center justify-between relative px-4 sm:px-8">
                            <div className="absolute left-8 right-8 top-5 h-0.5 bg-gray-800 hidden sm:block">
                                <div
                                    className="h-full bg-brand-primary transition-all duration-300"
                                    style={{ width: `${(step - 1) * 100}%` }}
                                />
                            </div>
                            {[
                                { num: 1, label: 'Review Order' },
                                { num: 2, label: 'Payment' }
                            ].map((s) => (
                                <div
                                    key={s.num}
                                    className="relative z-10 flex flex-col items-center bg-black px-2 sm:px-4"
                                    role="tab"
                                    aria-selected={step === s.num}
                                    aria-label={`Step ${s.num}: ${s.label}`}>
                                    <div
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center font-semibold
                                            transition-all duration-300 border-2
                                            ${
                                                step >= s.num
                                                    ? 'bg-brand-primary text-black border-brand-primary'
                                                    : 'bg-gray-800 text-gray-400 border-gray-600'
                                            }
                                        `}>
                                        {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                                    </div>
                                    <span className="text-xs mt-3 text-gray-400 whitespace-nowrap font-medium text-center">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className="lg:col-span-2">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 relative"
                                role="main"
                                aria-label={`Checkout step ${step}`}>
                                {loading && (
                                    <div
                                        className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20"
                                        role="status"
                                        aria-label="Processing order">
                                        <div className="text-center">
                                            <Loader2 className="w-10 h-10 animate-spin text-brand-primary mx-auto mb-3" />
                                            <p className="text-white font-medium">Processing your order...</p>
                                            <p className="text-gray-400 text-sm mt-1">Please wait</p>
                                        </div>
                                    </div>
                                )}
                                {step === 1 && (
                                    <ReviewStep
                                        paymentMethod={paymentMethod}
                                        cartItems={cartItems}
                                        total={total}
                                        subtotal={subtotal}
                                        discount={discount}
                                        promocode={cartData.appliedPromocode}
                                        onRemoveItem={handleRemoveItem}
                                    />
                                )}
                                {step === 2 && (
                                    <PaymentMethodStep
                                        paymentMethod={paymentMethod}
                                        setPaymentMethod={setPaymentMethod}
                                        onPaymentMethodChange={handlePaymentMethodChange}
                                    />
                                )}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-800">
                                    {step > 1 ? (
                                        <button
                                            onClick={handlePreviousStep}
                                            disabled={loading}
                                            className="flex items-center justify-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                                            aria-label="Go back to previous step">
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                    ) : (
                                        <Link
                                            href="/cart"
                                            className="flex items-center justify-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors order-2 sm:order-1"
                                            aria-label="Return to shopping cart">
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Cart
                                        </Link>
                                    )}
                                    {step < 2 ? (
                                        <button
                                            onClick={handleNextStep}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-gray-900 order-1 sm:order-2"
                                            aria-label="Continue to payment method selection">
                                            Continue to Payment
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleCheckout}
                                            disabled={loading}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-gray-900 order-1 sm:order-2"
                                            aria-label={loading ? 'Processing purchase' : 'Complete purchase'}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4" />
                                                    Complete Purchase
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-gray-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-brand-primary" />
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-brand-primary" />
                                    <span>SSL Encrypted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-brand-primary" />
                                    <span>Money-back Guarantee</span>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <OrderSummary
                                cartItems={cartItems}
                                subtotal={subtotal}
                                discount={discount}
                                total={total}
                                promocode={cartData.appliedPromocode}
                            />
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}
function ReviewStep({ cartItems, total, subtotal, discount, promocode, onRemoveItem }) {
    const getProductImage = (item) => {
        const imageUrl =
            item.thumbnail ||
            item.image ||
            item.thumbnailImage ||
            item.productImage ||
            item.images?.[0] ||
            item.media?.[0]?.url ||
            item.productId?.thumbnail ||
            item.productId?.image ||
            item.productId?.thumbnailImage ||
            item.productId?.images?.[0] ||
            null
        return imageUrl
    }

    const handleImageError = (e) => {
        console.warn('Checkout product image failed to load:', e.target.src)
        // Hide the broken image and show fallback
        const fallbackDiv = e.target.nextElementSibling
        if (fallbackDiv) {
            e.target.style.display = 'none'
            fallbackDiv.style.display = 'flex'
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Package className="w-6 h-6 text-brand-primary" />
                Review Your Order
            </h2>
            <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                    const imageUrl = getProductImage(item)
                    const product = item.productId || item
                    return (
                        <div
                            key={item._id || item.id}
                            className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-20 h-20 relative">
                                    {imageUrl ? (
                                        <>
                                            <img
                                                src={imageUrl}
                                                alt={product.title || item.title || 'Product'}
                                                className="w-full h-full object-cover rounded-lg border border-gray-600"
                                                onError={handleImageError}
                                                loading="lazy"
                                            />
                                            <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-gray-700/30 rounded-lg border border-gray-600 items-center justify-center absolute inset-0 hidden">
                                                <Package className="w-8 h-8 text-brand-primary/60" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-gray-700/30 rounded-lg border border-gray-600 flex items-center justify-center">
                                            <Package className="w-8 h-8 text-brand-primary/60" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white text-lg mb-1 truncate">{product.title || item.title}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-gray-400">Sold by:</span>
                                        <span className="text-sm text-brand-primary font-medium">
                                            {item.seller?.fullName ||
                                                item.seller?.businessName ||
                                                item.seller?.name ||
                                                item.sellerName ||
                                                product.seller?.fullName ||
                                                product.seller?.businessName ||
                                                'Verified Seller'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded-full">
                                            <Tag className="w-3 h-3" />
                                            {product.type || item.type || 'Digital Product'}
                                        </span>
                                        {(product.category || item.category) && (
                                            <span className="text-xs text-gray-500 capitalize">
                                                {(product.category || item.category).replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-brand-primary">
                                                {product.formattedPrice || `$${(product.price || item.price || 0).toFixed(2)}`}
                                            </span>
                                            {(item.originalPrice || product.originalPrice) &&
                                                (item.originalPrice || product.originalPrice) > (product.price || item.price) && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        ${(item.originalPrice || product.originalPrice).toFixed(2)}
                                                    </span>
                                                )}
                                        </div>
                                        <button
                                            onClick={() =>
                                                onRemoveItem(
                                                    item._id || item.id || item.productId?._id || item.productId?.id || product._id || product.id
                                                )
                                            }
                                            className="flex items-center gap-1 px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all text-sm"
                                            title="Remove from cart">
                                            <Trash2 className="w-4 h-4" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-gray-300">
                        <span>
                            Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                        </span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {promocode && discount > 0 && (
                        <div className="flex justify-between text-brand-primary">
                            <span>Promo Code ({promocode.code})</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                            <span className="text-lg font-semibold text-white">Total</span>
                            <span className="text-xl font-bold text-brand-primary">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">
                By completing this purchase, you agree to our{' '}
                <Link
                    href="/terms"
                    className="text-brand-primary hover:underline">
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                    href="/privacy-policy"
                    className="text-brand-primary hover:underline">
                    Privacy Policy
                </Link>
            </div>
        </div>
    )
}
function PaymentMethodStep({ paymentMethod, setPaymentMethod, onPaymentMethodChange }) {
    const paymentOptions = [
        {
            id: 'stripe',
            name: 'Credit/Debit Card',
            description: 'Pay securely with Stripe',
            icon: CreditCard,
            recommended: true
        },
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Pay with your PayPal account',
            icon: Wallet,
            comingSoon: true
        },
        {
            id: 'crypto',
            name: 'Cryptocurrency',
            description: 'Pay with Bitcoin, Ethereum, etc.',
            icon: Bitcoin,
            comingSoon: true
        }
    ]

    // Set default payment method to stripe if no method is selected or if manual was selected
    useEffect(() => {
        if (!paymentMethod || paymentMethod === 'manual') {
            setPaymentMethod('stripe')
            if (onPaymentMethodChange) {
                onPaymentMethodChange('stripe')
            }
        }
    }, [paymentMethod, setPaymentMethod, onPaymentMethodChange])

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-brand-primary" />
                Choose Payment Method
            </h2>
            <div className="space-y-4">
                {paymentOptions.map((option) => (
                    <label
                        key={option.id}
                        className={`
                            relative block p-4 border rounded-xl cursor-pointer transition-all
                            ${paymentMethod === option.id ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-700 hover:border-gray-600'}
                            ${option.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                        `}>
                        <div className="flex items-center gap-4">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={option.id}
                                checked={paymentMethod === option.id}
                                onChange={(e) => {
                                    if (!option.comingSoon) {
                                        const newMethod = e.target.value
                                        setPaymentMethod(newMethod)
                                        if (onPaymentMethodChange) {
                                            onPaymentMethodChange(newMethod)
                                        }
                                    }
                                }}
                                disabled={option.comingSoon}
                                className="sr-only"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gray-800">
                                            <option.icon className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{option.name}</p>
                                            <p className="text-sm text-gray-400">{option.description}</p>
                                            {option.info && <p className="text-xs text-brand-primary mt-1">{option.info}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {option.recommended && (
                                            <span className="text-xs bg-brand-primary text-black px-2 py-1 rounded-full font-medium">
                                                Recommended
                                            </span>
                                        )}
                                        {option.comingSoon && (
                                            <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded-full">Coming Soon</span>
                                        )}
                                        <div
                                            className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            ${paymentMethod === option.id ? 'border-brand-primary bg-brand-primary' : 'border-gray-600'}
                                        `}>
                                            {paymentMethod === option.id && <div className="w-2 h-2 rounded-full bg-black" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </label>
                ))}
            </div>
            {paymentMethod === 'stripe' && (
                <div className="mt-6 p-4 bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-400 mb-4">You will be redirected to Stripe's secure payment page to complete your purchase.</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Lock className="w-4 h-4" />
                        Your payment information is encrypted and secure
                    </div>
                </div>
            )}
        </div>
    )
}
function OrderSummary({ cartItems, subtotal, discount, total, promocode }) {
    const getProductImage = (item) => {
        const imageUrl =
            item.thumbnail ||
            item.image ||
            item.thumbnailImage ||
            item.productImage ||
            item.images?.[0] ||
            item.media?.[0]?.url ||
            item.productId?.thumbnail ||
            item.productId?.image ||
            item.productId?.thumbnailImage ||
            item.productId?.images?.[0] ||
            null
        return imageUrl
    }

    const handleImageError = (e) => {
        console.warn('Checkout summary image failed to load:', e.target.src)
        // Hide the broken image and show fallback
        const fallbackDiv = e.target.nextElementSibling
        if (fallbackDiv) {
            e.target.style.display = 'none'
            fallbackDiv.style.display = 'flex'
        }
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-8">
            <h3 className="text-xl font-semibold text-white mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                    const imageUrl = getProductImage(item)
                    const product = item.productId || item
                    return (
                        <div
                            key={item._id || item.id}
                            className="flex items-center gap-3">
                            <div className="w-12 h-12 flex-shrink-0 relative">
                                {imageUrl ? (
                                    <>
                                        <img
                                            src={imageUrl}
                                            alt={product.title || item.title || 'Product'}
                                            className="w-full h-full object-cover rounded-lg border border-gray-600"
                                            onError={handleImageError}
                                            loading="lazy"
                                        />
                                        <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-gray-700/30 rounded-lg border border-gray-600 items-center justify-center absolute inset-0 hidden">
                                            <Package className="w-4 h-4 text-brand-primary/60" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-gray-700/30 rounded-lg border border-gray-600 flex items-center justify-center">
                                        <Package className="w-4 h-4 text-brand-primary/60" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">{product.title || item.title}</h4>
                                <p className="text-xs text-gray-400">{product.type || item.type || 'Digital Product'}</p>
                            </div>
                            <span className="text-sm font-semibold text-brand-primary">
                                {product.formattedPrice || `$${(product.price || item.price || 0).toFixed(2)}`}
                            </span>
                        </div>
                    )
                })}
            </div>
            <div className="border-t border-gray-700 pt-6 space-y-3">
                <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                {promocode && discount > 0 && (
                    <div className="flex justify-between text-brand-primary">
                        <span>Discount ({promocode.code})</span>
                        <span>-${discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                        <span className="text-white">Total</span>
                        <span className="text-brand-primary">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Shield className="w-4 h-4 text-brand-primary" />
                    <div>
                        <p className="text-sm font-medium text-white">Secure Checkout</p>
                        <p className="text-xs text-gray-400">Your information is protected by 256-bit SSL encryption</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
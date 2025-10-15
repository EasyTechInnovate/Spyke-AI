'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Loader2, Sparkles, Star, Download } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'
import { paymentAPI } from '@/lib/api'
import { useCart } from '@/hooks/useCart'
import confetti from 'canvas-confetti'
import { track } from '@/lib/utils/analytics'
import { TRACKING_EVENTS } from '@/lib/constants/tracking'

function LoadingUI() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="relative mx-auto mb-6">
                    <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-400 rounded-full"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-green-300 rounded-full animate-spin-slow"></div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}>
                    <p className="text-white text-lg font-medium mb-2">Processing your order</p>
                    <div className="flex items-center justify-center space-x-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                                className="w-2 h-2 bg-green-400 rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

function CheckoutSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { clearCart, reload: reloadCart } = useCart()
    const sessionId = searchParams.get('session_id')

    const [state, setState] = useState({
        loading: true,
        error: null,
        order: null,
        confettiTriggered: false
    })

    const triggerConfetti = useCallback(() => {
        const colors = ['#00FF89', '#00D672', '#00B85C', '#ffffff']
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.3 },
            colors,
            gravity: 0.8,
            scalar: 1.2
        })
        setTimeout(
            () =>
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { x: 0.3, y: 0.4 },
                    colors,
                    shapes: ['star'],
                    gravity: 0.6
                }),
            200
        )
        setTimeout(
            () =>
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { x: 0.7, y: 0.4 },
                    colors,
                    shapes: ['star'],
                    gravity: 0.6
                }),
            400
        )
    }, [])

    useEffect(() => {
        if (!sessionId) {
            setState((prev) => ({ ...prev, loading: false, error: 'No payment session found' }))
            return
        }

        // Prevent duplicate processing
        const storageKey = `order_confirmed_${sessionId}`
        const alreadyProcessed = sessionStorage.getItem(storageKey)

        if (alreadyProcessed) {
            try {
                const cachedOrder = JSON.parse(alreadyProcessed)
                setState({ loading: false, error: null, order: cachedOrder, confettiTriggered: true })
                triggerConfetti()
                return
            } catch {}
        }

        let isMounted = true

        const confirmOrder = async () => {
            try {
                const response = await paymentAPI.confirmCheckoutSession(sessionId)

                if (!isMounted) return

                const data = response?.data || response

                if (!data || !data.purchaseId) {
                    throw new Error('Invalid order data received')
                }

                const order = {
                    id: data.purchaseId || data._id,
                    items: Array.isArray(data.items) ? data.items : [],
                    total: data.finalAmount ?? data.totalAmount ?? 0,
                    subtotal: data.totalAmount ?? data.finalAmount ?? 0,
                    discount: data.discountAmount ?? 0,
                    status: 'completed',
                    method: data.paymentMethod?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Stripe Checkout',
                    date: data.purchaseDate || new Date().toISOString()
                }

                // Track successful purchase completion
                track(TRACKING_EVENTS.PURCHASE_COMPLETED, {
                    order_id: order.id,
                    total_amount: order.total,
                    payment_method: 'stripe',
                    items_purchased: order.items.length,
                    discount_applied: order.discount > 0,
                    discount_amount: order.discount,
                    product_types: order.items.map((item) => item.type).join(','),
                    purchase_flow: 'stripe_checkout'
                })

                track(TRACKING_EVENTS.PAGE_VIEWED, {
                    page_name: 'checkout_success',
                    order_id: order.id,
                    order_value: order.total
                })

                // Cache successful order
                sessionStorage.setItem(storageKey, JSON.stringify(order))

                setState({ loading: false, error: null, order, confettiTriggered: false })

                // Trigger confetti
                setTimeout(() => {
                    if (isMounted) {
                        triggerConfetti()
                        setState((prev) => ({ ...prev, confettiTriggered: true }))
                    }
                }, 100)

                // Clear cart in background
                setTimeout(async () => {
                    try {
                        await clearCart?.()
                        await reloadCart?.()
                    } catch (e) {
                        console.error('Cart clear failed:', e)
                    }
                }, 500)
            } catch (error) {
                if (!isMounted) return

                // Track purchase failure
                track(TRACKING_EVENTS.PURCHASE_FAILED, {
                    error_message: error.message || 'Failed to confirm order',
                    session_id: sessionId,
                    failure_step: 'order_confirmation'
                })

                const message = error?.message || 'Failed to confirm order'

                if (/already|existing|duplicate/i.test(message)) {
                    setState({
                        loading: false,
                        error: null,
                        order: {
                            id: 'processed',
                            items: [],
                            total: 0,
                            subtotal: 0,
                            discount: 0,
                            status: 'completed',
                            method: 'Stripe Checkout',
                            date: new Date().toISOString()
                        },
                        confettiTriggered: false
                    })
                    setTimeout(() => triggerConfetti(), 100)
                } else {
                    setState((prev) => ({ ...prev, loading: false, error: message }))
                }
            }
        }

        confirmOrder()

        return () => {
            isMounted = false
        }
    }, [sessionId, clearCart, reloadCart, triggerConfetti])

    if (state.loading) return <LoadingUI />

    if (state.error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto text-center">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Loader2 className="h-8 w-8 text-red-400 animate-spin" />
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-4">Processing Your Order</h2>
                            <p className="text-gray-300 mb-6">{state.error}</p>
                            <Link
                                href="/purchases"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-400 hover:to-green-500 transition-all duration-300">
                                Check Purchase History
                            </Link>
                        </div>
                    </motion.div>
                </Container>
            </div>
        )
    }

    const { order } = state
    const formatCurrency = (val) => Number(val ?? 0).toFixed(2)

    const handleAccessProducts = () => {
        track(TRACKING_EVENTS.BUTTON_CLICKED, {
            button_name: 'access_my_products',
            location: 'checkout_success',
            order_id: order?.id
        })
    }

    const handleContinueShopping = () => {
        track(TRACKING_EVENTS.BUTTON_CLICKED, {
            button_name: 'continue_shopping',
            location: 'checkout_success',
            order_id: order?.id
        })
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/3 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <Container className="relative z-10 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                            className="relative mx-auto mb-8 w-24 h-24">
                            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50">
                                <CheckCircle className="h-12 w-12 text-white" />
                                <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></div>
                            </div>
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute top-1/2 left-1/2"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, 1, 0],
                                        x: Math.cos((i * 60 * Math.PI) / 180) * 50,
                                        y: Math.sin((i * 60 * Math.PI) / 180) * 50
                                    }}
                                    transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}>
                                    <Sparkles className="h-4 w-4 text-green-300" />
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent mb-4">
                                Payment Successful!
                            </h1>
                            <p className="text-gray-300 text-lg">Your order has been confirmed and is ready to access</p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mr-3">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Order Details</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-sm text-gray-400 mb-1">Order ID</p>
                                        <p className="text-white font-mono text-sm">#{order.id}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-sm text-gray-400 mb-1">Status</p>
                                        <p className="text-green-400 font-semibold flex items-center">
                                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                            Completed
                                        </p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-sm text-gray-400 mb-1">Payment Method</p>
                                        <p className="text-white font-semibold">{order.method}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                                        <p className="text-green-400 font-bold text-lg">${formatCurrency(order.total)}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Items */}
                            {order.items?.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mr-3">
                                            <Download className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white">Your Items</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {order.items.map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + idx * 0.1 }}
                                                className="bg-white/5 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-all">
                                                <div className="flex items-center space-x-3">
                                                    <Star className="h-5 w-5 text-green-400" />
                                                    <div>
                                                        <h3 className="text-white font-semibold">{item.title || 'Digital Product'}</h3>
                                                        <p className="text-sm text-gray-400">{item.type || 'Premium Content'}</p>
                                                    </div>
                                                </div>
                                                <p className="text-green-400 font-bold">${formatCurrency(item.price)}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Summary & Actions */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-white mb-4">Summary</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-300">
                                        <span>Subtotal</span>
                                        <span className="font-mono">${formatCurrency(order.subtotal)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Discount</span>
                                            <span className="font-mono">-${formatCurrency(order.discount)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-xl">
                                        <span>Total</span>
                                        <span className="text-green-400 font-mono">${formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-3">
                                <Link
                                    href="/purchases"
                                    onClick={handleAccessProducts}
                                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-400 hover:to-green-500 transition-all shadow-lg shadow-green-500/25">
                                    Access My Products
                                </Link>
                                <Link
                                    href="/explore"
                                    onClick={handleContinueShopping}
                                    className="w-full flex items-center justify-center px-6 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20">
                                    <span>Continue Shopping</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<LoadingUI />}>
            <CheckoutSuccessContent />
        </Suspense>
    )
}


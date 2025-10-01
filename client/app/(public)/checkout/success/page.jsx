'use client'
import { Suspense, useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Package, Mail, ArrowRight, Loader2, Sparkles, Star, Download } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'
import { cartAPI, paymentAPI } from '@/lib/api'
import { useCart } from '@/hooks/useCart'
import confetti from 'canvas-confetti'
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
function formatText(str) {
    if (!str) return ''
    return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}
function CheckoutSuccessContent() {
    const [loading, setLoading] = useState(true)
    const [orderDetails, setOrderDetails] = useState(null)
    const [error, setError] = useState(null)
    const [paymentConfirmed, setPaymentConfirmed] = useState(false)
    const mountedRef = useRef(true)
    const confettiFiredRef = useRef(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const { clearCart, reload: reloadCart } = useCart()
    const safeCents = useCallback((val) => {
        const n = Number(val ?? 0)
        return Number.isFinite(n) ? (n / 100).toFixed(2) : '0.00'
    }, [])
    const triggerEnhancedConfetti = useCallback(() => {
        const colors = ['#00FF89', '#00D672', '#00B85C', '#ffffff']
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.3 },
            colors,
            gravity: 0.8,
            scalar: 1.2
        })
        setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { x: 0.3, y: 0.4 },
                colors,
                shapes: ['star'],
                gravity: 0.6
            })
        }, 200)
        setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { x: 0.7, y: 0.4 },
                colors,
                shapes: ['star'],
                gravity: 0.6
            })
        }, 400)
    }, [])
    const sessionId = searchParams.get('session_id')
    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])
    useEffect(() => {
        let aborted = false
        const confirmationAttempted = useRef(false)

        const load = async () => {
            if (!sessionId) {
                if (mountedRef.current) {
                    setError('No payment session found.')
                    setLoading(false)
                }
                return
            }

            // Prevent multiple confirmation attempts
            if (confirmationAttempted.current) {
                console.log('Confirmation already attempted, skipping...')
                return
            }
            confirmationAttempted.current = true

            try {
                const raw = await paymentAPI.confirmCheckoutSession(sessionId)
                if (!raw) throw new Error('Empty response from backend')

                // Handle both success and "already exists" cases as success
                if (raw.success === false && !raw.message?.includes('already') && !raw.message?.includes('existing')) {
                    throw new Error(raw.message || 'Backend reported failure')
                }

                const data = raw.data || raw || {}
                const id = data._id ?? data.purchaseId ?? data.id
                const items = Array.isArray(data.items) ? data.items : data.items ? [data.items] : []
                const total = data.finalAmount ?? data.final_amount ?? data.totalAmount ?? data.total_amount ?? 0
                const subtotal = data.totalAmount ?? data.total_amount ?? data.subtotal ?? 0
                const discount = data.discountAmount ?? data.discount_amount ?? 0
                const paymentStatus = 'processing'
                const orderStatus = data.orderStatus ?? data.status
                const paymentMethod = formatText(data.paymentMethod)
                const normalized = {
                    orderId: id,
                    items,
                    total,
                    subtotal,
                    discount,
                    paymentStatus,
                    orderStatus,
                    appliedPromocode: data.appliedPromocode ?? data.applied_promocode ?? null,
                    purchaseDate: data.purchaseDate ?? data.purchase_date ?? data.createdAt,
                    paymentMethod
                }

                if (mountedRef.current && !aborted) {
                    setOrderDetails(normalized)
                    setLoading(false)

                    setTimeout(
                        () => {
                            if (mountedRef.current && !aborted) {
                                setPaymentConfirmed(true)
                                setOrderDetails((prev) => ({
                                    ...prev,
                                    paymentStatus: 'completed',
                                    orderStatus: 'completed'
                                }))

                                if (!confettiFiredRef.current) {
                                    triggerEnhancedConfetti()
                                    confettiFiredRef.current = true
                                }

                                setTimeout(async () => {
                                    try {
                                        await cartAPI?.clearCart?.()
                                        await clearCart?.()
                                        await reloadCart?.()
                                    } catch (e) {
                                        console.error('Failed to clear cart:', e)
                                    }
                                }, 500)
                            }
                        },
                        2000 + Math.random() * 1000
                    )
                }
            } catch (err) {
                const msg = err?.message ?? String(err)
                console.error('Payment confirmation error:', err)

                if (mountedRef.current && !aborted) {
                    // Handle specific error cases more gracefully
                    if (msg.includes('already') || msg.includes('existing') || msg.includes('duplicate')) {
                        // Treat as success - order already exists
                        setOrderDetails({
                            orderId: 'Already processed',
                            paymentStatus: 'completed',
                            orderStatus: 'completed',
                            paymentMethod: 'Stripe Checkout',
                            items: []
                        })
                        setPaymentConfirmed(true)
                    } else if (msg.includes('No matching document') || msg.includes('not yet available')) {
                        setError('Order is being processed. Please check your purchases page in a moment.')
                    } else {
                        setError(msg.length > 100 ? 'Payment confirmation failed. Please contact support if your payment was charged.' : msg)
                    }
                    setLoading(false)
                }
            }
        }

        load()
        return () => {
            aborted = true
        }
    }, [sessionId, clearCart, reloadCart, triggerEnhancedConfetti])
    if (loading) {
        return <LoadingUI />
    }
    const hasOrder = !!(orderDetails && orderDetails.orderId)
    const isFinalSuccess = hasOrder && paymentConfirmed
    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]  from-green-500/2 to-transparent rounded-full blur-3xl"></div>
            </div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-green-400/30 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight
                        }}
                        animate={{
                            y: [null, -100],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>
            <Container className="relative z-10 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <AnimatePresence>
                            {isFinalSuccess ? (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                        damping: 10,
                                        duration: 0.8
                                    }}
                                    className="relative mx-auto mb-8">
                                    <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto relative shadow-2xl shadow-green-500/50">
                                        <CheckCircle className="h-12 w-12 text-white" />
                                        <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></div>
                                        <div className="absolute inset-0 rounded-full border-2 border-green-300/30 animate-pulse"></div>
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute"
                                                style={{
                                                    top: `${20 + Math.cos((i * Math.PI) / 3) * 40}%`,
                                                    left: `${20 + Math.sin((i * Math.PI) / 3) * 40}%`
                                                }}
                                                animate={{
                                                    y: [-5, -15, -5],
                                                    rotate: [0, 180, 360],
                                                    scale: [0.8, 1.2, 0.8]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    delay: i * 0.2,
                                                    repeat: Infinity
                                                }}>
                                                <Sparkles className="h-4 w-4 text-green-300" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-24 h-24 border-4 border-green-500/30 border-t-green-400 rounded-full flex items-center justify-center mx-auto mb-8 animate-spin">
                                    <div className="w-16 h-16 border-4 border-transparent border-r-green-300 rounded-full animate-spin"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent mb-4">
                                {isFinalSuccess ? 'Payment Confirmed!' : 'Processing Payment...'}
                            </h1>
                            <p className="text-gray-300 text-lg max-w-md mx-auto">
                                {isFinalSuccess
                                    ? 'Your magical journey begins now. All systems are ready!'
                                    : 'Weaving the final touches of your digital experience...'}
                            </p>
                        </motion.div>
                    </div>
                    {hasOrder && (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                    <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-green-500/30 transition-all duration-500">
                                        <div className="flex items-center mb-6">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mr-4">
                                                <Package className="h-5 w-5 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white">Order Confirmed</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                { label: 'Order ID', value: `#${String(orderDetails?.orderId)}`, mono: true },
                                                {
                                                    label: 'Payment Status',
                                                    value: formatText(orderDetails?.paymentStatus || 'Completed'),
                                                    status: true
                                                },
                                                { label: 'Payment Method', value: formatText(orderDetails?.paymentMethod || 'N/A'), mono: true },
                                                { label: 'Total Amount', value: `$${safeCents(orderDetails?.total)}`, amount: true }
                                            ].map((item, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                                                    className="group/item">
                                                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-green-500/20 hover:bg-white/10 transition-all duration-300">
                                                        <h3 className="text-sm font-medium text-gray-400 mb-2">{item.label}</h3>
                                                        <p
                                                            className={`text-white text-lg font-semibold ${item.mono ? 'font-mono text-base' : ''} ${item.amount ? 'text-green-400 text-xl' : ''} ${item.status ? 'flex items-center' : ''}`}>
                                                            {item.status && (
                                                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                                            )}
                                                            {item.value}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                    className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-2xl blur-xl"></div>
                                    <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-green-500/30 transition-all duration-500">
                                        <div className="flex items-center mb-6">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mr-4">
                                                <Download className="h-5 w-5 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white">Your Digital Assets</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {orderDetails.items?.map((item, idx) => {
                                                const title =
                                                    item.title ||
                                                    item.productTitle ||
                                                    (item.productId && String(item.productId).slice(0, 8)) ||
                                                    'Digital Asset'
                                                const price = item.price ?? item.amount ?? 0
                                                const type = item.type || 'Premium Content'
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                                                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                                        transition={{ duration: 0.5, delay: 0.6 + idx * 0.1 }}
                                                        className="group/item relative">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent rounded-xl blur-sm group-hover/item:blur-md transition-all duration-300"></div>
                                                        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-green-500/30 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center mb-2">
                                                                        <Star className="h-4 w-4 text-green-400 mr-2" />
                                                                        <h3 className="text-white font-bold text-lg">{title}</h3>
                                                                    </div>
                                                                    <p className="text-gray-300 text-sm mb-4">{type}</p>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <p className="text-green-400 font-bold text-xl">${safeCents(price)}</p>
                                                                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mt-2">
                                                                        <Download className="h-4 w-4 text-green-400" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.7 }}
                                    className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent rounded-2xl blur-xl"></div>
                                    <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-500">
                                        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                                            Order Summary
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-gray-300 border-b border-white/10 pb-3">
                                                <span>Subtotal</span>
                                                <span className="font-mono">${safeCents(orderDetails?.subtotal)}</span>
                                            </div>
                                            {(orderDetails?.discount || 0) > 0 && (
                                                <div className="flex justify-between text-green-400 border-b border-white/10 pb-3">
                                                    <span>Discount Applied</span>
                                                    <span className="font-mono">-${safeCents(orderDetails?.discount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-white font-bold text-xl pt-3">
                                                <span>Total</span>
                                                <span className="text-green-400 font-mono">${safeCents(orderDetails?.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                    className="space-y-4">
                                    <Link
                                        href="/purchases"
                                        className="group relative w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:shadow-xl overflow-hidden">
                                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                        <span className="relative z-10">Access My Downloads</span>
                                    </Link>
                                    <Link
                                        href="/explore"
                                        className="group w-full inline-flex items-center justify-center px-6 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-green-500/50">
                                        <span>Explore More</span>
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    )}
                    {!hasOrder && error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center max-w-md mx-auto">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-4">Processing Your Order</h2>
                                <p className="text-gray-300 mb-6">{error}</p>
                                <Link
                                    href="/account/purchases"
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-400 hover:to-green-500 transition-all duration-300">
                                    Check Purchase History
                                </Link>
                            </div>
                        </motion.div>
                    )}
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

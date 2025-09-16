'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Mail, ArrowRight, Download, Loader2, AlertCircle } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import Link from 'next/link'
import confetti from 'canvas-confetti'

function CheckoutSuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const orderId = searchParams.get('orderId')
    const isManualPayment = searchParams.get('manual') === 'true'
    const orderTotal = searchParams.get('total')
    const orderItems = searchParams.get('items')

    const [loading, setLoading] = useState(true)
    const [orderDetails, setOrderDetails] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Trigger confetti animation
        const triggerConfetti = () => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00FF89', '#00D672', '#00B85C']
            })
        }

        // Load order details
        const loadOrderDetails = async () => {
            try {
                // Try to get stored order details from sessionStorage first
                const storedDetails = sessionStorage.getItem('lastOrderDetails')
                if (storedDetails) {
                    const parsedDetails = JSON.parse(storedDetails)
                    if (parsedDetails.orderId === orderId) {
                        setOrderDetails(parsedDetails.orderDetails)
                        setLoading(false)
                        triggerConfetti()
                        // Clean up stored data
                        sessionStorage.removeItem('lastOrderDetails')
                        return
                    }
                }

                // Fallback: construct order details from URL params
                const fallbackDetails = {
                    orderId: orderId || 'Unknown',
                    total: orderTotal ? parseFloat(orderTotal) : 0,
                    itemCount: orderItems ? parseInt(orderItems) : 0,
                    email: 'user@example.com', // This would come from user context in real app
                    paymentMethod: isManualPayment ? 'manual' : 'unknown',
                    items: [] // Empty for now, could fetch from API
                }

                setOrderDetails(fallbackDetails)
                triggerConfetti()
            } catch (err) {
                console.error('Error loading order details:', err)
                setError('Failed to load order details')
            } finally {
                setLoading(false)
            }
        }

        // Delay for better UX
        const timer = setTimeout(loadOrderDetails, 800)
        return () => clearTimeout(timer)
    }, [orderId, isManualPayment, orderTotal, orderItems])

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Container>
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
                            <p className="text-gray-400">Loading your order details...</p>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black">
                <Container>
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                            <p className="text-gray-400 mb-6">{error}</p>
                            <Link
                                href="/purchases"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors">
                                View My Purchases
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <main className="pt-16 pb-24">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        {/* Success Header */}
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, type: 'spring' }}
                                className="mb-8">
                                <div className="w-24 h-24 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-12 h-12 text-brand-primary" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    {isManualPayment ? 'Order Placed Successfully!' : 'Purchase Successful!'}
                                </h1>

                                <p className="text-xl text-gray-400 mb-8">
                                    {isManualPayment
                                        ? 'Your test order has been confirmed. You now have access to your products.'
                                        : 'Thank you for your purchase. Your order has been confirmed and processed.'}
                                </p>

                                {/* Order Summary Card */}
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-400 mb-2">Order Number</p>
                                        <p className="text-2xl font-mono font-bold text-white mb-4">{orderId}</p>

                                        {orderDetails && (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Items:</span>
                                                    <span className="text-white font-semibold">
                                                        {orderDetails.items?.length || orderDetails.itemCount || 0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Total:</span>
                                                    <span className="text-brand-primary font-bold text-lg">
                                                        ${(orderDetails.total || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-400">Payment:</span>
                                                    <span className="text-white capitalize">{orderDetails.paymentMethod || 'Manual'}</span>
                                                </div>
                                            </div>
                                        )}

                                        {isManualPayment && <p className="text-xs text-brand-primary mt-4">Test Mode - Manual Payment</p>}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Order Items (if available) */}
                        {orderDetails?.items && orderDetails.items.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-12">
                                <h2 className="text-2xl font-bold text-white mb-6">Your Items</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {orderDetails.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-gray-700/30 rounded-lg flex items-center justify-center">
                                                    {item.thumbnail ? (
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-brand-primary/60" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white">{item.title}</h3>
                                                    <p className="text-sm text-gray-400 capitalize">{item.type}</p>
                                                    <p className="text-brand-primary font-semibold">${item.price?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Next Steps */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-12">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-3 text-gray-400 mb-4">
                                        <Mail className="w-5 h-5" />
                                        <p>A confirmation email has been sent to {orderDetails?.email || 'your email'}</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-3 text-gray-400 mb-4">
                                        <Package className="w-5 h-5" />
                                        <p>You can now access your purchased items</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <Link
                                href="/purchases"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors">
                                <Download className="w-5 h-5" />
                                View My Purchases
                            </Link>

                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-gray-600 hover:text-white transition-colors">
                                Continue Shopping
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </Container>
            </main>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black">
                    <Container>
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                        </div>
                    </Container>
                </div>
            }>
            <CheckoutSuccessContent />
        </Suspense>
    )
}


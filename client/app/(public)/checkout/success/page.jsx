'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Mail, ArrowRight, Download, Loader2 } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import Link from 'next/link'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import confetti from 'canvas-confetti'

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const track = useTrackEvent()
  
  const orderId = searchParams.get('orderId')
  const isManualPayment = searchParams.get('manual') === 'true'
  const [loading, setLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    // Track success page view
    track(ANALYTICS_EVENTS.CHECKOUT.SUCCESS_VIEWED, { orderId })
    
    // Trigger confetti animation
    const triggerConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FF89', '#00D672', '#00B85C']
      })
    }
    
    // Delay confetti slightly for better effect
    const timer = setTimeout(triggerConfetti, 500)
    
    // Simulate loading order details
    // In production, this would fetch actual order details
    setTimeout(() => {
      setOrderDetails({
        orderId: orderId || '123456',
        items: [],
        total: 0,
        email: 'user@example.com'
      })
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-16 pb-24">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-brand-primary" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                {isManualPayment ? 'Order Placed Successfully!' : 'Purchase Successful!'}
              </h1>
              
              <p className="text-xl text-gray-400 mb-8">
                {isManualPayment 
                  ? 'Your test order has been confirmed. You now have access to your products.'
                  : 'Thank you for your purchase. Your order has been confirmed.'}
              </p>

              {orderId && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
                  <p className="text-sm text-gray-400 mb-2">Order Number</p>
                  <p className="text-2xl font-mono font-bold text-white">{orderId}</p>
                  {isManualPayment && (
                    <p className="text-xs text-brand-primary mt-2">Test Mode - Manual Payment</p>
                  )}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center gap-3 text-gray-400">
                  <Mail className="w-5 h-5" />
                  <p>A confirmation email has been sent to {orderDetails.email}</p>
                </div>
                
                <div className="flex items-center justify-center gap-3 text-gray-400">
                  <Package className="w-5 h-5" />
                  <p>You can now access your purchased items</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/purchases"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  View My Purchases
                </Link>
                
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-gray-600 hover:text-white transition-colors"
                >
                  Continue Shopping
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* What's Next Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16 grid sm:grid-cols-3 gap-6"
            >
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Mail className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">Check Your Email</h3>
                <p className="text-sm text-gray-400">
                  We've sent you a confirmation with your order details and access instructions
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Download className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">Access Your Items</h3>
                <p className="text-sm text-gray-400">
                  Visit your purchases page to download and access your new AI tools
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Package className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">Need Help?</h3>
                <p className="text-sm text-gray-400">
                  Our support team is here to help you get started with your new tools
                </p>
              </div>
            </motion.div>
          </div>
        </Container>
      </main>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <Header />
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
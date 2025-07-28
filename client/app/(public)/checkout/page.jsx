'use client'

import { useState, useEffect } from 'react'
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
  Edit2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import { useCart } from '@/hooks/useCart'
import { cartAPI } from '@/lib/api'
import { toast } from 'sonner'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import Link from 'next/link'
import Image from 'next/image'


export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, cartData, loading: cartLoading, clearCart } = useCart()
  const track = useTrackEvent()
  
  
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [hasCheckedCart, setHasCheckedCart] = useState(false)
  const [step, setStep] = useState(1) // 1: Review, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState('manual')
  

  useEffect(() => {
    if (!cartLoading) {
      setInitialLoad(false)
      setHasCheckedCart(true)
    }
  }, [cartLoading])

  useEffect(() => {
    // Track checkout page view
    track(ANALYTICS_EVENTS.CHECKOUT.VIEWED)
  }, [track])

  useEffect(() => {
    // Add a small delay to ensure cart has fully loaded after auth changes
    const timer = setTimeout(() => {
      if (hasCheckedCart && !cartLoading && !initialLoad && cartItems.length === 0) {
        router.push('/cart')
      }
    }, 500) // 500ms delay to handle auth transitions

    return () => clearTimeout(timer)
  }, [cartItems.length, cartLoading, hasCheckedCart, initialLoad, router])


  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discount = cartData.appliedPromocode ? 
    (cartData.appliedPromocode.discountType === 'percentage' 
      ? subtotal * (cartData.appliedPromocode.discountValue / 100)
      : cartData.appliedPromocode.discountValue || cartData.appliedPromocode.discountAmount) 
    : 0
  const total = Math.max(0, subtotal - discount)

  // Handle step navigation
  const handleNextStep = () => {
    if (step === 1) {
      setStep(2)
      track(ANALYTICS_EVENTS.CHECKOUT.REVIEW_COMPLETED)
    }
  }

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // Handle checkout
  const handleCheckout = async () => {
    setLoading(true)
    
    try {
      // Track checkout attempt
      track(ANALYTICS_EVENTS.CHECKOUT.SUBMITTED, {
        total,
        itemCount: cartItems.length,
        paymentMethod
      })

      // Handle different payment methods
      if (paymentMethod === 'stripe') {
        // For Stripe integration (future implementation)
        toast.info('Stripe payment integration coming soon. Using manual payment for now.')
        
        // Create purchase with manual payment for now
        const purchaseData = {
          paymentMethod: 'manual',
          paymentReference: `MANUAL-${Date.now()}`
        }

        const result = await cartAPI.createPurchase(purchaseData)
        
        // Clear cart on success
        await clearCart()
        
        // Track success
        track(ANALYTICS_EVENTS.CHECKOUT.COMPLETED, {
          orderId: result.purchaseId,
          total
        })
        
        // Redirect to success page
        router.push(`/checkout/success?orderId=${result.purchaseId}&manual=true`)
        
      } else if (paymentMethod === 'manual') {
        // Manual payment (current implementation)
        const purchaseData = {
          paymentMethod: 'manual',
          paymentReference: `MANUAL-${Date.now()}`
        }

        const result = await cartAPI.createPurchase(purchaseData)
        
        // Clear cart on success
        await clearCart()
        
        // Track success
        track(ANALYTICS_EVENTS.CHECKOUT.COMPLETED, {
          orderId: result.purchaseId,
          total
        })
        
        // Redirect to success page
        router.push(`/checkout/success?orderId=${result.purchaseId}&manual=true`)
      }
      
    } catch (error) {
      // Checkout error
      toast.error(error.message || 'Checkout failed. Please try again.')
      track(ANALYTICS_EVENTS.CHECKOUT.FAILED, { error: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (cartLoading || !hasCheckedCart) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
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
      <Header />
      
      <main className="pt-16 pb-24">
        <Container>
          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-800">
                <div 
                  className="h-full bg-brand-primary transition-all duration-300"
                  style={{ width: `${(step - 1) * 100}%` }}
                />
              </div>
              
              {[
                { num: 1, label: 'Review Order' },
                { num: 2, label: 'Payment' }
              ].map((s) => (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    transition-all duration-300
                    ${step >= s.num 
                      ? 'bg-brand-primary text-black' 
                      : 'bg-gray-800 text-gray-400'
                    }
                  `}>
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className="text-xs mt-2 text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form Area */}
            <div className="lg:col-span-2">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative"
              >
                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
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
                  />
                )}
                
                {step === 2 && (
                  <PaymentMethodStep
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                  />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <button
                      onClick={handlePreviousStep}
                      className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  ) : (
                    <Link
                      href="/cart"
                      className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Cart
                    </Link>
                  )}
                  
                  {step < 2 ? (
                    <button
                      onClick={handleNextStep}
                      className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                      aria-label="Continue to payment method selection"
                    >
                      Continue to Payment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                      aria-label={loading ? 'Processing purchase' : 'Complete purchase'}
                    >
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

              {/* Trust Signals */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Secure Checkout
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  SSL Encrypted
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Money-back Guarantee
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
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

  // Payment Method Step Component
function PaymentMethodStep({ paymentMethod, setPaymentMethod }) {
  const paymentOptions = [
    {
      id: 'manual',
      name: 'Manual Payment',
      description: 'Complete payment manually',
      icon: Zap,
      recommended: true,
      info: 'For testing purposes - instant access'
    },
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Pay securely with Stripe',
      icon: CreditCard,
      comingSoon: true
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <CreditCard className="w-6 h-6 text-brand-primary" />
        Payment Method
      </h2>

      <div className="space-y-4">
        {paymentOptions.map((option) => (
          <label
            key={option.id}
            className={`
              relative flex items-start p-4 border rounded-xl cursor-pointer
              transition-all duration-200 group
              ${paymentMethod === option.id 
                ? 'border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/50' 
                : 'border-gray-700 hover:border-gray-600 focus-within:ring-2 focus-within:ring-brand-primary/50'
              }
              ${option.comingSoon ? 'opacity-50 cursor-not-allowed hover:border-gray-700' : ''}
            `}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={option.id}
              checked={paymentMethod === option.id}
              onChange={(e) => !option.comingSoon && setPaymentMethod(e.target.value)}
              disabled={option.comingSoon}
              className="sr-only"
              aria-label={`${option.name} - ${option.description}`}
            />
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors">
                    <option.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{option.name}</p>
                    <p className="text-sm text-gray-400">{option.description}</p>
                    {option.info && (
                      <p className="text-xs text-brand-primary mt-1">{option.info}</p>
                    )}
                  </div>
                </div>
                
                {option.recommended && !option.comingSoon && (
                  <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs font-semibold rounded">
                    Recommended
                  </span>
                )}
                
                {option.comingSoon && (
                  <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>

            {paymentMethod === option.id && !option.comingSoon && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-5 h-5 text-brand-primary" />
              </div>
            )}
          </label>
        ))}
      </div>

      {/* Payment Form */}
      {paymentMethod === 'stripe' && (
        <div className="mt-6 p-4 bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-400 mb-4">
            You will be redirected to Stripe's secure payment page to complete your purchase.
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="w-4 h-4" />
            Your payment information is encrypted and secure
          </div>
        </div>
      )}
      
      {paymentMethod === 'manual' && (
        <div className="mt-6 p-4 bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-400 mb-4">
            This is a test payment method. Your order will be processed immediately without actual payment.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Instant access to purchased products
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              For testing purposes only
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Review Step Component
function ReviewStep({ cartItems, total, subtotal, discount, promocode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Package className="w-6 h-6 text-brand-primary" />
        Review Your Order
      </h2>

      {/* Order Summary */}
      <div className="mb-6">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-start gap-4">
                {item.image && (
                  <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                    <span className="text-gray-400">•</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-brand-primary">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  {item.originalPrice > item.price && (
                    <p className="text-sm text-gray-500 line-through">
                      ${(item.originalPrice * item.quantity).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-gray-300">${subtotal.toFixed(2)}</span>
        </div>
        
        {promocode && discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Promo: {promocode.code}
            </span>
            <span className="text-green-500">-${discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-white">Total</span>
            <span className="text-xl font-bold text-brand-primary">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-4 text-xs text-gray-400">
        By completing this purchase, you agree to our{' '}
        <Link href="/terms" className="text-brand-primary hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-brand-primary hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}

// Order Summary Component
function OrderSummary({ cartItems, subtotal, discount, total, promocode }) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:sticky lg:top-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between lg:cursor-default"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-primary" />
            Order Summary
          </h3>
          {!isExpanded && (
            <span className="lg:hidden text-brand-primary font-semibold">
              ${total.toFixed(2)}
            </span>
          )}
        </div>
        <div className="lg:hidden">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Collapsible Content */}
      <div className={`${isExpanded ? 'block' : 'hidden lg:block'} mt-4`}>
        {/* Items */}
        <div className="space-y-3 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <p className="text-gray-300 line-clamp-1">{item.title}</p>
              <p className="text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-gray-300 font-medium">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-400">Subtotal</p>
          <p className="text-gray-300">${subtotal.toFixed(2)}</p>
        </div>

        {promocode && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Promo: {promocode.code}
            </p>
            <p className="text-green-500">-${discount.toFixed(2)}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <p className="text-lg font-semibold text-white">Total</p>
          <p className="text-xl font-bold text-brand-primary">${total.toFixed(2)}</p>
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-6 p-4 bg-gray-800 rounded-xl">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-brand-primary" />
          <div>
            <p className="text-sm font-medium text-white">Secure Checkout</p>
            <p className="text-xs text-gray-400">
              Your information is protected by 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Shield,
  ArrowRight
} from 'lucide-react'
import getStripe, { elementsOptions } from '@/lib/stripe/stripe'
import { useAuth } from '@/hooks/useAuth'

// Payment Form Component (inside Elements provider)
function PaymentForm({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError, 
  onProcessing,
  cartSummary 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please try again.')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')
    onProcessing?.(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: user?.email || user?.emailAddress,
        },
        redirect: 'if_required'
      })

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment processing.')
        onError?.(error)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsComplete(true)
        onSuccess?.(paymentIntent)
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.')
      onError?.(err)
    } finally {
      setIsProcessing(false)
      onProcessing?.(false)
    }
  }

  const handlePaymentElementChange = (event) => {
    if (event.complete) {
      setErrorMessage('')
    }
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Payment Successful!</h3>
        <p className="text-gray-400">Your payment has been processed successfully.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white mb-4">
          <CreditCard className="w-5 h-5 text-brand-primary" />
          <span className="font-medium">Payment Details</span>
        </div>
        
        <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
          <PaymentElement 
            onChange={handlePaymentElementChange}
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  email: user?.email || user?.emailAddress || '',
                  name: user?.name || user?.fullName || '',
                }
              }
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium">Payment Error</p>
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Summary */}
      {cartSummary && (
        <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
          <h4 className="font-medium text-white mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Items ({cartSummary.itemCount})</span>
              <span>${cartSummary.totalAmount?.toFixed(2)}</span>
            </div>
            {cartSummary.discountAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>-${cartSummary.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between text-white font-medium">
                <span>Total</span>
                <span>${cartSummary.finalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 p-3 rounded-lg">
        <Shield className="w-4 h-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${amount?.toFixed(2)}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  )
}

// Main Stripe Payment Form Component
export default function StripePaymentForm({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError, 
  onProcessing,
  cartSummary 
}) {
  const [stripe, setStripe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await getStripe()
        setStripe(stripeInstance)
      } catch (error) {
        console.error('Failed to initialize Stripe:', error)
        onError?.(error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeStripe()
  }, [onError])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
          <p className="text-gray-400">Loading payment form...</p>
        </div>
      </div>
    )
  }

  if (!stripe) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">Failed to load payment system</p>
          <p className="text-gray-400 text-sm mt-2">Please refresh the page and try again</p>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-400">Payment session not initialized</p>
          <p className="text-gray-400 text-sm mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const options = {
    ...elementsOptions,
    clientSecret,
  }

  return (
    <div className="max-w-md mx-auto">
      <Elements stripe={stripe} options={options}>
        <PaymentForm
          clientSecret={clientSecret}
          amount={amount}
          onSuccess={onSuccess}
          onError={onError}
          onProcessing={onProcessing}
          cartSummary={cartSummary}
        />
      </Elements>
    </div>
  )
}
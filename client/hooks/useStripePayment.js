'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { paymentAPI } from '@/lib/api/payment'
import { useAuth } from './useAuth'
import { useNotifications } from './useNotifications'

export function useStripePayment() {
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [error, setError] = useState(null)
  
  const router = useRouter()
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  const createPaymentIntent = useCallback(async (amount) => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await paymentAPI.createPaymentIntent()
      
      if (response.success && response.data) {
        setPaymentIntent(response.data)
        return {
          clientSecret: response.data.clientSecret,
          paymentIntentId: response.data.paymentIntentId,
          amount: response.data.amount,
          cartSummary: response.data.cartSummary
        }
      } else {
        throw new Error(response.message || 'Failed to create payment intent')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create payment intent'
      setError(errorMessage)
      addNotification({
        type: 'error',
        title: 'Payment Error',
        message: errorMessage
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, addNotification])

  const handlePaymentSuccess = useCallback(async (paymentIntentData) => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await paymentAPI.confirmStripePayment(paymentIntentData.id)
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Payment Successful!',
          message: 'Your purchase has been completed successfully.'
        })

        router.push('/checkout/success?payment_intent=' + paymentIntentData.id)
        return true
      } else {
        throw new Error(response.message || 'Failed to confirm payment')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to confirm payment'
      setError(errorMessage)
      addNotification({
        type: 'error',
        title: 'Payment Confirmation Failed',
        message: errorMessage
      })
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [router, addNotification])

  const handlePaymentError = useCallback((error) => {
    setError(error.message || 'Payment failed')
    addNotification({
      type: 'error',
      title: 'Payment Failed',
      message: error.message || 'An error occurred during payment processing.'
    })
  }, [addNotification])

  const resetPayment = useCallback(() => {
    setPaymentIntent(null)
    setError(null)
    setIsLoading(false)
    setIsProcessing(false)
  }, [])

  return {
    isLoading,
    isProcessing,
    paymentIntent,
    error,
    
    createPaymentIntent,
    handlePaymentSuccess,
    handlePaymentError,
    resetPayment,
    setIsProcessing
  }
}
import { apiClient } from './client'

export const paymentAPI = {
  createPaymentIntent: async () => {
    try {
      const response = await apiClient.post('/purchase/payment-intent')
      return response.data
    } catch (error) {
      console.error('Failed to create payment intent:', error)
      throw error
    }
  },

  confirmStripePayment: async (paymentIntentId) => {
    try {
      const response = await apiClient.post('/purchase/confirm-stripe-payment', {
        paymentIntentId
      })
      return response.data
    } catch (error) {
      console.error('Failed to confirm Stripe payment:', error)
      throw error
    }
  },

  getCart: async () => {
    try {
      const response = await apiClient.get('/purchase/cart')
      return response.data
    } catch (error) {
      console.error('Failed to get cart:', error)
      throw error
    }
  },

  completePayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/purchase/complete-payment', paymentData)
      return response.data
    } catch (error) {
      console.error('Failed to complete payment:', error)
      throw error
    }
  },

  confirmPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/purchase/confirm-payment', paymentData)
      return response.data
    } catch (error) {
      console.error('Failed to confirm payment:', error)
      throw error
    }
  }
}

export default paymentAPI
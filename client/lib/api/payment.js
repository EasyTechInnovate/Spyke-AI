import apiClient from './client'

export const paymentAPI = {
  // Removed: createPaymentIntent (not used in Stripe Checkout flow)

  createCheckoutSession: async (successUrl, cancelUrl) => {
    try {
      const response = await apiClient.post('/v1/purchase/checkout-session', {
        successUrl,
        cancelUrl
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  confirmCheckoutSession: async (sessionId) => {
    try {
      const response = await apiClient.post('/v1/purchase/confirm-checkout-session', {
        sessionId
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Removed: confirmStripePayment (not used in current flow)

  getCart: async () => {
    try {
      const response = await apiClient.get('/purchase/cart')
      return response.data
    } catch (error) {
      throw error
    }
  },

  completePayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/purchase/complete-payment', paymentData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  confirmPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/purchase/confirm-payment', paymentData)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default paymentAPI
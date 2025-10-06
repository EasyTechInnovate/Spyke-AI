import apiClient from './client'

const pendingConfirmations = new Map()

export const paymentAPI = {
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
            if (pendingConfirmations.has(sessionId)) {
                console.log('Confirmation already in progress for session:', sessionId)
                return await pendingConfirmations.get(sessionId)
            }
            const confirmationPromise = apiClient
                .post('/v1/purchase/confirm-checkout-session', {
                    sessionId
                })
                .then((response) => {
                    pendingConfirmations.delete(sessionId)
                    return response.data
                })
                .catch((error) => {
                    pendingConfirmations.delete(sessionId)
                    throw error
                })
            pendingConfirmations.set(sessionId, confirmationPromise)
            return await confirmationPromise
        } catch (error) {
            throw error
        }
    },

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

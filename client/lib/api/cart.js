import apiClient from './client'

const cartAPI = {
    // Get user's cart
    getCart: async () => {
        try {
            const response = await apiClient.get('/v1/purchase/cart')
            return response.data || { items: [], total: 0 }
        } catch (error) {
            // For unauthenticated users, return empty cart
            if (error.status === 401) {
                return { items: [], total: 0 }
            }
            throw error
        }
    },

    // Add item to cart
    addToCart: async (productId, quantity = 1) => {
        try {
            const response = await apiClient.post('/v1/purchase/cart/add', {
                productId,
                quantity
            })
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Update item quantity
    updateQuantity: async (productId, quantity) => {
        try {
            const response = await apiClient.patch(`/v1/purchase/cart/update/${productId}`, {
                quantity
            })
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Remove item from cart
    removeFromCart: async (productId) => {
        try {
            const response = await apiClient.delete(`/v1/purchase/cart/remove/${productId}`)
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Clear entire cart
    clearCart: async () => {
        try {
            const response = await apiClient.delete('/v1/purchase/cart/clear')
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Apply promocode
    applyPromocode: async (code) => {
        try {
            const response = await apiClient.post('/v1/purchase/cart/promocode', {
                code
            })
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Remove promocode
    removePromocode: async () => {
        try {
            const response = await apiClient.delete('/v1/purchase/cart/promocode')
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Validate promocode
    validatePromocode: async (code) => {
        try {
            const response = await apiClient.get(`/v1/promocode/validate/${code}`)
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Create purchase from cart
    createPurchase: async (paymentDetails = {}) => {
        try {
            const response = await apiClient.post('/v1/purchase/create', {
                paymentMethod: paymentDetails.paymentMethod || 'manual',
                paymentReference: paymentDetails.paymentReference || 'manual-payment',
                ...paymentDetails
            })

            // Normalize server payload (httpResponse wraps data in `data`)
            const payload = (response && response.data) ? response.data : response

            // If server returned a purchaseId and it is a paid purchase, auto-complete payment
            // to simulate payment success (useful for testing workflows).
            if (payload && payload.purchaseId && payload.finalAmount && payload.finalAmount > 0) {
                try {
                    const completion = await apiClient.post('/v1/purchase/complete-payment', {
                        purchaseId: payload.purchaseId
                    })

                    // Return the original payload at top-level and include completion details
                    return {
                        ...payload,
                        completed: completion
                    }
                } catch (completeErr) {
                    return {
                        ...payload,
                        completedError: completeErr
                    }
                }
            }

            // Return normalized payload (so callers find purchaseId at result.purchaseId)
            return payload
        } catch (error) {
            throw error
        }
    }
}

export default cartAPI
import apiClient from './client'

export const sellerAPI = {
    /**
     * Create or update the seller profile
     * POST v1/seller/profile
     */
    createProfile: async (data) => {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken') || localStorage.getItem('sellerAccessToken')
        const response = await apiClient.post('v1/seller/profile', data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    },

    /**
     * Get the current seller profile
     * GET v1/seller/profile
     */
    getProfile: async () => {
        const response = await apiClient.get('v1/seller/profile')
        return response.data
    },
    
    acceptCommissionOffer: async () => {
        const res = await apiClient.post('v1/seller/commission/accept')
        return res?.data
    },
    
    // Submit counter offer
    submitCounterOffer: async ({ rate, reason }) => {
        const res = await apiClient.post('v1/seller/commission/counter-offer', { 
            rate, 
            reason 
        })
        return res?.data
    },

    /**
     * Update seller profile
     * PUT v1/seller/profile
     */
    updateProfile: async (data) => {
        const response = await apiClient.put('v1/seller/profile', data)
        return response.data
    },

    /**
     * Submit seller documents for verification
     * POST v1/seller/verification/submit
     */
    submitVerification: async (payload) => {
        const response = await apiClient.post('v1/seller/verification/submit', payload)
        return response.data
    },

    /**
     * Update payout information
     * PUT v1/seller/payout
     */
    updatePayoutInfo: async (payload) => {
        const response = await apiClient.put('v1/seller/payout', payload)
        return response.data
    },

    /**
     * Public: Get seller profile by ID
     * GET v1/seller/public/:sellerId
     */
    getPublicProfile: async (sellerId) => {
        const response = await apiClient.get(`v1/seller/public/${sellerId}`)
        return response
    },

    /**
     * Public: Search sellers
     * GET v1/seller/search
     */
    searchSellers: async (query = '') => {
        const response = await apiClient.get(`v1/seller/search${query}`)
        return response.data
    },

    /**
     * Get seller dashboard data
     * GET v1/seller/dashboard
     */
    getDashboard: async () => {
        const response = await apiClient.get('v1/seller/dashboard')
        return response.data
    },

    /**
     * Get seller products
     * GET v1/seller/products
     */
    getProducts: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        const response = await apiClient.get(`v1/seller/products${queryString ? `?${queryString}` : ''}`)
        return response.data
    },

    /**
     * Create new product
     * POST v1/seller/products
     */
    createProduct: async (data) => {
        const response = await apiClient.post('v1/seller/products', data)
        return response.data
    },

    /**
     * Update product
     * PUT v1/seller/products/:productId
     */
    updateProduct: async (productId, data) => {
        const response = await apiClient.put(`v1/seller/products/${productId}`, data)
        return response.data
    },

    /**
     * Delete product
     * DELETE v1/seller/products/:productId
     */
    deleteProduct: async (productId) => {
        const response = await apiClient.delete(`v1/seller/products/${productId}`)
        return response.data
    },

    /**
     * Get seller analytics
     * GET v1/seller/analytics
     */
    getAnalytics: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        const response = await apiClient.get(`v1/seller/analytics${queryString ? `?${queryString}` : ''}`)
        return response.data
    },

    /**
     * Get seller messages
     * GET v1/seller/messages
     */
    getMessages: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        const response = await apiClient.get(`v1/seller/messages${queryString ? `?${queryString}` : ''}`)
        return response.data
    },

    /**
     * Get seller earnings
     * GET v1/seller/earnings
     */
    getEarnings: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        const response = await apiClient.get(`v1/seller/earnings${queryString ? `?${queryString}` : ''}`)
        return response.data
    }
}

export default sellerAPI


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
        return response.data
    },

    /**
     * Get the current seller profile
     * GET v1/seller/profile
     */
    getProfile: async () => {
        const response = await apiClient.get('v1/seller/profile')
        return response.data
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
        return response.data
    },

    /**
     * Public: Search sellers
     * GET v1/seller/search
     */
    searchSellers: async (query = '') => {
        const response = await apiClient.get(`v1/seller/search${query}`)
        return response.data
    }
}

export default sellerAPI


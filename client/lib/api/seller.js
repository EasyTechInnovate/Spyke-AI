import apiClient from './client'
export const sellerAPI = {
    createProfile: async (data) => {
        const response = await apiClient.post('v1/seller/profile', data)
        return response?.data || response
    },
    getProfile: async () => {
        const response = await apiClient.get('v1/seller/profile')
        if (response && typeof response === 'object') {
            if (response.data && typeof response.data === 'object' && response.data.fullName && response.data.email) {
                return response.data
            }
            if (response.fullName && response.email) return response
        }
        return response
    },
    acceptCommissionOffer: async () => {
        const res = await apiClient.post('v1/seller/commission/accept')
        return res?.data
    },
    rejectCommissionOffer: async (reason) => {
        const res = await apiClient.post('v1/seller/commission/reject', { reason })
        return res?.data
    },
    submitCounterOffer: async ({ rate, reason }) => {
        const res = await apiClient.post('v1/seller/commission/counter-offer', {
            rate,
            reason
        })
        return res?.data
    },
    updateProfile: async (data) => {
        const response = await apiClient.put('v1/seller/profile', data)
        return response.data
    },
    submitVerification: async (payload) => {
        const response = await apiClient.post('v1/seller/verification/submit', payload)
        return response.data
    },
    updatePayoutInfo: async (payload) => {
        const response = await apiClient.put('v1/seller/payout', payload)
        return response.data
    },
    getPublicProfile: async (sellerId) => {
        const response = await apiClient.get(`v1/seller/public/${sellerId}`)
        return response
    },
    searchSellers: async (query = '') => {
        const response = await apiClient.get(`v1/seller/search${query}`)
        return response.data
    },
    getDashboard: async () => {
        const response = await apiClient.get('v1/seller/dashboard')
        return response.data
    },
    getProducts: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        const response = await apiClient.get(`v1/products/seller/my-products${queryString ? `?${queryString}` : ''}`)
        return response.data
    },
    createProduct: async (data) => {
        const response = await apiClient.post('v1/products', data)
        return response.data
    },
    updateProduct: async (productId, data) => {
        const response = await apiClient.put(`v1/products/${productId}`, data)
        return response.data
    },
    deleteProduct: async (productId) => {
        const response = await apiClient.delete(`v1/products/${productId}`)
        return response.data
    },
    submitProductForReview: async (productId) => {
        const response = await apiClient.post(`v1/products/${productId}/submit-for-review`)
        return response.data
    },
    getAnalytics: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        const response = await apiClient.get(`v1/seller/analytics${queryString ? `?${queryString}` : ''}`)
        return response.data
    },
    getMessages: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        const response = await apiClient.get(`v1/seller/messages${queryString ? `?${queryString}` : ''}`)
        return response.data
    },
    getEarnings: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        const response = await apiClient.get(`v1/seller/earnings${queryString ? `?${queryString}` : ''}`)
        return response.data
    }
}
export default sellerAPI
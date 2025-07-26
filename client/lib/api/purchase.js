import apiClient from './client'

const purchaseAPI = {
    // Get user's purchases
    getUserPurchases: async (options = {}) => {
        try {
            const { page = 1, limit = 10, type } = options
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            })
            
            if (type) {
                params.append('type', type)
            }
            
            const response = await apiClient.get(`/v1/purchase/my-purchases?${params}`)
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Get purchase by ID
    getPurchaseById: async (purchaseId) => {
        try {
            const response = await apiClient.get(`/v1/purchase/${purchaseId}`)
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Get user's purchases grouped by type
    getUserPurchasesByType: async () => {
        try {
            const response = await apiClient.get('/v1/purchase/my-purchases/by-type')
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Download purchased product
    downloadProduct: async (productId) => {
        try {
            const response = await apiClient.get(`/v1/purchase/download/${productId}`, {
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            throw error
        }
    },

    // Check if user has purchased a product
    hasPurchased: async (productId) => {
        try {
            const response = await apiClient.get(`/v1/purchase/check/${productId}`)
            return response.data
        } catch (error) {
            throw error
        }
    }
}

export default purchaseAPI
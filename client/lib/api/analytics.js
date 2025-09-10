import apiClient from './client'

const analyticsAPI = {
    // User Analytics
    user: {
        getDashboard: async () => {
            const response = await apiClient.get('v1/analytics/user/dashboard')
            return response.data
        },
        
        getPurchaseHistory: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/user/purchases${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getFavorites: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/user/favorites${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getActivity: async (period = '30d') => {
            const response = await apiClient.get(`v1/analytics/user/activity?period=${period}`)
            return response.data
        },
        
        getSpendingInsights: async () => {
            const response = await apiClient.get('v1/analytics/user/spending')
            return response.data
        }
    },

    // Seller Analytics
    seller: {
        getDashboard: async () => {
            const response = await apiClient.get('v1/analytics/seller/dashboard')
            return response.data
        },
        
        getProducts: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/seller/products${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getSales: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/seller/sales${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getRevenue: async () => {
            const response = await apiClient.get('v1/analytics/seller/revenue')
            return response.data
        },
        
        getCustomers: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/seller/customers${queryString ? `?${queryString}` : ''}`)
            return response.data
        }
    },

    // Admin Analytics
    admin: {
        getPlatform: async () => {
            const response = await apiClient.get('v1/analytics/admin/platform')
            return response.data
        },
        
        getUsers: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/admin/users${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getSellers: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/admin/sellers${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getProducts: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/admin/products${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getSales: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/admin/sales${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getPromocodes: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/admin/promocodes${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getRevenue: async () => {
            const response = await apiClient.get('v1/analytics/admin/revenue')
            return response.data
        },
        
        getUserTrends: async (period = '30d') => {
            const response = await apiClient.get(`v1/analytics/admin/user-trends?period=${period}`)
            return response.data
        },
        
        getSellerTrends: async (period = '30d') => {
            const response = await apiClient.get(`v1/analytics/admin/seller-trends?period=${period}`)
            return response.data
        },
        
        getFeedback: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString()
            const response = await apiClient.get(`v1/analytics/admin/feedback${queryString ? `?${queryString}` : ''}`)
            return response.data
        },
        
        getTraffic: async (period = '30d') => {
            const response = await apiClient.get(`v1/analytics/admin/traffic?period=${period}`)
            return response.data
        }
    }
}

export default analyticsAPI
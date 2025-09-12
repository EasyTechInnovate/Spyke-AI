import apiClient from './client'

const analyticsAPI = {
    // User Analytics
    user: {
        getDashboard: async () => {
            try {
                const response = await apiClient.get('v1/analytics/user/dashboard')
                return response.data || response
            } catch (error) {
                console.error('Error fetching user dashboard:', error)
                throw error
            }
        },
        
        getPurchaseHistory: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/user/purchases${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching purchase history:', error)
                throw error
            }
        },
        
        getFavorites: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/user/favorites${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching favorites:', error)
                throw error
            }
        },
        
        getActivity: async (period = '30d') => {
            try {
                const response = await apiClient.get(`v1/analytics/user/activity?period=${period}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching user activity:', error)
                throw error
            }
        },
        
        getSpendingInsights: async () => {
            try {
                const response = await apiClient.get('v1/analytics/user/spending')
                return response.data || response
            } catch (error) {
                console.error('Error fetching spending insights:', error)
                throw error
            }
        }
    },

    // Seller Analytics
    seller: {
        getDashboard: async () => {
            try {
                const response = await apiClient.get('v1/analytics/seller/dashboard')
                return response.data || response
            } catch (error) {
                console.error('Error fetching seller dashboard:', error)
                throw error
            }
        },
        
        getProducts: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/seller/products${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching seller products:', error)
                throw error
            }
        },
        
        getSales: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/seller/sales${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching seller sales:', error)
                throw error
            }
        },
        
        getRevenue: async () => {
            try {
                const response = await apiClient.get('v1/analytics/seller/revenue')
                return response.data || response
            } catch (error) {
                console.error('Error fetching seller revenue:', error)
                throw error
            }
        },
        
        getCustomers: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/seller/customers${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching seller customers:', error)
                throw error
            }
        }
    },

    // Admin Analytics
    admin: {
        getPlatform: async () => {
            try {
                const response = await apiClient.get('v1/analytics/admin/platform')
                return response.data || response
            } catch (error) {
                console.error('Error fetching platform analytics:', error)
                throw error
            }
        },
        
        getUsers: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/admin/users${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching user analytics:', error)
                throw error
            }
        },
        
        getSellers: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/admin/sellers${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching seller analytics:', error)
                throw error
            }
        },
        
        getProducts: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/admin/products${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching product analytics:', error)
                throw error
            }
        },
        
        getSales: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/admin/sales${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching sales analytics:', error)
                // Return empty structure to prevent crashes
                return {
                    sales: [],
                    summary: {
                        totalRevenue: 0,
                        totalSales: 0,
                        avgOrderValue: 0,
                        totalItems: 0
                    },
                    dailySales: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalCount: 0,
                        hasNextPage: false,
                        hasPrevPage: false
                    }
                }
            }
        },
        
        getPromocodes: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/admin/promocodes${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching promocode analytics:', error)
                throw error
            }
        },
        
        getRevenue: async () => {
            try {
                const response = await apiClient.get('v1/analytics/admin/revenue')
                return response.data || response
            } catch (error) {
                console.error('Error fetching revenue analytics:', error)
                throw error
            }
        },
        
        getUserTrends: async (period = '30d') => {
            try {
                const response = await apiClient.get(`v1/analytics/admin/user-trends?period=${period}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching user trends:', error)
                throw error
            }
        },
        
        getSellerTrends: async (period = '30d') => {
            try {
                const response = await apiClient.get(`v1/analytics/admin/seller-trends?period=${period}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching seller trends:', error)
                throw error
            }
        },
        
        getFeedback: async (params = {}) => {
            try {
                const queryString = new URLSearchParams(params).toString()
                const response = await apiClient.get(`v1/analytics/admin/feedback${queryString ? `?${queryString}` : ''}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching feedback analytics:', error)
                throw error
            }
        },
        
        getTraffic: async (period = '30d') => {
            try {
                const response = await apiClient.get(`v1/analytics/admin/traffic?period=${period}`)
                return response.data || response
            } catch (error) {
                console.error('Error fetching traffic analytics:', error)
                throw error
            }
        }
    }
}

export default analyticsAPI
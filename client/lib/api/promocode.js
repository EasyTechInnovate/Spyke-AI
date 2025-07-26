import apiClient from './client'

const promocodeAPI = {
    // Get public promocodes (for users)
    getPublicPromocodes: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams()
            
            // Add pagination
            if (params.page) queryParams.append('page', params.page)
            if (params.limit) queryParams.append('limit', params.limit)
            if (params.status) queryParams.append('status', params.status)
            
            const queryString = queryParams.toString()
            const endpoint = queryString ? `v1/promocode/public?${queryString}` : 'v1/promocode/public'
            
            const response = await apiClient.get(endpoint)
            return response.data || response
        } catch (error) {
            throw error
        }
    },

    // Create new promocode (seller/admin only)
    createPromocode: async (promocodeData) => {
        try {
            const response = await apiClient.post('v1/promocode', promocodeData)
            return response.data || response
        } catch (error) {
            throw error
        }
    },

    // Get all promocodes (seller/admin only)
    getPromocodes: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams()
            
            // Add filters - backend expects isActive not status
            if (params.page) queryParams.append('page', params.page)
            if (params.limit) queryParams.append('limit', params.limit)
            if (params.status === 'active') queryParams.append('isActive', 'true')
            if (params.status === 'inactive') queryParams.append('isActive', 'false')
            if (params.createdByType) queryParams.append('createdByType', params.createdByType)
            
            const queryString = queryParams.toString()
            const endpoint = queryString ? `v1/promocode?${queryString}` : 'v1/promocode'
            
            const response = await apiClient.get(endpoint)
            return response.data || response
        } catch (error) {
            throw error
        }
    },

    // Get promocode by ID (seller/admin only)
    getPromocodeById: async (promocodeId) => {
        try {
            const response = await apiClient.get(`v1/promocode/${promocodeId}`)
            return response.data || response
        } catch (error) {
            throw error
        }
    },

    // Update promocode (seller/admin only)
    updatePromocode: async (promocodeId, promocodeData) => {
        try {
            const response = await apiClient.put(`v1/promocode/${promocodeId}`, promocodeData)
            return response.data || response
        } catch (error) {
            throw error
        }
    },

    // Delete promocode (seller/admin only)
    deletePromocode: async (promocodeId) => {
        try {
            const response = await apiClient.delete(`v1/promocode/${promocodeId}`)
            return response.data || response
        } catch (error) {
            throw error
        }
    },

    // Toggle promocode status (seller/admin only)
    togglePromocodeStatus: async (promocodeId) => {
        try {
            const response = await apiClient.post(`v1/promocode/${promocodeId}/toggle-status`)
            return response.data || response
        } catch (error) {
            throw error
        }
    },

    // Validate promocode (already exists in cartAPI, but adding here for completeness)
    validatePromocode: async (code) => {
        try {
            const response = await apiClient.get(`v1/promocode/validate/${code}`)
            return response.data || response
        } catch (error) {
            throw error
        }
    },

    // Get promocode usage statistics (seller/admin only)
    getPromocodeStats: async (promocodeId) => {
        try {
            const response = await apiClient.get(`v1/promocode/${promocodeId}/stats`)
            return response.data || response
        } catch (error) {
            throw error
        }
    },

    // Helper function to format discount display
    formatDiscount: (promocode) => {
        if (promocode.discountType === 'percentage') {
            return `${promocode.discountValue}%`
        } else {
            return `$${promocode.discountValue}`
        }
    },

    // Helper function to check if promocode is valid
    isPromocodeValid: (promocode) => {
        const now = new Date()
        const startDate = promocode.validFrom ? new Date(promocode.validFrom) : null
        const endDate = promocode.validUntil ? new Date(promocode.validUntil) : null
        
        if (startDate && now < startDate) return false
        if (endDate && now > endDate) return false
        if (!promocode.isActive) return false
        if (promocode.usageLimit && promocode.currentUsageCount >= promocode.usageLimit) return false
        
        return true
    }
}

export default promocodeAPI
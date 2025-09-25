import apiClient from './client'

const categoriesAPI = {
    // Get all product categories
    async getProductCategories() {
        try {
            const response = await apiClient.get('/v1/products/categories')
            return response.data || response
        } catch (error) {
            console.error('Error fetching product categories:', error)
            throw error
        }
    },

    // Get category counts (for filter sidebar)
    async getCategoryCounts(filters = {}) {
        try {
            const queryParams = new URLSearchParams()
            
            // Add filter parameters that don't affect category counts
            Object.entries(filters).forEach(([key, value]) => {
                if (key !== 'category' && value !== undefined && value !== null && value !== '' && value !== 'all') {
                    queryParams.append(key, value)
                }
            })
            
            const queryString = queryParams.toString()
            const endpoint = queryString ? `/v1/products/categories/counts?${queryString}` : '/v1/products/categories/counts'
            
            const response = await apiClient.get(endpoint)
            return response.data || response
        } catch (error) {
            console.error('Error fetching category counts:', error)
            throw error
        }
    }
}

export default categoriesAPI
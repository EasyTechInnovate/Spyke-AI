import apiClient from './client'

class ProductsAPI {
    // Get all products with filters
    async getProducts(params = {}) {
        const queryParams = new URLSearchParams()
        
        // Add all filter parameters
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                queryParams.append(key, value)
            }
        })
        
        const queryString = queryParams.toString()
        const endpoint = queryString ? `v1/products?${queryString}` : 'v1/products'
        
        return apiClient.get(endpoint)
    }
    
    // Get single product by slug
    async getProductBySlug(slug) {
        return apiClient.get(`v1/products/${slug}`)
    }
    
    async getProduct(productIdOrSlug) {
        return apiClient.get(`v1/products/${productIdOrSlug}`)
    }
    
    // Get related products
    async getRelatedProducts(productId, limit = 6) {
        return apiClient.get(`v1/products/${productId}/related?limit=${limit}`)
    }
    
    // Create new product (seller/admin only)
    async createProduct(productData) {
        return apiClient.post('v1/products', productData)
    }
    
    // Update product (seller/admin only)
    async updateProduct(productId, productData) {
        return apiClient.put(`v1/products/${productId}`, productData)
    }
    
    // Delete product (seller/admin only)
    async deleteProduct(productId) {
        return apiClient.delete(`v1/products/${productId}`)
    }
    
    // Add review to product
    async addReview(productId, reviewData) {
        return apiClient.post(`v1/products/${productId}/review`, reviewData)
    }
    
    // Toggle favorite
    async toggleFavorite(productId, isFavorited) {
        return apiClient.post(`v1/products/${productId}/favorite`, { isFavorited })
    }
    
    // Toggle upvote
    async toggleUpvote(productId, requestBody) {
        return apiClient.post(`v1/products/${productId}/upvote`, requestBody)
    }
    
    // Publish product (seller/admin only)
    async publishProduct(productId) {
        return apiClient.post(`v1/products/${productId}/publish`)
    }
    
    // Get seller's products
    async getMyProducts(params = {}) {
        const queryParams = new URLSearchParams()
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value)
            }
        })
        
        const queryString = queryParams.toString()
        const endpoint = queryString ? `v1/products/seller/my-products?${queryString}` : 'v1/products/seller/my-products'
        
        return apiClient.get(endpoint)
    }
    
    // Admin endpoints
    async getAllProductsAdmin(params = {}) {
        const queryParams = new URLSearchParams()
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value)
            }
        })
        
        const queryString = queryParams.toString()
        const endpoint = queryString ? `v1/products/admin/all?${queryString}` : 'v1/products/admin/all'
        
        return apiClient.get(endpoint)
    }
    
    // Verify product (admin only)
    async verifyProduct(productId, verificationData) {
        return apiClient.patch(`v1/products/${productId}/verify`, verificationData)
    }
}

// Create singleton instance
const productsAPI = new ProductsAPI()

export default productsAPI
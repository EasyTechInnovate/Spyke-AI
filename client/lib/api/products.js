import apiClient from './client'

// Normalize helpers to keep frontend shape consistent
const normalizeSeller = (seller) => {
    if (!seller || typeof seller !== 'object') return seller
    const avatar = seller.avatar || seller.profileImage || seller.photoUrl || seller.image || null
    return { ...seller, avatar, profileImage: seller.profileImage || avatar }
}
const normalizeProduct = (product) => {
    if (!product || typeof product !== 'object') return product
    const normalized = { ...product }
    if (normalized.sellerId && typeof normalized.sellerId === 'object') {
        normalized.sellerId = normalizeSeller(normalized.sellerId)
    }
    return normalized
}

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
        const res = await apiClient.get(endpoint)
        if (res?.data?.products) {
            res.data.products = res.data.products.map(normalizeProduct)
        }
        return res
    }
    
    // Get single product by slug
    async getProductBySlug(slug) {
        const res = await apiClient.get(`v1/products/${slug}`)
        if (res?.data) {
            res.data = normalizeProduct(res.data)
        }
        return res
    }
    
    // Get single product by ID
    async getProductById(id) {
        const res = await apiClient.get(`v1/products/${id}`)
        if (res?.data) {
            res.data = normalizeProduct(res.data)
        }
        return res
    }
    
    async getProduct(productIdOrSlug) {
        const res = await apiClient.get(`v1/products/${productIdOrSlug}`)
        if (res?.data) {
            res.data = normalizeProduct(res.data)
        }
        return res
    }
    
    // Get related products
    async getRelatedProducts(productId, limit = 6) {
        const res = await apiClient.get(`v1/products/${productId}/related?limit=${limit}`)
        if (Array.isArray(res?.data)) {
            res.data = res.data.map(normalizeProduct)
        }
        return res
    }
    
    // Create new product (seller/admin only)
    async createProduct(productData) {
        return apiClient.post('v1/products', productData)
    }
    
    // Update product (seller/admin only)
    async updateProduct(productId, productData) {
        const res = await apiClient.put(`v1/products/${productId}`, productData)
        if (res?.data) {
            res.data = normalizeProduct(res.data)
        }
        return res
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
        const res = await apiClient.get(endpoint)
        if (res?.data?.products) {
            res.data.products = res.data.products.map(normalizeProduct)
        }
        return res
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
        const res = await apiClient.get(endpoint)
        if (res?.data?.products) {
            res.data.products = res.data.products.map(normalizeProduct)
        }
        return res
    }
    
    // Verify product (admin only)
    async verifyProduct(productId, verificationData) {
        return apiClient.post(`v1/products/${productId}/verify`, verificationData)
    }

    // Get filter counts for the explore page
    async getFilterCounts(params = {}) {
        const queryParams = new URLSearchParams()
        
        // Add filter parameters that don't affect the counts we're fetching
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                queryParams.append(key, value)
            }
        })
        
        const queryString = queryParams.toString()
        const endpoint = queryString ? `v1/products/filter-counts?${queryString}` : 'v1/products/filter-counts'
        
        return apiClient.get(endpoint)
    }

    async getTrendingProducts(params = {}) {
        const queryParams = new URLSearchParams()
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                queryParams.append(key, value)
            }
        })
        
        const queryString = queryParams.toString()
        const endpoint = queryString ? `v1/products/trending?${queryString}` : 'v1/products/trending'
        const res = await apiClient.get(endpoint)
        if (Array.isArray(res?.data)) {
            res.data = res.data.map(normalizeProduct)
        }
        return res
    }

    async getProductDiscovery() {
        const res = await apiClient.get('v1/products/discovery')
        if (res?.data) {
            const d = res.data
            ;['featured','trending','highRated','recentlyAdded'].forEach((k)=>{
                if (Array.isArray(d?.[k])) d[k] = d[k].map(normalizeProduct)
            })
        }
        return res
    }

    async getAdminFeaturedList(params = {}) {
        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value)
            }
        })
        const qs = queryParams.toString()
        const endpoint = qs ? `v1/products/admin/featured-list?${qs}` : 'v1/products/admin/featured-list'
        return apiClient.get(endpoint)
    }

    async setProductFeatured(productId, body = {}) {
        return apiClient.put(`v1/products/${productId}/featured`, body)
    }

    async getFeaturedSuggestions(params = {}) {
        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value)
            }
        })
        const qs = queryParams.toString()
        const endpoint = qs ? `v1/products/admin/featured-suggestions?${qs}` : 'v1/products/admin/featured-suggestions'
        return apiClient.get(endpoint)
    }

    async getFeaturedHybrid(params = {}) {
        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                queryParams.append(key, value)
            }
        })
        const qs = queryParams.toString()
        const endpoint = qs ? `v1/products/featured-hybrid?${qs}` : 'v1/products/featured-hybrid'
        const res = await apiClient.get(endpoint)
        if (res?.data) {
            const d = res.data
            ;['featured','trending','highRated','recentlyAdded'].forEach((k)=>{
                if (Array.isArray(d?.[k])) d[k] = d[k].map(normalizeProduct)
            })
        }
        return res
    }
}

const productsAPI = new ProductsAPI()

export default productsAPI
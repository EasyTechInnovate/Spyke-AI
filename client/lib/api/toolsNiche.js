import apiClient from './client'

class CategoryAPI {
    async getCategories(params = {}) {
        const queryParams = new URLSearchParams()
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value)
            }
        })
        
        const queryString = queryParams.toString()
        const endpoint = queryString ? `v1/categories?${queryString}` : 'v1/categories'
        
        return apiClient.get(endpoint)
    }
    
    async createCategory(categoryData) {
        return apiClient.post('v1/categories', categoryData)
    }
    
    async updateCategory(categoryId, categoryData) {
        return apiClient.put(`v1/categories/${categoryId}`, categoryData)
    }
    
    async deleteCategory(categoryId) {
        return apiClient.delete(`v1/categories/${categoryId}`)
    }
    
    async getCategory(categoryId) {
        return apiClient.get(`v1/categories/${categoryId}`)
    }
    
    async getCategoryStats() {
        return apiClient.get('v1/categories/stats')
    }
}

class IndustryAPI {
    async getIndustries(params = {}) {
        const queryParams = new URLSearchParams()
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value)
            }
        })
        
        const queryString = queryParams.toString()
        const endpoint = queryString ? `v1/industries?${queryString}` : 'v1/industries'
        
        return apiClient.get(endpoint)
    }
    
    async createIndustry(industryData) {
        return apiClient.post('v1/industries', industryData)
    }
    
    async updateIndustry(industryId, industryData) {
        return apiClient.put(`v1/industries/${industryId}`, industryData)
    }
    
    async deleteIndustry(industryId) {
        return apiClient.delete(`v1/industries/${industryId}`)
    }
    
    async getIndustry(industryId) {
        return apiClient.get(`v1/industries/${industryId}`)
    }
    
    async getIndustryStats() {
        return apiClient.get('v1/industries/stats')
    }
}

const categoryAPI = new CategoryAPI()
const industryAPI = new IndustryAPI()

export { categoryAPI, industryAPI }
export default { category: categoryAPI, industry: industryAPI }
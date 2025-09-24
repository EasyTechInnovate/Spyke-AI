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

class ToolAPI {
    async getTools(params = {}) {
        const queryParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value)
            }
        })

        const queryString = queryParams.toString()
        const endpoint = queryString ? `v1/tools?${queryString}` : 'v1/tools'

        return apiClient.get(endpoint)
    }

    async createTool(toolData) {
        return apiClient.post('v1/tools', toolData)
    }

    async updateTool(toolId, toolData) {
        return apiClient.put(`v1/tools/${toolId}`, toolData)
    }

    async deleteTool(toolId) {
        return apiClient.delete(`v1/tools/${toolId}`)
    }

    async getTool(toolId) {
        return apiClient.get(`v1/tools/${toolId}`)
    }

    async getToolsAnalytics() {
        return apiClient.get('v1/tools/admin/analytics')
    }
}

const categoryAPI = new CategoryAPI()
const industryAPI = new IndustryAPI()
const toolAPI = new ToolAPI()

const toolsNicheAPI = { category: categoryAPI, industry: industryAPI, tool: toolAPI }

export { categoryAPI, industryAPI, toolAPI }
export default toolsNicheAPI

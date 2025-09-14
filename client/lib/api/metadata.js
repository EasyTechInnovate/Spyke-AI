import apiClient from './client'

class MetadataAPI {
    async getCategories() {
        return apiClient.get('v1/categories')
    }

    async getIndustries() {
        return apiClient.get('v1/industries')
    }

    async getCategoriesWithCounts() {
        return apiClient.get('v1/categories?includeCounts=true')
    }

    async getIndustriesWithCounts() {
        return apiClient.get('v1/industries?includeCounts=true')
    }

    async getBasicMetadata() {
        const [categories, industries] = await Promise.all([
            this.getCategories(),
            this.getIndustries()
        ])
        return { categories, industries }
    }
}

const metadataAPI = new MetadataAPI()
export default metadataAPI

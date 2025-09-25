import CategoriesGrid from '@/components/features/explore/CategoriesGrid'
import { categoryAPI } from '@/lib/api/toolsNiche'
import productsAPI from '@/lib/api/products'
export default async function CategoriesPage() {
    let productCategories = []
    try {
        const response = await categoryAPI.getCategories()
        let categoriesData = response?.data?.categories || response?.categories || response?.data || []
        if (!Array.isArray(categoriesData)) {
            categoriesData = []
        }
        if (categoriesData.length > 0) {
            productCategories = await Promise.all(
                categoriesData
                    .filter((cat) => cat.isActive !== false) 
                    .map(async (category) => {
                        let postCount = 0
                        try {
                            const productsResponse = await productsAPI.getProducts({
                                category: category._id || category.id,
                                page: 1,
                                limit: 1
                            })
                            const productsData = productsResponse?.data || productsResponse
                            postCount =
                                productsData?.pagination?.totalItems ||
                                productsData?.pagination?.total ||
                                productsData?.totalItems ||
                                productsData?.total ||
                                0
                        } catch (error) {
                            console.error(`Error fetching product count for category ${category.name}:`, error)
                        }
                        return {
                            _id: category._id || category.id,
                            title: category.name || category.title,
                            slug: { current: category._id || category.id },
                            description: `Discover ${(category.name || category.title).toLowerCase()} products and solutions`,
                            color: '#00FF89',
                            postCount,
                            iconName: category.icon || 'Package'
                        }
                    })
            )
        }
    } catch (error) {
        console.error('Error fetching categories from API:', error)
    }
    return (
        <div className="min-h-screen bg-[#121212]">
            <CategoriesGrid blogCategories={productCategories} />
        </div>
    )
}
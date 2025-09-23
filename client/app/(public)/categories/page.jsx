import CategoriesGrid from '@/components/features/explore/CategoriesGrid'
import { PRODUCT_CATEGORIES } from '@/lib/constants/filterMappings'
export default async function CategoriesPage() {
  const productCategories = PRODUCT_CATEGORIES.map((category, index) => ({
    _id: category.id,
    title: category.name,
    slug: { current: category.id },
    description: `Discover ${category.name.toLowerCase()} products and solutions`,
    color: '#00FF89', 
    postCount: Math.floor(Math.random() * 50) + 10, 
    iconName: category.iconName 
  }))
  return (
    <div className="min-h-screen bg-[#121212]">
      <CategoriesGrid blogCategories={productCategories} />
    </div>
  )
}
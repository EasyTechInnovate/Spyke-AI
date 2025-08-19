import CategoriesGrid from '@/components/features/explore/CategoriesGrid'
import { client } from '@/sanity/lib/client'

export default async function CategoriesPage() {
  // GROQ query same as existing API route
  const query = `*[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color,
    "postCount": count(*[_type == "blogPost" && references(^._id) && status == "published"])
  }`

  let blogCategories = []
  try {
    blogCategories = await client.fetch(query)
  } catch (err) {
    console.error('Failed to load blog categories for categories page', err)
    blogCategories = []
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <CategoriesGrid blogCategories={blogCategories} />
    </div>
  )
}

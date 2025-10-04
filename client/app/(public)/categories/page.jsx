'use client'
import { useEffect, useState } from 'react'
import CategoriesGrid from '@/components/features/explore/CategoriesGrid'
import { categoryAPI } from '@/lib/api/toolsNiche'
import productsAPI from '@/lib/api/products'

const isLikelyObjectId = (val) => typeof val === 'string' && /^[a-f0-9]{24}$/i.test(val)
const slugify = (val = '') =>
    val
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

export default function CategoriesPage() {
    const [productCategories, setProductCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const response = await categoryAPI.getCategories()
                let categoriesData = response?.data?.categories || response?.categories || response?.data || []
                if (!Array.isArray(categoriesData)) {
                    categoriesData = []
                }
                if (categoriesData.length > 0) {
                    const result = await Promise.all(
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

                                let rawName = category.name || category.title || ''
                                if (isLikelyObjectId(rawName)) rawName = '' 
                                const displayName = rawName || 'Unnamed Category'
                                const derivedSlug = slugify(rawName)
                                const safeSlug = derivedSlug || (category._id || category.id || '')

                                return {
                                    _id: category._id || category.id, 
                                    title: displayName, 
                                    slug: { current: safeSlug },
                                    description: `Discover ${displayName.toLowerCase()} products and solutions`,
                                    color: '#00FF89',
                                    postCount,
                                    iconName: category.icon || 'Package'
                                }
                            })
                    )
                    if (!cancelled) setProductCategories(result)
                } else {
                    if (!cancelled) setProductCategories([])
                }
            } catch (error) {
                console.error('Error fetching categories from API:', error)
                if (!cancelled) setError('Failed to load categories')
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [])

    if (loading) {
        return <div className="min-h-screen bg-[#121212]" />
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            <CategoriesGrid blogCategories={productCategories} />
        </div>
    )
}


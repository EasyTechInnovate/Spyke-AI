// Create enhanced seller profile hook
'use client'

import { useState, useEffect, useCallback } from 'react'
import { sellerAPI, productsAPI } from '@/lib/api'

export function useEnhancedSellerProfile(sellerId) {
    const [seller, setSeller] = useState(null)
    const [products, setProducts] = useState([])
    const [reviews, setReviews] = useState([])
    const [similarSellers, setSimilarSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [productFilters, setProductFilters] = useState({
        category: 'all',
        priceRange: 'all',
        sortBy: 'newest'
    })
    const [productPage, setProductPage] = useState(1)
    const [productLimit, setProductLimit] = useState(9) // default page size for public profile
    const [productPagination, setProductPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 9,
        hasNextPage: false,
        hasPreviousPage: false
    })

    const loadSellerData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch only seller profile here
            const sellerResponse = await sellerAPI.getPublicProfile(sellerId)
            const sellerData = sellerResponse?.data || sellerResponse
            if (!sellerData?.id) throw new Error('Seller not found')

            const transformedSeller = {
                ...sellerData,
                id: sellerData.id,
                trustScore: calculateTrustScore(sellerData),
                sellerLevel: getSellerLevel(sellerData.stats?.totalSales || 0),
                locationText: sellerData.location?.country || (typeof sellerData.location === 'string' ? sellerData.location : ''),
                locationObj: sellerData.location || null,
                isOnline: Math.random() > 0.5, // TODO: Implement real online status
                responseRate: sellerData.stats?.responseRate || '95%',
                avgResponseTime: sellerData.stats?.avgResponseTime || '< 2h',
                joinedDate: new Date(sellerData.memberSince).getFullYear(),
                specialties: [...(sellerData.niches || []), ...(sellerData.toolsSpecialization || [])],
                metrics: {
                    totalProducts: sellerData.stats?.totalProducts || 0,
                    totalSales: sellerData.stats?.totalSales || 0,
                    avgRating: sellerData.stats?.averageRating || 0,
                    totalReviews: sellerData.stats?.totalReviews || 0,
                    profileViews: sellerData.stats?.profileViews || 0
                }
            }

            setSeller(transformedSeller)
        } catch (error) {
            setError(error.message || 'Failed to load seller profile')
        } finally {
            setLoading(false)
        }
    }, [sellerId])

    const loadProducts = useCallback(async (page = productPage) => {
        try {
            setLoading(true)
            setError(null)

            const productsResponse = await productsAPI.getProducts({
                sellerId,
                status: 'published',
                page,
                limit: productLimit
            })

            const data = productsResponse?.data || productsResponse
            const productsData = Array.isArray(data?.products) ? data.products : []
            setProducts(productsData)

            if (data?.pagination) {
                setProductPagination(data.pagination)
            } else {
                setProductPagination(prev => ({
                    ...prev,
                    currentPage: page,
                    totalItems: productsData.length,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false
                }))
            }
        } catch (error) {
            setError(error.message || 'Failed to load products')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [sellerId, productPage, productLimit])

    const loadSimilarSellers = async (primaryNiche) => {
        try {
            if (!primaryNiche) return

            const response = await sellerAPI.searchSellers(`?niche=${primaryNiche}&limit=4`)
            const sellers = response?.sellers || []
            setSimilarSellers(sellers.filter((s) => s.id !== sellerId))
        } catch (error) {
            console.warn('Failed to load similar sellers:', error)
        }
    }

    const updateProductFilters = (newFilters) => {
        setProductFilters((prev) => ({ ...prev, ...newFilters }))
    }

    const filteredProducts = products
        .filter((product) => {
            if (productFilters.category !== 'all' && product.category !== productFilters.category) {
                return false
            }
            // Add more filter logic here
            return true
        })
        .sort((a, b) => {
            switch (productFilters.sortBy) {
                case 'price-low':
                    return (a.price || 0) - (b.price || 0)
                case 'price-high':
                    return (b.price || 0) - (a.price || 0)
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0)
                case 'newest':
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            }
        })

    useEffect(() => {
        if (sellerId) {
            loadSellerData()
        }
    }, [sellerId, loadSellerData])

    useEffect(() => {
        if (sellerId) {
            loadProducts(productPage)
        }
    }, [sellerId, productPage, productLimit, loadProducts])

    return {
        seller,
        products: filteredProducts,
        reviews,
        similarSellers,
        loading,
        error,
        productFilters,
        updateProductFilters,
        refetch: () => {
            loadSellerData()
            loadProducts(productPage)
        },
        // pagination exports
        pagination: productPagination,
        productPage,
        setProductPage,
        setProductLimit
    }
}

// Helper functions
function calculateTrustScore(seller) {
    const factors = {
        isVerified: seller.isVerified ? 25 : 0,
        hasReviews: (seller.stats?.totalReviews || 0) > 0 ? 20 : 0,
        hasWebsite: seller.websiteUrl ? 15 : 0,
        hasPortfolio: (seller.portfolioLinks?.length || 0) > 0 ? 15 : 0,
        salesVolume: Math.min((seller.stats?.totalSales || 0) * 2, 25)
    }

    return Object.values(factors).reduce((sum, score) => sum + score, 0)
}

function getSellerLevel(totalSales) {
    // Return serializable shape: { level, color, iconName }
    if (totalSales >= 1000) return { level: 'Diamond', color: 'text-purple-400', iconName: 'Trophy' }
    if (totalSales >= 500) return { level: 'Gold', color: 'text-yellow-400', iconName: 'Award' }
    if (totalSales >= 100) return { level: 'Silver', color: 'text-gray-300', iconName: 'Award' }
    return { level: 'Bronze', color: 'text-orange-400', iconName: 'Shield' }
}


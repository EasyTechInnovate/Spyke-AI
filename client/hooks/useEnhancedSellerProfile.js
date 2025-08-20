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

    const loadSellerData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Parallel data loading for better performance
            const [sellerResponse, productsResponse] = await Promise.all([
                sellerAPI.getPublicProfile(sellerId),
                productsAPI.getProducts({
                    sellerId,
                    status: 'published',
                    limit: 50
                })
            ])

            // minimal debug: don't log raw API objects to avoid noisy, non-serializable output

            const sellerData = sellerResponse?.data || sellerResponse
            if (!sellerData?.id) throw new Error('Seller not found')

            // Derive totalSales: prefer sellerData.stats.totalSales, otherwise sum sales from productsResponse
            const productsData = productsResponse?.data?.products || productsResponse?.products || []
            const derivedTotalSales = (() => {
                const fromStats = sellerData.stats?.totalSales
                if (typeof fromStats === 'number' && !isNaN(fromStats)) return fromStats
                const sum = productsData.reduce((acc, p) => acc + (p.sales || 0), 0)
                return sum
            })()

            const transformedSeller = {
                ...sellerData,
                id: sellerData.id,
                trustScore: calculateTrustScore(sellerData),
                sellerLevel: getSellerLevel(derivedTotalSales),
                locationText: sellerData.location?.country || (typeof sellerData.location === 'string' ? sellerData.location : ''),
                locationObj: sellerData.location || null,
                isOnline: Math.random() > 0.5, // TODO: Implement real online status
                responseRate: sellerData.stats?.responseRate || '95%',
                avgResponseTime: sellerData.stats?.avgResponseTime || '< 2h',
                joinedDate: new Date(sellerData.memberSince).getFullYear(),
                specialties: [...(sellerData.niches || []), ...(sellerData.toolsSpecialization || [])],
                metrics: {
                    totalProducts: sellerData.stats?.totalProducts || 0,
                    totalSales: derivedTotalSales || 0,
                    avgRating: sellerData.stats?.averageRating || 0,
                    totalReviews: sellerData.stats?.totalReviews || 0,
                    profileViews: sellerData.stats?.profileViews || 0
                }
            }

            setSeller(transformedSeller)
            setProducts(productsData)

            // Load similar sellers based on niches
            loadSimilarSellers(transformedSeller.niches?.[0])
        } catch (error) {
            setError(error.message || 'Failed to load seller profile')
        } finally {
            setLoading(false)
        }
    }, [sellerId])

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

    return {
        seller,
        products: filteredProducts,
        reviews,
        similarSellers,
        loading,
        error,
        productFilters,
        updateProductFilters,
        refetch: loadSellerData
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


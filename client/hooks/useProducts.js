'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'

// SWR fetcher function
const fetcher = async (key) => {
    const [endpoint, params] = Array.isArray(key) ? key : [key, {}]
    const response = await productsAPI.getProducts(params)
    return response.data
}

// Hook for fetching products with filters
export function useProducts(initialFilters = {}) {
    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...initialFilters
    })

    const { data, error, isLoading, mutate } = useSWR(
        ['products', filters],
        () => fetcher(['products', filters]),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 10000, // 10 seconds
            errorRetryInterval: 5000,
            errorRetryCount: 3
        }
    )

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
    }, [])

    const changePage = useCallback((page) => {
        setFilters(prev => ({ ...prev, page }))
    }, [])

    const refreshProducts = useCallback(() => {
        mutate()
    }, [mutate])

    return {
        products: data?.products || [],
        loading: isLoading,
        error: error?.message || null,
        pagination: data?.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 12,
            hasNextPage: false,
            hasPreviousPage: false
        },
        filters,
        updateFilters,
        changePage,
        refreshProducts
    }
}

// Hook for fetching a single product
export function useProduct(slug) {
    const { data, error, isLoading } = useSWR(
        slug ? `/products/${slug}` : null,
        () => productsAPI.getProductBySlug(slug),
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000, // 30 seconds
            errorRetryInterval: 5000,
            errorRetryCount: 3
        }
    )

    return {
        product: data?.data || null,
        loading: isLoading,
        error: error?.message || null
    }
}

// Hook for related products
export function useRelatedProducts(productId, limit = 6) {
    const { data, error, isLoading } = useSWR(
        productId ? [`/products/${productId}/related`, limit] : null,
        () => productsAPI.getRelatedProducts(productId, limit),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 minute
            errorRetryInterval: 5000,
            errorRetryCount: 2
        }
    )

    return {
        products: data?.data || [],
        loading: isLoading,
        error: error?.message || null
    }
}

// Hook for product actions (favorite, upvote, review)
export function useProductActions() {
    const [loading, setLoading] = useState(false)

    const toggleFavorite = async (productId, isFavorited) => {
        try {
            setLoading(true)
            await productsAPI.toggleFavorite(productId, isFavorited)
            toast.success(isFavorited ? 'Added to favorites' : 'Removed from favorites')
            return true
        } catch (err) {
            console.error('Error toggling favorite:', err)
            toast.error('Failed to update favorite status')
            return false
        } finally {
            setLoading(false)
        }
    }

    const toggleUpvote = async (productId, isUpvoted) => {
        try {
            setLoading(true)
            await productsAPI.toggleUpvote(productId, isUpvoted)
            toast.success(isUpvoted ? 'Upvoted' : 'Removed upvote')
            return true
        } catch (err) {
            console.error('Error toggling upvote:', err)
            toast.error('Failed to update upvote')
            return false
        } finally {
            setLoading(false)
        }
    }

    const addReview = async (productId, reviewData) => {
        try {
            setLoading(true)
            await productsAPI.addReview(productId, reviewData)
            toast.success('Review added successfully')
            return true
        } catch (err) {
            console.error('Error adding review:', err)
            toast.error(err.message || 'Failed to add review')
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        toggleFavorite,
        toggleUpvote,
        addReview
    }
}
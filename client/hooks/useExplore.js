import { useState, useMemo } from 'react'
import { DEFAULT_FILTERS } from '@/data/explore/constants'

export function useExplore(products) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === filters.category)
    }

    // Price filter
    filtered = filtered.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.rating)
    }

    // Verified seller filter
    if (filters.verified) {
      filtered = filtered.filter(p => p.seller.verified)
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'popular':
        filtered.sort((a, b) => b.sales - a.sales)
        break
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return filtered
  }, [products, filters, sortBy])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setCurrentPage(1)
  }

  return {
    // State
    filters,
    sortBy,
    viewMode,
    showFilters,
    showMobileFilters,
    currentPage,
    filteredProducts,
    
    // Setters
    setFilters: handleFilterChange,
    setSortBy,
    setViewMode,
    setShowFilters,
    setShowMobileFilters,
    setCurrentPage,
    
    // Handlers
    handleSearch,
    clearFilters
  }
}
'use client'

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import adminAPI from '@/lib/api/admin'
import analyticsAPI from '@/lib/api/analytics'

// Action types
const ADMIN_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_COUNTS: 'SET_COUNTS',
  SET_ERROR: 'SET_ERROR',
  SET_OVERVIEW: 'SET_OVERVIEW',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Initial state
const initialState = {
  loading: {
    counts: true,
    overview: false
  },
  counts: {
    sellers: { pending: 0, active: 0, payouts: 0 },
    products: { pending: 0, flagged: 0, featured: 0 }
  },
  overview: null,
  currentPage: null,
  error: null,
  lastFetch: null
}

// Reducer function
function adminReducer(state, action) {
  switch (action.type) {
    case ADMIN_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, ...action.payload }
      }
    
    case ADMIN_ACTIONS.SET_COUNTS:
      return {
        ...state,
        counts: action.payload,
        loading: { ...state.loading, counts: false },
        lastFetch: Date.now()
      }
    
    case ADMIN_ACTIONS.SET_OVERVIEW:
      return {
        ...state,
        overview: action.payload,
        loading: { ...state.loading, overview: false }
      }
    
    case ADMIN_ACTIONS.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload
      }
    
    case ADMIN_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: { counts: false, overview: false }
      }
    
    case ADMIN_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Context
const AdminContext = createContext(null)

// Helper function to determine page type and data needs
const getPageConfig = (pathname) => {
  if (!pathname) return { type: 'unknown', needsCounts: false, needsOverview: false }
  
  if (pathname.includes('/admin/analytics')) {
    return { type: 'analytics', needsCounts: false, needsOverview: false }
  }
  
  if (pathname.includes('/admin/dashboard')) {
    return { type: 'dashboard', needsCounts: true, needsOverview: true }
  }
  
  return { type: 'management', needsCounts: true, needsOverview: false }
}

// Helper to extract total from API responses
const getTotal = (res) => res?.meta?.total ?? res?.pagination?.total ?? res?.total ?? res?.data?.total ?? 0

// Provider component
export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState)
  const pathname = usePathname()
  
  // Page configuration based on current route
  const pageConfig = useMemo(() => getPageConfig(pathname), [pathname])
  
  // Update current page when pathname changes
  useEffect(() => {
    dispatch({ type: ADMIN_ACTIONS.SET_CURRENT_PAGE, payload: pageConfig })
  }, [pageConfig])

  // Fetch admin counts (only when needed)
  const fetchCounts = useCallback(async (force = false) => {
    // Skip if not needed for current page type
    if (!pageConfig.needsCounts && !force) {
      dispatch({ 
        type: ADMIN_ACTIONS.SET_COUNTS, 
        payload: { sellers: { pending: 0, active: 0, payouts: 0 }, products: { pending: 0, flagged: 0, featured: 0 } }
      })
      return
    }

    // Skip if recently fetched (within 2 minutes) and not forced
    if (!force && state.lastFetch && (Date.now() - state.lastFetch) < 120000) {
      return
    }

    try {
      dispatch({ type: ADMIN_ACTIONS.SET_LOADING, payload: { counts: true } })
      
      // Use real analytics API for admin dashboard counts
      const [sellersRes, productsRes, usersRes] = await Promise.allSettled([
        analyticsAPI.admin.getSellers({ limit: 1 }), // Just for totals
        analyticsAPI.admin.getProducts({ limit: 1 }), // Just for totals  
        analyticsAPI.admin.getUsers({ limit: 1 }) // Just for totals
      ])

      // Extract counts from analytics responses
      const counts = {
        sellers: {
          pending: sellersRes.value?.summary?.pendingSellers || 0,
          active: sellersRes.value?.summary?.activeSellers || 0,
          payouts: 0 // TODO: Add payouts count when API available
        },
        products: {
          pending: productsRes.value?.summary?.pendingProducts || 0,
          flagged: productsRes.value?.summary?.flaggedProducts || 0,
          featured: productsRes.value?.summary?.featuredProducts || 0
        }
      }

      dispatch({ type: ADMIN_ACTIONS.SET_COUNTS, payload: counts })
      
    } catch (error) {
      console.error('Failed to fetch admin counts:', error)
      // Fallback to basic counts on error
      dispatch({ 
        type: ADMIN_ACTIONS.SET_COUNTS, 
        payload: { 
          sellers: { pending: 0, active: 0, payouts: 0 }, 
          products: { pending: 0, flagged: 0, featured: 0 } 
        }
      })
    }
  }, [pageConfig.needsCounts, state.lastFetch])

  // Fetch overview data (only for dashboard)
  const fetchOverview = useCallback(async () => {
    if (!pageConfig.needsOverview) return

    try {
      dispatch({ type: ADMIN_ACTIONS.SET_LOADING, payload: { overview: true } })
      
      // Use real platform analytics API
      const overview = await analyticsAPI.admin.getPlatform()
      
      dispatch({ type: ADMIN_ACTIONS.SET_OVERVIEW, payload: overview.overview })
    } catch (error) {
      console.warn('Failed to fetch overview:', error)
      // Fallback overview data
      dispatch({ type: ADMIN_ACTIONS.SET_OVERVIEW, payload: {
        totalUsers: 0,
        totalSellers: 0,
        totalProducts: 0,
        totalRevenue: 0
      }})
    }
  }, [pageConfig.needsOverview])

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchCounts(true),
      fetchOverview()
    ])
  }, [fetchCounts, fetchOverview])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ADMIN_ACTIONS.CLEAR_ERROR })
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchCounts()
    fetchOverview()
  }, [fetchCounts, fetchOverview])

  // Auto-refresh counts (only for dashboard page and with longer intervals)
  useEffect(() => {
    if (!pageConfig.needsCounts || pageConfig.type !== 'dashboard') return

    const interval = setInterval(() => {
      // Only refresh if data is older than 2 minutes and user is active
      if (state.lastFetch && (Date.now() - state.lastFetch) < 120000) return
      
      fetchCounts()
    }, 60000) // Increased to 60 seconds from 30 seconds

    return () => clearInterval(interval)
  }, [fetchCounts, pageConfig.needsCounts, pageConfig.type, state.lastFetch])

  // Context value
  const value = useMemo(() => ({
    // State
    ...state,
    pageConfig,
    
    // Actions
    fetchCounts,
    fetchOverview,
    refreshData,
    clearError,
    
    // Computed values
    isAnalyticsPage: pageConfig.type === 'analytics',
    isDashboardPage: pageConfig.type === 'dashboard',
    isManagementPage: pageConfig.type === 'management',
    
    // Helper methods
    getTotalSellerCount: () => state.counts.sellers.pending + state.counts.sellers.active,
    getTotalProductCount: () => state.counts.products.pending + state.counts.products.flagged + state.counts.products.featured
  }), [state, pageConfig, fetchCounts, fetchOverview, refreshData, clearError])

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

// Custom hook to use admin context
export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

// Export actions for external use
export { ADMIN_ACTIONS }
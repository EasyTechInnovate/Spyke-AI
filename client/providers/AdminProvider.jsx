'use client'
import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import adminAPI from '@/lib/api/admin'
import analyticsAPI from '@/lib/api/analytics'
const ADMIN_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_COUNTS: 'SET_COUNTS',
  SET_ERROR: 'SET_ERROR',
  SET_OVERVIEW: 'SET_OVERVIEW',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  CLEAR_ERROR: 'CLEAR_ERROR'
}
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
const AdminContext = createContext(null)
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
const getTotal = (res) => res?.meta?.total ?? res?.pagination?.total ?? res?.total ?? res?.data?.total ?? 0
export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState)
  const pathname = usePathname()
  const [isHydrated, setIsHydrated] = useState(false)
  const pageConfig = useMemo(() => getPageConfig(pathname), [pathname])
  useEffect(() => {
    dispatch({ type: ADMIN_ACTIONS.SET_CURRENT_PAGE, payload: pageConfig })
  }, [pageConfig])
  useEffect(() => {
    setIsHydrated(true)
  }, [])
  const fetchCounts = useCallback(async (force = false) => {
    if (!isHydrated) return
    if (!pageConfig.needsCounts && !force) {
      dispatch({ 
        type: ADMIN_ACTIONS.SET_COUNTS, 
        payload: { sellers: { pending: 0, active: 0, payouts: 0 }, products: { pending: 0, flagged: 0, featured: 0 } }
      })
      return
    }
    if (!force && state.lastFetch && (Date.now() - state.lastFetch) < 120000) {
      return
    }
    try {
      dispatch({ type: ADMIN_ACTIONS.SET_LOADING, payload: { counts: true } })
      const [sellersRes, productsRes, usersRes] = await Promise.allSettled([
        analyticsAPI.admin.getSellers({ limit: 1 }), 
        analyticsAPI.admin.getProducts({ limit: 1 }), 
        analyticsAPI.admin.getUsers({ limit: 1 }) 
      ])
      const counts = {
        sellers: {
          pending: sellersRes.value?.summary?.pendingSellers || 0,
          active: sellersRes.value?.summary?.activeSellers || 0,
          payouts: 0 
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
      dispatch({ 
        type: ADMIN_ACTIONS.SET_COUNTS, 
        payload: { 
          sellers: { pending: 0, active: 0, payouts: 0 }, 
          products: { pending: 0, flagged: 0, featured: 0 } 
        }
      })
    }
  }, [pageConfig.needsCounts, isHydrated]) 
  const fetchOverview = useCallback(async () => {
    if (!isHydrated) return
    if (!pageConfig.needsOverview) return
    try {
      dispatch({ type: ADMIN_ACTIONS.SET_LOADING, payload: { overview: true } })
      const overview = await analyticsAPI.admin.getPlatform()
      dispatch({ type: ADMIN_ACTIONS.SET_OVERVIEW, payload: overview.overview })
    } catch (error) {
      console.warn('Failed to fetch overview:', error)
      dispatch({ type: ADMIN_ACTIONS.SET_OVERVIEW, payload: {
        totalUsers: 0,
        totalSellers: 0,
        totalProducts: 0,
        totalRevenue: 0
      }})
    }
  }, [pageConfig.needsOverview, isHydrated])
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchCounts(true),
      fetchOverview()
    ])
  }, [fetchCounts, fetchOverview])
  const clearError = useCallback(() => {
    dispatch({ type: ADMIN_ACTIONS.CLEAR_ERROR })
  }, [])
  useEffect(() => {
    if (isHydrated) {
      fetchCounts()
      fetchOverview()
    }
  }, [isHydrated]) 
  useEffect(() => {
    if (!isHydrated || !pageConfig.needsCounts || pageConfig.type !== 'dashboard') return
    const interval = setInterval(() => {
      if (state.lastFetch && (Date.now() - state.lastFetch) < 120000) return
      fetchCounts()
    }, 60000) 
    return () => clearInterval(interval)
  }, [isHydrated, pageConfig.needsCounts, pageConfig.type]) 
  const value = useMemo(() => ({
    ...state,
    pageConfig,
    fetchCounts,
    fetchOverview,
    refreshData,
    clearError,
    isAnalyticsPage: pageConfig.type === 'analytics',
    isDashboardPage: pageConfig.type === 'dashboard',
    isManagementPage: pageConfig.type === 'management',
    getTotalSellerCount: () => state.counts.sellers.pending + state.counts.sellers.active,
    getTotalProductCount: () => state.counts.products.pending + state.counts.products.flagged + state.counts.products.featured
  }), [state, pageConfig, fetchCounts, fetchOverview, refreshData, clearError])
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}
export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
export { ADMIN_ACTIONS }
'use client'

import { useState, useEffect, useCallback } from 'react'



// Custom hook for persisted state with localStorage
export function usePersistedState(key, initialValue) {
  // Always start with initialValue to match server rendering
  const [state, setState] = useState(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          setState(JSON.parse(stored))
        }
      } catch (error) {
        console.warn(`Failed to load persisted state for ${key}:`, error)
      }
      setIsHydrated(true)
    }
  }, [key])

  // Persist to localStorage when state changes (but only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch (error) {
        console.warn(`Failed to persist ${key}:`, error)
      }
    }
  }, [key, state, isHydrated])

  return [state, setState]
}

// Custom hook for managing sidebar state
export function useSidebarState() {
  const [expandedMenus, setExpandedMenus] = usePersistedState('admin_expanded_menus_v2', [])
  const [isCollapsed, setIsCollapsed] = usePersistedState('admin_sidebar_collapsed', false)

  const toggleMenu = useCallback((menuId) => {
    setExpandedMenus((prev) => 
      prev.includes(menuId) 
        ? prev.filter((id) => id !== menuId) 
        : [...prev, menuId]
    )
  }, [setExpandedMenus])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [setIsCollapsed])

  // Update CSS variable for layout - move to useLayoutEffect to prevent render loops
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateCSSVariable = () => {
        document.documentElement.style.setProperty(
          '--admin-sidebar-width', 
          isCollapsed ? '80px' : '256px'
        )
      }
      
      // Use requestAnimationFrame to defer DOM manipulation
      requestAnimationFrame(updateCSSVariable)
    }
  }, [isCollapsed])

  // Initialize CSS variable on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentValue = getComputedStyle(document.documentElement)
        .getPropertyValue('--admin-sidebar-width')
      if (!currentValue || currentValue.trim() === '') {
        document.documentElement.style.setProperty('--admin-sidebar-width', '256px')
      }
    }
  }, [])

  return {
    expandedMenus,
    isCollapsed,
    toggleMenu,
    toggleCollapse, // Renamed from toggleSidebar to avoid conflict
    setIsCollapsed
  }
}

// Custom hook for mobile sidebar management
export function useMobileSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const openSidebar = useCallback(() => {
    setSidebarOpen(true)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  return {
    sidebarOpen,
    setSidebarOpen,
    closeSidebar,
    openSidebar,
    toggleSidebar
  }
}

// Custom hook for admin navigation logic
export function useAdminNavigation(currentPath) {
  const sidebarState = useSidebarState()
  const mobileSidebar = useMobileSidebar()

  const handleItemClick = useCallback(() => {
    // Close mobile sidebar when navigating
    mobileSidebar.closeSidebar()
  }, [mobileSidebar])

  return {
    ...sidebarState,
    ...mobileSidebar,
    handleItemClick,
    currentPath
  }
}

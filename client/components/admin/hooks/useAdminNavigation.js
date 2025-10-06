'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

// Create a context for mobile sidebar state
const MobileSidebarContext = createContext(null)

export function MobileSidebarProvider({ children }) {
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  const value = {
    sidebarOpen,
    setSidebarOpen,
    closeSidebar,
    openSidebar,
    toggleSidebar
  }

  return (
    <MobileSidebarContext.Provider value={value}>
      {children}
    </MobileSidebarContext.Provider>
  )
}

export function usePersistedState(key, initialValue) {
  const [state, setState] = useState(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateCSSVariable = () => {
        document.documentElement.style.setProperty(
          '--admin-sidebar-width', 
          isCollapsed ? '80px' : '256px'
        )
      }
      
      requestAnimationFrame(updateCSSVariable)
    }
  }, [isCollapsed])

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
    toggleCollapse,
    setIsCollapsed
  }
}

export function useMobileSidebar() {
  const context = useContext(MobileSidebarContext)
  if (!context) {
    throw new Error('useMobileSidebar must be used within MobileSidebarProvider')
  }
  return context
}

export function useAdminNavigation(currentPath) {
  const sidebarState = useSidebarState()
  const mobileSidebar = useMobileSidebar()

  const handleItemClick = useCallback(() => {
    mobileSidebar.closeSidebar()
  }, [mobileSidebar])

  return {
    ...sidebarState,
    ...mobileSidebar,
    handleItemClick,
    currentPath
  }
}

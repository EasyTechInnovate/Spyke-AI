'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const userStr = localStorage.getItem('user')

      if (token && userStr) {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const requireAuth = (callback, redirectTo = null) => {
    if (!isAuthenticated) {
      // Store the current page or custom redirect in localStorage
      const returnTo = redirectTo || pathname
      if (typeof window !== 'undefined') {
        localStorage.setItem('returnTo', returnTo)
      }
      router.push('/signin')
      return false
    }
    
    if (callback) {
      callback()
    }
    return true
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('roles')
      localStorage.removeItem('returnTo')
    }
    setUser(null)
    setIsAuthenticated(false)
    router.push('/')
  }

  return {
    user,
    loading,
    isAuthenticated,
    requireAuth,
    logout,
    checkAuthStatus
  }
}
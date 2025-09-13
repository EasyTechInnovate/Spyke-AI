'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/lib/services/auth'

export function useAuth() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        checkAuthStatus()

        // Listen for storage events (logout from other tabs)
        const handleStorageChange = () => {
            checkAuthStatus()
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const checkAuthStatus = () => {
        if (typeof window === 'undefined') {
            setLoading(false)
            return
        }

        try {
            const authenticated = authService.isAuthenticated()
            const userData = authService.getCurrentUser()

            if (authenticated && userData) {
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

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials)
            if (response) {
                setUser(response)
                setIsAuthenticated(true)
                
                const roles = authService.getUserRoles()
                if (roles.includes('admin')) {
                    router.push('/admin/dashboard')
                } else if (roles.includes('seller')) {
                    router.push('/seller/dashboard')
                } else {
                    const returnTo = typeof window !== 'undefined' ? localStorage.getItem('returnTo') : null
                    const redirectUrl = returnTo || '/'
                    if (returnTo) localStorage.removeItem('returnTo')
                    router.push(redirectUrl)
                }
            }
            return response
        } catch (error) {
            throw error
        }
    }

    const register = async (userData) => {
        try {
            const response = await authService.register(userData)
            if (response && !response.requiresConfirmation) {
                setUser(response)
                setIsAuthenticated(true)
            }
            return response
        } catch (error) {
            throw error
        }
    }

    const logout = async () => {
        try {
            // Update local state immediately
            setUser(null)
            setIsAuthenticated(false)

            // Use centralized logout service
            await authService.logout()
        } catch (error) {
            console.error('Logout failed:', error)
            // Ensure state is cleared even if logout fails
            setUser(null)
            setIsAuthenticated(false)
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

    const hasRole = (role) => {
        return authService.hasRole(role)
    }

    const getUserRoles = () => {
        return authService.getUserRoles()
    }

    const getPrimaryRole = () => {
        return authService.getPrimaryRole()
    }

    return {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        requireAuth,
        hasRole,
        getUserRoles,
        getPrimaryRole,
        checkAuthStatus,
        // Expose auth service methods
        authService
    }
}

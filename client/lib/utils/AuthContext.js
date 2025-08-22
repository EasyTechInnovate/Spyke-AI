'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api/auth'
import { getUserRole, hasRole } from './auth'

// Helper function to determine redirect path based on user role
const getRedirectPath = (userData) => {
    if (!userData) return '/signin'
    
    const role = getUserRole(userData)
    switch (role) {
        case 'admin':
            return '/admin/dashboard'
        case 'seller':
            return '/seller/dashboard'
        case 'moderator':
            return '/moderator/dashboard'
        default:
            return '/explore'
    }
}

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is logged in on mount
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser))
                } catch (error) {
                    console.error('Failed to parse user data:', error)
                }
            }
        }
        setLoading(false)
    }, [])

    const login = async (credentials) => {
        const userData = await authAPI.login(credentials)
        setUser(userData)
        
        // Get appropriate redirect path based on role
        const redirectPath = getRedirectPath(userData)
        router.push(redirectPath)
        
        return userData
    }

    const logout = async () => {
        // Clear user state immediately
        setUser(null)
        
        // Clear localStorage immediately to prevent race conditions
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
        }
        
        // Then call the logout service
        const { logoutService } = await import('@/lib/services/logout')
        return logoutService.logout()
    }

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        // Role checking helpers
        isAdmin: hasRole(user, 'admin'),
        isSeller: hasRole(user, 'seller'),
        isModerator: hasRole(user, 'moderator'),
        hasRole: (role) => hasRole(user, role),
        primaryRole: getUserRole(user)
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
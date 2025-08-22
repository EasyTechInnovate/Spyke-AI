'use client'

import { authAPI } from '@/lib/api/auth'

/**
 * Centralized authentication service
 * Handles all auth operations with consistent error handling and user feedback
 */
class AuthService {
    constructor() {
        this.isLoggingIn = false
        this.isLoggingOut = false
    }

    /**
     * Login with credentials
     */
    async login(credentials) {
        if (this.isLoggingIn) return null

        this.isLoggingIn = true
        
        try {
            const response = await authAPI.login(credentials)

            // Get redirect path
            const redirectPath = this.getRedirectPath(response)

            // Small delay for better UX
            setTimeout(() => {
                window.location.href = redirectPath
            }, 500)

            return response
        } catch (error) {
            throw error
        } finally {
            this.isLoggingIn = false
        }
    }

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await authAPI.register(userData)

            if (!response?.requiresConfirmation) {
                setTimeout(() => {
                    window.location.href = this.getRedirectPath(response)
                }, 500)
            }

            return response
        } catch (error) {
            throw error
        }
    }

    /**
     * Logout user
     */
    async logout() {
        if (this.isLoggingOut) return

        this.isLoggingOut = true
        
        try {
            // Use centralized logout service immediately
            const { logoutService } = await import('@/lib/services/logout')
            await logoutService.logout()
        } catch (error) {
            console.error('Logout error:', error)
            
            // Fallback: force logout even if there's an error
            const { logoutService } = await import('@/lib/services/logout')
            logoutService.forceLogout()
        } finally {
            this.isLoggingOut = false
        }
    }

    /**
     * Refresh auth token
     */
    async refreshToken() {
        try {
            return await authAPI.refreshToken()
        } catch (error) {
            // Silent refresh failure - let the 401 handler deal with it
            throw error
        }
    }

    /**
     * Check authentication status
     */
    isAuthenticated() {
        return authAPI.isAuthenticated()
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return authAPI.getStoredUser()
    }

    /**
     * Get user roles
     */
    getUserRoles() {
        return authAPI.getUserRoles()
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return authAPI.hasRole(role)
    }

    /**
     * Get primary user role
     */
    getPrimaryRole() {
        return authAPI.getPrimaryRole()
    }

    /**
     * Get redirect path based on user role and stored returnTo
     */
    getRedirectPath(userData) {
        if (typeof window === 'undefined') return '/'

        // Check for stored redirect paths
        const sessionReturn = sessionStorage.getItem('redirectAfterLogin')
        const localReturn = localStorage.getItem('returnTo')

        if (sessionReturn) {
            sessionStorage.removeItem('redirectAfterLogin')
            return sessionReturn
        }

        if (localReturn) {
            localStorage.removeItem('returnTo')
            return localReturn
        }

        // Role-based default redirects
        const roles = userData?.roles || this.getUserRoles()
        const primaryRole = this.getPrimaryRole()

        switch (primaryRole) {
            case 'admin':
                return '/admin/dashboard'
            default:
                return '/'
        }
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(error, context = 'authentication') {
        const errorMessage = error?.message || error?.data?.message || `${context} failed`

        // Don't show error for expected auth failures (like token expiry)
        if (error?.status === 401 && error?.authError) {
            return
        }
    }
}

// Create singleton instance
export const authService = new AuthService()

// Export individual methods for convenience
export const {
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated,
    getCurrentUser,
    getUserRoles,
    hasRole,
    getPrimaryRole,
    getRedirectPath,
    handleAuthError
} = authService

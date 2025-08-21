'use client'

import { toast } from 'sonner'
import { authAPI } from '@/lib/api/auth'

/**
 * Centralized authentication service
 * Handles all auth operations with consistent error handling and user feedback
 */
class AuthService {
  constructor() {
    this.isLoggingIn = false
    this.isLoggingOut = false
    this.toastIds = new Map() // Track toast IDs to prevent duplicates
  }

  /**
   * Show toast only if not already shown for this action
   */
  showToast(key, toastFn, ...args) {
    if (this.toastIds.has(key)) {
      toast.dismiss(this.toastIds.get(key))
    }
    const toastId = toastFn(...args)
    this.toastIds.set(key, toastId)
    return toastId
  }

  /**
   * Clear specific toast
   */
  clearToast(key) {
    if (this.toastIds.has(key)) {
      toast.dismiss(this.toastIds.get(key))
      this.toastIds.delete(key)
    }
  }

  /**
   * Login with credentials
   */
  async login(credentials) {
    if (this.isLoggingIn) return null

    this.isLoggingIn = true
    this.clearToast('login')
    
    try {
      const response = await authAPI.login(credentials)
      
      this.showToast('login', toast.success, '✅ Login successful! Welcome back.')
      
      // Get redirect path
      const redirectPath = this.getRedirectPath(response)
      
      // Small delay for better UX
      setTimeout(() => {
        window.location.href = redirectPath
      }, 500)
      
      return response
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Login failed. Please try again.'
      this.showToast('login', toast.error, errorMessage)
      throw error
    } finally {
      this.isLoggingIn = false
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    this.clearToast('register')
    
    try {
      const response = await authAPI.register(userData)
      
      if (response?.requiresConfirmation) {
        this.showToast('register', toast.success, '✅ Registration successful! Please check your email to confirm your account.')
      } else {
        this.showToast('register', toast.success, '✅ Registration successful! Welcome to Spyke AI.')
        setTimeout(() => {
          window.location.href = this.getRedirectPath(response)
        }, 500)
      }
      
      return response
    } catch (error) {
      const errorMessage = error?.message || error?.data?.message || 'Registration failed. Please try again.'
      this.showToast('register', toast.error, errorMessage)
      throw error
    }
  }

  /**
   * Logout user
   */
  async logout() {
    if (this.isLoggingOut) return

    this.isLoggingOut = true
    this.clearToast('logout')
    
    try {
      this.showToast('logout', toast.success, '👋 Logged out successfully!')
      
      // Use centralized logout service
      const { logoutService } = await import('@/lib/services/logout')
      await logoutService.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Still show success message as we clear local data anyway
      this.showToast('logout', toast.success, '👋 Logged out successfully!')
      
      // Fallback logout
      const { logoutService } = await import('@/lib/services/logout')
      logoutService.clearAllData()
      window.location.href = '/signin'
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
      case 'seller':
        return '/seller/dashboard'
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

    this.showToast(`error-${context}`, toast.error, errorMessage)
  }

  /**
   * Clear all toasts
   */
  clearAllToasts() {
    this.toastIds.forEach((toastId) => toast.dismiss(toastId))
    this.toastIds.clear()
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
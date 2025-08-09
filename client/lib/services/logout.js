'use client'

import { toast } from 'sonner'

/**
 * Centralized logout service that clears all application data
 * and redirects to home page
 */
export const logoutService = {
  /**
   * Perform complete logout - clear all stored data and redirect
   */
  async logout() {
    try {
      // 1. Try to call backend logout endpoint (ignore errors)
      if (typeof window !== 'undefined') {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }).catch(() => {
              // Ignore backend errors - we'll clear local data anyway
            });
          }
        } catch (err) {
          // Ignore backend errors
        }
      }

      // 2. Clear all authentication data
      if (typeof window !== 'undefined') {
        // Auth tokens and user data
        localStorage.clear();

        // Clear cookies
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = 'roles=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

        // Redirect to signin page
        window.location.href = '/signin';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  /**
   * Clear all stored data without redirecting
   * Useful for clearing data in specific scenarios
   */
  clearAllData() {
    if (typeof window !== 'undefined') {
      // Auth tokens and user data
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('roles')
      localStorage.removeItem('returnTo')
      
      // Cart data
      localStorage.removeItem('spyke_guest_cart')
      sessionStorage.removeItem('spyke_cart')
      
      // Clear any other app-specific data
      localStorage.removeItem('selectedAddress')
      localStorage.removeItem('checkoutData')
      
      // Dispatch storage event
      window.dispatchEvent(new Event('storage'))
    }
  }
}

// Export default logout function for convenience
export const logout = logoutService.logout
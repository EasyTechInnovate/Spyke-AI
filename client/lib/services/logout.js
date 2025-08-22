'use client'

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
                    const token = localStorage.getItem('authToken')
                    if (token) {
                        // Construct API URL more safely
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
                        const logoutUrl = `${apiUrl}/v1/auth/logout`

                        console.log('Calling logout URL:', logoutUrl) // Debug log

                        await fetch(logoutUrl, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include' // Important for cookies
                        }).catch((err) => {
                            console.log('Logout API call failed (ignoring):', err.message)
                            // Ignore backend errors - we'll clear local data anyway
                        })
                    }
                } catch (err) {
                    console.log('Error during backend logout (ignoring):', err.message)
                    // Continue with local cleanup even if backend fails
                }

                // 2. Clear all localStorage data
                this.clearStorageData()

                // 3. Clear any cookies
                this.clearCookies()

                // 4. Clear any session storage
                this.clearSessionStorage()

                // 5. Redirect to home page
                window.location.href = '/'
            }
        } catch (error) {
            console.error('Critical error during logout:', error)
            // Even if something goes wrong, force redirect to home
            if (typeof window !== 'undefined') {
                window.location.href = '/'
            }
        }
    },

    /**
     * Clear all localStorage items
     */
    clearStorageData() {
        try {
            const itemsToRemove = [
                'authToken',
                'refreshToken',
                'user',
                'userProfile',
                'cart',
                'wishlist',
                'recentViews',
                'preferences',
                'notifications',
                'tempData'
            ]

            itemsToRemove.forEach(item => {
                localStorage.removeItem(item)
            })

            // Also clear any items that start with our app prefix
            const appPrefix = 'spyke_'
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(appPrefix)) {
                    localStorage.removeItem(key)
                }
            })

            console.log('LocalStorage cleared successfully')
        } catch (error) {
            console.error('Error clearing localStorage:', error)
        }
    },

    /**
     * Clear session storage
     */
    clearSessionStorage() {
        try {
            sessionStorage.clear()
            console.log('SessionStorage cleared successfully')
        } catch (error) {
            console.error('Error clearing sessionStorage:', error)
        }
    },

    /**
     * Clear relevant cookies
     */
    clearCookies() {
        try {
            const cookiesToClear = [
                'authToken',
                'refreshToken',
                'session',
                'user_session',
                'cart_id',
                'preferences'
            ]

            cookiesToClear.forEach(cookieName => {
                // Clear cookie for current domain
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
                // Clear cookie for parent domain
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
            })

            console.log('Cookies cleared successfully')
        } catch (error) {
            console.error('Error clearing cookies:', error)
        }
    },

    /**
     * Quick logout without backend call (for emergency situations)
     */
    forceLogout() {
        try {
            if (typeof window !== 'undefined') {
                this.clearStorageData()
                this.clearCookies()
                this.clearSessionStorage()
                window.location.href = '/'
            }
        } catch (error) {
            console.error('Error during force logout:', error)
            // Last resort - just redirect
            if (typeof window !== 'undefined') {
                window.location.href = '/'
            }
        }
    }
}


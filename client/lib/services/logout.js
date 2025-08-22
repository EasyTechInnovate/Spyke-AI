'use client'

/**
 * EMERGENCY LOGOUT FIX - Comprehensive data clearing
 */
export const logoutService = {
    /**
     * Perform complete logout - AGGRESSIVE DATA CLEARING
     */
    async logout() {
        console.log('🚨 EMERGENCY LOGOUT INITIATED')
        
        try {
            if (typeof window !== 'undefined') {
                // 1. IMMEDIATELY clear all auth state to prevent race conditions
                this.forceLocalClear()

                // 2. Try backend logout (don't wait for it)
                this.attemptBackendLogout().catch(() => {
                    console.log('Backend logout failed, continuing with local cleanup')
                })

                // 3. Force window reload to clear any cached state
                setTimeout(() => {
                    window.location.href = '/signin'
                    // Force page reload to clear all cached state
                    setTimeout(() => window.location.reload(), 100)
                }, 100)
            }
        } catch (error) {
            console.error('Critical logout error:', error)
            this.forceLogout()
        }
    },

    /**
     * IMMEDIATE local data clearing - no async operations
     */
    forceLocalClear() {
        try {
            // AGGRESSIVE localStorage clearing
            const allPossibleKeys = [
                'authToken', 'accessToken', 'refreshToken', 'user', 'roles', 
                'userProfile', 'cart', 'wishlist', 'recentViews', 'preferences',
                'notifications', 'tempData', 'loginTime', 'currentUser', 
                'sellerAccessToken', 'returnTo', 'redirectAfterLogin'
            ]

            allPossibleKeys.forEach(key => {
                localStorage.removeItem(key)
            })

            // Clear ALL items starting with common prefixes
            const prefixes = ['auth_', 'user_', 'spyke_', 'token_']
            Object.keys(localStorage).forEach(key => {
                if (prefixes.some(prefix => key.startsWith(prefix))) {
                    localStorage.removeItem(key)
                }
            })

            // AGGRESSIVE cookie clearing with multiple paths and domains
            this.nukeAllCookies()

            // Clear session storage
            sessionStorage.clear()

            console.log('✅ All local data forcefully cleared')
        } catch (error) {
            console.error('Error in force clear:', error)
            // Try to clear localStorage entirely as last resort
            try {
                localStorage.clear()
            } catch (e) {
                console.error('Even localStorage.clear() failed:', e)
            }
        }
    },

    /**
     * NUCLEAR OPTION - Clear all possible cookie combinations
     */
    nukeAllCookies() {
        const cookieNames = [
            'authToken', 'accessToken', 'refreshToken', 'roles', 
            'session', 'user_session', 'cart_id', 'preferences'
        ]

        const domains = [
            '', // Current domain
            window.location.hostname,
            '.' + window.location.hostname
        ]

        const paths = ['/', '/v1', '/api/v1', '/api']

        cookieNames.forEach(cookieName => {
            domains.forEach(domain => {
                paths.forEach(path => {
                    // Try multiple expiration dates to be sure
                    const expirationDates = [
                        'Thu, 01 Jan 1970 00:00:00 GMT',
                        'Thu, 01 Jan 1970 00:00:01 GMT',
                        'Wed, 31 Dec 1969 23:59:59 GMT'
                    ]

                    expirationDates.forEach(expires => {
                        if (domain) {
                            document.cookie = `${cookieName}=; expires=${expires}; path=${path}; domain=${domain}; SameSite=None; Secure`
                            document.cookie = `${cookieName}=; expires=${expires}; path=${path}; domain=${domain}; SameSite=Lax`
                            document.cookie = `${cookieName}=; expires=${expires}; path=${path}; domain=${domain}; SameSite=Strict`
                        } else {
                            document.cookie = `${cookieName}=; expires=${expires}; path=${path}; SameSite=None; Secure`
                            document.cookie = `${cookieName}=; expires=${expires}; path=${path}; SameSite=Lax`
                            document.cookie = `${cookieName}=; expires=${expires}; path=${path}; SameSite=Strict`
                        }
                    })
                })
            })
        })

        console.log('🧨 All cookies nuked from orbit')
    },

    /**
     * Attempt backend logout without blocking
     */
    async attemptBackendLogout() {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken')
        if (!token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const controller = new AbortController()
        
        // Timeout after 2 seconds
        setTimeout(() => controller.abort(), 2000)

        try {
            await fetch(`${apiUrl}/v1/auth/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                signal: controller.signal
            })
            console.log('✅ Backend logout successful')
        } catch (error) {
            console.log('⚠️ Backend logout failed (ignoring):', error.message)
        }
    },

    /**
     * Emergency force logout
     */
    forceLogout() {
        console.log('🆘 FORCE LOGOUT ACTIVATED')
        try {
            this.forceLocalClear()
            window.location.href = '/signin'
            setTimeout(() => window.location.reload(), 50)
        } catch (error) {
            console.error('Even force logout failed:', error)
            // Absolute last resort
            window.location.href = '/signin?force=1'
        }
    }
}


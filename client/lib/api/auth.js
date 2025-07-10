import { safeLocalStorage, safeSessionStorage, safeCookie, safeWindow } from '@/lib/utils/browser'

export const authAPI = {
    // Health Check
    // Health Check
    checkHealth: async () => {
        const response = await apiClient.get('v1/auth/health')
        // Handle wrapped response
        return response?.data || response
    },

    // Register
    register: async (userData) => {
        const response = await apiClient.post('v1/auth/register', {
            emailAddress: userData.emailAddress,
            phoneNumber: userData.phoneNumber,
            password: userData.password,
            userLocation: userData.userLocation,
            consent: userData.consent,
            role: userData.role || 'user'
        })

        // If API returns wrapped response
        const data = response?.data || response

        // Some APIs auto-login after registration
        if (data?.tokens?.accessToken) {
            apiClient.setAuthToken(data.tokens.accessToken)

            const cookieOptions = `path=/; max-age=86400; SameSite=Lax`
            safeCookie.set('authToken', data.tokens.accessToken, cookieOptions)

            if (data?.roles) {
                safeCookie.set('roles', JSON.stringify(data.roles), cookieOptions)
            }

            safeLocalStorage.setItem('authToken', data.tokens.accessToken)
            if (data.tokens.refreshToken) {
                safeLocalStorage.setItem('refreshToken', data.tokens.refreshToken)
            }
            safeLocalStorage.setItem('user', JSON.stringify(data))

            if (data?.roles) {
                safeLocalStorage.setItem('roles', JSON.stringify(data.roles))
            }
        }

        return data
    },

    // Account Confirmation
    confirmAccount: async (token, code) => {
        const response = await apiClient.post(`v1/auth/confirmation/${token}`, {
            code
        })
        // Handle wrapped response
        return response?.data || response
    },

    // Login - FIXED FOR YOUR API STRUCTURE
    login: async (credentials) => {
        try {
            // Call the API
            const response = await apiClient.post('v1/auth/login', {
                emailAddress: credentials.emailAddress,
                password: credentials.password
            })

            console.log('Auth API - Full response:', response)

            // Your API returns a wrapped response: { success, statusCode, message, data }
            // The actual user data and tokens are in response.data
            const data = response?.data

            if (!data) {
                throw new Error('Invalid response structure - no data field')
            }

            console.log('Auth API - User data:', data)
            console.log('Auth API - Tokens:', data?.tokens)

            // Check if we have valid tokens
            if (data?.tokens?.accessToken) {
                // Set auth token in API client first
                apiClient.setAuthToken(data.tokens.accessToken)

                // Set cookies with proper attributes
                const cookieOptions = `path=/; max-age=86400; SameSite=Lax`
                safeCookie.set('authToken', data.tokens.accessToken, cookieOptions)

                if (data?.roles) {
                    safeCookie.set('roles', JSON.stringify(data.roles), cookieOptions)
                }

                // Set localStorage items
                safeLocalStorage.setItem('authToken', data.tokens.accessToken)
                safeLocalStorage.setItem('refreshToken', data.tokens.refreshToken)
                safeLocalStorage.setItem('user', JSON.stringify(data))

                if (data?.roles) {
                    safeLocalStorage.setItem('roles', JSON.stringify(data.roles))
                }

                // Store login time for session management
                safeLocalStorage.setItem('loginTime', new Date().toISOString())

                // Add a small delay to ensure cookies are set
                await new Promise((resolve) => setTimeout(resolve, 100))

                // Return the user data (not the wrapped response)
                return data
            } else {
                console.error('No tokens in data:', data)
                throw new Error('Invalid response - no access token received')
            }
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    },

    // Google Login
    googleLogin: async (googleData) => {
        try {
            const response = await apiClient.post('v1/auth/google-login', {
                googleId: googleData.googleId,
                profile: googleData.profile
            })

            // Handle wrapped response
            const data = response?.data || response

            // Handle tokens same as regular login
            if (data?.tokens?.accessToken) {
                apiClient.setAuthToken(data.tokens.accessToken)

                const cookieOptions = `path=/; max-age=86400; SameSite=Lax`
                document.cookie = `authToken=${data.tokens.accessToken}; ${cookieOptions}`

                if (data?.roles) {
                    document.cookie = `roles=${JSON.stringify(data.roles)}; ${cookieOptions}`
                }

                localStorage.setItem('authToken', data.tokens.accessToken)
                localStorage.setItem('refreshToken', data.tokens.refreshToken)
                localStorage.setItem('user', JSON.stringify(data))

                if (data?.roles) {
                    localStorage.setItem('roles', JSON.stringify(data.roles))
                }
            }

            return data
        } catch (error) {
            console.error('Google login error:', error)
            throw error
        }
    },

    // Google OAuth Redirect
    googleAuth: () => {
        safeWindow.redirect(`${apiClient.baseURL}/v1/auth/google`)
    },

    // Get Current User Profile
    getCurrentUser: async () => {
        const response = await apiClient.get('v1/auth/me')
        // Handle wrapped response
        return response?.data || response
    },

    // Logout - COMPLETE FIX
    logout: async () => {
        try {
            // Try to call backend logout endpoint
            await apiClient.post('v1/auth/logout').catch(() => {
                // Ignore backend errors - we'll clear local data anyway
            })
        } finally {
            // Clear all auth data regardless of API response
            authAPI.clearAllAuthData()

            // Redirect to signin
            window.location.href = '/signin'
        }
    },

    // Clear all auth data - helper method
    clearAllAuthData: () => {
        // Clear API client token
        apiClient.setAuthToken(null)

        // Clear all localStorage items
        const authKeys = ['authToken', 'refreshToken', 'user', 'roles', 'loginTime', 'accessToken', 'sellerAccessToken']
        authKeys.forEach((key) => localStorage.removeItem(key))

        // Clear all cookies
        const cookies = ['authToken', 'roles', 'refreshToken']
        cookies.forEach((name) => {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
            // Also try with domain
            document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
        })

        // Clear sessionStorage
        sessionStorage.clear()
    },

    // Refresh Token - IMPROVED
    refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
            throw new Error('No refresh token available')
        }

        try {
            const response = await apiClient.post('v1/auth/refresh-token', {
                refreshToken
            })

            // Handle wrapped response
            const data = response?.data || response

            // Update tokens
            if (data?.tokens?.accessToken) {
                apiClient.setAuthToken(data.tokens.accessToken)
                localStorage.setItem('authToken', data.tokens.accessToken)

                // Update cookie
                const cookieOptions = `path=/; max-age=86400; SameSite=Lax`
                document.cookie = `authToken=${data.tokens.accessToken}; ${cookieOptions}`

                if (data.tokens.refreshToken) {
                    localStorage.setItem('refreshToken', data.tokens.refreshToken)
                }
            }

            return data
        } catch (error) {
            console.error('Token refresh failed:', error)
            // If refresh fails, clear auth and redirect
            authAPI.clearAllAuthData()
            window.location.href = '/signin'
            throw error
        }
    },

    // Forgot Password
    forgotPassword: async (emailAddress) => {
        const response = await apiClient.post('v1/auth/forgot-password', {
            emailAddress
        })
        // Handle wrapped response
        return response?.data || response
    },

    // Reset Password
    resetPassword: async (token, newPassword, confirmPassword) => {
        const response = await apiClient.post('v1/auth/reset-password', {
            token,
            newPassword,
            confirmPassword
        })
        // Handle wrapped response
        return response?.data || response
    },

    // Change Password
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        const response = await apiClient.post('v1/auth/change-password', {
            currentPassword,
            newPassword,
            confirmPassword
        })
        // Handle wrapped response
        return response?.data || response
    },

    // Update Profile
    updateProfile: async (profileData) => {
        const response = await apiClient.put('v1/auth/update-profile', profileData)

        // Handle wrapped response
        const data = response?.data || response

        // Update local user data if successful
        if (data) {
            try {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                const updatedUser = { ...currentUser, ...data }
                localStorage.setItem('user', JSON.stringify(updatedUser))
            } catch (e) {
                console.error('Error updating local user data:', e)
            }
        }

        return data
    },

    // Check Email Availability
    checkEmail: async (emailAddress) => {
        const response = await apiClient.post('v1/auth/check-email', {
            emailAddress
        })
        // Handle wrapped response
        return response?.data || response
    },

    // Get Notifications
    getNotifications: async (params = {}) => {
        const { page = 1, limit = 10, type } = params
        const queryParams = new URLSearchParams({
            page,
            limit,
            ...(type && { type })
        }).toString()

        const response = await apiClient.get(`v1/auth/notifications?${queryParams}`)
        // Handle wrapped response
        return response?.data || response
    },

    // Mark Notification as Read
    markNotificationAsRead: async (notificationId) => {
        const response = await apiClient.post('v1/auth/notifications/read', {
            notificationId
        })
        // Handle wrapped response
        return response?.data || response
    },

    // Send Notification (admin only)
    sendNotification: async (notificationData) => {
        const response = await apiClient.post('v1/auth/notifications/send', notificationData)
        // Handle wrapped response
        return response?.data || response
    },

    // Send Bulk Notification (admin only)
    sendBulkNotification: async (bulkData) => {
        const response = await apiClient.post('v1/auth/notifications/send-bulk', bulkData)
        // Handle wrapped response
        return response?.data || response
    },

    // UTILITY METHODS

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('authToken')
        return !!token && apiClient.isAuthenticated()
    },

    // Get current user from localStorage
    getStoredUser: () => {
        try {
            const userStr = localStorage.getItem('user')
            return userStr ? JSON.parse(userStr) : null
        } catch (error) {
            console.error('Error parsing stored user:', error)
            return null
        }
    },

    // Get user roles
    getUserRoles: () => {
        try {
            const rolesStr = localStorage.getItem('roles')
            return rolesStr ? JSON.parse(rolesStr) : []
        } catch (error) {
            console.error('Error parsing roles:', error)
            return []
        }
    },

    // Check if user has specific role
    hasRole: (role) => {
        const roles = authAPI.getUserRoles()
        return roles.includes(role)
    },

    // Get primary role (highest priority)
    getPrimaryRole: () => {
        const roles = authAPI.getUserRoles()
        const rolePriority = ['admin', 'seller', 'moderator', 'user']

        for (const role of rolePriority) {
            if (roles.includes(role)) {
                return role
            }
        }

        return 'user'
    },

    // Check token expiry
    isTokenExpired: () => {
        try {
            const token = localStorage.getItem('authToken')
            if (!token) return true

            // Decode JWT token (simple base64 decode)
            const payload = JSON.parse(atob(token.split('.')[1]))
            const expiryTime = payload.exp * 1000 // Convert to milliseconds

            return Date.now() > expiryTime
        } catch (error) {
            console.error('Error checking token expiry:', error)
            return true
        }
    },

    // Get session duration
    getSessionDuration: () => {
        const loginTime = localStorage.getItem('loginTime')
        if (!loginTime) return null

        const duration = Date.now() - new Date(loginTime).getTime()
        return {
            milliseconds: duration,
            seconds: Math.floor(duration / 1000),
            minutes: Math.floor(duration / 60000),
            hours: Math.floor(duration / 3600000)
        }
    },

    // Setup auto refresh (call this on app mount)
    setupAutoRefresh: () => {
        // Check token every 5 minutes
        const interval = setInterval(
            async () => {
                if (authAPI.isAuthenticated() && authAPI.isTokenExpired()) {
                    try {
                        await authAPI.refreshToken()
                    } catch (error) {
                        console.error('Auto refresh failed:', error)
                        clearInterval(interval)
                    }
                }
            },
            5 * 60 * 1000
        ) // 5 minutes

        // Return cleanup function
        return () => clearInterval(interval)
    }
}

export default authAPI

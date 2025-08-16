import { safeLocalStorage, safeSessionStorage, safeCookie, safeWindow } from '@/lib/utils/browser'
import apiClient from './client'

export const authAPI = {
    // Health Check
    checkHealth: async () => {
        const response = await apiClient.get('v1/auth/self')
        return response?.data || response
    },

    // Internal helper: persist auth session consistently
    _persistSession: (data) => {
        if (!data?.tokens?.accessToken) return
        const { accessToken, refreshToken } = data.tokens

        apiClient.setAuthToken(accessToken)
        const cookieOptions = 'path=/; max-age=86400; SameSite=Lax'
        safeCookie.set('authToken', accessToken, cookieOptions)
        if (data?.roles) safeCookie.set('roles', JSON.stringify(data.roles), cookieOptions)

        // Local storage (single canonical keys)
        safeLocalStorage.setItem('authToken', accessToken)
        if (refreshToken) safeLocalStorage.setItem('refreshToken', refreshToken)
        safeLocalStorage.setItem('user', JSON.stringify(data))
        if (data?.roles) safeLocalStorage.setItem('roles', JSON.stringify(data.roles))
        safeLocalStorage.setItem('loginTime', new Date().toISOString())
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
        const data = response?.data || response
        if (data?.tokens?.accessToken) authAPI._persistSession(data)
        return data
    },

    // Account Confirmation
    confirmAccount: async (token, code) => {
        const response = await apiClient.post(`v1/auth/confirmation/${token}`, { code })
        return response?.data || response
    },

    // Login
    login: async (credentials) => {
        const response = await apiClient.post('v1/auth/login', {
            emailAddress: credentials.emailAddress,
            password: credentials.password
        })
        const data = response?.data
        if (!data) throw new Error('Invalid response structure')
        if (!data?.tokens?.accessToken) throw new Error('Invalid response - no access token')
        authAPI._persistSession(data)
        return data
    },

    // Google Login
    googleLogin: async (googleData) => {
        const response = await apiClient.post('v1/auth/google-login', {
            googleId: googleData.googleId,
            profile: googleData.profile
        })
        const data = response?.data || response
        if (data?.tokens?.accessToken) authAPI._persistSession(data)
        return data
    },

    // Google OAuth Redirect
    googleAuth: () => {
        safeWindow.redirect(`${apiClient.baseURL}/v1/auth/google`)
    },

    // Get Current User Profile
    getCurrentUser: async () => {
        const response = await apiClient.get('v1/auth/me')
        return response?.data || response
    },

    logout: async () => {
        const { logoutService } = await import('@/lib/services/logout')
        return logoutService.logout()
    },

    clearAllAuthData: () => {
        apiClient.setAuthToken(null)
        if (typeof window !== 'undefined') {
            const authKeys = ['authToken', 'refreshToken', 'user', 'roles', 'loginTime']
            authKeys.forEach((key) => localStorage.removeItem(key))
            const cookies = ['authToken', 'roles', 'refreshToken']
            cookies.forEach((name) => {
                document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
                document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
            })
            sessionStorage.clear()
        }
    },

    refreshToken: async () => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
        if (!stored) throw new Error('No refresh token available')
        const response = await apiClient.post('v1/auth/refresh-token', { refreshToken: stored })
        const data = response?.data || response
        if (data?.tokens?.accessToken) authAPI._persistSession(data)
        return data
    },

    forgotPassword: async (emailAddress) => {
        const response = await apiClient.post('v1/auth/forgot-password', { emailAddress })
        return response?.data || response
    },

    resetPassword: async (token, newPassword, confirmPassword) => {
        const response = await apiClient.post('v1/auth/reset-password', { token, newPassword, confirmPassword })
        return response?.data || response
    },

    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        const response = await apiClient.post('v1/auth/change-password', { currentPassword, newPassword, confirmPassword })
        return response?.data || response
    },

    updateProfile: async (profileData) => {
        const response = await apiClient.put('v1/auth/update-profile', profileData)
        const data = response?.data || response
        if (data) {
            try {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                const updatedUser = { ...currentUser, ...data }
                localStorage.setItem('user', JSON.stringify(updatedUser))
            } catch (_) {}
        }
        return data
    },

    checkEmail: async (emailAddress) => {
        const response = await apiClient.post('v1/auth/check-email', { emailAddress })
        return response?.data || response
    },

    getNotifications: async (params = {}) => {
        const { page = 1, limit = 10, type } = params
        const queryParams = new URLSearchParams({ page, limit, ...(type && { type }) }).toString()
        const response = await apiClient.get(`v1/auth/notifications?${queryParams}`)
        return response?.data || response
    },

    markNotificationAsRead: async (notificationId) => {
        const response = await apiClient.post('v1/auth/notifications/read', { notificationId })
        return response?.data || response
    },

    sendNotification: async (notificationData) => {
        const response = await apiClient.post('v1/auth/notifications/send', notificationData)
        return response?.data || response
    },

    sendBulkNotification: async (bulkData) => {
        const response = await apiClient.post('v1/auth/notifications/send-bulk', bulkData)
        return response?.data || response
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('authToken')
        return !!token && !authAPI.isTokenExpired()
    },

    getStoredUser: () => {
        try {
            const userStr = localStorage.getItem('user')
            return userStr ? JSON.parse(userStr) : null
        } catch (_) {
            return null
        }
    },

    getUserRoles: () => {
        try {
            const rolesStr = localStorage.getItem('roles')
            return rolesStr ? JSON.parse(rolesStr) : []
        } catch (_) {
            return []
        }
    },

    hasRole: (role) => authAPI.getUserRoles().includes(role),

    getPrimaryRole: () => {
        const roles = authAPI.getUserRoles()
        const priority = ['admin', 'seller', 'moderator', 'user']
        return priority.find(r => roles.includes(r)) || 'user'
    },

    isTokenExpired: () => {
        try {
            const token = localStorage.getItem('authToken')
            if (!token) return true
            const parts = token.split('.')
            if (parts.length < 2) return true
            const payload = JSON.parse(atob(parts[1]))
            return Date.now() > payload.exp * 1000
        } catch (_) {
            return true
        }
    },

    getSessionDuration: () => {
        const loginTime = localStorage.getItem('loginTime')
        if (!loginTime) return null
        const diff = Date.now() - new Date(loginTime).getTime()
        return {
            milliseconds: diff,
            seconds: Math.floor(diff / 1000),
            minutes: Math.floor(diff / 60000),
            hours: Math.floor(diff / 3600000)
        }
    },

    setupAutoRefresh: () => {
        const interval = setInterval(async () => {
            if (authAPI.isAuthenticated() && authAPI.isTokenExpired()) {
                try { await authAPI.refreshToken() } catch { clearInterval(interval) }
            }
        }, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }
}

export default authAPI

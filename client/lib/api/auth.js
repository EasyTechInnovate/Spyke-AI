import apiClient from './client'

export const authAPI = {
    checkHealth: async () => {
        return await apiClient.get('v1/auth/health')
    },

    register: async (userData) => {
        return await apiClient.post('v1/auth/register', {
            emailAddress: userData.emailAddress,
            phoneNumber: userData.phoneNumber,
            password: userData.password,
            userLocation: userData.userLocation,
            consent: userData.consent,
            role: userData.role || 'user'
        })
    },

    // Account Confirmation
    confirmAccount: async (token, code) => {
        return await apiClient.post(`v1/auth/confirmation/${token}/?code=${code}`, {
            token,
            code
        })
    },

    login: async (credentials) => {
        const res = await apiClient.post('v1/auth/login', {
            emailAddress: credentials.emailAddress,
            password: credentials.password
        })

        const data = res?.data

        if (data?.tokens?.accessToken) {
            apiClient.setAuthToken(data.tokens.accessToken)
            localStorage.setItem('authToken', data.tokens.accessToken)
            localStorage.setItem('refreshToken', data.tokens.refreshToken)
            localStorage.setItem('user', JSON.stringify(data))
            document.cookie = `authToken=${data.tokens.accessToken}; path=/; max-age=86400` // 24 hours

            if (data?.roles) {
                localStorage.setItem('roles', JSON.stringify(data.roles))
                document.cookie = `roles=${JSON.stringify(data.roles)}; path=/; max-age=86400` // 24 hours
            }
        }

        return data
    },

    // Google Login
    googleLogin: async (googleData) => {
        const response = await apiClient.post('v1/auth/google-login', {
            googleId: googleData.googleId,
            profile: googleData.profile
        })

        // Store tokens if login successful
        if (response.accessToken) {
            apiClient.setAuthToken(response.accessToken)
            if (response.refreshToken && typeof window !== 'undefined') {
                localStorage.setItem('refreshToken', response.refreshToken)
            }
        }

        return response
    },

    // Google OAuth Redirect (for OAuth flow)
    googleAuth: () => {
        window.location.href = `${apiClient.baseURL}/v1/auth/google`
    },

    // Get Current User Profile
    getCurrentUser: async () => {
        return await apiClient.get('v1/auth/me')
    },

    logout: async () => {
        try {
            const response = await apiClient.post('v1/auth/logout')
            apiClient.setAuthToken(null)
            localStorage.removeItem('roles')
            if (typeof window !== 'undefined') {
                localStorage.removeItem('refreshToken')
            }
            return response
        } catch (error) {
            apiClient.setAuthToken(null)
            localStorage.removeItem('roles')
            if (typeof window !== 'undefined') {
                localStorage.removeItem('refreshToken')
            }
            throw error
        }
    },

    refreshToken: async () => {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null

        if (!refreshToken) {
            throw new Error('No refresh token available')
        }

        const response = await apiClient.post('v1/auth/refresh-token', {
            refreshToken
        })

        // Update tokens
        if (response.accessToken) {
            apiClient.setAuthToken(response.accessToken)
        }
        if (response.refreshToken && typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', response.refreshToken)
        }

        return response
    },

    // Forgot Password
    forgotPassword: async (emailAddress) => {
        return await apiClient.post('v1/auth/forgot-password', {
            emailAddress
        })
    },

    // Reset Password
    resetPassword: async (token, newPassword, confirmPassword) => {
        return await apiClient.post('v1/auth/reset-password', {
            token,
            newPassword,
            confirmPassword
        })
    },

    // Change Password (requires authentication)
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        return await apiClient.post('v1/auth/change-password', {
            currentPassword,
            newPassword,
            confirmPassword
        })
    },

    // Update Profile (requires authentication)
    updateProfile: async (profileData) => {
        return await apiClient.put('v1/auth/update-profile', {
            name: profileData.name,
            phoneNumber: profileData.phoneNumber,
            avatar: profileData.avatar,
            userLocation: profileData.userLocation
        })
    },

    // Check Email Availability
    checkEmail: async (emailAddress) => {
        const response = await apiClient.post('v1/auth/check-email', {
            emailAddress
        })
        // Handle the wrapped response structure
        if (response && response.data) {
            return response.data
        }
        return response
    },

    // Get Notifications (requires authentication)
    getNotifications: async (params = {}) => {
        const { page = 1, limit = 10, type } = params
        const queryParams = new URLSearchParams({
            page,
            limit,
            ...(type && { type })
        }).toString()

        return await apiClient.get(`v1/auth/notifications?${queryParams}`)
    },

    // Mark Notification as Read (requires authentication)
    markNotificationAsRead: async (notificationId) => {
        return await apiClient.post('v1/auth/notifications/read', {
            notificationId
        })
    },

    // Send Notification (admin only)
    sendNotification: async (notificationData) => {
        return await apiClient.post('v1/auth/notifications/send', {
            userId: notificationData.userId,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
            expiresAt: notificationData.expiresAt
        })
    },

    // Send Bulk Notification (admin only)
    sendBulkNotification: async (bulkData) => {
        return await apiClient.post('v1/auth/notifications/send-bulk', {
            userIds: bulkData.userIds,
            title: bulkData.title,
            message: bulkData.message,
            type: bulkData.type
        })
    }
}

export default authAPI


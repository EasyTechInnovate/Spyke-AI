import { safeLocalStorage, safeSessionStorage, safeWindow } from '@/lib/utils/browser'

class ApiClient {
    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        }
        this.isRefreshing = false
        this.refreshSubscribers = []
        this.authToken = null // Cache token in memory
    }

    // Subscribe to token refresh
    subscribeTokenRefresh(callback) {
        this.refreshSubscribers.push(callback)
    }

    // Notify all subscribers when token is refreshed
    onTokenRefreshed(token) {
        this.refreshSubscribers.forEach((callback) => callback(token))
        this.refreshSubscribers = []
    }

    // Helper method to build full URL
    buildURL(endpoint) {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
        return `${this.baseURL}/${cleanEndpoint}`
    }

    // Helper method to handle responses
    async handleResponse(response, originalRequest) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
            const error = await response
                .clone()
                .json()
                .catch(() => ({}))

            // Don't redirect if this is a login attempt or cart operation
            const isLoginAttempt = originalRequest.url.includes('/auth/login')
            const isCartOperation = originalRequest.url.includes('/cart') || originalRequest.url.includes('/purchase/cart')
            
            console.log('=== API 401 HANDLING ===')
            console.log('URL:', originalRequest.url)
            console.log('Is cart operation:', isCartOperation)
            console.log('Is login attempt:', isLoginAttempt)
            
            if (isLoginAttempt || isCartOperation) {
                throw {
                    status: response.status,
                    statusText: response.statusText,
                    message: error.message || (isLoginAttempt ? 'Invalid credentials' : 'Authentication required'),
                    data: error,
                    response: {
                        status: response.status,
                        data: error
                    }
                }
            }

            // For other 401s, clear auth and redirect
            if (!originalRequest._retry) {
                originalRequest._retry = true

                // Clear all auth data
                this.clearAuth()

                // Only redirect if not already on signin page
                const location = safeWindow.getLocation()
                if (location.pathname !== '/signin') {
                    // Store the intended destination
                    safeSessionStorage.setItem('redirectAfterLogin', location.pathname)
                    safeWindow.redirect('/signin')
                }
            }

            throw {
                status: response.status,
                statusText: response.statusText,
                message: 'Authentication required',
                authError: true,
                response: {
                    status: response.status,
                    data: error
                }
            }
        }

        // Handle other error responses
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw {
                status: response.status,
                statusText: response.statusText,
                message: error.message || `Request failed with status ${response.status}`,
                data: error,
                errors: error.errors || {},
                response: {
                    status: response.status,
                    data: error
                }
            }
        }

        // Handle successful responses
        const text = await response.text()
        return text ? JSON.parse(text) : null
    }

    // Create request with retry logic
    async makeRequest(url, options) {
        const authHeaders = this.getAuthHeaders()
        const request = {
            url,
            ...options,
            headers: {
                ...this.defaultHeaders,
                ...authHeaders,
                ...options.headers
            }
        }

        try {
            const response = await fetch(url, request)
            return this.handleResponse(response, request)
        } catch (error) {
            // Ensure error has proper structure
            if (!error.response) {
                console.error('Network or parsing error:', error)
                throw {
                    status: 0,
                    message: error.message || 'Network error occurred',
                    networkError: true,
                    originalError: error
                }
            }
            throw error
        }
    }

    // GET request
    async get(endpoint, options = {}) {
        return this.makeRequest(this.buildURL(endpoint), {
            method: 'GET',
            ...options
        })
    }

    // POST request
    async post(endpoint, data = {}, options = {}) {
        return this.makeRequest(this.buildURL(endpoint), {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        })
    }

    // PUT request
    async put(endpoint, data = {}, options = {}) {
        return this.makeRequest(this.buildURL(endpoint), {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        })
    }

    // PATCH request
    async patch(endpoint, data = {}, options = {}) {
        return this.makeRequest(this.buildURL(endpoint), {
            method: 'PATCH',
            body: JSON.stringify(data),
            ...options
        })
    }

    // DELETE request
    async delete(endpoint, options = {}) {
        return this.makeRequest(this.buildURL(endpoint), {
            method: 'DELETE',
            ...options
        })
    }

    // Improved auth header management
    getAuthHeaders() {
        // First check memory cache
        if (this.authToken) {
            return { Authorization: `Bearer ${this.authToken}` }
        }

        // Then check localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken')
            if (token) {
                this.authToken = token // Cache it
                return { Authorization: `Bearer ${token}` }
            }
        }

        return {}
    }

    // Check if authenticated
    isAuthenticated() {
        const headers = this.getAuthHeaders()
        return !!headers.Authorization
    }

    // Get current token
    getCurrentToken() {
        return this.authToken || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null)
    }

    // Set auth token
    setAuthToken(token) {
        this.authToken = token // Update memory cache

        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('authToken', token)
            } else {
                localStorage.removeItem('authToken')
            }
        }
    }

    // Clear all auth data
    clearAuth() {
        this.authToken = null

        if (typeof window !== 'undefined') {
            // Clear all possible auth keys
            const authKeys = ['authToken', 'refreshToken', 'user', 'roles', 'accessToken', 'sellerAccessToken']
            authKeys.forEach((key) => localStorage.removeItem(key))

            // Clear auth cookies
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
            document.cookie = 'roles=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

            // Clear session storage
            sessionStorage.removeItem('currentUser')
        }
    }

    // Logout method - Use centralized logout service
    async logout() {
        const { logoutService } = await import('@/lib/services/logout')
        return logoutService.logout()
    }

    // Upload file
    async upload(endpoint, formData, options = {}) {
        const url = this.buildURL(endpoint)
        const authHeaders = this.getAuthHeaders()

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    // Don't set Content-Type for FormData
                    ...options.headers
                },
                body: formData,
                ...options
            })

            return this.handleResponse(response, {
                url,
                method: 'POST',
                headers: authHeaders
            })
        } catch (error) {
            console.error('Upload error:', error)
            throw error
        }
    }

    // Download file
    async download(endpoint, filename, options = {}) {
        try {
            const response = await fetch(this.buildURL(endpoint), {
                method: 'GET',
                headers: {
                    ...this.getAuthHeaders(),
                    ...options.headers
                },
                ...options
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({}))
                throw {
                    status: response.status,
                    message: error.message || `Download failed: ${response.statusText}`
                }
            }

            const blob = await response.blob()

            // Create download link
            if (typeof window !== 'undefined') {
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = filename || 'download'
                document.body.appendChild(link)
                link.click()

                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                }, 100)
            }

            return { success: true, filename }
        } catch (error) {
            console.error('Download error:', error)
            throw error
        }
    }

    // Request with timeout
    async requestWithTimeout(endpoint, options = {}, timeout = 30000) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        try {
            const response = await this.makeRequest(this.buildURL(endpoint), {
                ...options,
                signal: controller.signal
            })
            clearTimeout(timeoutId)
            return response
        } catch (error) {
            clearTimeout(timeoutId)
            if (error.name === 'AbortError') {
                throw {
                    status: 408,
                    message: 'Request timeout',
                    timeout: true
                }
            }
            throw error
        }
    }

    // Batch requests
    async batch(requests) {
        try {
            const promises = requests.map((req) => {
                const method = req.method || 'GET'
                const endpoint = req.endpoint
                const data = req.data
                const options = req.options || {}

                switch (method.toUpperCase()) {
                    case 'GET':
                        return this.get(endpoint, options)
                    case 'POST':
                        return this.post(endpoint, data, options)
                    case 'PUT':
                        return this.put(endpoint, data, options)
                    case 'PATCH':
                        return this.patch(endpoint, data, options)
                    case 'DELETE':
                        return this.delete(endpoint, options)
                    default:
                        return Promise.reject(new Error(`Unknown method: ${method}`))
                }
            })

            return await Promise.all(promises)
        } catch (error) {
            console.error('Batch request error:', error)
            throw error
        }
    }
}

// Create singleton instance
const apiClient = new ApiClient()

// Only run in browser
if (typeof window !== 'undefined') {
    // Make it available globally for debugging
    window.apiClient = apiClient
}

// Auth API will be attached after import to avoid circular dependency

export default apiClient

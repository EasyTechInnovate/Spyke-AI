import config from '@/config'

class ApiClient {
    constructor() {
        this.baseURL = config.apiUrl
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        }
        this.isRefreshing = false
        this.refreshSubscribers = []
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
        // Remove leading slash if present
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
        return `${this.baseURL}/${cleanEndpoint}`
    }
    // Helper method to handle responses
    async handleResponse(response, originalRequest) {
        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401 && !originalRequest._retry) {
            const error = await response
                .clone()
                .json()
                .catch(() => ({}))

            // Check if this is a seller-specific endpoint
            const isSellerEndpoint = originalRequest.url.includes('/seller/')

            if (isSellerEndpoint) {
                console.error('Seller authentication failed:', {
                    endpoint: originalRequest.url,
                    hasToken: !!this.getAuthHeaders().Authorization
                })
            }

            const isLoginAttempt = originalRequest.url.includes('/auth/login')
            const isUnconfirmed = error?.message?.toLowerCase().includes('not confirmed')
            const isInvalidCreds = error?.message?.toLowerCase().includes('invalid')

            if (isLoginAttempt && (isUnconfirmed || isInvalidCreds)) {
                throw {
                    status: response.status,
                    statusText: response.statusText,
                    message: error.message || 'Login failed',
                    data: error,
                    errors: error.errors || {}
                }
            }

            // For other 401 errors
            throw {
                status: response.status,
                statusText: response.statusText,
                message: error.message || 'Authentication required. Please log in.',
                data: error,
                errors: error.errors || {},
                authError: true
            }
        }

        // Handle other error responses
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw {
                status: response.status,
                statusText: response.statusText,
                message: error.message || 'An error occurred',
                data: error,
                errors: error.errors || {}
            }
        }

        // Handle empty responses
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
            ...authHeaders,  // This should include Authorization
            ...options.headers
        }
    }
    try {
        const response = await fetch(url, request)
        return this.handleResponse(response, request)
    } catch (error) {
        // ... error handling
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

    getAuthHeaders() {
        let token = null

        if (typeof window !== 'undefined') {
            // Try multiple possible token keys
            token = localStorage.getItem('authToken') || localStorage.getItem('accessToken') || localStorage.getItem('sellerAccessToken')

            // Debug log in development
            if (process.env.NODE_ENV === 'development' && !token) {
                console.warn('No auth token found in localStorage')
            }
        }

        return token ? { Authorization: `Bearer ${token}` } : {}
    }
    isAuthenticated() {
        const headers = this.getAuthHeaders()
        return !!headers.Authorization
    }
    getCurrentToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken') || localStorage.getItem('accessToken') || localStorage.getItem('sellerAccessToken')
        }
        return null
    }

    // Set auth token
    setAuthToken(token) {
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('authToken', token)
            } else {
                localStorage.removeItem('authToken')
            }
        }
    }

    // Upload file
    async upload(endpoint, formData, options = {}) {
        try {
            const response = await fetch(this.buildURL(endpoint), {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    ...options.headers
                },
                body: formData,
                ...options
            })
            return this.handleResponse(response, {
                url: this.buildURL(endpoint),
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    ...options.headers
                }
            })
        } catch (error) {
            console.error('API Upload Error:', error)
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
                throw new Error(`Download failed: ${response.statusText}`)
            }

            const blob = await response.blob()

            // Create download link
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

            return { success: true, filename }
        } catch (error) {
            console.error('API Download Error:', error)
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
const apiClient = new ApiClient()

export default apiClient


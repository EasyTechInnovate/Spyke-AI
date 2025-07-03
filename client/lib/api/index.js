export { default as apiClient } from './client'
export { authAPI } from './auth'
import apiClient from './client'
import { authAPI } from './auth'
import sellerAPI from './seller'

const api = {
    client: apiClient,
    auth: authAPI,
    seller: sellerAPI,

    setToken: (token) => apiClient.setAuthToken(token),
    clearToken: () => apiClient.setAuthToken(null),
    getBaseURL: () => apiClient.baseURL,

    isAuthenticated: () => {
        if (typeof window === 'undefined') return false
        const token = localStorage.getItem('authToken');
        return !!token
    },

    getToken: () => {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('authToken');
    },

    handleError: (error) => {
        if (error.offline) {
            return {
                type: 'network',
                message: 'No internet connection. Please check your network and try again.',
                canRetry: true
            }
        }

        if (error.timeout) {
            return {
                type: 'timeout',
                message: 'Request timed out. Please try again.',
                canRetry: true
            }
        }

        switch (error.status) {
            case 400:
                return {
                    type: 'validation',
                    message: error.message || 'Invalid request. Please check your input.',
                    errors: error.errors || {},
                    canRetry: false
                }
            case 401:
                return {
                    type: 'authentication',
                    message: 'Your session has expired. Please log in again.',
                    canRetry: false,
                    requiresAuth: true
                }
            case 403:
                return {
                    type: 'authorization',
                    message: 'You do not have permission to perform this action.',
                    canRetry: false
                }
            case 404:
                return {
                    type: 'not_found',
                    message: error.message || 'The requested resource was not found.',
                    canRetry: false
                }
            case 409:
                return {
                    type: 'conflict',
                    message: error.message || 'This operation conflicts with existing data.',
                    canRetry: false
                }
            case 422:
                return {
                    type: 'validation',
                    message: error.message || 'The data provided is invalid.',
                    errors: error.errors || {},
                    canRetry: false
                }
            case 429:
                return {
                    type: 'rate_limit',
                    message: 'Too many requests. Please slow down and try again.',
                    canRetry: true,
                    retryAfter: error.data?.retryAfter || 60
                }
            case 500:
            case 502:
            case 503:
            case 504:
                return {
                    type: 'server',
                    message: 'Server error. Please try again later.',
                    canRetry: true
                }
            default:
                return {
                    type: 'unknown',
                    message: error.message || 'An unexpected error occurred.',
                    canRetry: true,
                    originalError: error
                }
        }
    },

    formatError: (error) => {
        const handled = api.handleError(error)
        if (handled.type === 'validation' && handled.errors) {
            const errorMessages = Object.entries(handled.errors)
                .map(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        return messages.join(', ')
                    }
                    return messages
                })
                .filter(Boolean)

            if (errorMessages.length > 0) {
                return errorMessages.join('. ')
            }
        }

        return handled.message
    }
}

export default api

export const API_ERROR_TYPES = {
    NETWORK: 'network',
    TIMEOUT: 'timeout',
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    NOT_FOUND: 'not_found',
    CONFLICT: 'conflict',
    RATE_LIMIT: 'rate_limit',
    SERVER: 'server',
    UNKNOWN: 'unknown'
}

export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
}

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
}


// File: /lib/api/admin.js

import apiClient from "./client"

export const adminAPI = {
    // Seller Management APIs
    sellers: {
        // Get all seller profiles with filters
        getProfiles: async (params = {}) => {
            const { status = 'all', page = 1, limit = 10, sortBy = 'verification.submittedAt', sortOrder = 'desc' } = params

            const queryParams = new URLSearchParams({
                status,
                page,
                limit,
                sortBy,
                sortOrder
            })

            const res = await apiClient.get(`v1/seller/admin/profiles?${queryParams}`)
            return res?.data
        },

        // Get profiles by specific status
        getByStatus: {
            fetch: async (status = 'all', page = 1, limit = 30) => {
                let url = `v1/seller/admin/profiles?page=${page}&limit=${limit}&sortBy=verification.submittedAt&sortOrder=desc`
                
                // Only add status parameter if it's not 'all'
                if (status !== 'all') {
                    url += `&status=${status}`
                }
                
                const res = await apiClient.get(url)
                return res?.data
            }
        },

        // Commission Management
        commission: {
            // Offer commission to seller
            offer: async (sellerId, rate) => {
                const res = await apiClient.post(`v1/seller/admin/commission/offer/${sellerId}`, { rate })
                return res?.data
            },

            // Accept counter offer from seller
            acceptCounter: async (sellerId) => {
                const res = await apiClient.post(`v1/seller/admin/commission/accept-counter/${sellerId}`)
                return res?.data
            },

            // Admin makes counter offer back to seller
            counterOffer: async (sellerId, rate) => {
                const res = await apiClient.post(`v1/seller/admin/commission/counter-offer/${sellerId}`, { rate })
                return res?.data
            },

            reject: async (sellerId, reason) => {
                const res = await apiClient.post(`v1/seller/admin/profile/reject/${sellerId}`, {reason})
                return res?.data
            }
        },

        profile: {
            // Reject seller profile
            reject: async (sellerId, reason) => {
                const res = await apiClient.post(`v1/seller/admin/profile/reject/${sellerId}`, { reason })
                return res?.data
            },

            // Approve seller profile (if you have this endpoint)
            approve: async (sellerId) => {
                const res = await apiClient.post(`seller/admin/profile/approve/${sellerId}`)
                return res?.data
            }
        }
    },

    // Product Management APIs (placeholder for future endpoints)
    products: {
        // Get products for moderation
        getPending: async (params = {}) => {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params
            const queryParams = new URLSearchParams({ page, limit, sortBy, sortOrder })

            const res = await apiClient.get(`products/admin/pending?${queryParams}`)
            return res?.data
        },

        // Approve product
        approve: async (productId) => {
            const res = await apiClient.post(`products/admin/approve/${productId}`)
            return res?.data
        },

        // Reject product
        reject: async (productId, reason) => {
            const res = await apiClient.post(`products/admin/reject/${productId}`, { reason })
            return res?.data
        },

        // Flag product
        flag: async (productId, reason) => {
            const res = await apiClient.post(`products/admin/flag/${productId}`, { reason })
            return res?.data
        },

        // Feature product
        feature: async (productId, featured = true) => {
            const res = await apiClient.post(`products/admin/feature/${productId}`, { featured })
            return res?.data
        }
    },

    // User Management APIs
    users: {
        // Get all users
        getAll: async (params = {}) => {
            const { page = 1, limit = 20, role, status } = params
            const queryParams = new URLSearchParams({ page, limit })
            if (role) queryParams.append('role', role)
            if (status) queryParams.append('status', status)

            const res = await apiClient.get(`users/admin/all?${queryParams}`)
            return res?.data
        },

        // Suspend user
        suspend: async (userId, reason) => {
            const res = await apiClient.post(`users/admin/suspend/${userId}`, { reason })
            return res?.data
        },

        // Activate user
        activate: async (userId) => {
            const res = await apiClient.post(`users/admin/activate/${userId}`)
            return res?.data
        }
    },

    // Revenue & Analytics APIs
    revenue: {
        // Get platform revenue
        getPlatformRevenue: async (params = {}) => {
            const { startDate, endDate, groupBy = 'day' } = params
            const queryParams = new URLSearchParams({ groupBy })
            if (startDate) queryParams.append('startDate', startDate)
            if (endDate) queryParams.append('endDate', endDate)

            const res = await apiClient.get(`revenue/admin/platform?${queryParams}`)
            return res?.data
        },

        // Get seller earnings
        getSellerEarnings: async (sellerId, params = {}) => {
            const { startDate, endDate } = params
            const queryParams = new URLSearchParams()
            if (startDate) queryParams.append('startDate', startDate)
            if (endDate) queryParams.append('endDate', endDate)

            const res = await apiClient.get(`revenue/admin/seller/${sellerId}?${queryParams}`)
            return res?.data
        },

        // Get transaction history
        getTransactions: async (params = {}) => {
            const { page = 1, limit = 50, type, status } = params
            const queryParams = new URLSearchParams({ page, limit })
            if (type) queryParams.append('type', type)
            if (status) queryParams.append('status', status)

            const res = await apiClient.get(`revenue/admin/transactions?${queryParams}`)
            return res?.data
        }
    },

    // Dashboard Overview API
    dashboard: {
        // Get overview stats
        getOverview: async () => {
            const res = await apiClient.get('admin/dashboard/overview')
            return res?.data
        },

        // Get recent activity
        getRecentActivity: async (limit = 10) => {
            const res = await apiClient.get(`admin/dashboard/activity?limit=${limit}`)
            return res?.data
        }
    },

    // Refund Management
    refunds: {
        // Get refund requests
        getRequests: async (params = {}) => {
            const { page = 1, limit = 20, status = 'pending' } = params
            const queryParams = new URLSearchParams({ page, limit, status })

            const res = await apiClient.get(`refunds/admin/requests?${queryParams}`)
            return res?.data
        },

        // Approve refund
        approve: async (refundId) => {
            const res = await apiClient.post(`refunds/admin/approve/${refundId}`)
            return res?.data
        },

        // Reject refund
        reject: async (refundId, reason) => {
            const res = await apiClient.post(`refunds/admin/reject/${refundId}`, { reason })
            return res?.data
        }
    },

    // Notification Management
    notifications: {
        // Send notification to user
        sendToUser: async (userId, notification) => {
            const res = await apiClient.post(`notifications/admin/send/user/${userId}`, notification)
            return res?.data
        },

        // Send bulk notification
        sendBulk: async (notification) => {
            const res = await apiClient.post('notifications/admin/send/bulk', notification)
            return res?.data
        },

        // Get notification templates
        getTemplates: async () => {
            const res = await apiClient.get('notifications/admin/templates')
            return res?.data
        }
    },

    // Content Management
    content: {
        // Blog management
        blog: {
            createPost: async (postData) => {
                const res = await apiClient.post('content/admin/blog/posts', postData)
                return res?.data
            },

            updatePost: async (postId, postData) => {
                const res = await apiClient.put(`content/admin/blog/posts/${postId}`, postData)
                return res?.data
            },

            deletePost: async (postId) => {
                const res = await apiClient.delete(`content/admin/blog/posts/${postId}`)
                return res?.data
            },

            getPosts: async (params = {}) => {
                const queryParams = new URLSearchParams(params)
                const res = await apiClient.get(`content/admin/blog/posts?${queryParams}`)
                return res?.data
            }
        },

        // SEO Pages
        seo: {
            createPage: async (pageData) => {
                const res = await apiClient.post('content/admin/seo/pages', pageData)
                return res?.data
            },

            updatePage: async (pageId, pageData) => {
                const res = await apiClient.put(`content/admin/seo/pages/${pageId}`, pageData)
                return res?.data
            },

            deletePage: async (pageId) => {
                const res = await apiClient.delete(`content/admin/seo/pages/${pageId}`)
                return res?.data
            },

            getPages: async (params = {}) => {
                const queryParams = new URLSearchParams(params)
                const res = await apiClient.get(`content/admin/seo/pages?${queryParams}`)
                return res?.data
            }
        }
    },

    // Campaign Management
    campaigns: {
        // Banner management
        banners: {
            create: async (bannerData) => {
                const res = await apiClient.post('campaigns/admin/banners', bannerData)
                return res?.data
            },

            update: async (bannerId, bannerData) => {
                const res = await apiClient.put(`campaigns/admin/banners/${bannerId}`, bannerData)
                return res?.data
            },

            delete: async (bannerId) => {
                const res = await apiClient.delete(`campaigns/admin/banners/${bannerId}`)
                return res?.data
            },

            getAll: async () => {
                const res = await apiClient.get('campaigns/admin/banners')
                return res?.data
            }
        },

        // Featured sellers
        featuredSellers: {
            add: async (sellerId, duration) => {
                const res = await apiClient.post('campaigns/admin/featured-sellers', { sellerId, duration })
                return res?.data
            },

            remove: async (sellerId) => {
                const res = await apiClient.delete(`campaigns/admin/featured-sellers/${sellerId}`)
                return res?.data
            },

            getAll: async () => {
                const res = await apiClient.get('campaigns/admin/featured-sellers')
                return res?.data
            }
        }
    }
}

export default adminAPI


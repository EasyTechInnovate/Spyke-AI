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
            // Offer commission to seller (also handles admin counter offers)
            offer: async (sellerId, rate) => {
                const res = await apiClient.post(`v1/seller/admin/commission/offer/${sellerId}`, { rate })
                return res?.data
            },

            // Accept counter offer from seller
            acceptCounter: async (sellerId) => {
                const res = await apiClient.post(`v1/seller/admin/commission/accept-counter/${sellerId}`)
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

            // Start review for a pending seller profile
            startReview: async (sellerId) => {
                const res = await apiClient.post(`v1/seller/admin/profile/start-review/${sellerId}`)
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
            const queryParams = new URLSearchParams({ 
                page, 
                limit, 
                sortBy, 
                sortOrder,
                status: 'pending' // Add status filter for pending products
            })

            const res = await apiClient.get(`v1/products/admin/all?${queryParams}`)
            return res?.data
        },

        // Get all products (for admin)
        getAll: async (params = {}) => {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', status } = params
            const queryParams = new URLSearchParams({ page, limit, sortBy, sortOrder })
            if (status) queryParams.append('status', status)

            const res = await apiClient.get(`v1/products/admin/all?${queryParams}`)
            return res?.data
        },

        // Approve product
        approve: async (productId) => {
            const res = await apiClient.post(`v1/products/admin/approve/${productId}`)
            return res?.data
        },

        // Reject product
        reject: async (productId, reason) => {
            const res = await apiClient.post(`v1/products/admin/reject/${productId}`, { reason })
            return res?.data
        },

        // Flag product
        flag: async (productId, reason) => {
            const res = await apiClient.post(`v1/products/admin/flag/${productId}`, { reason })
            return res?.data
        },

        // Feature product
        feature: async (productId, featured = true) => {
            const res = await apiClient.post(`v1/products/admin/feature/${productId}`, { featured })
            return res?.data
        },

        // Verify product (admin only)
        verify: async (productId, verificationData) => {
            const res = await apiClient.post(`v1/products/${productId}/verify`, verificationData)
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

    // Sales Analytics APIs
    sales: {
        // Get platform sales analytics
        getAnalytics: async (params = {}) => {
            const { startDate, endDate, groupBy = 'day' } = params
            const queryParams = new URLSearchParams({ groupBy })
            if (startDate) queryParams.append('startDate', startDate)
            if (endDate) queryParams.append('endDate', endDate)

            const res = await apiClient.get(`v1/seller/analytics/sales?${queryParams}`)
            return res?.data
        },

        // Get sales trends
        getTrends: async (params = {}) => {
            const { startDate, endDate, period = '30d' } = params
            const queryParams = new URLSearchParams({ period })
            if (startDate) queryParams.append('startDate', startDate)
            if (endDate) queryParams.append('endDate', endDate)

            const res = await apiClient.get(`v1/seller/analytics/sales/trends?${queryParams}`)
            return res?.data
        },

        // Get top performing products
        getTopProducts: async (params = {}) => {
            const { limit = 10, startDate, endDate, sortBy = 'revenue' } = params
            const queryParams = new URLSearchParams({ limit, sortBy })
            if (startDate) queryParams.append('startDate', startDate)
            if (endDate) queryParams.append('endDate', endDate)

            const res = await apiClient.get(`v1/seller/analytics/products/top?${queryParams}`)
            return res?.data
        },

        // Get sales by category
        getByCategory: async (params = {}) => {
            const { startDate, endDate } = params
            const queryParams = new URLSearchParams()
            if (startDate) queryParams.append('startDate', startDate)
            if (endDate) queryParams.append('endDate', endDate)

            const res = await apiClient.get(`v1/seller/analytics/sales/categories?${queryParams}`)
            return res?.data
        },

        // Get payment methods breakdown
        getPaymentMethods: async (params = {}) => {
            const { startDate, endDate } = params
            const queryParams = new URLSearchParams()
            if (startDate) queryParams.append('startDate', startDate)
            if (endDate) queryParams.append('endDate', endDate)

            const res = await apiClient.get(`v1/seller/analytics/payments/methods?${queryParams}`)
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
    },

    payouts: {
        // List payouts with filters
        getPayouts: async (params = {}) => {
            const { page, limit, status, sellerId, fromDate, toDate, sortBy, sortOrder } = params
            const query = new URLSearchParams()
            if (page) query.append('page', page)
            if (limit) query.append('limit', limit)
            if (status) query.append('status', status)
            if (sellerId) query.append('sellerId', sellerId)
            if (fromDate) query.append('fromDate', fromDate)
            if (toDate) query.append('toDate', toDate)
            if (sortBy) query.append('sortBy', sortBy)
            if (sortOrder) query.append('sortOrder', sortOrder)
            const res = await apiClient.get(`v1/admin/payouts${query.toString() ? `?${query}` : ''}`)
            return res?.data
        },
        // Single payout details
        getDetails: async (payoutId) => {
            const res = await apiClient.get(`v1/admin/payouts/${payoutId}`)
            return res?.data
        },
        // Approve payout
        approve: async (payoutId, { notes } = {}) => {
            const res = await apiClient.put(`v1/admin/payouts/${payoutId}/approve`, { notes })
            return res?.data
        },
        // Reject payout with reason
        reject: async (payoutId, reason) => {
            const res = await apiClient.put(`v1/admin/payouts/${payoutId}/reject`, { reason })
            return res?.data
        },
        // Put payout on hold
        hold: async (payoutId, reason) => {
            const res = await apiClient.put(`v1/admin/payouts/${payoutId}/hold`, { reason })
            return res?.data
        },
        // Release payout from hold
        release: async (payoutId) => {
            const res = await apiClient.put(`v1/admin/payouts/${payoutId}/release`)
            return res?.data
        },
        // Mark as processing (optionally supply transactionId / notes)
        markProcessing: async (payoutId, { transactionId, notes } = {}) => {
            const res = await apiClient.put(`v1/admin/payouts/${payoutId}/processing`, { transactionId, notes })
            return res?.data
        },
        // Mark as completed
        markCompleted: async (payoutId, { transactionId, notes } = {}) => {
            const res = await apiClient.put(`v1/admin/payouts/${payoutId}/completed`, { transactionId, notes })
            return res?.data
        },
        // Bulk approve payouts
        bulkApprove: async (payoutIds = [], notes) => {
            const res = await apiClient.post('v1/admin/payouts/bulk-approve', { payoutIds, notes })
            return res?.data
        },
        // Analytics (earnings over date range)
        analytics: async (params = {}) => {
            const { fromDate, toDate } = params
            const query = new URLSearchParams()
            if (fromDate) query.append('fromDate', fromDate)
            if (toDate) query.append('toDate', toDate)
            const res = await apiClient.get(`v1/admin/payouts/analytics${query.toString() ? `?${query}` : ''}`)
            return res?.data
        },
        // Platform payout settings
        settings: {
            get: async () => {
                const res = await apiClient.get('v1/admin/platform/settings')
                return res?.data
            },
            update: async (payload) => {
                const res = await apiClient.put('v1/admin/platform/settings', payload)
                return res?.data
            },
            reset: async () => {
                const res = await apiClient.post('v1/admin/platform/settings/reset')
                return res?.data
            }
        }
    }
}

export default adminAPI


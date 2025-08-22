/**
 * Notification utility functions for easy integration across the app
 */

import { formatDistanceToNow } from 'date-fns'

// Notification helper functions that can be used without hooks
export const notificationUtils = {
    // Format notification for display
    formatNotification: (notification) => ({
        ...notification,
        timeAgo: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
        isExpired: notification.expiresAt && new Date(notification.expiresAt) < new Date(),
        priority: notification.type === 'error' ? 'high' : notification.type === 'warning' ? 'medium' : 'low'
    }),

    // Group notifications by date
    groupNotificationsByDate: (notifications) => {
        const groups = {}

        notifications.forEach((notification) => {
            const date = new Date(notification.createdAt).toDateString()
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(notification)
        })

        return Object.entries(groups)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, notifications]) => ({
                date,
                notifications: notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }))
    },

    // Filter notifications by criteria
    filterNotifications: (notifications, filters = {}) => {
        return notifications.filter((notification) => {
            // Type filter
            if (filters.type && filters.type !== 'unread' && notification.type !== filters.type) {
                return false
            }

            // Unread filter
            if (filters.type === 'unread' && notification.isRead) {
                return false
            }

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase()
                return notification.title.toLowerCase().includes(searchLower) || notification.message.toLowerCase().includes(searchLower)
            }

            // Date range filter
            if (filters.dateRange) {
                const notificationDate = new Date(notification.createdAt)
                const now = new Date()

                switch (filters.dateRange) {
                    case 'today':
                        return notificationDate.toDateString() === now.toDateString()
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                        return notificationDate >= weekAgo
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                        return notificationDate >= monthAgo
                    default:
                        return true
                }
            }

            return true
        })
    },

    // Get notification statistics
    getNotificationStats: (notifications) => {
        const total = notifications.length
        const unread = notifications.filter((n) => !n.isRead).length
        const byType = notifications.reduce((acc, notification) => {
            acc[notification.type] = (acc[notification.type] || 0) + 1
            return acc
        }, {})

        const recent = notifications.filter((n) => {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            return new Date(n.createdAt) >= oneDayAgo
        }).length

        return {
            total,
            unread,
            read: total - unread,
            recent,
            byType,
            readPercentage: total > 0 ? Math.round(((total - unread) / total) * 100) : 0
        }
    },

    // Priority sorting
    sortNotificationsByPriority: (notifications) => {
        const priorityOrder = { error: 3, warning: 2, success: 1, info: 0 }

        return [...notifications].sort((a, b) => {
            // First sort by read status (unread first)
            if (a.isRead !== b.isRead) {
                return a.isRead ? 1 : -1
            }

            // Then by priority
            const aPriority = priorityOrder[a.type] || 0
            const bPriority = priorityOrder[b.type] || 0

            if (aPriority !== bPriority) {
                return bPriority - aPriority
            }

            // Finally by date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt)
        })
    }
}

// Notification type definitions for consistency
export const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
}

// Notification preset messages
export const NOTIFICATION_PRESETS = {
    // Authentication
    LOGIN_SUCCESS: {
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Welcome back!',
        message: 'You have successfully logged in.'
    },
    LOGOUT_SUCCESS: {
        type: NOTIFICATION_TYPES.INFO,
        title: 'Logged out',
        message: 'You have been successfully logged out.'
    },

    // Purchases
    PURCHASE_SUCCESS: {
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Purchase completed!',
        message: 'Your purchase has been processed successfully.'
    },
    PURCHASE_FAILED: {
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Purchase failed',
        message: 'There was an error processing your purchase. Please try again.'
    },

    // Cart
    ITEM_ADDED_TO_CART: {
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Added to cart',
        message: 'Item has been added to your cart.'
    },
    ITEM_REMOVED_FROM_CART: {
        type: NOTIFICATION_TYPES.INFO,
        title: 'Removed from cart',
        message: 'Item has been removed from your cart.'
    },

    // Profile
    PROFILE_UPDATED: {
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Profile updated',
        message: 'Your profile has been successfully updated.'
    },

    // Seller
    PRODUCT_APPROVED: {
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Product approved!',
        message: 'Your product has been approved and is now live.'
    },
    PRODUCT_REJECTED: {
        type: NOTIFICATION_TYPES.WARNING,
        title: 'Product needs review',
        message: 'Your product requires some changes before approval.'
    },

    // System
    MAINTENANCE_WARNING: {
        type: NOTIFICATION_TYPES.WARNING,
        title: 'Scheduled maintenance',
        message: 'The system will undergo maintenance shortly.'
    },
    FEATURE_ANNOUNCEMENT: {
        type: NOTIFICATION_TYPES.INFO,
        title: 'New feature available',
        message: 'Check out our latest feature updates!'
    }
}

// Helper to create custom notifications
export const createNotification = (type, title, message, options = {}) => ({
    type,
    title,
    message,
    ...options,
    createdAt: new Date().toISOString()
})

// Browser notification support (for future enhancement)
export const browserNotificationUtils = {
    // Check if browser notifications are supported
    isSupported: () => 'Notification' in window,

    // Request permission for browser notifications
    requestPermission: async () => {
        if (!browserNotificationUtils.isSupported()) {
            return 'unsupported'
        }

        const permission = await Notification.requestPermission()
        return permission
    },

    // Show browser notification
    show: (title, options = {}) => {
        if (browserNotificationUtils.isSupported() && Notification.permission === 'granted') {
            return new Notification(title, {
                icon: '/logo-icon.svg',
                badge: '/logo-icon.svg',
                ...options
            })
        }
        return null
    }
}

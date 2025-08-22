'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { authAPI } from '@/lib/api/auth'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
export function useNotifications() {
    const { user, isAuthenticated } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })
    
    // Polling interval for real-time updates
    const pollingIntervalRef = useRef(null)
    const fetchTimeoutRef = useRef(null)
    const POLLING_INTERVAL = 30000 // 30 seconds

    // Fetch notifications with pagination - Fixed dependencies
    const fetchNotifications = useCallback(async (params = {}) => {
        if (!isAuthenticated) return

        setLoading(true)
        setError(null)

        try {
            const response = await authAPI.getNotifications({
                page: params.page || 1,
                limit: params.limit || 10,
                type: params.type
            })

            const data = response?.data || response

            if (params.append) {
                setNotifications(prev => [...prev, ...data.notifications])
            } else {
                setNotifications(data.notifications || [])
            }

            setUnreadCount(data.unreadCount || 0)
            setPagination(data.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0
            })
            
            return data
        } catch (err) {
            setError(err.message || 'Failed to fetch notifications')
            console.error('Failed to fetch notifications:', err)
        } finally {
            setLoading(false)
        }
    }, [isAuthenticated]) // Removed pagination dependency to prevent loop

    // Mark notification as read - Fixed API method name
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await authAPI.markNotificationAsRead(notificationId)
            
            // Update local state
            setNotifications(prev => 
                prev.map(notification => 
                    notification._id === notificationId 
                        ? { ...notification, isRead: true, readAt: new Date().toISOString() }
                        : notification
                )
            )
            
            // Update unread count
            setUnreadCount(prev => Math.max(0, prev - 1))
            
        } catch (err) {
            console.error('Failed to mark notification as read:', err)
            // Removed toast notification
        }
    }, [])

    // Mark all as read - Updated to use new bulk endpoint
    const markAllAsRead = useCallback(async () => {
        try {
            await authAPI.markAllNotificationsRead()
            
            // Update local state - mark all notifications as read
            setNotifications(prev => 
                prev.map(notification => ({ 
                    ...notification, 
                    isRead: true, 
                    readAt: new Date().toISOString() 
                }))
            )
            
            setUnreadCount(0)
            // Removed toast notification
            
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err)
            // Removed toast notification
        }
    }, [])

    // Load more notifications (pagination)
    const loadMore = useCallback(async () => {
        if (pagination.page >= pagination.totalPages || loading) return
        
        await fetchNotifications({
            page: pagination.page + 1,
            limit: pagination.limit,
            append: true
        })
    }, [pagination.page, pagination.totalPages, pagination.limit, loading, fetchNotifications])

    // Filter notifications by type
    const filterByType = useCallback(async (type) => {
        await fetchNotifications({ type, page: 1 })
    }, [fetchNotifications])

    // Start polling - Fixed to prevent infinite calls
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current || !isAuthenticated) return
        
        pollingIntervalRef.current = setInterval(() => {
            // Only poll if user is authenticated and page is visible
            if (isAuthenticated && !document.hidden) {
                fetchNotifications({ page: 1, limit: 10 })
            }
        }, POLLING_INTERVAL)
    }, [isAuthenticated, fetchNotifications])

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
        }
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current)
            fetchTimeoutRef.current = null
        }
    }, [])

    // Initialize - Fixed dependencies to prevent infinite loop
    useEffect(() => {
        if (isAuthenticated && user) {
            // Debounce initial fetch to prevent rapid calls
            fetchTimeoutRef.current = setTimeout(() => {
                fetchNotifications()
                startPolling()
            }, 100)
        } else {
            setNotifications([])
            setUnreadCount(0)
            stopPolling()
        }

        return () => stopPolling()
    }, [isAuthenticated, user?.id]) // Only depend on authentication status and user ID

    // Handle visibility change (pause/resume polling)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling()
            } else if (isAuthenticated) {
                startPolling()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [isAuthenticated, startPolling, stopPolling])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling()
        }
    }, [stopPolling])

    // Get notifications by type
    const getNotificationsByType = useCallback((type) => {
        return notifications.filter(notification => notification.type === type)
    }, [notifications])

    // Get unread notifications
    const getUnreadNotifications = useCallback(() => {
        return notifications.filter(notification => !notification.isRead)
    }, [notifications])

    return {
        // Data
        notifications,
        unreadCount,
        pagination,
        
        // State
        loading,
        error,
        
        // Actions
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        loadMore,
        filterByType,
        
        // Utils
        getNotificationsByType,
        getUnreadNotifications,
        
        // Polling
        startPolling,
        stopPolling
    }
}

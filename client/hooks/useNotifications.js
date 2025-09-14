'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { authAPI } from '@/lib/api/auth'

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

            if (response?.data) {
                const { notifications: newNotifications = [], pagination: newPagination = {} } = response.data
                
                setNotifications(newNotifications)
                setPagination(prev => ({
                    ...prev,
                    ...newPagination
                }))
                
                // Update unread count
                const unread = newNotifications.filter(n => !n.read).length
                setUnreadCount(unread)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
            setError(error.message || 'Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }, [isAuthenticated]) // Removed dependencies that cause infinite loops

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        if (!isAuthenticated) return

        try {
            await authAPI.markNotificationAsRead(notificationId)
            
            setNotifications(prev => 
                prev.map(notification => 
                    notification._id === notificationId 
                        ? { ...notification, read: true }
                        : notification
                )
            )
            
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }, [isAuthenticated])

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!isAuthenticated) return

        try {
            await authAPI.markAllNotificationsAsRead()
            
            setNotifications(prev => 
                prev.map(notification => ({ ...notification, read: true }))
            )
            
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error)
        }
    }, [isAuthenticated])

    // Load more notifications
    const loadMore = useCallback(async () => {
        if (!isAuthenticated || loading || pagination.page >= pagination.totalPages) return

        await fetchNotifications({
            page: pagination.page + 1,
            limit: pagination.limit
        })
    }, [isAuthenticated, loading, pagination.page, pagination.totalPages, pagination.limit, fetchNotifications])

    // Filter notifications by type
    const filterByType = useCallback(async (type) => {
        await fetchNotifications({ type, page: 1 })
    }, [fetchNotifications])

    // Get unread notifications only
    const getUnreadNotifications = useCallback(() => {
        return notifications.filter(notification => !notification.read)
    }, [notifications])

    // Get notifications by type
    const getNotificationsByType = useCallback((type) => {
        return notifications.filter(notification => notification.type === type)
    }, [notifications])

    // Initial fetch
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications()
        }
    }, [isAuthenticated, fetchNotifications])

    // Start/stop polling based on authentication
    useEffect(() => {
        if (!isAuthenticated) {
            // Clear existing timeouts and intervals
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
            }
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current)
                fetchTimeoutRef.current = null
            }
            return
        }

        // Start polling only if authenticated
        const startPolling = () => {
            if (pollingIntervalRef.current) return // Already polling
            
            pollingIntervalRef.current = setInterval(() => {
                fetchNotifications()
            }, POLLING_INTERVAL)
        }

        // Small delay before starting polling to avoid immediate calls
        fetchTimeoutRef.current = setTimeout(startPolling, 2000)

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
            }
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current)
                fetchTimeoutRef.current = null
            }
        }
    }, [isAuthenticated]) // Only depend on isAuthenticated, not fetchNotifications

    // Handle visibility change (pause/resume polling)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current)
                    pollingIntervalRef.current = null
                }
                if (fetchTimeoutRef.current) {
                    clearTimeout(fetchTimeoutRef.current)
                    fetchTimeoutRef.current = null
                }
            } else if (isAuthenticated) {
                const startPolling = () => {
                    if (pollingIntervalRef.current) return // Already polling
                    
                    pollingIntervalRef.current = setInterval(() => {
                        fetchNotifications()
                    }, POLLING_INTERVAL)
                }

                fetchTimeoutRef.current = setTimeout(startPolling, 2000)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [isAuthenticated])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
            }
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current)
                fetchTimeoutRef.current = null
            }
        }
    }, [])

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
    }
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck, MoreHorizontal } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { authAPI } from '@/lib/api/auth'

export default function SimpleNotificationBell() {
    const { isAuthenticated } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [markingAllRead, setMarkingAllRead] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch notifications with more items to show more context - Show only unread notifications
    const fetchNotifications = async () => {
        if (!isAuthenticated) return

        setLoading(true)
        try {
            const response = await authAPI.getNotifications({ limit: 20 }) // Increased limit since we're filtering
            const data = response?.data || response
            
            // Filter to show only unread notifications in the bell dropdown
            const unreadNotifications = (data.notifications || []).filter(notification => !notification.isRead)
            
            setNotifications(unreadNotifications)
            setUnreadCount(data.unreadCount || 0)
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    // Mark single notification as read - Fixed API method name
    const markAsRead = async (notificationId) => {
        try {
            await authAPI.markNotificationAsRead(notificationId)
            
            // Update local state
            setNotifications(prev => 
                prev.map(notification => 
                    notification._id === notificationId 
                        ? { ...notification, isRead: true }
                        : notification
                )
            )
            
            // Update unread count
            setUnreadCount(prev => Math.max(0, prev - 1))
            
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    // Mark all notifications as read - Updated to use new bulk endpoint
    const markAllAsRead = async () => {
        if (markingAllRead) return
        
        setMarkingAllRead(true)
        try {
            // Use the new bulk API endpoint
            await authAPI.markAllNotificationsRead()
            
            // Update local state - mark all current notifications as read
            setNotifications(prev => 
                prev.map(notification => ({ 
                    ...notification, 
                    isRead: true 
                }))
            )
            
            // Set unread count to 0 since we marked ALL notifications as read
            setUnreadCount(0)
            
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        } finally {
            setMarkingAllRead(false)
        }
    }

    // Refresh notifications when dropdown opens
    const handleBellClick = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            fetchNotifications() // Always refresh when opening
        }
    }

    // Load notifications when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications()
        }
    }, [isAuthenticated])

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleBellClick}
                className="relative p-2 rounded-xl transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
                <Bell className={`w-5 h-5 transition-colors ${
                    unreadCount > 0 ? "text-brand-primary" : "text-gray-400"
                }`} />
                
                {/* Badge */}
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50 max-h-[600px]">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-white">Notifications</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                            </span>
                            
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={markingAllRead}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-brand-primary hover:bg-brand-primary/10 rounded transition-colors disabled:opacity-50"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    {markingAllRead ? 'Marking...' : 'Mark all read'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1 p-2">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                                notification.isRead 
                                                    ? 'bg-gray-800/30 text-gray-400' 
                                                    : 'bg-blue-500/10 border border-blue-500/20 text-white hover:bg-blue-500/20'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-brand-primary rounded-full mt-2 flex-shrink-0" />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm mb-1">
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-300 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(notification.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Show more indicator if there are more notifications */}
                                {unreadCount > notifications.length && (
                                    <div className="p-3 border-t border-gray-800 text-center">
                                        <p className="text-xs text-gray-400">
                                            {unreadCount - notifications.length} more unread notifications
                                        </p>
                                        <button 
                                            onClick={() => window.location.href = '/notifications'}
                                            className="text-xs text-brand-primary hover:underline mt-1"
                                        >
                                            View all notifications
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
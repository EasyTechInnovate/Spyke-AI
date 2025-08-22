'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Filter, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationItem from './NotificationItem'
import { cn } from '@/lib/utils/cn'

const NOTIFICATION_TYPES = [
    { value: '', label: 'All', color: 'bg-gray-500' },
    { value: 'info', label: 'Info', color: 'bg-blue-500' },
    { value: 'success', label: 'Success', color: 'bg-green-500' },
    { value: 'warning', label: 'Warning', color: 'bg-yellow-500' },
    { value: 'error', label: 'Error', color: 'bg-red-500' }
]

export default function NotificationBell() {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        loadMore,
        filterByType,
        pagination
    } = useNotifications()
    
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const dropdownRef = useRef(null)
    const filterRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleFilterChange = async (type) => {
        setSelectedFilter(type)
        setIsFilterOpen(false)
        await filterByType(type || undefined)
    }

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id)
        }
    }

    const selectedFilterLabel = NOTIFICATION_TYPES.find(type => type.value === selectedFilter)?.label || 'All'

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-xl transition-all duration-200",
                    "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-primary/50",
                    isOpen && "bg-white/10"
                )}
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
                <Bell className={cn(
                    "w-5 h-5 transition-colors",
                    unreadCount > 0 ? "text-brand-primary" : "text-gray-400"
                )} />
                
                {/* Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-96 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50 max-h-[600px] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Actions Row */}
                            <div className="flex items-center justify-between">
                                {/* Filter Dropdown */}
                                <div className="relative" ref={filterRef}>
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>{selectedFilterLabel}</span>
                                    </button>

                                    <AnimatePresence>
                                        {isFilterOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute top-full left-0 mt-1 w-32 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-lg z-10"
                                            >
                                                {NOTIFICATION_TYPES.map((type) => (
                                                    <button
                                                        key={type.value}
                                                        onClick={() => handleFilterChange(type.value)}
                                                        className={cn(
                                                            "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg",
                                                            selectedFilter === type.value && "bg-gray-600"
                                                        )}
                                                    >
                                                        <div className={cn("w-2 h-2 rounded-full", type.color)} />
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Mark All Read */}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                    >
                                        <CheckCheck className="w-4 h-4" />
                                        Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                    <p className="text-sm">No notifications yet</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        We'll notify you when something happens
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1 p-2">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification._id}
                                            notification={notification}
                                            onClick={() => handleNotificationClick(notification)}
                                            onMarkAsRead={() => markAsRead(notification._id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Load More */}
                            {pagination.page < pagination.totalPages && (
                                <div className="p-4 border-t border-gray-800">
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading...
                                            </div>
                                        ) : (
                                            `Load more (${pagination.total - notifications.length} remaining)`
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
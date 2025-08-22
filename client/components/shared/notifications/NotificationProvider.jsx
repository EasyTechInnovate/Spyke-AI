'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationToast from './NotificationToast'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
const NotificationContext = createContext({})

export function useNotificationProvider() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotificationProvider must be used within NotificationProvider')
    }
    return context
}

export default function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([])

    // Add a toast notification
    const addToast = useCallback((notification) => {
        const id = Date.now() + Math.random()
        const toast = {
            id,
            ...notification,
            timestamp: new Date()
        }

        setToasts(prev => [...prev, toast])

        // Auto-remove after duration (if specified)
        if (notification.duration !== 0) {
            setTimeout(() => {
                removeToast(id)
            }, notification.duration || 5000)
        }

        return id
    }, [])

    // Remove a toast notification
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    // Clear all toasts
    const clearToasts = useCallback(() => {
        setToasts([])
    }, [])

    // Show different types of toasts
    const showSuccess = useCallback((title, message, options = {}) => {
        return addToast({
            type: 'success',
            title,
            message,
            ...options
        })
    }, [addToast])

    const showError = useCallback((title, message, options = {}) => {
        return addToast({
            type: 'error',
            title,
            message,
            duration: options.duration || 7000, // Errors show longer
            ...options
        })
    }, [addToast])

    const showWarning = useCallback((title, message, options = {}) => {
        return addToast({
            type: 'warning',
            title,
            message,
            ...options
        })
    }, [addToast])

    const showInfo = useCallback((title, message, options = {}) => {
        return addToast({
            type: 'info',
            title,
            message,
            ...options
        })
    }, [addToast])

    const contextValue = {
        // Toast management
        addToast,
        removeToast,
        clearToasts,
        toasts,

        // Convenience methods
        showSuccess,
        showError,
        showWarning,
        showInfo
    }

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed inset-0 pointer-events-none z-50">
                <AnimatePresence mode="wait">
                    {toasts.map((toast, index) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                transform: `translateY(${index * 80}px)`
                            }}
                            className="pointer-events-auto"
                        >
                            <NotificationToast
                                notification={toast}
                                onClose={() => removeToast(toast.id)}
                                duration={toast.duration}
                                position="top-right"
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    )
}
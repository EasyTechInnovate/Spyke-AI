'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import NotificationContainer from './NotificationContainer'

const NotificationContext = createContext()

let notificationId = 0

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([])

    const addNotification = useCallback(({ type = 'info', message, title, duration = 4000 }) => {
        const id = ++notificationId
        const notification = { id, type, message, title, duration }
        
        setNotifications((prev) => [...prev, notification])

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, duration)
        }

        return id
    }, [])

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }, [])

    const clearAllNotifications = useCallback(() => {
        setNotifications([])
    }, [])

    // Convenience methods
    const showSuccess = useCallback((message, options = {}) => {
        return addNotification({ type: 'success', message, ...options })
    }, [addNotification])

    const showError = useCallback((message, options = {}) => {
        return addNotification({ type: 'error', message, ...options })
    }, [addNotification])

    const showWarning = useCallback((message, options = {}) => {
        return addNotification({ type: 'warning', message, ...options })
    }, [addNotification])

    const showInfo = useCallback((message, options = {}) => {
        return addNotification({ type: 'info', message, ...options })
    }, [addNotification])

    const value = {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer 
                notifications={notifications}
                onClose={removeNotification}
            />
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
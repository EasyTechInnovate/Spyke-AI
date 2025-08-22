'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { 
    Info, 
    CheckCircle, 
    AlertTriangle, 
    XCircle, 
    Check,
    Clock,
    Dot
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NOTIFICATION_ICONS = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle
}

const NOTIFICATION_COLORS = {
    info: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        icon: 'text-blue-400'
    },
    success: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-400',
        icon: 'text-green-400'
    },
    warning: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-400',
        icon: 'text-yellow-400'
    },
    error: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-400',
        icon: 'text-red-400'
    }
}

function NotificationItem({ notification, onClick, onMarkAsRead }) {
    const Icon = NOTIFICATION_ICONS[notification.type] || Info
    const colors = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.info

    const formattedTime = formatDistanceToNow(new Date(notification.createdAt), { 
        addSuffix: true 
    })

    const handleClick = (e) => {
        e.preventDefault()
        onClick?.(notification)
    }

    const handleMarkAsRead = (e) => {
        e.stopPropagation()
        onMarkAsRead?.(notification._id)
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative group cursor-pointer rounded-lg border transition-all duration-200",
                "hover:shadow-lg",
                notification.isRead 
                    ? "bg-gray-800/30 border-gray-700/50" 
                    : `${colors.bg} ${colors.border}`,
                !notification.isRead && "shadow-sm"
            )}
            onClick={handleClick}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                        "flex-shrink-0 mt-0.5",
                        notification.isRead ? "text-gray-500" : colors.icon
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h4 className={cn(
                            "font-medium text-sm mb-1 line-clamp-2",
                            notification.isRead ? "text-gray-300" : "text-white"
                        )}>
                            {notification.title}
                        </h4>

                        {/* Message */}
                        <p className={cn(
                            "text-sm line-clamp-3 mb-2",
                            notification.isRead ? "text-gray-500" : "text-gray-300"
                        )}>
                            {notification.message}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-500">{formattedTime}</span>
                                
                                {/* Type badge */}
                                <div className="flex items-center gap-1">
                                    <Dot className={cn("w-4 h-4", colors.icon)} />
                                    <span className={cn("capitalize", colors.text)}>
                                        {notification.type}
                                    </span>
                                </div>
                            </div>

                            {/* Read status */}
                            {notification.isRead ? (
                                <div className="flex items-center gap-1 text-gray-500">
                                    <Check className="w-3 h-3" />
                                    <span>Read</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleMarkAsRead}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded text-xs",
                                        "hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100",
                                        colors.text
                                    )}
                                    title="Mark as read"
                                >
                                    <Check className="w-3 h-3" />
                                    <span>Mark read</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                    <div className="absolute top-4 left-2 w-2 h-2 bg-brand-primary rounded-full" />
                )}

                {/* Expiration warning */}
                {notification.expiresAt && new Date(notification.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                    <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" 
                             title="Expires soon" />
                    </div>
                )}
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </motion.div>
    )
}

export default memo(NotificationItem)
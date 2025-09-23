'use client'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
const NOTIFICATION_STYLES = {
    success: {
        container: 'bg-green-900/20 border-green-500/30',
        gradient: 'from-green-500/50 to-emerald-500/50',
        icon: CheckCircle,
        iconColor: 'text-green-400',
        textColor: 'text-green-300'
    },
    error: {
        container: 'bg-red-900/20 border-red-500/30',
        gradient: 'from-red-500/50 to-orange-500/50',
        icon: AlertCircle,
        iconColor: 'text-red-400',
        textColor: 'text-red-300'
    },
    warning: {
        container: 'bg-yellow-900/20 border-yellow-500/30',
        gradient: 'from-yellow-500/50 to-orange-500/50',
        icon: AlertTriangle,
        iconColor: 'text-yellow-400',
        textColor: 'text-yellow-300'
    },
    info: {
        container: 'bg-blue-900/20 border-blue-500/30',
        gradient: 'from-blue-500/50 to-cyan-500/50',
        icon: Info,
        iconColor: 'text-blue-400',
        textColor: 'text-blue-300'
    }
}
export default function InlineNotification({ 
    type = 'info',
    message,
    title,
    onDismiss,
    children,
    className = ''
}) {
    if (!message && !title && !children) return null
    const styles = NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.info
    const Icon = styles.icon
    return (
        <div className={`relative mb-4 sm:mb-6 ${className}`}>
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.gradient} rounded-lg blur opacity-60`} />
            <div className={`relative flex items-start gap-3 p-3 sm:p-4 ${styles.container} rounded-lg backdrop-blur-sm`}>
                <Icon className={`w-4 sm:w-5 h-4 sm:h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
                <div className={`text-xs sm:text-sm ${styles.textColor} flex-1 min-w-0`}>
                    {title && (
                        <p className="font-medium break-words mb-1">{title}</p>
                    )}
                    {message && (
                        <p className="break-words">{message}</p>
                    )}
                    {children && (
                        <div className="mt-2">{children}</div>
                    )}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className={`${styles.iconColor} hover:text-white transition-colors p-1 flex-shrink-0`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}
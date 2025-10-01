'use client'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
const notificationConfig = {
    success: {
        icon: CheckCircle,
        bg: 'bg-gray-900/95',
        border: 'border-[#00FF89]/40',
        shadowColor: 'rgba(0, 255, 137, 0.4)',
        iconBg: 'bg-[#00FF89]/20 text-[#00FF89]',
        titleColor: 'text-[#00FF89]',
        messageColor: 'text-gray-200/90',
        progressBg: 'bg-[#00FF89]',
        closeBtnColor: 'text-gray-300 hover:text-[#00FF89] hover:bg-[#00FF89]/10'
    },
    error: {
        icon: AlertCircle,
        bg: 'bg-red-950/90',
        border: 'border-red-500/40',
        shadowColor: 'rgba(239, 68, 68, 0.4)',
        iconBg: 'bg-red-500/20 text-red-400',
        titleColor: 'text-red-100',
        messageColor: 'text-red-200/90',
        progressBg: 'bg-red-400',
        closeBtnColor: 'text-red-300 hover:text-red-200 hover:bg-red-500/10'
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-gray-900/95',
        border: 'border-[#FFC050]/40',
        shadowColor: 'rgba(255, 192, 80, 0.4)',
        iconBg: 'bg-[#FFC050]/20 text-[#FFC050]',
        titleColor: 'text-[#FFC050]',
        messageColor: 'text-gray-200/90',
        progressBg: 'bg-[#FFC050]',
        closeBtnColor: 'text-gray-300 hover:text-[#FFC050] hover:bg-[#FFC050]/10'
    },
    info: {
        icon: Info,
        bg: 'bg-gray-900/95',
        border: 'border-gray-600/40',
        shadowColor: 'rgba(107, 114, 128, 0.4)',
        iconBg: 'bg-gray-600/20 text-gray-400',
        titleColor: 'text-gray-100',
        messageColor: 'text-gray-300/90',
        progressBg: 'bg-gray-500',
        closeBtnColor: 'text-gray-400 hover:text-gray-200 hover:bg-gray-600/10'
    }
}
const titleMap = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info'
}
export default function Notification({ 
    id,
    type = 'info', 
    message, 
    title,
    duration = 4000,
    onClose,
    onClick 
}) {
    // Edge case: handle invalid type
    const safeType = notificationConfig[type] ? type : 'info'
    const config = notificationConfig[safeType]
    const IconComponent = config.icon
    const displayTitle = title || titleMap[safeType]
    
    // Edge case: handle empty or undefined message
    const safeMessage = message || 'No message provided'

    useEffect(() => {
        // Edge case: handle duration 0 or negative values
        if (duration > 0 && onClose && id) {
            const timer = setTimeout(() => {
                onClose(id)
            }, duration)
            return () => clearTimeout(timer)
        }
        
        // Edge case: auto-cleanup notifications without duration after 30 seconds
        if (duration <= 0 && onClose && id) {
            const fallbackTimer = setTimeout(() => {
                onClose(id)
            }, 30000) // 30 seconds fallback
            return () => clearTimeout(fallbackTimer)
        }
    }, [duration, onClose, id])

    // Edge case: handle missing onClose function
    const handleClose = (e) => {
        e?.stopPropagation()
        if (onClose && id) {
            onClose(id)
        }
    }

    // Edge case: handle missing onClick function
    const handleClick = () => {
        if (onClick && id) {
            onClick(id)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="max-w-sm w-full cursor-pointer"
            style={{ fontFamily: 'var(--font-league-spartan)' }}
            onClick={handleClick}>
            <div className={`
                relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl
                transform transition-all duration-300 hover:scale-[1.02]
                ${config.bg} ${config.border}
            `}>
                <div 
                    className="absolute inset-0 rounded-2xl opacity-60 animate-pulse" 
                    style={{ boxShadow: `0 0 20px ${config.shadowColor}` }} 
                />
                <div className="relative p-4">
                    <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg}`}>
                            <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-base font-semibold ${config.titleColor}`}>
                                {displayTitle}
                            </div>
                            <p className={`text-sm leading-relaxed mt-1 break-words ${config.messageColor}`}>
                                {safeMessage}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className={`flex-shrink-0 p-1 rounded-lg transition-colors ${config.closeBtnColor}`}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    {duration > 0 && (
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                            className={`absolute bottom-0 left-0 h-1 rounded-b-2xl ${config.progressBg}`}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    )
}
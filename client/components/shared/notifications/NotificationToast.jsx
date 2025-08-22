'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const TOAST_ICONS = {
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
    error: XCircle
}

const TOAST_COLORS = {
    success: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
        icon: 'text-green-400'
    },
    warning: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        icon: 'text-yellow-400'
    },
    info: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: 'text-blue-400'
    },
    error: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'text-red-400'
    }
}

export default function NotificationToast({ 
    notification, 
    onClose, 
    duration = 5000,
    position = 'top-right' 
}) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false)
                setTimeout(() => onClose?.(), 300) // Wait for exit animation
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    const Icon = TOAST_ICONS[notification.type] || Info
    const colors = TOAST_COLORS[notification.type] || TOAST_COLORS.info

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300)
    }

    const getPositionClasses = () => {
        switch (position) {
            case 'top-left':
                return 'top-6 left-6'
            case 'top-center':
                return 'top-6 left-1/2 transform -translate-x-1/2'
            case 'top-right':
                return 'top-6 right-6'
            case 'bottom-left':
                return 'bottom-6 left-6'
            case 'bottom-center':
                return 'bottom-6 left-1/2 transform -translate-x-1/2'
            case 'bottom-right':
                return 'bottom-6 right-6'
            default:
                return 'top-6 right-6'
        }
    }

    const getAnimationProps = () => {
        const isTop = position.includes('top')
        const isLeft = position.includes('left')
        const isCenter = position.includes('center')
        
        if (isCenter) {
            return {
                initial: { opacity: 0, y: isTop ? -50 : 50, scale: 0.9 },
                animate: { opacity: 1, y: 0, scale: 1 },
                exit: { opacity: 0, y: isTop ? -50 : 50, scale: 0.9 }
            }
        }
        
        return {
            initial: { 
                opacity: 0, 
                x: isLeft ? -50 : 50, 
                y: isTop ? -20 : 20,
                scale: 0.9 
            },
            animate: { opacity: 1, x: 0, y: 0, scale: 1 },
            exit: { 
                opacity: 0, 
                x: isLeft ? -50 : 50, 
                y: isTop ? -20 : 20,
                scale: 0.9 
            }
        }
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    {...getAnimationProps()}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={cn(
                        'fixed z-50 max-w-sm w-full',
                        getPositionClasses()
                    )}
                >
                    <div className={cn(
                        'p-4 rounded-lg border backdrop-blur-sm shadow-lg',
                        colors.bg,
                        colors.border
                    )}>
                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={cn('flex-shrink-0 mt-0.5', colors.icon)}>
                                <Icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white text-sm mb-1">
                                    {notification.title}
                                </h4>
                                <p className="text-sm text-gray-300">
                                    {notification.message}
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        {duration > 0 && (
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-b-lg overflow-hidden"
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: duration / 1000, ease: 'linear' }}
                            />
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
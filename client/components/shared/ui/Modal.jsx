'use client'
import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}) {
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])
  const handleOverlayClick = useCallback((e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }, [closeOnOverlayClick, onClose])
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleOverlayClick}
          >
            <div className="min-h-screen px-4 py-6 sm:py-8 flex items-end sm:items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className={cn(
                  'w-full bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden',
                  'border border-gray-800',
                  sizeClasses[size],
                  className
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    {title && (
                      <h2 className="text-xl font-semibold text-white">{title}</h2>
                    )}
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className="ml-auto p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Close modal"
                      >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                      </button>
                    )}
                  </div>
                )}
                <div className="max-h-[calc(100vh-8rem)] sm:max-h-[calc(85vh-8rem)] overflow-y-auto">
                  <div className="p-6">
                    {children}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react'
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', 
  loading = false,
  icon: CustomIcon = null
}) {
  if (!isOpen) return null
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmText: 'text-white',
          defaultIcon: AlertTriangle
        }
      case 'success':
        return {
          iconBg: 'bg-green-500/20',
          iconColor: 'text-green-400',
          confirmBg: 'bg-green-600 hover:bg-green-700',
          confirmText: 'text-white',
          defaultIcon: CheckCircle
        }
      case 'warning':
        return {
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          confirmText: 'text-white',
          defaultIcon: AlertTriangle
        }
      default:
        return {
          iconBg: 'bg-[#00FF89]/20',
          iconColor: 'text-[#00FF89]',
          confirmBg: 'bg-[#00FF89] hover:bg-[#00FF89]/90',
          confirmText: 'text-[#121212]',
          defaultIcon: CheckCircle
        }
    }
  }
  const styles = getTypeStyles()
  const IconComponent = CustomIcon || styles.defaultIcon
  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      console.error('Confirmation action failed:', error)
    }
  }
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-[#1f1f1f] border border-[#00FF89]/20 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${styles.iconBg}`}>
                <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-[#00FF89]">{title}</h3>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
          <div className="mb-6">
            <p className="text-gray-300 leading-relaxed">{message}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-gray-200 font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 ${styles.confirmBg} ${styles.confirmText} font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
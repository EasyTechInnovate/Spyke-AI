'use client'
import { memo } from 'react'
import { motion } from 'framer-motion'
export const LoadingBadge = memo(({ count, loading, className = '' }) => {
  if (!count && !loading) return null
  return (
    <span
      className={`px-2 py-1 text-xs bg-[#00FF89]/10 text-[#00FF89] rounded-lg font-medium transition-all duration-300 ${
        loading ? 'animate-pulse' : ''
      } ${className}`}>
      {loading ? (
        <div className="w-3 h-3 border border-[#00FF89]/30 border-t-[#00FF89] rounded-full animate-spin" />
      ) : (
        count
      )}
    </span>
  )
})
LoadingBadge.displayName = 'LoadingBadge'
export const MetricCard = memo(({ title, value, icon: Icon, color = 'blue', loading = false, onClick }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  }
  const Component = onClick ? motion.button : motion.div
  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-colors ${
        onClick ? 'hover:bg-white/10 cursor-pointer' : 'hover:bg-white/10'
      }`}
      whileHover={{ y: -2 }}
      onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="space-y-1">
        {loading ? (
          <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
        ) : (
          <p className="text-3xl font-bold text-white">{value}</p>
        )}
        <p className="text-gray-400 text-sm font-medium">{title}</p>
      </div>
    </Component>
  )
})
MetricCard.displayName = 'MetricCard'
export const StatusBadge = memo(({ status, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-gray-500/20 text-gray-300',
    success: 'bg-emerald-500/20 text-emerald-300',
    warning: 'bg-amber-500/20 text-amber-300',
    error: 'bg-rose-500/20 text-rose-300',
    info: 'bg-blue-500/20 text-blue-300',
    pending: 'bg-orange-500/20 text-orange-300'
  }
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {status}
    </span>
  )
})
StatusBadge.displayName = 'StatusBadge'
export const LoadingSkeleton = memo(({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 bg-gray-800 rounded',
    text: 'h-4 bg-gray-800 rounded',
    card: 'h-32 bg-gray-800 rounded-xl',
    avatar: 'w-10 h-10 bg-gray-800 rounded-full',
    button: 'h-10 bg-gray-800 rounded-lg'
  }
  return <div className={`animate-pulse ${variants[variant]} ${className}`} />
})
LoadingSkeleton.displayName = 'LoadingSkeleton'
export const EmptyState = memo(({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = '' 
}) => (
  <div className={`text-center py-12 ${className}`}>
    {Icon && (
      <Icon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
    )}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {description && (
      <p className="text-gray-400 mb-6 max-w-sm mx-auto">{description}</p>
    )}
    {action}
  </div>
))
EmptyState.displayName = 'EmptyState'
export const ErrorState = memo(({ 
  title = 'Something went wrong', 
  description, 
  onRetry, 
  className = '' 
}) => (
  <div className={`text-center py-12 ${className}`}>
    <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {description && (
      <p className="text-gray-400 mb-6">{description}</p>
    )}
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
        Try Again
      </button>
    )}
  </div>
))
ErrorState.displayName = 'ErrorState'
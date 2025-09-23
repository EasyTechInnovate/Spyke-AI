'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ShoppingCart, Loader2 } from 'lucide-react'
export default function AuthButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false,
  icon: Icon = ShoppingCart,
  loadingText = 'Processing...',
  requiresAuth = true,
  ...props 
}) {
  const { isAuthenticated, requireAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const handleClick = async (e) => {
    e.preventDefault()
    if (disabled || loading) return
    if (requiresAuth && !isAuthenticated) {
      requireAuth()
      return
    }
    if (onClick) {
      setLoading(true)
      try {
        await onClick(e)
      } catch (error) {
        console.error('Button action failed:', error)
      } finally {
        setLoading(false)
      }
    }
  }
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-primary text-black hover:bg-brand-primary/90 font-semibold'
      case 'secondary':
        return 'bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40'
      case 'outline':
        return 'border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white'
      case 'ghost':
        return 'text-gray-400 hover:text-white hover:bg-gray-800'
      default:
        return 'bg-brand-primary text-black hover:bg-brand-primary/90 font-semibold'
    }
  }
  const baseClasses = `
    inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
    transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${getVariantClasses()}
    ${className}
  `
  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={baseClasses}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </button>
  )
}
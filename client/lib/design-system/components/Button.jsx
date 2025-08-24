'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

const buttonVariants = {
  variant: {
    primary: 'bg-[#00FF89] text-black hover:bg-[#00FF89]/90 focus:ring-[#00FF89]/20',
    secondary: 'border border-white/20 text-white bg-transparent hover:border-white/40 hover:bg-white/5 focus:ring-white/20',
    outline: 'border border-[#00FF89]/20 text-[#00FF89] bg-transparent hover:border-[#00FF89]/40 hover:bg-[#00FF89]/5 focus:ring-[#00FF89]/20',
    ghost: 'text-gray-300 bg-transparent hover:bg-white/5 hover:text-white focus:ring-white/20',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20'
  },
  size: {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14'
  }
}

const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Variant styles
        buttonVariants.variant[variant],
        
        // Size styles
        buttonVariants.size[size],
        
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button, buttonVariants }
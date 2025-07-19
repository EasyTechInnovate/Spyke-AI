'use client'

import { cn } from '@/lib/utils/cn'

export default function ResponsiveContainer({ 
  children, 
  className = '',
  maxWidth = '7xl',
  padding = 'default'
}) {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'none': 'max-w-none'
  }

  const paddingClasses = {
    'none': '',
    'sm': 'px-2 sm:px-4',
    'default': 'px-4 sm:px-6 lg:px-8',
    'lg': 'px-6 sm:px-8 lg:px-12'
  }

  const baseClasses = `
    w-full mx-auto
    ${maxWidthClasses[maxWidth] || maxWidthClasses['7xl']}
    ${paddingClasses[padding] || paddingClasses['default']}
  `

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  )
}
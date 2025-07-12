import { cn } from '@/lib/utils/cn'
import { ChevronDown } from 'lucide-react'

export default function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none px-4 py-3 pr-10",
          "bg-white dark:bg-brand-dark border-2 border-gray-200 dark:border-gray-700 rounded-lg",
          "text-brand-dark dark:text-brand-primary",
          "focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
          "transition-all duration-200 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>
  )
}
'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SearchBar({ className, placeholder = "Search AI prompts, tools, and solutions...", ...props }) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="search"
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-brand-dark border-2 border-gray-200 dark:border-gray-700 rounded-xl text-brand-dark dark:text-brand-primary placeholder:text-gray-500 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
        {...props}
      />
    </div>
  )
}
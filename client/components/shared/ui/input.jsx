import { cn } from '@/lib/utils/cn'

export default function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "w-full px-4 py-3 bg-white dark:bg-brand-dark border-2 border-gray-200 dark:border-gray-700 rounded-lg",
        "text-brand-dark dark:text-brand-primary placeholder:text-gray-500",
        "focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
        "transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}
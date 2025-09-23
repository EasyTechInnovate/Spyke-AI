import { cn } from '@/lib/utils/cn'
export default function Card({ className, children, hover = true, ...props }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
        hover && "transition-all duration-300 hover:shadow-lg hover:border-brand-primary/50 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
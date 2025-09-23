import { cn } from '@/lib/utils/cn'
export default function Container({ className, children, ...props }) {
  return (
    <div
      className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  )
}
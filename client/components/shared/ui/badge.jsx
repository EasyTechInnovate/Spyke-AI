import { cn } from '@/lib/utils/cn'

const variants = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  primary: "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20",
  secondary: "bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20",
  success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  new: "bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
}

export default function Badge({ className, variant = "default", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
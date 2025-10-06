import { cn } from '@/lib/utils/cn'

const variants = {
  default: "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
  subtleDark: "bg-[#0F1115] rounded-xl border border-white/5 overflow-hidden",
  translucent: "bg-[#0F1115]/60 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden",
  elevated: "bg-[#121A21] rounded-xl border border-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_14px_-2px_rgba(0,0,0,0.55)] overflow-hidden"
}

export default function Card({ className, children, hover = true, variant = 'default', hoverGlow = false, ...props }) {
  const base = variants[variant] || variants.default
  return (
    <div
      className={cn(
        base,
        hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]",
        hover && variant === 'subtleDark' && "hover:border-[#00FF89]/40",
        hoverGlow && "shadow-[0_0_0_1px_rgba(0,255,137,0.15),0_0_0_4px_rgba(0,255,137,0.08)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
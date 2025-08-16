'use client'

const cardVariants = {
  default: 'bg-[--bg-surface] border border-white/10',
  elevated: 'bg-[--bg-surface] border border-white/10 shadow-lg shadow-black/20',
  outline: 'bg-transparent border border-white/20',
  ghost: 'bg-transparent border-0'
}

const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4 lg:p-6',
  lg: 'p-6 lg:p-8'
}

const colorVariants = {
  primary: 'text-[--brand-primary] bg-[--brand-primary]/10',
  secondary: 'text-[--brand-secondary] bg-[--brand-secondary]/10',
  success: 'text-emerald-400 bg-emerald-400/10',
  warning: 'text-amber-400 bg-amber-400/10',
  error: 'text-red-400 bg-red-400/10',
  info: 'text-blue-400 bg-blue-400/10'
}

export function Card({ children, className = '', variant = 'default', padding = 'md' }) {
  return (
    <div className={`rounded-xl transition-all ${cardVariants[variant]} ${paddingVariants[padding]} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`pb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-4 ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel = 'vs last month',
  color = 'primary',
  loading = false,
  onClick 
}) {
  const isClickable = !!onClick
  const Component = isClickable ? 'button' : 'div'

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-white/10 rounded"></div>
            <div className="h-8 w-16 bg-white/10 rounded"></div>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={isClickable ? 'hover:scale-[1.02] cursor-pointer' : ''}>
      <Component 
        className="w-full text-left"
        onClick={onClick}
        disabled={loading}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-[--text-secondary] font-medium">{label}</p>
            <p className="text-2xl lg:text-3xl font-bold text-[--text-primary]">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                <span className={`text-xs font-medium ${
                  trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-[--text-secondary]'
                }`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
                <span className="text-xs text-[--text-secondary]">{trendLabel}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorVariants[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Component>
    </Card>
  )
}

export function MetricCard({ 
  label, 
  value, 
  subValue, 
  trend, 
  icon: Icon, 
  color = '--brand-primary',
  size = 'md' 
}) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl lg:text-2xl',
    lg: 'text-2xl lg:text-3xl'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[--text-secondary]">{label}</p>
        {Icon && (
          <Icon 
            className="w-4 h-4 text-[--text-secondary]" 
            style={{ color }} 
          />
        )}
      </div>
      
      <div className="space-y-1">
        <p className={`font-bold text-[--text-primary] ${sizeClasses[size]}`}>
          {value}
        </p>
        
        {subValue && (
          <p className="text-sm text-[--text-secondary]">{subValue}</p>
        )}
        
        {trend && (
          <div className="flex items-center gap-1">
            <span 
              className={`text-xs font-semibold ${
                trend.direction === 'up' 
                  ? 'text-emerald-400' 
                  : trend.direction === 'down' 
                    ? 'text-red-400' 
                    : 'text-[--text-secondary]'
              }`}
            >
              {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-[--text-secondary]">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
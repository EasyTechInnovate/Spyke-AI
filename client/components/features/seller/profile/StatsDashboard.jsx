'use client'

import { DollarSign, ShoppingCart, Package, Star, TrendingUp, Eye } from 'lucide-react'
import { StatCard } from './Cards'

export function StatsDashboard({ stats, loading, onStatClick }) {
  if (!stats && !loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <StatCard key={i} loading={true} />
        ))}
      </div>
    )
  }

  const statItems = [
    {
      key: 'earnings',
      label: 'Total Earnings',
      value: stats?.earnings?.value || '$0',
      icon: DollarSign,
      trend: stats?.earnings?.delta,
      color: 'primary'
    },
    {
      key: 'sales',
      label: 'Total Sales',
      value: stats?.sales?.value || 0,
      icon: ShoppingCart,
      trend: stats?.sales?.delta,
      color: 'secondary'
    },
    {
      key: 'products',
      label: 'Products',
      value: stats?.products?.value || 0,
      icon: Package,
      trend: stats?.products?.delta,
      color: 'info'
    },
    {
      key: 'rating',
      label: 'Avg Rating',
      value: stats?.rating?.value?.toFixed(1) || '0.0',
      icon: Star,
      trend: stats?.rating?.delta,
      color: 'warning'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statItems.map((stat) => (
        <StatCard
          key={stat.key}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          color={stat.color}
          loading={loading}
          onClick={onStatClick ? () => onStatClick(stat.key) : undefined}
        />
      ))}
    </div>
  )
}

export function PerformanceMetrics({ stats, loading }) {
  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 animate-pulse">
        <div className="h-5 sm:h-6 w-24 sm:w-32 bg-white/10 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 sm:h-16 bg-white/10 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const metrics = [
    {
      label: 'Profile Views',
      value: stats?.views?.value || 0,
      trend: { value: stats?.views?.delta || 0, direction: 'up' },
      icon: Eye
    },
    {
      label: 'Conversion Rate',
      value: `${(stats?.conversion?.value || 0).toFixed(1)}%`,
      trend: { value: stats?.conversion?.delta || 0, direction: 'up' },
      icon: TrendingUp
    },
    {
      label: 'Avg Order Value',
      value: stats?.earnings?.raw && stats?.sales?.value 
        ? `$${(stats.earnings.raw / stats.sales.value).toFixed(0)}` 
        : '$0',
      trend: { value: 8.5, direction: 'up' },
      icon: DollarSign
    },
    {
      label: 'Customer Rating',
      value: `${(stats?.rating?.value || 0).toFixed(1)}/5`,
      trend: { value: stats?.rating?.delta || 0, direction: 'up' },
      icon: Star
    }
  ]

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-[--text-primary]">Performance</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="p-3 sm:p-4 rounded-lg bg-white/5">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-[--text-secondary] truncate pr-2">{metric.label}</span>
              <metric.icon className="w-3 h-3 sm:w-4 sm:h-4 text-[--text-secondary] flex-shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-bold text-[--text-primary] truncate">{metric.value}</div>
            {metric.trend && (
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs font-medium ${
                  metric.trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {metric.trend.direction === 'up' ? '↗' : '↘'} {metric.trend.value}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
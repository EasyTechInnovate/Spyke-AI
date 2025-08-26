'use client'

import { FunnelChart, Funnel, LabelList, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { TrendingDown, Eye, ShoppingCart, CreditCard, Target } from 'lucide-react'

const FUNNEL_COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B']

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-300 text-sm font-medium">{data.name}</p>
        <p className="text-white text-lg font-semibold">{data.value.toLocaleString()}</p>
        <p className="text-gray-400 text-xs">
          {data.payload.percentage}% conversion rate
        </p>
      </div>
    )
  }
  return null
}

const FunnelStep = ({ icon: Icon, title, value, percentage, color, isLast = false }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#121212] border border-gray-800">
    <div className={`p-3 rounded-xl border`} style={{ 
      backgroundColor: `${color}20`, 
      borderColor: `${color}50`, 
      color 
    }}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="text-xs text-gray-400">{value.toLocaleString()} users</p>
    </div>
    <div className="text-right">
      <div className="text-lg font-bold text-white">{percentage}%</div>
      <div className="text-xs text-gray-400">conversion</div>
    </div>
    {!isLast && (
      <div className="flex items-center">
        <TrendingDown className="w-4 h-4 text-gray-600" />
      </div>
    )}
  </div>
)

export default function ConversionFunnelChart({ analytics = {}, className = "" }) {
  // Process real analytics data into funnel format
  const views = analytics.views || 0
  const carts = analytics.carts || 0
  const purchases = analytics.purchases || 0
  
  // Calculate conversion rates
  const cartConversion = views > 0 ? ((carts / views) * 100).toFixed(1) : 0
  const purchaseConversion = carts > 0 ? ((purchases / carts) * 100).toFixed(1) : 0
  const overallConversion = views > 0 ? ((purchases / views) * 100).toFixed(1) : 0

  const funnelData = [
    { 
      name: 'Product Views', 
      value: views, 
      percentage: 100,
      fill: FUNNEL_COLORS[0]
    },
    { 
      name: 'Cart Additions', 
      value: carts, 
      percentage: parseFloat(cartConversion),
      fill: FUNNEL_COLORS[1]
    },
    { 
      name: 'Purchases', 
      value: purchases, 
      percentage: parseFloat(purchaseConversion),
      fill: FUNNEL_COLORS[2]
    }
  ]

  const funnelSteps = [
    { icon: Eye, title: 'Product Views', value: views, percentage: 100, color: '#00FF89' },
    { icon: ShoppingCart, title: 'Cart Additions', value: carts, percentage: parseFloat(cartConversion), color: '#3B82F6' },
    { icon: CreditCard, title: 'Purchases', value: purchases, percentage: parseFloat(overallConversion), color: '#8B5CF6', isLast: true }
  ]

  return (
    <div className={`bg-[#1f1f1f] border border-gray-800 rounded-2xl ${className}`}>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Conversion Funnel</h3>
            <p className="text-sm text-gray-400">Track your sales funnel performance</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-[#00FF89]">{views.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">{overallConversion}%</div>
            <div className="text-xs text-gray-400">Overall CVR</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{purchases}</div>
            <div className="text-xs text-gray-400">Conversions</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {views > 0 ? (
          <>
            {/* Funnel Steps */}
            <div className="space-y-3 mb-6">
              {funnelSteps.map((step, index) => (
                <FunnelStep
                  key={index}
                  icon={step.icon}
                  title={step.title}
                  value={step.value}
                  percentage={step.percentage}
                  color={step.color}
                  isLast={step.isLast}
                />
              ))}
            </div>

            {/* Visual Funnel Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive={true}
                  >
                    <LabelList position="center" fill="#fff" fontSize="12" />
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>

            {/* Optimization Tips */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-sm font-semibold text-white mb-3">Optimization Insights</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {cartConversion < 10 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="text-amber-400 font-medium">Improve Cart Conversion</div>
                    <div className="text-amber-300">Add better product descriptions</div>
                  </div>
                )}
                {purchaseConversion < 20 && carts > 0 && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="text-blue-400 font-medium">Reduce Cart Abandonment</div>
                    <div className="text-blue-300">Simplify checkout process</div>
                  </div>
                )}
                {overallConversion > 5 && (
                  <div className="p-3 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-lg">
                    <div className="text-[#00FF89] font-medium">Great Performance!</div>
                    <div className="text-green-300">Your funnel is optimized</div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-80 flex items-center justify-center text-center">
            <div>
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No funnel data</h3>
              <p className="text-gray-400">Start getting product views to see conversion analytics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
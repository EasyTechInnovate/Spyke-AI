'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, Target, Calendar, Zap } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-300 text-sm font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-400 text-xs">{entry.name}:</span>
            <span className="text-white text-sm font-semibold">
              {entry.name.includes('Rate') || entry.name.includes('Growth') 
                ? `${entry.value}%` 
                : entry.name.includes('Revenue') || entry.name.includes('Value')
                ? `$${entry.value}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function TrendAnalysisChart({ data, className = "" }) {
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'growthRate'])

  // Sample trend data - replace with real API data
  const trendData = data || [
    { period: 'Week 1', revenue: 1200, sales: 15, growthRate: 12.5, conversionRate: 6.1, avgOrderValue: 80 },
    { period: 'Week 2', revenue: 1350, sales: 18, growthRate: 12.5, conversionRate: 6.2, avgOrderValue: 75 },
    { period: 'Week 3', revenue: 1520, sales: 19, growthRate: 12.6, conversionRate: 6.4, avgOrderValue: 80 },
    { period: 'Week 4', revenue: 1680, sales: 21, growthRate: 10.5, conversionRate: 6.5, avgOrderValue: 80 },
    { period: 'Week 5', revenue: 1850, sales: 23, growthRate: 10.1, conversionRate: 6.6, avgOrderValue: 80.4 },
    { period: 'Week 6', revenue: 2100, sales: 25, growthRate: 13.5, conversionRate: 6.8, avgOrderValue: 84 },
    { period: 'Week 7', revenue: 2340, sales: 28, growthRate: 11.4, conversionRate: 7.0, avgOrderValue: 83.6 },
    { period: 'Week 8', revenue: 2580, sales: 31, growthRate: 10.3, conversionRate: 7.1, avgOrderValue: 83.2 }
  ]

  const availableMetrics = [
    { key: 'revenue', label: 'Revenue', color: '#00FF89' },
    { key: 'sales', label: 'Sales', color: '#3B82F6' },
    { key: 'growthRate', label: 'Growth Rate', color: '#8B5CF6' },
    { key: 'conversionRate', label: 'Conversion Rate', color: '#F59E0B' },
    { key: 'avgOrderValue', label: 'Avg Order Value', color: '#EF4444' }
  ]

  const toggleMetric = (metricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        return prev.filter(m => m !== metricKey)
      } else {
        return [...prev, metricKey]
      }
    })
  }

  // Calculate insights
  const latestData = trendData[trendData.length - 1]
  const previousData = trendData[trendData.length - 2]
  const revenueGrowth = ((latestData.revenue - previousData.revenue) / previousData.revenue * 100).toFixed(1)
  const averageGrowth = (trendData.reduce((sum, item) => sum + item.growthRate, 0) / trendData.length).toFixed(1)

  return (
    <div className={`bg-[#1f1f1f] border border-gray-800 rounded-2xl ${className}`}>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Trend Analysis</h3>
              <p className="text-sm text-gray-400">Track performance trends over time</p>
            </div>
          </div>
        </div>

        {/* Metric Selectors */}
        <div className="flex flex-wrap gap-2 mb-4">
          {availableMetrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                selectedMetrics.includes(metric.key)
                  ? 'text-white border-gray-600'
                  : 'bg-[#121212] text-gray-400 hover:text-white border-gray-700'
              }`}
              style={selectedMetrics.includes(metric.key) ? { 
                backgroundColor: `${metric.color}20`,
                borderColor: `${metric.color}50`,
                color: metric.color
              } : {}}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{revenueGrowth}%</div>
            <div className="text-xs text-gray-400">Revenue Growth</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">{averageGrowth}%</div>
            <div className="text-xs text-gray-400">Avg Growth Rate</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#00FF89]">${latestData.avgOrderValue}</div>
            <div className="text-xs text-gray-400">Latest AOV</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="period" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Target line for growth rate */}
              {selectedMetrics.includes('growthRate') && (
                <ReferenceLine y={10} stroke="#F59E0B" strokeDasharray="5 5" opacity={0.5} />
              )}
              
              {selectedMetrics.map((metricKey) => {
                const metric = availableMetrics.find(m => m.key === metricKey)
                return (
                  <Line
                    key={metricKey}
                    type="monotone"
                    dataKey={metricKey}
                    stroke={metric.color}
                    strokeWidth={3}
                    dot={{ fill: metric.color, r: 4 }}
                    activeDot={{ r: 6, fill: metric.color }}
                    name={metric.label}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Trend Summary */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="text-center">
              <div className="text-[#00FF89] font-semibold">Revenue Trend</div>
              <div className="text-gray-400">↗ Growing steadily</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-semibold">Growth Rate</div>
              <div className="text-gray-400">📊 Above target</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 font-semibold">Conversion</div>
              <div className="text-gray-400">🎯 Improving</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-semibold">Order Value</div>
              <div className="text-gray-400">💰 Stable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
`
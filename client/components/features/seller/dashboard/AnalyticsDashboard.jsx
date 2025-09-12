'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Area, AreaChart } from 'recharts'
import { BarChart3, Calendar, Filter, Download, Users, ShoppingCart, Package, Activity } from 'lucide-react'
import { SELLER_TAB_OPTIONS, SELLER_ANALYTICS_TABS } from '@/lib/constants/analytics'

// Icon mapping utility for converting string icon names to components
const getIconComponent = (iconName) => {
  const iconMap = {
    'BarChart3': BarChart3,
    'Activity': Activity,
    'Users': Users,
    'ShoppingCart': ShoppingCart,
    'Package': Package
  }
  return iconMap[iconName] || BarChart3
}

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
              {entry.name === 'Revenue' ? `$${entry.value}` : 
               entry.name === 'Conversion' ? `${entry.value}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsDashboard({ data, className = "" }) {
  const [selectedChart, setSelectedChart] = useState(SELLER_ANALYTICS_TABS.OVERVIEW)
  const [timePeriod, setTimePeriod] = useState('30d')

  // Sample comprehensive data - replace with real API data
  const overviewData = data?.overview || [
    { date: 'Jan 1', revenue: 1200, sales: 15, views: 245, conversion: 6.1 },
    { date: 'Jan 2', revenue: 980, sales: 12, views: 198, conversion: 6.0 },
    { date: 'Jan 3', revenue: 1560, sales: 19, views: 289, conversion: 6.6 },
    { date: 'Jan 4', revenue: 1340, sales: 17, views: 267, conversion: 6.4 },
    { date: 'Jan 5', revenue: 1820, sales: 22, views: 334, conversion: 6.6 },
    { date: 'Jan 6', revenue: 2100, sales: 25, views: 378, conversion: 6.6 },
    { date: 'Jan 7', revenue: 1890, sales: 23, views: 356, conversion: 6.5 }
  ]

  const periods = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' }
  ]

  const renderChart = () => {
    switch (selectedChart) {
      case SELLER_ANALYTICS_TABS.REVENUE:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overviewData}>
              <defs>
                <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF89" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00FF89" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00FF89"
                fillOpacity={1}
                fill="url(#revenueAreaGradient)"
                strokeWidth={3}
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      case SELLER_ANALYTICS_TABS.PERFORMANCE:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="conversion"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 5 }}
                activeDot={{ r: 7, fill: '#8B5CF6' }}
                name="Conversion"
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      default: // SELLER_ANALYTICS_TABS.OVERVIEW
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={overviewData}>
              <defs>
                <linearGradient id="overviewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF89" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00FF89" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="views"
                fill="url(#overviewGradient)"
                stroke="#00FF89"
                strokeWidth={2}
                name="Views"
              />
              <Bar yAxisId="right" dataKey="sales" fill="#3B82F6" radius={[2, 2, 0, 0]} name="Sales" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} name="Revenue" />
            </ComposedChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className={`bg-[#1f1f1f] border border-gray-800 rounded-2xl ${className}`}>
      <div className="p-4 sm:p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FF89]/20 rounded-xl border border-[#00FF89]/30">
              <BarChart3 className="w-5 h-5 text-[#00FF89]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Seller Analytics</h3>
              <p className="text-sm text-gray-400">Your performance metrics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-[#121212] rounded-xl border border-gray-700 overflow-x-auto">
            {SELLER_TAB_OPTIONS.map((tab) => {
              const IconComponent = getIconComponent(tab.icon)
              const isActive = selectedChart === tab.key
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedChart(tab.key)}
                  className={`
                    flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 
                    whitespace-nowrap text-sm font-medium min-w-0 flex-shrink-0
                    ${isActive 
                      ? 'bg-[#00FF89] text-[#121212] shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Time Period Selector */}
          <div className="flex gap-1 p-1 bg-[#121212] rounded-lg border border-gray-700">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                  ${timePeriod === period.value
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="h-80 sm:h-96">
          {renderChart()}
        </div>
        
        {/* Chart Footer Info */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {selectedChart === SELLER_ANALYTICS_TABS.OVERVIEW && 'Views (area), Sales (bars), Revenue (line)'}
              {selectedChart === SELLER_ANALYTICS_TABS.REVENUE && 'Revenue trends over time'}
              {selectedChart === SELLER_ANALYTICS_TABS.PERFORMANCE && 'Conversion rate analysis'}
            </span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
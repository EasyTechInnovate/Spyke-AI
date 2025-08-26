'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Users, Globe, Calendar, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const COLORS = {
  age: ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'],
  location: ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'],
  subscription: ['#00FF89', '#3B82F6', '#8B5CF6']
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-300 text-sm font-medium">{data.name}</p>
        <p className="text-white text-lg font-semibold">{data.value} customers</p>
        <p className="text-gray-400 text-xs">
          {((data.value / data.payload.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    )
  }
  return null
}

export default function CustomerDemographics({ data, className = "" }) {
  const [selectedView, setSelectedView] = useState('age')

  // Sample data - replace with real API data
  const demographicsData = {
    age: data?.age || [
      { name: '18-24', value: 125, total: 500 },
      { name: '25-34', value: 180, total: 500 },
      { name: '35-44', value: 135, total: 500 },
      { name: '45-54', value: 45, total: 500 },
      { name: '55+', value: 15, total: 500 }
    ],
    location: data?.location || [
      { name: 'North America', value: 245, total: 500 },
      { name: 'Europe', value: 156, total: 500 },
      { name: 'Asia', value: 78, total: 500 },
      { name: 'South America', value: 15, total: 500 },
      { name: 'Africa', value: 4, total: 500 },
      { name: 'Oceania', value: 2, total: 500 }
    ],
    subscription: data?.subscription || [
      { name: 'One-time', value: 320, total: 500 },
      { name: 'Premium', value: 145, total: 500 },
      { name: 'Enterprise', value: 35, total: 500 }
    ]
  }

  const viewOptions = [
    { key: 'age', label: 'Age Groups', icon: Users },
    { key: 'location', label: 'Location', icon: Globe },
    { key: 'subscription', label: 'Customer Type', icon: Calendar }
  ]

  const currentData = demographicsData[selectedView]
  const totalCustomers = currentData.reduce((sum, item) => sum + item.value, 0)
  const topSegment = currentData.reduce((best, current) => 
    current.value > best.value ? current : best, currentData[0]
  )

  return (
    <div className={`bg-[#1f1f1f] border border-gray-800 rounded-2xl ${className}`}>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl border border-orange-500/30">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Customer Demographics</h3>
              <p className="text-sm text-gray-400">Understand your audience better</p>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-4">
          {viewOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedView(option.key)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedView === option.key
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-[#121212] text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              <option.icon className="w-3 h-3" />
              {option.label}
            </button>
          ))}
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{totalCustomers}</div>
            <div className="text-xs text-gray-400">Total Customers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-400">{topSegment?.name}</div>
            <div className="text-xs text-gray-400">Top Segment</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#00FF89]">
              {((topSegment?.value / totalCustomers) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Largest Share</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-80">
          {selectedView === 'age' || selectedView === 'subscription' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {currentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[selectedView][index % COLORS[selectedView].length]}
                      stroke="#1f1f1f"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {currentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[selectedView][index % COLORS[selectedView].length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend for Pie Charts */}
        {(selectedView === 'age' || selectedView === 'subscription') && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-wrap justify-center gap-4">
              {currentData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[selectedView][index % COLORS[selectedView].length] }}
                  />
                  <span className="text-xs text-gray-300">{entry.name}</span>
                  <span className="text-xs text-gray-500">({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
`
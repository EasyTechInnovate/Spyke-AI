'use client'

import { useState } from 'react'
import { 
  Users, Package, DollarSign, AlertCircle,
  UserCheck, ShoppingCart, TrendingUp, BarChart3,
  ArrowUpRight, ArrowDownRight, RefreshCw, Eye,
  Download, Shield
} from 'lucide-react'

export default function AdminDashboardPage() {
  const stats = [
    { 
      label: 'Total Revenue (Month)', 
      value: '$127,543', 
      change: '+23.5%', 
      icon: DollarSign,
      color: '#00FF89'
    },
    { 
      label: 'Active Users', 
      value: '45,287', 
      change: '+12.3%', 
      icon: Users,
      color: '#FFC050'
    },
    { 
      label: 'Products Listed', 
      value: '8,943', 
      change: '+8.7%', 
      icon: Package,
      color: '#00FF89'
    },
    { 
      label: 'Pending Reviews', 
      value: '47', 
      change: '-15%', 
      icon: AlertCircle,
      color: '#ff5555'
    },
  ]

  const recentActivity = [
    { type: 'seller', action: 'New seller registration', user: 'John Doe', time: '2 minutes ago', status: 'pending' },
    { type: 'product', action: 'Product submitted for review', user: 'Sarah Smith', time: '5 minutes ago', status: 'pending' },
    { type: 'order', action: 'New order placed', user: 'Mike Johnson', time: '12 minutes ago', status: 'completed' },
    { type: 'refund', action: 'Refund requested', user: 'Emily Brown', time: '25 minutes ago', status: 'urgent' },
    { type: 'product', action: 'Product flagged', user: 'System', time: '1 hour ago', status: 'urgent' },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors flex items-center gap-2 font-kumbh-sans">
          <UserCheck className="w-4 h-4" />
          Review Sellers
        </button>
        <button className="px-4 py-2 bg-[#1f1f1f] text-white border border-[#00FF89]/20 rounded-lg font-medium hover:bg-[#00FF89]/10 transition-colors flex items-center gap-2 font-kumbh-sans">
          <Shield className="w-4 h-4" />
          Moderate Products
        </button>
        <button className="px-4 py-2 bg-[#1f1f1f] text-white border border-[#00FF89]/20 rounded-lg font-medium hover:bg-[#00FF89]/10 transition-colors flex items-center gap-2 font-kumbh-sans">
          <Download className="w-4 h-4" />
          Export Reports
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change.startsWith('+')
          
          return (
            <div key={index} className="bg-[#1f1f1f] border border-[#00FF89]/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-[#00FF89]' : 'text-[#ff5555]'
                }`}>
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white font-league-spartan">{stat.value}</h3>
              <p className="text-sm text-gray-400 mt-1 font-kumbh-sans">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[#1f1f1f] border border-[#00FF89]/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white font-league-spartan">Revenue Overview</h2>
            <select className="bg-[#121212] border border-[#00FF89]/20 text-white text-sm rounded-lg px-3 py-1 font-kumbh-sans">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <BarChart3 className="w-8 h-8" />
            <span className="ml-2 font-kumbh-sans">Chart will be rendered here</span>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-[#1f1f1f] border border-[#00FF89]/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white font-league-spartan">User Growth</h2>
            <select className="bg-[#121212] border border-[#00FF89]/20 text-white text-sm rounded-lg px-3 py-1 font-kumbh-sans">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <TrendingUp className="w-8 h-8" />
            <span className="ml-2 font-kumbh-sans">Chart will be rendered here</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1f1f1f] border border-[#00FF89]/10 rounded-xl">
        <div className="p-6 border-b border-[#00FF89]/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white font-league-spartan">Recent Activity</h2>
            <button className="text-[#00FF89] hover:text-[#00FF89]/80 text-sm font-medium flex items-center gap-1 font-kumbh-sans">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-[#00FF89]/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'seller' ? 'bg-blue-500/20 text-blue-400' :
                    activity.type === 'product' ? 'bg-[#00FF89]/20 text-[#00FF89]' :
                    activity.type === 'order' ? 'bg-[#FFC050]/20 text-[#FFC050]' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {activity.type === 'seller' ? <UserCheck className="w-5 h-5" /> :
                     activity.type === 'product' ? <Package className="w-5 h-5" /> :
                     activity.type === 'order' ? <ShoppingCart className="w-5 h-5" /> :
                     <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-white font-kumbh-sans">{activity.action}</p>
                    <p className="text-sm text-gray-400 font-kumbh-sans">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-kumbh-sans ${
                    activity.status === 'pending' ? 'bg-[#FFC050]/20 text-[#FFC050]' :
                    activity.status === 'completed' ? 'bg-[#00FF89]/20 text-[#00FF89]' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {activity.status}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-white">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 bg-[#121212] border border-[#00FF89]/20 text-white rounded-lg font-medium hover:bg-[#00FF89]/10 transition-colors font-kumbh-sans">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Eye,
  ShoppingCart,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react'

// Mock data - you can replace this with actual API calls
const mockStats = {
  totalUsers: 1247,
  totalProducts: 89,
  totalRevenue: 45632,
  pendingProducts: 12,
  activeProducts: 67,
  flaggedProducts: 3,
  totalSales: 234,
  avgRating: 4.6,
  recentActivity: [
    { id: 1, type: 'product', action: 'New product submitted', time: '2 hours ago', user: 'John Doe' },
    { id: 2, type: 'sale', action: 'Product purchased', time: '3 hours ago', user: 'Jane Smith' },
    { id: 3, type: 'review', action: 'New review posted', time: '5 hours ago', user: 'Mike Johnson' },
    { id: 4, type: 'user', action: 'New user registered', time: '6 hours ago', user: 'Sarah Wilson' },
  ]
}

const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-500 to-red-500"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value.toLocaleString()}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </motion.div>
  )
}

const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'product': return Package
      case 'sale': return ShoppingCart
      case 'review': return Star
      case 'user': return Users
      default: return Eye
    }
  }

  const getColor = (type) => {
    switch (type) {
      case 'product': return 'text-blue-400'
      case 'sale': return 'text-green-400'
      case 'review': return 'text-yellow-400'
      case 'user': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const Icon = getIcon(activity.type)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50"
    >
      <div className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center ${getColor(activity.type)}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{activity.action}</p>
        <p className="text-gray-400 text-xs">by {activity.user} • {activity.time}</p>
      </div>
    </motion.div>
  )
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(false)

  // You can add real API calls here
  useEffect(() => {
    // Fetch real dashboard data
    // fetchDashboardStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Monitor your platform's performance and activity</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2 inline" />
            Export Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-[#00FF89] text-black rounded-lg hover:bg-[#00FF89]/90 transition-colors font-medium"
          >
            <PieChart className="w-4 h-4 mr-2 inline" />
            Analytics
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={12}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          trend={8}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          trend={15}
          color="green"
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          icon={ShoppingCart}
          trend={-3}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Active</span>
              </div>
              <span className="text-white font-medium">{stats.activeProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Pending</span>
              </div>
              <span className="text-white font-medium">{stats.pendingProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Flagged</span>
              </div>
              <span className="text-white font-medium">{stats.flaggedProducts}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Platform Rating
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.avgRating}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.floor(stats.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm">Average rating</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm">
              Review pending products
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm">
              Moderate flagged content
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm">
              View user reports
            </button>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ActivityItem activity={activity} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
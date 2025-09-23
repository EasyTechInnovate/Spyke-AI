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
import { useAdmin } from '@/providers/AdminProvider'
import analyticsAPI from '@/lib/api/analytics'
export default function AdminOverviewPage() {
  const { counts, overview, loading, error } = useAdmin()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingAnalytics(true)
        const response = await analyticsAPI.admin.getPlatform()
        setAnalyticsData(response)
        setRecentActivity([])
      } catch (error) {
        console.error('Failed to load analytics:', error)
        setAnalyticsData(null)
        setRecentActivity([])
      } finally {
        setLoadingAnalytics(false)
      }
    }
    loadData()
  }, [])
  if (loading || loadingAnalytics) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-700 rounded-xl"></div>
            <div className="h-64 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-4">
          <p className="text-red-400">Failed to load dashboard data: {error}</p>
        </div>
      </div>
    )
  }
  const stats = [
    {
      title: 'Total Users',
      value: overview?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Products',
      value: overview?.totalProducts || 0,
      icon: Package,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Revenue',
      value: `$${(overview?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Total Sales',
      value: overview?.totalSales || 0,
      icon: ShoppingCart,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ]
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-[#0f0f0f] rounded-lg hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-white">Review Pending Sellers</span>
                <span className="ml-auto bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                  {counts?.sellers?.pending || 0}
                </span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-[#0f0f0f] rounded-lg hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-green-400" />
                <span className="text-white">Review Pending Products</span>
                <span className="ml-auto bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                  {counts?.products?.pending || 0}
                </span>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-[#0f0f0f] rounded-lg hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-white">Handle Flagged Content</span>
                <span className="ml-auto bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm">
                  {counts?.products?.flagged || 0}
                </span>
              </div>
            </button>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No recent activity</p>
              <p className="text-gray-500 text-sm">Activity will appear here as it happens</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg">
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {analyticsData && (
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{analyticsData.growth?.newUsersLast30Days || 0}</p>
              <p className="text-gray-400 text-sm">New Users (30d)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{analyticsData.growth?.newProductsLast30Days || 0}</p>
              <p className="text-gray-400 text-sm">New Products (30d)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{analyticsData.growth?.salesLast30Days || 0}</p>
              <p className="text-gray-400 text-sm">Sales (30d)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
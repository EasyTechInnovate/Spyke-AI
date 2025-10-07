'use client'
import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, DollarSign, PieChart as PieIcon, BarChart3, Activity, Clock, CreditCard } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import apiClient from '@/lib/api'

// Simple color palettes
const STATUS_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1']
const METHOD_COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899']

const formatCurrency = (n) => `$${(n || 0).toFixed(2)}`
const shortDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export default function PayoutsTab({ timeRange = '30d' }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true)
      setError(null)
      // Direct call – avoid wrapper ambiguity
      const res = await apiClient.get(`v1/analytics/admin/payouts?period=${timeRange}`)
      // Shape: { success, data: { statusBreakdown, ... } }
      const core = res?.data?.data || res?.data || res
      setData(core)
    } catch (e) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [timeRange])

  const processed = useMemo(() => {
    if (!data) return null
    const statusBreakdown = data.statusBreakdown || []
    const dailyTrends = data.dailyTrends || []
    const methodBreakdown = data.methodBreakdown || []
    const processingTimes = data.processingTimes || {}
    const platformRevenue = data.platformRevenue || {}

    const totals = statusBreakdown.reduce((a, s) => {
      a.count += s.count || 0
      a.amount += s.totalAmount || 0
      return a
    }, { count: 0, amount: 0 })

    // Normalize status data
    const statusData = statusBreakdown.map((s, i) => ({
      name: s._id,
      value: s.count || 0,
      amount: s.totalAmount || 0,
      color: STATUS_COLORS[i % STATUS_COLORS.length]
    }))

    // Build a date-filled trend for the chosen range
    const rangeDays = (() => {
      if (timeRange === '7d') return 7
      if (timeRange === '90d') return 90
      if (timeRange === '1y') return 365
      return 30
    })()

    const today = new Date()
    const start = new Date()
    start.setDate(today.getDate() - (rangeDays - 1))
    const existing = new Map()
    dailyTrends.forEach(t => {
      if (!t._id) return
      const d = new Date(t._id.year, t._id.month - 1, t._id.day)
      const key = d.toISOString().split('T')[0]
      existing.set(key, { count: t.count || 0, total: t.totalAmount || 0 })
    })
    const trends = []
    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().split('T')[0]
      const val = existing.get(key) || { count: 0, total: 0 }
      trends.push({
        date: shortDate(d),
        payouts: val.count,
        amount: Number(val.total.toFixed(3))
      })
    }

    const methods = methodBreakdown.map((m, i) => ({
      name: m._id,
      count: m.count || 0,
      amount: m.totalAmount || 0,
      color: METHOD_COLORS[i % METHOD_COLORS.length]
    }))

    const avgPayout = totals.count ? totals.amount / totals.count : 0
    const completed = statusBreakdown.find(s => s._id === 'completed')?.count || 0
    const successRate = totals.count ? (completed / totals.count) * 100 : 0

    return {
      totals,
      statusData,
      trends,
      methods,
      avgProcessingDays: processingTimes.avgProcessingTime || 0,
      platformRevenue,
      avgPayout,
      successRate
    }
  }, [data, timeRange])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="p-5 bg-gray-800 rounded-lg h-28 animate-pulse" />)}
        </div>
        <div className="h-80 bg-gray-800 rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 text-center py-10">
        <p className="text-red-400 font-medium">Failed to load payout analytics</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <button onClick={() => fetchData(true)} className="px-4 py-2 bg-[#00FF89] text-black rounded flex items-center gap-2 mx-auto text-sm font-medium">
          <RefreshCw className={refreshing ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} /> Refresh
        </button>
      </div>
    )
  }

  if (!processed) return null

  const { totals, statusData, trends, methods, avgProcessingDays, platformRevenue, avgPayout, successRate } = processed

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payout Analytics</h2>
          <p className="text-gray-400 text-sm">Overview of payout performance (last {timeRange})</p>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2 text-white disabled:opacity-50">
          <RefreshCw className={refreshing ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPI title="Total Payouts" value={totals.count} icon={DollarSign} subtitle={formatCurrency(totals.amount)} />
        <KPI title="Avg Payout" value={formatCurrency(avgPayout)} icon={Activity} subtitle={`${avgPayout.toFixed(2)}`} />
        <KPI title="Success Rate" value={`${successRate.toFixed(1)}%`} icon={PieIcon} subtitle={`${totals.count} total`} />
        <KPI title="Processing Time" value={avgProcessingDays < 1 ? `${(avgProcessingDays*24).toFixed(1)}h` : `${avgProcessingDays.toFixed(1)}d`} icon={Clock} subtitle="Avg" />
        <KPI title="Platform Revenue" value={formatCurrency(platformRevenue.totalRevenue)} icon={Activity} subtitle={`Fees ${formatCurrency(platformRevenue.totalPlatformFees)}`} />
      </div>

      {/* Trends */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2 text-sm"><BarChart3 className="w-4 h-4" /> Daily Trends</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#00FF89" fontSize={12} />
              <Tooltip contentStyle={{ background:'#1F2937', border:'1px solid #374151', borderRadius:8 }} labelStyle={{ color:'#F3F4F6' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="payouts" name="Payout Count" fill="#3B82F6" radius={[3,3,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="amount" name="Total Amount" stroke="#00FF89" strokeWidth={2} dot={{ r:3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm"><PieIcon className="w-4 h-4" /> Status Distribution</h3>
          <div className="h-72">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {statusData.map((s,i)=>(<Cell key={s.name} fill={s.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background:'#1F2937', border:'1px solid #374151', borderRadius:8 }} formatter={(v, n, p)=>[v, n]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty text="No status data" />}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm"><CreditCard className="w-4 h-4" /> Methods</h3>
          <div className="h-72">
            {methods.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart layout="vertical" data={methods} margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={12} width={80} />
                  <Tooltip contentStyle={{ background:'#1F2937', border:'1px solid #374151', borderRadius:8 }} formatter={(v)=>v} />
                  <Bar dataKey="count" name="Count" fill="#00FF89" radius={[0,6,6,0]} />
                  <Line dataKey="amount" name="Amount" stroke="#3B82F6" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : <Empty text="No method data" />}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col gap-4 text-sm">
          <h3 className="text-white font-semibold flex items-center gap-2"><Activity className="w-4 h-4" /> Platform Revenue</h3>
          <MetricLine label="Platform Fees" value={formatCurrency(platformRevenue.totalPlatformFees)} />
          <MetricLine label="Processing Fees" value={formatCurrency(platformRevenue.totalProcessingFees)} />
          <MetricLine label="Total Revenue" value={formatCurrency(platformRevenue.totalRevenue)} />
          <MetricLine label="Total Payouts" value={formatCurrency(platformRevenue.totalPayouts)} />
          <MetricLine label="Avg Payout" value={formatCurrency(platformRevenue.avgPayoutAmount)} />
        </div>
      </div>
    </div>
  )
}

const KPI = ({ title, value, icon: Icon, subtitle }) => (
  <div className="p-5 bg-gray-800 rounded-xl border border-gray-700 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">{title}</p>
      <Icon className="w-4 h-4 text-[#00FF89]" />
    </div>
    <p className="text-lg font-semibold text-white leading-none">{value}</p>
    {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
  </div>
)

const MetricLine = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-700/60 last:border-none pb-2 last:pb-0">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-medium">{value}</span>
  </div>
)

const Empty = ({ text }) => (
  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">{text}</div>
)

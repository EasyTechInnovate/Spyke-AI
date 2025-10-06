'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Package, ShoppingCart, BarChart3, RefreshCw, Activity } from 'lucide-react'
import { useAdmin } from '@/providers/AdminProvider'
import Link from 'next/link'
import analyticsAPI from '@/lib/api/analytics'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const MetricCard = ({ icon: Icon, label, value, color, loading, href }) => {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-[#00FF89]/30 transition-all duration-300"
            role="listitem">
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color || 'from-gray-700/30 to-gray-600/20'}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                </div>
            ) : (
                <>
                    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
                    <p className="text-sm text-gray-400">{label}</p>
                </>
            )}
            {href && (
                <Link
                    href={href}
                    className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                    aria-label={`View ${label} details`}
                />
            )}
        </motion.article>
    )
}

export default function AdminDashboardPage() {
    const { refreshData: _unusedProviderRefresh, error: providerError } = useAdmin()
    const [overviewData, setOverviewData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [growthPeriod, setGrowthPeriod] = useState('30d') // added period state

    const fetchPlatform = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await analyticsAPI.admin.getPlatform()
            // Shape: { overview, growth, topCategories }
            setOverviewData(res?.data || res)
        } catch (e) {
            console.error('Failed to load platform overview:', e)
            setError(e.message || 'Failed to load overview')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPlatform()
    }, [fetchPlatform])

    const handleRefresh = useCallback(async () => {
        setRefreshing(true)
        await fetchPlatform()
        setRefreshing(false)
    }, [fetchPlatform])

    const overview = overviewData?.overview || {}
    const growth = overviewData?.growth || {}
    const topCategories = overviewData?.topCategories || []

    const metrics = useMemo(() => {
        const items = [
            { icon: Users, label: 'Total Users', value: overview.totalUsers },
            { icon: Users, label: 'Total Sellers', value: overview.totalSellers },
            { icon: Package, label: 'Total Products', value: overview.totalProducts },
            { icon: Package, label: 'Active Products', value: overview.activeProducts },
            { icon: ShoppingCart, label: 'Total Sales', value: overview.totalSales },
            { icon: BarChart3, label: 'Total Revenue', value: overview.totalRevenue },
            { icon: BarChart3, label: 'Avg Order Value', value: overview.avgOrderValue },
            { icon: Activity, label: 'Total Views', value: overview.totalViews }
        ]
        return items
    }, [overview])

    const growthSeries = useMemo(() => {
        const totalWindowDays = 30
        const totals = {
            users: growth.newUsersLast30Days || 0,
            products: growth.newProductsLast30Days || 0,
            sales: growth.salesLast30Days || 0
        }
        const distributeEven = (total) => {
            if (total <= 0) return Array(totalWindowDays).fill(0)
            const base = Math.floor(total / totalWindowDays)
            let remainder = total % totalWindowDays
            return Array.from({ length: totalWindowDays }, (_, i) => base + (i >= totalWindowDays - remainder ? 1 : 0))
        }
        const dailyUsers = distributeEven(totals.users)
        const dailyProducts = distributeEven(totals.products)
        const dailySales = distributeEven(totals.sales)
        const today = new Date()
        const series = Array.from({ length: totalWindowDays }, (_, idx) => {
            const d = new Date(today)
            d.setDate(d.getDate() - (totalWindowDays - 1 - idx))
            return {
                day: `${d.getMonth() + 1}/${d.getDate()}`,
                Users: dailyUsers[idx],
                Products: dailyProducts[idx],
                Sales: dailySales[idx]
            }
        })
        const periodMap = { '30d': 30, '7d': 7, 'today': 1 }
        const len = periodMap[growthPeriod] || 30
        let sliced = series.slice(-len)
        // If only one point (today) duplicate a zero baseline for chart rendering
        if (sliced.length === 1) {
            const prev = { ...sliced[0], day: 'Prev', Users: 0, Products: 0, Sales: 0 }
            sliced = [prev, ...sliced]
        }
        return sliced
    }, [growth, growthPeriod])

    if (error || providerError) {
        return (
            <main className="space-y-8 max-w-7xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <h2 className="text-red-400 text-lg font-semibold mb-2">Failed to Load Dashboard</h2>
                    <p className="text-gray-300 mb-4">{error || providerError}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        Retry
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="space-y-10 max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-gray-400">High-level platform overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        className="px-4 py-2 bg-gray-800/60 text-gray-200 rounded-lg hover:bg-gray-700/60 transition-colors flex items-center gap-2 disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <Link
                        href="/admin/analytics/platform"
                        className="px-4 py-2 bg-[#00FF89] text-black rounded-lg hover:bg-[#00FF89]/90 transition-colors flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Full Analytics
                    </Link>
                </div>
            </div>

            <section>
                <h2 className="text-lg font-semibold text-white mb-4">Key Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((m, i) => (
                        <MetricCard
                            key={i}
                            icon={m.icon}
                            label={m.label}
                            value={loading ? '—' : (m.value ?? 0)}
                            color="from-gray-700/30 to-gray-600/20"
                            loading={loading}
                        />
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-lg font-semibold text-white mb-4">{growthPeriod === 'today' ? 'Today\'s Growth' : growthPeriod === '7d' ? '7-Day Growth' : '30-Day Growth'}</h2>
                <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <p className="text-xs text-gray-500">Synthetic distributed daily data (will be replaced by real daily series when available)</p>
                        <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg p-1 border border-white/10">
                            {['today','7d','30d'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setGrowthPeriod(p)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${growthPeriod === p ? 'bg-[#00FF89] text-black' : 'text-gray-300 hover:text-white'}`}>{p === 'today' ? 'Today' : p.toUpperCase()}</button>
                            ))}
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="w-full h-full animate-pulse bg-gray-800/40 rounded" />
                        </div>
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer
                                width="100%"
                                height="100%">
                                <LineChart
                                    data={growthSeries}
                                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(255,255,255,0.08)"
                                    />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#888"
                                        tickLine={false}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                    />
                                    <YAxis
                                        stroke="#888"
                                        tickLine={false}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: 8 }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ color: '#aaa' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="Users"
                                        stroke="#00FF89"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Products"
                                        stroke="#6D6DFF"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Sales"
                                        stroke="#FFC050"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <p className="mt-4 text-xs text-gray-500">
                        Synthetic cumulative trend derived from 30-day aggregate totals (even distribution). Replace with real daily series when
                        available.
                    </p>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-white/10 rounded-xl p-6">
                        <h3 className="text-white font-semibold mb-4">30 Day Growth</h3>
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-16 bg-gray-700/40 rounded"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <GrowthStat
                                    label="New Users"
                                    value={growth.newUsersLast30Days}
                                />
                                <GrowthStat
                                    label="New Products"
                                    value={growth.newProductsLast30Days}
                                />
                                <GrowthStat
                                    label="Sales"
                                    value={growth.salesLast30Days}
                                />
                                <GrowthStat
                                    label="Revenue"
                                    value={overview.totalRevenue}
                                    prefix="$"
                                />
                                <GrowthStat
                                    label="Avg Order Value"
                                    value={overview.avgOrderValue}
                                    prefix="$"
                                />
                                <GrowthStat
                                    label="Active Products"
                                    value={overview.activeProducts}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold">Top Categories</h3>
                            <span className="text-xs text-gray-400">Based on product count</span>
                        </div>
                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-10 bg-gray-700/40 rounded"
                                    />
                                ))}
                            </div>
                        ) : topCategories.length === 0 ? (
                            <p className="text-sm text-gray-500">No category data yet.</p>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {topCategories.map((cat) => (
                                    <li
                                        key={cat._id}
                                        className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-white text-sm font-medium">{cat.categoryName}</p>
                                            <p className="text-xs text-gray-500">Avg Price: ${cat.avgPrice}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#00FF89] text-sm font-semibold">{cat.productCount}</p>
                                            <p className="text-xs text-gray-500">Products</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}

const GrowthStat = ({ label, value, prefix = '' }) => (
    <div className="p-4 rounded-lg bg-gray-800/40 border border-white/5">
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</div>
        <div className="text-lg font-semibold text-white">
            {prefix}
            {value ?? 0}
        </div>
    </div>
)


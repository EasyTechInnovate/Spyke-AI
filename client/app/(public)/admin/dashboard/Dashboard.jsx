'use client'
import {
    Users,
    Package,
    DollarSign,
    AlertCircle,
    UserCheck,
    ShoppingCart,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Eye,
    Download,
    Shield
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
        }
    ]

    const recentActivity = [
        { type: 'seller', action: 'New seller registration', user: 'John Doe', time: '2 minutes ago', status: 'pending' },
        { type: 'product', action: 'Product submitted for review', user: 'Sarah Smith', time: '5 minutes ago', status: 'pending' },
        { type: 'order', action: 'New order placed', user: 'Mike Johnson', time: '12 minutes ago', status: 'completed' },
        { type: 'refund', action: 'Refund requested', user: 'Emily Brown', time: '25 minutes ago', status: 'urgent' },
        { type: 'product', action: 'Product flagged', user: 'System', time: '1 hour ago', status: 'urgent' }
    ]

    return (
        <main
            className="space-y-6"
            role="main"
            aria-label="Admin Dashboard">
            {/* Quick Actions */}
            <section aria-label="Quick Actions">
                <h2 className="sr-only">Quick Actions</h2>
                <div
                    className="flex flex-wrap gap-3"
                    role="group"
                    aria-label="Administrative actions">
                    <button
                        className="px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg font-medium hover:bg-[#00FF89]/90 transition-colors flex items-center gap-2 font-kumbh-sans focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 focus:ring-offset-[#121212]"
                        aria-label="Review seller applications">
                        <UserCheck
                            className="w-4 h-4"
                            aria-hidden="true"
                        />
                        Review Sellers
                    </button>
                    <button
                        className="px-4 py-2 bg-[#1f1f1f] text-white border border-[#00FF89]/20 rounded-lg font-medium hover:bg-[#00FF89]/10 transition-colors flex items-center gap-2 font-kumbh-sans focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 focus:ring-offset-[#121212]"
                        aria-label="Moderate product listings">
                        <Shield
                            className="w-4 h-4"
                            aria-hidden="true"
                        />
                        Moderate Products
                    </button>
                    <button
                        className="px-4 py-2 bg-[#1f1f1f] text-white border border-[#00FF89]/20 rounded-lg font-medium hover:bg-[#00FF89]/10 transition-colors flex items-center gap-2 font-kumbh-sans focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 focus:ring-offset-[#121212]"
                        aria-label="Export platform reports">
                        <Download
                            className="w-4 h-4"
                            aria-hidden="true"
                        />
                        Export Reports
                    </button>
                </div>
            </section>

            {/* Stats Grid */}
            <section aria-label="Platform Statistics">
                <h2 className="sr-only">Platform Statistics Overview</h2>
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    role="list">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        const isPositive = stat.change.startsWith('+')

                        return (
                            <article
                                key={index}
                                className="bg-[#1f1f1f] border border-[#00FF89]/10 rounded-xl p-6"
                                role="listitem"
                                aria-label={`${stat.label} statistic`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: `${stat.color}20` }}
                                        role="presentation">
                                        <Icon
                                            className="w-6 h-6"
                                            style={{ color: stat.color }}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div
                                        className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-[#00FF89]' : 'text-[#ff5555]'}`}
                                        aria-label={`${isPositive ? 'Increased' : 'Decreased'} by ${stat.change.replace(/[+-]/, '')}`}>
                                        {isPositive ? (
                                            <ArrowUpRight
                                                className="w-4 h-4"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <ArrowDownRight
                                                className="w-4 h-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span aria-hidden="true">{stat.change}</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white font-league-spartan">{stat.value}</h3>
                                <p className="text-sm text-gray-400 mt-1 font-kumbh-sans">{stat.label}</p>
                            </article>
                        )
                    })}
                </div>
            </section>

            {/* Charts Section */}
            <section aria-label="Analytics Charts">
                <h2 className="sr-only">Analytics and Charts</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <article className="bg-[#1f1f1f] border border-[#00FF89]/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white font-league-spartan">Revenue Overview</h3>
                            <select
                                className="bg-[#121212] border border-[#00FF89]/20 text-white text-sm rounded-lg px-3 py-1 font-kumbh-sans focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 focus:ring-offset-[#1f1f1f]"
                                aria-label="Select revenue time period">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>Last 90 days</option>
                            </select>
                        </div>
                        <div
                            className="h-64 flex items-center justify-center text-gray-500"
                            role="img"
                            aria-label="Revenue chart placeholder">
                            <BarChart3
                                className="w-8 h-8"
                                aria-hidden="true"
                            />
                            <span className="ml-2 font-kumbh-sans">Chart will be rendered here</span>
                        </div>
                    </article>

                    {/* User Growth Chart */}
                    <article className="bg-[#1f1f1f] border border-[#00FF89]/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white font-league-spartan">User Growth</h3>
                            <select
                                className="bg-[#121212] border border-[#00FF89]/20 text-white text-sm rounded-lg px-3 py-1 font-kumbh-sans focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 focus:ring-offset-[#1f1f1f]"
                                aria-label="Select user growth time period">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>Last 90 days</option>
                            </select>
                        </div>
                        <div
                            className="h-64 flex items-center justify-center text-gray-500"
                            role="img"
                            aria-label="User growth chart placeholder">
                            <TrendingUp
                                className="w-8 h-8"
                                aria-hidden="true"
                            />
                            <span className="ml-2 font-kumbh-sans">Chart will be rendered here</span>
                        </div>
                    </article>
                </div>
            </section>

            {/* Recent Activity */}
            <section
                className="bg-[#1f1f1f] border border-[#00FF89]/10 rounded-xl"
                aria-label="Recent Platform Activity">
                <header className="p-6 border-b border-[#00FF89]/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white font-league-spartan">Recent Activity</h2>
                        <button
                            className="text-[#00FF89] hover:text-[#00FF89]/80 text-sm font-medium flex items-center gap-1 font-kumbh-sans focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 focus:ring-offset-[#1f1f1f] rounded-md px-2 py-1"
                            aria-label="Refresh activity feed">
                            <RefreshCw
                                className="w-4 h-4"
                                aria-hidden="true"
                            />
                            Refresh
                        </button>
                    </div>
                </header>
                <div className="p-6">
                    <ul
                        className="space-y-4"
                        role="list"
                        aria-label="Activity list">
                        {recentActivity.map((activity, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between py-3 border-b border-[#00FF89]/5 last:border-0"
                                role="listitem">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            activity.type === 'seller'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : activity.type === 'product'
                                                  ? 'bg-[#00FF89]/20 text-[#00FF89]'
                                                  : activity.type === 'order'
                                                    ? 'bg-[#FFC050]/20 text-[#FFC050]'
                                                    : 'bg-red-500/20 text-red-400'
                                        }`}
                                        role="presentation">
                                        {activity.type === 'seller' ? (
                                            <UserCheck
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                            />
                                        ) : activity.type === 'product' ? (
                                            <Package
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                            />
                                        ) : activity.type === 'order' ? (
                                            <ShoppingCart
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <AlertCircle
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white font-kumbh-sans">{activity.action}</p>
                                        <p className="text-sm text-gray-400 font-kumbh-sans">
                                            <span className="sr-only">By user:</span> {activity.user} •{' '}
                                            <time dateTime={new Date().toISOString()}>{activity.time}</time>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full font-kumbh-sans ${
                                            activity.status === 'pending'
                                                ? 'bg-[#FFC050]/20 text-[#FFC050]'
                                                : activity.status === 'completed'
                                                  ? 'bg-[#00FF89]/20 text-[#00FF89]'
                                                  : 'bg-red-500/20 text-red-400'
                                        }`}
                                        role="status"
                                        aria-label={`Status: ${activity.status}`}>
                                        {activity.status}
                                    </span>
                                    <button
                                        className="p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 focus:ring-offset-[#1f1f1f] rounded"
                                        aria-label={`View details for ${activity.action}`}>
                                        <Eye
                                            className="w-4 h-4"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        className="w-full mt-4 py-2 bg-[#121212] border border-[#00FF89]/20 text-white rounded-lg font-medium hover:bg-[#00FF89]/10 transition-colors font-kumbh-sans focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 focus:ring-offset-[#1f1f1f]"
                        aria-label="View all platform activity">
                        View All Activity
                    </button>
                </div>
            </section>
        </main>
    )
}

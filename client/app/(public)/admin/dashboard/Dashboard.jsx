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
        </main>
    )
}


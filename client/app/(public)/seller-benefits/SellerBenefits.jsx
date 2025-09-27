'use client'
import React from 'react'
import Link from 'next/link'
import {
    DollarSign,
    Zap,
    Globe,
    Shield,
    TrendingUp,
    Users,
    BarChart3,
    CreditCard,
    MessageSquare,
    Star,
    CheckCircle,
    ArrowRight,
    Clock,
    Target,
    Briefcase,
    Award,
    HeartHandshake,
    Rocket,
    Eye,
    ShoppingCart,
    Package,
    LineChart,
    PieChart,
    Activity,
    MousePointer
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'

const benefits = [
    {
        icon: DollarSign,
        title: 'Competitive Revenue Share',
        description: 'Keep the majority of your sales with our seller-friendly commission structure',
        highlight: true
    },
    {
        icon: Zap,
        title: 'Instant Payouts',
        description: 'Get paid immediately with our automated payout system'
    },
    {
        icon: Globe,
        title: 'Global Marketplace',
        description: 'Reach customers worldwide with built-in international support'
    },
    {
        icon: Shield,
        title: 'Secure Transactions',
        description: 'Protected payments with escrow and dispute resolution'
    },
    {
        icon: BarChart3,
        title: 'Advanced Analytics',
        description: 'Comprehensive dashboard to track sales, revenue, and customer insights'
    },
    {
        icon: Users,
        title: 'Customer Management',
        description: 'Built-in CRM to manage leads, customers, and relationships'
    }
]

const features = [
    {
        category: 'Selling Tools',
        items: [
            { icon: Briefcase, text: 'Multi-product listings with rich media support' },
            { icon: Target, text: 'Advanced pricing controls and discount management' },
            { icon: MessageSquare, text: 'Integrated chat system for customer communication' },
            { icon: Star, text: 'Review and rating system to build credibility' }
        ]
    },
    {
        category: 'Analytics & Insights',
        items: [
            { icon: BarChart3, text: 'Real-time sales performance tracking' },
            { icon: TrendingUp, text: 'Revenue trends and growth analytics' },
            { icon: Users, text: 'Customer behavior and acquisition insights' },
            { icon: Eye, text: 'Product views and conversion rate optimization' }
        ]
    },
    {
        category: 'Support & Growth',
        items: [
            { icon: HeartHandshake, text: 'Dedicated seller support team' },
            { icon: Rocket, text: 'Marketing and promotional opportunities' },
            { icon: Clock, text: '24/7 platform monitoring and uptime guarantee' },
            { icon: Shield, text: 'Fraud protection and secure payment processing' }
        ]
    }
]

const stats = [
    { number: '10,000+', label: 'Active Sellers' },
    { number: '$2M+', label: 'Total Payouts' },
    { number: '50K+', label: 'Products Sold' },
    { number: '4.8/5', label: 'Seller Rating' }
]

// Mock analytics data to display in the preview
const mockAnalyticsData = {
    revenue: [
        { name: 'Jan', value: 2400 },
        { name: 'Feb', value: 1398 },
        { name: 'Mar', value: 9800 },
        { name: 'Apr', value: 3908 },
        { name: 'May', value: 4800 },
        { name: 'Jun', value: 3800 }
    ],
    metrics: {
        totalRevenue: 28450,
        totalSales: 156,
        avgOrderValue: 182,
        conversionRate: 3.2
    }
}

const AnalyticsDashboardPreview = () => {
    return (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Your Analytics Dashboard</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Activity className="w-4 h-4" />
                    Live Preview
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-brand-primary" />
                        <span className="text-xs text-gray-400">Total Revenue</span>
                    </div>
                    <div className="text-lg font-bold text-white">${mockAnalyticsData.metrics.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-green-400">+12.5%</div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Total Sales</span>
                    </div>
                    <div className="text-lg font-bold text-white">{mockAnalyticsData.metrics.totalSales}</div>
                    <div className="text-xs text-green-400">+8.3%</div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Avg Order</span>
                    </div>
                    <div className="text-lg font-bold text-white">${mockAnalyticsData.metrics.avgOrderValue}</div>
                    <div className="text-xs text-green-400">+5.1%</div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <MousePointer className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-gray-400">Conversion</span>
                    </div>
                    <div className="text-lg font-bold text-white">{mockAnalyticsData.metrics.conversionRate}%</div>
                    <div className="text-xs text-green-400">+0.8%</div>
                </div>
            </div>

            {/* Mock Chart */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <LineChart className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm font-medium text-white">Revenue Trends (Last 6 Months)</span>
                </div>
                <div className="relative h-32">
                    <svg
                        className="w-full h-full"
                        viewBox="0 0 400 120">
                        <defs>
                            <linearGradient
                                id="revenueGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%">
                                <stop
                                    offset="0%"
                                    stopColor="#00FF89"
                                    stopOpacity="0.3"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#00FF89"
                                    stopOpacity="0.05"
                                />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {[0, 30, 60, 90, 120].map((y) => (
                            <line
                                key={y}
                                x1="0"
                                y1={y}
                                x2="400"
                                y2={y}
                                stroke="#374151"
                                strokeWidth="0.5"
                                opacity="0.5"
                            />
                        ))}

                        {/* Chart area */}
                        <path
                            d="M 0 80 L 67 100 L 133 20 L 200 60 L 267 30 L 333 50 L 400 25"
                            fill="url(#revenueGradient)"
                            stroke="#00FF89"
                            strokeWidth="2"
                        />

                        {/* Data points */}
                        {mockAnalyticsData.revenue.map((point, index) => (
                            <circle
                                key={index}
                                cx={index * 67}
                                cy={120 - point.value / 100}
                                r="3"
                                fill="#00FF89"
                                className="animate-pulse"
                            />
                        ))}
                    </svg>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    {mockAnalyticsData.revenue.map((point) => (
                        <span key={point.name}>{point.name}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function SellerBenefitsPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative bg-black pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/20"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent"></div>
                </div>

                <Container className="relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                            Transform Your <span className="text-brand-primary">AI Expertise</span> Into
                            <span className="text-brand-secondary"> Recurring Revenue</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
                            Join the world's fastest-growing AI marketplace where automation experts earn serious income selling their tools,
                            workflows, and expertise to thousands of eager buyers
                        </p>

                        {/* Key Benefits Highlights */}
                        <div className="flex flex-wrap gap-6 justify-center text-lg mb-12">
                            <div className="flex items-center gap-2 bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/30">
                                <CheckCircle className="w-5 h-5 text-brand-primary" />
                                <span className="text-white font-medium">Zero Setup Fees</span>
                            </div>
                            <div className="flex items-center gap-2 bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/30">
                                <CheckCircle className="w-5 h-5 text-brand-primary" />
                                <span className="text-white font-medium">Competitive Commissions</span>
                            </div>
                            <div className="flex items-center gap-2 bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/30">
                                <CheckCircle className="w-5 h-5 text-brand-primary" />
                                <span className="text-white font-medium">Instant Payouts</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/become-seller"
                                className="bg-brand-primary text-black font-bold py-4 px-8 rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-brand-primary/20">
                                Start Earning Today
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-900/50">
                <Container>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-brand-primary mb-2">{stat.number}</div>
                                <div className="text-gray-400 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Analytics Dashboard Preview */}
            <section className="py-20 bg-black">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            See Every <span className="text-brand-primary">Dollar</span> You Earn
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Get real-time insights into your sales, revenue, and customer behavior with our comprehensive analytics dashboard
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <AnalyticsDashboardPreview />

                        <div className="grid md:grid-cols-3 gap-6 mt-12">
                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <BarChart3 className="w-6 h-6 text-brand-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Real-Time Tracking</h3>
                                <p className="text-gray-400">Monitor your sales, revenue, and performance metrics as they happen</p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Customer Insights</h3>
                                <p className="text-gray-400">Understand your buyers' behavior and optimize your offerings</p>
                            </div>

                            <div className="text-center p-6">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Growth Analytics</h3>
                                <p className="text-gray-400">Track trends and identify opportunities to scale your business</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Main Benefits */}
            <section className="py-20 bg-gray-900/30">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Why Top Sellers Choose <span className="text-brand-primary">Spyke AI</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to build a thriving automation business</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon
                            return (
                                <div
                                    key={index}
                                    className={`p-8 rounded-xl border transition-all hover:scale-105 ${
                                        benefit.highlight
                                            ? 'bg-brand-primary/10 border-brand-primary/50 shadow-lg shadow-brand-primary/20'
                                            : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                                    }`}>
                                    <div
                                        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                                            benefit.highlight ? 'bg-brand-primary/20' : 'bg-gray-800'
                                        }`}>
                                        <Icon className={`w-6 h-6 ${benefit.highlight ? 'text-brand-primary' : 'text-gray-400'}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                                    <p className="text-gray-400">{benefit.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </Container>
            </section>

            {/* Detailed Features */}
            <section className="py-20 bg-black">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Complete <span className="text-brand-primary">Business Toolkit</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Professional-grade tools to manage and grow your automation business
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {features.map((category, index) => (
                            <div
                                key={index}
                                className="space-y-6">
                                <h3 className="text-2xl font-bold text-white border-b border-brand-primary/30 pb-3">{category.category}</h3>
                                <div className="space-y-4">
                                    {category.items.map((item, itemIndex) => {
                                        const Icon = item.icon
                                        return (
                                            <div
                                                key={itemIndex}
                                                className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Icon className="w-4 h-4 text-brand-primary" />
                                                </div>
                                                <p className="text-gray-300">{item.text}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Success Metrics & Social Proof */}
            <section className="py-20 bg-gray-900/50">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Join The <span className="text-brand-primary">Success Stories</span>
                        </h2>
                        <p className="text-xl text-gray-400">Real results from our seller community</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        

                        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">300%</div>
                            <div className="text-gray-400 mb-4">Average revenue growth in first 6 months</div>
                            <div className="text-sm text-blue-400">With our analytics tools</div>
                        </div>

                        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-700 text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-purple-400" />
                            </div>
                            <div className="text-3xl font-bold text-white mb-2">24hrs</div>
                            <div className="text-gray-400 mb-4">Average time to first sale for new sellers</div>
                            <div className="text-sm text-purple-400">Start earning immediately</div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Your AI Business Awaits</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Stop leaving money on the table. Join thousands of automation experts who've turned their skills into sustainable income
                            streams on Spyke AI.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <Link
                                href="/become-seller"
                                className="bg-brand-primary text-black font-bold py-4 px-8 rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-brand-primary/25">
                                Start Selling Now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/explore"
                                className="border border-gray-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-gray-800 transition-colors">
                                Explore Marketplace
                            </Link>
                        </div>

                        <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-brand-primary" />
                                <span>Free to join</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-brand-primary" />
                                <span>No monthly fees</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-brand-primary" />
                                <span>Start earning today</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    )
}

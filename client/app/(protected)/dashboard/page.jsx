'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import { 
    BarChart3, 
    DollarSign, 
    Package, 
    Users, 
    TrendingUp, 
    Plus,
    Eye,
    Edit,
    MessageSquare,
    Star,
    ArrowUpRight,
    Activity
} from 'lucide-react'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'
import toast from '@/lib/utils/toast'
import sellerAPI from '@/lib/api/seller'

export default function Dashboard() {
    const router = useRouter()
    const track = useTrackEvent()
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState(null)
    const [products, setProducts] = useState([])
    const [userRole, setUserRole] = useState('user') // 'user' or 'seller'

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            const roles = user.roles || []
            const isSeller = roles.includes('seller')
            const detectedRole = isSeller ? 'seller' : 'user'
            setUserRole(detectedRole)
        }
    }, [])

    useEffect(() => {
        if (userRole) {
            loadDashboardData()
        }
    }, [userRole])

    const loadDashboardData = async () => {
        try {
            // Load different data based on user role
            if (userRole === 'seller') {
                // Load seller dashboard data and products in parallel
                const [dashboardResponse, productsResponse] = await Promise.all([
                    sellerAPI.getDashboard().catch(() => null),
                    sellerAPI.getProducts({ limit: 5 }).catch(() => null)
                ])
                
                if (dashboardResponse) {
                    setDashboardData(dashboardResponse)
                }
                if (productsResponse) {
                    setProducts(productsResponse.products || productsResponse || [])
                }
            } else {
                // Load regular user dashboard data (purchases, wishlist, etc.)
                // For now, we'll show a different interface for regular users
            }

            // Use mock data if API calls fail (for development)
            if (!dashboardResponse || !productsResponse) {
                // Mock data fallback
                setDashboardData({
                    stats: {
                        totalRevenue: 2450.00,
                        totalSales: 127,
                        totalProducts: 8,
                        totalViews: 1840,
                        conversionRate: 6.9,
                        averageRating: 4.8
                    },
                    recentSales: [
                        { id: 1, product: 'AI Email Marketing Prompts', amount: 29.99, date: '2 hours ago', buyer: 'John D.' },
                        { id: 2, product: 'ChatGPT Sales Scripts', amount: 49.99, date: '5 hours ago', buyer: 'Sarah M.' },
                        { id: 3, product: 'Content Creation Bundle', amount: 79.99, date: '1 day ago', buyer: 'Mike R.' }
                    ]
                })
                
                setProducts([
                    {
                        id: 1,
                        title: 'AI Email Marketing Prompts',
                        category: 'Marketing',
                        price: 29.99,
                        sales: 45,
                        views: 320,
                        rating: 4.8,
                        status: 'active',
                        lastUpdated: '2 days ago'
                    },
                    {
                        id: 2,
                        title: 'ChatGPT Sales Scripts',
                        category: 'Sales',
                        price: 49.99,
                        sales: 32,
                        views: 280,
                        rating: 4.9,
                        status: 'active',
                        lastUpdated: '1 week ago'
                    },
                    {
                        id: 3,
                        title: 'Content Creation Bundle',
                        category: 'Content',
                        price: 79.99,
                        sales: 28,
                        views: 210,
                        rating: 4.7,
                        status: 'active',
                        lastUpdated: '3 days ago'
                    }
                ])
            } else {
                // Use real API data
                setDashboardData(dashboardResponse)
                setProducts(productsResponse.products || productsResponse)
            }
            
            setLoading(false)
        } catch (error) {
            console.error('Error loading dashboard:', error)
            toast.operation.genericError('Failed to load dashboard data')
            setLoading(false)
        }
    }

    const handleCreateProduct = () => {
        // Navigate to product creation page
        router.push('/seller/products/create')
    }

    const handleEditProduct = (productId) => {
        track(ANALYTICS_EVENTS.SELLER.PRODUCT_EDIT_CLICKED, eventProperties.seller('product_edit', { productId }))
        router.push(`/seller/products/edit/${productId}`)
    }

    const handleViewProduct = (productId) => {
        track(ANALYTICS_EVENTS.SELLER.PRODUCT_VIEW_CLICKED, eventProperties.seller('product_view', { productId }))
        router.push(`/products/${productId}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <Container>
                    <div className="pt-24 pb-16">
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading your dashboard...</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            
            <main className="pt-24 pb-16">
                <Container>
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                        {userRole === 'seller' ? 'Seller Dashboard' : 'My Dashboard'}
                                    </h1>
                                    <p className="text-gray-400">
                                        {userRole === 'seller' 
                                            ? 'Monitor your performance and manage your products'
                                            : 'Track your purchases, wishlist, and activity'
                                        }
                                    </p>
                                </div>
                                {userRole === 'seller' && (
                                    <button
                                        onClick={handleCreateProduct}
                                        className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-black rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors w-fit"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create Product
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        {userRole === 'seller' ? (
                            <SellerDashboardContent 
                                dashboardData={dashboardData}
                                products={products}
                                handleCreateProduct={handleCreateProduct}
                                handleEditProduct={handleEditProduct}
                                handleViewProduct={handleViewProduct}
                                router={router}
                            />
                        ) : (
                            <UserDashboardContent />
                        )}
                    </div>
                </Container>
            </main>
        </div>
    )
}

function SellerDashboardContent({ dashboardData, products, handleCreateProduct, handleEditProduct, handleViewProduct, router }) {
    if (!dashboardData) return null

    return (
        <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                            <StatsCard
                                title="Total Revenue"
                                value={`$${dashboardData.stats.totalRevenue.toFixed(2)}`}
                                icon={DollarSign}
                                trend="+12.5%"
                                color="brand-primary"
                            />
                            <StatsCard
                                title="Total Sales"
                                value={dashboardData.stats.totalSales}
                                icon={BarChart3}
                                trend="+8.2%"
                                color="blue-400"
                            />
                            <StatsCard
                                title="Products"
                                value={dashboardData.stats.totalProducts}
                                icon={Package}
                                trend="+2"
                                color="purple-400"
                            />
                            <StatsCard
                                title="Profile Views"
                                value={dashboardData.stats.totalViews}
                                icon={Eye}
                                trend="+15.3%"
                                color="green-400"
                            />
                            <StatsCard
                                title="Conversion"
                                value={`${dashboardData.stats.conversionRate}%`}
                                icon={TrendingUp}
                                trend="+1.2%"
                                color="yellow-400"
                            />
                            <StatsCard
                                title="Avg Rating"
                                value={dashboardData.stats.averageRating}
                                icon={Star}
                                trend="4.8/5"
                                color="orange-400"
                            />
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Products List */}
                            <div className="lg:col-span-2">
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold">Your Products</h2>
                                        <button
                                            onClick={() => router.push('/seller/products')}
                                            className="text-brand-primary hover:text-brand-primary/80 transition-colors text-sm font-medium"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {products.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onEdit={handleEditProduct}
                                                onView={handleViewProduct}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Sales */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold">Recent Sales</h2>
                                        <Activity className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {dashboardData.recentSales.map((sale) => (
                                            <div key={sale.id} className="border-b border-gray-800 pb-4 last:border-b-0 last:pb-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium text-sm text-white line-clamp-2">{sale.product}</h4>
                                                    <span className="text-brand-primary font-semibold text-sm">${sale.amount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-400">
                                                    <span>{sale.buyer}</span>
                                                    <span>{sale.date}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-6">
                                    <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                                    <div className="space-y-3">
                                        <QuickActionButton
                                            icon={MessageSquare}
                                            label="Messages"
                                            onClick={() => router.push('/seller/messages')}
                                        />
                                        <QuickActionButton
                                            icon={BarChart3}
                                            label="Analytics"
                                            onClick={() => router.push('/seller/analytics')}
                                        />
                                        <QuickActionButton
                                            icon={Users}
                                            label="Profile"
                                            onClick={() => router.push('/seller/profile')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            )
        }

function UserDashboardContent() {
    return (
        <div className="space-y-8">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                    <Package className="w-8 h-8 text-brand-primary mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-1">0</h3>
                    <p className="text-gray-400">Purchases</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-1">0</h3>
                    <p className="text-gray-400">Wishlist Items</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-1">0</h3>
                    <p className="text-gray-400">Messages</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <a
                        href="/explore"
                        className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 hover:border-brand-primary/50"
                    >
                        <Package className="w-6 h-6 text-brand-primary mb-3" />
                        <h3 className="font-semibold text-white mb-1">Browse Products</h3>
                        <p className="text-sm text-gray-400">Discover AI prompts and automation tools</p>
                    </a>
                    <a
                        href="/become-seller"
                        className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 hover:border-brand-primary/50"
                    >
                        <TrendingUp className="w-6 h-6 text-brand-primary mb-3" />
                        <h3 className="font-semibold text-white mb-1">Become a Seller</h3>
                        <p className="text-sm text-gray-400">Start selling your expertise</p>
                    </a>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
                <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No recent activity</p>
                </div>
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, trend, color }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 text-${color}`} />
                <span className="text-xs text-green-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {trend}
                </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    )
}

function ProductCard({ product, onEdit, onView }) {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{product.title}</h3>
                    <p className="text-gray-400 text-sm">{product.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                    product.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                    {product.status}
                </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                    <p className="text-gray-400">Price</p>
                    <p className="text-brand-primary font-semibold">${product.price}</p>
                </div>
                <div>
                    <p className="text-gray-400">Sales</p>
                    <p className="text-white">{product.sales}</p>
                </div>
                <div>
                    <p className="text-gray-400">Views</p>
                    <p className="text-white">{product.views}</p>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-white">{product.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onView(product.id)}
                        className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                        title="View Product"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(product.id)}
                        className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                        title="Edit Product"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function QuickActionButton({ icon: Icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </button>
    )
}
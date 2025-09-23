'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingBag, Package, Search, DollarSign, FileText, Zap, Bot, Layers, RefreshCw, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { adminAPI } from '@/lib/api/admin'
import Notification from '@/components/shared/Notification'
const BRAND = '#00FF89'
const typeIcons = {
    prompt: FileText,
    automation: Zap,
    agent: Bot,
    bundle: Layers
}
const typeColors = {
    prompt: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    automation: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    agent: 'text-[#00FF89] bg-[#00FF89]/10 border-[#00FF89]/20',
    bundle: 'text-[#FFC050] bg-[#FFC050]/10 border-[#FFC050]/20'
}
function LoadingState() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-gray-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Loading orders...</span>
            </div>
        </div>
    )
}
function EmptyState() {
    return (
        <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag className="w-16 h-16 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Orders Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">This user hasn't made any purchases yet.</p>
        </div>
    )
}
function OrderCard({ order }) {
    const Icon = typeIcons[order.product?.type] || Package
    const colorClass = typeColors[order.product?.type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    return (
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-[#00FF89]/30 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{order.product?.title || 'Unknown Product'}</h3>
                        <p className="text-gray-400 text-sm capitalize">{order.product?.type || 'unknown'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[#00FF89] font-bold text-lg">${order.product?.price || 0}</div>
                    <div className="text-gray-400 text-sm">Order #{String(order.purchaseId || order._id).slice(-6)}</div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="text-gray-400 text-xs mb-1">Purchase Date</div>
                    <div className="text-white text-sm">
                        {new Date(order.purchaseDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                </div>
                <div>
                    <div className="text-gray-400 text-xs mb-1">Status</div>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/20">
                        Completed
                    </div>
                </div>
            </div>
            {order.product?.category && (
                <div className="mb-4">
                    <div className="text-gray-400 text-xs mb-1">Category</div>
                    <div className="text-white text-sm capitalize">{order.product.category}</div>
                </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <Link
                    href={`/products/${order.product?.slug || order.product?._id}`}
                    className="inline-flex items-center gap-2 text-[#00FF89] hover:text-[#00FF89]/80 text-sm transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    View Product
                </Link>
                <div className="text-gray-400 text-xs">Access: {order.accessGrantedAt ? 'Granted' : 'Pending'}</div>
            </div>
        </div>
    )
}
function UserInfo({ user, orderStats }) {
    if (!user) return null
    return (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00FF89] to-[#00FF89]/70 rounded-full flex items-center justify-center text-black font-bold text-lg">
                    {(user.name || user.emailAddress || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{user.name || 'Unnamed User'}</h2>
                    <p className="text-gray-400">{user.emailAddress || user.email}</p>
                </div>
                <div className="text-right">
                    <div className="text-gray-400 text-sm">Member Since</div>
                    <div className="text-white">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                        })}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#121212] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="w-4 h-4 text-[#00FF89]" />
                        <span className="text-gray-400 text-sm">Total Orders</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{orderStats.totalOrders || 0}</div>
                </div>
                <div className="bg-[#121212] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-[#FFC050]" />
                        <span className="text-gray-400 text-sm">Total Spent</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${orderStats.totalSpent || 0}</div>
                </div>
                <div className="bg-[#121212] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-sm">Avg. Order Value</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        ${orderStats.totalOrders > 0 ? ((orderStats.totalSpent || 0) / orderStats.totalOrders).toFixed(2) : '0.00'}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default function AdminUserOrdersPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.userId
    const [orders, setOrders] = useState([])
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [notifications, setNotifications] = useState([])
    const showMessage = (message, type = 'info', title = null) => {
        const id = Date.now()
        const notification = { id, type, message, title, duration: 4000 }
        setNotifications((prev) => [...prev, notification])
    }
    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }
    const fetchUserAndOrders = async (page = 1) => {
        try {
            setLoading(true)
            console.log('Fetching user orders for userId:', userId, 'page:', page, 'filterType:', filterType)
            const response = await adminAPI.users.getOrders(userId, {
                page,
                limit: 20,
                type: filterType !== 'all' ? filterType : undefined
            })
            console.log('Combined response:', response)
            setUser(response?.user || null)
            const ordersData = response?.purchases || []
            console.log('Extracted orders data:', ordersData)
            setOrders(ordersData)
            setTotalPages(response?.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Failed to fetch user orders:', error)
            console.error('Error details:', error.response?.data || error.message)
            showMessage('Failed to load user orders', 'error')
            setUser(null)
            setOrders([])
            setTotalPages(1)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        if (userId) {
            fetchUserAndOrders(1)
        }
    }, [userId, filterType])
    useEffect(() => {
        if (currentPage !== 1) {
            fetchUserAndOrders(currentPage)
        }
    }, [currentPage])
    const filteredOrders = orders.filter((order) => {
        if (!searchTerm) return true
        const title = order.product?.title || ''
        const category = order.product?.category || ''
        return title.toLowerCase().includes(searchTerm.toLowerCase()) || category.toLowerCase().includes(searchTerm.toLowerCase())
    })
    const orderStats = {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + (order.product?.price || 0), 0)
    }
    return (
        <div className="min-h-screen bg-[#121212]">
            <div className="border-b border-gray-800 bg-[#1a1a1a]">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="p-2 bg-[#00FF89]/20 rounded-lg">
                            <ShoppingBag
                                className="w-6 h-6"
                                style={{ color: BRAND }}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">User Order History</h1>
                            <p className="text-gray-400">View and manage user purchases</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF89] transition-colors"
                                />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="bg-[#121212] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00FF89] transition-colors">
                                <option value="all">All Products</option>
                                <option value="prompt">Prompts</option>
                                <option value="automation">Automations</option>
                                <option value="agent">Agents</option>
                                <option value="bundle">Bundles</option>
                            </select>
                        </div>
                        <button
                            onClick={() => fetchUserAndOrders(currentPage)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-[#00FF89] text-black rounded-lg hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
            <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
                <div className="pointer-events-auto">
                    {notifications.map((notification) => (
                        <Notification
                            key={notification.id}
                            id={notification.id}
                            type={notification.type}
                            message={notification.message}
                            title={notification.title}
                            duration={notification.duration}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </div>
            </div>
            <div className="p-6">
                <UserInfo
                    user={user}
                    orderStats={orderStats}
                />
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Purchase History ({filteredOrders.length})</h2>
                            {orders.length > 0 && (
                                <div className="text-sm text-gray-400">
                                    Total Value: <span className="text-[#00FF89] font-semibold">${orderStats.totalSpent}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <LoadingState />
                        ) : filteredOrders.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {filteredOrders.map((order) => (
                                        <OrderCard
                                            key={order.purchaseId || order._id}
                                            order={order}
                                        />
                                    ))}
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                            Previous
                                        </button>
                                        <span className="text-gray-300 px-4">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
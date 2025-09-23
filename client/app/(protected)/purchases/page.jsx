'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Search,
    Calendar,
    CreditCard,
    ChevronRight,
    FileText,
    Zap,
    Bot,
    Layers,
    Loader2,
    List,
    Grid as GridIcon} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { useAuth } from '@/hooks/useAuth'
import { purchaseAPI } from '@/lib/api'
import Link from 'next/link'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import ImagePlaceholder from '@/components/shared/ui/ImagePlaceholder'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
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
export default function PurchasesPage() {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const { user } = useAuth()
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    const [viewMode, setViewMode] = useState('grid') 
    const [sort, setSort] = useState('recent') 
    const [selected, setSelected] = useState(new Set())
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    useEffect(() => {
        loadPurchases()
    }, [page, filter])
    const loadPurchases = async () => {
        setLoading(true)
        try {
            const options = {
                page,
                limit: 12
            }
            if (filter !== 'all') options.type = filter
            const response = await purchaseAPI.getUserPurchases(options)
            setPurchases(response.purchases || [])
            setPagination(response.pagination)
        } catch (error) {
            console.error('Error loading purchases:', error)
            showMessage('Failed to load purchases', 'error')
        } finally {
            setLoading(false)
        }
    }
    const stats = useMemo(() => {
        const total = purchases.reduce((s, p) => s + (p.product?.price || 0), 0)
        const counts = purchases.reduce((acc, p) => {
            if (!p.product || !p.product.type) return acc
            acc[p.product.type] = (acc[p.product.type] || 0) + 1
            return acc
        }, {})
        return { totalSpent: total, counts }
    }, [purchases])
    const toggleSelect = (purchaseId) => {
        const copy = new Set(selected)
        if (copy.has(purchaseId)) copy.delete(purchaseId)
        else copy.add(purchaseId)
        setSelected(copy)
    }
    const filteredPurchases = purchases
        .filter((purchase) => {
            const title = purchase.product?.title || ''
            const category = purchase.product?.category || ''
            return title.toLowerCase().includes(searchTerm.toLowerCase()) || category.toLowerCase().includes(searchTerm.toLowerCase())
        })
        .sort((a, b) => {
            if (sort === 'recent') return new Date(b.purchaseDate) - new Date(a.purchaseDate)
            if (sort === 'price-asc') return (a.product.price || 0) - (b.product.price || 0)
            if (sort === 'price-desc') return (b.product.price || 0) - (a.product.price || 0)
            return 0
        })
    const toggleSelectAll = () => {
        const displayed = filteredPurchases
        if (selected.size === displayed.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(displayed.map((p) => p.purchaseId)))
        }
    }
    if (loading && purchases.length === 0) {
        return (
            <div className="min-h-screen bg-[#121212]">
                {notification && (
                    <InlineNotification
                        type={notification.type}
                        message={notification.message}
                        onDismiss={clearNotification}
                    />
                )}
                <Container>
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00FF89]" />
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-[#121212]">
            <main className="pt-24 pb-16">
                <Container>
                    <div className="mb-8">
                        <div className="text-center mb-8">
                            <h1
                                className="text-4xl lg:text-5xl font-bold text-[#00FF89] mb-4"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                My Purchases
                            </h1>
                            <p
                                className="text-gray-400 max-w-2xl mx-auto text-lg"
                                style={{ fontFamily: 'var(--font-kumbh-sans)' }}>
                                Access all your purchased products. Manage licenses, invoices and quickly revisit your favorite items.
                            </p>
                        </div>
                        <div className="mb-8">
                            <StatsBar
                                purchases={purchases}
                                stats={stats}
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                                    <div className="relative w-full lg:w-80">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search your purchases..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={filter}
                                            onChange={(e) => {
                                                setFilter(e.target.value)
                                                setPage(1)
                                            }}
                                            className="bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]">
                                            <option value="all">All Products</option>
                                            <option value="prompt">Prompts</option>
                                            <option value="automation">Automations</option>
                                            <option value="agent">Agents</option>
                                            <option value="bundle">Bundles</option>
                                        </select>
                                        <select
                                            value={sort}
                                            onChange={(e) => setSort(e.target.value)}
                                            className="bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]">
                                            <option value="recent">Most Recent</option>
                                            <option value="price-desc">Price: High to Low</option>
                                            <option value="price-asc">Price: Low to High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-[#121212] border border-gray-700 rounded-xl p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#00FF89] text-[#121212]' : 'text-gray-400 hover:text-white'}`}>
                                            <GridIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#00FF89] text-[#121212]' : 'text-gray-400 hover:text-white'}`}>
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={toggleSelectAll}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all">
                                        {selected.size === filteredPurchases.length ? 'Unselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {loading ? (
                            <LoadingState />
                        ) : filteredPurchases.length === 0 ? (
                            <EmptyState filter={filter} />
                        ) : viewMode === 'list' ? (
                            <OrdersTable
                                purchases={filteredPurchases}
                                selected={selected}
                                onToggle={toggleSelect}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredPurchases.map((purchase) => (
                                    <PurchaseCard
                                        key={purchase.purchaseId}
                                        purchase={purchase}
                                        selected={selected.has(purchase.purchaseId)}
                                        onToggle={() => toggleSelect(purchase.purchaseId)}
                                    />
                                ))}
                            </div>
                        )}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: pagination.totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPage(i + 1)}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                            page === i + 1
                                                ? 'bg-[#00FF89] text-[#121212]'
                                                : 'bg-[#1f1f1f] text-gray-300 hover:bg-gray-700 border border-gray-700'
                                        }`}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>
            </main>
        </div>
    )
}
function PurchaseCard({ purchase, selected = false, onToggle }) {
    const { product, purchaseDate } = purchase
    if (!product) {
        return (
            <motion.div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-4">
                <div className="text-gray-400">Product data unavailable</div>
            </motion.div>
        )
    }
    const Icon = typeIcons[product.type] || Package
    const colorClass = typeColors[product.type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-[#1f1f1f] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#00FF89]/50 transition-all duration-300 group">
            <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
                {product.thumbnail ? (
                    typeof OptimizedImage === 'function' ? (
                        <OptimizedImage
                            src={product.thumbnail}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <ImagePlaceholder className="w-full h-full" />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-16 h-16 text-gray-600" />
                    </div>
                )}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg border ${colorClass} backdrop-blur-sm`}>
                    <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium capitalize">{product.type}</span>
                    </div>
                </div>
                <div className="absolute top-4 right-4">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={onToggle}
                        className="w-5 h-5 rounded border-2 border-gray-600 bg-[#121212] checked:bg-[#00FF89] checked:border-[#00FF89] focus:ring-[#00FF89] focus:ring-2"
                    />
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-6">
                <h3
                    className="text-xl font-bold text-white mb-2 line-clamp-2"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    {product.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="capitalize">{product.category?.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className="capitalize">{product.industry?.replace('_', ' ')}</span>
                </div>
                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Purchased {new Date(purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[#00FF89] font-semibold">${product.price}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/purchased/${product.slug || product._id || 'unknown'}`}
                        className="flex-1 px-4 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] font-semibold rounded-xl transition-all text-center">
                        Access Product
                    </Link>
                    <Link
                        href={`/purchased/${product.slug || product._id || 'unknown'}`}
                        className="flex items-center justify-center px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs">
                    <Link
                        href="#"
                        className="text-gray-400 hover:text-[#00FF89] transition-colors">
                        View Invoice
                    </Link>
                    <span className="text-[#00FF89] font-medium">Accessible</span>
                </div>
            </div>
        </motion.div>
    )
}
function StatsBar({ purchases = [], stats = { totalSpent: 0, counts: {} } }) {
    const total = purchases.length || 0
    const spent = stats.totalSpent || 0
    const avg = total > 0 ? spent / total : 0
    const currencyFormatter = (v) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        }).format(Number(v))
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] border border-gray-800 rounded-2xl p-6 hover:border-[#00FF89]/30 transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-[#00FF89]/10 border border-[#00FF89]/20">
                        <Package className="w-8 h-8 text-[#00FF89]" />
                    </div>
                    <div className="flex-1">
                        <div
                            className="text-gray-400 text-sm mb-1"
                            style={{ fontFamily: 'var(--font-kumbh-sans)' }}>
                            Total Purchases
                        </div>
                        <div
                            className="text-4xl font-bold text-white mb-2"
                            style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            <AnimatedNumber value={total} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(typeIcons).map((type) => {
                                const Icon = typeIcons[type]
                                const count = stats.counts[type] || 0
                                if (count === 0) return null
                                return (
                                    <div
                                        key={type}
                                        className="flex items-center gap-1 text-xs bg-gray-800 px-2 py-1 rounded-full">
                                        <Icon className="w-3 h-3 text-gray-400" />
                                        <span className="text-gray-300 capitalize">{type}s</span>
                                        <span className="text-[#00FF89] font-semibold">{count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] border border-gray-800 rounded-2xl p-6 hover:border-[#FFC050]/30 transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-[#FFC050]/10 border border-[#FFC050]/20">
                        <CreditCard className="w-8 h-8 text-[#FFC050]" />
                    </div>
                    <div className="flex-1">
                        <div
                            className="text-gray-400 text-sm mb-1"
                            style={{ fontFamily: 'var(--font-kumbh-sans)' }}>
                            Total Spent
                        </div>
                        <div
                            className="text-4xl font-bold text-white mb-2"
                            style={{ fontFamily: 'var(--font-league-spartan)' }}>
                            <AnimatedNumber
                                value={spent}
                                formatter={currencyFormatter}
                            />
                        </div>
                        <div className="text-sm text-gray-400">
                            Average per purchase: <span className="text-[#FFC050] font-semibold">{currencyFormatter(avg)}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
function OrdersTable({ purchases = [], selected = new Set(), onToggle = () => {} }) {
    return (
        <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-[#121212] border-b border-gray-800">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4"
                                />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {purchases.map((purchase) => {
                            const Icon = typeIcons[purchase.product?.type] || Package
                            return (
                                <tr
                                    key={purchase.purchaseId}
                                    className="hover:bg-[#2a2a2a] transition-colors">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(purchase.purchaseId)}
                                            onChange={() => onToggle(purchase.purchaseId)}
                                            className="w-4 h-4 rounded border-2 border-gray-600 bg-[#121212]"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">#{String(purchase.purchaseId).slice(-6)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                                                {purchase.product?.thumbnail ? (
                                                    typeof OptimizedImage === 'function' ? (
                                                        <OptimizedImage
                                                            src={purchase.product.thumbnail}
                                                            alt={purchase.product.title}
                                                            width={48}
                                                            height={48}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-gray-500" />
                                                    )
                                                ) : (
                                                    <Package className="w-6 h-6 text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{purchase.product?.title}</div>
                                                <div className="text-gray-400 text-sm capitalize">{purchase.product?.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300 capitalize">{purchase.product?.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-[#00FF89]">${purchase.product?.price}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/20">
                                            Accessible
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/purchased/${purchase.product?.slug || purchase.product?._id}`}
                                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-all">
                                                View
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
function LoadingState() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-[#1f1f1f] border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-800" />
                    <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-800 rounded" />
                        <div className="h-4 bg-gray-800 rounded w-3/4" />
                        <div className="h-4 bg-gray-800 rounded w-1/2" />
                        <div className="flex gap-3">
                            <div className="flex-1 h-10 bg-gray-800 rounded-xl" />
                            <div className="w-10 h-10 bg-gray-800 rounded-xl" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
function EmptyState({ filter }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-8">
                <Package className="w-16 h-16 text-gray-600" />
            </div>
            <h2
                className="text-3xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                {filter === 'all' ? 'No purchases yet' : `No ${filter}s purchased`}
            </h2>
            <p
                className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg"
                style={{ fontFamily: 'var(--font-kumbh-sans)' }}>
                {filter === 'all'
                    ? "You haven't purchased any products yet. Explore our marketplace to find prompts, automations and agents that accelerate your workflows."
                    : `You haven't purchased any ${filter}s yet. Browse the marketplace to find what you need.`}
            </p>
            <div className="flex items-center justify-center gap-4">
                <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] font-bold rounded-xl transition-all"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    Explore Products
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#1f1f1f] hover:bg-gray-700 text-white border border-gray-700 rounded-xl transition-all"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    Marketplace
                </Link>
            </div>
        </motion.div>
    )
}
function AnimatedNumber({ value = 0, duration = 800, formatter = (v) => Math.round(v) }) {
    const [display, setDisplay] = useState(0)
    const prevRef = useRef(0)
    useEffect(() => {
        const startVal = prevRef.current
        const endVal = Number(value)
        const delta = endVal - startVal
        if (delta === 0) {
            setDisplay(endVal)
            return
        }
        let startTime = null
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)
            const current = startVal + delta * progress
            setDisplay(current)
            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                prevRef.current = endVal
            }
        }
        requestAnimationFrame(animate)
    }, [value, duration])
    return <span>{formatter(display)}</span>
}
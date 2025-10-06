'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { promocodeAPI } from '@/lib/api'
import { Button } from '@/components/shared/ui/button'
import Input from '@/components/shared/ui/input'
import Card from '@/components/shared/ui/card'
import Badge from '@/components/shared/ui/badge'
import { Plus, Search, Edit, Trash2, BarChart, Copy, Download, Users, Percent, DollarSign, CheckCircle, Tag, Filter, Clock } from 'lucide-react'
import PromocodeForm from '@/components/features/promocode/PromocodeForm'
import PromocodeStats from '@/components/features/promocode/PromocodeStats'
import LoadingSpinner from '@/components/shared/ui/LoadingSpinner'
import Notification from '@/components/shared/Notification'
import { AnimatePresence } from 'framer-motion'

export default function AdminPromocodesPage() {
    const [notifications, setNotifications] = useState([])

    const showMessage = (message, type = 'info') => {
        const id = Date.now() + Math.random()
        setNotifications((prev) => [...prev, { id, message, type }])
    }

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    const router = useRouter()
    const [promocodes, setPromocodes] = useState([])
    const [allPromocodes, setAllPromocodes] = useState([]) // Store all promocodes for client-side filtering
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [filterCreator, setFilterCreator] = useState('all')
    const [showForm, setShowForm] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [selectedPromocode, setSelectedPromocode] = useState(null)
    const [copiedCode, setCopiedCode] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })
    useEffect(() => {
        fetchPromocodes()
    }, [pagination.page, filterStatus, filterType])

    // Client-side filtering effect
    useEffect(() => {
        filterPromocodes()
    }, [searchTerm, filterStatus, filterType, filterCreator, allPromocodes])

    const fetchPromocodes = async () => {
        try {
            setLoading(true)
            const response = await promocodeAPI.getPromocodes({
                page: pagination.page,
                limit: pagination.limit
                // Remove server-side filtering for status and type, handle client-side
                // status: filterStatus !== 'all' ? filterStatus : undefined,
                // type: filterType !== 'all' ? filterType : undefined,
                // search: searchTerm || undefined
            })
            setAllPromocodes(response.promocodes || [])
            setPagination({
                ...pagination,
                total: response.total || 0,
                totalPages: response.totalPages || 0
            })
        } catch (error) {
            showMessage('Failed to fetch promocodes', 'error')
            console.error('Error fetching promocodes:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterPromocodes = () => {
        let filtered = [...allPromocodes]

        // Search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (promocode) =>
                    promocode.code.toLowerCase().includes(search) ||
                    (promocode.description && promocode.description.toLowerCase().includes(search)) ||
                    (promocode.createdBy?.businessName && promocode.createdBy.businessName.toLowerCase().includes(search)) ||
                    (promocode.createdBy?.emailAddress && promocode.createdBy.emailAddress.toLowerCase().includes(search))
            )
        }

        // Status filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'expired') {
                filtered = filtered.filter((promocode) => promocode.validUntil && new Date(promocode.validUntil) < new Date())
            } else if (filterStatus === 'active') {
                filtered = filtered.filter((promocode) => promocode.status === 'active' || promocode.isActive === true)
            } else if (filterStatus === 'inactive') {
                filtered = filtered.filter((promocode) => promocode.status === 'inactive' || promocode.isActive === false)
            }
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter((promocode) => promocode.discountType === filterType)
        }

        // Creator filter (admin / seller)
        if (filterCreator !== 'all') {
            filtered = filtered.filter((p) => {
                const role = (p.createdByType || p.createdBy?.role || '').toString().toLowerCase()
                return role === filterCreator
            })
        }

        setPromocodes(filtered)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        // No need to fetch data, filtering happens automatically via useEffect
    }

    const handleCreateEdit = (promocode = null) => {
        setSelectedPromocode(promocode)
        setShowForm(true)
    }
    const handleDelete = async (promocodeId) => {
        if (!confirm('Are you sure you want to delete this promocode?')) return
        try {
            await promocodeAPI.deletePromocode(promocodeId)
            showMessage('Promocode deleted successfully', 'success')
            fetchPromocodes()
        } catch (error) {
            showMessage('Failed to delete promocode', 'error')
            console.error('Error deleting promocode:', error)
        }
    }
    const handleToggleStatus = async (promocodeId) => {
        try {
            await promocodeAPI.togglePromocodeStatus(promocodeId)
            showMessage('Promocode status updated', 'success')
            fetchPromocodes()
        } catch (error) {
            showMessage('Failed to update promocode status', 'error')
            console.error('Error toggling status:', error)
        }
    }
    const handleShowStats = (promocode) => {
        setSelectedPromocode(promocode)
        setShowStats(true)
    }
    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        showMessage('Code copied to clipboard', 'success')
        // Clear the copied state after 2 seconds
        setTimeout(() => setCopiedCode(null), 2000)
    }
    const handleFormClose = (refreshData = false) => {
        setShowForm(false)
        setSelectedPromocode(null)
        if (refreshData) {
            fetchPromocodes()
        }
    }
    const handleStatsClose = () => {
        setShowStats(false)
        setSelectedPromocode(null)
    }
    const exportPromocodes = () => {
        const headers = ['Code', 'Status', 'Type', 'Value', 'Uses', 'Max Uses', 'Created By', 'Created At']
        const csvData = promocodes.map((p) => [
            p.code,
            p.status,
            p.discountType,
            p.discountValue,
            p.usageCount || 0,
            p.maxUses || 'Unlimited',
            p.createdBy?.emailAddress || 'Unknown',
            new Date(p.createdAt).toLocaleDateString()
        ])
        const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `promocodes-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        showMessage('Promocodes exported successfully', 'success')
    }

    const ToggleSwitch = ({ enabled, onToggle, label }) => (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={enabled}
            aria-label={label || (enabled ? 'Deactivate promocode' : 'Activate promocode')}
            className={`relative inline-flex items-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00FF89]/40 focus-visible:ring-offset-transparent
                 ${enabled ? 'bg-[#00FF89] hover:bg-[#00FF89]/90' : 'bg-gray-600/50 hover:bg-gray-600/70'}
                 rounded-full w-16 h-9`}>
            <span
                className={`inline-block h-7 w-7 transform rounded-full bg-white shadow transition-transform duration-200
                    ${enabled ? 'translate-x-7' : 'translate-x-1'}`}
            />
        </button>
    )

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            {/* Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                <AnimatePresence mode="popLayout">
                    {notifications.map((notification) => (
                        <Notification
                            key={notification.id}
                            id={notification.id}
                            type={notification.type}
                            message={notification.message}
                            onClose={removeNotification}
                            duration={5000}
                        />
                    ))}
                </AnimatePresence>
            </div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Promocode Management (Admin)</h1>
                <p className="text-gray-600">Manage all promotional codes across the platform</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card variant="subtleDark" hover={false} className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Promocodes</div>
                    <div className="text-2xl font-bold">{promocodes?.length}</div>
                </Card>
                <Card variant="subtleDark" hover={false} className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Active Codes</div>
                    <div className="text-2xl font-bold text-green-600">
                        {promocodes.filter((p) => p.status === 'active' || p.isActive === true).length}
                    </div>
                </Card>
                <Card variant="subtleDark" hover={false} className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Uses</div>
                    <div className="text-2xl font-bold">{promocodes.reduce((sum, p) => sum + (p.usageCount || 0), 0)}</div>
                </Card>
                <Card variant="subtleDark" hover={false} className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Discount Given</div>
                    <div className="text-2xl font-bold text-blue-600">
                        ${promocodes.reduce((sum, p) => sum + (p.totalDiscountAmount || 0), 0).toFixed(2)}
                    </div>
                </Card>
            </div>
            <Card variant="translucent" hover={false} className="p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 flex gap-2">
                        <Input
                            type="text"
                            placeholder="Search by code, description, or seller..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            variant="secondary">
                            <Search className="w-4 h-4 mt-4" />
                        </Button>
                    </form>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border rounded-lg mt-2">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="expired">Expired</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border rounded-lg mt-2">
                            <option value="all">All Types</option>
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                        </select>
                        <select
                            value={filterCreator}
                            onChange={(e) => setFilterCreator(e.target.value)}
                            className="px-4 py-2 border rounded-lg mt-2">
                            <option value="all">All Creators</option>
                            <option value="admin">Admin</option>
                            <option value="seller">Seller</option>
                        </select>
                        <Button
                            onClick={exportPromocodes}
                            variant="outline"
                            className="gap-2 mt-2"
                            disabled={promocodes.length === 0}>
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                        <Button
                            onClick={() => handleCreateEdit()}
                            className="gap-2 mt-2 bg-[#00FF89] text-black hover:bg-[#00FF89]/90 focus-visible:ring-[#00FF89]/40">
                            <Plus className="w-4 h-4" />
                            Create Promocode
                        </Button>
                    </div>
                </div>
            </Card>
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : promocodes.length === 0 ? (
                <Card variant="translucent" hover={false} className="p-12 text-center">
                    <p className="text-gray-500 mb-4">No promocodes found</p>
                    <Button onClick={() => handleCreateEdit()}>Create First Promocode</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {promocodes.map((promocode) => {
                        const usagePercentage = promocode.maxUses ? Math.round((promocode.usageCount / promocode.maxUses) * 100) : 0
                        const isExpiringSoon = promocode.validUntil && new Date(promocode.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                        const rawRole = promocode.createdByType || promocode.createdBy?.role || ''
                        const roleLower = rawRole.toString().toLowerCase()
                        const isAdminCreator = roleLower === 'admin'
                        const showCreatorBadge = Boolean(rawRole)
                        const creatorLabel = isAdminCreator ? 'Admin' : promocode.createdBy?.businessName || 'Seller'

                        return (
                            <div
                                key={promocode._id}
                                className="group bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-2xl p-6 hover:border-[#00FF89]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00FF89]/10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="text-xl font-bold text-white font-mono truncate">{promocode.code}</h3>
                                            <span
                                                className={`text-sm font-medium px-2 py-1 rounded-lg ${
                                                    promocode.status === 'active' || promocode.isActive === true
                                                        ? 'text-green-500 bg-green-500/10'
                                                        : 'text-red-500 bg-red-500/10'
                                                }`}>
                                                {promocode.status === 'active' || promocode.isActive === true ? 'Active' : 'Inactive'}
                                            </span>
                                            {showCreatorBadge && (
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border ${
                                                        isAdminCreator
                                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    <Users className="w-3 h-3" />
                                                    {creatorLabel}
                                                </span>
                                            )}
                                        </div>
                                        {promocode.description && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{promocode.description}</p>}
                                        <div className="flex items-center gap-2 mb-4">
                                            <div
                                                className={`p-2 rounded-xl ${
                                                    promocode.discountType === 'percentage' ? 'bg-[#00FF89]/10' : 'bg-[#FFC050]/10'
                                                }`}>
                                                {promocode.discountType === 'percentage' ? (
                                                    <Percent className="w-4 h-4 text-[#00FF89]" />
                                                ) : (
                                                    <DollarSign className="w-4 h-4 text-[#FFC050]" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-white">
                                                    {promocode.discountType === 'percentage'
                                                        ? `${promocode.discountValue}%`
                                                        : `$${promocode.discountValue}`}
                                                </p>
                                                <p className="text-xs text-gray-500">OFF</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(promocode.code)}
                                            className={`p-2 rounded-lg transition-all ${
                                                copiedCode === promocode.code
                                                    ? 'bg-[#00FF89] text-[#0a0a0a]'
                                                    : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#00FF89]/10 hover:text-[#00FF89]'
                                            }`}
                                            title="Copy code">
                                            {copiedCode === promocode.code ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleShowStats(promocode)}
                                            className="p-2 bg-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#FFC050]/10 hover:text-[#FFC050] transition-all"
                                            title="View stats">
                                            <BarChart className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCreateEdit(promocode)}
                                            className="p-2 bg-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#00FF89]/10 hover:text-[#00FF89] transition-all"
                                            title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Uses</p>
                                        <p className="font-bold text-white">
                                            {promocode.usageCount || 0}
                                            {promocode.maxUses && `/${promocode.maxUses}`}
                                        </p>
                                    </div>
                                    {promocode.minPurchaseAmount ? (
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Min Order</p>
                                            <p className="font-bold text-white">${promocode.minPurchaseAmount}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Expires</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <p className="font-bold text-white">
                                                    {promocode.validUntil
                                                        ? (() => {
                                                              const now = new Date()
                                                              const expiryDate = new Date(promocode.validUntil)
                                                              const diffTime = expiryDate - now
                                                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                                                              if (diffDays < 0) {
                                                                  return 'Expired'
                                                              } else if (diffDays === 0) {
                                                                  return 'Today'
                                                              } else if (diffDays === 1) {
                                                                  return '1 day'
                                                              } else {
                                                                  return `${diffDays} days`
                                                              }
                                                          })()
                                                        : 'Never'}
                                                </p>
                                                {promocode.validUntil && (
                                                    <div className="relative group">
                                                        <div className="w-3 h-3 rounded-full bg-gray-600 flex items-center justify-center cursor-help">
                                                            <span className="text-[8px] text-white font-bold">i</span>
                                                        </div>
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                            {new Date(promocode.validUntil).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {promocode.maxUses && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-xs mb-2">
                                            <span className="text-gray-500">Usage Progress</span>
                                            <span className="text-white font-medium">{usagePercentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    usagePercentage >= 80
                                                        ? 'bg-gradient-to-r from-red-500 to-red-400'
                                                        : usagePercentage >= 50
                                                          ? 'bg-gradient-to-r from-[#FFC050] to-[#FFB020]'
                                                          : 'bg-gradient-to-r from-[#00FF89] to-[#00DD78]'
                                                }`}
                                                style={{ width: `${usagePercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {promocode.applicableProducts && promocode.applicableProducts.length > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#00FF89]/10 text-[#00FF89] text-xs rounded-lg border border-[#00FF89]/20">
                                            <Tag className="w-3 h-3" />
                                            {promocode.applicableProducts.length} Products
                                        </span>
                                    )}
                                    {promocode.applicableCategories && promocode.applicableCategories.length > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#FFC050]/10 text-[#FFC050] text-xs rounded-lg border border-[#FFC050]/20">
                                            <Filter className="w-3 h-3" />
                                            {promocode.applicableCategories.length} Categories
                                        </span>
                                    )}
                                    {(!promocode.applicableProducts || promocode.applicableProducts.length === 0) &&
                                        (!promocode.applicableCategories || promocode.applicableCategories.length === 0) && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-lg border border-gray-600">
                                                All Products
                                            </span>
                                        )}
                                    {isExpiringSoon && promocode.isActive === true && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-lg border border-yellow-500/20">
                                            <Clock className="w-3 h-3" />
                                            Expiring Soon
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <ToggleSwitch
                                            enabled={promocode.isActive}
                                            onToggle={() => handleToggleStatus(promocode._id)}
                                            label={promocode.isActive ? 'Deactivate promocode' : 'Activate promocode'}
                                        />
                                        <span className={`text-sm font-medium ${promocode.isActive ? 'text-[#00FF89]' : 'text-gray-400'}`}>
                                            {promocode.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(promocode._id)}
                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                        title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>
                        Previous
                    </Button>
                    <span className="flex items-center px-4">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>
                        Next
                    </Button>
                </div>
            )}
            {showForm && (
                <PromocodeForm
                    promocode={selectedPromocode}
                    onClose={handleFormClose}
                />
            )}
            {showStats && selectedPromocode && (
                <PromocodeStats
                    promocode={selectedPromocode}
                    onClose={handleStatsClose}
                />
            )}
        </div>
    )
}


'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { promocodeAPI } from '@/lib/api'
import { Button } from '@/components/shared/ui/button'
import Input from '@/components/shared/ui/input'
import Card from '@/components/shared/ui/card'
import Badge from '@/components/shared/ui/badge'
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    ToggleLeft, 
    ToggleRight,
    BarChart,
    Copy,
    Download,
    Users
} from 'lucide-react'
import PromocodeForm from '@/components/features/promocode/PromocodeForm'
import PromocodeStats from '@/components/features/promocode/PromocodeStats'
import LoadingSpinner from '@/components/shared/ui/LoadingSpinner'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function AdminPromocodesPage() {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const router = useRouter()
    const [promocodes, setPromocodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [showForm, setShowForm] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [selectedPromocode, setSelectedPromocode] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })
    useEffect(() => {
        fetchPromocodes()
    }, [pagination.page, filterStatus, filterType])
    const fetchPromocodes = async () => {
        try {
            setLoading(true)
            const response = await promocodeAPI.getPromocodes({
                page: pagination.page,
                limit: pagination.limit,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                type: filterType !== 'all' ? filterType : undefined,
                search: searchTerm || undefined
            })
            setPromocodes(response.promocodes || [])
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
    const handleSearch = (e) => {
        e.preventDefault()
        setPagination({ ...pagination, page: 1 })
        fetchPromocodes()
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
        showMessage('Code copied to clipboard', 'success')
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
        const csvData = promocodes.map(p => [
            p.code,
            p.status,
            p.discountType,
            p.discountValue,
            p.usageCount || 0,
            p.maxUses || 'Unlimited',
            p.createdBy?.emailAddress || 'Unknown',
            new Date(p.createdAt).toLocaleDateString()
        ])
        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `promocodes-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        showMessage('Promocodes exported successfully', 'success')
    }
    return (
        <div className="container mx-auto px-4 py-8">
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Promocode Management (Admin)</h1>
                <p className="text-gray-600">Manage all promotional codes across the platform</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Promocodes</div>
                    <div className="text-2xl font-bold">{pagination.total}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Active Codes</div>
                    <div className="text-2xl font-bold text-green-600">
                        {promocodes.filter(p => p.status === 'active').length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Uses</div>
                    <div className="text-2xl font-bold">
                        {promocodes.reduce((sum, p) => sum + (p.usageCount || 0), 0)}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Discount Given</div>
                    <div className="text-2xl font-bold text-blue-600">
                        ${promocodes.reduce((sum, p) => sum + (p.totalDiscountAmount || 0), 0).toFixed(2)}
                    </div>
                </Card>
            </div>
            <Card className="p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <Input
                            type="text"
                            placeholder="Search by code, description, or seller..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" variant="secondary">
                            <Search className="w-4 h-4" />
                        </Button>
                    </form>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="expired">Expired</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="all">All Types</option>
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                        </select>
                        <Button 
                            onClick={exportPromocodes} 
                            variant="outline"
                            className="gap-2"
                            disabled={promocodes.length === 0}
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                        <Button onClick={() => handleCreateEdit()} className="gap-2">
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
                <Card className="p-12 text-center">
                    <p className="text-gray-500 mb-4">No promocodes found</p>
                    <Button onClick={() => handleCreateEdit()}>
                        Create First Promocode
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {promocodes.map((promocode) => (
                        <Card key={promocode._id} className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4 justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold">{promocode.code}</h3>
                                        <Badge variant={promocode.status === 'active' ? 'success' : 'secondary'}>
                                            {promocode.status}
                                        </Badge>
                                        <Badge variant="outline">
                                            {promocode.discountType === 'percentage' 
                                                ? `${promocode.discountValue}% OFF`
                                                : `$${promocode.discountValue} OFF`
                                            }
                                        </Badge>
                                        {promocode.createdBy && (
                                            <Badge variant="secondary" className="gap-1">
                                                <Users className="w-3 h-3" />
                                                {promocode.createdBy.role === 'admin' ? 'Admin' : promocode.createdBy.businessName || promocode.createdBy.emailAddress}
                                            </Badge>
                                        )}
                                    </div>
                                    {promocode.description && (
                                        <p className="text-gray-600 mb-2">{promocode.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <span>Uses: {promocode.usageCount || 0} / {promocode.maxUses || '∞'}</span>
                                        {promocode.validFrom && (
                                            <span>From: {new Date(promocode.validFrom).toLocaleDateString()}</span>
                                        )}
                                        {promocode.validUntil && (
                                            <span>Until: {new Date(promocode.validUntil).toLocaleDateString()}</span>
                                        )}
                                        {promocode.minPurchaseAmount && (
                                            <span>Min Purchase: ${promocode.minPurchaseAmount}</span>
                                        )}
                                        <span>Created: {new Date(promocode.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(promocode.code)}
                                        title="Copy code"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleShowStats(promocode)}
                                        title="View stats"
                                    >
                                        <BarChart className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleStatus(promocode._id)}
                                        title={promocode.status === 'active' ? 'Deactivate' : 'Activate'}
                                    >
                                        {promocode.status === 'active' ? (
                                            <ToggleRight className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCreateEdit(promocode)}
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(promocode._id)}
                                        title="Delete"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    >
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
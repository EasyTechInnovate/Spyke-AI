'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit, Trash2, Grid3X3, Target, X, Loader2, ToggleLeft, ToggleRight, Package, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import Input from '@/components/shared/ui/input'
import Card from '@/components/shared/ui/card'
import Badge from '@/components/shared/ui/badge'
import Notification from '@/components/shared/Notification'
import { categoryAPI, industryAPI } from '@/lib/api/toolsNiche'
export default function ToolsNichePage() {
    const [activeTab, setActiveTab] = useState('category')
    const [categories, setCategories] = useState([])
    const [industries, setIndustries] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '' })
    const [submitting, setSubmitting] = useState(false)
    const [operationLoading, setOperationLoading] = useState({})
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [notifications, setNotifications] = useState([])
    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random()
        const newNotification = { id, message, type }
        setNotifications((prev) => [...prev, newNotification])
    }, [])
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }, [])
    const fetchData = useCallback(
        async (showLoader = true) => {
            try {
                if (showLoader) setLoading(true)
                const [categoriesRes, industriesRes] = await Promise.all([categoryAPI.getCategories(), industryAPI.getIndustries()])
                const categoriesData = categoriesRes?.data?.categories || categoriesRes?.categories || categoriesRes?.data || []
                const industriesData = industriesRes?.data?.industries || industriesRes?.industries || industriesRes?.data || []
                setCategories(Array.isArray(categoriesData) ? categoriesData : [])
                setIndustries(Array.isArray(industriesData) ? industriesData : [])
            } catch (error) {
                console.error('Fetch Data Error:', error)
                addNotification(`Failed to load data: ${error?.response?.data?.message || error?.message || 'Unknown error'}`, 'error')
            } finally {
                setLoading(false)
            }
        },
        [addNotification]
    )
    useEffect(() => {
        fetchData()
    }, [fetchData])
    const currentData = activeTab === 'category' ? categories : industries
    const filteredData = currentData.filter(
        (item) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = filteredData.slice(startIndex, endIndex)
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, activeTab])
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
            document.querySelector('[data-pagination-content]')?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            })
        }
    }
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(1) 
    }
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2)
            let startPage = Math.max(currentPage - halfVisible, 1)
            let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages)
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(endPage - maxVisiblePages + 1, 1)
            }
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }
        }
        return pages
    }
    const handleCreate = () => {
        setEditingItem(null)
        setFormData({ name: '', description: '' })
        setShowCreateModal(true)
    }
    const handleEdit = (item) => {
        setEditingItem(item)
        setFormData({
            name: item.name || '',
            description: item.description || ''
        })
        setShowCreateModal(true)
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name.trim()) {
            addNotification('Name is required', 'error')
            return
        }
        try {
            setSubmitting(true)
            const data = {
                name: formData.name.trim(),
                description: formData.description.trim()
            }
            let response
            if (editingItem) {
                if (activeTab === 'category') {
                    response = await categoryAPI.updateCategory(editingItem._id, data)
                } else {
                    response = await industryAPI.updateIndustry(editingItem._id, data)
                }
            } else {
                if (activeTab === 'category') {
                    response = await categoryAPI.createCategory(data)
                } else {
                    response = await industryAPI.createIndustry(data)
                }
            }
            const isSuccess = response?.success !== false && response?.statusCode !== 409 && response?.statusCode !== 400
            if (isSuccess) {
                const action = editingItem ? 'updated' : 'created'
                const capitalizedTab = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                addNotification(`${capitalizedTab} ${action} successfully`, 'success')
                setShowCreateModal(false)
                setFormData({ name: '', description: '' })
                setEditingItem(null)
                fetchData(false)
            } else {
                const errorMessage = response?.message || `Failed to ${editingItem ? 'update' : 'create'} ${activeTab}`
                addNotification(errorMessage, 'error')
            }
        } catch (error) {
            console.error('API Error:', error)
            let errorMessage = `Failed to ${editingItem ? 'update' : 'create'} ${activeTab}`
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error?.data?.message) {
                errorMessage = error.data.message
            } else if (error?.message) {
                errorMessage = error.message
            }
            addNotification(errorMessage, 'error')
        } finally {
            setSubmitting(false)
        }
    }
    const handleToggleStatus = async (item) => {
        const newStatus = item.isActive ? false : true
        const operationKey = `toggle-${item._id}`
        try {
            setOperationLoading((prev) => ({ ...prev, [operationKey]: true }))
            let response
            if (activeTab === 'category') {
                response = await categoryAPI.updateCategory(item._id, { isActive: newStatus })
            } else {
                response = await industryAPI.updateIndustry(item._id, { isActive: newStatus })
            }
            const isSuccess = response?.success === true && response?.statusCode === 200
            if (isSuccess) {
                const capitalizedTab = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                addNotification(`${capitalizedTab} ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success')
                if (activeTab === 'category') {
                    setCategories((prev) => prev.map((cat) => (cat._id === item._id ? { ...cat, isActive: newStatus } : cat)))
                } else {
                    setIndustries((prev) => prev.map((industry) => (industry._id === item._id ? { ...industry, isActive: newStatus } : industry)))
                }
            } else {
                const errorMessage = response?.message || `Failed to update ${activeTab} status`
                addNotification(errorMessage, 'error')
            }
        } catch (error) {
            console.error('Toggle Status Error:', error)
            let errorMessage = `Failed to update ${activeTab} status`
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error?.data?.message) {
                errorMessage = error.data.message
            } else if (error?.message) {
                errorMessage = error.message
            }
            addNotification(errorMessage, 'error')
        } finally {
            setOperationLoading((prev) => {
                const newState = { ...prev }
                delete newState[operationKey]
                return newState
            })
        }
    }
    const handleDelete = (item) => {
        setItemToDelete(item)
        setShowDeleteModal(true)
    }
    const confirmDelete = async () => {
        if (!itemToDelete) return
        const operationKey = `delete-${itemToDelete._id}`
        try {
            setOperationLoading((prev) => ({ ...prev, [operationKey]: true }))
            let response
            if (activeTab === 'category') {
                response = await categoryAPI.deleteCategory(itemToDelete._id)
            } else {
                response = await industryAPI.deleteIndustry(itemToDelete._id)
            }
            const isSuccess = response?.success !== false && response?.statusCode !== 404
            if (isSuccess) {
                const capitalizedTab = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                addNotification(`${capitalizedTab} deleted successfully`, 'success')
                if (activeTab === 'category') {
                    setCategories((prev) => prev.filter((cat) => cat._id !== itemToDelete._id))
                } else {
                    setIndustries((prev) => prev.filter((industry) => industry._id !== itemToDelete._id))
                }
            } else {
                const errorMessage = response?.message || `Failed to delete ${activeTab}`
                addNotification(errorMessage, 'error')
            }
        } catch (error) {
            console.error('Delete Error:', error)
            let errorMessage = `Failed to delete ${activeTab}`
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error?.data?.message) {
                errorMessage = error.data.message
            } else if (error?.message) {
                errorMessage = error.message
            }
            addNotification(errorMessage, 'error')
        } finally {
            setOperationLoading((prev) => {
                const newState = { ...prev }
                delete newState[operationKey]
                return newState
            })
            setShowDeleteModal(false)
            setItemToDelete(null)
        }
    }
    const handleView = (item) => {
        addNotification(`Viewing ${item.name} details`, 'info')
    }
    const tabs = [
        { id: 'category', label: 'Category', icon: Grid3X3 },
        { id: 'industry', label: 'Industry', icon: Target }
    ]
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00FF89] mx-auto mb-4" />
                    <p className="text-gray-400">Loading data...</p>
                </div>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            <div className="fixed top-4 right-4 z-50 space-y-2">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <Notification
                            key={notification.id}
                            {...notification}
                            onClose={removeNotification}
                        />
                    ))}
                </AnimatePresence>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tools & Industry Management</h1>
                    <p className="text-gray-400">Manage categories and industries for your platform</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-[#00FF89] text-black hover:bg-[#00DD78] font-medium px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create {activeTab === 'category' ? 'Category' : 'Industry'}
                </Button>
            </div>
            <div className="border-b border-gray-700">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                    isActive ? 'border-[#00FF89] text-[#00FF89]' : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}>
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab === 'category' ? 'categories' : 'industries'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Show:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]"
                            >
                                <option value={6}>6</option>
                                <option value={12}>12</option>
                                <option value={24}>24</option>
                                <option value={48}>48</option>
                            </select>
                            <span>per page</span>
                        </div>
                    </div>
                </div>
                <div className="mb-6" data-pagination-content>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-400">
                        <div>
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} {activeTab === 'category' ? 'categories' : 'industries'}
                            {searchTerm && (
                                <span className="ml-1">
                                    matching "{searchTerm}"
                                </span>
                            )}
                        </div>
                        {totalPages > 1 && (
                            <div className="text-gray-500">
                                Page {currentPage} of {totalPages}
                            </div>
                        )}
                    </div>
                </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-white">{currentData.length}</p>
                            <p className="text-sm text-gray-400">Total</p>
                        </div>
                        <Grid3X3 className="w-8 h-8 text-gray-400" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-[#00FF89]">{currentData.filter((item) => item.isActive).length}</p>
                            <p className="text-sm text-gray-400">Active</p>
                        </div>
                        <ToggleRight className="w-8 h-8 text-[#00FF89]" />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-white">{currentData.filter((item) => !item.isActive).length}</p>
                            <p className="text-sm text-gray-400">Inactive</p>
                        </div>
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                    </div>
                </Card>
            </div>
            <Card className="p-6">
                {filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                            {activeTab === 'category' ? <Grid3X3 className="w-8 h-8 text-gray-500" /> : <Target className="w-8 h-8 text-gray-500" />}
                        </div>
                        <h4 className="text-lg font-medium text-white mb-2">No {activeTab === 'category' ? 'categories' : 'industries'} found</h4>
                        <p className="text-gray-400 mb-4">
                            {searchTerm ? `No ${activeTab === 'category' ? 'categories' : 'industries'} match your search.` : `Create your first ${activeTab} to get started.`}
                        </p>
                    </div>
                ) : (
                    <div data-pagination-content className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedData.map((item) => (
                            <div
                                key={item._id}
                                className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                                            {activeTab === 'category' ? (
                                                <Grid3X3 className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <Target className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white">{item.name}</h4>
                                            <Badge
                                                variant={item.isActive ? 'success' : 'secondary'}
                                                className="text-xs">
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                {item.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>}
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                    <span>{item.productCount || 0} products</span>
                                    {item.createdAt && <span>{new Date(item.createdAt).toLocaleDateString()}</span>}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(item)}
                                            className="p-2"
                                            disabled={operationLoading[`toggle-${item._id}`] || operationLoading[`delete-${item._id}`]}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(item)}
                                            className="p-2 text-red-400 hover:text-red-300"
                                            disabled={operationLoading[`toggle-${item._id}`] || operationLoading[`delete-${item._id}`]}>
                                            {operationLoading[`delete-${item._id}`] ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleStatus(item)}
                                        className="text-xs px-3 py-1"
                                        disabled={operationLoading[`toggle-${item._id}`] || operationLoading[`delete-${item._id}`]}>
                                        {operationLoading[`toggle-${item._id}`] ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                {item.isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                                                <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        {getPageNumbers().map((page) => (
                            <Button
                                key={page}
                                variant={page === currentPage ? 'solid' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(page)}>
                                {page}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Items per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            className="bg-gray-800 border border-gray-700 rounded-lg text-white text-sm p-1">
                            {[12, 24, 36, 48].map((count) => (
                                <option key={count} value={count}>
                                    {count}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white">
                                {editingItem ? 'Edit' : 'Create'} {activeTab === 'category' ? 'Category' : 'Industry'}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white p-1">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4">
                            <Input
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder={`Enter ${activeTab} name`}
                                className="bg-[#121212] border-gray-700 text-white"
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder={`Enter ${activeTab} description`}
                                    className="w-full px-3 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={submitting}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-[#00FF89] text-[#121212] hover:bg-[#00DD78] disabled:opacity-50"
                                    disabled={submitting || !formData.name.trim()}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {showDeleteModal && itemToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1f1f1f] border border-red-500/40 rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-red-100">Confirm Delete</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setItemToDelete(null)
                                }}
                                className="text-gray-400 hover:text-white p-1">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Delete "{itemToDelete.name}"?</p>
                                    <p className="text-gray-400 text-sm">{activeTab === 'category' ? 'Category' : 'Industry'}</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm">Are you sure you want to delete this {activeTab}? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setItemToDelete(null)
                                }}
                                variant="outline"
                                className="flex-1"
                                disabled={operationLoading[`delete-${itemToDelete._id}`]}>
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                disabled={operationLoading[`delete-${itemToDelete._id}`]}>
                                {operationLoading[`delete-${itemToDelete._id}`] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
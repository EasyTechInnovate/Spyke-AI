'use client'
import { useState, useEffect } from 'react'
import { promocodeAPI, productsAPI } from '@/lib/api'
import { categoryAPI } from '@/lib/api/toolsNiche'
import { X, Calendar, Tag, Target, Filter, Percent, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import Notification from '@/components/shared/Notification'
import { usePathname } from 'next/navigation'

export default function PromocodeForm({ promocode, onClose }) {
    // Local notification state instead of useNotifications hook
    const [notifications, setNotifications] = useState([])
    const isEditing = !!promocode
    const [loading, setLoading] = useState(false)
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [sellerProducts, setSellerProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        minPurchaseAmount: '',
        validFrom: '',
        validUntil: '',
        applicableProducts: [],
        applicableCategories: [],
        status: 'active'
    })
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [categorySearch, setCategorySearch] = useState('')
    const [showSelectedOnly, setShowSelectedOnly] = useState(false)
    const [currentCategoryPage, setCurrentCategoryPage] = useState(1)
    const CATEGORIES_PER_PAGE = 10

    const pathname = usePathname()

    // Local notification management
    const addNotification = (notification) => {
        const id = Date.now() + Math.random()
        const newNotification = { id, ...notification }
        setNotifications((prev) => [...prev, newNotification])

        // Auto remove after duration
        if (notification.duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, notification.duration)
        }

        return id
    }

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    }

    const showMessage = (message, type = 'info') => {
        addNotification({
            message,
            type,
            duration: 4000
        })
    }

    const getInputErrorStyles = (fieldName) => {
        const hasError = errors[fieldName] && touched[fieldName]
        return hasError
            ? 'border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-red-500/30'
            : 'border-gray-700 bg-[#1f1f1f] focus:border-[#00FF89] focus:ring-[#00FF89]/30'
    }

    const handleFieldBlur = (fieldName) => {
        setTouched((prev) => ({ ...prev, [fieldName]: true }))
    }

    useEffect(() => {
        if (promocode) {
            setFormData({
                code: promocode.code || '',
                description: promocode.description || '',
                discountType: promocode.discountType || 'percentage',
                discountValue: promocode.discountValue || '',
                maxUses: promocode.usageLimit || '',
                minPurchaseAmount: promocode.minimumOrderAmount || '',
                validFrom: promocode.validFrom ? new Date(promocode.validFrom).toISOString().slice(0, 16) : '',
                validUntil: promocode.validUntil ? new Date(promocode.validUntil).toISOString().slice(0, 16) : '',
                applicableProducts: Array.isArray(promocode.applicableProducts)
                    ? promocode.applicableProducts.map((p) => (typeof p === 'string' ? p : p._id))
                    : [],
                applicableCategories: promocode.applicableCategories || [],
                status: promocode.isActive ? 'active' : 'inactive'
            })
        }
        if (pathname && pathname.startsWith('/admin')) {
            fetchAdminProdocut()
        } else {
            fetchSellerProducts()
        }
        fetchCategories()
    }, [promocode, pathname])

    const fetchSellerProducts = async () => {
        try {
            setLoadingProducts(true)
            const response = await productsAPI.getMyProducts({ limit: 100 })
            const products = response?.data?.products || response?.products || []
            setSellerProducts(products)
        } catch (error) {
            console.error('Error fetching products:', error)
            showMessage('Failed to load your products', 'error')
        } finally {
            setLoadingProducts(false)
        }
    }

    const fetchAdminProdocut = async () => {
        try {
            setLoadingProducts(true)
            const response = await productsAPI.getAllProductsAdmin({ limit: 100 })
            const products = response?.data?.products || response?.products || []
            setSellerProducts(products)
        } catch (error) {
            console.error('Error fetching admin products:', error)
            showMessage('Failed to load products', 'error')
        } finally {
            setLoadingProducts(false)
        }
    }

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true)
            const response = await categoryAPI.getCategories()
            let categoriesData = response?.data?.categories || response?.categories || response?.data || []
            if (!Array.isArray(categoriesData)) {
                categoriesData = []
            }
            const formattedCategories = categoriesData
                .map((cat) => ({
                    id: cat._id || cat.id,
                    name: cat.name || cat.title,
                    value: cat.value || cat._id || cat.id,
                    isActive: cat.isActive !== false
                }))
                .filter((cat) => cat.isActive)
            setCategories(formattedCategories)
        } catch (error) {
            console.error('Error fetching categories:', error)
            showMessage('Failed to load categories', 'error')
        } finally {
            setLoadingCategories(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setTouched((prev) => ({ ...prev, [name]: true }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }
    const handleProductToggle = (productId) => {
        setFormData((prev) => ({
            ...prev,
            applicableProducts: prev.applicableProducts.includes(productId)
                ? prev.applicableProducts.filter((id) => id !== productId)
                : [...prev.applicableProducts, productId]
        }))
    }
    const handleCategoryToggle = (categoryValue) => {
        setFormData((prev) => ({
            ...prev,
            applicableCategories: prev.applicableCategories.includes(categoryValue)
                ? prev.applicableCategories.filter((cat) => cat !== categoryValue)
                : [...prev.applicableCategories, categoryValue]
        }))
    }
    const selectAllProducts = () => {
        setFormData((prev) => ({
            ...prev,
            applicableProducts: sellerProducts.map((p) => p._id)
        }))
    }
    const clearAllProducts = () => {
        setFormData((prev) => ({
            ...prev,
            applicableProducts: []
        }))
    }
    const validateForm = () => {
        const newErrors = {}
        if (!formData.code.trim()) {
            newErrors.code = 'Promocode is required'
        } else if (!/^[A-Z0-9_-]+$/i.test(formData.code.trim())) {
            newErrors.code = 'Code can only contain letters, numbers, hyphens and underscores'
        }
        if (!formData.discountValue || formData.discountValue <= 0) {
            newErrors.discountValue = 'Discount value is required and must be greater than 0'
        } else if (formData.discountType === 'percentage' && formData.discountValue > 100) {
            newErrors.discountValue = 'Percentage discount cannot exceed 100%'
        }
        if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters'
        }
        if (formData.minPurchaseAmount && formData.minPurchaseAmount < 0) {
            newErrors.minPurchaseAmount = 'Minimum purchase amount cannot be negative'
        }
        if (formData.validFrom) {
            const fromDate = new Date(formData.validFrom)
            if (isNaN(fromDate.getTime())) {
                newErrors.validFrom = 'Invalid date format'
            }
        }
        if (formData.validUntil) {
            const untilDate = new Date(formData.validUntil)
            if (isNaN(untilDate.getTime())) {
                newErrors.validUntil = 'Invalid date format'
            } else if (formData.validFrom) {
                const fromDate = new Date(formData.validFrom)
                if (!isNaN(fromDate.getTime()) && fromDate >= untilDate) {
                    newErrors.validUntil = 'End date must be after start date'
                }
            }
        }
        setErrors(newErrors)
        const allFieldsTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true
            return acc
        }, {})
        setTouched(allFieldsTouched)
        return Object.keys(newErrors).length === 0
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) {
            return
        }
        setLoading(true)
        try {
            const payload = {
                code: formData.code.toUpperCase().trim(),
                description: formData.description,
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
                minimumOrderAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : undefined,
                applicableProducts: formData.applicableProducts.length > 0 ? formData.applicableProducts : undefined,
                applicableCategories: formData.applicableCategories.length > 0 ? formData.applicableCategories : undefined,
                usageLimit: formData.maxUses ? parseInt(formData.maxUses) : undefined,
                validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined,
                validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : new Date().toISOString(),
                isActive: formData.status === 'active'
            }

            let response
            if (isEditing) {
                response = await promocodeAPI.updatePromocode(promocode._id, payload)
            } else {
                response = await promocodeAPI.createPromocode(payload)
            }

            if (response && response._id && response.code) {
                const successMessage = isEditing ? 'Promocode updated successfully!' : 'Promocode created successfully!'
                showMessage(successMessage, 'success')
                setTimeout(() => {
                    onClose(true)
                }, 1200)
            } else {
                throw new Error('Invalid response from server')
            }
        } catch (error) {
            console.error('Error saving promocode:', error)

            // Show error notification
            const errorMessage =
                error.response?.data?.message || error.message || (isEditing ? 'Failed to update promocode' : 'Failed to create promocode')
            showMessage(errorMessage, 'error')
        } finally {
            setLoading(false)
        }
    }
    const filteredCategories = categories.filter((category) => {
        const matchesSearch = category.name.toLowerCase().includes(categorySearch.toLowerCase())
        const isSelected = formData.applicableCategories.includes(category.value)
        return matchesSearch && (!showSelectedOnly || isSelected)
    })
    useEffect(() => {
        setCurrentCategoryPage(1)
    }, [categorySearch, showSelectedOnly])
    const totalCategoryPages = Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE)
    const paginatedCategories = filteredCategories.slice((currentCategoryPage - 1) * CATEGORIES_PER_PAGE, currentCategoryPage * CATEGORIES_PER_PAGE)
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        {...notification}
                        onClose={removeNotification}
                    />
                ))}
            </div>
            <div className="w-full max-w-5xl max-h-[95vh] bg-[#121212] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-[#1f1f1f] border-b border-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#00FF89]/10 rounded-xl border border-[#00FF89]/20">
                                <Tag className="w-6 h-6 text-[#00FF89]" />
                            </div>
                            <div>
                                <h2
                                    className="text-2xl font-bold text-white"
                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                    {isEditing ? 'Edit Promocode' : 'Create New Promocode'}
                                </h2>
                                <p className="text-gray-400">
                                    {isEditing ? 'Update your promotional code settings' : 'Create a discount code to boost your sales'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onClose(false)}
                            disabled={loading}
                            className="p-2 bg-gray-800 hover:bg-red-500/20 rounded-xl transition-all text-gray-400 hover:text-red-400 disabled:opacity-50">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-8rem)]">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8">
                        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#00FF89]/10 rounded-lg">
                                    <Tag className="w-5 h-5 text-[#00FF89]" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">Basic Information</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        Promocode <span className="text-red-400">*</span>
                                        {formData.code && !errors.code && touched.code && <CheckCircle className="w-4 h-4 text-[#00FF89]" />}
                                    </label>
                                    <input
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        onBlur={() => handleFieldBlur('code')}
                                        placeholder="e.g., SUMMER25, BLACKFRIDAY"
                                        disabled={loading}
                                        className={`w-full px-4 py-3 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-lg ${getInputErrorStyles('code')}`}
                                        required
                                    />
                                    {errors.code && touched.code && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{errors.code}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${getInputErrorStyles('status')}`}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                <label className="text-sm font-medium text-gray-300">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    onBlur={() => handleFieldBlur('description')}
                                    placeholder="Describe this promocode for your customers..."
                                    rows={3}
                                    className={`w-full px-4 py-3 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-none ${getInputErrorStyles('description')}`}
                                />
                                {errors.description && touched.description && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.description}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#FFC050]/10 rounded-lg">
                                    {formData.discountType === 'percentage' ? (
                                        <Percent className="w-5 h-5 text-[#FFC050]" />
                                    ) : (
                                        <DollarSign className="w-5 h-5 text-[#FFC050]" />
                                    )}
                                </div>
                                <h3 className="text-xl font-semibold text-white">Discount Settings</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        Discount Type <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${getInputErrorStyles('discountType')}`}
                                        required>
                                        <option value="percentage">Percentage Discount</option>
                                        <option value="fixed">Fixed Amount Off</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        Discount Value {formData.discountType === 'percentage' ? '(%)' : '($)'}{' '}
                                        <span className="text-red-400">*</span>
                                        {formData.discountValue && !errors.discountValue && touched.discountValue && (
                                            <CheckCircle className="w-4 h-4 text-[#00FF89]" />
                                        )}
                                    </label>
                                    <input
                                        name="discountValue"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={formData.discountType === 'percentage' ? '100' : undefined}
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        onBlur={() => handleFieldBlur('discountValue')}
                                        placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                                        className={`w-full px-4 py-3 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-inner-spin-button]:appearance-none [&::-moz-outer-spin-button]:appearance-none ${getInputErrorStyles('discountValue')}`}
                                        style={{ MozAppearance: 'textfield' }}
                                        required
                                    />
                                    {errors.discountValue && touched.discountValue && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{errors.discountValue}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Maximum Uses</label>
                                    <input
                                        name="maxUses"
                                        type="number"
                                        min="1"
                                        value={formData.maxUses}
                                        onChange={handleInputChange}
                                        onBlur={() => handleFieldBlur('maxUses')}
                                        placeholder="Leave empty for unlimited"
                                        className={`w-full px-4 py-3 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-inner-spin-button]:appearance-none [&::-moz-outer-spin-button]:appearance-none ${getInputErrorStyles('maxUses')}`}
                                        style={{ MozAppearance: 'textfield' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Minimum Purchase Amount ($)</label>
                                    <input
                                        name="minPurchaseAmount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.minPurchaseAmount}
                                        onChange={handleInputChange}
                                        onBlur={() => handleFieldBlur('minPurchaseAmount')}
                                        placeholder="0.00"
                                        className={`w-full px-4 py-3 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-inner-spin-button]:appearance-none [&::-moz-outer-spin-button]:appearance-none ${getInputErrorStyles('minPurchaseAmount')}`}
                                        style={{ MozAppearance: 'textfield' }}
                                    />
                                    {errors.minPurchaseAmount && touched.minPurchaseAmount && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{errors.minPurchaseAmount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-600/20 rounded-lg">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">Validity Period</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Valid From</label>
                                    <input
                                        name="validFrom"
                                        type="datetime-local"
                                        value={formData.validFrom}
                                        onChange={handleInputChange}
                                        onBlur={() => handleFieldBlur('validFrom')}
                                        className={`w-full px-4 py-3 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${getInputErrorStyles('validFrom')}`}
                                    />
                                    {errors.validFrom && touched.validFrom && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{errors.validFrom}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Valid Until</label>
                                    <input
                                        name="validUntil"
                                        type="datetime-local"
                                        value={formData.validUntil}
                                        onChange={handleInputChange}
                                        onBlur={() => handleFieldBlur('validUntil')}
                                        className={`w-full px-4 py-3 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all ${getInputErrorStyles('validUntil')}`}
                                    />
                                    {errors.validUntil && touched.validUntil && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{errors.validUntil}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-600/20 rounded-lg">
                                    <Target className="w-5 h-5 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">Applicable Products</h3>
                                <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                                    {formData.applicableProducts.length} selected
                                </span>
                            </div>
                            <div className="flex gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={selectAllProducts}
                                    className="px-4 py-2 bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/20 transition-all text-sm font-medium">
                                    Select All ({sellerProducts.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAllProducts}
                                    className="px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-600 transition-all text-sm font-medium">
                                    Clear All
                                </button>
                            </div>
                            <div className="bg-[#121212] border border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto">
                                {loadingProducts ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        Loading products...
                                    </div>
                                ) : sellerProducts.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No products found</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {sellerProducts.map((product) => (
                                            <label
                                                key={product._id}
                                                className="flex items-center gap-3 p-3 bg-[#1f1f1f] hover:bg-gray-800 rounded-lg cursor-pointer transition-all border border-gray-700 hover:border-gray-600">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.applicableProducts.includes(product._id)}
                                                    onChange={() => handleProductToggle(product._id)}
                                                    className="w-4 h-4 text-[#00FF89] bg-[#121212] border-gray-600 rounded focus:ring-[#00FF89] focus:ring-offset-0"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-white">{product.title}</p>
                                                    <p className="text-sm text-gray-400">${product.price || product.basePrice || '0.00'}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Leave empty to apply to all your products</p>
                        </div>
                        <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-600/20 rounded-lg">
                                    <Filter className="w-5 h-5 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white">Applicable Categories</h3>
                                <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                                    {formData.applicableCategories.length} selected
                                </span>
                            </div>
                            <div className="space-y-4 mb-4">
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            className="w-full px-4 py-2 pl-10 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/30 focus:border-[#00FF89]"
                                        />
                                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const allVisibleCategories = filteredCategories.map((cat) => cat.value)
                                            setFormData((prev) => ({
                                                ...prev,
                                                applicableCategories: [...new Set([...prev.applicableCategories, ...allVisibleCategories])]
                                            }))
                                        }}
                                        className="px-4 py-2 bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/30 rounded-lg hover:bg-[#00FF89]/20 transition-all text-sm font-medium whitespace-nowrap">
                                        Select Visible
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, applicableCategories: [] }))}
                                        className="px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-600 transition-all text-sm font-medium">
                                        Clear All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                            showSelectedOnly
                                                ? 'bg-[#00FF89]/20 border-[#00FF89]/40 text-[#00FF89]'
                                                : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                                        }`}>
                                        {showSelectedOnly ? 'Show All' : 'Show Selected Only'}
                                    </button>
                                    <span className="text-xs text-gray-500 py-1">
                                        {filteredCategories.length} of {categories.length} categories
                                    </span>
                                </div>
                            </div>
                            <div className="bg-[#121212] border border-gray-700 rounded-xl overflow-hidden">
                                {loadingCategories ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        Loading categories...
                                    </div>
                                ) : filteredCategories.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        {categorySearch ? `No categories found for "${categorySearch}"` : 'No categories found'}
                                    </div>
                                ) : (
                                    <>
                                        <div className="max-h-64 overflow-y-auto">
                                            <div className="p-4 space-y-2">
                                                {paginatedCategories.map((category) => {
                                                    const isSelected = formData.applicableCategories.includes(category.value)
                                                    return (
                                                        <label
                                                            key={category.id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                                                isSelected
                                                                    ? 'bg-[#00FF89]/10 border-[#00FF89]/30 hover:bg-[#00FF89]/15'
                                                                    : 'bg-[#1f1f1f] border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                                                            }`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleCategoryToggle(category.value)}
                                                                className="w-4 h-4 text-[#00FF89] bg-[#121212] border-gray-600 rounded focus:ring-[#00FF89] focus:ring-offset-0"
                                                            />
                                                            <span
                                                                className={`text-sm flex-1 ${isSelected ? 'text-[#00FF89] font-medium' : 'text-gray-300'}`}>
                                                                {category.name}
                                                            </span>
                                                            {isSelected && <CheckCircle className="w-4 h-4 text-[#00FF89]" />}
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        {filteredCategories.length > CATEGORIES_PER_PAGE && (
                                            <div className="border-t border-gray-700 p-4 bg-[#1a1a1a]">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-400">
                                                        Showing {(currentCategoryPage - 1) * CATEGORIES_PER_PAGE + 1} to{' '}
                                                        {Math.min(currentCategoryPage * CATEGORIES_PER_PAGE, filteredCategories.length)} of{' '}
                                                        {filteredCategories.length} categories
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentCategoryPage((prev) => Math.max(1, prev - 1))}
                                                            disabled={currentCategoryPage === 1}
                                                            className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded border border-gray-600 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                                            Previous
                                                        </button>
                                                        <span className="px-3 py-1 text-sm text-gray-400">
                                                            {currentCategoryPage} of {totalCategoryPages}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentCategoryPage((prev) => Math.min(totalCategoryPages, prev + 1))}
                                                            disabled={currentCategoryPage === totalCategoryPages}
                                                            className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded border border-gray-600 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Leave empty to apply to all categories</p>
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-gray-800">
                            <button
                                type="button"
                                onClick={() => onClose(false)}
                                disabled={loading}
                                className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white hover:bg-gray-700 transition-all disabled:opacity-50 font-medium text-lg">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-2 px-8 py-4 bg-[#00FF89] text-[#121212] rounded-xl font-bold text-lg hover:bg-[#00e67a] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>{isEditing ? 'Update Promocode' : 'Create Promocode'}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}


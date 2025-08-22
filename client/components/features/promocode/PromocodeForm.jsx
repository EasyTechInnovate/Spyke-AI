'use client'

import { useState, useEffect } from 'react'
import { promocodeAPI, productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { Button } from '@/components/shared/ui/button'
import Input from '@/components/shared/ui/input'
import Card from '@/components/shared/ui/card'
import { X } from 'lucide-react'
import FormInput from '@/components/shared/forms/FormInput'
import FormSelect from '@/components/shared/forms/FormSelect'
import FormTextArea from '@/components/shared/forms/FormTextArea'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function PromocodeForm({ promocode, onClose }) {
    // Inline notification state
    const [notification, setNotification] = useState(null)

    // Show inline notification messages  
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000)
    }

    // Clear notification
    const clearNotification = () => setNotification(null)

    const isEditing = !!promocode
    const [loading, setLoading] = useState(false)
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [sellerProducts, setSellerProducts] = useState([])
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
    
    // Product categories from backend
    const categories = [
        { value: 'lead_generation', label: 'Lead Generation' },
        { value: 'hiring', label: 'Hiring' },
        { value: 'follow_ups', label: 'Follow-ups' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'content_creation', label: 'Content Creation' },
        { value: 'customer_service', label: 'Customer Service' },
        { value: 'sales', label: 'Sales' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'productivity', label: 'Productivity' },
        { value: 'analysis', label: 'Analysis' }
    ]

    useEffect(() => {
        if (promocode) {
            setFormData({
                code: promocode.code || '',
                description: promocode.description || '',
                discountType: promocode.discountType || 'percentage',
                discountValue: promocode.discountValue || '',
                maxUses: promocode.usageLimit || '',
                minPurchaseAmount: promocode.minimumOrderAmount || '',
                // Format datetime for datetime-local input
                validFrom: promocode.validFrom ? new Date(promocode.validFrom).toISOString().slice(0, 16) : '',
                validUntil: promocode.validUntil ? new Date(promocode.validUntil).toISOString().slice(0, 16) : '',
                applicableProducts: promocode.applicableProducts || [],
                applicableCategories: promocode.applicableCategories || [],
                status: promocode.isActive ? 'active' : 'inactive'
            })
        }
        
        // Fetch seller's products
        fetchSellerProducts()
    }, [promocode])
    
    const fetchSellerProducts = async () => {
        try {
            setLoadingProducts(true)
            const response = await productsAPI.getMyProducts({ limit: 100 })
            
            // Handle the response structure - the API returns data.products
            const products = response?.data?.products || response?.products || []
            setSellerProducts(products)
        } catch (error) {
            console.error('Error fetching products:', error)
            showMessage('Failed to load your products', 'error')
        } finally {
            setLoadingProducts(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }
    
    const handleProductToggle = (productId) => {
        setFormData(prev => ({
            ...prev,
            applicableProducts: prev.applicableProducts.includes(productId)
                ? prev.applicableProducts.filter(id => id !== productId)
                : [...prev.applicableProducts, productId]
        }))
    }
    
    const handleCategoryToggle = (categoryValue) => {
        setFormData(prev => ({
            ...prev,
            applicableCategories: prev.applicableCategories.includes(categoryValue)
                ? prev.applicableCategories.filter(cat => cat !== categoryValue)
                : [...prev.applicableCategories, categoryValue]
        }))
    }
    
    const selectAllProducts = () => {
        setFormData(prev => ({
            ...prev,
            applicableProducts: sellerProducts.map(p => p._id)
        }))
    }
    
    const clearAllProducts = () => {
        setFormData(prev => ({
            ...prev,
            applicableProducts: []
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        // Code validation
        if (!formData.code.trim()) {
            newErrors.code = 'Promocode is required'
        } else if (!/^[A-Z0-9_-]+$/i.test(formData.code.trim())) {
            newErrors.code = 'Code can only contain letters, numbers, hyphens and underscores'
        }

        // Description validation - must be at least 10 characters
        if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters'
        }

        // Discount value validation
        if (!formData.discountValue || formData.discountValue <= 0) {
            newErrors.discountValue = 'Discount value must be greater than 0'
        }

        if (formData.discountType === 'percentage' && formData.discountValue > 100) {
            newErrors.discountValue = 'Percentage discount cannot exceed 100%'
        }

        // Date validation
        if (formData.validFrom) {
            const fromDate = new Date(formData.validFrom)
            if (isNaN(fromDate.getTime())) {
                newErrors.validFrom = 'Invalid datetime'
            }
        }

        if (formData.validUntil) {
            const untilDate = new Date(formData.validUntil)
            if (isNaN(untilDate.getTime())) {
                newErrors.validUntil = 'Valid until must be a valid date'
            } else if (formData.validFrom) {
                const fromDate = new Date(formData.validFrom)
                if (!isNaN(fromDate.getTime()) && fromDate >= untilDate) {
                    newErrors.validUntil = 'End date must be after start date'
                }
            }
        }

        // Minimum purchase amount validation
        if (formData.minPurchaseAmount && formData.minPurchaseAmount < 0) {
            newErrors.minPurchaseAmount = 'Minimum purchase amount cannot be negative'
        }

        setErrors(newErrors)
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
                // Convert datetime-local to ISO format for backend
                validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined,
                validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : new Date().toISOString(),
                isActive: formData.status === 'active'
            }

            if (isEditing) {
                await promocodeAPI.updatePromocode(promocode._id, payload)
                showMessage('Promocode updated successfully', 'success')
            } else {
                await promocodeAPI.createPromocode(payload)
                showMessage('Promocode created successfully', 'success')
            }

            onClose(true) // true indicates data should be refreshed
        } catch (error) {
            if (error.response?.data?.message) {
                showMessage(error.response.data.message, 'error')
            } else {
                showMessage(isEditing ? 'Failed to update promocode' : 'Failed to create promocode', 'error')
            }
            console.error('Error saving promocode:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            
            <div className="w-full max-w-3xl max-h-[90vh] bg-[#1f1f1f] border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-2rem)]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {isEditing ? 'Edit Promocode' : 'Create New Promocode'}
                        </h2>
                        <button
                            onClick={() => onClose(false)}
                            disabled={loading}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Promocode"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                error={errors.code}
                                placeholder="SUMMER2024"
                                disabled={isEditing}
                                required
                            />

                            <FormSelect
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' }
                                ]}
                            />
                        </div>

                        <FormTextArea
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            error={errors.description}
                            placeholder="Summer sale discount for all products"
                            rows={2}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelect
                                label="Discount Type"
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleInputChange}
                                options={[
                                    { value: 'percentage', label: 'Percentage' },
                                    { value: 'fixed', label: 'Fixed Amount' }
                                ]}
                                required
                            />

                            <FormInput
                                label={`Discount Value ${formData.discountType === 'percentage' ? '(%)' : '($)'}`}
                                name="discountValue"
                                type="number"
                                step="0.01"
                                value={formData.discountValue}
                                onChange={handleInputChange}
                                error={errors.discountValue}
                                placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Maximum Uses"
                                name="maxUses"
                                type="number"
                                value={formData.maxUses}
                                onChange={handleInputChange}
                                placeholder="Leave empty for unlimited"
                            />

                            <FormInput
                                label="Minimum Purchase Amount ($)"
                                name="minPurchaseAmount"
                                type="number"
                                step="0.01"
                                value={formData.minPurchaseAmount}
                                onChange={handleInputChange}
                                error={errors.minPurchaseAmount}
                                placeholder="50.00"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Valid From"
                                name="validFrom"
                                type="datetime-local"
                                value={formData.validFrom}
                                onChange={handleInputChange}
                                error={errors.validFrom}
                                placeholder="Start date and time"
                            />

                            <FormInput
                                label="Valid Until"
                                name="validUntil"
                                type="datetime-local"
                                value={formData.validUntil}
                                onChange={handleInputChange}
                                error={errors.validUntil}
                                placeholder="End date and time"
                            />
                        </div>

                        {/* Applicable Products Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-300">
                                    Applicable Products
                                    <span className="text-gray-500 text-xs ml-2">
                                        ({formData.applicableProducts.length} selected)
                                    </span>
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAllProducts}
                                        className="text-xs text-[#00FF89] hover:text-[#00DD78]"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearAllProducts}
                                        className="text-xs text-red-400 hover:text-red-300"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                            <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                                {loadingProducts ? (
                                    <p className="text-center text-gray-500 py-4">Loading products...</p>
                                ) : sellerProducts.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No products found</p>
                                ) : (
                                    <div className="space-y-1">
                                        {sellerProducts.map((product) => (
                                            <label
                                                key={product._id}
                                                className="flex items-center gap-3 p-2 hover:bg-[#1f1f1f] rounded cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.applicableProducts.includes(product._id)}
                                                    onChange={() => handleProductToggle(product._id)}
                                                    className="w-4 h-4 text-[#00FF89] bg-[#2a2a2a] border-gray-600 rounded focus:ring-[#00FF89] focus:ring-offset-0"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm text-white">{product.title}</p>
                                                    <p className="text-xs text-gray-400">
                                                        ${product.price || product.basePrice || '0.00'}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-400">
                                Leave empty to apply to all products
                            </p>
                        </div>

                        {/* Applicable Categories Section */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">
                                Applicable Categories
                                <span className="text-gray-500 text-xs ml-2">
                                    ({formData.applicableCategories.length} selected)
                                </span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {categories.map((category) => (
                                    <label
                                        key={category.value}
                                        className="flex items-center gap-2 p-2 bg-[#2a2a2a] border border-gray-700 rounded-lg hover:border-[#00FF89]/50 cursor-pointer transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.applicableCategories.includes(category.value)}
                                            onChange={() => handleCategoryToggle(category.value)}
                                            className="w-4 h-4 text-[#00FF89] bg-[#2a2a2a] border-gray-600 rounded focus:ring-[#00FF89] focus:ring-offset-0"
                                        />
                                        <span className="text-sm text-gray-300">{category.label}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400">
                                Leave empty to apply to all categories
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={() => onClose(false)}
                                disabled={loading}
                                className="px-6 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#3a3a3a] transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-[#00FF89] text-[#121212] rounded-lg font-semibold hover:bg-[#00DD78] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (isEditing ? 'Update Promocode' : 'Create Promocode')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
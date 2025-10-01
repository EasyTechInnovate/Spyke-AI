'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X, Plus, Loader2, RefreshCcw, Trash2, ImageIcon, Wrench } from 'lucide-react'
import { productsAPI } from '@/lib/api'
import { toolAPI, categoryAPI, industryAPI } from '@/lib/api/toolsNiche'
import Notification from '@/components/shared/Notification'
import ImageUpload from '@/components/shared/forms/ImageUpload'
import { PRODUCT_TYPES, SETUP_TIMES } from '@/components/features/products/form/constants'
const ToolButton = ({ tool, selected, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all text-center ${
            selected ? 'bg-brand-primary/10 border-brand-primary text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
        }`}>
        <Wrench className="w-5 h-5" />
        <span className="text-xs font-medium leading-tight">{tool.name}</span>
    </button>
)
export default function EditProductPage() {
    const { productId } = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [notification, setNotification] = useState(null)
    const [originalData, setOriginalData] = useState(null)
    const [formData, setFormData] = useState(null)
    const [tools, setTools] = useState([])
    const [categories, setCategories] = useState([])
    const [industries, setIndustries] = useState([])
    const [toolsLoading, setToolsLoading] = useState(true)
    const showMessage = (message, type = 'info') => {
        if (notification && notification.message === message && notification.type === type) {
            return
        }
        const id = Date.now().toString()
        setNotification({ id, message, type })
        if (type === 'success' && message.includes('updated successfully')) {
            setTimeout(() => {
                if (document.querySelector('[data-product-edit]')) {
                    router.push('/seller/products')
                }
            }, 2000)
        }
    }
    const clearNotification = () => setNotification(null)
    const retryApiCall = async (apiCall, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await apiCall()
            } catch (error) {
                if (i === retries - 1) throw error
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
            }
        }
    }
    const isDirty = useMemo(() => {
        if (!originalData || !formData) return false
        const compareData = (original, current) => {
            const { price: origPrice, ...origRest } = original
            const { price: currPrice, ...currRest } = current
            return JSON.stringify(origRest) !== JSON.stringify(currRest)
        }
        return compareData(originalData, formData)
    }, [originalData, formData])
    const preparePayload = (data) => {
        const payload = {
            title: data.title,
            type: data.type,
            category: data.category,
            industry: data.industry,
            shortDescription: data.shortDescription,
            fullDescription: data.fullDescription,
            targetAudience: data.targetAudience,
            benefits: data.benefits.filter(Boolean),
            useCaseExamples: data.useCaseExamples.filter(Boolean),
            howItWorks: data.howItWorks.filter(Boolean),
            outcome: data.outcome.filter(Boolean),
            toolsUsed: data.toolsUsed.map((t) => ({
                name: t.name,
                logo: t.logo || '',
                model: t.model || '',
                link: t.link || ''
            })),
            setupTime: data.setupTime,
            deliveryMethod: data.deliveryMethod,
            embedLink: data.embedLink || '',
            thumbnail: data.thumbnail,
            images: data.images.filter(Boolean),
            previewVideo: data.previewVideo?.trim() ? data.previewVideo.trim() : null,
            tags: data.tags.filter(Boolean),
            searchKeywords: data.searchKeywords?.filter(Boolean) || [],
            estimatedHoursSaved: data.estimatedHoursSaved || '',
            metricsImpacted: data.metricsImpacted || '',
            frequencyOfUse: data.frequencyOfUse || 'ongoing',
            hasAffiliateTools: !!data.hasAffiliateTools,
            expectedSupport: data.expectedSupport || '',
            faqs: (data.faqs || []).filter((f) => f.question && f.answer)
        }
        return payload
    }
    const mapApiToForm = (p) => ({
        title: p.title || '',
        type: p.type || '',
        category: typeof p.category === 'object' ? p.category?.name || '' : p.category || '',
        industry: typeof p.industry === 'object' ? p.industry?.name || '' : p.industry || '',
        shortDescription: p.shortDescription || '',
        fullDescription: p.fullDescription || p.description || '',
        targetAudience: p.targetAudience || '',
        benefits: p.benefits?.length ? p.benefits : [''],
        useCaseExamples: p.useCaseExamples?.length ? p.useCaseExamples : [''],
        howItWorks: p.howItWorks?.length ? p.howItWorks : [''],
        outcome: p.outcome?.length ? p.outcome : [''],
        toolsUsed: p.toolsUsed?.length ? p.toolsUsed : [],
        setupTime: p.setupTime || '',
        deliveryMethod: p.deliveryMethod || 'link',
        embedLink: p.embedLink || '',
        price: p.price?.toString() || '',
        originalPrice: p.originalPrice ? p.originalPrice.toString() : '',
        thumbnail: p.thumbnail || '',
        images: p.images?.length ? p.images : [],
        previewVideo: p.previewVideo || '',
        tags: p.tags || [],
        searchKeywords: p.searchKeywords || [],
        estimatedHoursSaved: p.estimatedHoursSaved || '',
        metricsImpacted: p.metricsImpacted || '',
        frequencyOfUse: p.frequencyOfUse || 'ongoing',
        hasAffiliateTools: !!p.hasAffiliateTools,
        expectedSupport: p.expectedSupport || '',
        faqs: p.faqs?.length ? p.faqs : [{ question: '', answer: '' }],
        status: p.status || 'draft'
    })
    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true)
            const res = await retryApiCall(() => productsAPI.getProductBySlug(productId))

            // Handle the new API response format
            if (res.data && !res.data.success && res.data.statusCode) {
                // Product exists but cannot be edited
                const errorData = res.data.data || {}
                showMessage(res.data.message || 'Cannot edit this product', 'error')
                setTimeout(() => {
                    const shouldRedirect = confirm(`${errorData.reason || res.data.message}\n\nWould you like to go back to your products list?`)
                    if (shouldRedirect) {
                        router.push('/seller/products')
                    }
                }, 1500)
                return
            }

            if (!res.data) throw new Error('Product not found')

            const populated = mapApiToForm(res.data)

            if (!populated.title || !populated.type) {
                throw new Error('Product data is corrupted')
            }

            setOriginalData(populated)
            setFormData(populated)
        } catch (e) {
            console.error(e)

            if (e.response?.status === 404) {
                showMessage('Product not found', 'error')
                setTimeout(() => {
                    if (confirm('Product not found. Would you like to go back to products list?')) {
                        router.push('/seller/products')
                    }
                }, 2000)
            } else if (e.response?.status === 403) {
                showMessage('You do not have permission to edit this product', 'error')
                setTimeout(() => {
                    router.push('/seller/products')
                }, 2000)
            } else {
                showMessage(e.message || 'Failed to load product', 'error')
                setTimeout(() => {
                    if (confirm('Failed to load product. Would you like to go back to products list?')) {
                        router.push('/seller/products')
                    }
                }, 2000)
            }
        } finally {
            setLoading(false)
        }
    }, [productId, router])
    const fetchTools = useCallback(async () => {
        try {
            const response = await toolAPI.getTools({ isActive: 'true' })
            const toolsData = response?.data?.tools || response?.tools || response?.data || []
            const formattedTools = Array.isArray(toolsData)
                ? toolsData.map((tool) => ({
                      _id: tool._id,
                      name: tool.name,
                      description: tool.description,
                      icon: tool.icon || 'Wrench'
                  }))
                : []
            setTools(formattedTools)
        } catch (error) {
            console.error('Error fetching tools:', error)
            showMessage('Failed to load tools', 'error')
            setTools([])
        }
    }, [])
    const fetchCategories = useCallback(async () => {
        try {
            const response = await categoryAPI.getCategories({ isActive: 'true' })
            const categoriesData = response?.data?.categories || response?.categories || response?.data || []
            const formattedCategories = Array.isArray(categoriesData)
                ? categoriesData.map((category) => ({
                      _id: category._id,
                      name: category.name,
                      description: category.description,
                      icon: category.icon
                  }))
                : []
            setCategories(formattedCategories)
        } catch (error) {
            console.error('Error fetching categories:', error)
            showMessage('Failed to load categories', 'error')
            setCategories([])
        }
    }, [])
    const fetchIndustries = useCallback(async () => {
        try {
            const response = await industryAPI.getIndustries({ isActive: 'true' })
            const industriesData = response?.data?.industries || response?.industries || response?.data || []
            const formattedIndustries = Array.isArray(industriesData)
                ? industriesData.map((industry) => ({
                      _id: industry._id,
                      name: industry.name,
                      description: industry.description,
                      icon: industry.icon
                  }))
                : []
            setIndustries(formattedIndustries)
        } catch (error) {
            console.error('Error fetching industries:', error)
            showMessage('Failed to load industries', 'error')
            setIndustries([])
        }
    }, [])
    const fetchAllData = useCallback(async () => {
        try {
            setToolsLoading(true)
            await Promise.all([fetchProduct(), fetchTools(), fetchCategories(), fetchIndustries()])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setToolsLoading(false)
        }
    }, [fetchProduct, fetchTools, fetchCategories, fetchIndustries])
    useEffect(() => {
        if (productId) {
            fetchAllData()
        }
    }, [productId, fetchAllData])
    useEffect(() => {
        const handler = (e) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])
    useEffect(() => {
        if (!isDirty || !formData || saving) return
        const autoSaveTimer = setTimeout(() => {
            const lastInteraction = Date.now() - 30000
            if (document.querySelector(':focus')) return
            handleSave().catch(console.error)
        }, 30000)
        return () => clearTimeout(autoSaveTimer)
    }, [isDirty, formData, saving])
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && isDirty) {
                navigator.sendBeacon(
                    '/api/products/auto-save',
                    JSON.stringify({
                        productId,
                        data: formData
                    })
                )
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [isDirty, formData, productId])
    if (loading || !formData || toolsLoading) {
        return (
            <div
                className="min-h-screen bg-black flex items-center justify-center"
                data-loading="true">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>{loading ? 'Loading product...' : toolsLoading ? 'Loading tools...' : 'Initializing...'}</p>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => router.push('/seller/products')}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-800 text-gray-200 rounded hover:bg-gray-700 transition-colors">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    const handleInputChange = (field, value) => {
        const safeValue = value ?? ''
        if (field === 'title' && typeof safeValue === 'string' && safeValue.length > 100) {
            showMessage('Title cannot exceed 100 characters', 'warning')
            return
        }
        if (field === 'shortDescription' && typeof safeValue === 'string' && safeValue.length > 200) {
            showMessage('Short description cannot exceed 200 characters', 'warning')
            return
        }
        setFormData((prev) => ({ ...prev, [field]: safeValue }))
    }
    const handleArrayFieldChange = (field, index, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item))
        }))
    }
    const addArrayFieldItem = (field, defaultValue = '') => {
        setFormData((prev) => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }))
    }
    const removeArrayFieldItem = (field, index) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }))
    }
    const handleFaqChange = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            faqs: prev.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
        }))
    }
    const toggleTool = (tool) => {
        const exists = formData.toolsUsed.some((t) => t.name === tool.name)
        handleInputChange(
            'toolsUsed',
            exists
                ? formData.toolsUsed.filter((t) => t.name !== tool.name)
                : [
                      ...formData.toolsUsed,
                      {
                          name: tool.name,
                          logo: '',
                          model: '',
                          link: ''
                      }
                  ]
        )
    }
    const handleSave = async () => {
        try {
            if (!formData) return
            if (!formData.title?.trim()) {
                showMessage('Product title is required', 'error')
                return
            }
            if (!formData.shortDescription?.trim()) {
                showMessage('Short description is required', 'error')
                return
            }
            if (saving) return
            setSaving(true)
            const payload = preparePayload(formData)
            const payloadSize = JSON.stringify(payload).length
            if (payloadSize > 1024 * 1024) {
                throw new Error('Product data is too large. Please reduce image count or description length.')
            }
            await retryApiCall(() => productsAPI.updateProduct(productId, payload))
            showMessage('Product updated successfully', 'success')
            setOriginalData({ ...formData })
        } catch (e) {
            console.error(e)
            if (e.message?.includes('Network Error')) {
                showMessage('Network error. Please check your connection and try again.', 'error')
            } else if (e.message?.includes('413')) {
                showMessage('Product data is too large. Please reduce content size.', 'error')
            } else if (e.message?.includes('validation')) {
                showMessage('Please check your input data and try again.', 'error')
            } else {
                showMessage(e.message || 'Failed to update product', 'error')
            }
        } finally {
            setSaving(false)
        }
    }
    const handleSaveAndExit = async () => {
        await handleSave()
        router.push('/seller/products')
    }
    const handleRevert = () => {
        if (!originalData) return
        if (isDirty && !confirm('Discard unsaved changes?')) return
        setFormData({ ...originalData })
        showMessage('Changes reverted', 'info')
    }
    const handleDelete = async () => {
        if (!confirm('This will permanently delete the product. This action cannot be undone. Continue?')) return
        if (!confirm('Are you absolutely sure? Type DELETE in the next prompt to confirm.')) return
        const confirmText = prompt('Type "DELETE" to confirm deletion:')
        if (confirmText !== 'DELETE') {
            showMessage('Delete cancelled', 'info')
            return
        }
        try {
            if (deleting) return
            setDeleting(true)
            await retryApiCall(() => productsAPI.deleteProduct(productId))
            showMessage('Product deleted successfully', 'success')
            if (typeof window !== 'undefined') {
                localStorage.removeItem(`product-${productId}`)
            }
            router.push('/seller/products')
        } catch (e) {
            console.error(e)
            showMessage('Failed to delete product. Please try again.', 'error')
        } finally {
            setDeleting(false)
        }
    }
    if (loading || !formData || toolsLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>Loading product...</p>
                </div>
            </div>
        )
    }
    return (
        <div
            className="min-h-screen bg-black"
            data-product-edit="true">
            {notification && (
                <div className="fixed top-4 right-4 z-50">
                    <Notification
                        id={notification.id}
                        type={notification.type}
                        message={notification.message}
                        onClose={clearNotification}
                        duration={4000}
                    />
                </div>
            )}
            <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/seller/products"
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-400" />
                            </Link>
                            <h1 className="text-xl font-semibold text-white">Edit Product</h1>
                            {isDirty && (
                                <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                                    Unsaved Changes
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRevert}
                                disabled={!isDirty || saving}
                                className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                                <RefreshCcw className="w-4 h-4" />
                                Revert
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-3 py-2 text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center gap-2 transition-colors">
                                <Trash2 className="w-4 h-4" />
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !isDirty}
                                className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleSaveAndExit}
                                disabled={saving}
                                className="px-4 py-2 bg-brand-primary text-black rounded-lg hover:bg-brand-primary/90 font-medium flex items-center gap-2 transition-colors">
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save & Exit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-6">Basic Information</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Product Title *</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary"
                                    placeholder="e.g., AI Lead Generation System"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Product Type *</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {PRODUCT_TYPES.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => handleInputChange('type', type.value)}
                                            className={`p-4 border rounded-lg text-left transition-all ${
                                                formData.type === type.value
                                                    ? 'bg-brand-primary/10 border-brand-primary text-white'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                            }`}>
                                            <p className="font-medium mb-1">{type.label}</p>
                                            <p className="text-sm opacity-75">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary">
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option
                                                key={cat._id}
                                                value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Industry *</label>
                                    <select
                                        value={formData.industry}
                                        onChange={(e) => handleInputChange('industry', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary">
                                        <option value="">Select industry</option>
                                        {industries.map((ind) => (
                                            <option
                                                key={ind._id}
                                                value={ind.name}>
                                                {ind.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Short Description * (Max 200)</label>
                                <textarea
                                    value={formData.shortDescription}
                                    maxLength={200}
                                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-brand-primary"
                                    placeholder="Brief description of your product..."
                                />
                                <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/200</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Description *</label>
                                <textarea
                                    value={formData.fullDescription}
                                    onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-brand-primary"
                                    placeholder="Detailed description of your product..."
                                />
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-6">Tools Used</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-4">Select Tools Used *</label>
                                {tools.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {tools.map((tool) => {
                                            const selected = formData.toolsUsed.some((t) => t.name === tool.name)
                                            return (
                                                <ToolButton
                                                    key={tool._id}
                                                    tool={tool}
                                                    selected={selected}
                                                    onToggle={() => toggleTool(tool)}
                                                />
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-700 rounded-lg">
                                        <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No tools available</p>
                                        <p className="text-xs mt-1">Tools will appear here when they are added by an admin</p>
                                    </div>
                                )}
                                {formData.toolsUsed.length > 0 && (
                                    <div className="mt-6 space-y-4">
                                        <h4 className="text-sm font-medium text-gray-300">Tool Details (Optional)</h4>
                                        {formData.toolsUsed.map((tool, idx) => (
                                            <div
                                                key={`${tool.name}-${idx}`}
                                                className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Wrench className="w-5 h-5 text-[#00FF89]" />
                                                    <span className="font-medium text-white">{tool.name}</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <input
                                                        placeholder="Model/Version (e.g., GPT-4)"
                                                        value={tool.model || ''}
                                                        onChange={(e) => {
                                                            const updated = [...formData.toolsUsed]
                                                            updated[idx] = { ...updated[idx], model: e.target.value }
                                                            handleInputChange('toolsUsed', updated)
                                                        }}
                                                        className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary"
                                                    />
                                                    <input
                                                        placeholder="Link (optional)"
                                                        value={tool.link || ''}
                                                        onChange={(e) => {
                                                            let linkValue = e.target.value
                                                            if (
                                                                linkValue &&
                                                                !linkValue.startsWith('http://') &&
                                                                !linkValue.startsWith('https://') &&
                                                                linkValue.includes('.')
                                                            ) {
                                                                linkValue = 'https://' + linkValue
                                                            }
                                                            const updated = [...formData.toolsUsed]
                                                            updated[idx] = { ...updated[idx], link: linkValue }
                                                            handleInputChange('toolsUsed', updated)
                                                        }}
                                                        className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Setup Time *</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {SETUP_TIMES.map((time) => (
                                        <button
                                            key={time.value}
                                            type="button"
                                            onClick={() => handleInputChange('setupTime', time.value)}
                                            className={`p-3 border rounded-lg transition-all ${
                                                formData.setupTime === time.value
                                                    ? 'bg-brand-primary/10 border-brand-primary text-white'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                                            }`}>
                                            {time.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-6">Pricing (Read Only)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Current Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="text"
                                        value={formData.price}
                                        disabled
                                        className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Price cannot be changed from this page</p>
                            </div>
                            {formData.originalPrice && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Original Price</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="text"
                                            value={formData.originalPrice}
                                            disabled
                                            className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-6">Media</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail *</label>
                                <ImageUpload
                                    value={formData.thumbnail}
                                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                                    category="product-thumbnails"
                                    placeholder="Upload thumbnail or enter URL"
                                    showPreview={true}
                                    helperText="Recommended: 1200x800px JPG/PNG"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-300">Additional Images</label>
                                    <button
                                        type="button"
                                        onClick={() => addArrayFieldItem('images', '')}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">
                                        <Plus className="w-4 h-4" />
                                        Add Image
                                    </button>
                                </div>
                                {formData.images.length > 0 ? (
                                    <div className="space-y-4">
                                        {formData.images.map((img, i) => (
                                            <div
                                                key={i}
                                                className="relative border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="text-sm font-medium text-white">Image {i + 1}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArrayFieldItem('images', i)}
                                                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                        title="Remove image">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <ImageUpload
                                                    value={img}
                                                    onChange={(e) => handleArrayFieldChange('images', i, e.target.value)}
                                                    category="product-images"
                                                    placeholder="Upload image or enter URL"
                                                    showPreview={true}
                                                    helperText="Additional product image to showcase different angles or features"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-700 rounded-lg">
                                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No additional images added yet</p>
                                        <p className="text-xs mt-1">Click "Add Image" to upload product images</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Preview Video (Optional)</label>
                                <input
                                    value={formData.previewVideo}
                                    onChange={(e) => handleInputChange('previewVideo', e.target.value)}
                                    placeholder="YouTube/Vimeo URL"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                        </div>
                    </section>
                </div>
                <div className="flex items-center justify-between mt-8">
                    <Link
                        href="/seller/products"
                        className="inline-flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Products
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving || !isDirty}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-black rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

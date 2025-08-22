'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Save, X, Plus, Upload, Loader2, RefreshCcw, Trash2 } from 'lucide-react'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
import {
  FORM_STEPS,
  PRODUCT_TYPES,
  CATEGORIES,
  INDUSTRIES,
  TOOLS,
  SETUP_TIMES
} from '@/components/features/products/form/constants'

// Small reusable components kept local to avoid over-fragmentation
const StepContainer = ({ children }) => (
  <div className="space-y-6">{children}</div>
)

const ToolButton = ({ tool, selected, onToggle }) => (
  <button
    onClick={onToggle}
    className={`p-2 border rounded-lg flex flex-col items-center gap-1 transition-all ${selected
      ? 'bg-brand-primary/10 border-brand-primary text-white'
      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
  >
    <span className="text-lg">{tool.logo}</span>
    <span className="text-xs font-medium text-center leading-tight">{tool.label}</span>
  </button>
)

export default function EditProductPage() {
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

  const { productId } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [originalData, setOriginalData] = useState(null)
  const [formData, setFormData] = useState(null)

  // Derived dirty flag
  const isDirty = useMemo(() => {
    if (!originalData || !formData) return false
    return JSON.stringify(preparePayload(formData)) !== JSON.stringify(preparePayload(originalData))
  }, [originalData, formData])

  const preparePayload = (data) => ({
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
    toolsUsed: data.toolsUsed.map(t => {
      const cleaned = { name: t.name }
      if (t.logo) cleaned.logo = t.logo
      if (t.model) cleaned.model = t.model
      if (t.link) cleaned.link = t.link
      return cleaned
    }),
    setupTime: data.setupTime,
    deliveryMethod: data.deliveryMethod,
    embedLink: data.embedLink || '',
    price: parseFloat(data.price),
    originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
    thumbnail: data.thumbnail,
    images: data.images.filter(Boolean),
    previewVideo: data.previewVideo || '',
    tags: data.tags.filter(Boolean),
    searchKeywords: data.searchKeywords?.filter(Boolean) || [],
    estimatedHoursSaved: data.estimatedHoursSaved || '',
    metricsImpacted: data.metricsImpacted || '',
    frequencyOfUse: data.frequencyOfUse,
    hasAffiliateTools: !!data.hasAffiliateTools,
    expectedSupport: data.expectedSupport || '',
    faqs: (data.faqs || []).filter(f => f.question && f.answer)
  })

  const mapApiToForm = (p) => ({
    title: p.title || '',
    type: p.type || '',
    category: p.category || '',
    industry: p.industry || '',
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
      // Use existing stable API method to avoid undefined getProduct runtime issues
      let res
      try {
        res = await productsAPI.getProductBySlug(productId)
      } catch (innerErr) {
        // Fallback: if backend accepts raw ID the same endpoint still works; rethrow if fails
        throw innerErr
      }
      if (!res.data) throw new Error('Product not found')
      const populated = mapApiToForm(res.data)
      setOriginalData(populated)
      setFormData(populated)
    } catch (e) {
      console.error(e)
      showMessage(e.message || 'Failed to load product', 'error')
      router.push('/seller/products')
    } finally {
      setLoading(false)
    }
  }, [productId, router])

  useEffect(() => {
    if (productId) fetchProduct()
  }, [productId, fetchProduct])

  // Navigation protection
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

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleArrayFieldChange = (field, index, value) => setFormData(prev => ({
    ...prev,
    [field]: prev[field].map((item, i) => i === index ? value : item)
  }))

  const addArrayFieldItem = (field, defaultValue = '') => setFormData(prev => ({
    ...prev,
    [field]: [...prev[field], defaultValue]
  }))

  const removeArrayFieldItem = (field, index) => setFormData(prev => ({
    ...prev,
    [field]: prev[field].filter((_, i) => i !== index)
  }))

  const handleFaqChange = (index, field, value) => setFormData(prev => ({
    ...prev,
    faqs: prev.faqs.map((faq, i) => i === index ? { ...faq, [field]: value } : faq)
  }))

  const validateStep = (step) => {
    if (!formData) return false
    switch (step) {
      case 1:
        return formData.title && formData.type && formData.category && formData.industry && formData.shortDescription && formData.fullDescription
      case 2:
        return formData.targetAudience && formData.benefits[0] && formData.useCaseExamples[0]
      case 3:
        return formData.toolsUsed.length > 0 && formData.setupTime
      case 4:
        return formData.price && formData.thumbnail
      case 5:
        return true
      default:
        return false
    }
  }

  const goToStep = (step) => {
    if (step < currentStep || validateStep(currentStep)) setCurrentStep(step)
    else showMessage('Please complete all required fields', 'error')
  }

  const handleSave = async () => {
    try {
      if (!formData) return
      setSaving(true)
      const payload = preparePayload(formData)
      await productsAPI.updateProduct(productId, payload)
      showMessage('Product updated', 'success')
      setOriginalData(formData)
    } catch (e) {
      console.error(e)
      showMessage(e.message || 'Update failed', 'error')
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
    setFormData(originalData)
    showMessage('Reverted changes', 'success')
  }

  const handleDelete = async () => {
    if (!confirm('This will permanently delete the product. Continue?')) return
    try {
      setDeleting(true)
      await productsAPI.deleteProduct(productId)
      showMessage('Product deleted', 'success')
      router.push('/seller/products')
    } catch (e) {
      console.error(e)
      showMessage('Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const toggleTool = (tool) => {
    const exists = formData.toolsUsed.some(t => t.name === tool.label)
    handleInputChange('toolsUsed', exists
      ? formData.toolsUsed.filter(t => t.name !== tool.label)
      : [...formData.toolsUsed, { name: tool.label, logo: `https://placehold.co/40x40/1f1f1f/808080?text=${encodeURIComponent(tool.label.charAt(0))}`, model: '', link: '' }])
  }

  if (loading || !formData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/seller/products" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <h1 className="text-xl font-semibold text-white line-clamp-1">Edit: {originalData.title}</h1>
              {isDirty && <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-700">Unsaved</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRevert}
                disabled={!isDirty || saving}
                className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Revert
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-2 text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleSaveAndExit}
                disabled={saving}
                className="px-4 py-2 bg-brand-primary text-black rounded-lg hover:bg-brand-primary/90 font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save & Exit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
            {FORM_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center cursor-pointer" onClick={() => goToStep(step.id)}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep === step.id
                    ? 'bg-brand-primary text-black'
                    : step.id < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-400'}`}>{step.id < currentStep ? '✓' : step.id}</div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${currentStep === step.id ? 'text-white' : 'text-gray-400'}`}>{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < FORM_STEPS.length - 1 && (
                  <div className={`hidden sm:block w-24 h-1 mx-4 rounded ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-8"
          >
            {/* Step 1 */}
            {currentStep === 1 && (
              <StepContainer>
                <h2 className="text-2xl font-semibold text-white mb-6">Basic Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Title *</label>
                  <input value={formData.title} onChange={e => handleInputChange('title', e.target.value)} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" placeholder="e.g., AI Lead Gen System" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Type *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRODUCT_TYPES.map(type => (
                      <button key={type.value} onClick={() => handleInputChange('type', type.value)} className={`p-4 border rounded-lg text-left transition-all ${formData.type === type.value ? 'bg-brand-primary/10 border-brand-primary text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                        <p className="font-medium mb-1">{type.label}</p>
                        <p className="text-sm opacity-75">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                    <select value={formData.category} onChange={e => handleInputChange('category', e.target.value)} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary">
                      <option value="">Select category</option>
                      {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Industry *</label>
                    <select value={formData.industry} onChange={e => handleInputChange('industry', e.target.value)} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary">
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Short Description * (Max 200)</label>
                  <textarea value={formData.shortDescription} maxLength={200} onChange={e => handleInputChange('shortDescription', e.target.value)} rows={2} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-brand-primary" />
                  <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/200</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Description *</label>
                  <textarea value={formData.fullDescription} onChange={e => handleInputChange('fullDescription', e.target.value)} rows={6} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-brand-primary" />
                </div>
              </StepContainer>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <StepContainer>
                <h2 className="text-2xl font-semibold text-white mb-6">Product Details</h2>
                <FieldArraySection title="Who it's for (Target audience) *" single value={formData.targetAudience} onChange={v => handleInputChange('targetAudience', v)} placeholder="e.g., SaaS founders" />
                <DynamicList title="Key Benefits *" field="benefits" values={formData.benefits} placeholder="e.g., Save 10+ hours/week" required onChange={handleArrayFieldChange} addItem={() => addArrayFieldItem('benefits')} removeItem={(i) => removeArrayFieldItem('benefits', i)} />
                <DynamicList title="Use Case Examples *" field="useCaseExamples" values={formData.useCaseExamples} placeholder="e.g., Qualifying inbound leads" required onChange={handleArrayFieldChange} addItem={() => addArrayFieldItem('useCaseExamples')} removeItem={(i) => removeArrayFieldItem('useCaseExamples', i)} />
                <DynamicList title="How it Works (Steps)" field="howItWorks" values={formData.howItWorks} placeholder="Describe this step" numbered onChange={handleArrayFieldChange} addItem={() => addArrayFieldItem('howItWorks')} removeItem={(i) => removeArrayFieldItem('howItWorks', i)} />
                <DynamicList title="Outcomes (KPIs)" field="outcome" values={formData.outcome} placeholder="e.g., +50% lead conversion" onChange={handleArrayFieldChange} addItem={() => addArrayFieldItem('outcome')} removeItem={(i) => removeArrayFieldItem('outcome', i)} />
              </StepContainer>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <StepContainer>
                <h2 className="text-2xl font-semibold text-white mb-6">Technical Details</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">Tools Used * (Select)</label>
                  <div className="space-y-6">
                    <ToolGroups tools={TOOLS} formData={formData} toggleTool={toggleTool} />
                  </div>
                  {formData.toolsUsed.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm text-gray-400">Details (optional)</p>
                      {formData.toolsUsed.map((tool, idx) => (
                        <div key={tool.name + idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{TOOLS.find(t => t.label === tool.name)?.logo}</span>
                            <span className="font-medium text-white">{tool.name}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input placeholder="Model/Version" value={tool.model || ''} onChange={e => {
                              const updated = [...formData.toolsUsed]
                              updated[idx] = { ...updated[idx], model: e.target.value }
                              handleInputChange('toolsUsed', updated)
                            }} className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
                            <input placeholder="Tool link" value={tool.link || ''} onChange={e => {
                              const updated = [...formData.toolsUsed]
                              updated[idx] = { ...updated[idx], link: e.target.value }
                              handleInputChange('toolsUsed', updated)
                            }} className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Setup Time *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SETUP_TIMES.map(time => (
                      <button key={time.value} onClick={() => handleInputChange('setupTime', time.value)} className={`p-3 border rounded-lg transition-all ${formData.setupTime === time.value ? 'bg-brand-primary/10 border-brand-primary text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>{time.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Method</label>
                  <div className="space-y-3">
                    {['link','file','instructions'].map(method => (
                      <label key={method} className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 capitalize">
                        <input type="radio" name="deliveryMethod" value={method} checked={formData.deliveryMethod === method} onChange={e => handleInputChange('deliveryMethod', e.target.value)} />
                        <div>
                          <p className="font-medium text-white">{method === 'link' ? 'External Link' : method === 'file' ? 'File Download' : 'Instructions Only'}</p>
                          <p className="text-sm text-gray-400">{method === 'link' ? 'Provide a hosted link' : method === 'file' ? 'Upload downloadable assets' : 'Detailed setup instructions'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.deliveryMethod === 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Product Link</label>
                    <input value={formData.embedLink} onChange={e => handleInputChange('embedLink', e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
                  </div>
                )}
              </StepContainer>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <StepContainer>
                <h2 className="text-2xl font-semibold text-white mb-6">Pricing & Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" value={formData.price} onChange={e => handleInputChange('price', e.target.value)} min="0" step="0.01" className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Original Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input type="number" value={formData.originalPrice} onChange={e => handleInputChange('originalPrice', e.target.value)} min="0" step="0.01" className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail *</label>
                  <div className="flex items-center gap-4">
                    <input value={formData.thumbnail} onChange={e => handleInputChange('thumbnail', e.target.value)} placeholder="https://example.com/thumb.jpg" className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
                    <button type="button" className="p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600"><Upload className="w-5 h-5 text-gray-400" /></button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Recommended 1200x800 JPG/PNG</p>
                </div>
                <DynamicImages images={formData.images} onChange={handleArrayFieldChange} add={() => addArrayFieldItem('images')} remove={(i) => removeArrayFieldItem('images', i)} />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preview Video</label>
                  <input value={formData.previewVideo} onChange={e => handleInputChange('previewVideo', e.target.value)} placeholder="YouTube/Vimeo URL" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
                </div>
              </StepContainer>
            )}

            {/* Step 5 */}
            {currentStep === 5 && (
              <StepContainer>
                <h2 className="text-2xl font-semibold text-white mb-6">Advanced Settings</h2>
                <TagInput tags={formData.tags} onAdd={tag => handleInputChange('tags', [...formData.tags, tag])} onRemove={(i) => removeArrayFieldItem('tags', i)} />
                <MetricsFields formData={formData} handleInputChange={handleInputChange} />
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.hasAffiliateTools} onChange={e => handleInputChange('hasAffiliateTools', e.target.checked)} className="w-5 h-5 rounded border-gray-700 bg-gray-800" />
                    <span className="text-white">This product uses affiliate tools</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Expected Updates or Support</label>
                  <textarea value={formData.expectedSupport} onChange={e => handleInputChange('expectedSupport', e.target.value)} rows={3} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-brand-primary" />
                </div>
                <FAQSection faqs={formData.faqs} onChange={handleFaqChange} add={() => handleInputChange('faqs', [...formData.faqs, { question: '', answer: '' }])} remove={(i) => removeArrayFieldItem('faqs', i)} />
              </StepContainer>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="inline-flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50">Previous</button>
          {currentStep < 5 ? (
            <button onClick={() => goToStep(currentStep + 1)} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-black rounded-lg hover:bg-brand-primary/90">Next</button>
          ) : (
            <button onClick={handleSave} disabled={saving || !isDirty} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-black rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper subcomponents
function DynamicList({ title, field, values, placeholder, onChange, addItem, removeItem, numbered, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{title}{required && ' *'}</label>
      {values.map((val, i) => (
        <div key={i} className="flex gap-2 mb-2">
          {numbered && <div className="flex items-center px-3 bg-gray-800 rounded-l-lg text-gray-500 font-medium">{i + 1}</div>}
          <input value={val} onChange={e => onChange(field, i, e.target.value)} placeholder={placeholder} className={`flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary ${numbered ? 'rounded-l-none' : ''}`} />
          {values.length > 1 && (
            <button onClick={() => removeItem(i)} className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg"><X className="w-5 h-5" /></button>
          )}
        </div>
      ))}
      <button onClick={addItem} className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg"><Plus className="w-4 h-4" />Add</button>
    </div>
  )
}

function DynamicImages({ images, onChange, add, remove }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Additional Images</label>
      {images.map((img, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input value={img} onChange={e => onChange('images', i, e.target.value)} placeholder="https://example.com/image.jpg" className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
          <button onClick={() => remove(i)} className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
      ))}
      <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg"><Plus className="w-4 h-4" />Add Image</button>
    </div>
  )
}

function TagInput({ tags, onAdd, onRemove }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Tags (Enter to add)</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm">
            {tag}
            <button onClick={() => onRemove(i)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <input type="text" placeholder="Add tag..." onKeyDown={e => {
        if (e.key === 'Enter' && e.currentTarget.value) {
          e.preventDefault();
          onAdd(e.currentTarget.value.trim());
          e.currentTarget.value = ''
        }
      }} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
    </div>
  )
}

function MetricsFields({ formData, handleInputChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Hours Saved</label>
        <input value={formData.estimatedHoursSaved} onChange={e => handleInputChange('estimatedHoursSaved', e.target.value)} placeholder="e.g., 10+ hours/week" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Metrics Impacted</label>
        <input value={formData.metricsImpacted} onChange={e => handleInputChange('metricsImpacted', e.target.value)} placeholder="e.g., Lead conversion" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
      </div>
    </div>
  )
}

function FAQSection({ faqs, onChange, add, remove }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">FAQs</label>
      {faqs.map((faq, i) => (
        <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-2">
          <input value={faq.question} onChange={e => onChange(i, 'question', e.target.value)} placeholder="Question" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-2 focus:outline-none focus:border-brand-primary" />
          <textarea value={faq.answer} onChange={e => onChange(i, 'answer', e.target.value)} placeholder="Answer" rows={2} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary resize-none" />
          {faqs.length > 1 && <button onClick={() => remove(i)} className="mt-2 text-sm text-red-400 hover:text-red-300">Remove FAQ</button>}
        </div>
      ))}
      <button onClick={add} className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg"><Plus className="w-4 h-4" />Add FAQ</button>
    </div>
  )
}

function ToolGroups({ tools, formData, toggleTool }) {
  return (
    <div className="space-y-6">
      <ToolCategory label="AI Tools" tools={tools.slice(0,4)} formData={formData} toggleTool={toggleTool} />
      <ToolCategory label="Automation Tools" tools={tools.slice(4,8)} formData={formData} toggleTool={toggleTool} />
      <ToolCategory label="No-Code Tools" tools={tools.slice(8,12)} formData={formData} toggleTool={toggleTool} />
      <ToolCategory label="CRM & Sales" tools={tools.slice(12,15)} formData={formData} toggleTool={toggleTool} />
      <ToolCategory label="Email & Communication" tools={tools.slice(15)} formData={formData} toggleTool={toggleTool} />
    </div>
  )
}

function ToolCategory({ label, tools, formData, toggleTool }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {tools.map(tool => {
          const selected = formData.toolsUsed.some(t => t.name === tool.label)
          return <ToolButton key={tool.value} tool={tool} selected={selected} onToggle={() => toggleTool(tool)} />
        })}
      </div>
    </div>
  )
}

function FieldArraySection({ title, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{title}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary" />
    </div>
  )
}

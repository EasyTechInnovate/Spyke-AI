'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Save, X, Plus, Upload, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { useSellerProfile } from '@/hooks/useSellerProfile'

// Form Steps
const FORM_STEPS = [
  { id: 1, title: 'Basic Information', description: 'Product title, type, and description' },
  { id: 2, title: 'Product Details', description: 'Features, benefits, and use cases' },
  { id: 3, title: 'Technical Details', description: 'Tools, setup time, and delivery' },
  { id: 4, title: 'Pricing & Media', description: 'Price, images, and preview' },
  { id: 5, title: 'Advanced Settings', description: 'Tags, metrics, and support' }
]

// Product Types
const PRODUCT_TYPES = [
  { value: 'prompt', label: 'AI Prompt', description: 'Pre-written prompts for AI tools' },
  { value: 'automation', label: 'Automation', description: 'Automated workflows and processes' },
  { value: 'agent', label: 'AI Agent', description: 'Intelligent agents that perform tasks' }
]

// Categories
const CATEGORIES = [
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'hiring', label: 'Hiring & Recruitment' },
  { value: 'follow_ups', label: 'Follow-ups' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'analysis', label: 'Analysis' }
]

// Industries
const INDUSTRIES = [
  { value: 'coaching', label: 'Coaching' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'local_business', label: 'Local Business' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'finance', label: 'Finance' },
  { value: 'technology', label: 'Technology' },
  { value: 'consulting', label: 'Consulting' }
]

// Tools (matching backend EAutomationTools + AI tools)
const TOOLS = [
  // AI Tools
  { value: 'CHATGPT', label: 'ChatGPT', logo: '🤖' },
  { value: 'CLAUDE', label: 'Claude', logo: '🔮' },
  { value: 'GEMINI', label: 'Google Gemini', logo: '✨' },
  { value: 'PERPLEXITY', label: 'Perplexity', logo: '🔍' },
  
  // Automation Tools
  { value: 'ZAPIER', label: 'Zapier', logo: '⚡' },
  { value: 'MAKE', label: 'Make (formerly Integromat)', logo: '🔧' },
  { value: 'POWER_AUTOMATE', label: 'Microsoft Power Automate', logo: '🔄' },
  { value: 'N8N', label: 'n8n', logo: '🔗' },
  
  // No-Code Tools
  { value: 'BUBBLE', label: 'Bubble', logo: '🫧' },
  { value: 'WEBFLOW', label: 'Webflow', logo: '🌐' },
  { value: 'AIRTABLE', label: 'Airtable', logo: '📊' },
  { value: 'NOTION', label: 'Notion', logo: '📝' },
  
  // CRM & Sales
  { value: 'PIPEDRIVE', label: 'Pipedrive', logo: '🎯' },
  { value: 'HUBSPOT', label: 'HubSpot', logo: '🟠' },
  { value: 'SALESFORCE', label: 'Salesforce', logo: '☁️' },
  
  // Email Marketing
  { value: 'MAILCHIMP', label: 'Mailchimp', logo: '📮' },
  { value: 'CONVERTKIT', label: 'ConvertKit', logo: '✉️' },
  { value: 'KLAVIYO', label: 'Klaviyo', logo: '📧' },
  
  // Productivity
  { value: 'GOOGLE_WORKSPACE', label: 'Google Workspace', logo: '🔷' },
  { value: 'MICROSOFT_365', label: 'Microsoft 365', logo: '🟦' },
  
  // Communication
  { value: 'SLACK', label: 'Slack', logo: '💬' },
  { value: 'DISCORD', label: 'Discord', logo: '🎮' },
  { value: 'TELEGRAM', label: 'Telegram', logo: '✈️' },
  { value: 'WHATSAPP_BUSINESS', label: 'WhatsApp Business', logo: '💚' }
]

// Setup Times
const SETUP_TIMES = [
  { value: 'instant', label: 'Instant' },
  { value: 'under_30_mins', label: 'Under 30 mins' },
  { value: 'under_1_hour', label: 'Under 1 hour' },
  { value: 'over_1_hour', label: 'Over 1 hour' }
]

// Tool Button Component
const ToolButton = ({ tool, formData, handleInputChange }) => {
  const isSelected = formData.toolsUsed.some(t => t.name === tool.label)
  
  return (
    <button
      onClick={() => {
        if (isSelected) {
          handleInputChange('toolsUsed', formData.toolsUsed.filter(t => t.name !== tool.label))
        } else {
          handleInputChange('toolsUsed', [...formData.toolsUsed, { 
            name: tool.label, 
            logo: `https://via.placeholder.com/40x40?text=${encodeURIComponent(tool.label.charAt(0))}`,
            model: '',
            link: ''
          }])
        }
      }}
      className={`
        p-2 border rounded-lg flex flex-col items-center gap-1 transition-all
        ${isSelected
          ? 'bg-brand-primary/10 border-brand-primary text-white'
          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
        }
      `}
    >
      <span className="text-lg">{tool.logo}</span>
      <span className="text-xs font-medium text-center leading-tight">{tool.label}</span>
    </button>
  )
}

export default function CreateProductPage() {
  const router = useRouter()
  const { data: sellerProfile, loading: profileLoading } = useSellerProfile()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if seller is fully approved (both verification and commission)
  const isVerificationApproved = sellerProfile?.verificationStatus === 'approved'
  const isCommissionAccepted = sellerProfile?.commissionOffer?.status === 'accepted' && sellerProfile?.commissionOffer?.acceptedAt
  const isFullyApproved = isVerificationApproved && isCommissionAccepted

  // If seller is not fully approved, show restricted access message
  if (!profileLoading && !isFullyApproved) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Product Creation Restricted</h2>
            <p className="text-gray-400 mb-6">
              You need to complete your seller approval process before you can create products.
            </p>
            
            {!isVerificationApproved && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                <p className="text-amber-300 text-sm">
                  ⏳ Your documents are still being reviewed
                </p>
              </div>
            )}
            
            {isVerificationApproved && !isCommissionAccepted && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                <p className="text-blue-300 text-sm">
                  💼 Please accept the commission offer to complete your approval
                </p>
              </div>
            )}
            
            <Link
              href="/seller/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-primary-text rounded-lg hover:bg-brand-primary/90 transition-colors font-semibold"
            >
              Complete Approval Process
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Form Data State
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: '',
    type: '',
    category: '',
    industry: '',
    shortDescription: '',
    fullDescription: '',
    
    // Step 2: Product Details
    targetAudience: '',
    benefits: [''],
    useCaseExamples: [''],
    howItWorks: [''],
    outcome: [''],
    
    // Step 3: Technical Details
    toolsUsed: [],
    setupTime: '',
    deliveryMethod: 'link',
    embedLink: '',
    
    // Step 4: Pricing & Media
    price: '',
    originalPrice: '',
    thumbnail: '',
    images: [],
    previewVideo: '',
    
    // Step 5: Advanced Settings
    tags: [],
    searchKeywords: [],
    estimatedHoursSaved: '',
    metricsImpacted: '',
    frequencyOfUse: 'ongoing',
    hasAffiliateTools: false,
    expectedSupport: '',
    faqs: [{ question: '', answer: '' }]
  })

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle array field changes
  const handleArrayFieldChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  // Add array field item
  const addArrayFieldItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }))
  }

  // Remove array field item
  const removeArrayFieldItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  // Handle FAQ changes
  const handleFaqChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }))
  }

  // Validate current step
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.type && formData.category && 
               formData.industry && formData.shortDescription && formData.fullDescription
      case 2:
        return formData.targetAudience && 
               formData.benefits[0] && formData.useCaseExamples[0]
      case 3:
        return formData.toolsUsed.length > 0 && formData.setupTime
      case 4:
        return formData.price && formData.thumbnail
      case 5:
        return true // Optional step
      default:
        return false
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Prepare data for API
      const productData = {
        ...formData,
        // Filter empty strings from arrays
        benefits: formData.benefits.filter(b => b),
        useCaseExamples: formData.useCaseExamples.filter(u => u),
        howItWorks: formData.howItWorks.filter(h => h),
        outcome: formData.outcome.filter(o => o),
        images: formData.images.filter(i => i),
        tags: formData.tags.filter(t => t),
        searchKeywords: formData.searchKeywords.filter(k => k),
        faqs: formData.faqs.filter(f => f.question && f.answer),
        // Convert price to number
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        // Clean up toolsUsed - filter out empty values
        toolsUsed: formData.toolsUsed.map(tool => {
          const cleanTool = {
            name: tool.name
          }
          // Only add optional fields if they have values
          if (tool.logo && tool.logo.trim() !== '') cleanTool.logo = tool.logo
          if (tool.model && tool.model.trim() !== '') cleanTool.model = tool.model
          if (tool.link && tool.link.trim() !== '') cleanTool.link = tool.link
          return cleanTool
        })
      }
      
      const response = await productsAPI.createProduct(productData)
      
      if (response.data) {
        toast.success('Product created successfully!')
        router.push('/seller/products')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(error.message || 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigate between steps
  const goToStep = (step) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step)
    } else {
      toast.error('Please complete all required fields')
    }
  }

  // Show loading while checking profile
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
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
              <Link
                href="/seller/products"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <h1 className="text-xl font-semibold text-white">Create New Product</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/seller/products')}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !validateStep(5)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-primary-text rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span className="font-medium">
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {FORM_STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center cursor-pointer"
                onClick={() => goToStep(step.id)}
              >
                <div className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      ${currentStep === step.id 
                        ? 'bg-brand-primary text-brand-primary-text' 
                        : step.id < currentStep 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-800 text-gray-400'
                      }
                    `}
                  >
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep === step.id ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < FORM_STEPS.length - 1 && (
                  <div className={`
                    hidden sm:block w-24 h-1 mx-4 rounded
                    ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-800'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-8"
          >
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Basic Information</h2>
                
                {/* Product Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., AI-Powered Lead Generation System"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRODUCT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleInputChange('type', type.value)}
                        className={`
                          p-4 border rounded-lg text-left transition-all
                          ${formData.type === type.value
                            ? 'bg-brand-primary/10 border-brand-primary text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }
                        `}
                      >
                        <p className="font-medium mb-1">{type.label}</p>
                        <p className="text-sm opacity-75">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Industry *
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand-primary"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind.value} value={ind.value}>
                          {ind.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Short Description * (Max 200 characters)
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    placeholder="Brief overview of your product"
                    maxLength={200}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.shortDescription.length}/200 characters
                  </p>
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    value={formData.fullDescription}
                    onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                    placeholder="Detailed description of your product, features, and value proposition"
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Product Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Product Details</h2>
                

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Who it's for (Target audience) *
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="e.g., SaaS founders, E-commerce store owners, Digital marketers"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Key Benefits *
                  </label>
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                        placeholder="e.g., Save 10+ hours per week"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          onClick={() => removeArrayFieldItem('benefits', index)}
                          className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayFieldItem('benefits')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Benefit
                  </button>
                </div>

                {/* Use Case Examples */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Use Case Examples *
                  </label>
                  {formData.useCaseExamples.map((useCase, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={useCase}
                        onChange={(e) => handleArrayFieldChange('useCaseExamples', index, e.target.value)}
                        placeholder="e.g., Qualifying leads from website forms"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      />
                      {formData.useCaseExamples.length > 1 && (
                        <button
                          onClick={() => removeArrayFieldItem('useCaseExamples', index)}
                          className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayFieldItem('useCaseExamples')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Use Case
                  </button>
                </div>

                {/* How it Works */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    How it Works (Step-by-step)
                  </label>
                  {formData.howItWorks.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <div className="flex items-center px-3 bg-gray-800 rounded-l-lg">
                        <span className="text-gray-500 font-medium">{index + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => handleArrayFieldChange('howItWorks', index, e.target.value)}
                        placeholder="Describe this step"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-r-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      />
                      <button
                        onClick={() => removeArrayFieldItem('howItWorks', index)}
                        className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayFieldItem('howItWorks')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </button>
                </div>

                {/* Outcomes/KPIs */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Outcomes (KPIs it impacts)
                  </label>
                  {formData.outcome.map((outcome, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => handleArrayFieldChange('outcome', index, e.target.value)}
                        placeholder="e.g., 50% increase in lead conversion"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      />
                      <button
                        onClick={() => removeArrayFieldItem('outcome', index)}
                        className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayFieldItem('outcome')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Outcome
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Technical Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Technical Details</h2>
                
                {/* Tools Used */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Tools Used * (Select all that apply)
                  </label>
                  
                  {/* Tools organized by category */}
                  <div className="space-y-6">
                    {/* AI Tools */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">AI Tools</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {TOOLS.slice(0, 4).map((tool) => (
                          <ToolButton key={tool.value} tool={tool} formData={formData} handleInputChange={handleInputChange} />
                        ))}
                      </div>
                    </div>
                    
                    {/* Automation Tools */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Automation Tools</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {TOOLS.slice(4, 8).map((tool) => (
                          <ToolButton key={tool.value} tool={tool} formData={formData} handleInputChange={handleInputChange} />
                        ))}
                      </div>
                    </div>
                    
                    {/* No-Code Tools */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">No-Code Tools</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {TOOLS.slice(8, 12).map((tool) => (
                          <ToolButton key={tool.value} tool={tool} formData={formData} handleInputChange={handleInputChange} />
                        ))}
                      </div>
                    </div>
                    
                    {/* CRM & Sales */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">CRM & Sales</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {TOOLS.slice(12, 15).map((tool) => (
                          <ToolButton key={tool.value} tool={tool} formData={formData} handleInputChange={handleInputChange} />
                        ))}
                      </div>
                    </div>
                    
                    {/* Email & Communication */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Email & Communication</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {TOOLS.slice(15).map((tool) => (
                          <ToolButton key={tool.value} tool={tool} formData={formData} handleInputChange={handleInputChange} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Tool Details for Selected Tools */}
                  {formData.toolsUsed.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm text-gray-400">Add details for selected tools (optional):</p>
                      {formData.toolsUsed.map((tool, index) => (
                        <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{TOOLS.find(t => t.label === tool.name)?.logo}</span>
                            <span className="font-medium text-white">{tool.name}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Model/Version (e.g., GPT-4)"
                              value={tool.model || ''}
                              onChange={(e) => {
                                const updated = [...formData.toolsUsed]
                                updated[index] = { ...updated[index], model: e.target.value }
                                handleInputChange('toolsUsed', updated)
                              }}
                              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                            />
                            <input
                              type="url"
                              placeholder="Tool link (optional)"
                              value={tool.link || ''}
                              onChange={(e) => {
                                const updated = [...formData.toolsUsed]
                                updated[index] = { ...updated[index], link: e.target.value }
                                handleInputChange('toolsUsed', updated)
                              }}
                              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Setup Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Setup Time Estimate *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SETUP_TIMES.map((time) => (
                      <button
                        key={time.value}
                        onClick={() => handleInputChange('setupTime', time.value)}
                        className={`
                          p-3 border rounded-lg transition-all
                          ${formData.setupTime === time.value
                            ? 'bg-brand-primary/10 border-brand-primary text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }
                        `}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Delivery Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="link"
                        checked={formData.deliveryMethod === 'link'}
                        onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                        className="text-brand-primary"
                      />
                      <div>
                        <p className="font-medium text-white">External Link</p>
                        <p className="text-sm text-gray-400">Provide a link to Notion, Make, Zapier, etc.</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="file"
                        checked={formData.deliveryMethod === 'file'}
                        onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                        className="text-brand-primary"
                      />
                      <div>
                        <p className="font-medium text-white">File Download</p>
                        <p className="text-sm text-gray-400">Upload files for users to download</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="instructions"
                        checked={formData.deliveryMethod === 'instructions'}
                        onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                        className="text-brand-primary"
                      />
                      <div>
                        <p className="font-medium text-white">Instructions Only</p>
                        <p className="text-sm text-gray-400">Provide detailed setup instructions</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Embed Link */}
                {formData.deliveryMethod === 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Link
                    </label>
                    <input
                      type="url"
                      value={formData.embedLink}
                      onChange={(e) => handleInputChange('embedLink', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Pricing & Media */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Pricing & Media</h2>
                
                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="29.99"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Original Price (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                        placeholder="49.99"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail Image *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="url"
                      value={formData.thumbnail}
                      onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                      placeholder="https://example.com/thumbnail.jpg"
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                    />
                    <button className="p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Recommended: 1200x800px, JPG/PNG
                  </p>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Images (Optional)
                  </label>
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleArrayFieldChange('images', index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                      />
                      <button
                        onClick={() => removeArrayFieldItem('images', index)}
                        className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayFieldItem('images')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Image
                  </button>
                </div>

                {/* Preview Video */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preview Video (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.previewVideo}
                    onChange={(e) => handleInputChange('previewVideo', e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Advanced Settings */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Advanced Settings</h2>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (Press Enter to add)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeArrayFieldItem('tags', index)}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add tags..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        e.preventDefault()
                        handleInputChange('tags', [...formData.tags, e.target.value])
                        e.target.value = ''
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estimated Hours Saved
                    </label>
                    <input
                      type="text"
                      value={formData.estimatedHoursSaved}
                      onChange={(e) => handleInputChange('estimatedHoursSaved', e.target.value)}
                      placeholder="e.g., 10+ hours per week"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Metrics Impacted
                    </label>
                    <input
                      type="text"
                      value={formData.metricsImpacted}
                      onChange={(e) => handleInputChange('metricsImpacted', e.target.value)}
                      placeholder="e.g., Lead conversion rate, Response time"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* Frequency of Use */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frequency of Use
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['one-time', 'weekly', 'ongoing'].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => handleInputChange('frequencyOfUse', freq)}
                        className={`
                          p-3 border rounded-lg capitalize transition-all
                          ${formData.frequencyOfUse === freq
                            ? 'bg-brand-primary/10 border-brand-primary text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }
                        `}
                      >
                        {freq.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Affiliate Tools */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasAffiliateTools}
                      onChange={(e) => handleInputChange('hasAffiliateTools', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-white">This product uses affiliate tools</span>
                  </label>
                </div>

                {/* Expected Support */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expected Updates or Support
                  </label>
                  <textarea
                    value={formData.expectedSupport}
                    onChange={(e) => handleInputChange('expectedSupport', e.target.value)}
                    placeholder="Describe any ongoing support or updates you'll provide"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary resize-none"
                  />
                </div>

                {/* FAQs */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frequently Asked Questions
                  </label>
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                        placeholder="Question"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary mb-2"
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                        placeholder="Answer"
                        rows={2}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary resize-none"
                      />
                      {formData.faqs.length > 1 && (
                        <button
                          onClick={() => removeArrayFieldItem('faqs', index)}
                          className="mt-2 text-sm text-red-400 hover:text-red-300"
                        >
                          Remove FAQ
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => handleInputChange('faqs', [...formData.faqs, { question: '', answer: '' }])}
                    className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add FAQ
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>
          
          {currentStep < 5 ? (
            <button
              onClick={() => goToStep(currentStep + 1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-primary-text rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateStep(5)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-primary-text rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Save, X, Plus, Upload, AlertCircle, 
  Sparkles, Target, Zap, DollarSign, Settings, Eye, 
  CheckCircle2, Clock, Users, TrendingUp, FileText,
  Image, Video, Tag, MessageSquare, Lightbulb, Rocket
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { useSellerProfile } from '@/hooks/useSellerProfile'

// Enhanced Form Steps with icons and better descriptions
const FORM_STEPS = [
  { 
    id: 1, 
    title: 'Basics', 
    description: 'Title, type & overview',
    icon: Lightbulb,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 2, 
    title: 'Details', 
    description: 'Features & benefits',
    icon: Target,
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 3, 
    title: 'Technical', 
    description: 'Tools & delivery',
    icon: Zap,
    color: 'from-orange-500 to-red-500'
  },
  { 
    id: 4, 
    title: 'Media & Price', 
    description: 'Images & pricing',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 5, 
    title: 'Launch', 
    description: 'Final settings',
    icon: Rocket,
    color: 'from-violet-500 to-purple-500'
  }
]

// Enhanced Product Types with better visuals
const PRODUCT_TYPES = [
  { 
    value: 'prompt', 
    label: 'AI Prompt', 
    description: 'Pre-written prompts for AI tools',
    icon: '🤖',
    features: ['Ready-to-use', 'Multiple variations', 'Tested prompts']
  },
  { 
    value: 'automation', 
    label: 'Automation', 
    description: 'Automated workflows and processes',
    icon: '⚡',
    features: ['Time-saving', 'Scalable', 'Integration-ready']
  },
  { 
    value: 'agent', 
    label: 'AI Agent', 
    description: 'Intelligent agents that perform tasks',
    icon: '🚀',
    features: ['Autonomous', 'Smart decisions', 'Task execution']
  }
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

// Enhanced Tool Button Component
const ToolButton = ({ tool, formData, handleInputChange, className = "" }) => {
  const isSelected = formData.toolsUsed.some(t => t.name === tool.label)
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (isSelected) {
          handleInputChange('toolsUsed', formData.toolsUsed.filter(t => t.name !== tool.label))
        } else {
          handleInputChange('toolsUsed', [...formData.toolsUsed, { 
            name: tool.label, 
            logo: `https://placehold.co/40x40/1f1f1f/808080?text=${encodeURIComponent(tool.label.charAt(0))}`,
            model: '',
            link: ''
          }])
        }
      }}
      className={`
        relative p-3 border rounded-xl flex flex-col items-center gap-2 transition-all duration-300
        ${isSelected
          ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] text-white shadow-lg shadow-[#00FF89]/20'
          : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/70'
        }
        ${className}
      `}
    >
      {isSelected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-[#00FF89] rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-3 h-3 text-black" />
        </motion.div>
      )}
      <span className="text-2xl">{tool.logo}</span>
      <span className="text-xs font-medium text-center leading-tight">{tool.label}</span>
    </motion.button>
  )
}

// Enhanced Input Component
const FormInput = ({ 
  label, 
  required = false, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  description,
  icon: Icon,
  ...props 
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {required && <span className="text-[#00FF89]">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
      {...props}
    />
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
)

// Enhanced Textarea Component
const FormTextarea = ({ 
  label, 
  required = false, 
  placeholder, 
  value, 
  onChange, 
  rows = 3,
  maxLength,
  description,
  icon: Icon,
  ...props 
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {required && <span className="text-[#00FF89]">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300 resize-none"
      {...props}
    />
    {maxLength && (
      <p className="text-xs text-gray-500 text-right">
        {value.length}/{maxLength} characters
      </p>
    )}
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
)

// Enhanced Select Component
const FormSelect = ({ 
  label, 
  required = false, 
  value, 
  onChange, 
  options, 
  placeholder = "Select option",
  icon: Icon 
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {required && <span className="text-[#00FF89]">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)

// Enhanced Progress Component
const ProgressSteps = ({ currentStep, steps, onStepClick }) => (
  <div className="relative">
    {/* Desktop Progress */}
    <div className="hidden lg:flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = currentStep === step.id
        const isCompleted = step.id < currentStep
        const isAccessible = step.id <= currentStep
        
        return (
          <div key={step.id} className="flex items-center">
            <motion.button
              onClick={() => isAccessible && onStepClick(step.id)}
              className={`
                relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300
                ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                ${isActive ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-[#00FF89]/30' : ''}
              `}
              whileHover={isAccessible ? { scale: 1.05 } : {}}
              whileTap={isAccessible ? { scale: 0.95 } : {}}
            >
              <div className={`
                relative w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                ${isCompleted 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30' 
                  : isActive 
                    ? `bg-gradient-to-br ${step.color} text-white shadow-lg` 
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </motion.button>
            
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-1 mx-4 rounded-full transition-all duration-500
                ${step.id < currentStep ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-800'}
              `} />
            )}
          </div>
        )
      })}
    </div>
    
    {/* Mobile Progress */}
    <div className="lg:hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            bg-gradient-to-br ${steps[currentStep - 1]?.color || 'from-gray-500 to-gray-600'}
          `}>
            {React.createElement(steps[currentStep - 1]?.icon || Settings, { className: "w-5 h-5 text-white" })}
          </div>
          <div>
            <h3 className="text-white font-medium">{steps[currentStep - 1]?.title}</h3>
            <p className="text-sm text-gray-400">{steps[currentStep - 1]?.description}</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {currentStep}/{steps.length}
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-[#00FF89] to-emerald-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  </div>
)

export default function CreateProductPage() {
  const router = useRouter()
  const { data: sellerProfile, loading: profileLoading } = useSellerProfile()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Check if seller is fully approved (both verification and commission)
  const isVerificationApproved = sellerProfile?.verificationStatus === 'approved'
  const isCommissionAccepted = sellerProfile?.commissionOffer?.status === 'accepted' && sellerProfile?.commissionOffer?.acceptedAt
  const isFullyApproved = isVerificationApproved && isCommissionAccepted

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

  // Enhanced validation with better UX
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

  // Navigate between steps with enhanced UX
  const goToStep = (step) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step)
    } else {
      // Show which fields are missing
      const missingFields = []
      switch (currentStep) {
        case 1:
          if (!formData.title) missingFields.push('Product Title')
          if (!formData.type) missingFields.push('Product Type')
          if (!formData.category) missingFields.push('Category')
          if (!formData.industry) missingFields.push('Industry')
          if (!formData.shortDescription) missingFields.push('Short Description')
          if (!formData.fullDescription) missingFields.push('Full Description')
          break
        case 2:
          if (!formData.targetAudience) missingFields.push('Target Audience')
          if (!formData.benefits[0]) missingFields.push('At least one Benefit')
          if (!formData.useCaseExamples[0]) missingFields.push('At least one Use Case')
          break
        case 3:
          if (formData.toolsUsed.length === 0) missingFields.push('Tools Used')
          if (!formData.setupTime) missingFields.push('Setup Time')
          break
        case 4:
          if (!formData.price) missingFields.push('Price')
          if (!formData.thumbnail) missingFields.push('Thumbnail Image')
          break
      }
      
      if (missingFields.length > 0) {
        toast.error(`Please complete: ${missingFields.join(', ')}`)
      }
    }
  }

  // Show loading while checking profile
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-[#00FF89] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Enhanced restricted access UI
  if (!isFullyApproved) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Almost Ready!</h2>
            <p className="text-gray-400 mb-8">
              Complete your seller approval to start creating amazing products.
            </p>
            
            <div className="space-y-3 mb-8">
              {!isVerificationApproved && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-300 text-sm">Documents under review</p>
                  </div>
                </motion.div>
              )}
              
              {isVerificationApproved && !isCommissionAccepted && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <p className="text-blue-300 text-sm">Accept commission offer to proceed</p>
                  </div>
                </motion.div>
              )}
            </div>
            
            <Link
              href="/seller/profile"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00FF89] to-emerald-500 text-black rounded-xl hover:shadow-lg hover:shadow-[#00FF89]/25 transition-all duration-300 font-semibold"
            >
              <Rocket className="w-5 h-5" />
              Complete Setup
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link
                href="/seller/products"
                className="p-3 hover:bg-gray-800 rounded-xl transition-all duration-300 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Create New Product</h1>
                <p className="text-sm text-gray-400">Share your expertise with the world</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/seller/products')}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !validateStep(5)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FF89] to-emerald-500 text-black rounded-xl hover:shadow-lg hover:shadow-[#00FF89]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Product
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Steps */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-b border-gray-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProgressSteps 
            currentStep={currentStep} 
            steps={FORM_STEPS} 
            onStepClick={goToStep} 
          />
        </div>
      </div>

      {/* Enhanced Form Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-3xl p-8 lg:p-12 shadow-2xl backdrop-blur-sm"
          >
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Lightbulb className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Let's Start with the Basics</h2>
                  <p className="text-gray-400">Tell us about your amazing product</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="lg:col-span-2">
                    <FormInput
                      label="Product Title"
                      required
                      placeholder="e.g., AI-Powered Lead Generation System"
                      value={formData.title}
                      onChange={(value) => handleInputChange('title', value)}
                      icon={Sparkles}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                      <Target className="w-4 h-4" />
                      Product Type <span className="text-[#00FF89]">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {PRODUCT_TYPES.map((type) => (
                        <motion.button
                          key={type.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('type', type.value)}
                          className={`
                            relative p-6 border rounded-2xl text-left transition-all duration-300
                            ${formData.type === type.value
                              ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] shadow-lg shadow-[#00FF89]/20'
                              : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                            }
                          `}
                        >
                          {formData.type === type.value && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-[#00FF89] rounded-full flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-4 h-4 text-black" />
                            </motion.div>
                          )}
                          <div className="text-3xl mb-3">{type.icon}</div>
                          <h3 className={`font-bold mb-2 ${formData.type === type.value ? 'text-white' : 'text-gray-300'}`}>
                            {type.label}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3">{type.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {type.features.map((feature, index) => (
                              <span 
                                key={index}
                                className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <FormSelect
                    label="Category"
                    required
                    value={formData.category}
                    onChange={(value) => handleInputChange('category', value)}
                    options={CATEGORIES}
                    placeholder="Select category"
                    icon={Tag}
                  />
                  
                  <FormSelect
                    label="Industry"
                    required
                    value={formData.industry}
                    onChange={(value) => handleInputChange('industry', value)}
                    options={INDUSTRIES}
                    placeholder="Select industry"
                    icon={Users}
                  />

                  <div className="lg:col-span-2">
                    <FormTextarea
                      label="Short Description"
                      required
                      placeholder="Brief overview of your product (elevator pitch)"
                      value={formData.shortDescription}
                      onChange={(value) => handleInputChange('shortDescription', value)}
                      rows={2}
                      maxLength={200}
                      description="This appears in search results and product cards"
                      icon={Eye}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <FormTextarea
                      label="Full Description"
                      required
                      placeholder="Detailed description of your product, features, and value proposition..."
                      value={formData.fullDescription}
                      onChange={(value) => handleInputChange('fullDescription', value)}
                      rows={6}
                      description="Comprehensive product description for the product page"
                      icon={FileText}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Product Details */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Target className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Product Details</h2>
                  <p className="text-gray-400">Define your product's value and benefits</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="lg:col-span-2">
                    <FormInput
                      label="Target Audience"
                      required
                      placeholder="e.g., SaaS founders, E-commerce store owners, Digital marketers"
                      value={formData.targetAudience}
                      onChange={(value) => handleInputChange('targetAudience', value)}
                      icon={Users}
                      description="Who will benefit most from this product?"
                    />
                  </div>

                  {/* Enhanced Benefits Section */}
                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                      <TrendingUp className="w-4 h-4" />
                      Key Benefits <span className="text-[#00FF89]">*</span>
                    </label>
                    <div className="space-y-3">
                      {formData.benefits.map((benefit, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={benefit}
                              onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                              placeholder="e.g., Save 10+ hours per week"
                              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                            />
                          </div>
                          {formData.benefits.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeArrayFieldItem('benefits', index)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2"
                            >
                              <X className="w-5 h-5" />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addArrayFieldItem('benefits')}
                        className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Benefit
                      </motion.button>
                    </div>
                  </div>

                  {/* Enhanced Use Cases Section */}
                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                      <Lightbulb className="w-4 h-4" />
                      Use Case Examples <span className="text-[#00FF89]">*</span>
                    </label>
                    <div className="space-y-3">
                      {formData.useCaseExamples.map((useCase, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                            💡
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={useCase}
                              onChange={(e) => handleArrayFieldChange('useCaseExamples', index, e.target.value)}
                              placeholder="e.g., Qualifying leads from website forms"
                              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                            />
                          </div>
                          {formData.useCaseExamples.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeArrayFieldItem('useCaseExamples', index)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2"
                            >
                              <X className="w-5 h-5" />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addArrayFieldItem('useCaseExamples')}
                        className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60"
                      >
                        <Plus className="w-4 h-4" />
                        Add Use Case
                      </motion.button>
                    </div>
                  </div>

                  {/* Enhanced How It Works Section */}
                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                      <Zap className="w-4 h-4" />
                      How It Works (Step-by-step)
                    </label>
                    <div className="space-y-3">
                      {formData.howItWorks.map((step, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={step}
                              onChange={(e) => handleArrayFieldChange('howItWorks', index, e.target.value)}
                              placeholder="Describe this step..."
                              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeArrayFieldItem('howItWorks', index)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addArrayFieldItem('howItWorks')}
                        className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60"
                      >
                        <Plus className="w-4 h-4" />
                        Add Step
                      </motion.button>
                    </div>
                  </div>

                  {/* Enhanced Outcomes Section */}
                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                      <TrendingUp className="w-4 h-4" />
                      Expected Outcomes (KPIs)
                    </label>
                    <div className="space-y-3">
                      {formData.outcome.map((outcome, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-2">
                            📈
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={outcome}
                              onChange={(e) => handleArrayFieldChange('outcome', index, e.target.value)}
                              placeholder="e.g., 50% increase in lead conversion"
                              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeArrayFieldItem('outcome', index)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-2"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addArrayFieldItem('outcome')}
                        className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60"
                      >
                        <Plus className="w-4 h-4" />
                        Add Outcome
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">What measurable results can users expect?</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Technical Details */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Technical Specifications</h2>
                  <p className="text-gray-400">Define the tools and setup requirements</p>
                </div>
                
                <div className="space-y-8">
                  {/* Enhanced Tools Selection */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-6">
                      <Zap className="w-4 h-4" />
                      Tools & Platforms Used <span className="text-[#00FF89]">*</span>
                    </label>
                    
                    <div className="space-y-8">
                      {/* AI Tools */}
                      <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6">
                        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          🤖 AI Tools
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {TOOLS.slice(0, 4).map((tool) => (
                            <ToolButton key={tool.value} tool={tool} formData={formData} handleInputChange={handleInputChange} />
                          ))}
                        </div>
                      </div>
                      
                      {/* Automation Tools */}
                      <div className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-2xl p-6">
                        <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          ⚡ Automation Platforms
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {TOOLS.slice(4, 8).map((tool) => (
                            <ToolButton key={tool.value} tool={tool} formData={formData} handleInputChange={handleInputChange} />
                          ))}
                        </div>
                      </div>
                      
                      {/* No-Code Tools */}
                      <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-6">
                        <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          🚀 No-Code Platforms
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {TOOLS.slice(8, 12).map((tool) => (
                            <ToolButton key={tool.value} tool={tool} formData={formData} handleInputChange={handleInputChange} />
                          ))}
                        </div>
                      </div>
                      
                      {/* Business Tools */}
                      <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6">
                        <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          💼 Business & Communication
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {TOOLS.slice(12).map((tool) => (
                            <ToolButton key={tool.value} tool={tool} formData={formData} handleInputChange={handleInputChange} />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Selected Tools Details */}
                    {formData.toolsUsed.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 space-y-4"
                      >
                        <h4 className="text-lg font-semibold text-white mb-4">Selected Tools Configuration</h4>
                        {formData.toolsUsed.map((tool, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-2xl">{TOOLS.find(t => t.label === tool.name)?.logo}</span>
                              <h5 className="font-semibold text-white">{tool.name}</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormInput
                                label="Version/Model"
                                placeholder="e.g., GPT-4, Pro Plan"
                                value={tool.model || ''}
                                onChange={(value) => {
                                  const updated = [...formData.toolsUsed]
                                  updated[index] = { ...updated[index], model: value }
                                  handleInputChange('toolsUsed', updated)
                                }}
                              />
                              <FormInput
                                label="Tool Link (Optional)"
                                type="url"
                                placeholder="https://..."
                                value={tool.link || ''}
                                onChange={(value) => {
                                  const updated = [...formData.toolsUsed]
                                  updated[index] = { ...updated[index], link: value }
                                  handleInputChange('toolsUsed', updated)
                                }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Enhanced Setup Time */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                      <Clock className="w-4 h-4" />
                      Setup Time Estimate <span className="text-[#00FF89]">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {SETUP_TIMES.map((time) => (
                        <motion.button
                          key={time.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('setupTime', time.value)}
                          className={`
                            relative p-4 border rounded-2xl transition-all duration-300 text-center
                            ${formData.setupTime === time.value
                              ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] text-white shadow-lg shadow-[#00FF89]/20'
                              : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/70'
                            }
                          `}
                        >
                          {formData.setupTime === time.value && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-[#00FF89] rounded-full flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-4 h-4 text-black" />
                            </motion.div>
                          )}
                          <Clock className="w-6 h-6 mx-auto mb-2" />
                          <p className="font-medium">{time.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Delivery Method */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                      <Upload className="w-4 h-4" />
                      Delivery Method
                    </label>
                    <div className="space-y-4">
                      <motion.label 
                        whileHover={{ scale: 1.01 }}
                        className={`
                          flex items-start gap-4 p-6 border rounded-2xl cursor-pointer transition-all duration-300
                          ${formData.deliveryMethod === 'link'
                            ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] shadow-lg shadow-[#00FF89]/20'
                            : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="link"
                          checked={formData.deliveryMethod === 'link'}
                          onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                          className="mt-1 w-5 h-5 text-[#00FF89] bg-gray-800 border-gray-600 focus:ring-[#00FF89] focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                              🔗
                            </div>
                            <h3 className="font-semibold text-white">External Link</h3>
                          </div>
                          <p className="text-sm text-gray-400">Provide a link to Notion, Make, Zapier, or any external platform</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">Most Common</span>
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">Easy Setup</span>
                          </div>
                        </div>
                      </motion.label>
                      
                      <motion.label 
                        whileHover={{ scale: 1.01 }}
                        className={`
                          flex items-start gap-4 p-6 border rounded-2xl cursor-pointer transition-all duration-300
                          ${formData.deliveryMethod === 'file'
                            ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] shadow-lg shadow-[#00FF89]/20'
                            : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="file"
                          checked={formData.deliveryMethod === 'file'}
                          onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                          className="mt-1 w-5 h-5 text-[#00FF89] bg-gray-800 border-gray-600 focus:ring-[#00FF89] focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                              📁
                            </div>
                            <h3 className="font-semibold text-white">File Download</h3>
                          </div>
                          <p className="text-sm text-gray-400">Upload files (templates, documents, code) for users to download</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">Offline Access</span>
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">Templates</span>
                          </div>
                        </div>
                      </motion.label>
                      
                      <motion.label 
                        whileHover={{ scale: 1.01 }}
                        className={`
                          flex items-start gap-4 p-6 border rounded-2xl cursor-pointer transition-all duration-300
                          ${formData.deliveryMethod === 'instructions'
                            ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] shadow-lg shadow-[#00FF89]/20'
                            : 'bg-gray-900/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="instructions"
                          checked={formData.deliveryMethod === 'instructions'}
                          onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                          className="mt-1 w-5 h-5 text-[#00FF89] bg-gray-800 border-gray-600 focus:ring-[#00FF89] focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                              📋
                            </div>
                            <h3 className="font-semibold text-white">Instructions Only</h3>
                          </div>
                          <p className="text-sm text-gray-400">Provide detailed setup instructions and guidance</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">Educational</span>
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">Step-by-step</span>
                          </div>
                        </div>
                      </motion.label>
                    </div>

                    {/* Conditional Input for Link */}
                    {formData.deliveryMethod === 'link' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6"
                      >
                        <FormInput
                          label="Product Access Link"
                          type="url"
                          placeholder="https://notion.so/your-template or https://zapier.com/shared/..."
                          value={formData.embedLink}
                          onChange={(value) => handleInputChange('embedLink', value)}
                          description="Users will receive this link after purchase"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pricing & Media */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <DollarSign className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Pricing & Media</h2>
                  <p className="text-gray-400">Set your price and showcase your product</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Enhanced Pricing Section */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Pricing Strategy
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <FormInput
                            label="Price (USD)"
                            required
                            type="number"
                            placeholder="29.99"
                            value={formData.price}
                            onChange={(value) => handleInputChange('price', value)}
                            description="Your product's selling price"
                          />
                        </div>
                        <div>
                          <FormInput
                            label="Original Price (Optional)"
                            type="number"
                            placeholder="49.99"
                            value={formData.originalPrice}
                            onChange={(value) => handleInputChange('originalPrice', value)}
                            description="Show discount if this is higher than price"
                          />
                        </div>
                      </div>
                      {formData.originalPrice && formData.price && parseFloat(formData.originalPrice) > parseFloat(formData.price) && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                        >
                          <p className="text-green-300 text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            {Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}% discount - Great for attracting customers!
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Media Section */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Image className="w-5 h-5" />
                        Product Media
                      </h3>
                      
                      {/* Thumbnail */}
                      <div className="mb-6">
                        <FormInput
                          label="Thumbnail Image"
                          required
                          type="url"
                          placeholder="https://example.com/thumbnail.jpg"
                          value={formData.thumbnail}
                          onChange={(value) => handleInputChange('thumbnail', value)}
                          description="Main image shown in product listings (1200x800px recommended)"
                          icon={Image}
                        />
                        {formData.thumbnail && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4"
                          >
                            <img 
                              src={formData.thumbnail} 
                              alt="Thumbnail preview" 
                              className="w-full max-w-sm h-48 object-cover rounded-xl border border-gray-700"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </motion.div>
                        )}
                      </div>

                      {/* Additional Images */}
                      <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                          <Image className="w-4 h-4" />
                          Additional Images (Optional)
                        </label>
                        <div className="space-y-3">
                          {formData.images.map((image, index) => (
                            <motion.div 
                              key={index} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex gap-3"
                            >
                              <div className="flex-1">
                                <input
                                  type="url"
                                  value={image}
                                  onChange={(e) => handleArrayFieldChange('images', index, e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                                />
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeArrayFieldItem('images', index)}
                                className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </motion.button>
                            </motion.div>
                          ))}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addArrayFieldItem('images')}
                            className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60"
                          >
                            <Plus className="w-4 h-4" />
                            Add Image
                          </motion.button>
                        </div>
                      </div>

                      {/* Preview Video */}
                      <div>
                        <FormInput
                          label="Preview Video (Optional)"
                          type="url"
                          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                          value={formData.previewVideo}
                          onChange={(value) => handleInputChange('previewVideo', value)}
                          description="Video showcasing your product in action"
                          icon={Video}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Launch Settings */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Rocket className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Ready to Launch?</h2>
                  <p className="text-gray-400">Final settings and optimizations</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* SEO & Discovery */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        SEO & Discovery
                      </h3>
                      
                      {/* Tags */}
                      <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                          <Tag className="w-4 h-4" />
                          Product Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.tags.map((tag, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#00FF89]/10 text-[#00FF89] rounded-full border border-[#00FF89]/20"
                            >
                              {tag}
                              <button
                                onClick={() => removeArrayFieldItem('tags', index)}
                                className="hover:text-red-400 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Add tags (press Enter)..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              e.preventDefault()
                              handleInputChange('tags', [...formData.tags, e.target.value.trim()])
                              e.target.value = ''
                            }
                          }}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all duration-300"
                        />
                        <p className="text-xs text-gray-500 mt-1">Add relevant keywords to help users find your product</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <FormInput
                      label="Estimated Hours Saved"
                      placeholder="e.g., 10+ hours per week"
                      value={formData.estimatedHoursSaved}
                      onChange={(value) => handleInputChange('estimatedHoursSaved', value)}
                      description="Time savings users can expect"
                      icon={Clock}
                    />
                  </div>
                  
                  <div>
                    <FormInput
                      label="Metrics Impacted"
                      placeholder="e.g., Lead conversion rate, Response time"
                      value={formData.metricsImpacted}
                      onChange={(value) => handleInputChange('metricsImpacted', value)}
                      description="Business metrics this product improves"
                      icon={TrendingUp}
                    />
                  </div>

                  {/* Usage Frequency */}
                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                      <Clock className="w-4 h-4" />
                      Frequency of Use
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {['one-time', 'weekly', 'ongoing'].map((freq) => (
                        <motion.button
                          key={freq}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('frequencyOfUse', freq)}
                          className={`
                            p-4 border rounded-2xl capitalize transition-all duration-300 text-center
                            ${formData.frequencyOfUse === freq
                              ? 'bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 border-[#00FF89] text-white'
                              : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/70'
                            }
                          `}
                        >
                          {freq.replace('-', ' ')}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Support & FAQs */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Support & Documentation
                      </h3>
                      
                      {/* Expected Support */}
                      <div className="mb-6">
                        <FormTextarea
                          label="Expected Updates or Support"
                          placeholder="Describe any ongoing support or updates you'll provide..."
                          value={formData.expectedSupport}
                          onChange={(value) => handleInputChange('expectedSupport', value)}
                          rows={3}
                          description="Let users know what kind of support they can expect"
                        />
                      </div>

                      {/* FAQs */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                          <MessageSquare className="w-4 h-4" />
                          Frequently Asked Questions
                        </label>
                        <div className="space-y-4">
                          {formData.faqs.map((faq, index) => (
                            <motion.div 
                              key={index} 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gray-900/50 border border-gray-700 rounded-xl p-4"
                            >
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={faq.question}
                                  onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                  placeholder="What's the question?"
                                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89]"
                                />
                                <textarea
                                  value={faq.answer}
                                  onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                  placeholder="Provide a helpful answer..."
                                  rows={2}
                                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF89] resize-none"
                                />
                              </div>
                              {formData.faqs.length > 1 && (
                                <button
                                  onClick={() => removeArrayFieldItem('faqs', index)}
                                  className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Remove FAQ
                                </button>
                              )}
                            </motion.div>
                          ))}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleInputChange('faqs', [...formData.faqs, { question: '', answer: '' }])}
                            className="inline-flex items-center gap-2 px-4 py-3 text-[#00FF89] hover:bg-[#00FF89]/10 rounded-xl transition-all duration-300 border border-dashed border-[#00FF89]/30 hover:border-[#00FF89]/60"
                          >
                            <Plus className="w-4 h-4" />
                            Add FAQ
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Affiliate Tools Checkbox */}
                  <div className="lg:col-span-2">
                    <motion.label 
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-700 rounded-xl cursor-pointer hover:border-gray-600 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.hasAffiliateTools}
                        onChange={(e) => handleInputChange('hasAffiliateTools', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-[#00FF89] focus:ring-[#00FF89] focus:ring-2"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">This product uses affiliate tools</p>
                        <p className="text-sm text-gray-400">Check this if your product includes affiliate links or referral codes</p>
                      </div>
                    </motion.label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Navigation */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-3 px-8 py-4 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl border border-gray-700 hover:border-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </motion.button>
          
          {currentStep < 5 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToStep(currentStep + 1)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00FF89] to-emerald-500 text-black rounded-xl hover:shadow-lg hover:shadow-[#00FF89]/25 transition-all duration-300 font-semibold"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Launch Product
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
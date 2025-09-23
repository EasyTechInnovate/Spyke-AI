'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Code, CheckCircle, XCircle, Copy, FileJson, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { generateProduct } from '@/utils/productGenerator'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
const SAMPLE_PRODUCT = {
  title: "AI-Powered Lead Generation System",
  type: "automation",
  category: "lead_generation",
  industry: "saas",
  shortDescription: "Automate your lead generation with AI-powered tools",
  fullDescription: "This comprehensive automation solution helps businesses generate qualified leads using AI. The system integrates ChatGPT with automation tools to create a seamless lead qualification process.",
  targetAudience: "SaaS companies, B2B marketers, Sales teams",
  benefits: [
    "Save 10+ hours per week",
    "3x higher conversion rates",
    "24/7 automated lead engagement"
  ],
  useCaseExamples: [
    "Qualifying leads from website forms",
    "Automated follow-up sequences",
    "Lead scoring and prioritization"
  ],
  howItWorks: [
    "Connect your lead sources",
    "AI analyzes and qualifies leads",
    "Automated personalized outreach",
    "Track and optimize results"
  ],
  outcome: [
    "50% increase in qualified leads",
    "80% reduction in manual work"
  ],
  toolsUsed: [
    {
      name: "ChatGPT",
      model: "GPT-4",
      logo: "https://placehold.co/40x40/1f1f1f/808080?text=C"
    },
    {
      name: "Zapier",
      logo: "https://placehold.co/40x40/1f1f1f/808080?text=Z"
    }
  ],
  setupTime: "under_1_hour",
  deliveryMethod: "link",
  embedLink: "https://example.com/template",
  price: 99,
  originalPrice: 199,
  thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
  ],
  previewVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  tags: ["automation", "lead-generation", "ai", "chatgpt"],
  searchKeywords: ["lead generation", "automation", "ai sales"],
  estimatedHoursSaved: "10+ hours/week",
  metricsImpacted: "Lead conversion rate, Response time",
  frequencyOfUse: "ongoing",
  hasAffiliateTools: false,
  expectedSupport: "Email support within 24 hours",
  faqs: [
    {
      question: "How long does setup take?",
      answer: "Setup typically takes 30-60 minutes with our guide"
    },
    {
      question: "Do I need coding skills?",
      answer: "No coding required! Everything is no-code"
    }
  ]
}
export default function AddProductJsonPage() {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
  const router = useRouter()
  const [jsonInput, setJsonInput] = useState('')
  const [isValidJson, setIsValidJson] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const validateJson = (input) => {
    if (!input.trim()) {
      setIsValidJson(null)
      setParsedData(null)
      setValidationErrors([])
      return
    }
    try {
      const parsed = JSON.parse(input)
      setParsedData(parsed)
      setIsValidJson(true)
      const errors = []
      if (!parsed.title) errors.push('Title is required')
      if (!parsed.type) errors.push('Type is required')
      if (!parsed.category) errors.push('Category is required')
      if (!parsed.industry) errors.push('Industry is required')
      if (!parsed.shortDescription) errors.push('Short description is required')
      if (!parsed.fullDescription) errors.push('Full description is required')
      if (!parsed.price && parsed.price !== 0) errors.push('Price is required')
      if (!parsed.thumbnail) errors.push('Thumbnail is required')
      if (!parsed.toolsUsed || !Array.isArray(parsed.toolsUsed) || parsed.toolsUsed.length === 0) {
        errors.push('At least one tool is required')
      }
      if (!parsed.setupTime) errors.push('Setup time is required')
      setValidationErrors(errors)
    } catch (e) {
      setIsValidJson(false)
      setParsedData(null)
      setValidationErrors(['Invalid JSON format'])
    }
  }
  const handleSubmit = async () => {
    if (!parsedData || validationErrors.length > 0) {
      showMessage('Please fix validation errors before submitting', 'error')
      return
    }
    try {
      setIsSubmitting(true)
      const productData = {
        ...parsedData,
        benefits: parsedData.benefits?.filter(b => b) || [],
        useCaseExamples: parsedData.useCaseExamples?.filter(u => u) || [],
        howItWorks: parsedData.howItWorks?.filter(h => h) || [],
        outcome: parsedData.outcome?.filter(o => o) || [],
        images: parsedData.images?.filter(i => i) || [],
        tags: parsedData.tags?.filter(t => t) || [],
        searchKeywords: parsedData.searchKeywords?.filter(k => k) || [],
        faqs: parsedData.faqs?.filter(f => f.question && f.answer) || [],
        price: parseFloat(parsedData.price),
        originalPrice: parsedData.originalPrice ? parseFloat(parsedData.originalPrice) : undefined,
        toolsUsed: parsedData.toolsUsed?.map(tool => {
          const cleanTool = { name: tool.name }
          if (tool.logo) cleanTool.logo = tool.logo
          if (tool.model) cleanTool.model = tool.model
          if (tool.link) cleanTool.link = tool.link
          return cleanTool
        }) || []
      }
      const response = await productsAPI.createProduct(productData)
      if (response.data) {
        showMessage('Product created successfully!', 'success')
        router.push('/seller/products')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
          showMessage('${err.field}: ${err.message}', 'error')
        })
      } else {
        showMessage(error.message || 'Failed to create product', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  const copySampleJson = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_PRODUCT, null, 2))
    showMessage('Sample JSON copied to clipboard!', 'success')
  }
  const loadSampleJson = () => {
    const sampleJson = JSON.stringify(SAMPLE_PRODUCT, null, 2)
    setJsonInput(sampleJson)
    validateJson(sampleJson)
  }
  const generateRandomProduct = () => {
    const randomProduct = generateProduct()
    const randomJson = JSON.stringify(randomProduct, null, 2)
    setJsonInput(randomJson)
    validateJson(randomJson)
    showMessage('Random product generated!', 'success')
  }
  return (
    <div className="min-h-screen bg-black">
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}
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
              <div className="flex items-center gap-2">
                <FileJson className="w-6 h-6 text-brand-primary" />
                <h1 className="text-xl font-semibold text-white">Add Product via JSON</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copySampleJson}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Sample</span>
              </button>
              <button
                onClick={loadSampleJson}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Load Sample</span>
              </button>
              <button
                onClick={generateRandomProduct}
                className="inline-flex items-center gap-2 px-4 py-2 text-brand-primary hover:text-white hover:bg-brand-primary/10 border border-brand-primary/50 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Generate Random</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !isValidJson || validationErrors.length > 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-primary-text rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span className="font-medium">
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-brand-primary" />
                  JSON Input
                </h2>
                {isValidJson !== null && (
                  <div className="flex items-center gap-2">
                    {isValidJson ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-500">Valid JSON</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-500">Invalid JSON</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value)
                  validateJson(e.target.value)
                }}
                placeholder="Paste your product JSON here..."
                className="w-full h-[600px] px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-brand-primary resize-none"
                spellCheck={false}
              />
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Required Fields:</h3>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                  <li>title, type, category, industry</li>
                  <li>shortDescription, fullDescription</li>
                  <li>price, thumbnail, setupTime</li>
                  <li>toolsUsed (array with at least one tool)</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
              >
                <h3 className="text-sm font-medium text-red-500 mb-2">Validation Errors:</h3>
                <ul className="text-sm text-red-400 space-y-1 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </motion.div>
            )}
            {parsedData && validationErrors.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4">Product Preview</h2>
                <div className="space-y-4">
                  {parsedData.thumbnail && (
                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={parsedData.thumbnail}
                        alt={parsedData.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/800x600/1f1f1f/808080?text=Invalid+Image+URL'
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{parsedData.title}</h3>
                    <p className="text-gray-400">{parsedData.shortDescription}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                      {parsedData.type}
                    </span>
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                      {parsedData.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                      {parsedData.industry}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand-primary">
                      ${parsedData.price}
                    </span>
                    {parsedData.originalPrice && (
                      <span className="text-gray-500 line-through">
                        ${parsedData.originalPrice}
                      </span>
                    )}
                  </div>
                  {parsedData.toolsUsed && parsedData.toolsUsed.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Tools Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedData.toolsUsed.map((tool, index) => (
                          <span key={index} className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm">
                            {tool.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Sample JSON Structure:</h3>
              <pre className="text-xs text-gray-500 overflow-x-auto">
{`{
  "title": "Product Title",
  "type": "prompt|automation|agent",
  "category": "lead_generation|sales|marketing|...",
  "industry": "saas|ecommerce|healthcare|...",
  "shortDescription": "Brief description",
  "fullDescription": "Detailed description",
  "targetAudience": "Target audience",
  "benefits": ["Benefit 1", "Benefit 2"],
  "toolsUsed": [
    {
      "name": "Tool Name",
      "logo": "https://...",
      "model": "Optional model",
      "link": "Optional link"
    }
  ],
  "setupTime": "instant|under_30_mins|...",
  "price": 99.99,
  "thumbnail": "https://..."
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
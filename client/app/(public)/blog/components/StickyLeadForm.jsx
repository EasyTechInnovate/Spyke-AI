'use client'
import { useState } from 'react'
import { Send, Phone as PhoneIcon, FileText, Mail, User, Check, AlertCircle } from 'lucide-react'

// Rewritten to match Contact Us form styling & behavior
export default function StickyLeadForm({ blogPostSlug }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    needs: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('')

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1B_Sx1P0G1tKcH1Wo6z8sdd9ntsbtVKFZm8VUIptauQSgsKoUjHwl0IZrurMqEDzkHw/exec'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!formData.name.trim()) return 'Name is required'
    if (!formData.email.trim()) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return 'Invalid email format'
    if (!formData.needs.trim()) return 'Please describe your needs'
    if (formData.phone && formData.phone.replace(/\D/g, '').length > 0 && formData.phone.replace(/\D/g, '').length < 6) return 'Phone number looks too short'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    setErrorMessage('')
    const validationError = validate()
    if (validationError) {
      setStatus('error')
      setErrorMessage(validationError)
      return
    }
    setIsSubmitting(true)
    try {
      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwGXS9zXj-xCDRiYpIsXb-VwASflTeA__ZLmEPgG4PUbkFA66Br5pFhB6N12dzmiPXuDg/exec'

      // Create JSON payload matching your Google Apps Script
      const payload = {
        Name: formData.name,
        Email: formData.email,
        Phone: formData.phone || '',
        Needs: formData.needs,
        BlogSlug: blogPostSlug || ''
      }

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      setStatus('success')
      setFormData({ name: '', email: '', phone: '', needs: '' })
      if (typeof window !== 'undefined' && window.spykeAnalytics) {
        window.spykeAnalytics.trackEvent('Blog Lead Submitted', { blogPostSlug })
      }
    } catch (err) {
      console.error('Blog sticky lead submit error:', err)
      setStatus('error')
      setErrorMessage('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
      // Auto clear success after a delay
      setTimeout(() => {
        if (status === 'success') setStatus(null)
      }, 5000)
    }
  }

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 w-80">
      <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <h3 className="text-xl font-bold font-league-spartan text-white mb-1">Request Automation</h3>
        <p className="text-sm text-gray-400 mb-6">Tell us what you need and we will reach out.</p>

        {status === 'success' && (
          <div className="mb-5 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-2">
            <Check className="w-4 h-4 text-green-400 mt-0.5" />
            <p className="text-xs text-green-300 leading-relaxed">Submitted! We will reach out soon.</p>
          </div>
        )}
        {status === 'error' && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">{errorMessage || 'Something went wrong. Try again.'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1" htmlFor="blog-lead-name">Name<span className="text-red-400"> *</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="blog-lead-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent"
                placeholder="Your full name"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1" htmlFor="blog-lead-email">Email<span className="text-red-400"> *</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="blog-lead-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1" htmlFor="blog-lead-phone">Phone<span className="text-gray-500"> (optional)</span></label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="blog-lead-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent"
                placeholder="Phone number"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1" htmlFor="blog-lead-needs">Describe Your Needs<span className="text-red-400"> *</span></label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <textarea
                id="blog-lead-needs"
                name="needs"
                value={formData.needs}
                onChange={handleChange}
                required
                rows={4}
                className="w-full pl-9 pr-3 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent resize-none"
                placeholder="What are you trying to automate or build?"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF89] text-black font-semibold rounded-lg hover:bg-[#00FF89]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        </form>
        <div className="mt-5 text-[10px] text-gray-500 space-y-1 text-center">
          <p>No spam. We respect your privacy.</p>
          {blogPostSlug && <p>Context: {blogPostSlug}</p>}
        </div>
      </div>
    </div>
  )
}
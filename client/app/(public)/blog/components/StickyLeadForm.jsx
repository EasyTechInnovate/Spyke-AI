'use client'
import { useState } from 'react'
import { Send, User, Mail, FileText } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import InlineNotification from '@/components/shared/notifications/InlineNotification'

export default function StickyLeadForm({ blogPostSlug }) {
  const [notification, setNotification] = useState(null)
  const showMessage = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }
  const clearNotification = () => setNotification(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    needs: ''
  })
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return showMessage('Please enter your name', 'error')
    if (!formData.email.trim()) return showMessage('Please enter your email', 'error')
    if (!validateEmail(formData.email)) return showMessage('Invalid email format', 'error')
    if (!formData.needs.trim()) return showMessage('Please tell us your needs', 'error')
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 6) return showMessage('Phone looks too short', 'error')

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
      showMessage('Submitted! We will reach out soon.', 'success')
      if (typeof window !== 'undefined' && window.spykeAnalytics) {
        window.spykeAnalytics.trackEvent('Blog Lead Submitted', { blogPostSlug })
      }
      setFormData({ name: '', email: '', phone: '', needs: '' })
    } catch (err) {
      console.error('Sticky form error:', err)
      showMessage('Submission failed. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <>
      {notification && (
        <div className="fixed top-4 right-4 z-[60]">
          <InlineNotification
            type={notification.type}
            message={notification.message}
            onDismiss={clearNotification}
          />
        </div>
      )}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 w-80">
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
          <div className="mb-6">
            <h3 className="font-league-spartan font-bold text-lg text-white">Get Custom Automation</h3>
            <p className="text-sm text-gray-400">Tell us what you need</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="name"
                placeholder="Your Name *"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-gray-400"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                placeholder="Your Email *"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-gray-400"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                placeholder="Phone (optional)"
                className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-gray-400"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                name="needs"
                placeholder="Describe your needs *"
                rows={4}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-gray-400 resize-none"
                value={formData.needs}
                onChange={handleInputChange}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-brand-primary-text border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </form>
          <div className="mt-4 text-xs text-gray-400 text-center space-y-1">
            <p>✓ Fast response</p>
            <p>✓ No spam, ever</p>
            <p>✓ We respect your privacy</p>
          </div>
        </div>
      </div>
    </>
  )
}
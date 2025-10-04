'use client'
import { useState } from 'react'
import { Send, User, Mail, Phone } from 'lucide-react'
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
    description: ''
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
    if (!formData.name.trim()) {
      showMessage('Please enter your name', 'error')
      return
    }
    if (!formData.email.trim()) {
      showMessage('Please enter your email address', 'error')
      return
    }
    if (!validateEmail(formData.email)) {
      showMessage('Please enter a valid email address', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
      const useGoogleSheets = !GOOGLE_SHEETS_URL.includes('YOUR_DEPLOYMENT_ID')
      if (useGoogleSheets) {
        await fetch(GOOGLE_SHEETS_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || '',
            description: formData.description || '',
            source: 'blog_chat_form',
            blogPost: blogPostSlug || '',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
          })
        })
        showMessage("Thank you! We'll be in touch within 24 hours.", 'success')
      } else {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            source: 'sticky_form',
            blogPostSlug
          })
        })
        if (response.ok) {
          showMessage("Thank you! We'll be in touch soon.", 'success')
        } else {
          const error = await response.json()
          showMessage(error.error || 'Something went wrong. Please try again.', 'error')
        }
      }
      setFormData({ name: '', email: '', phone: '', description: '' })
    } catch (error) {
      console.error('Error submitting form:', error)
      showMessage('Something went wrong. Please try again or contact us directly.', 'error')
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
            <p className="text-sm text-gray-400">Let's discuss your needs</p>
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
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-gray-400"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <textarea
                name="description"
                placeholder="Tell us about your automation needs..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-gray-400 resize-none"
                value={formData.description}
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
                  Get Free Consultation
                </>
              )}
            </Button>
          </form>
          <div className="mt-4 text-xs text-gray-400 text-center space-y-1">
            <p>✓ Free consultation</p>
            <p>✓ No spam, ever</p>
            <p>✓ Response within 24 hours</p>
          </div>
        </div>
      </div>
    </>
  )
}
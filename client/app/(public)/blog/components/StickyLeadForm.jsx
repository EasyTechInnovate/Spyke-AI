'use client'

import { useState } from 'react'
import { X, Send, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import InlineNotification from '@/components/shared/notifications/InlineNotification'

export default function StickyLeadForm({ blogPostSlug }) {
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

  const [isOpen, setIsOpen] = useState(false)
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
    
    // Validation
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
      // Replace this URL with your Google Sheets Web App URL
      // To set up: Create a Google Apps Script, deploy as web app, and replace the URL below
      const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
      
      // Fallback to existing API if Google Sheets URL is not configured
      const useGoogleSheets = !GOOGLE_SHEETS_URL.includes('YOUR_DEPLOYMENT_ID')
      
      if (useGoogleSheets) {
        const response = await fetch(GOOGLE_SHEETS_URL, {
          method: 'POST',
          mode: 'no-cors', // Required for Google Apps Script
          headers: {
            'Content-Type': 'application/json',
          },
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
          }),
        })

        // Since we're using no-cors mode, we can't read the response
        // We'll assume success if no error was thrown
        showMessage('Thank you! We\'ll be in touch within 24 hours.', 'success')
      } else {
        // Fallback to existing API
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            source: 'sticky_form',
            blogPostSlug
          }),
        })

        if (response.ok) {
          showMessage('Thank you! We\'ll be in touch soon.', 'success')
        } else {
          const error = await response.json()
          showMessage(error.error || 'Something went wrong. Please try again.', 'error')
        }
      }
      
      setFormData({ name: '', email: '', phone: '', description: '' })
      
      // Auto-close form after successful submission
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)

    } catch (error) {
      console.error('Error submitting form:', error)
      showMessage('Something went wrong. Please try again or contact us directly.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Inline Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[60]">
          <InlineNotification
            type={notification.type}
            message={notification.message}
            onDismiss={clearNotification}
          />
        </div>
      )}

      {/* Trigger Button */}
      {!isOpen && (
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-full group"
            aria-label="Get custom automation consultation"
          >
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      )}

      {/* Form Panel */}
      {isOpen && (
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 w-80">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-league-spartan font-bold text-lg text-white">
                  Get Custom Automation
                </h3>
                <p className="text-sm text-gray-400">
                  Let's discuss your needs
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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

              {/* Phone */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (Optional)"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-gray-400"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              {/* Description */}
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

              {/* Submit Button */}
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

            {/* Trust Indicators */}
            <div className="mt-4 text-xs text-gray-400 text-center space-y-1">
              <p>✓ Free consultation</p>
              <p>✓ No spam, ever</p>
              <p>✓ Response within 24 hours</p>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
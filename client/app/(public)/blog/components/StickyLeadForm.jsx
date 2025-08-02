'use client'

import { useState } from 'react'
import { X, Send, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { toast } from 'sonner'

export default function StickyLeadForm({ blogPostSlug }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
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
        toast.success('Thank you! We\'ll be in touch soon.')
        setFormData({ name: '', email: '', phone: '', description: '' })
        setIsOpen(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-full"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Form Panel */}
      {isOpen && (
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 w-80">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl p-6">
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
                  placeholder="Your Name"
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
                  placeholder="Your Email"
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
            <div className="mt-4 text-xs text-gray-400 text-center">
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
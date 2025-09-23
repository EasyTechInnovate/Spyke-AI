'use client'
import { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function NewsletterCTA({ blogPostSlug }) {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'blog',
          blogPostSlug
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setIsSubscribed(true)
        showMessage('Successfully subscribed! Check your email for confirmation.', 'success')
        setEmail('')
      } else {
        showMessage(data.error || 'Something went wrong. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      showMessage('Failed to subscribe. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }
  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-8 border border-brand-primary/20">
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-brand-primary" />
          </div>
          <h3 className="text-2xl font-league-spartan font-bold mb-2">
            You're all set! 🎉
          </h3>
          <p className="text-gray-300">
            Thank you for subscribing. You'll receive weekly AI insights and automation tips directly in your inbox.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-8 border border-brand-primary/20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-brand-primary" />
        </div>
        <h3 className="text-3xl font-league-spartan font-bold mb-4">
          Get Weekly AI Ideas
        </h3>
        <p className="text-gray-300 text-lg mb-8">
          Join 10,000+ entrepreneurs who get actionable AI automation tips, case studies, and exclusive strategies delivered to their inbox every week.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <div className="flex-1 relative">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90 px-8 py-3 disabled:opacity-50 whitespace-nowrap"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-brand-primary-text border-t-transparent rounded-full animate-spin mr-2"></div>
                Subscribing...
              </div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Subscribe Free
              </>
            )}
          </Button>
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-brand-primary" />
            <span>Weekly insights</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-brand-primary" />
            <span>No spam, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-brand-primary" />
            <span>Unsubscribe anytime</span>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Trusted by entrepreneurs from companies like:
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <span>Google</span>
            <span>•</span>
            <span>Microsoft</span>
            <span>•</span>
            <span>Shopify</span>
            <span>•</span>
            <span>Amazon</span>
            <span>•</span>
            <span>Tesla</span>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Share2, Twitter, Linkedin, Facebook, Copy, Check } from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { toast } from 'sonner'

export default function SocialShare({ post }) {
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = post.title
  const shareText = post.summary

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy link')
    }
  }

  const handleShare = (platform) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    setShowOptions(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setShowOptions(!showOptions)}
        className="text-gray-400 hover:text-brand-primary transition-colors"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      {showOptions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowOptions(false)}
          />
          
          {/* Share Options */}
          <div className="absolute top-full right-0 mt-2 bg-[#1f1f1f] border border-white/10 rounded-lg shadow-2xl p-4 z-20 min-w-[200px]">
            <div className="space-y-2">
              {/* Twitter */}
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 rounded-lg transition-colors"
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Share on Twitter</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 rounded-lg transition-colors"
              >
                <Linkedin className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Share on LinkedIn</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 rounded-lg transition-colors"
              >
                <Facebook className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Share on Facebook</span>
              </button>

              {/* Copy Link */}
              <div className="border-t border-white/10 pt-2 mt-2">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-brand-primary" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm">
                    {copied ? 'Copied!' : 'Copy link'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
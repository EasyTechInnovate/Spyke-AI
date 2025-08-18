'use client'

import { useState } from 'react'
import { User, Settings, Bell, CreditCard, HelpCircle } from 'lucide-react'
import { Card, CardHeader, CardContent } from './Cards.jsx'
import { formatLocation } from '@/lib/utils/seller'

export default function SellerIdentity({ seller, verificationStatus }) {
  const [showSettings, setShowSettings] = useState(false)

  const getStatusColor = (type) => {
    switch (type) {
      case 'success': return 'text-emerald-400 bg-emerald-400/20'
      case 'warning': return 'text-amber-400 bg-amber-400/20'
      case 'error': return 'text-red-400 bg-red-400/20'
      case 'info': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-[--text-secondary] bg-white/10'
    }
  }

  return (
    <Card variant="elevated" className="overflow-hidden">
      {/* Profile Header */}
      <CardHeader className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[--brand-primary]/20 via-transparent to-[--brand-secondary]/20"></div>
        
        <div className="relative space-y-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[--brand-primary] to-[--brand-secondary] flex items-center justify-center">
              <User className="w-8 h-8 text-[--brand-accent]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[--text-primary] truncate">
                {seller?.fullName || 'Seller'}
              </h1>
              <p className="text-sm text-[--text-secondary] truncate">
                {seller?.email}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(verificationStatus.type)}`}>
            <div className="w-2 h-2 rounded-full bg-current"></div>
            {verificationStatus.text}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-lg font-bold text-[--text-primary]">
              {seller?.stats?.totalProducts || 0}
            </p>
            <p className="text-xs text-[--text-secondary]">Products</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <p className="text-lg font-bold text-[--text-primary]">
              {(seller?.stats?.averageRating || 0).toFixed(1)}
            </p>
            <p className="text-xs text-[--text-secondary]">Rating</p>
          </div>
        </div>

        {/* Business Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[--text-primary]">Business Info</h3>
          
          <div className="space-y-2 text-sm">
            {seller?.location?.country && (
              <div className="flex justify-between">
                <span className="text-[--text-secondary]">Location</span>
                <span className="text-[--text-primary]">{formatLocation(seller.location)}</span>
              </div>
            )}
            
            {seller?.websiteUrl && (
              <div className="flex justify-between">
                <span className="text-[--text-secondary]">Website</span>
                <a 
                  href={seller.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[--brand-primary] hover:underline truncate max-w-[120px]"
                >
                  {seller.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Specializations */}
        {(seller?.niches?.length > 0 || seller?.toolsSpecialization?.length > 0) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[--text-primary]">Expertise</h3>
            
            {seller?.niches?.length > 0 && (
              <div>
                <p className="text-xs text-[--text-secondary] mb-2">Niches</p>
                <div className="flex flex-wrap gap-1">
                  {seller.niches.slice(0, 3).map((niche, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded bg-[--brand-primary]/20 text-[--brand-primary]"
                    >
                      {niche}
                    </span>
                  ))}
                  {seller.niches.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded bg-white/10 text-[--text-secondary]">
                      +{seller.niches.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {seller?.toolsSpecialization?.length > 0 && (
              <div>
                <p className="text-xs text-[--text-secondary] mb-2">Tools</p>
                <div className="flex flex-wrap gap-1">
                  {seller.toolsSpecialization.slice(0, 2).map((tool, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded bg-blue-400/20 text-blue-400"
                    >
                      {tool}
                    </span>
                  ))}
                  {seller.toolsSpecialization.length > 2 && (
                    <span className="px-2 py-1 text-xs rounded bg-white/10 text-[--text-secondary]">
                      +{seller.toolsSpecialization.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-[--text-secondary] text-sm">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-[--text-secondary] text-sm">
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
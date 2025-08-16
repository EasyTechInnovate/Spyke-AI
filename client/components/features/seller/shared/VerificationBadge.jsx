'use client'
import { Clock, Eye, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import React from 'react'

/**
 * Displays seller verification / commission negotiation status
 * status: pending | under_review | commission_offered | approved | rejected
 */
export default function VerificationBadge({ status, className = '' }) {
  const map = {
    pending: { color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: Clock, text: 'Verification Pending' },
    under_review: { color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: Eye, text: 'Under Review' },
    commission_offered: { color: 'bg-[#00FF89]/20 text-[#00FF89] border-[#00FF89]/30', icon: DollarSign, text: 'Commission Offered' },
    approved: { color: 'bg-green-500/20 text-green-500 border-green-500/30', icon: CheckCircle, text: 'Verified Seller' },
    rejected: { color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: AlertCircle, text: 'Verification Failed' }
  }
  const badge = map[status] || map.pending
  const Icon = badge.icon
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm ${badge.color} ${className}`}>
      <Icon className="w-4 h-4" />
      <span className="font-medium">{badge.text}</span>
    </div>
  )
}

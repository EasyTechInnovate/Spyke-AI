'use client'

import { AlertCircle, Clock, Eye, Upload, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from './Cards'

export function VerificationAlerts({ verificationStatus, seller, onDocumentUpload }) {
  const { type, icon: iconName, text, description, action } = verificationStatus

  const getIcon = (name) => {
    const icons = {
      Clock,
      Eye,
      DollarSign: CheckCircle,
      CheckCircle,
      AlertCircle
    }
    return icons[name] || AlertCircle
  }

  const getAlertColors = (type) => {
    switch (type) {
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5'
      case 'info':
        return 'border-blue-500/30 bg-blue-500/5'
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/5'
      case 'error':
        return 'border-red-500/30 bg-red-500/5'
      default:
        return 'border-white/20 bg-white/5'
    }
  }

  const getTextColors = (type) => {
    switch (type) {
      case 'warning':
        return 'text-amber-400'
      case 'info':
        return 'text-blue-400'
      case 'success':
        return 'text-emerald-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-[--text-secondary]'
    }
  }

  const Icon = getIcon(iconName)

  // Don't show alerts for approved sellers
  if (type === 'success' && seller?.verification?.status === 'approved') {
    return null
  }

  return (
    <Card variant="outline" className={getAlertColors(type)}>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg bg-current/20 flex items-center justify-center flex-shrink-0 ${getTextColors(type)}`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className={`text-lg font-semibold ${getTextColors(type)}`}>{text}</h3>
              <p className="text-sm text-[--text-secondary] mt-1">{description}</p>
            </div>

            {/* Additional info based on status */}
            {seller?.verification?.submittedAt && (
              <p className="text-xs text-[--text-secondary]">
                Last submitted: {new Date(seller.verification.submittedAt).toLocaleDateString()}
              </p>
            )}

            {seller?.verification?.rejectionReason && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{seller.verification.rejectionReason}</p>
              </div>
            )}

            {/* Action buttons */}
            {action === 'upload' && (
              <button
                onClick={onDocumentUpload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-amber-950 font-medium rounded-lg hover:bg-amber-400 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {seller?.verification?.submittedAt ? 'Re-upload Documents' : 'Upload Documents'}
              </button>
            )}

            {action === 'resubmit' && (
              <button
                onClick={onDocumentUpload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Submit for Verification Again
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BusinessReadinessCard({ permissions, seller }) {
  const readinessItems = [
    {
      label: 'Account Verified',
      completed: permissions.isApproved,
      description: 'Your seller account has been verified'
    },
    {
      label: 'Commission Accepted',
      completed: !!seller?.commissionOffer?.acceptedAt,
      description: 'Commission rate agreement finalized'
    },
    {
      label: 'Payout Method',
      completed: seller?.payoutInfo?.isVerified,
      description: 'Payment method verified and ready'
    },
    {
      label: 'Products Added',
      completed: (seller?.stats?.totalProducts || 0) > 0,
      description: 'At least one product listed for sale'
    }
  ]

  const completedCount = readinessItems.filter(item => item.completed).length
  const progressPercentage = (completedCount / readinessItems.length) * 100

  return (
    <Card variant="elevated">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[--text-primary]">Business Readiness</h3>
          <span className="text-sm text-[--text-secondary]">{completedCount}/{readinessItems.length}</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[--brand-primary] to-[--brand-secondary] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-[--text-secondary]">{progressPercentage.toFixed(0)}% Complete</p>
        </div>

        {/* Readiness items */}
        <div className="space-y-3">
          {readinessItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                item.completed 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'border-white/30'
              }`}>
                {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  item.completed ? 'text-[--text-primary]' : 'text-[--text-secondary]'
                }`}>
                  {item.label}
                </p>
                <p className="text-xs text-[--text-secondary]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {completedCount < readinessItems.length && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-[--brand-primary]">
              Complete all items to start selling and earning revenue
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
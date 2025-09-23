'use client'
import React, { useMemo } from 'react'
import { FileText, Eye, DollarSign, Handshake, Rocket, Check, Clock, AlertCircle } from 'lucide-react'
function BaseCommissionProgressStepper({ verificationStatus, commissionStatus, hasCounterOffer, acceptedAt }) {
  const isFullyCompleted = verificationStatus === 'approved' && commissionStatus === 'accepted'
  if (isFullyCompleted) return null
  const steps = useMemo(() => {
    const getStepStatus = (stepId) => {
      const isCommissionAccepted = commissionStatus === 'accepted'
      switch (stepId) {
        case 1:
          return 'completed'
        case 2:
          if (['commission_offered', 'approved'].includes(verificationStatus)) return 'completed'
          if (verificationStatus === 'under_review') return 'active'
          if (verificationStatus === 'rejected') return 'error'
          return 'pending'
        case 3:
          if (isCommissionAccepted) return 'completed'
          if (verificationStatus === 'commission_offered') return 'active'
          if (verificationStatus === 'rejected') return 'error'
          return 'pending'
        case 4:
          if (!hasCounterOffer && !commissionStatus) return 'hidden'
          if (isCommissionAccepted) return 'completed'
          if (commissionStatus === 'counter_offered') return 'active'
          if (commissionStatus === 'rejected') return 'error'
          return 'pending'
        case 5:
          if (verificationStatus === 'approved' && isCommissionAccepted) return 'completed'
          if (isCommissionAccepted) return 'active'
          return 'pending'
        default:
          return 'pending'
      }
    }
    const allSteps = [
      { id: 1, title: 'Profile Submitted', icon: FileText, description: 'Your seller profile has been submitted' },
      { id: 2, title: 'Document Review', icon: Eye, description: 'We are reviewing your documents' },
      { id: 3, title: 'Commission Offer', icon: DollarSign, description: 'Commission rate offer sent' },
      { id: 4, title: 'Negotiation', icon: Handshake, description: 'Discussing terms' },
      { id: 5, title: 'Final Approval', icon: Rocket, description: 'Ready to start selling' }
    ]
    return allSteps
      .map(step => ({ ...step, status: getStepStatus(step.id) }))
      .filter(step => step.status !== 'hidden')
  }, [verificationStatus, commissionStatus, hasCounterOffer])
  const completedSteps = steps.filter(s => s.status === 'completed').length
  const activeStep = steps.find(s => s.status === 'active')
  const errorStep = steps.find(s => s.status === 'error')
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / Math.max(totalSteps - 1, 1)) * 100
  const getStatusMessage = () => {
    if (errorStep) {
      if (verificationStatus === 'rejected') {
        return { type: 'error', message: 'Your application has been rejected. Please check your email for details.' }
      }
      if (commissionStatus === 'rejected') {
        return { type: 'error', message: 'Commission negotiation was unsuccessful. Please contact support.' }
      }
    }
    if (activeStep) {
      switch (activeStep.id) {
        case 2:
          return { type: 'info', message: 'We are currently reviewing your documents. This usually takes 1-3 business days.' }
        case 3:
          return { type: 'success', message: 'Great news! We have sent you a commission offer. Please review and respond.' }
        case 4:
          return { type: 'warning', message: hasCounterOffer ? 'Counter offer submitted. Waiting for admin response.' : 'Negotiation in progress.' }
        case 5:
          return { type: 'info', message: 'Final approval in progress. You will be able to start selling soon!' }
        default:
          return { type: 'info', message: activeStep.description }
      }
    }
    return null
  }
  const statusMessage = getStatusMessage()
  return (
    <div className="w-full bg-gradient-to-br from-[#1a1a1a] to-[#1f1f1f] border border-gray-800/50 rounded-2xl p-6 mb-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Seller Onboarding Progress</h3>
          <p className="text-sm text-gray-400">Complete these steps to start selling</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#00FF89]">{completedSteps}/{totalSteps}</div>
          <div className="text-xs text-gray-400">Steps Completed</div>
        </div>
      </div>
      <div className="relative mb-8">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#00FF89] to-[#00d470] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="absolute -top-1 right-0 w-4 h-4 bg-[#00FF89] rounded-full opacity-75 animate-pulse" 
             style={{ right: `${100 - Math.min(progressPercentage, 100)}%`, transform: 'translateX(50%)' }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = step.status === 'completed'
          const isActive = step.status === 'active'
          const isError = step.status === 'error'
          const isPending = step.status === 'pending'
          return (
            <div key={step.id} className={`relative p-4 rounded-xl border transition-all duration-300 ${
              isCompleted 
                ? 'bg-[#00FF89]/10 border-[#00FF89]/30 shadow-sm' 
                : isActive 
                  ? 'bg-[#00FF89]/5 border-[#00FF89]/50 shadow-md ring-1 ring-[#00FF89]/20' 
                  : isError
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-gray-900/50 border-gray-700/50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/25' 
                    : isActive 
                      ? 'bg-[#00FF89]/20 text-[#00FF89] ring-2 ring-[#00FF89]/50 shadow-md' 
                      : isError
                        ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50'
                        : 'bg-gray-700 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : isActive ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  isCompleted ? 'text-[#00FF89]' : isActive ? 'text-[#00FF89]' : isError ? 'text-red-400' : 'text-gray-500'
                }`}>
                  Step {step.id}
                </span>
              </div>
              <div>
                <h4 className={`font-medium mb-1 text-sm ${
                  isCompleted ? 'text-white' : isActive ? 'text-white' : isError ? 'text-red-300' : 'text-gray-400'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-xs leading-relaxed ${
                  isCompleted ? 'text-gray-300' : isActive ? 'text-gray-300' : isError ? 'text-red-400/80' : 'text-gray-500'
                }`}>
                  {step.description}
                </p>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse" />
                </div>
              )}
            </div>
          )
        })}
      </div>
      {statusMessage && (
        <div className={`p-4 rounded-xl border ${
          statusMessage.type === 'error' 
            ? 'bg-red-500/10 border-red-500/30 text-red-300' 
            : statusMessage.type === 'success'
              ? 'bg-[#00FF89]/10 border-[#00FF89]/30 text-[#00FF89]'
              : statusMessage.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 mt-0.5 ${
              statusMessage.type === 'error' ? 'text-red-400' :
              statusMessage.type === 'success' ? 'text-[#00FF89]' :
              statusMessage.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
            }`}>
              {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {statusMessage.type === 'success' && <Check className="w-5 h-5" />}
              {statusMessage.type === 'warning' && <Clock className="w-5 h-5" />}
              {statusMessage.type === 'info' && <Eye className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-medium mb-1">
                {statusMessage.type === 'error' && 'Action Required'}
                {statusMessage.type === 'success' && 'Action Needed'}
                {statusMessage.type === 'warning' && 'In Progress'}
                {statusMessage.type === 'info' && 'Update'}
              </p>
              <p className="text-sm opacity-90">{statusMessage.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
const CommissionProgressStepper = React.memo(BaseCommissionProgressStepper)
export default CommissionProgressStepper
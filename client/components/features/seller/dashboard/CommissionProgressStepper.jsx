'use client'
import React, { useMemo } from 'react'
import { FileText, Eye, DollarSign, Handshake, Rocket, Check } from 'lucide-react'

function BaseCommissionProgressStepper({ verificationStatus, commissionStatus, hasCounterOffer, acceptedAt }) {
  const steps = useMemo(() => {
    const getStepStatus = (stepId) => {
      const isAccepted = !!acceptedAt
      switch (stepId) {
        case 1: return 'completed'
        case 2:
          if (['under_review','commission_offered','approved'].includes(verificationStatus)) return 'completed'
          return verificationStatus === 'pending' ? 'active' : 'pending'
        case 3:
          if (isAccepted) return 'completed'
          if (verificationStatus === 'commission_offered') return 'active'
          if (verificationStatus === 'approved') return 'completed'
          return 'pending'
        case 4:
          if (isAccepted) return 'completed'
          if (commissionStatus === 'counter_offered') return 'active'
          return 'pending'
        case 5:
          if (isAccepted && verificationStatus === 'approved') return 'completed'
          if (isAccepted) return 'active'
          return 'pending'
        default: return 'pending'
      }
    }
    return [
      { id:1, title:'Profile Submitted', icon:FileText },
      { id:2, title:'Under Review', icon:Eye },
      { id:3, title:(verificationStatus === 'commission_offered' || acceptedAt) ? 'Commission Offered':'Document Under Review', icon:(verificationStatus === 'commission_offered' || acceptedAt) ? DollarSign : Eye },
      { id:4, title:'Negotiation', icon:Handshake },
      { id:5, title:'Start Selling', icon:Rocket }
    ].map(s => ({ ...s, status: getStepStatus(s.id) }))
  }, [verificationStatus, commissionStatus, acceptedAt])

  const completedSteps = steps.filter(s => s.status === 'completed').length
  const activeStep = steps.find(s => s.status === 'active')
  const progressPercentage = activeStep ? (steps.indexOf(activeStep) / (steps.length - 1)) * 100 : (completedSteps / (steps.length - 1)) * 100

  return (
    <div className="w-full max-w-full bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 sm:p-6 mb-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Your Progress</h3>
      <div className="relative mb-6 w-full h-1 hidden lg:block">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-[#00FF89] rounded-full transition-all duration-500" style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-2">
        {steps.map(step => {
          const Icon = step.icon
          const isCompleted = step.status === 'completed'
          const isActive = step.status === 'active'
          return (
            <div key={step.id} className="flex flex-col items-center text-center w-1/5 min-w-[70px] flex-grow">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 mb-1 ${isCompleted ? 'bg-[#00FF89] text-[#121212]' : isActive ? 'bg-[#00FF89]/20 text-[#00FF89] ring-2 ring-[#00FF89]' : 'bg-gray-700 text-gray-500'}`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <p className={`text-[11px] sm:text-xs font-medium ${isActive ? 'text-[#00FF89]' : isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>{step.title}</p>
            </div>
          )
        })}
      </div>
      {steps.some(s => s.status === 'active') && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-sm text-gray-400">
            <span className="text-[#00FF89] font-medium">Current Step:</span> {activeStep?.title}{hasCounterOffer && ' - Counter offer submitted'}
          </p>
        </div>
      )}
    </div>
  )
}

const CommissionProgressStepper = React.memo(BaseCommissionProgressStepper)
export default CommissionProgressStepper

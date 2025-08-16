'use client'

import { useState, useRef, useEffect } from 'react'
import { DollarSign, Check, X, AlertTriangle, Clock, HelpCircle } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from './Cards'

export function CommissionNegotiation({ negotiationState, onAccept, onCounter, onReject, processing, formatCurrency }) {
  const [showCounterModal, setShowCounterModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [localProcessing, setLocalProcessing] = useState(false)

  if (!negotiationState) return null

  const { 
    canNegotiate, 
    isCounterOffered, 
    isAccepted, 
    currentRate, 
    counterRate, 
    negotiationRound, 
    maxRounds,
    counterReason,
    lastActivity,
    status // Add status to track current state
  } = negotiationState

  const isProcessing = processing || localProcessing

  // Handle accepted state
  if (isAccepted || status === 'accepted') {
    return (
      <Card variant="elevated" className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Commission Accepted</h3>
              <p className="text-sm text-gray-400">
                You're earning {100 - currentRate}% on every sale at {currentRate}% commission
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle counter offered state (seller waiting for admin response)
  if (isCounterOffered || status === 'counter_offered') {
    return (
      <Card variant="elevated" className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Counter Offer Under Review</h3>
              <p className="text-sm text-gray-400">
                Your {counterRate}% counter offer is being reviewed by our team
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {counterReason && (
            <div className="bg-[#121212] rounded-lg p-4">
              <p className="text-sm font-medium text-gray-400 mb-1">Your Reason:</p>
              <p className="text-sm text-white">{counterReason}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Round {negotiationRound}/{maxRounds}</span>
            <span className="text-gray-400">
              Submitted {new Date(lastActivity).toLocaleDateString()}
            </span>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-300">
              ⏳ We typically respond within 1-2 business days. You'll receive an email notification when we respond.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle rejected state
  if (status === 'rejected') {
    return (
      <Card variant="elevated" className="border-red-500/30 bg-red-500/5">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Offer Rejected</h3>
              <p className="text-sm text-gray-400">
                Commission offer was declined. You can submit a new application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle pending/new offer state
  const showActionButtons = canNegotiate && !isCounterOffered && !isAccepted && status !== 'counter_offered'

  // Enhanced handlers with proper loading states
  const handleAccept = async () => {
    if (isProcessing) return
    setLocalProcessing(true)
    try {
      await onAccept()
    } finally {
      setLocalProcessing(false)
    }
  }

  const handleCounter = async (data) => {
    if (isProcessing) return
    setLocalProcessing(true)
    try {
      await onCounter(data)
      setShowCounterModal(false)
    } finally {
      setLocalProcessing(false)
    }
  }

  const handleReject = async (reason) => {
    if (isProcessing) return
    setLocalProcessing(true)
    try {
      await onReject(reason)
      setShowRejectModal(false)
    } finally {
      setLocalProcessing(false)
    }
  }

  return (
    <>
      <Card variant="elevated" className="border-[#00FF89]/30 bg-[#00FF89]/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#00FF89]/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#00FF89]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Commission Offer</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#00FF89]">{currentRate}%</span>
                <CommissionTooltip rate={currentRate} formatCurrency={formatCurrency} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-lg font-bold text-white">{100 - currentRate}%</p>
              <p className="text-xs text-gray-400">You Keep</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5">
              <p className="text-lg font-bold text-white">{formatCurrency(100 - currentRate)}</p>
              <p className="text-xs text-gray-400">Per $100 Sale</p>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            Platform takes {currentRate}% to cover infrastructure, payments, support, and marketing.
          </div>
        </CardContent>

        {showActionButtons && (
          <CardFooter>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Accept
                  </>
                )}
              </button>

              <button
                onClick={() => setShowCounterModal(true)}
                disabled={isProcessing || negotiationRound >= maxRounds}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-[#00FF89]/30 text-[#00FF89] font-medium rounded-lg hover:bg-[#00FF89]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle className="w-4 h-4" />
                Counter
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-red-500/30 text-red-400 font-medium rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>

            {negotiationRound >= maxRounds && (
              <p className="text-xs text-amber-400 mt-2">
                Maximum negotiation rounds reached. Please accept or wait for admin response.
              </p>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Modals */}
      {showCounterModal && (
        <CounterOfferModal
          currentRate={currentRate}
          onClose={() => setShowCounterModal(false)}
          onSubmit={handleCounter}
          processing={isProcessing}
        />
      )}

      {showRejectModal && (
        <RejectOfferModal
          onClose={() => setShowRejectModal(false)}
          onSubmit={handleReject}
          processing={isProcessing}
        />
      )}
    </>
  )
}

function CommissionTooltip({ rate, formatCurrency }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#121212] border border-white/20 rounded-lg shadow-xl z-50">
          <div className="text-xs text-white">
            <p className="font-semibold mb-2">Commission Breakdown:</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>{formatCurrency(100)} sale</span>
                <span>You get {formatCurrency(100 - rate)}</span>
              </div>
              <div className="flex justify-between">
                <span>{formatCurrency(500)} sale</span>
                <span>You get {formatCurrency(500 - (500 * rate / 100))}</span>
              </div>
              <div className="flex justify-between">
                <span>{formatCurrency(1000)} sale</span>
                <span>You get {formatCurrency(1000 - (1000 * rate / 100))}</span>
              </div>
            </div>
            <p className="text-[#00FF89] text-xs mt-2">
              Platform fee covers hosting, payments, support & marketing
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function CounterOfferModal({ currentRate, onClose, onSubmit, processing }) {
  const [counterRate, setCounterRate] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!counterRate || isNaN(counterRate)) {
      newErrors.counterRate = 'Please enter a valid commission rate'
    } else if (parseFloat(counterRate) < 1 || parseFloat(counterRate) > 50) {
      newErrors.counterRate = 'Commission rate must be between 1% and 50%'
    } else if (parseFloat(counterRate) >= currentRate) {
      newErrors.counterRate = `Counter offer must be lower than current ${currentRate}%`
    }
    
    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for your counter offer'
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (isSubmitting || processing) return
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        counterRate: parseFloat(counterRate),
        reason: reason.trim()
      })
      // Don't close modal here - let parent handle success and close
    } catch (error) {
      console.error('Counter offer submission failed:', error)
      // Keep modal open on error so user can retry
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = isSubmitting || processing

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Make Counter Offer</h3>
          <button
            onClick={onClose}
            disabled={isDisabled}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Offer: {currentRate}%
            </label>
            <div className="relative">
              <input
                type="number"
                value={counterRate}
                onChange={(e) => setCounterRate(e.target.value)}
                placeholder="Enter your counter rate"
                min="1"
                max="50"
                step="0.1"
                disabled={isDisabled}
                className={`w-full px-3 py-2 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] disabled:opacity-50 ${
                  errors.counterRate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              <span className="absolute right-3 top-2 text-gray-400">%</span>
            </div>
            {errors.counterRate && (
              <p className="text-red-400 text-xs mt-1">{errors.counterRate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Counter Offer
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you believe this rate is more appropriate..."
              rows={4}
              disabled={isDisabled}
              className={`w-full px-3 py-2 bg-[#121212] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] resize-none disabled:opacity-50 ${
                errors.reason ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.reason && (
              <p className="text-red-400 text-xs mt-1">{errors.reason}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isDisabled}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDisabled || !counterRate || !reason.trim()}
              className="flex-1 px-4 py-2 bg-[#00FF89] text-[#121212] font-medium rounded-lg hover:bg-[#00FF89]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Counter Offer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RejectOfferModal({ onClose, onSubmit, processing }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (reason.trim().length < 5) {
      setError('Please provide at least 5 characters')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(reason.trim())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1f1f1f] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full">
        <h3 className="text-xl font-bold text-red-400 mb-4">Reject Offer</h3>
        
        <p className="text-sm text-gray-400 mb-4">
          Please provide a brief reason for rejecting this commission offer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 bg-[#121212] border ${
              error ? 'border-red-500' : 'border-white/20'
            } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none`}
            placeholder="Reason for rejection..."
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || processing}
              className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {submitting || processing ? 'Rejecting...' : 'Reject Offer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-transparent border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
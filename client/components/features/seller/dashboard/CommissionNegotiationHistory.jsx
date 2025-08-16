'use client'
import { Clock, Check, X, Building, User, CheckCircle } from 'lucide-react'

export default function CommissionNegotiationHistory({ commissionOffer, verificationStatus }) {
  if (!commissionOffer || verificationStatus !== 'commission_offered') return null

  const serverHistory = commissionOffer.history || []
  const fallbackHistory = !serverHistory.length ? [
    {
      id: 'current-offer',
      type: 'offer',
      by: commissionOffer.lastOfferedBy || 'admin',
      rate: commissionOffer.rate,
      timestamp: commissionOffer.offeredAt,
      status: commissionOffer.status,
      message: 'Current offer'
    }
  ] : serverHistory

  const negotiationHistory = fallbackHistory

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/20'
      case 'accepted':
        return 'text-green-500 bg-green-500/20'
      case 'rejected':
        return 'text-red-500 bg-red-500/20'
      case 'completed':
        return 'text-gray-400 bg-gray-700/50'
      default:
        return 'text-gray-400 bg-gray-700/50'
    }
  }

  const getIcon = (item) => {
    if (item.type === 'accepted') return <Check className="w-4 h-4" />
    if (item.type === 'rejected') return <X className="w-4 h-4" />
    if (item.by === 'admin') return <Building className="w-4 h-4" />
    return <User className="w-4 h-4" />
  }

  return (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 h-full flex flex-col" aria-label="Negotiation history">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Negotiation History</h3>
        {commissionOffer.negotiationRound && (
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded" aria-label={`Round ${commissionOffer.negotiationRound}`}>
            Round {commissionOffer.negotiationRound}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[280px] pr-1" role="list">
        {negotiationHistory.map((item) => (
          <div key={item.id} className="flex items-start gap-3" role="listitem">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(item.status)}`}>
              {getIcon(item)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white">{item.message}</p>
                    {item.by && (
                      <span className={`text-xs px-2 py-0.5 rounded ${item.by === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {item.by === 'admin' ? 'Admin' : 'You'}
                      </span>
                    )}
                  </div>
                  {typeof item.rate === 'number' && (
                    <p className="text-lg font-bold text-[#00FF89] mt-1">
                      {item.rate}% <span className="text-xs text-gray-400 font-normal">commission</span>
                    </p>
                  )}
                  {item.status === 'pending' && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-500">Awaiting response</span>
                    </div>
                  )}
                </div>
                {item.timestamp && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
              {item.reason && <div className="mt-2 p-2 bg-[#121212] rounded text-xs text-gray-400 line-clamp-2">{item.reason}</div>}
            </div>
          </div>
        ))}
      </div>

      {commissionOffer.status === 'pending' && !commissionOffer.acceptedAt && (
        <div className="mt-4 pt-4 border-t border-gray-700" aria-live="polite">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Current offer</p>
              <p className="text-sm font-semibold text-white">{commissionOffer.rate}% commission</p>
            </div>
            <div className="text-right bg-[#00FF89]/10 px-3 py-2 rounded-lg">
              <p className="text-xs text-gray-400">You keep</p>
              <p className="text-lg font-bold text-[#00FF89]">{100 - commissionOffer.rate}%</p>
            </div>
          </div>
        </div>
      )}

      {commissionOffer.acceptedAt && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg" aria-live="polite">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-500">Agreement Finalized</p>
              <p className="text-xs text-gray-400">{commissionOffer.rate}% commission rate accepted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

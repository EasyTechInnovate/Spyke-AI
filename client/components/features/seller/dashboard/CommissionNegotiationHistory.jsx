'use client'
import { Clock, Check, X, Building, User, CheckCircle, DollarSign } from 'lucide-react'

export default function CommissionNegotiationHistory({ commissionOffer, verificationStatus }) {
    if (!commissionOffer || verificationStatus !== 'commission_offered') return null

    const serverHistory = commissionOffer.history || []
    const fallbackHistory = !serverHistory.length
        ? [
              {
                  id: 'current-offer',
                  type: 'offer',
                  by: commissionOffer.lastOfferedBy || 'admin',
                  rate: commissionOffer.rate,
                  timestamp: commissionOffer.offeredAt,
                  status: commissionOffer.status,
                  message: 'Commission offer received'
              }
          ]
        : serverHistory

    const negotiationHistory = fallbackHistory

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Commission History</h3>
                    {commissionOffer.negotiationRound && <span className="text-sm text-gray-400">Round {commissionOffer.negotiationRound}</span>}
                </div>
            </div>

            {/* Timeline */}
            <div className="p-6 space-y-6">
                {negotiationHistory.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.status === 'pending' && <Clock className="w-5 h-5 text-amber-400" />}
                            {item.status === 'accepted' && <Check className="w-5 h-5 text-emerald-400" />}
                            {item.status === 'rejected' && <X className="w-5 h-5 text-red-400" />}
                            {!['pending', 'accepted', 'rejected'].includes(item.status) &&
                                (item.by === 'admin' ? <Building className="w-5 h-5 text-blue-400" /> : <User className="w-5 h-5 text-purple-400" />)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{item.message}</span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                            item.by === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                        }`}>
                                        {item.by === 'admin' ? 'Admin' : 'You'}
                                    </span>
                                </div>
                                {item.timestamp && <span className="text-xs text-gray-500">{formatDate(item.timestamp)}</span>}
                            </div>

                            {typeof item.rate === 'number' && (
                                <div className="mb-2">
                                    <span className="text-2xl font-bold text-[#00FF89]">{item.rate}%</span>
                                    <span className="text-sm text-gray-400 ml-2">commission rate</span>
                                </div>
                            )}

                            {item.status === 'pending' && (
                                <div className="inline-flex items-center gap-1 text-amber-400">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-xs">Awaiting response</span>
                                </div>
                            )}

                            {item.reason && (
                                <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                                    <p className="text-sm text-gray-300">{item.reason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            {commissionOffer.status === 'pending' && !commissionOffer.acceptedAt && (
                <div className="p-6 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-[#00FF89]" />
                            <div>
                                <p className="text-sm font-medium text-white">Current Offer</p>
                                <p className="text-xs text-gray-400">Waiting for your response</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-bold text-[#00FF89]">{commissionOffer.rate}%</span>
                            <p className="text-xs text-gray-400">You keep {100 - commissionOffer.rate}%</p>
                        </div>
                    </div>
                </div>
            )}

            {commissionOffer.acceptedAt && (
                <div className="p-6 border-t border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <div>
                            <p className="text-sm font-medium text-emerald-400">Agreement Finalized</p>
                            <p className="text-xs text-gray-400">{commissionOffer.rate}% commission rate is active</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


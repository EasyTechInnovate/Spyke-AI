'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
export default function PaymentMethodsSection({ onSuccess, onError }) {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      isPrimary: true,
      hasSubscription: true
    }
  ])
  const handleAddPaymentMethod = () => {
    onSuccess('Payment method functionality coming soon!')
  }
  const handleSetPrimaryCard = (cardId) => {
    setPaymentMethods(prev => prev.map(card => ({
      ...card,
      isPrimary: card.id === cardId
    })))
    onSuccess('Primary payment method updated!')
  }
  const handleRemoveCard = (cardId) => {
    const card = paymentMethods.find(c => c.id === cardId)
    if (card?.hasSubscription) {
      onError('Cannot remove card with active subscriptions')
      return
    }
    setPaymentMethods(prev => prev.filter(c => c.id !== cardId))
    onSuccess('Payment method removed!')
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center border border-[#00FF89]/20">
              <CreditCard className="w-6 h-6 text-[#00FF89]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#00FF89] font-league-spartan">Payment Methods</h2>
              <p className="text-gray-300">Manage your cards and payment options</p>
            </div>
          </div>
          <button
            onClick={handleAddPaymentMethod}
            className="flex items-center gap-2 px-4 py-2 bg-[#00FF89]/10 text-[#00FF89] rounded-xl hover:bg-[#00FF89]/20 transition-colors border border-[#00FF89]/20"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>
        <div className="space-y-4">
          {paymentMethods.map((card) => (
            <div
              key={card.id}
              className={cn(
                "p-6 rounded-xl border transition-all",
                card.isPrimary
                  ? "bg-[#00FF89]/5 border-[#00FF89]/30"
                  : "bg-[#121212] border-gray-700"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {card.brand}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">•••• •••• •••• {card.last4}</span>
                      {card.isPrimary && (
                        <span className="px-2 py-1 bg-[#00FF89]/20 text-[#00FF89] text-xs rounded-full font-medium border border-[#00FF89]/30">
                          Primary
                        </span>
                      )}
                    </div>
                    {card.hasSubscription && (
                      <p className="text-sm text-gray-400 mt-1">Active subscription</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!card.isPrimary && (
                    <button
                      onClick={() => handleSetPrimaryCard(card.id)}
                      className="px-3 py-2 text-sm text-[#00FF89] hover:bg-[#00FF89]/10 rounded-lg transition-colors"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    disabled={card.hasSubscription}
                    className="p-2 text-gray-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <span className="text-blue-400 font-bold text-lg">PP</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-league-spartan">PayPal</h3>
            <p className="text-gray-300">Connect your PayPal account</p>
          </div>
        </div>
        <button 
          onClick={() => onSuccess('PayPal integration coming soon!')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors border border-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Add PayPal Account
        </button>
      </div>
    </motion.div>
  )
}
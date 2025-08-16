'use client'
import React from 'react'

export default function FunnelMiniChart({ data = { views: 0, carts: 0, purchases: 0 } }) {
  const { views = 0, carts = 0, purchases = 0 } = data || {}
  const steps = [
    { id: 'views', label: 'Views', value: views, color: 'from-[#00FF89] to-emerald-600' },
    { id: 'carts', label: 'Cart Adds', value: carts, color: 'from-blue-500 to-indigo-600' },
    { id: 'purchases', label: 'Purchases', value: purchases, color: 'from-purple-500 to-pink-600' }
  ]
  const max = Math.max(...steps.map(s => s.value), 1)
  return (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h2>
      <div className="space-y-4">
        {steps.map(s => {
          const widthPct = (s.value / max) * 100
          return (
            <div key={s.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{s.label}</span>
                <span className="text-gray-300 font-medium">{s.value}</span>
              </div>
              <div className="h-3 rounded-md bg-gray-800 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${s.color}`} style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-5 text-[11px] leading-relaxed text-gray-500">
        Track how visitors progress from product views to purchases. Improve each stage by optimizing listings, pricing and promotions.
      </p>
    </div>
  )
}

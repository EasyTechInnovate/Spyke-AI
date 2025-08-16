'use client'
import React from 'react'

export default function CurrencySelector({ value, onChange, className = '' }) {
  const currencies = [
    ['USD', '$'], ['INR', '₹'], ['EUR', '€'], ['GBP', '£'],
    ['AUD', 'A$'], ['CAD', 'C$'], ['SGD', 'S$'], ['AED', 'AED']
  ]
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="appearance-none w-full pl-4 pr-10 py-2 bg-[#1a1a1a] border border-gray-800 text-sm text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-[#00FF89] transition-colors">
        {currencies.map(([code, sym]) => (
          <option key={code} value={code}>{code} ({sym})</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

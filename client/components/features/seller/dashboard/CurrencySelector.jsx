'use client'

import { ChevronDown } from 'lucide-react'

const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
]

export default function CurrencySelector({ value, onChange }) {
    const selectedCurrency = currencies.find(c => c.code === value) || currencies[0]

    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-[#1f1f1f] border border-gray-800 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-white hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/20 focus:border-[#00FF89] transition-colors cursor-pointer"
            >
                {currencies.map(currency => (
                    <option key={currency.code} value={currency.code} className="bg-[#1f1f1f] text-white">
                        {currency.symbol} {currency.code}
                    </option>
                ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
    )
}

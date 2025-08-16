'use client'
import React from 'react'
import Link from 'next/link'
import { Package, TrendingUp } from 'lucide-react'

export default function TopProductsPanel({ products = [] }) {
  const list = products.slice(0, 5)
  return (
    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Top Products</h2>
        <Link href="/seller/products" className="text-xs text-[#00FF89] hover:text-[#00FF89]/80 font-medium">View All →</Link>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400">
          <Package className="w-8 h-8 mx-auto mb-3 text-gray-600" />
          No products yet.
        </div>
      ) : (
        <ul className="divide-y divide-gray-800">
          {list.map(p => (
            <li key={p.id} className="py-3 flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#121212] border border-gray-800">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{p.title || 'Untitled Product'}</p>
                <p className="text-xs text-gray-500">${p.price ?? 0} • {p.sales || 0} sales</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="w-4 h-4" />
                {p.sales || 0}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

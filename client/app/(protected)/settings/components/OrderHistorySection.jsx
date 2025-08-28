'use client'

import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

export default function OrderHistorySection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center border border-[#00FF89]/20">
          <ShoppingBag className="w-6 h-6 text-[#00FF89]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#00FF89] font-league-spartan">Order History</h2>
          <p className="text-gray-300">View your past purchases and downloads</p>
        </div>
      </div>

      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">No Orders Yet</h3>
        <p className="text-gray-300">Your purchase history will appear here</p>
      </div>
    </motion.div>
  )
}
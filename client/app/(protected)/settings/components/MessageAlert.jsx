'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

export default function MessageAlert({ successMessage, errorMessage }) {
  if (!successMessage && !errorMessage) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {successMessage && (
        <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-[#00FF89]" />
            <p className="text-[#00FF89] font-medium">{successMessage}</p>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-red-400" />
            <p className="text-red-400 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
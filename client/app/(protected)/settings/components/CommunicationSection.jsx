'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'

export default function CommunicationSection({ onSuccess }) {
  const [communicationPrefs, setCommunicationPrefs] = useState({
    marketingEmails: true,
    productUpdates: true,
    orderUpdates: true,
    feedbackRequests: false
  })

  const handlePreferenceChange = (key, value) => {
    setCommunicationPrefs(prev => ({ ...prev, [key]: value }))
    onSuccess('Communication preferences updated!')
  }

  const preferences = [
    { 
      key: 'marketingEmails', 
      label: 'Marketing Emails', 
      description: 'Receive updates about new products and offers' 
    },
    { 
      key: 'productUpdates', 
      label: 'Product Updates', 
      description: 'Get notified about product improvements and new features' 
    },
    { 
      key: 'orderUpdates', 
      label: 'Order Updates', 
      description: 'Receive notifications about your purchases' 
    },
    { 
      key: 'feedbackRequests', 
      label: 'Feedback Requests', 
      description: 'Participate in surveys and product feedback' 
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#00FF89]/10 rounded-xl flex items-center justify-center border border-[#00FF89]/20">
          <Bell className="w-6 h-6 text-[#00FF89]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#00FF89] font-league-spartan">Communication Preferences</h2>
          <p className="text-gray-300">Manage your email notifications and feedback options</p>
        </div>
      </div>

      <div className="space-y-6">
        {preferences.map((pref) => (
          <div key={pref.key} className="flex items-center justify-between p-4 bg-[#121212] rounded-xl border border-gray-700">
            <div>
              <h4 className="font-semibold text-white">{pref.label}</h4>
              <p className="text-gray-300 text-sm">{pref.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={communicationPrefs[pref.key]}
                onChange={(e) => handlePreferenceChange(pref.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00FF89]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF89]"></div>
            </label>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, AlertTriangle } from 'lucide-react'
export default function ActiveSessionsSection({ onSuccess, onError }) {
  const [loading, setLoading] = useState(false)
  const handleSignOutAllSessions = async () => {
    if (confirm('Are you sure you want to sign out of all other devices?')) {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)) 
        onSuccess('Successfully signed out of all other devices')
      } catch (error) {
        console.error('Sign out failed:', error)
        onError('Failed to sign out of all sessions')
      } finally {
        setLoading(false)
      }
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
            <LogOut className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#00FF89] font-league-spartan">Active Sessions</h2>
            <p className="text-gray-300">Manage your logged-in devices</p>
          </div>
        </div>
        <button
          onClick={handleSignOutAllSessions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 border border-red-500/20"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-red-400/20 border-t-red-400 rounded-full animate-spin"></div>
              Signing Out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              Sign Out All Sessions
            </>
          )}
        </button>
      </div>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-400 mb-1">Security Notice</h4>
            <p className="text-amber-200/80 text-sm">
              Signing out of all sessions will log you out from all devices except this one. 
              You'll need to sign in again on those devices.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
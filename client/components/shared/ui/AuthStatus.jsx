'use client'

import { useAuth } from '@/hooks/useAuth'
import { User, LogIn, Loader2 } from 'lucide-react'

export default function AuthStatus({ className = '', showDetails = false }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-lg ${className}`}>
        <LogIn className="w-4 h-4" />
        <span className="text-sm font-medium">
          {showDetails ? 'Sign in to purchase' : 'Not signed in'}
        </span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg ${className}`}>
      <User className="w-4 h-4" />
      <span className="text-sm font-medium">
        {showDetails ? `Signed in as ${user?.name || 'User'}` : 'Signed in'}
      </span>
    </div>
  )
}
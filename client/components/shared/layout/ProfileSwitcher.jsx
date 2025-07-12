'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, User, Store, LogOut } from 'lucide-react'

export default function ProfileSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [currentRole, setCurrentRole] = useState('user')
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(userData)
    }
    
    if (pathname?.startsWith('/seller')) {
      setCurrentRole('seller')
    } else {
      setCurrentRole('user')
    }
  }, [pathname])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const switchRole = (role) => {
    setCurrentRole(role)
    setIsOpen(false)
    
    if (role === 'seller') {
      router.push('/seller/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
    }
    router.push('/login')
  }

  if (!user || !user.roles) return null

  const isSeller = user.roles?.includes('seller')

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {currentRole === 'seller' ? (
            <Store className="w-4 h-4 text-purple-600" />
          ) : (
            <User className="w-4 h-4 text-blue-600" />
          )}
          <span className="font-medium">
            {currentRole === 'seller' ? 'Seller' : 'Buyer'} Mode
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-medium">{user.fullName || user.emailAddress}</p>
          </div>

          <div className="py-2">
            <button
              onClick={() => switchRole('user')}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                currentRole === 'user' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <User className="w-4 h-4" />
              <div>
                <div className="font-medium">Buyer Mode</div>
                <div className="text-sm text-gray-500">Browse and purchase products</div>
              </div>
            </button>

            {isSeller && (
              <button
                onClick={() => switchRole('seller')}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                  currentRole === 'seller' ? 'bg-purple-50 text-purple-700' : ''
                }`}
              >
                <Store className="w-4 h-4" />
                <div>
                  <div className="font-medium">Seller Mode</div>
                  <div className="text-sm text-gray-500">Manage your products & sales</div>
                </div>
              </button>
            )}

            {!isSeller && (
              <button
                onClick={() => router.push('/become-seller')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors text-green-600"
              >
                <Store className="w-4 h-4" />
                <div>
                  <div className="font-medium">Your Seller Profile</div>
                  <div className="text-sm text-gray-500">Start selling your products</div>
                </div>
              </button>
            )}
          </div>

          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
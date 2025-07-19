'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { useEffect, useState } from 'react'

export default function CartIcon() {
  const { getCartCount } = useCart()
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Update count on mount and when cart changes
    const updateCount = () => {
      setCount(getCartCount())
    }
    
    updateCount()
    
    // Listen for storage changes (cart updates from other tabs)
    window.addEventListener('storage', updateCount)
    
    // Check for updates periodically
    const interval = setInterval(updateCount, 1000)
    
    return () => {
      window.removeEventListener('storage', updateCount)
      clearInterval(interval)
    }
  }, [getCartCount])

  return (
    <Link
      href="/cart"
      className="relative p-2 text-gray-300 hover:text-white transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-black text-xs font-bold rounded-full flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

export default function CartIcon() {
  const { cartCount, lastUpdate } = useCart()

  return (
    <Link
      href="/cart"
      className="relative p-2 text-gray-300 hover:text-white transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00FF89] text-[#121212] text-xs font-bold rounded-full flex items-center justify-center">
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
    </Link>
  )
}
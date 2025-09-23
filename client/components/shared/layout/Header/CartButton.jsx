'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
export default function CartButton({ count = 0 }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])
    return (
        <Link
            href="/cart"
            className="relative p-2 sm:p-3 text-gray-300 hover:text-[#00FF89] bg-white/5 hover:bg-[#00FF89]/10 rounded-lg transition-all duration-300"
        >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#00FF89] text-[#121212] text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    )
}
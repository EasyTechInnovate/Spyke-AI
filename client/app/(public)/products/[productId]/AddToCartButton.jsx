'use client'

import { useState, useCallback, useEffect } from 'react'
import { ShoppingCart, CreditCard } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'
import toast from '@/lib/utils/toast'
import { useDebugAuth } from '@/hooks/useDebugAuth'

export default function AddToCartButton({ product }) {
  const router = useRouter()
  const { addToCart, isInCart } = useCart()
  const [loading, setLoading] = useState(false)
  
  // Debug auth state
  useDebugAuth()
  
  // Clear any stale auth data on mount
  useEffect(() => {
    // Check for partial auth state that might cause redirects
    const authToken = localStorage.getItem('authToken')
    const roles = localStorage.getItem('roles')
    
    // If we have roles but no auth token, clear everything
    if (!authToken && roles) {
      console.log('Clearing stale auth data')
      localStorage.removeItem('roles')
      localStorage.removeItem('user')
      // Clear auth cookies too
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'roles=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }
  }, [])
  
  const handleAddToCart = useCallback(async () => {
    console.log('=== ADD TO CART CLICKED ===')
    console.log('Product:', product?._id || product?.id)
    console.log('Auth state before:', {
      token: !!localStorage.getItem('authToken'),
      roles: localStorage.getItem('roles')
    })
    
    if (!product) return
    
    setLoading(true)
    try {
      const cartProduct = {
        id: product._id || product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        thumbnail: product.thumbnail,
        seller: product.sellerId,
        type: product.type,
        category: product.category,
        description: product.shortDescription || product.description,
        image: product.images?.[0]?.url || product.thumbnail
      }
      
      // Check if already in cart
      const alreadyInCart = isInCart && isInCart(product._id || product.id)
      if (alreadyInCart) {
        toast.info('Product is already in cart')
        return
      }
      
      // Add to cart (works for both authenticated and guest users)
      await addToCart(cartProduct)
      toast.success('Added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    } finally {
      setLoading(false)
    }
  }, [product, addToCart, isInCart])
  
  const handleBuyNow = useCallback(async () => {
    console.log('=== BUY NOW CLICKED ===')
    console.log('Product:', product?._id || product?.id)
    console.log('Auth state before:', {
      token: !!localStorage.getItem('authToken'),
      roles: localStorage.getItem('roles')
    })
    
    if (!product) return
    
    setLoading(true)
    try {
      const cartProduct = {
        id: product._id || product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        thumbnail: product.thumbnail,
        seller: product.sellerId,
        type: product.type,
        category: product.category,
        description: product.shortDescription || product.description,
        image: product.images?.[0]?.url || product.thumbnail
      }
      
      // Check if already in cart
      const alreadyInCart = isInCart && isInCart(product._id || product.id)
      
      if (!alreadyInCart) {
        await addToCart(cartProduct)
      }
      
      // Navigate to checkout
      setTimeout(() => {
        router.push('/checkout')
      }, 200)
    } catch (error) {
      console.error('Error with buy now:', error)
      toast.error('Failed to process buy now')
    } finally {
      setLoading(false)
    }
  }, [product, addToCart, isInCart, router])
  
  return (
    <div className="flex gap-4">
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="w-5 h-5" />
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
      
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className="flex-1 px-6 py-3 bg-[#00FF89] text-[#121212] rounded-xl font-medium hover:bg-[#00DD78] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CreditCard className="w-5 h-5" />
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  )
}
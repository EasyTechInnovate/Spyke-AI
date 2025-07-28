'use client'

import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

export default function TestCartPage() {
  const { cartData, addToCart, removeFromCart, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const [update, setUpdate] = useState(0)

  // Force re-render every second to see latest cart state
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdate(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Clear any stale auth data on mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken')
    const roles = localStorage.getItem('roles')
    
    console.log('=== TEST CART PAGE LOADED ===')
    console.log('Auth token exists:', !!authToken)
    console.log('Roles:', roles)
    console.log('Is authenticated:', isAuthenticated)
    console.log('User:', user)
    
    // Clear stale roles if no auth token
    if (!authToken && roles) {
      console.log('Clearing stale roles')
      localStorage.removeItem('roles')
      localStorage.removeItem('user')
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'roles=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }
  }, [])

  const testProduct = {
    id: 99,
    title: "Test Product",
    description: "This is a test product",
    price: 9.99,
    originalPrice: 19.99,
    category: "Test",
    seller: {
      name: "Test Seller",
      id: "test-seller"
    }
  }

  const handleAddToCart = async () => {
    console.log('=== TEST ADD TO CART CLICKED ===')
    console.log('Current URL:', window.location.href)
    console.log('Is authenticated:', isAuthenticated)
    
    try {
      await addToCart(testProduct)
      console.log('Add to cart completed successfully')
      console.log('Current URL after add:', window.location.href)
    } catch (error) {
      console.error('Add to cart error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Cart Test Page</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Actions</h2>
          
          <button
            onClick={handleAddToCart}
            className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Add Test Product to Cart
          </button>
          
          <button
            onClick={() => clearCart()}
            className="block w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Clear Cart
          </button>
          
          <button
            onClick={() => window.location.href = '/cart'}
            className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Go to Cart Page
          </button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cart State</h2>
          
          <div className="bg-gray-900 p-4 rounded">
            <p>Is Authenticated: <span className="font-bold text-brand-primary">{isAuthenticated ? 'Yes' : 'No'}</span></p>
            <p>Cart Count: <span className="font-bold text-brand-primary">{cartData?.items?.length || 0}</span></p>
            <p>Cart Total: <span className="font-bold text-brand-primary">${cartData?.total || 0}</span></p>
            <p>Update Counter: {update}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Cart Items:</h3>
            {!cartData?.items || cartData.items.length === 0 ? (
              <p className="text-gray-400">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {cartData.items.map((item, index) => (
                  <div key={item.id} className="bg-gray-800 p-3 rounded">
                    <p className="font-semibold">{index + 1}. {item.title}</p>
                    <p className="text-sm text-gray-400">
                      Price: ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-2 text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gray-900 p-4 rounded">
            <h3 className="text-sm font-semibold mb-2">localStorage content:</h3>
            <pre className="text-xs text-gray-400 overflow-auto">
              {typeof window !== 'undefined' ? localStorage.getItem('spyke_guest_cart') || 'null' : 'Loading...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useCart } from '@/hooks/useCart'
import { useState, useEffect } from 'react'

export default function TestCartPage() {
  const { cartItems, addToCart, removeFromCart, clearCart, getCartCount, getCartTotal } = useCart()
  const [update, setUpdate] = useState(0)

  // Force re-render every second to see latest cart state
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdate(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
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

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Cart Test Page</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Actions</h2>
          
          <button
            onClick={() => addToCart(testProduct)}
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
            <p>Cart Count: <span className="font-bold text-brand-primary">{getCartCount()}</span></p>
            <p>Cart Total: <span className="font-bold text-brand-primary">${getCartTotal().toFixed(2)}</span></p>
            <p>Update Counter: {update}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Cart Items:</h3>
            {cartItems.length === 0 ? (
              <p className="text-gray-400">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item, index) => (
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
              {typeof window !== 'undefined' ? localStorage.getItem('spyke_cart') || 'null' : 'Loading...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
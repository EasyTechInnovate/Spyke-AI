'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'
import toast from '@/lib/utils/toast'

export default function TestAuthPage() {
  const { isAuthenticated, user, logout } = useAuth()
  const { cartData, addToCart, removeFromCart, clearCart } = useCart()
  const router = useRouter()
  const [logs, setLogs] = useState([])

  // Log function
  const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { timestamp, message, type }])
    console.log(`[${timestamp}] ${message}`)
  }

  // Monitor auth state
  useEffect(() => {
    log(`Auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`)
    if (user) {
      log(`User: ${user.email || user.name || 'Unknown'}`)
    }
  }, [isAuthenticated, user])

  // Test product
  const testProduct = {
    id: 'test-123',
    _id: 'test-123',
    title: 'Test Product',
    price: 29.99,
    description: 'Test product for auth testing',
    category: 'test',
    seller: { name: 'Test Seller' },
    image: '/placeholder.png'
  }

  // Test scenarios
  const testAddToCart = async () => {
    log('Testing add to cart...')
    try {
      const success = await addToCart(testProduct)
      log(`Add to cart result: ${success ? 'Success' : 'Failed'}`, success ? 'success' : 'error')
      if (success) {
        toast.success('Added to cart')
      }
    } catch (error) {
      log(`Add to cart error: ${error.message}`, 'error')
    }
  }

  const testBuyNow = async () => {
    log('Testing buy now...')
    try {
      const success = await addToCart(testProduct)
      if (success) {
        log('Added to cart, navigating to checkout...', 'success')
        router.push('/checkout')
      } else {
        log('Failed to add to cart', 'error')
      }
    } catch (error) {
      log(`Buy now error: ${error.message}`, 'error')
    }
  }

  const testRemoveFromCart = async () => {
    log('Testing remove from cart...')
    if (cartData?.items?.length > 0) {
      const itemId = cartData.items[0].id || cartData.items[0]._id
      try {
        const success = await removeFromCart(itemId)
        log(`Remove from cart result: ${success ? 'Success' : 'Failed'}`, success ? 'success' : 'error')
        if (success) {
          toast.success('Removed from cart')
        }
      } catch (error) {
        log(`Remove from cart error: ${error.message}`, 'error')
      }
    } else {
      log('No items in cart to remove', 'warning')
    }
  }

  const testClearCart = async () => {
    log('Testing clear cart...')
    try {
      const success = await clearCart()
      log(`Clear cart result: ${success ? 'Success' : 'Failed'}`, success ? 'success' : 'error')
      if (success) {
        toast.success('Cart cleared')
      }
    } catch (error) {
      log(`Clear cart error: ${error.message}`, 'error')
    }
  }

  const testLogout = async () => {
    log('Testing logout...')
    await logout()
  }

  const clearLogs = () => {
    setLogs([])
    console.clear()
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth & Cart Test Suite</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Status Panel */}
          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Current Status</h2>
              <div className="space-y-2 text-sm">
                <div>Auth: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                  {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                </span></div>
                <div>User: {user ? (user.email || user.name || 'Logged in') : 'Guest'}</div>
                <div>Cart items: {cartData?.items?.length || 0}</div>
                <div>Cart total: ${cartData?.total || 0}</div>
              </div>
            </div>

            {/* Test Actions */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={testAddToCart}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
                >
                  Test Add to Cart
                </button>
                
                <button
                  onClick={testBuyNow}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
                >
                  Test Buy Now
                </button>
                
                <button
                  onClick={testRemoveFromCart}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm font-medium"
                >
                  Test Remove from Cart
                </button>
                
                <button
                  onClick={testClearCart}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
                >
                  Test Clear Cart
                </button>
                
                {isAuthenticated && (
                  <button
                    onClick={testLogout}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm font-medium"
                  >
                    Test Logout
                  </button>
                )}
                
                <button
                  onClick={clearLogs}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded text-sm font-medium"
                >
                  Clear Logs
                </button>
              </div>
            </div>
          </div>

          {/* Cart Contents */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Cart Contents</h2>
            {cartData?.items?.length > 0 ? (
              <div className="space-y-3">
                {cartData.items.map((item, index) => (
                  <div key={item.id} className="bg-gray-800 p-3 rounded text-sm">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-gray-400">
                      ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-3">
                  <div className="font-semibold">Total: ${cartData.total}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Cart is empty</p>
            )}
          </div>

          {/* Event Log */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Event Log</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${
                      log.type === 'error' ? 'bg-red-900/20 text-red-400' :
                      log.type === 'success' ? 'bg-green-900/20 text-green-400' :
                      log.type === 'warning' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-gray-800 text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">{log.timestamp}</span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No events logged</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>This page tests the authentication and cart system to ensure:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Guest users can add items to cart without authentication</li>
            <li>No unwanted redirects occur during cart operations</li>
            <li>No duplicate toast notifications appear</li>
            <li>Buy now works correctly for both authenticated and guest users</li>
            <li>Cart state persists correctly across page refreshes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
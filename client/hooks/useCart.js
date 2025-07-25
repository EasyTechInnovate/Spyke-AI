'use client'

import { useState, useEffect, useCallback } from 'react'

const CART_STORAGE_KEY = 'spyke_cart'

export function useCart() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Load cart from localStorage on mount and listen for storage events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadCart()
      
      // Listen for storage events (from other tabs/windows)
      const handleStorageChange = (e) => {
        if (e.key === CART_STORAGE_KEY || !e.key) {
          loadCart()
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      saveCart(cartItems)
    }
  }, [cartItems, loading])

  const loadCart = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY)
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading cart:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const saveCart = (items) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
        // Update lastUpdate to trigger re-renders in components watching cart
        setLastUpdate(Date.now())
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving cart:', error)
      }
    }
  }

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id)
      
      if (existingItem) {
        // If item exists, increase quantity
        return prevItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Add new item
        const newItem = {
          id: Date.now(), // Generate unique ID
          productId: product.id,
          title: product.title,
          description: product.description || product.shortDescription,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity: 1,
          category: product.category,
          seller: product.seller,
          image: product.image || product.thumbnail || '/api/placeholder/150/100'
        }
        return [...prevItems, newItem]
      }
    })
    return true
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.productId === productId)
  }, [cartItems])

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
    cartCount: getCartCount(),
    cartTotal: getCartTotal(),
    lastUpdate
  }
}
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cartAPI } from '@/lib/api'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

const CART_STORAGE_KEY = 'spyke_cart'
const GUEST_CART_KEY = 'spyke_guest_cart'

export function useCart() {
  const [cartData, setCartData] = useState(() => {
    // Initialize with data from sessionStorage for better persistence
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(CART_STORAGE_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          return parsed
        } catch (e) {
        }
      }
    }
    return { items: [], total: 0, promocode: null }
  })
  // Start with false loading if we have cached data
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(CART_STORAGE_KEY)
      return !cached
    }
    return true
  })
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const { user, isAuthenticated } = useAuth()
  const isSyncing = useRef(false)

  // Load cart on mount and when auth status changes
  useEffect(() => {
    loadCart()
  }, [isAuthenticated])

  // Sync guest cart to backend when user logs in
  useEffect(() => {
    if (isAuthenticated && !isSyncing.current) {
      syncGuestCartToBackend()
    }
  }, [isAuthenticated])

  // Load cart based on auth status
  const loadCart = async () => {
    setLoading(true)
    try {
      if (isAuthenticated) {
        // Load from backend
        const cart = await cartAPI.getCart()
        
        // Transform backend cart items to match frontend structure
        const transformedItems = cart.items?.map(item => ({
          id: item.productId?._id || item.productId?.id,
          _id: item.productId?._id,
          productId: item.productId?._id || item.productId?.id,
          title: item.productId?.title || 'Unknown Product',
          description: item.productId?.shortDescription || '',
          price: item.productId?.price || 0,
          originalPrice: item.productId?.originalPrice || item.productId?.price || 0,
          quantity: item.quantity || 1,
          category: item.productId?.category || '',
          seller: item.productId?.sellerId || item.productId?.seller || { name: 'Unknown Seller' },
          image: item.productId?.thumbnail || '',
          addedAt: item.addedAt
        })) || []
        
        const newCartData = {
          ...cart,
          items: transformedItems
        }
        
        console.log('Cart from API:', cart)
        console.log('New cart data with promo:', newCartData)
        
        setCartData(newCartData)
        
        // Cache in sessionStorage for persistence
        sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCartData))
        
        // Clear guest cart after successful backend load
        localStorage.removeItem(GUEST_CART_KEY)
      } else {
        // Load from localStorage for guests
        const savedCart = localStorage.getItem(GUEST_CART_KEY)
        if (savedCart) {
          const guestCart = JSON.parse(savedCart)
          setCartData(guestCart)
          // Cache in sessionStorage
          sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(guestCart))
        } else {
          const emptyCart = { items: [], total: 0, promocode: null }
          setCartData(emptyCart)
          sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(emptyCart))
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      // Fallback to empty cart on error
      setCartData({ items: [], total: 0, promocode: null })
    } finally {
      setLoading(false)
      setLastUpdate(Date.now())
    }
  }

  // Save guest cart to localStorage
  const saveGuestCart = (cart) => {
    if (!isAuthenticated) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
    }
  }

  // Sync guest cart to backend when user logs in
  const syncGuestCartToBackend = async () => {
    isSyncing.current = true
    try {
      const guestCart = localStorage.getItem(GUEST_CART_KEY)
      if (guestCart) {
        const { items } = JSON.parse(guestCart)
        
        // Add each item to backend cart
        for (const item of items) {
          try {
            await cartAPI.addToCart(item.productId || item.id, item.quantity)
          } catch (error) {
            console.error('Error syncing item to cart:', error)
          }
        }
        
        // Clear guest cart after sync
        localStorage.removeItem(GUEST_CART_KEY)
        
        // Reload cart from backend
        await loadCart()
        
        toast.success('Your cart has been synced')
      }
    } catch (error) {
      console.error('Error syncing guest cart:', error)
    } finally {
      isSyncing.current = false
    }
  }

  // Add to cart
  const addToCart = useCallback(async (product) => {
    console.log('=== useCart.addToCart ===')
    console.log('Is authenticated:', isAuthenticated)
    console.log('Product:', product?.id || product?._id)
    
    try {
      if (isAuthenticated) {
        console.log('Using backend cart for authenticated user')
        // Add to backend cart
        await cartAPI.addToCart(product.id || product._id, 1)
        await loadCart()
        toast.success('Added to cart')
      } else {
        console.log('Using local cart for guest user')
        // Add to guest cart
        const newCart = { ...cartData }
        const existingItem = newCart.items.find(item => 
          (item.productId || item.id) === (product.id || product._id)
        )
        
        if (existingItem) {
          existingItem.quantity += 1
        } else {
          newCart.items.push({
            id: product.id || product._id,
            productId: product.id || product._id,
            title: product.title,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            quantity: 1,
            category: product.category,
            seller: product.seller,
            image: product.images?.[0]?.url || product.image
          })
        }
        
        // Update totals
        newCart.total = newCart.items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        )
        
        setCartData(newCart)
        saveGuestCart(newCart)
        toast.success('Added to cart')
      }
      
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(error.message || 'Failed to add to cart')
    }
  }, [isAuthenticated, cartData])

  // Update quantity
  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return

    try {
      if (isAuthenticated) {
        // Backend doesn't support quantity updates - each product can only be added once
        toast.error('Quantity updates are not supported. Each product can only be purchased once.')
        return
      } else {
        // Update guest cart
        const newCart = { ...cartData }
        const item = newCart.items.find(item => 
          (item.productId || item.id) === itemId
        )
        
        if (item) {
          item.quantity = quantity
          newCart.total = newCart.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
          )
          
          setCartData(newCart)
          saveGuestCart(newCart)
        }
      }
      
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }, [isAuthenticated, cartData])

  // Remove from cart
  const removeFromCart = useCallback(async (itemId) => {
    try {
      if (isAuthenticated) {
        // Remove from backend
        await cartAPI.removeFromCart(itemId)
        await loadCart()
        toast.success('Removed from cart')
      } else {
        // Remove from guest cart
        const newCart = { ...cartData }
        newCart.items = newCart.items.filter(item => 
          (item.productId || item.id) !== itemId
        )
        newCart.total = newCart.items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        )
        
        setCartData(newCart)
        saveGuestCart(newCart)
        toast.success('Removed from cart')
      }
      
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('Failed to remove from cart')
    }
  }, [isAuthenticated, cartData])

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      if (isAuthenticated) {
        // Clear backend cart
        await cartAPI.clearCart()
        await loadCart()
      } else {
        // Clear guest cart
        const emptyCart = { items: [], total: 0, promocode: null }
        setCartData(emptyCart)
        localStorage.removeItem(GUEST_CART_KEY)
      }
      
      toast.success('Cart cleared')
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
    }
  }, [isAuthenticated])

  // Apply promocode
  const applyPromocode = useCallback(async (code) => {
    try {
      if (isAuthenticated) {
        // Apply on backend
        const result = await cartAPI.applyPromocode(code)
        await loadCart()
        toast.success('Promocode applied successfully')
        return result
      } else {
        // For guests, validate and apply to local cart
        const response = await cartAPI.validatePromocode(code)
        console.log('Promocode validation response:', response)
        
        // Handle different response structures
        const validation = response.data || response
        const isValid = validation.valid || validation.isValid || response.success
        
        if (isValid) {
          // Extract promocode data from various possible structures
          const promocodeData = validation.promocode || validation.promo || validation.data || validation
          
          // Try to get discount value from different possible fields
          let discountValue = promocodeData.discountValue || 
                             promocodeData.discount || 
                             promocodeData.value || 
                             promocodeData.amount || 
                             0
          
          // Try to get discount type from different possible fields
          let discountType = promocodeData.discountType || 
                            promocodeData.type || 
                            (promocodeData.isPercentage ? 'percentage' : 'fixed') ||
                            'percentage'
          
          // Add promocode to guest cart
          const newCart = {
            ...cartData,
            promocode: {
              code: promocodeData.code || code.toUpperCase(),
              discountType: discountType,
              discountValue: Number(discountValue) || 10, // Default to 10 if no value
              description: promocodeData.description || promocodeData.name || `${discountValue}${discountType === 'percentage' ? '%' : '$'} off`
            }
          }
          console.log('New cart with promocode:', newCart)
          setCartData(newCart)
          sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart))
          toast.success('Promocode applied successfully!')
          return validation
        } else {
          throw new Error(validation.message || response.message || 'Invalid promocode')
        }
      }
    } catch (error) {
      console.error('Error applying promocode:', error)
      toast.error(error.message || 'Failed to apply promocode')
      throw error
    }
  }, [isAuthenticated])

  // Remove promocode
  const removePromocode = useCallback(async () => {
    try {
      if (isAuthenticated) {
        // Remove from backend
        await cartAPI.removePromocode()
        await loadCart()
        toast.success('Promocode removed')
      } else {
        // Remove from guest cart
        const newCart = { ...cartData, promocode: null }
        setCartData(newCart)
        sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart))
        toast.success('Promocode removed')
      }
    } catch (error) {
      console.error('Error removing promocode:', error)
      toast.error('Failed to remove promocode')
    }
  }, [isAuthenticated])

  // Check if item is in cart
  const isInCart = useCallback((productId) => {
    return cartData.items.some(item => 
      (item.productId || item.id) === productId
    )
  }, [cartData.items])

  // Get cart count
  const getCartCount = useCallback(() => {
    return cartData.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartData.items])

  // Get cart total
  const getCartTotal = useCallback(() => {
    const subtotal = cartData.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )
    
    // Apply promocode discount if available
    if (cartData.promocode) {
      const discount = cartData.promocode.discountType === 'percentage'
        ? subtotal * (cartData.promocode.discountValue / 100)
        : cartData.promocode.discountValue
      
      return Math.max(0, subtotal - discount)
    }
    
    return subtotal
  }, [cartData])

  return {
    cartItems: cartData.items,
    cartData,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromocode,
    removePromocode,
    getCartCount,
    getCartTotal,
    isInCart,
    cartCount: getCartCount(),
    cartTotal: getCartTotal(),
    lastUpdate,
    reload: loadCart
  }
}
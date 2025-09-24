'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cartAPI } from '@/lib/api'
import { useAuth } from './useAuth'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
const CART_STORAGE_KEY = 'spyke_cart'
const GUEST_CART_KEY = 'spyke_guest_cart'

export function useCart() {
    // Inline notification state
    const [notification, setNotification] = useState(null)

    // Show inline notification messages  
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000)
    }

    // Clear notification
    const clearNotification = () => setNotification(null)

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
  const { isAuthenticated } = useAuth()
  const isSyncing = useRef(false)

  // Load cart based on auth status
  const loadCart = useCallback(async () => {
    setLoading(true)
    try {
      if (isAuthenticated) {
        const cart = await cartAPI.getCart()

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
          addedAt: item.addedAt,
          productId: item.productId
        })) || []

        const newCartData = {
          ...cart,
          items: transformedItems
        }

        // Handle appliedPromocode from backend
        if (newCartData.appliedPromocode) {
          const ap = { ...newCartData.appliedPromocode }
          
          // If backend only returns discountAmount: 0, it means no promocode is applied
          if (ap.discountAmount === 0 && !ap.code && !ap.discountValue) {
            newCartData.appliedPromocode = null
            newCartData.promocode = null
          } else {
            // Ensure numeric discountAmount exists
            ap.discountAmount = (ap.discountAmount !== undefined && ap.discountAmount !== null) ? Number(ap.discountAmount) : 0

            // If backend did not specify type, infer 'fixed' when discountAmount is present
            if (!ap.discountType) {
              ap.discountType = typeof ap.discountAmount === 'number' ? 'fixed' : undefined
            }

            // Provide discountValue alias used by frontend helpers
            if (ap.discountValue === undefined || ap.discountValue === null) {
              ap.discountValue = ap.discountAmount
            }

            // Preserve code if present, otherwise null (frontend will handle missing code gracefully)
            ap.code = ap.code || null

            newCartData.appliedPromocode = ap
            // Also keep a `promocode` alias for legacy frontend code that reads `cartData.promocode`
            newCartData.promocode = ap
          }
        } else {
          newCartData.appliedPromocode = null
          newCartData.promocode = null
        }

        setCartData(newCartData)

        // Cache in sessionStorage for persistence
        try { sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCartData)) } catch (e) {}

        // Clear guest cart after successful backend load
        try { localStorage.removeItem(GUEST_CART_KEY) } catch (e) {}
      } else {
        // Load from localStorage for guests
        const savedCart = typeof window !== 'undefined' ? localStorage.getItem(GUEST_CART_KEY) : null
        if (savedCart) {
          const guestCart = JSON.parse(savedCart)
          setCartData(guestCart)
          // Cache in sessionStorage
          try { sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(guestCart)) } catch (e) {}
        } else {
          const emptyCart = { items: [], total: 0, promocode: null }
          setCartData(emptyCart)
          try { sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(emptyCart)) } catch (e) {}
        }
      }
    } catch (error) {
      // Error loading cart - fallback to empty
      setCartData({ items: [], total: 0, promocode: null })
    } finally {
      setLoading(false)
      setLastUpdate(Date.now())
    }
  }, [isAuthenticated])

  // Save guest cart to localStorage
  const saveGuestCart = useCallback((cart) => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      try { localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart)) } catch (e) {}
      try { sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)) } catch (e) {}
    }
  }, [isAuthenticated])

  // Sync guest cart to backend when user logs in
  const syncGuestCartToBackend = useCallback(async () => {
    isSyncing.current = true
    try {
      const guestCartStr = typeof window !== 'undefined' ? localStorage.getItem(GUEST_CART_KEY) : null
      if (guestCartStr) {
        let items = []
        try {
          const parsed = JSON.parse(guestCartStr)
          items = parsed.items || []
        } catch (e) {
          items = []
        }

        // Add each item to backend cart
        for (const item of items) {
          try {
            await cartAPI.addToCart(item.productId || item.id, item.quantity)
          } catch (error) {
            // Skip failed items during sync
          }
        }

        // Clear guest cart after sync
        try { localStorage.removeItem(GUEST_CART_KEY) } catch (e) {}
        try { sessionStorage.removeItem(CART_STORAGE_KEY) } catch (e) {}

        // Reload cart from backend
        await loadCart()

        showMessage('Your cart has been synced', 'success')
      }
    } catch (error) {
      // Failed to sync guest cart
    } finally {
      isSyncing.current = false
    }
  }, [loadCart])

  // Load cart on mount and when auth status changes
  useEffect(() => {
    loadCart()
  }, [isAuthenticated, loadCart])

  // Sync guest cart to backend when user logs in
  useEffect(() => {
    if (isAuthenticated && !isSyncing.current) {
      syncGuestCartToBackend()
    }
  }, [isAuthenticated, syncGuestCartToBackend])

  // Add to cart
  const addToCart = useCallback(async (product) => {
    try {
      if (isAuthenticated) {
        // Add to backend cart
        await cartAPI.addToCart(product.id || product._id, 1)
        await loadCart()
        // Don't show message here - let the caller handle it for better UX
        return true
      } else {
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
        // Don't show message here - let the caller handle it for better UX
        return true
      }
    } catch (error) {
      let errorMessage = 'Failed to add to cart'
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      // If server responded with unauthorized, fallback to guest cart
      const status = error?.status || error?.statusCode || error?.response?.status
      if (status === 401) {
        try {
          // Convert this add attempt into a guest-cart add so user doesn't lose intent
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

          newCart.total = newCart.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
          )

          setCartData(newCart)
          saveGuestCart(newCart)
        } catch (e) {
          // ignore
        }

        // Friendly ecommerce flow: do NOT force logout/redirect.
        // Preserve intended return path
        try {
          if (typeof window !== 'undefined') {
            const returnTo = window.location.pathname || '/cart'
            localStorage.setItem('returnTo', returnTo)
          }
        } catch (e) {
          // ignore
        }

        return true // Return true since item was added to guest cart
      }

      // Throw error with proper message for caller to handle
      throw new Error(errorMessage)
    }

    // Update lastUpdate to trigger UI refresh
    setLastUpdate(Date.now())
  }, [isAuthenticated, cartData, loadCart, saveGuestCart])

  // Update quantity
  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return

    try {
      if (isAuthenticated) {
        // Attempt to update quantity on server; backend may not support it.
        try {
          await cartAPI.updateQuantity(itemId, quantity)
          await loadCart()
        } catch (err) {
          // If server update fails, reload to get authoritative state and inform user
          await loadCart()
          showMessage(err?.message || 'Quantity update failed on server', 'error')
        }
      } else {
        // Update guest cart
        const newCart = { ...cartData }
        const item = newCart.items.find(i => 
          (i.productId || i.id) === itemId
        )

        if (item) {
          item.quantity = quantity
          newCart.total = newCart.items.reduce((sum, it) => 
            sum + (it.price * it.quantity), 0
          )

          setCartData(newCart)
          saveGuestCart(newCart)
        }
      }

      setLastUpdate(Date.now())
    } catch (error) {
      showMessage('Failed to update quantity', 'error')
    }
  }, [isAuthenticated, cartData, loadCart, saveGuestCart])

  // Remove from cart
  const removeFromCart = useCallback(async (itemId) => {
    try {
      if (isAuthenticated) {
        // Remove from backend
        await cartAPI.removeFromCart(itemId)
        await loadCart()
        // Don't show toast here - let the caller handle it
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
        // Don't show toast here - let the caller handle it
      }
      
      setLastUpdate(Date.now())
      return true // Indicate success
    } catch (error) {
      // Error removing from cart
      showMessage('Failed to remove from cart', 'error')
      return false // Indicate failure
    }
  }, [isAuthenticated, cartData, loadCart, saveGuestCart])

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
        try { localStorage.removeItem(GUEST_CART_KEY) } catch (e) {}
        try { sessionStorage.removeItem(CART_STORAGE_KEY) } catch (e) {}
      }
      
      // Don't show toast here - let the caller handle it
      setLastUpdate(Date.now())
      return true // Indicate success
    } catch (error) {
      // Error clearing cart
      showMessage('Failed to clear cart', 'error')
      return false // Indicate failure
    }
  }, [isAuthenticated, loadCart])

  // Apply promocode
  const applyPromocode = useCallback(async (code) => {
    try {
      if (isAuthenticated) {
        // Apply on backend
        const result = await cartAPI.applyPromocode(code)
        await loadCart()
        showMessage('Promocode applied successfully', 'success')
        return result
      } else {
        // For guests, validate and apply to local cart
        const response = await cartAPI.validatePromocode(code)
        // Promocode validated
        
        // Handle different response structures
        const validation = response.data || response
        const isValid = validation.valid || validation.isValid || response.success
        
        if (isValid) {
          // Extract promocode data from various possible structures
          const promocodeData = validation.promocode || validation.promo || validation.data || validation
          
          // Normalize promocode data structure
          const normalizedPromo = {
            code: promocodeData.code || code.toUpperCase(),
            discountType: promocodeData.discountType || 'percentage',
            discountValue: Number(promocodeData.discountValue || promocodeData.discountAmount || promocodeData.value || 0),
            discountAmount: Number(promocodeData.discountAmount || 0),
            maxDiscountAmount: promocodeData.maxDiscountAmount || null,
            minimumOrderAmount: promocodeData.minimumOrderAmount || 0,
            description: promocodeData.description || promocodeData.name || '',
            validUntil: promocodeData.validUntil,
            // Maintain backward compatibility
            discountPercentage: promocodeData.discountType === 'percentage' ? promocodeData.discountValue : null,
            value: promocodeData.discountValue || promocodeData.value,
            isPercentage: promocodeData.discountType === 'percentage'
          }
          
          // Add promocode to guest cart
          const newCart = {
            ...cartData,
            promocode: normalizedPromo,
            appliedPromocode: normalizedPromo
          }
          
          // Applied promocode to cart
          setCartData(newCart)
          saveGuestCart(newCart)
          showMessage('Promocode applied successfully!', 'success')
          return validation
        } else {
          throw new Error(validation.message || response.message || 'Invalid promocode')
        }
      }
    } catch (error) {
      // Error applying promocode
      showMessage(error.message || 'Failed to apply promocode', 'error')
      throw error
    }
  }, [isAuthenticated, cartData, loadCart, saveGuestCart])

  // Remove promocode
  const removePromocode = useCallback(async () => {
    try {
      if (isAuthenticated) {
        // Remove from backend
        await cartAPI.removePromocode()
        await loadCart()
        showMessage('Promocode removed', 'success')
      } else {
        // Remove from guest cart
        const newCart = { 
          ...cartData, 
          promocode: null, 
          appliedPromocode: null 
        }
        setCartData(newCart)
        saveGuestCart(newCart)
        showMessage('Promocode removed', 'success')
      }
      setLastUpdate(Date.now())
    } catch (error) {
      // Error removing promocode
      showMessage('Failed to remove promocode', 'error')
    }
  }, [isAuthenticated, cartData, loadCart, saveGuestCart])

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
    // Prefer backend-provided finalAmount when available
    if (typeof cartData?.finalAmount === 'number') {
      return Math.max(0, Number(cartData.finalAmount))
    }

    const subtotal = cartData.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )

    // Support both appliedPromocode (backend) and promocode (guest/local)
    const promo = cartData.appliedPromocode || cartData.promocode
    if (promo) {
      const discountType = promo.discountType || promo.type || (promo.isPercentage ? 'percentage' : undefined)
      const rawValue = promo.discountValue ?? promo.discountAmount ?? promo.value ?? promo.amount ?? promo.discount ?? 0
      const discountValue = Number(rawValue) || 0

      const discount = discountType === 'percentage'
        ? subtotal * (discountValue / 100)
        : Math.min(discountValue, subtotal)

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
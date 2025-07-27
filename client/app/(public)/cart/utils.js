/**
 * Cart Utilities
 * Helper functions for cart calculations and formatting
 */

/**
 * Calculate subtotal from cart items
 * @param {Array} items - Cart items array
 * @returns {number} Subtotal amount
 */
export const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

/**
 * Calculate total savings from original prices
 * @param {Array} items - Cart items array
 * @returns {number} Total savings amount
 */
export const calculateTotalSavings = (items) => {
    return items.reduce((sum, item) => {
        const originalPrice = item.originalPrice || item.price
        return sum + ((originalPrice - item.price) * item.quantity)
    }, 0)
}

/**
 * Calculate discount from promocode
 * @param {Object} cartData - Cart data with promocode info
 * @param {number} subtotal - Cart subtotal
 * @returns {number} Discount amount
 */
export const calculatePromoDiscount = (cartData, subtotal) => {
    // Check for new API structure first
    if (cartData?.appliedPromocode) {
        return cartData.appliedPromocode.discountAmount || 0
    }
    
    // Fallback to old structure
    if (cartData?.promocode) {
        const promo = cartData.promocode
        if (promo.discountType === 'percentage') {
            return subtotal * (promo.discountValue / 100)
        } else {
            return Math.min(promo.discountValue, subtotal)
        }
    }
    
    return 0
}

/**
 * Calculate final total
 * @param {Object} cartData - Cart data
 * @param {number} subtotal - Cart subtotal
 * @param {number} discount - Discount amount
 * @returns {number} Final total
 */
export const calculateTotal = (cartData, subtotal, discount) => {
    return cartData?.finalAmount || (subtotal - discount)
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`
}

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

/**
 * Get item identifier
 * @param {Object} item - Cart item
 * @returns {string} Item ID
 */
export const getItemId = (item) => {
    return item._id || item.id || item.productId
}

/**
 * Format promo code display
 * @param {Object} promocodeData - Promocode data
 * @returns {string} Formatted promo display text
 */
export const formatPromoDisplay = (promocodeData) => {
    if (!promocodeData) return ''
    
    // Check for percentage discount first
    if (promocodeData.discountPercentage !== undefined && promocodeData.discountPercentage !== null) {
        return `${promocodeData.discountPercentage}% OFF`
    }
    
    // Check for fixed amount discount
    if (promocodeData.discountAmount !== undefined && promocodeData.discountAmount !== null) {
        return `$${promocodeData.discountAmount} OFF`
    }
    
    // Fallback to old structure
    const value = promocodeData.discountValue || promocodeData.value
    const isPercentage = promocodeData.discountType === 'percentage'
    
    // If we still don't have a value, return a generic message
    if (value === undefined || value === null) {
        return 'Discount Applied'
    }
    
    return isPercentage ? `${value}% OFF` : `$${value} OFF`
}
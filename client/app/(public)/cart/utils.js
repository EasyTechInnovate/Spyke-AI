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
    if (!Array.isArray(items)) return 0
    
    return items.reduce((sum, item) => {
        // Handle different data structures from API
        const price = item.productId?.price || item.price || 0
        const quantity = item.quantity || 1 // Default to 1 if no quantity field
        
        return sum + (price * quantity)
    }, 0)
}

/**
 * Calculate total savings from original prices
 * @param {Array} items - Cart items array
 * @returns {number} Total savings amount
 */
export const calculateTotalSavings = (items) => {
    if (!Array.isArray(items)) return 0
    
    return items.reduce((sum, item) => {
        // Handle different data structures from API
        const price = item.productId?.price || item.price || 0
        const originalPrice = item.productId?.originalPrice || item.originalPrice || price
        const quantity = item.quantity || 1
        
        const savings = Math.max(0, originalPrice - price)
        return sum + (savings * quantity)
    }, 0)
}

/**
 * Calculate promocode discount amount
 * @param {Object} cartData - Cart data containing promocode
 * @param {number} subtotal - Cart subtotal
 * @returns {number} Discount amount
 */
export const calculatePromoDiscount = (cartData, subtotal) => {
    const promocodeData = cartData?.appliedPromocode || cartData?.promocode
    if (!promocodeData || !subtotal) return 0
    
    // Check if promocode has already calculated discount amount
    if (promocodeData.discountAmount && typeof promocodeData.discountAmount === 'number') {
        return Math.min(promocodeData.discountAmount, subtotal)
    }
    
    // Calculate discount based on type and value
    let discount = 0
    const discountValue = promocodeData.discountValue || promocodeData.value || 0
    const discountType = promocodeData.discountType || 'percentage'
    
    if (discountType === 'percentage') {
        discount = (subtotal * discountValue) / 100
        
        // Apply maximum discount limit if specified
        if (promocodeData.maxDiscountAmount && discount > promocodeData.maxDiscountAmount) {
            discount = promocodeData.maxDiscountAmount
        }
    } else if (discountType === 'fixed') {
        discount = Math.min(discountValue, subtotal)
    }
    
    // Ensure discount doesn't exceed subtotal
    return Math.min(discount, subtotal)
}

/**
 * Calculate final total
 * @param {Object} cartData - Cart data
 * @param {number} subtotal - Cart subtotal
 * @param {number} discount - Discount amount
 * @returns {number} Final total
 */
export const calculateTotal = (cartData, subtotal, discount) => {
    // Prefer authoritative finalAmount from backend when present
    if (typeof cartData?.finalAmount === 'number') {
        return Math.max(0, Number(cartData.finalAmount))
    }

    // Compute fallback total and ensure non-negative, rounded to 2 decimals
    const computed = Math.max(0, subtotal - (Number(discount) || 0))
    return Math.round(computed * 100) / 100
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
    
    // Handle percentage discounts
    if (promocodeData.discountType === 'percentage') {
        const value = promocodeData.discountValue || promocodeData.discountPercentage
        return value ? `${value}% OFF` : 'Discount Applied'
    }
    
    // Handle fixed amount discounts
    if (promocodeData.discountType === 'fixed') {
        const value = promocodeData.discountValue || promocodeData.discountAmount
        return value ? `$${value} OFF` : 'Discount Applied'
    }
    
    // Legacy support - check for percentage discount first
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
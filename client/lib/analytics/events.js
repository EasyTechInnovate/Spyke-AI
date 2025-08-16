// Centralized analytics events definitions

export const ANALYTICS_EVENTS = {
  PAGE: {
    VIEW: 'Page View',
    ERROR: 'Page Load Error',
  },
  AUTH: {
    LOGIN_VIEWED: 'Login Page Viewed',
    LOGIN_CLICKED: 'Login Button Clicked',
    LOGIN_SUCCESS: 'User Logged In',
    LOGIN_FAILED: 'Login Failed',
    
    SIGNUP_VIEWED: 'Signup Page Viewed',
    SIGNUP_CLICKED: 'Signup Button Clicked',
    SIGNUP_SUCCESS: 'User Signed Up',
    SIGNUP_FAILED: 'Signup Failed',
    
    LOGOUT_CLICKED: 'Logout Clicked',
    FORGOT_PASSWORD_CLICKED: 'Forgot Password Clicked',
  },

  NAVIGATION: {
    MENU_CLICKED: 'Menu Item Clicked',
    MOBILE_MENU_TOGGLED: 'Mobile Menu Toggled',
    MOBILE_MENU_ITEM_CLICKED: 'Mobile Menu Item Clicked',
    USER_DROPDOWN_OPENED: 'User Dropdown Opened',
    USER_MENU_ITEM_CLICKED: 'User Menu Item Clicked',
    FOOTER_LINK_CLICKED: 'Footer Link Clicked',
  },

  SEARCH: {
    OPENED: 'Search Overlay Opened',
    QUERY_ENTERED: 'Search Query Entered',
    RESULT_CLICKED: 'Search Result Clicked',
    CLEARED: 'Search Cleared',
  },

  SELLER: {
    DASHBOARD_VIEWED: 'Seller Dashboard Viewed',
    BECOME_SELLER_VIEWED: 'Become Seller Page Viewed',
    BECOME_SELLER_CLICKED: 'Become Seller Clicked',
    ONBOARDING_STARTED: 'Seller Onboarding Started',
    ONBOARDING_STEP_COMPLETED: 'Seller Onboarding Step Completed',
    ONBOARDING_COMPLETED: 'Seller Onboarding Completed',
    PROFILE_SUBMITTED: 'Seller Profile Submitted',
    PRODUCT_CREATE_CLICKED: 'Product Create Clicked',
    PRODUCT_EDIT_CLICKED: 'Product Edit Clicked',
    PRODUCT_VIEW_CLICKED: 'Product View Clicked',
  },

  COMMISSION: {
    NEGOTIATION_VIEWED: 'Commission Negotiation Viewed',
    NEGOTIATION_INITIATED: 'Commission Negotiation Initiated',
    OFFER_SUBMITTED: 'Commission Offer Submitted',
    COUNTER_OFFER_SUBMITTED: 'Commission Counter Offer Submitted',
    NEGOTIATION_ACCEPTED: 'Commission Negotiation Accepted',
    NEGOTIATION_REJECTED: 'Commission Negotiation Rejected',
    NEGOTIATION_EXPIRED: 'Commission Negotiation Expired',
    NEGOTIATION_CANCELLED: 'Commission Negotiation Cancelled',
    RATE_HISTORY_VIEWED: 'Commission Rate History Viewed',
    QUICK_ACCEPT_USED: 'Commission Quick Accept Used',
    AUTO_ACCEPT_SET: 'Commission Auto Accept Set',
  },

  CHECKOUT:{
    VIEWED: 'VIEWED'
  },

  CART: {
    VIEWED: 'Cart Viewed',
    ITEM_ADDED: 'Item Added to Cart',
    ITEM_REMOVED: 'Item Removed from Cart',
    QUANTITY_UPDATED: 'Cart Quantity Updated',
    CHECKOUT_CLICKED: 'Checkout Clicked',
  },

  EXPLORE: {
    VIEWED: 'Explore Page Viewed',
    FILTER_APPLIED: 'Filter Applied',
    SORT_CHANGED: 'Sort Changed',
    SEARCH_PERFORMED: 'Explore Search Performed',
    PRODUCT_CLICKED: 'Product Clicked from Explore',
    VIEW_MODE_CHANGED: 'View Mode Changed',
  },

  ADMIN: {
    DASHBOARD_VIEWED: 'Admin Dashboard Viewed',
    ANALYTICS_VIEWED: 'Analytics Dashboard Viewed',
    ANALYTICS_EXPORTED: 'Analytics Data Exported',
    ANALYTICS_CLEARED: 'Analytics Data Cleared',
  },

  ERROR: {
    PAGE_NOT_FOUND: '404 Page Viewed',
    UNAUTHORIZED: 'Unauthorized Access',
    GENERAL_ERROR: 'Application Error',
  },

  BUTTON: {
    CTA_CLICKED: 'CTA Button Clicked',
    LINK_CLICKED: 'Link Clicked',
  }
}

export function getEventName(category, action, context = {}) {
  const baseEvent = ANALYTICS_EVENTS[category]?.[action]
  if (!baseEvent) {
    // Unknown event: ${category}.${action}
    return `${category} ${action}`
  }
  return baseEvent
}

export const eventProperties = {
  page: (pageName, additionalData = {}) => ({
    pageName,
    ...additionalData,
    timestamp: new Date().toISOString()
  }),

  auth: (email, success = true) => ({
    email: email?.replace(/^(.{3}).*@/, '$1***@'), // Partially mask email
    success,
    timestamp: new Date().toISOString()
  }),

  navigation: (item, section) => ({
    item,
    section,
    timestamp: new Date().toISOString()
  }),

  search: (query, resultCount) => ({
    query: query?.substring(0, 50), // Limit query length
    resultCount,
    timestamp: new Date().toISOString()
  }),

  seller: (step, data = {}) => ({
    step,
    ...data,
    timestamp: new Date().toISOString()
  }),

  cart: (productId, quantity, price) => ({
    productId,
    quantity,
    price,
    timestamp: new Date().toISOString()
  }),

  explore: (filters = {}, sortBy = 'featured') => ({
    filters,
    sortBy,
    timestamp: new Date().toISOString()
  }),

  error: (errorType, message) => ({
    errorType,
    message: message?.substring(0, 200), // Limit error message length
    timestamp: new Date().toISOString()
  })
}
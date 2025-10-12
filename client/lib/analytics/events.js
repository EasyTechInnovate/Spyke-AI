import analytics from './amplitude';

/**
 * Comprehensive Event Tracking System for Spyke AI Marketplace
 * Based on your tracking plan requirements
 */

// ============= AUTHENTICATION EVENTS =============
export const trackAuthEvents = {
  // User Registration Flow
  signupStarted: (method = 'email', source = 'homepage') => {
    analytics.track('signup_started', {
      method,
      source,
      page: window.location.pathname
    });
  },

  signupCompleted: (userId, userType = 'buyer') => {
    analytics.track('signup_completed', {
      user_type: userType,
      success: true
    });
    
    // Set user properties
    analytics.setUser(userId, {
      user_type: userType,
      signup_date: new Date().toISOString(),
      country: 'AE' // You can detect this
    });
  },

  signupFailed: (error, method = 'email') => {
    analytics.track('signup_failed', {
      method,
      error_type: error,
      page: window.location.pathname
    });
  },

  // Login Flow
  loginStarted: (method = 'email') => {
    analytics.track('login_started', {
      method,
      page: window.location.pathname
    });
  },

  loginCompleted: (userId, userType) => {
    analytics.track('login_completed', {
      user_type: userType,
      success: true
    });

    analytics.setUser(userId, {
      user_type: userType,
      last_login: new Date().toISOString()
    });
  },

  loginFailed: (error, method = 'email') => {
    analytics.track('login_failed', {
      method,
      error_type: error
    });
  },

  logout: () => {
    analytics.track('logout_completed');
    analytics.reset();
  }
};

// ============= PRODUCT EVENTS =============
export const trackProductEvents = {
  // Product Discovery
  productViewed: (productId, productName, category, sellerId, price) => {
    analytics.track('product_viewed', {
      product_id: productId,
      product_name: productName,
      category,
      seller_id: sellerId,
      price,
      currency: 'USD',
      page: window.location.pathname
    });
  },

  productSearched: (query, resultsCount = 0, filters = {}) => {
    analytics.track('product_searched', {
      search_query: query,
      results_count: resultsCount,
      filters: JSON.stringify(filters),
      page: window.location.pathname
    });
  },

  categoryViewed: (category, productsCount = 0) => {
    analytics.track('category_viewed', {
      category,
      products_count: productsCount
    });
  },

  // Product Interactions
  productFavorited: (productId, productName, sellerId) => {
    analytics.track('product_favorited', {
      product_id: productId,
      product_name: productName,
      seller_id: sellerId,
      action: 'add'
    });
  },

  productUnfavorited: (productId, productName, sellerId) => {
    analytics.track('product_unfavorited', {
      product_id: productId,
      product_name: productName,
      seller_id: sellerId,
      action: 'remove'
    });
  },

  productUpvoted: (productId, productName, sellerId) => {
    analytics.track('product_upvoted', {
      product_id: productId,
      product_name: productName,
      seller_id: sellerId
    });
  }
};

// ============= CART & PURCHASE EVENTS =============
export const trackPurchaseEvents = {
  // Cart Management
  productAddedToCart: (productId, productName, price, sellerId, quantity = 1) => {
    analytics.track('product_added_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
      seller_id: sellerId,
      quantity,
      currency: 'USD'
    });
  },

  productRemovedFromCart: (productId, productName, price, sellerId) => {
    analytics.track('product_removed_from_cart', {
      product_id: productId,
      product_name: productName,
      price,
      seller_id: sellerId,
      currency: 'USD'
    });
  },

  cartViewed: (itemsCount, totalValue, uniqueSellers) => {
    analytics.track('cart_viewed', {
      items_count: itemsCount,
      total_value: totalValue,
      unique_sellers: uniqueSellers,
      currency: 'USD'
    });
  },

  // Checkout Process
  checkoutStarted: (itemsCount, totalValue, paymentMethod = 'stripe') => {
    analytics.track('checkout_started', {
      items_count: itemsCount,
      total_value: totalValue,
      payment_method: paymentMethod,
      currency: 'USD'
    });
  },

  promocodeApplied: (code, discountAmount, discountType, sellerId = null) => {
    analytics.track('promocode_applied', {
      promocode: code,
      discount_amount: discountAmount,
      discount_type: discountType,
      seller_id: sellerId,
      currency: 'USD'
    });
  },

  purchaseCompleted: (orderId, totalValue, itemsCount, paymentMethod, items = []) => {
    analytics.track('purchase_completed', {
      order_id: orderId,
      total_value: totalValue,
      items_count: itemsCount,
      payment_method: paymentMethod,
      currency: 'USD',
      products: items.map(item => ({
        product_id: item.product_id,
        price: item.price,
        seller_id: item.seller_id
      }))
    });

    // Update user properties
    analytics.updateUserProperties({
      total_purchases: '$add:1',
      total_spent: `$add:${totalValue}`,
      last_purchase: new Date().toISOString()
    });
  },

  purchaseFailed: (error, totalValue, paymentMethod) => {
    analytics.track('purchase_failed', {
      error_type: error,
      total_value: totalValue,
      payment_method: paymentMethod,
      currency: 'USD'
    });
  }
};

// ============= SELLER EVENTS =============
export const trackSellerEvents = {
  // Seller Profile
  sellerProfileViewed: (sellerId, sellerName, productsCount) => {
    analytics.track('seller_profile_viewed', {
      seller_id: sellerId,
      seller_name: sellerName,
      products_count: productsCount
    });
  },

  becomeSellerStarted: (source = 'header') => {
    analytics.track('become_seller_started', {
      source,
      page: window.location.pathname
    });
  },

  sellerOnboardingCompleted: (sellerId) => {
    analytics.track('seller_onboarding_completed', {
      seller_id: sellerId
    });

    analytics.updateUserProperties({
      user_type: 'seller',
      seller_status: 'active',
      seller_join_date: new Date().toISOString()
    });
  },

  // Product Management
  productCreated: (productId, productName, category, price) => {
    analytics.track('product_created', {
      product_id: productId,
      product_name: productName,
      category,
      price,
      currency: 'USD'
    });
  },

  productPublished: (productId, productName, category) => {
    analytics.track('product_published', {
      product_id: productId,
      product_name: productName,
      category,
      status: 'live'
    });
  },

  // Payout Events
  payoutRequested: (amount, paymentMethod, sellerId) => {
    analytics.track('payout_requested', {
      amount,
      payment_method: paymentMethod,
      seller_id: sellerId,
      currency: 'USD'
    });
  },

  payoutCompleted: (amount, paymentMethod, sellerId) => {
    analytics.track('payout_completed', {
      amount,
      payment_method: paymentMethod,
      seller_id: sellerId,
      currency: 'USD'
    });
  }
};

// ============= USER ENGAGEMENT EVENTS =============
export const trackEngagementEvents = {
  // Page Views
  pageViewed: (pageName, category = 'general') => {
    analytics.trackPageView(pageName, {
      category,
      url: window.location.href,
      referrer: document.referrer
    });
  },

  // Content Interaction
  reviewSubmitted: (productId, rating, sellerId) => {
    analytics.track('review_submitted', {
      product_id: productId,
      rating,
      seller_id: sellerId
    });
  },

  searchPerformed: (query, category = 'all', resultsCount = 0) => {
    analytics.track('search_performed', {
      search_query: query,
      category,
      results_count: resultsCount
    });
  },

  filterApplied: (filterType, filterValue, resultsCount = 0) => {
    analytics.track('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      results_count: resultsCount
    });
  },

  // Navigation
  headerLinkClicked: (linkName, destination) => {
    analytics.track('header_link_clicked', {
      link_name: linkName,
      destination,
      source: 'header'
    });
  },

  footerLinkClicked: (linkName, destination) => {
    analytics.track('footer_link_clicked', {
      link_name: linkName,
      destination,
      source: 'footer'
    });
  },

  // Feature Usage
  featureUsed: (featureName, context = {}) => {
    analytics.track('feature_used', {
      feature_name: featureName,
      ...context
    });
  }
};

// ============= SYSTEM EVENTS =============
export const trackSystemEvents = {
  // Performance
  pageLoadTime: (pageName, loadTime) => {
    analytics.track('page_load_time', {
      page_name: pageName,
      load_time: loadTime,
      performance_category: loadTime > 3000 ? 'slow' : loadTime > 1000 ? 'medium' : 'fast'
    });
  },

  // Errors
  errorOccurred: (errorType, errorMessage, context = {}) => {
    analytics.track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      page: window.location.pathname,
      ...context
    });
  },

  // API Calls
  apiCallMade: (endpoint, method, responseTime, statusCode) => {
    analytics.track('api_call_made', {
      endpoint,
      method,
      response_time: responseTime,
      status_code: statusCode,
      success: statusCode >= 200 && statusCode < 300
    });
  }
};

// ============= UTILITY FUNCTIONS =============
export const initializeAnalytics = () => {
  analytics.init();
};

export const identifyUser = (userId, userProperties) => {
  analytics.setUser(userId, userProperties);
};

export const trackCustomEvent = (eventName, properties) => {
  analytics.track(eventName, properties);
};

// Export the main analytics instance for advanced usage
export { analytics };

// Default export with all tracking functions
export default {
  auth: trackAuthEvents,
  product: trackProductEvents,
  purchase: trackPurchaseEvents,
  seller: trackSellerEvents,
  engagement: trackEngagementEvents,
  system: trackSystemEvents,
  init: initializeAnalytics,
  identify: identifyUser,
  custom: trackCustomEvent
};
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import tracking from '../lib/analytics/events';

/**
 * Custom hook for analytics tracking
 * Provides easy access to all tracking functions and automatic page view tracking
 */
export const useAnalytics = () => {
  const router = useRouter();

  // Initialize analytics on mount
  useEffect(() => {
    tracking.init();
  }, []);

  // Track page views automatically
  useEffect(() => {
    const handleRouteChange = (url) => {
      const pageName = url.split('?')[0]; // Remove query parameters
      tracking.engagement.pageViewed(pageName);
    };

    // Track initial page view
    handleRouteChange(window.location.pathname);

    // Listen for route changes (if using app router)
    // For pages router, you'd use router.events.on('routeChangeComplete', handleRouteChange)
    const handlePopState = () => {
      handleRouteChange(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Memoized tracking functions
  const track = useCallback({
    // Authentication
    signupStarted: (method, source) => tracking.auth.signupStarted(method, source),
    signupCompleted: (userId, userType) => tracking.auth.signupCompleted(userId, userType),
    signupFailed: (error, method) => tracking.auth.signupFailed(error, method),
    loginStarted: (method) => tracking.auth.loginStarted(method),
    loginCompleted: (userId, userType) => tracking.auth.loginCompleted(userId, userType),
    loginFailed: (error, method) => tracking.auth.loginFailed(error, method),
    logout: () => tracking.auth.logout(),

    // Products
    productViewed: (productId, productName, category, sellerId, price) => 
      tracking.product.productViewed(productId, productName, category, sellerId, price),
    productSearched: (query, resultsCount, filters) => 
      tracking.product.productSearched(query, resultsCount, filters),
    categoryViewed: (category, productsCount) => 
      tracking.product.categoryViewed(category, productsCount),
    productFavorited: (productId, productName, sellerId) => 
      tracking.product.productFavorited(productId, productName, sellerId),
    productUnfavorited: (productId, productName, sellerId) => 
      tracking.product.productUnfavorited(productId, productName, sellerId),
    productUpvoted: (productId, productName, sellerId) => 
      tracking.product.productUpvoted(productId, productName, sellerId),

    // Cart & Purchase
    addToCart: (productId, productName, price, sellerId, quantity) => 
      tracking.purchase.productAddedToCart(productId, productName, price, sellerId, quantity),
    removeFromCart: (productId, productName, price, sellerId) => 
      tracking.purchase.productRemovedFromCart(productId, productName, price, sellerId),
    cartViewed: (itemsCount, totalValue, uniqueSellers) => 
      tracking.purchase.cartViewed(itemsCount, totalValue, uniqueSellers),
    checkoutStarted: (itemsCount, totalValue, paymentMethod) => 
      tracking.purchase.checkoutStarted(itemsCount, totalValue, paymentMethod),
    promocodeApplied: (code, discountAmount, discountType, sellerId) => 
      tracking.purchase.promocodeApplied(code, discountAmount, discountType, sellerId),
    purchaseCompleted: (orderId, totalValue, itemsCount, paymentMethod, items) => 
      tracking.purchase.purchaseCompleted(orderId, totalValue, itemsCount, paymentMethod, items),
    purchaseFailed: (error, totalValue, paymentMethod) => 
      tracking.purchase.purchaseFailed(error, totalValue, paymentMethod),

    // Seller
    sellerProfileViewed: (sellerId, sellerName, productsCount) => 
      tracking.seller.sellerProfileViewed(sellerId, sellerName, productsCount),
    becomeSellerStarted: (source) => tracking.seller.becomeSellerStarted(source),
    sellerOnboardingCompleted: (sellerId) => tracking.seller.sellerOnboardingCompleted(sellerId),
    productCreated: (productId, productName, category, price) => 
      tracking.seller.productCreated(productId, productName, category, price),
    productPublished: (productId, productName, category) => 
      tracking.seller.productPublished(productId, productName, category),
    payoutRequested: (amount, paymentMethod, sellerId) => 
      tracking.seller.payoutRequested(amount, paymentMethod, sellerId),
    payoutCompleted: (amount, paymentMethod, sellerId) => 
      tracking.seller.payoutCompleted(amount, paymentMethod, sellerId),

    // Engagement
    reviewSubmitted: (productId, rating, sellerId) => 
      tracking.engagement.reviewSubmitted(productId, rating, sellerId),
    searchPerformed: (query, category, resultsCount) => 
      tracking.engagement.searchPerformed(query, category, resultsCount),
    filterApplied: (filterType, filterValue, resultsCount) => 
      tracking.engagement.filterApplied(filterType, filterValue, resultsCount),
    headerLinkClicked: (linkName, destination) => 
      tracking.engagement.headerLinkClicked(linkName, destination),
    footerLinkClicked: (linkName, destination) => 
      tracking.engagement.footerLinkClicked(linkName, destination),
    featureUsed: (featureName, context) => 
      tracking.engagement.featureUsed(featureName, context),

    // System
    pageLoadTime: (pageName, loadTime) => 
      tracking.system.pageLoadTime(pageName, loadTime),
    errorOccurred: (errorType, errorMessage, context) => 
      tracking.system.errorOccurred(errorType, errorMessage, context),
    apiCallMade: (endpoint, method, responseTime, statusCode) => 
      tracking.system.apiCallMade(endpoint, method, responseTime, statusCode),

    // Custom events
    custom: (eventName, properties) => tracking.custom(eventName, properties)
  }, []);

  // User identification
  const identify = useCallback((userId, userProperties) => {
    tracking.identify(userId, userProperties);
  }, []);

  return {
    track,
    identify,
    // Direct access to tracking categories
    auth: tracking.auth,
    product: tracking.product,
    purchase: tracking.purchase,
    seller: tracking.seller,
    engagement: tracking.engagement,
    system: tracking.system
  };
};

export default useAnalytics;